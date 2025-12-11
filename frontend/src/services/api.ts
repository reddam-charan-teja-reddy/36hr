import { UserProfile } from '../App';

export const uploadResume = async (file: File): Promise<UserProfile> => {
  const response = await fetch('/api/onboardFileUpload', {
    method: 'POST',
    body: file,
    headers: {
      // Content-Type is automatically set by fetch when body is a File/Blob
      // but for raw binary we might need to be careful.
      // The backend expects raw bytes, not multipart/form-data.
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to upload resume');
  }

  return response.json();
};

export const confirmOnboarding = async (data: UserProfile): Promise<{ message: string; id?: string }> => {
  const response = await fetch('/api/confirmOnboardingDetails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to confirm onboarding details');
  }

  return response.json();
};
