from pydantic import BaseModel, Field
from typing import List, Optional

class User(BaseModel):
    """user model for database storage, contains user profile details, contains chat history too, applied jobs, saved jobs etc. will be used after everything is completed"""
    pass 


class UserOnboardingRequest(BaseModel):
    """User uploads his resume via the frontend in pdf file or docx file format."""
    filename: str
    

class UserOnboardingResponse(BaseModel):
    """Response backend sends the prsed details for editing and confirmation by the user.
       This model is also used in the confirming onboarding details endpoint.
    """
    name: str
    email: str
    phone: str
    location: str
    skills: List[str]
    experience: List[str]
    profile_summary: str
    # optional fields
    education: Optional[List[str]] = None
    certificationsAndAchievementsAndAwards: Optional[List[str]] = None
    projects: Optional[List[str]] = None
    about: Optional[str] = None

