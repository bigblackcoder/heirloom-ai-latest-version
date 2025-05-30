#!/usr/bin/env python3

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import base64
import cv2
import numpy as np
import json
import os
import uuid
import tempfile
from typing import Optional, Dict, Any, List, Union
import logging
import time
import sys
import traceback
from datetime import datetime

# Import face embedding functions
try:
    from face_embeddings import (
        extract_face_embedding, 
        verify_face_with_embeddings, 
        get_available_models,
        DEEPFACE_AVAILABLE as EMBEDDINGS_AVAILABLE
    )
    EMBEDDINGS_AVAILABLE = True
    logger.info("Face embeddings module loaded successfully!")
except ImportError:
    logger.warning("Face embeddings module not available")
    EMBEDDINGS_AVAILABLE = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("verification-service")

# Initialize FastAPI app
app = FastAPI(
    title="Face Verification Service",
    description="API for facial verification and authentication",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create face database directory if it doesn't exist
os.makedirs("face_db", exist_ok=True)

# Global flag for DeepFace availability
DEEPFACE_AVAILABLE = False

# Try to import DeepFace, fall back to basic OpenCV if not available
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
    logger.info("DeepFace loaded successfully!")
except ImportError:
    logger.warning("DeepFace not available, using basic OpenCV detection instead")
    DEEPFACE_AVAILABLE = False

def decode_base64_image(base64_data: str) -> np.ndarray:
    """Decode a base64 image to a numpy array."""
    try:
        # Remove data URL prefix if present
        if "base64," in base64_data:
            base64_data = base64_data.split("base64,")[1]
        
        # Decode base64 to bytes
        image_bytes = base64.b64decode(base64_data)
        
        # Convert bytes to numpy array
        np_arr = np.frombuffer(image_bytes, np.uint8)
        
        # Decode image
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("Failed to decode image")
        
        return image
    except Exception as e:
        logger.error(f"Error decoding base64 image: {str(e)}")
        raise ValueError(f"Invalid image data: {str(e)}")

def detect_faces_basic(image_data: Union[str, np.ndarray]) -> Dict[str, Any]:
    """
    Basic face detection using OpenCV's Haar Cascade
    
    Args:
        image_data: Image data (base64 string or numpy array)
        
    Returns:
        dict with detection results
    """
    try:
        # Convert to numpy array if string
        if isinstance(image_data, str):
            image = decode_base64_image(image_data)
        else:
            image = image_data
            
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Load the face detector
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        # Calculate confidence based on number of faces detected
        face_detected = len(faces) > 0
        confidence = 0.85 if face_detected else 0.0
        
        face_data = {}
        if face_detected:
            # Get the largest face
            largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
            x, y, w, h = largest_face
            
            # Save face coordinates
            face_data = {
                "x": int(x),
                "y": int(y),
                "width": int(w),
                "height": int(h),
                "area": int(w * h)
            }
            
            # Extract ROI for the face
            face_roi = gray[y:y+h, x:x+w]
            
            # Simple fake liveness check (variance in pixel values)
            variance = np.var(face_roi)
            # Low variance might indicate a flat image (like a photograph)
            if variance < 200:
                confidence = max(0.5, confidence - 0.3)
                
        result = {
            "success": face_detected,
            "confidence": float(confidence),
            "face_count": len(faces),
            "face_data": face_data
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error in basic face detection: {str(e)}")
        return {
            "success": False,
            "confidence": 0.0,
            "message": f"Face detection error: {str(e)}"
        }

def verify_with_deepface(image_data: Union[str, np.ndarray]) -> Dict[str, Any]:
    """
    Verify face using DeepFace library
    
    Args:
        image_data: Image data (base64 string or numpy array)
        
    Returns:
        dict with verification results
    """
    if not DEEPFACE_AVAILABLE:
        return detect_faces_basic(image_data)
    
    try:
        # Convert to numpy array if string
        if isinstance(image_data, str):
            image = decode_base64_image(image_data)
        else:
            image = image_data
            
        # Save image to temp file for DeepFace
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        temp_path = temp_file.name
        temp_file.close()
        
        cv2.imwrite(temp_path, image)
        
        # Analyze face using DeepFace
        analysis = DeepFace.analyze(
            img_path=temp_path,
            actions=['age', 'gender', 'race', 'emotion'],
            enforce_detection=True
        )
        
        # DeepFace returns a list for analysis
        if isinstance(analysis, list):
            analysis = analysis[0]
            
        os.unlink(temp_path)
        
        # Process results
        result = {
            "success": True,
            "confidence": 0.95,  # DeepFace detection is usually high confidence
            "results": {
                "age": analysis.get("age", 0),
                "gender": analysis.get("gender", ""),
                "dominant_race": analysis.get("dominant_race", ""),
                "dominant_emotion": analysis.get("dominant_emotion", "")
            }
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error in DeepFace verification: {str(e)}")
        # Fall back to basic detection
        logger.info("Falling back to basic face detection")
        return detect_faces_basic(image_data)

def save_face_to_db(image_data: Union[str, np.ndarray], user_id: str) -> str:
    """
    Save a face to the database for future matching
    
    Args:
        image_data: Image data (base64 string or numpy array)
        user_id: User ID to associate with this face
        
    Returns:
        face_id: ID of the saved face
    """
    try:
        # Convert to numpy array if string
        if isinstance(image_data, str):
            image = decode_base64_image(image_data)
        else:
            image = image_data
            
        # Create unique ID for this face
        face_id = str(uuid.uuid4())
        
        # Create directory structure for user if it doesn't exist
        user_dir = os.path.join("face_db", user_id)
        os.makedirs(user_dir, exist_ok=True)
        
        # Save face image
        face_path = os.path.join(user_dir, f"{face_id}.jpg")
        cv2.imwrite(face_path, image)
        
        # Save metadata
        metadata = {
            "face_id": face_id,
            "user_id": user_id,
            "timestamp": datetime.now().isoformat(),
            "filename": f"{face_id}.jpg"
        }
        
        metadata_path = os.path.join(user_dir, f"{face_id}.json")
        with open(metadata_path, "w") as f:
            json.dump(metadata, f)
            
        return face_id
    
    except Exception as e:
        logger.error(f"Error saving face to DB: {str(e)}")
        raise ValueError(f"Failed to save face: {str(e)}")

def process_video_frames(video_path: str, user_id: Optional[str] = None, 
                        save_to_db: bool = False) -> Dict[str, Any]:
    """
    Process video for face verification by extracting and analyzing frames
    
    Args:
        video_path: Path to the video file
        user_id: Optional user ID to associate with this face
        save_to_db: Whether to save the detected face to the database
        
    Returns:
        dict with verification results
    """
    try:
        # Open the video file
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise ValueError("Could not open video file")
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Extract frames at regular intervals
        frame_count = 0
        frame_interval = max(1, int(fps / 4))  # Extract about 4 frames per second
        
        results = []
        best_frame = None
        best_confidence = 0
        face_id = None
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            # Process every Nth frame
            if frame_count % frame_interval == 0:
                # Perform face verification on this frame
                if DEEPFACE_AVAILABLE:
                    result = verify_with_deepface(frame)
                else:
                    result = detect_faces_basic(frame)
                
                results.append(result)
                
                # Keep track of the best frame
                if result["success"] and result.get("confidence", 0) > best_confidence:
                    best_confidence = result["confidence"]
                    best_frame = frame.copy()
            
            frame_count += 1
            
            # Don't process too many frames
            if frame_count > 100:
                break
        
        cap.release()
        
        # Calculate overall result
        successes = [r["success"] for r in results]
        confidence_values = [r.get("confidence", 0) for r in results if r["success"]]
        
        success_rate = sum(successes) / len(results) if results else 0
        avg_confidence = sum(confidence_values) / len(confidence_values) if confidence_values else 0
        
        # Overall success is true if more than 70% of frames had faces detected
        # with an average confidence of at least 0.7
        overall_success = success_rate > 0.7 and avg_confidence > 0.7
        
        # Save the best frame to the database if requested
        if overall_success and save_to_db and user_id and best_frame is not None:
            face_id = save_face_to_db(best_frame, user_id)
        
        return {
            "success": overall_success,
            "confidence": float(avg_confidence),
            "frames_processed": len(results),
            "success_rate": float(success_rate),
            "face_id": face_id,
            "message": "Video analysis complete"
        }
    
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        return {
            "success": False,
            "confidence": 0.0,
            "message": f"Video processing error: {str(e)}"
        }

# API Endpoints
@app.get("/")
def read_root():
    return {
        "service": "Face Verification API",
        "status": "running",
        "deepface_available": DEEPFACE_AVAILABLE
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Face Verification API",
        "deepface_available": DEEPFACE_AVAILABLE,
        "version": "1.0.0"
    }

@app.get("/api/verification/status")
def verification_status():
    return {
        "status": "online",
        "deepface_available": DEEPFACE_AVAILABLE,
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/verification/face")
async def verify_face_image(
    request: Dict[str, Any]
):
    """
    Verify a face from a base64 encoded image using embeddings for better accuracy
    """
    try:
        image_data = request.get("image")
        user_id = request.get("userId")
        save_to_db = request.get("saveToDb", False)
        use_basic = request.get("useBasicDetection", False)
        use_embeddings = request.get("useEmbeddings", True)
        request_id = request.get("requestId")
        
        if not image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        # Log request with ID for debugging
        log_prefix = f"[{request_id}] " if request_id else ""
        logger.info(f"{log_prefix}Face verification request received - embeddings: {use_embeddings}, basic: {use_basic}")
        
        # Choose verification method based on capabilities and request
        if use_embeddings and EMBEDDINGS_AVAILABLE and user_id:
            logger.info(f"{log_prefix}Using embedding-based face verification")
            
            # Load stored embeddings for this user (placeholder for now)
            stored_embeddings = []  # TODO: Load from database
            
            result = verify_face_with_embeddings(image_data, stored_embeddings)
            
            # If this is a new face and we should save it, extract and store the embedding
            if save_to_db and result.get("success") and not result.get("matched"):
                embedding = extract_face_embedding(image_data)
                if embedding is not None:
                    face_id = save_face_to_db(image_data, user_id)
                    result["face_id"] = face_id
                    result["embedding_saved"] = True
                    logger.info(f"{log_prefix}Saved new face embedding for user {user_id}")
                    
        elif use_basic or not DEEPFACE_AVAILABLE:
            logger.info(f"{log_prefix}Using basic face detection")
            result = detect_faces_basic(image_data)
        else:
            logger.info(f"{log_prefix}Using DeepFace for verification")
            result = verify_with_deepface(image_data)
        
        # Save face to database if requested and verification successful
        if result["success"] and save_to_db and user_id:
            face_id = save_face_to_db(image_data, user_id)
            result["face_id"] = face_id
            logger.info(f"{log_prefix}Face saved to database with ID: {face_id}")
        
        # Add request ID to response if provided
        if request_id:
            result["request_id"] = request_id
            
        return JSONResponse(content=result)
    
    except Exception as e:
        logger.error(f"Error in face verification: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": f"Server error: {str(e)}",
                "request_id": request.get("requestId")
            }
        )

@app.post("/api/verification/video")
async def verify_face_video(
    video_file: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    save_to_db: bool = Form(False),
    request_id: Optional[str] = Form(None),
    background_tasks: BackgroundTasks = None
):
    """
    Verify a face from a video file
    """
    try:
        # Log request with ID for debugging
        log_prefix = f"[{request_id}] " if request_id else ""
        logger.info(f"{log_prefix}Video verification request received")
        
        # Save uploaded file to a temporary location
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
        temp_path = temp_file.name
        temp_file.close()
        
        with open(temp_path, "wb") as buffer:
            buffer.write(await video_file.read())
        
        # Process video frames
        result = process_video_frames(
            video_path=temp_path,
            user_id=user_id,
            save_to_db=save_to_db
        )
        
        # Clean up the temporary file
        if background_tasks:
            background_tasks.add_task(os.unlink, temp_path)
        else:
            os.unlink(temp_path)
        
        # Add request ID to response if provided
        if request_id:
            result["request_id"] = request_id
            
        logger.info(f"{log_prefix}Video verification completed: {result['success']}")
        return JSONResponse(content=result)
    
    except Exception as e:
        logger.error(f"Error in video verification: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": f"Server error: {str(e)}",
                "request_id": request_id
            }
        )

@app.get("/api/faces/{user_id}")
async def list_user_faces(user_id: str):
    """
    List all faces stored for a user
    """
    try:
        user_dir = os.path.join("face_db", user_id)
        
        if not os.path.exists(user_dir):
            return {"faces": []}
        
        faces = []
        for filename in os.listdir(user_dir):
            if filename.endswith(".json"):
                with open(os.path.join(user_dir, filename), "r") as f:
                    metadata = json.load(f)
                    faces.append(metadata)
        
        return {"faces": faces}
    
    except Exception as e:
        logger.error(f"Error listing user faces: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"Server error: {str(e)}"}
        )

@app.delete("/api/faces/{user_id}/{face_id}")
async def delete_face(user_id: str, face_id: str):
    """
    Delete a face from the database
    """
    try:
        user_dir = os.path.join("face_db", user_id)
        
        if not os.path.exists(user_dir):
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check for metadata file
        metadata_path = os.path.join(user_dir, f"{face_id}.json")
        if not os.path.exists(metadata_path):
            raise HTTPException(status_code=404, detail="Face not found")
        
        # Delete metadata and image files
        os.unlink(metadata_path)
        
        image_path = os.path.join(user_dir, f"{face_id}.jpg")
        if os.path.exists(image_path):
            os.unlink(image_path)
        
        return {"status": "success", "message": "Face deleted"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting face: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": f"Server error: {str(e)}"}
        )

# For testing/development only
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")