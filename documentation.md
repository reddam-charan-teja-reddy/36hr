# Job Search App with Chatbot — Full Documentation

This document describes the architecture, backend API routes, frontend components, data models, and how both parts work together. It also includes environment, setup, and contribution guidelines.

## Overview

- **Frontend**: Vite + React (TypeScript). Provides onboarding, chat, job browsing, and profile management UI. Lives under `frontend/`.
- **Backend**: FastAPI with Google Gemini for AI and JSearch API for job listings; MongoDB for persistence. Lives under `backend/`.
- **Key Flows**:
  - Resume onboarding → extracts user profile via Gemini and stores it.
  - Chat → AI assistant helps find jobs, refine searches, and provide guidance. Function calling integrates job search/details.
  - Jobs → Save/Unsave, Apply tracking, and retrieval.

## Backend

Location: `backend/`

### Environment

Create `backend/.env` with:

- `GEMINI_API_KEY=<your_key>`
- `MONGODB_URI=<connection_string>` (set by `db.py` expectations)
- Optional keys for JSearch if used by `jsearch_client.py` (e.g., `JSEARCH_API_KEY`)

### Dependencies

See `backend/requirements.txt`. Core libs:

- FastAPI, Uvicorn
- PyPDF2
- pydantic
- google-generativeai
- motor / pymongo (via `db.py`)

### Data Models (pydantic)

Defined in `backend/models.py`:

- `UserOnboardingResponse`: structured profile data (name, email, skills, experience, etc.)
- `ChatMessage`, `Chat`, `ChatHistoryResponseItem`, `ChatHistoryResponse`, `CreateChatRequest/Response`
- `ChatMessageRequest/Response`, `GetChatMessagesRequest/Response`
- Job models: `GetAppliedJobsResponseItem`, `GetSavedJobsResponseItem`, etc.

### API Routes

Implemented in `backend/main.py`.

- `POST /api/onboardFileUpload`

  - Input: raw PDF file body.
  - Process: parses resume text → prompts Gemini with a JSON schema → returns validated `UserOnboardingResponse`.
  - Errors: 400 for non-PDF; 500 on processing issues.

- `POST /api/confirmOnboardingDetails`

  - Input: `UserOnboardingResponse` (confirmed by user).
  - Process: upserts user doc in `users` collection; initializes `chat_history`, `saved_jobs`, `applied_jobs`.
  - Output: `{ message, id | email }`.

- `GET /api/chatHistoryRequest?email=<email>`

  - Output: `ChatHistoryResponse` containing `{ id, chat_name, chat_id }` per chat.

- `GET /api/getAppliedJobs?email=<email>`

  - Output: `GetAppliedJobsResponse` (list of applied jobs).

- `GET /api/getSavedJobs?email=<email>`

  - Output: `GetSavedJobsResponse` (list of saved jobs).

- `POST /api/saveJob`

  - Input: `SaveJobRequest { email, job_id, job_title, company_name, job_link }`.
  - Process: `$addToSet` to `saved_jobs`.

- `POST /api/unsaveJob`

  - Input: `SaveJobRequest` (same as above).
  - Process: `$pull` from `saved_jobs`.

- `POST /api/applyJob`

  - Input: `ApplyJobRequest`.
  - Process: tracks applied jobs after user confirms in UI. (Direct JSearch apply flow not implemented.)

- `POST /api/updateUserProfile`

  - Input: `UserProfileUpdateRequest` (partial updates supported).
  - Process: `$set` fields for the user.

- `POST /api/createChat`

  - Input: `CreateChatRequest { email }`.
  - Process: creates permanent context via Gemini from user profile, initializes chat with greeting.
  - Output: `CreateChatResponse { chat_id, chat_name, initial_message }`.

- `POST /api/sendMessage`

  - Input: `ChatMessageRequest { email, chat_id, message, selected_job_id? }`.
  - Process: builds context prompt (permanent profile, conversation summary, recent messages). Uses Gemini with function calling:
    - `search_jobs(query, ...)` → returns job cards for UI.
    - `get_job_details(job_id, ...)` → returns selected job details.
  - Output: `ChatMessageResponse { message, jobs?, selected_job_details? }`.

- `GET /api/getChatMessages?email=<email>&chat_id=<id>`
  - Output: `{ messages, chat_name }` for the chat.

### Chat Service

`backend/chat_service.py` handles:

- Gemini configuration and system prompt.
- Function declarations for `search_jobs` and `get_job_details`.
- Context management: permanent profile context, conversation summary, recent messages.
- Database updates of chat messages and context.

### Job Search Client

`backend/jsearch_client.py` provides `search_jobs` and `get_job_details` wrappers to JSearch API and helpers:

- `extract_job_cards_from_response(result)` returns compact cards for frontend.
- `extract_job_card_data(job)` returns detailed card for a single job.

### Database

`backend/db.py` defines database connection and `db.users` collection structure used across routes:

- User document contains: profile fields from onboarding, arrays `saved_jobs`, `applied_jobs`, and `chat_history` (array of chat docs with `messages` and `context`).

## Frontend

Location: `frontend/`

### Tech Stack

- Vite + React + TypeScript
- Component library under `frontend/src/ui/*`

### Key Pages & Components

- `src/components/HomePage.tsx`: shows recent chats and entry points.
- `src/components/OnboardingPage.tsx`: upload resume (PDF) → displays extracted fields for confirmation → calls `confirmOnboardingDetails`.
- `src/components/ChatPage.tsx`: chat UI, renders bot messages, and job cards returned by `/api/sendMessage`; handles `createChat`, `getChatMessages`, `sendMessage`.
- `src/components/JobCard.tsx`: visual card for a job returned from backend; supports Save/Apply actions to `/api/saveJob` and `/api/applyJob`.
- `src/components/JobDetailModal.tsx`: displays detailed job info when user selects a job (populated by `selected_job_details`).
- `src/components/ProfilePage.tsx`: user profile view/edit; calls `/api/updateUserProfile`.
- `src/components/OnboardingPage.tsx`: onboarding flow integration with `/api/onboardFileUpload` and `/api/confirmOnboardingDetails`.
- `src/services/api.ts`: centralizes API calls to backend endpoints.
- `src/App.tsx` / `src/main.tsx`: routing/app bootstrap.

### How Frontend and Backend Work Together

1. **Onboarding**: User uploads PDF → frontend posts raw file to `/api/onboardFileUpload` → backend returns `UserOnboardingResponse` → user confirms → frontend posts to `/api/confirmOnboardingDetails` → backend stores user.
2. **Chat Session**: Frontend calls `/api/createChat` → receives initial bot message and `chat_id` → subsequent messages sent to `/api/sendMessage` → backend may call job functions and return job cards or selected job details.
3. **Jobs**: Frontend Save/Apply buttons call `/api/saveJob`, `/api/unsaveJob`, `/api/applyJob` → backend updates arrays in user doc.
4. **History**: Frontend fetches chats via `/api/chatHistoryRequest` and specific messages via `/api/getChatMessages`.

### API Base URL

Adjust `src/services/api.ts` to point to your backend, typically `http://localhost:8000` during development. CORS in backend permits local origins.

## Running Locally

Backend (PowerShell):

```powershell
Push-Location backend
python -m venv venv
./venv/Scripts/Activate.ps1
pip install -r requirements.txt
# Ensure .env has GEMINI_API_KEY and MONGODB_URI
uvicorn main:app --reload --host 0.0.0.0 --port 8000
Pop-Location
```

Frontend:

```bash
cd frontend
npm i
npm run dev
```

## Testing

- Backend includes `test_chatbot_simulation.py` and `test_simulation.py` for basic flows. Run with your Python test runner once env is configured.

## Contributing

- **Branching**: create feature branches from `main`.
- **Coding style**: follow existing TypeScript/React patterns and Python FastAPI conventions; keep changes minimal and focused.
- **Commit messages**: clear, imperative style (e.g., "Add onboarding error handling").
- **PRs**: include description, steps to test, and screenshots if UI changes.
- **Backend additions**: update `models.py` and document new routes here.
- **Frontend additions**: update or add components under `src/components` and wire APIs in `src/services/api.ts`.
- **Docs**: when changing APIs or component behavior, update this `documentation.md` and link relevant sections from `README.md`.

## Security & Privacy

- Do not commit secrets. Use `.env`.
- Treat resume data and profile fields as sensitive; avoid logging PII.
- Validate inputs server-side and sanitize any external API output.

## Deployment Notes (high level)

- Backend: containerize with Uvicorn/Gunicorn, set envs, connect managed MongoDB.
- Frontend: build with `npm run build` and serve via a static host or CDN; configure backend URL.
- Enable HTTPS and tighten CORS for production.
