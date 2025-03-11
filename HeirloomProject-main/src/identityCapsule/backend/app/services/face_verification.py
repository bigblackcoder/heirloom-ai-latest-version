import face_recognition
import numpy as np
from typing import Tuple
import os

class FaceVerificationService:
    @staticmethod
    async def verify_faces(img1_path: str, img2_path: str) -> Tuple[bool, float]:
        """
        Verify if two face images are of the same person.
        Returns a tuple of (is_match: bool, confidence: float)
        """
        try:
            print(f"Loading images from paths: {img1_path}, {img2_path}")
            
            # Load images
            img1 = face_recognition.load_image_file(img1_path)
            img2 = face_recognition.load_image_file(img2_path)
            
            # Get face encodings with more tolerance for face detection
            img1_encodings = face_recognition.face_encodings(img1, num_jitters=3, model="large")
            if not img1_encodings:
                print("No face detected in profile image")
                return False, 0.0
                
            img2_encodings = face_recognition.face_encodings(img2, num_jitters=3, model="large")
            if not img2_encodings:
                print("No face detected in verification image")
                return False, 0.0
            
            # Compare faces
            face_distances = face_recognition.face_distance(
                [img1_encodings[0]], 
                img2_encodings[0]
            )
            
            # Convert distance to similarity score (0 to 1)
            similarity = 1 - face_distances[0]
            
            # Use a threshold of 0.6 (lower distance = more similar)
            is_match = face_distances[0] <= 0.6
            
            print(f"Face verification result: match={is_match}, similarity={similarity}")
            return is_match, float(similarity)
            
        except Exception as e:
            print(f"Error in face verification: {str(e)}")
            raise Exception(f"Face verification error: {str(e)}")
        
    @staticmethod
    def cleanup_temp_files(*file_paths: str) -> None:
        """Clean up temporary image files"""
        for file_path in file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(f"Error cleaning up file {file_path}: {str(e)}")
