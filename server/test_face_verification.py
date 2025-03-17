import os
import base64
import json
from face_verification import verify_face

def get_sample_image(image_path="sample_face.jpg"):
    """
    Load a sample face image for testing.
    If the file doesn't exist, it will use a built-in test pattern instead.
    """
    try:
        if os.path.exists(image_path):
            with open(image_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                return encoded_string
        else:
            # If no sample image, use a simple pattern (this won't pass as a real face)
            print(f"Sample image {image_path} not found. Using test pattern instead.")
            import numpy as np
            import cv2
            
            # Create a simple gradient test pattern
            img = np.zeros((300, 300, 3), dtype=np.uint8)
            cv2.circle(img, (150, 150), 100, (255, 255, 255), -1)  # Add a circle
            cv2.circle(img, (120, 120), 10, (0, 0, 0), -1)  # Left eye
            cv2.circle(img, (180, 120), 10, (0, 0, 0), -1)  # Right eye
            cv2.ellipse(img, (150, 170), (50, 20), 0, 0, 180, (0, 0, 0), 2)  # Mouth
            
            # Save the test pattern
            cv2.imwrite("test_pattern.jpg", img)
            
            with open("test_pattern.jpg", "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            return encoded_string
    except Exception as e:
        print(f"Error creating sample image: {e}")
        return None

def test_verification():
    """Run a test verification using a sample image."""
    # Get a sample image
    base64_image = get_sample_image()
    
    if not base64_image:
        print("Failed to get sample image")
        return
    
    # Run the verification
    result = verify_face(base64_image)
    
    # Output the result
    print("Verification Result:")
    print(json.dumps(result, indent=2))
    
    # Check if the verification was successful
    if result["success"]:
        print("\n✅ Face verification successful!")
        print(f"Confidence: {result['confidence']:.2f}%")
        if "results" in result:
            print("\nDetected Attributes:")
            for key, value in result["results"].items():
                print(f"- {key}: {value}")
    else:
        print("\n❌ Face verification failed!")
        print(f"Message: {result.get('message', 'Unknown error')}")

if __name__ == "__main__":
    test_verification()