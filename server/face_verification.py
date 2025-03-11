"""
Face verification script for the Heirloom Identity Platform.
This script uses basic image processing to verify if an image contains a face.
"""

import sys
import json
import base64
import random
import os
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

def decode_base64_image(base64_data):
    """Decode a base64 image to a PIL Image."""
    try:
        # Remove potential data URL prefix
        if "," in base64_data:
            base64_data = base64_data.split(",", 1)[1]
        
        # Decode base64 to bytes
        image_bytes = base64.b64decode(base64_data)
        
        # Convert bytes to image
        image = Image.open(BytesIO(image_bytes))
        return image
    except Exception as e:
        return None

def detect_face(image):
    """
    Very simple mock face detection.
    In a real system, this would use a proper face detection library.
    """
    # Get image dimensions
    width, height = image.size
    
    # Calculate center area (where a face would typically be in a selfie)
    center_x, center_y = width // 2, height // 2
    center_area = image.crop((
        center_x - width // 4, 
        center_y - height // 4,
        center_x + width // 4, 
        center_y + height // 4
    ))
    
    # Calculate average color in center area (very simplistic)
    avg_r, avg_g, avg_b = 0, 0, 0
    pixel_count = 0
    
    for x in range(center_area.width):
        for y in range(center_area.height):
            r, g, b = center_area.getpixel((x, y))[:3]
            avg_r += r
            avg_g += g
            avg_b += b
            pixel_count += 1
    
    if pixel_count > 0:
        avg_r //= pixel_count
        avg_g //= pixel_count
        avg_b //= pixel_count
    
    # Color variance - real face detection would be much more sophisticated
    # This just checks if there's some variation in the center area
    has_color_variation = (
        abs(avg_r - avg_g) > 10 or 
        abs(avg_r - avg_b) > 10 or 
        abs(avg_g - avg_b) > 10
    )
    
    # This is just a simulation - real face detection would be much more complex
    confidence = 0.85 if has_color_variation else 0.3
    success = confidence > 0.7
    
    return {
        "success": success,
        "confidence": confidence,
        "center_color": (avg_r, avg_g, avg_b)
    }

def get_face_attributes(image):
    """
    Simulate face attribute analysis.
    In a real system, this would use ML models to detect age, gender, etc.
    """
    # This would normally come from ML models
    return {
        "age": 28,
        "gender": "Man",
        "dominant_race": "caucasian",
        "dominant_emotion": "neutral"
    }

def verify_face(image_data):
    """Verify if the image contains a real human face and return confidence score."""
    try:
        # Decode the base64 image
        image = decode_base64_image(image_data)
        if image is None:
            return json.dumps({
                "success": False,
                "confidence": 0.0,
                "message": "Failed to decode image"
            })
        
        # Detect face in the image
        detection_result = detect_face(image)
        
        if detection_result["success"]:
            # Get face attributes (age, gender, etc.)
            attributes = get_face_attributes(image)
            
            return json.dumps({
                "success": True,
                "confidence": detection_result["confidence"],
                "message": "Face verification successful",
                "results": attributes
            })
        else:
            return json.dumps({
                "success": False,
                "confidence": detection_result["confidence"],
                "message": "No face detected in image"
            })
            
    except Exception as e:
        return json.dumps({
            "success": False,
            "confidence": 0.0,
            "message": "Verification error",
            "details": str(e)
        })

def generate_test_image(save_path="test_face.jpg", size=(300, 300)):
    """Generate a simple test image with a face-like structure"""
    try:
        # Create a blank image with skin-tone background
        image = Image.new('RGB', size, color=(233, 191, 155))
        draw = ImageDraw.Draw(image)
        
        width, height = size
        center_x, center_y = width // 2, height // 2
        
        # Draw face oval
        draw.ellipse(
            (center_x - width//3, center_y - height//3, 
             center_x + width//3, center_y + height//2.5), 
            fill=(233, 191, 155), outline=(203, 161, 125), width=2
        )
        
        # Draw eyes
        eye_width, eye_height = width // 10, height // 15
        draw.ellipse(
            (center_x - width//5 - eye_width//2, center_y - height//8 - eye_height//2,
             center_x - width//5 + eye_width//2, center_y - height//8 + eye_height//2),
            fill=(255, 255, 255), outline=(100, 100, 100)
        )
        draw.ellipse(
            (center_x + width//5 - eye_width//2, center_y - height//8 - eye_height//2,
             center_x + width//5 + eye_width//2, center_y - height//8 + eye_height//2),
            fill=(255, 255, 255), outline=(100, 100, 100)
        )
        
        # Draw pupils
        pupil_size = min(eye_width, eye_height) // 2
        draw.ellipse(
            (center_x - width//5 - pupil_size//2, center_y - height//8 - pupil_size//2,
             center_x - width//5 + pupil_size//2, center_y - height//8 + pupil_size//2),
            fill=(50, 50, 50)
        )
        draw.ellipse(
            (center_x + width//5 - pupil_size//2, center_y - height//8 - pupil_size//2,
             center_x + width//5 + pupil_size//2, center_y - height//8 + pupil_size//2),
            fill=(50, 50, 50)
        )
        
        # Draw mouth
        mouth_width = width // 4
        draw.arc(
            (center_x - mouth_width, center_y + height//8 - mouth_width//2,
             center_x + mouth_width, center_y + height//8 + mouth_width//2),
            start=0, end=180, fill=(150, 75, 75), width=2
        )
        
        # Draw nose
        draw.line(
            (center_x, center_y - height//10, center_x, center_y + height//20),
            fill=(203, 161, 125), width=2
        )
        draw.line(
            (center_x - width//20, center_y + height//20, 
             center_x + width//20, center_y + height//20),
            fill=(203, 161, 125), width=2
        )
        
        # Save the image
        image.save(save_path)
        print(f"Test image saved to {save_path}")
        return True
    except Exception as e:
        print(f"Error generating test image: {str(e)}")
        return False

if __name__ == "__main__":
    # Check if we should generate a test image
    if len(sys.argv) > 1 and sys.argv[1] == "--generate-test-image":
        generate_test_image()
    else:
        # Read base64 image data from stdin
        base64_data = sys.stdin.read().strip()
        
        # Process the image and print the result
        result = verify_face(base64_data)
        
        # Print the result as JSON string
        print(result)