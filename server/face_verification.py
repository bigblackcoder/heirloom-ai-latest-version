#!/usr/bin/env python3
import sys
import os
import json
import base64
import traceback
import uuid
import shutil
import numpy as np
import cv2
from deepface import DeepFace

# Directory to store face database
FACE_DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "face_db")
os.makedirs(FACE_DB_DIR, exist_ok=True)

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

def find_matching_face(image_path, user_id=None):
    """
    Find if the face in the image matches any face in the database.
    
    Args:
        image_path: Path to the image to verify
        user_id: Optional user ID to restrict search to specific user's faces
        
    Returns:
        Tuple (matched, confidence, user_id, face_id)
    """
    try:
        # Define the search path based on user_id
        db_path = os.path.join(FACE_DB_DIR, str(user_id)) if user_id else FACE_DB_DIR
        
        # If the directory doesn't exist, no matches possible
        if not os.path.exists(db_path) or not os.listdir(db_path):
            return False, 0, None, None
            
        # Search for matching faces
        dfs = DeepFace.find(
            img_path=image_path,
            db_path=db_path,
            enforce_detection=False,
            detector_backend='opencv',
            distance_metric='cosine'
        )
        
        # Check if any faces were found
        if not dfs or len(dfs) == 0 or dfs[0].empty:
            return False, 0, None, None
            
        # Get best match from first dataframe
        best_match = dfs[0].iloc[0]
        
        # Extract identity and distance
        identity = best_match['identity']
        distance = best_match['distance']
        
        # Convert distance to confidence (cosine distance is between 0-1, lower is better)
        # Threshold for good match is typically around 0.4
        if distance > 0.4:  # Too different
            return False, 0, None, None
            
        # Convert distance to confidence percentage (0-100)
        confidence = int((1 - distance) * 100)
        
        # Extract user_id and face_id from identity path
        # Path format: face_db/user_id/face_id.jpg
        parts = identity.split(os.sep)
        if len(parts) >= 3:
            matched_user_id = parts[-2]
            face_id = os.path.splitext(parts[-1])[0]
            return True, confidence, matched_user_id, face_id
        
        return False, confidence, None, None
        
    except Exception as e:
        print(f"Error in face matching: {str(e)}")
        return False, 0, None, None

def save_face_to_db(image_data, user_id):
    """
    Save a face to the database for future matching.
    
    Args:
        image_data: Image data (path or array)
        user_id: User ID to associate with this face
        
    Returns:
        face_id: ID of the saved face
    """
    try:
        # Make sure we have the user directory
        user_dir = os.path.join(FACE_DB_DIR, str(user_id))
        os.makedirs(user_dir, exist_ok=True)
        
        # Generate unique ID for this face
        face_id = str(uuid.uuid4())
        face_path = os.path.join(user_dir, f"{face_id}.jpg")
        
        # Save the image
        if isinstance(image_data, str) and os.path.isfile(image_data):
            # Copy the file
            shutil.copy(image_data, face_path)
        else:
            # Save the numpy array
            if isinstance(image_data, str):
                # Decode base64 data
                image = decode_base64_image(image_data)
            else:
                # Use the image as is
                image = image_data
                
            # Save to file
            cv2.imwrite(face_path, image)
            
        return face_id
    except Exception as e:
        print(f"Error saving face to database: {str(e)}")
        return None

def verify_face(image_data, user_id=None, save_if_verified=False):
    """
    Verify if the image contains a real human face and return confidence score.
    If user_id is provided, also checks for face matches in the database.
    
    Args:
        image_data: Image data (path or base64)
        user_id: Optional user ID to check against specific user's faces
        save_if_verified: Whether to save the face to the database if verified
    """
    try:
        # Load the image (either from file path or decode base64)
        image = decode_base64_image(image_data) if isinstance(image_data, str) else image_data
        
        # Convert numpy array to temp file if needed for DeepFace
        temp_file = None
        if not isinstance(image, str):
            temp_file = f"temp_verify_{uuid.uuid4()}.jpg"
            cv2.imwrite(temp_file, image)
            image_path = temp_file
        else:
            image_path = image
        
        # Try face matching first if we have a user_id
        matched = False
        matched_confidence = 0
        matched_user_id = None
        face_id = None
        
        if user_id:
            matched, matched_confidence, matched_user_id, face_id = find_matching_face(image_path, user_id)
            
            # If we have a strong match (confidence >= 90), return immediately
            if matched and matched_confidence >= 90:
                result = {
                    "success": True,
                    "confidence": matched_confidence,
                    "message": "Face verification successful (matched existing face)",
                    "matched": True,
                    "face_id": face_id
                }
                print(json.dumps(result))
                
                # Clean up temp file
                if temp_file and os.path.exists(temp_file):
                    os.unlink(temp_file)
                return
        
        # Try DeepFace analyze for general face detection and attributes
        try:
            results = DeepFace.analyze(
                img_path=image_path,
                actions=['age', 'gender', 'race', 'emotion'],
                enforce_detection=False,
                detector_backend='opencv'
            )
            
            # Extract dominant results
            if results and len(results) > 0:
                result = results[0]
                dominant_emotion = max(result.get('emotion', {}).items(), key=lambda item: item[1])[0]
                dominant_race = max(result.get('race', {}).items(), key=lambda item: item[1])[0]
                
                # Determine confidence based on match and DeepFace
                confidence = matched_confidence if matched else 85
                
                # Save face to database if requested and not already matched
                if save_if_verified and user_id and not matched:
                    face_id = save_face_to_db(image_path, user_id)
                
                # Construct result object
                success_result = {
                    "success": True,
                    "confidence": confidence,  # Use matched confidence or default
                    "message": "Face verification successful",
                    "matched": matched,
                    "face_id": face_id,
                    "results": {
                        "age": result.get('age'),
                        "gender": result.get('gender'),
                        "dominant_race": dominant_race,
                        "dominant_emotion": dominant_emotion
                    }
                }
                
                print(json.dumps(success_result))
                
                # Clean up temp file
                if temp_file and os.path.exists(temp_file):
                    os.unlink(temp_file)
                return
        except Exception as deepface_error:
            # Fall back to basic face detection if DeepFace analysis fails
            print(f"DeepFace analysis failed: {str(deepface_error)}", file=sys.stderr)
                
        # Fall back to basic OpenCV face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Convert to grayscale if the image is in color
        if isinstance(image_path, str):
            # If image is a file path, read it
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Failed to load image from {image_path}")
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
                "message": "Face detected with basic verification",
                "matched": False
            }))
        else:
            print(json.dumps({
                "success": False,
                "confidence": 0,
                "message": "No face detected in image",
                "matched": False
            }))
            
        # Clean up temp file
        if temp_file and os.path.exists(temp_file):
            os.unlink(temp_file)
            
    except Exception as e:
        traceback_str = traceback.format_exc()
        print(json.dumps({
            "success": False,
            "confidence": 0,
            "message": f"Error verifying face: {str(e)}",
            "details": traceback_str,
            "matched": False
        }))
        
        # Clean up temp file if it exists
        if 'temp_file' in locals() and temp_file and os.path.exists(temp_file):
            os.unlink(temp_file)

if __name__ == "__main__":
    # Parse command line arguments
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "confidence": 0,
            "message": "No image provided",
            "matched": False
        }))
        sys.exit(1)
        
    # First argument is always the image path
    image_path = sys.argv[1]
    
    # Optional user_id parameter
    user_id = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Optional save parameter
    save_if_verified = (len(sys.argv) > 3 and sys.argv[3].lower() == 'save')
    
    # Clean up temporary file after execution
    try:
        verify_face(image_path, user_id, save_if_verified)
    finally:
        if os.path.exists(image_path) and os.path.basename(image_path).startswith("temp_face_"):
            try:
                os.unlink(image_path)
            except:
                pass