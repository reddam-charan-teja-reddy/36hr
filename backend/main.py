from jsonschema import ValidationError
import uvicorn
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from models import UserOnboardingRequest, UserOnboardingResponse, User
from bson import ObjectId
import json
from PyPDF2 import PdfReader
import io
import google.generativeai as genai

from dotenv import load_dotenv
load_dotenv()

from db import db
from gemini_client import model

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# user onboarding process

@app.post("/api/onboardFileUpload", response_model=UserOnboardingResponse)
async def onboard_user(request: Request):
    """ The resume file is uploaded by the user via frontend and sent to this endpoint 
        for parsing and extracting details.
        1. the file is parsed using pypdf 2
        2. the parsed text is sent to Gemini 2.5 model along with the onboarding response pydantic model
           for extracting details
        3. the response from Gemini is validated using pydantic model and sent back to 
           frontend for confirmation
    """
    content = await request.body()
    if not content.startswith(b'%PDF-'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        pdf_reader = PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        
        prompt = f"""
        Extract the following details from the resume text provided below.
        Ensure the output matches the JSON schema provided.
        
        Resume Text:
        {text}
        """

        # Hardcoded schema to avoid Pydantic/Gemini compatibility issues
        schema = {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "email": {"type": "string"},
                "phone": {"type": "string"},
                "location": {"type": "string"},
                "skills": {"type": "array", "items": {"type": "string"}},
                "experience": {"type": "array", "items": {"type": "string"}},
                "profile_summary": {"type": "string"},
                "education": {"type": "array", "items": {"type": "string"}},
                "certificationsAndAchievementsAndAwards": {"type": "array", "items": {"type": "string"}},
                "projects": {"type": "array", "items": {"type": "string"}},
                "about": {"type": "string"}
            },
            "required": ["name", "email", "phone", "location", "skills", "experience", "profile_summary"]
        }

        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=schema
            )
        )
        
        # Clean up the response text if necessary (sometimes it might contain markdown code blocks)
        response_text = response.text
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        return UserOnboardingResponse.model_validate_json(response_text.strip())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/confirmOnboardingDetails")
async def confirm_onboarding_details(onboard_confirmed_details: UserOnboardingResponse):
    """ Once the user confirms the details sent by the backend after parsing the resume,
        this endpoint is called to save the details in the database.
    """
    try:
        user_data = onboard_confirmed_details.model_dump()
        # Check if user already exists? For now, just insert.
        # We might want to use email as a unique identifier.
        existing_user = await db.users.find_one({"email": user_data["email"]})
        if existing_user:
             # Update existing user or raise error? Let's update for now or just return existing.
             # Assuming we want to create a new one or update.
             await db.users.update_one({"email": user_data["email"]}, {"$set": user_data})
             return {"message": "User details updated successfully", "email": user_data["email"]}
        
        # Initialize chat_history for new users
        user_data["chat_history"] = []
        result = await db.users.insert_one(user_data)
        return {"message": "User onboarded successfully", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    # command to run the app: uvicorn main:app --reload
    uvicorn.run(app, host="0.0.0.0", port=8000)