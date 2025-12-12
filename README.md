# Job Search App with Chatbot (36hr)

This repository contains a full-stack job search application with an AI chatbot that helps users discover roles, review resume fit, and prepare for interviews. The backend is built with FastAPI and integrates Google Gemini for conversational AI and the JSearch API for job listings. The frontend is a Vite + React app using a modern component library.

- Documentation: see [documentation.md](documentation.md)
- Frontend quickstart: [frontend/README.md](frontend/README.md)
- Backend requirements: [backend/requirements.txt](backend/requirements.txt)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A running MongoDB (local or cloud)
- Environment variables for backend (see below)

### Backend Setup

1. Create and activate a virtual environment.
2. Install dependencies from `backend/requirements.txt`.
3. Set environment variables in `backend/.env`.
4. Run the API server.

Example on Windows (PowerShell):

```powershell
Push-Location backend
python -m venv venv
./venv/Scripts/Activate.ps1
pip install -r requirements.txt
copy NUL .env
# Edit .env with required keys (see documentation.md)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
Pop-Location
```

### Frontend Setup

1. Install dependencies.
2. Run the dev server.

```bash
cd frontend
npm i
npm run dev
```

By default, frontend runs on `http://localhost:5173` (Vite) and backend on `http://localhost:8000`. CORS is configured to allow local development.

## Contributing

We welcome contributions! Please read the contribution guide in [documentation.md](documentation.md#contributing) and open an issue/PR with a clear description.

## License

Proprietary or project-specific; confirm before redistribution.
