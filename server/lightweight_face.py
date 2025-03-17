#!/usr/bin/env python3
"""
Lightweight face detection for environments with limited resources.
This module provides basic face detection without using DeepFace.
"""
import sys
import os
import json
import base64
import uuid
import cv2
import numpy as np

# Directory to store face database
FACE_DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "face_db")
os.makedirs(FACE_DB_DIR, exist_ok=True)

def decode_base64_image(base64_data):
    """Decode a base64 image to a numpy array."""
    try:
        # If the image is a file path rather than base64 data, just return the path
        if isinstance(base64_data, str) and os.path.isfile(base64_data):
            return base64_data
            
        # Remove data URL prefix if present
        if isinstance(base64_data, str) and ',' in base64_data:
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

def detect_faces(image_data):
    """
    Detect faces in an image using OpenCV's Haar Cascade
    
    Args:
        image_data: Image data (path or numpy array)
        
    Returns:
        dict with detection results
    """
    try:
        # Load the image
        if isinstance(image_data, str):
            if os.path.isfile(image_data):
                img = cv2.imread(image_data)
            else:
                # Decode base64 data
                img = decode_base64_image(image_data)
        else:
            img = image_data
            
        # Check if image loaded successfully
        if img is None:
            return {
                "success": False,
                "confidence": 0,
                "message": "Failed to load image"
            }
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Load the face cascade
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Detect faces
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        if len(faces) == 0:
            return {
                "success": False,
                "confidence": 0,
                "message": "No face detected in image"
            }
            
        # Get the largest face
        largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
        
        # Calculate confidence based on face size
        face_area = largest_face[2] * largest_face[3]
        image_area = gray.shape[0] * gray.shape[1]
        size_factor = min(1.0, face_area / (image_area * 0.1))
        
        # Simple confidence score
        confidence = 65 + (size_factor * 20)
        
        # Crop the face for thumbnail or further processing
        x, y, w, h = largest_face
        face_crop = img[y:y+h, x:x+w]
        
        # Create a unique ID for this detection
        detection_id = str(uuid.uuid4())
        
        return {
            "success": True,
            "confidence": confidence,
            "message": "Face detected successfully",
            "face_id": detection_id,
            "face_data": {
                "x": int(x),
                "y": int(y),
                "width": int(w),
                "height": int(h)
            }
        }
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "confidence": 0,
            "message": f"Error detecting faces: {str(e)}",
            "details": traceback.format_exc()
        }

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
        
        # Process the image and detect faces
        detection_result = detect_faces(image_data)
        
        if not detection_result["success"]:
            return None
            
        # Load or convert the image
        if isinstance(image_data, str) and os.path.isfile(image_data):
            img = cv2.imread(image_data)
        elif isinstance(image_data, str):
            img = decode_base64_image(image_data)
        else:
            img = image_data
            
        # Crop the face if detection was successful
        if "face_data" in detection_result:
            face = detection_result["face_data"]
            x, y, w, h = face["x"], face["y"], face["width"], face["height"]
            
            # Add small margin
            margin = int(min(w, h) * 0.1)
            x = max(0, x - margin)
            y = max(0, y - margin)
            w = min(img.shape[1] - x, w + 2 * margin)
            h = min(img.shape[0] - y, h + 2 * margin)
            
            # Crop the face
            face_img = img[y:y+h, x:x+w]
        else:
            # Use the whole image if no face data
            face_img = img
            
        # Save the image
        cv2.imwrite(face_path, face_img)
        
        return face_id
    except Exception as e:
        print(f"Error saving face to database: {str(e)}")
        return None

def simple_face_matching(image_data, user_id=None):
    """
    Simple face matching for environments without DeepFace.
    Uses basic histogram comparison.
    
    Args:
        image_data: Image data (path or array)
        user_id: Optional user ID to check against specific user
        
    Returns:
        dict with matching results
    """
    try:
        # Load or convert the query image
        if isinstance(image_data, str) and os.path.isfile(image_data):
            query_img = cv2.imread(image_data)
        elif isinstance(image_data, str):
            query_img = decode_base64_image(image_data)
        else:
            query_img = image_data
            
        # Convert to grayscale
        query_gray = cv2.cvtColor(query_img, cv2.COLOR_BGR2GRAY)
        
        # Define the search path based on user_id
        db_path = os.path.join(FACE_DB_DIR, str(user_id)) if user_id else FACE_DB_DIR
        
        # If the directory doesn't exist, no matches possible
        if not os.path.exists(db_path) or not os.listdir(db_path):
            return {
                "matched": False,
                "confidence": 0,
                "message": "No faces found in database"
            }
            
        best_match = None
        best_score = 0
        best_face_id = None
        
        # For each face in the database
        for root, _, files in os.walk(db_path):
            for file in files:
                if file.lower().endswith('.jpg') or file.lower().endswith('.jpeg'):
                    face_path = os.path.join(root, file)
                    face_id = os.path.splitext(file)[0]
                    
                    # Load the face image
                    db_img = cv2.imread(face_path)
                    
                    # Skip if image couldn't be loaded
                    if db_img is None:
                        continue
                        
                    # Convert to grayscale
                    db_gray = cv2.cvtColor(db_img, cv2.COLOR_BGR2GRAY)
                    
                    # Resize to match query image
                    db_gray = cv2.resize(db_gray, (query_gray.shape[1], query_gray.shape[0]))
                    
                    # Compare histograms
                    query_hist = cv2.calcHist([query_gray], [0], None, [256], [0, 256])
                    db_hist = cv2.calcHist([db_gray], [0], None, [256], [0, 256])
                    
                    # Normalize histograms
                    cv2.normalize(query_hist, query_hist)
                    cv2.normalize(db_hist, db_hist)
                    
                    # Calculate correlation
                    score = cv2.compareHist(query_hist, db_hist, cv2.HISTCMP_CORREL)
                    
                    # Update best match
                    if score > best_score:
                        best_score = score
                        best_match = db_img
                        best_face_id = face_id
                        
        # Check if we have a good match
        if best_score > 0.5:  # Threshold for a decent match
            confidence = best_score * 100
            return {
                "matched": True,
                "confidence": confidence,
                "face_id": best_face_id,
                "message": "Face matched in database"
            }
        else:
            return {
                "matched": False,
                "confidence": best_score * 100,
                "message": "No matching face found in database"
            }
            
    except Exception as e:
        import traceback
        return {
            "matched": False,
            "confidence": 0,
            "message": f"Error during face matching: {str(e)}",
            "details": traceback.format_exc()
        }

def verify_face_lightweight(image_data, user_id=None, save_if_verified=False):
    """
    Lightweight face verification that doesn't use DeepFace.
    
    Args:
        image_data: Image data (path or base64)
        user_id: Optional user ID to check against in database
        save_if_verified: Whether to save face to database if verified
        
    Returns:
        dict with verification results
    """
    # Detect faces
    detection = detect_faces(image_data)
    
    if not detection["success"]:
        return detection
    
    # Try to match if user_id provided
    match_result = {"matched": False, "confidence": 0}
    if user_id:
        match_result = simple_face_matching(image_data, user_id)
    
    # Save face if requested and not already matched
    face_id = None
    if save_if_verified and user_id and not match_result["matched"]:
        face_id = save_face_to_db(image_data, user_id)
    elif match_result["matched"]:
        face_id = match_result["face_id"]
    
    # Return combined result
    return {
        "success": True,
        "confidence": match_result["confidence"] if match_result["matched"] else detection["confidence"],
        "message": "Face verified and matched" if match_result["matched"] else "Face detected but no match found",
        "matched": match_result["matched"],
        "face_id": face_id,
        "results": {
            "age": None,  # Not available in lightweight version
            "gender": None,
            "dominant_race": None,
            "dominant_emotion": None
        }
    }

if __name__ == "__main__":
    # Parse command line arguments
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "confidence": 0,
            "message": "No image provided"
        }))
        sys.exit(1)
        
    # First argument is always the image path
    image_path = sys.argv[1]
    
    # Optional user_id parameter
    user_id = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Optional save parameter
    save_if_verified = (len(sys.argv) > 3 and sys.argv[3].lower() == 'save')
    
    # Process the verification
    result = verify_face_lightweight(image_path, user_id, save_if_verified)
    
    # Print the result as JSON
    print(json.dumps(result))
    
    # Clean up temporary file if needed
    if os.path.exists(image_path) and os.path.basename(image_path).startswith("temp_face_"):
        try:
            os.unlink(image_path)
        except:
            pass