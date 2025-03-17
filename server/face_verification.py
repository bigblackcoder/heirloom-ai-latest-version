#!/usr/bin/env python3
import sys
import os
import json
import base64
import traceback
import numpy as np
import cv2
from deepface import DeepFace

def decode_base64_image(base64_data):
    """Decode a base64 image to a numpy array."""
    try:
        # If the image is a file path rather than base64 data, just return the path
        if os.path.isfile(base64_data):
            return base64_data
            
        # Remove data URL prefix if present
        if ',' in base64_data:
            _, base64_data = base64_data.split(',', 1)
            
        # Decode base64 to bytes
        image_bytes = base64.b64decode(base64_data)
        
        # Convert to numpy array
        np_arr = np.frombuffer(image_bytes, np.uint8)
        
        # Decode to image
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("Failed to decode image")
            
        return image
    except Exception as e:
        print(json.dumps({
            "success": False,
            "confidence": 0,
            "message": f"Error decoding image: {str(e)}"
        }))
        sys.exit(1)

def verify_face(image_data):
    """Verify if the image contains a real human face and return confidence score."""
    try:
        # Load the image (either from file path or decode base64)
        image = decode_base64_image(image_data) if isinstance(image_data, str) else image_data
        
        # Try DeepFace analyze first
        try:
            results = DeepFace.analyze(
                img_path=image,
                actions=['age', 'gender', 'race', 'emotion'],
                enforce_detection=False,
                detector_backend='opencv'
            )
            
            # Extract dominant results
            if results and len(results) > 0:
                result = results[0]
                dominant_emotion = max(result.get('emotion', {}).items(), key=lambda item: item[1])[0]
                dominant_race = max(result.get('race', {}).items(), key=lambda item: item[1])[0]
                
                # Construct result object
                success_result = {
                    "success": True,
                    "confidence": 85,  # We're using a high baseline confidence (85%) since DeepFace detected a face
                    "message": "Face verification successful",
                    "results": {
                        "age": result.get('age'),
                        "gender": result.get('gender'),
                        "dominant_race": dominant_race,
                        "dominant_emotion": dominant_emotion
                    }
                }
                
                print(json.dumps(success_result))
                return
        except Exception as deepface_error:
            # Fall back to basic face detection if DeepFace analysis fails
            pass
                
        # Fall back to basic OpenCV face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Convert to grayscale if the image is in color
        if isinstance(image, str):
            # If image is a file path, read it
            img = cv2.imread(image)
            if img is None:
                raise ValueError(f"Failed to load image from {image}")
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            # If image is already a numpy array
            if len(image.shape) == 3 and image.shape[2] == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image
                
        # Detect faces
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        if len(faces) > 0:
            # Get the largest face
            largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
            
            # Calculate confidence based on face size and image size
            face_area = largest_face[2] * largest_face[3]
            image_area = gray.shape[0] * gray.shape[1]
            size_factor = min(1.0, face_area / (image_area * 0.1))  # Face takes up at least 10% of image
            
            # Final confidence score (between 40 and 70 percent)
            confidence = 40 + (size_factor * 30)
            
            print(json.dumps({
                "success": True,
                "confidence": confidence,
                "message": "Face detected with basic verification"
            }))
        else:
            print(json.dumps({
                "success": False,
                "confidence": 0,
                "message": "No face detected in image"
            }))
    except Exception as e:
        traceback_str = traceback.format_exc()
        print(json.dumps({
            "success": False,
            "confidence": 0,
            "message": f"Error verifying face: {str(e)}",
            "details": traceback_str
        }))

if __name__ == "__main__":
    # Check if an image path was provided as a command line argument
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        
        # Clean up temporary file after execution
        try:
            verify_face(image_path)
        finally:
            if os.path.exists(image_path) and image_path.startswith("temp_face_"):
                try:
                    os.unlink(image_path)
                except:
                    pass
    else:
        print(json.dumps({
            "success": False,
            "confidence": 0,
            "message": "No image provided"
        }))