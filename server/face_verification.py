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
        
        # Save temporarily for verification
        temp_path = "temp_face.jpg"
        cv2.imwrite(temp_path, img)
        
        # Analyze face
        results = DeepFace.analyze(img_path=temp_path, 
                                  actions=['age', 'gender', 'race', 'emotion'],
                                  detector_backend='retinaface')
        
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        # If we got results, it means a face was detected
        if isinstance(results, list) and len(results) > 0:
            result = results[0]
            # Calculate confidence based on face detection
            confidence = result.get('face_confidence', 0.75) * 100  # Default to 75% if not available
            
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
                "success": False,
                "confidence": 0,
                "message": "No face detected in the image"
            }
            
    except Exception as e:
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