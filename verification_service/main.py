#!/usr/bin/env python3
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uvicorn
import uuid
import os
import sys
import base64
import json
import shutil
from datetime import datetime
import numpy as np
import cv2

# Import DeepFace if available
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except ImportError:
    DEEPFACE_AVAILABLE = False
    print("DeepFace not available, will use fallback detection methods")

# Setup paths
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
FACE_DB_DIR = os.path.join(ROOT_DIR, "face_db")
TEMP_DIR = os.path.join(CURRENT_DIR, "temp")

# Create necessary directories
os.makedirs(FACE_DB_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# Initialize FastAPI app
app = FastAPI(
    title="Heirloom Face Verification API",
    description="API for face verification and identity management",
    version="1.0.0"
)

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class VerificationRequest(BaseModel):
    image: str
    user_id: Optional[int] = None
    save_to_db: bool = False
    request_id: Optional[str] = None
    check_db_only: bool = False
    use_basic_detection: bool = False

class VerificationResponse(BaseModel):
    success: bool
    confidence: float
    message: str
    matched: bool = False
    face_id: Optional[str] = None
    debug_session: Optional[str] = None
    results: Optional[Dict[str, Any]] = None
    details: Optional[str] = None
    error: Optional[str] = None

class VideoVerificationRequest(BaseModel):
    user_id: Optional[int] = None
    save_to_db: bool = False
    request_id: Optional[str] = None

# Helper Functions
def decode_base64_image(base64_data: str):
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
        raise ValueError(f"Error decoding image: {str(e)}")

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
        if not DEEPFACE_AVAILABLE:
            return False, 0, None, None
            
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

def analyze_face_with_deepface(image_path):
    """Analyze face using DeepFace if available."""
    if not DEEPFACE_AVAILABLE:
        return None
        
    try:
        results = DeepFace.analyze(
            img_path=image_path,
            actions=['age', 'gender', 'race', 'emotion'],
            enforce_detection=False,
            detector_backend='opencv'
        )
        
        if results and len(results) > 0:
            result = results[0]
            # Extract dominant values
            dominant_emotion = max(result.get('emotion', {}).items(), key=lambda item: item[1])[0]
            dominant_race = max(result.get('race', {}).items(), key=lambda item: item[1])[0]
            
            return {
                "age": result.get('age'),
                "gender": result.get('gender'),
                "dominant_race": dominant_race,
                "dominant_emotion": dominant_emotion
            }
    except Exception as e:
        print(f"DeepFace analysis error: {str(e)}")
    
    return None

def detect_face_with_opencv(image_path):
    """Basic face detection with OpenCV."""
    try:
        # Load face cascade
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Load and convert image
        if isinstance(image_path, str):
            img = cv2.imread(image_path)
            if img is None:
                return False, 0
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            if len(image_path.shape) == 3 and image_path.shape[2] == 3:
                gray = cv2.cvtColor(image_path, cv2.COLOR_BGR2GRAY)
            else:
                gray = image_path
        
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
            return True, confidence
            
        return False, 0
    except Exception as e:
        print(f"OpenCV detection error: {str(e)}")
        return False, 0

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint to verify the API is running."""
    return {
        "message": "Heirloom Face Verification API is running",
        "version": "1.0.0",
        "status": "active",
        "deepface_available": DEEPFACE_AVAILABLE
    }

@app.post("/api/verification/face", response_model=VerificationResponse)
async def verify_face(request: VerificationRequest):
    """
    Verify a face from an image.
    The image should be provided as a base64-encoded string.
    """
    # Create a debugging session ID
    debug_session = request.request_id or f"face-verify-{uuid.uuid4()}"
    
    try:
        # Process the image
        image = decode_base64_image(request.image)
        
        # Save to temporary file for processing
        temp_file = os.path.join(TEMP_DIR, f"temp_verify_{debug_session}.jpg")
        cv2.imwrite(temp_file, image)
        
        # Initialize result variables
        matched = False
        matched_confidence = 0
        face_id = None
        
        # Check for match if user_id provided
        if request.user_id:
            matched, matched_confidence, _, face_id = find_matching_face(temp_file, request.user_id)
            
            # If we have a strong match and only checking DB, return immediately
            if matched and matched_confidence >= 90 and request.check_db_only:
                os.remove(temp_file)
                return VerificationResponse(
                    success=True,
                    confidence=matched_confidence,
                    message="Face verification successful (matched existing face)",
                    matched=True,
                    face_id=face_id,
                    debug_session=debug_session
                )
        
        # If DeepFace is available and not using basic detection, use it
        face_results = None
        if DEEPFACE_AVAILABLE and not request.use_basic_detection:
            face_results = analyze_face_with_deepface(temp_file)
        
        # If DeepFace failed or we're using basic detection, fall back to OpenCV
        if not face_results:
            face_detected, confidence = detect_face_with_opencv(temp_file)
            
            if not face_detected:
                os.remove(temp_file)
                return VerificationResponse(
                    success=False,
                    confidence=0,
                    message="No face detected in image",
                    debug_session=debug_session
                )
                
            # Determine final confidence (prefer matched confidence if available)
            final_confidence = matched_confidence if matched else confidence
            
            # Save to DB if requested
            if request.save_to_db and request.user_id and not matched:
                face_id = save_face_to_db(temp_file, request.user_id)
                
            # Clean up
            os.remove(temp_file)
            
            return VerificationResponse(
                success=True,
                confidence=final_confidence,
                message="Face detected with basic verification",
                matched=matched,
                face_id=face_id,
                debug_session=debug_session
            )
        
        # Using DeepFace results
        # Determine final confidence (prefer matched confidence if available)
        final_confidence = matched_confidence if matched else 85
        
        # Save to DB if requested
        if request.save_to_db and request.user_id and not matched:
            face_id = save_face_to_db(temp_file, request.user_id)
            
        # Clean up
        os.remove(temp_file)
        
        return VerificationResponse(
            success=True,
            confidence=final_confidence,
            message="Face verification successful",
            matched=matched,
            face_id=face_id,
            results=face_results,
            debug_session=debug_session
        )
        
    except Exception as e:
        # Clean up temp file if it exists
        if 'temp_file' in locals() and os.path.exists(temp_file):
            os.remove(temp_file)
            
        # Return error response
        return VerificationResponse(
            success=False,
            confidence=0,
            message=f"Error during verification: {str(e)}",
            debug_session=debug_session,
            error=str(e)
        )

@app.post("/api/verification/video")
async def verify_video(
    file: UploadFile = File(...),
    user_id: Optional[int] = Form(None),
    save_to_db: bool = Form(False),
    request_id: Optional[str] = Form(None)
):
    """
    Verify identity from a video.
    More robust than single image verification.
    """
    debug_session = request_id or f"video-verify-{uuid.uuid4()}"
    
    try:
        # Save uploaded video
        video_path = os.path.join(TEMP_DIR, f"temp_video_{debug_session}.mp4")
        frames_dir = os.path.join(TEMP_DIR, f"frames_{debug_session}")
        os.makedirs(frames_dir, exist_ok=True)
        
        # Save the uploaded file
        with open(video_path, "wb") as buffer:
            buffer.write(await file.read())
        
        # Extract frames using OpenCV
        try:
            cap = cv2.VideoCapture(video_path)
            frame_count = 0
            max_frames = 10  # Maximum frames to extract
            frame_results = []
            
            while cap.isOpened() and frame_count < max_frames:
                ret, frame = cap.read()
                if not ret:
                    break
                    
                # Save every 5th frame
                if frame_count % 5 == 0:
                    frame_path = os.path.join(frames_dir, f"frame_{frame_count:03d}.jpg")
                    cv2.imwrite(frame_path, frame)
                    frame_results.append(frame_path)
                    
                frame_count += 1
                
            cap.release()
            
            # If no frames were extracted, return error
            if not frame_results:
                return {
                    "success": False,
                    "message": "Could not extract frames from video",
                    "debug_session": debug_session
                }
                
            # Process each frame
            best_frame = None
            best_confidence = 0
            best_results = None
            matched = False
            face_id = None
            
            for frame_path in frame_results:
                # Try to detect face in this frame
                if DEEPFACE_AVAILABLE:
                    try:
                        # Check for match
                        if user_id:
                            frame_matched, confidence, _, frame_face_id = find_matching_face(frame_path, user_id)
                            
                            # If matched with high confidence, use this frame
                            if frame_matched and confidence > best_confidence:
                                matched = True
                                best_confidence = confidence
                                best_frame = frame_path
                                face_id = frame_face_id
                                
                        # Analyze face attributes
                        face_results = analyze_face_with_deepface(frame_path)
                        
                        if face_results and (best_results is None or best_confidence < 85):
                            best_results = face_results
                            if not matched:
                                best_frame = frame_path
                                best_confidence = 85  # Default confidence for detected face
                                
                    except Exception:
                        # Skip errors in individual frames
                        continue
                else:
                    # Use OpenCV for basic detection
                    face_detected, confidence = detect_face_with_opencv(frame_path)
                    if face_detected and confidence > best_confidence:
                        best_frame = frame_path
                        best_confidence = confidence
            
            # Save best frame to DB if requested
            if save_to_db and user_id and best_frame and not matched:
                face_id = save_face_to_db(best_frame, user_id)
            
            # Clean up
            import shutil
            shutil.rmtree(frames_dir, ignore_errors=True)
            os.remove(video_path)
            
            return {
                "success": best_frame is not None,
                "confidence": best_confidence,
                "message": "Video verification successful" if best_frame else "No face detected in video",
                "matched": matched,
                "face_id": face_id,
                "results": best_results,
                "debug_session": debug_session
            }
            
        except Exception as e:
            # Clean up
            shutil.rmtree(frames_dir, ignore_errors=True)
            os.remove(video_path)
            
            raise e
            
    except Exception as e:
        return {
            "success": False,
            "confidence": 0,
            "message": f"Error during video verification: {str(e)}",
            "debug_session": debug_session,
            "error": str(e)
        }

@app.get("/api/verification/status")
async def service_status():
    """Check the status of the verification service."""
    return {
        "status": "operational",
        "deepface_available": DEEPFACE_AVAILABLE,
        "opencv_available": True,
        "timestamp": datetime.now().isoformat(),
        "face_db_path": FACE_DB_DIR,
        "face_records": sum(len(files) for _, _, files in os.walk(FACE_DB_DIR))
    }

# Main function to run the API server
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)