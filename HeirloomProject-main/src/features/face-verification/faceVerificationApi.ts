const API_URL = import.meta.env.VITE_API_URL;

export const faceVerificationApi = {
  async verifyFace(imageData: FormData) {
    const response = await fetch(`${API_URL}/face-verification/verify`, {
      method: 'POST',
      body: imageData,
    });
    return response.json();
  },
};