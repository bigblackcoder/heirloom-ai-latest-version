import os
import base64
import json
import sys
import traceback
import numpy as np
import cv2
from deepface import DeepFace

def decode_base64_image(base64_data):
    """Decode a base64 image to a numpy array."""
    # Remove data:image/jpeg;base64, prefix if present
    if ',' in base64_data:
        base64_data = base64_data.split(',')[1]
    
    # Decode the base64 string
    img_data = base64.b64decode(base64_data)
    
    # Convert to numpy array
    nparr = np.frombuffer(img_data, np.uint8)
    
    # Decode image
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def verify_face(image_data):
    """Verify if the image contains a real human face and return confidence score."""
    try:
        # Decode base64 image
        img = decode_base64_image(image_data)
        
        if img is None or img.size == 0:
            return {
                "success": False,
                "confidence": 0,
                "message": "Invalid image data received"
            }
        
        # Save temporarily for verification
        temp_path = os.path.join(os.getcwd(), "temp_face.jpg")
        cv2.imwrite(temp_path, img)
        
        # Simple face detection first for faster performance
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            # No face detected by the faster method
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return {
                "success": False,
                "confidence": 0,
                "message": "No face detected - please center your face in the frame"
            }
        
        # Get the largest face detected
        max_area = 0
        max_face = None
        for (x, y, w, h) in faces:
            if w*h > max_area:
                max_area = w*h
                max_face = (x, y, w, h)
        
        x, y, w, h = max_face
        face_img = img[y:y+h, x:x+w]
        
        # Calculate basic alignment score (center of frame)
        img_height, img_width = img.shape[:2]
        face_center_x = x + w/2
        face_center_y = y + h/2
        img_center_x = img_width/2
        img_center_y = img_height/2
        
        # Distance from center (0-1 where 0 is perfect)
        dx = abs(face_center_x - img_center_x) / (img_width/2)
        dy = abs(face_center_y - img_center_y) / (img_height/2)
        
        # Alignment score (0-100 where 100 is perfect)
        alignment = (1 - max(dx, dy)) * 100
        
        # Now use DeepFace for detailed analysis (if alignment is reasonable)
        if alignment > 40:  # Only run deep analysis if basic alignment is ok
            try:
                # Use img array directly instead of a temp file path
                results = DeepFace.analyze(img_path=img, 
                                      actions=['age', 'gender', 'race', 'emotion'],
                                      detector_backend='opencv',  # Use faster detector
                                      enforce_detection=False)  # Continue even if face detector struggles
                
                # Clean up temp file
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                
                # If we got results, it means a face was detected
                if isinstance(results, list) and len(results) > 0:
                    result = results[0]
                    # Calculate confidence based on face detection and alignment
                    confidence = min(result.get('face_confidence', 0.75) * 100, alignment)  
                    
                    return {
                        "success": True,
                        "confidence": confidence,
                        "results": {
                            "age": result.get("age"),
                            "gender": result.get("gender"),
                            "dominant_race": result.get("dominant_race"),
                            "dominant_emotion": result.get("dominant_emotion")
                        }
                    }
                else:
                    return {
                        "success": True,  # We already found a face with OpenCV
                        "confidence": alignment * 0.8,  # Lower confidence without deep analysis
                        "message": "Basic face detection only"
                    }
            except Exception as deep_error:
                # If DeepFace fails, return the basic face detection result
                print(f"DeepFace analysis error: {str(deep_error)}")
                return {
                    "success": True,  # We already found a face with OpenCV
                    "confidence": alignment * 0.7,  # Lower confidence with error
                    "message": "Simplified face detection used"
                }
        else:
            # Face not centered enough
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return {
                "success": True,  # We did find a face, just not well aligned
                "confidence": alignment * 0.5,
                "message": "Face detected but not centered - please look directly at camera"
            }
            
    except Exception as e:
        # Clean up temp file in case of error
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
            
        error_details = traceback.format_exc()
        return {
            "success": False,
            "confidence": 0,
            "message": f"Error during face verification: {str(e)}",
            "details": error_details
        }

if __name__ == "__main__":
    # Read input from stdin (sent from Node.js)
    input_data = sys.stdin.read()
    
    try:
        # Parse the JSON input
        data = json.loads(input_data)
        image_data = data.get('image')
        
        if not image_data:
            result = {
                "success": False,
                "message": "No image data provided"
            }
        else:
            result = verify_face(image_data)
            
        # Send the result back as JSON
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "message": f"Error processing request: {str(e)}",
            "details": traceback.format_exc()
        }
        print(json.dumps(error_result))