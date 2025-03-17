import os
import sys
import cv2
import numpy as np
from deepface import DeepFace

def test_basic_face_detection():
    """Basic test to ensure face detection is working"""
    print("=== Basic Face Detection Test ===")
    
    # Check if we have a sample face
    if os.path.exists("sample_face.jpg"):
        print("Found sample_face.jpg - testing face detection")
        
        try:
            # Load the image
            img = cv2.imread("sample_face.jpg")
            if img is None:
                print("❌ Failed to load sample image")
                return False
                
            # Basic OpenCV face detection
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) > 0:
                print(f"✅ Detected {len(faces)} face(s) using OpenCV")
                
                # Get the largest face
                max_area = 0
                max_face = None
                for (x, y, w, h) in faces:
                    if w*h > max_area:
                        max_area = w*h
                        max_face = (x, y, w, h)
                
                # Get face dimensions
                x, y, w, h = max_face
                face_img = img[y:y+h, x:x+w]
                
                # Save the detected face
                cv2.imwrite("detected_face.jpg", face_img)
                print(f"✅ Saved detected face to detected_face.jpg")
                
                # Try basic DeepFace analyze 
                try:
                    print("\nAttempting DeepFace simple analysis...")
                    results = DeepFace.analyze(
                        img_path=face_img,
                        actions=['age'],  # Just get age to keep it fast
                        enforce_detection=False,
                        detector_backend='opencv'
                    )
                    
                    if isinstance(results, list) and len(results) > 0:
                        print(f"✅ DeepFace analysis successful")
                        print(f"Estimated age: {results[0].get('age')}")
                    else:
                        print("❌ DeepFace analysis returned no results")
                except Exception as e:
                    print(f"❌ DeepFace analysis error: {str(e)}")
                
                return True
            else:
                print("❌ No faces detected")
                return False
        except Exception as e:
            print(f"❌ Error during face detection: {str(e)}")
            return False
    else:
        print("❌ Sample face not found. Run ./test_deepface.sh first to download a sample face.")
        return False

if __name__ == "__main__":
    test_basic_face_detection()