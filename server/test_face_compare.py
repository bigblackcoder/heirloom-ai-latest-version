import os
import sys
import base64
import json
import numpy as np
import cv2
from deepface import DeepFace

def download_sample_faces(output_dir="."):
    """Download sample faces for comparison testing"""
    import requests
    
    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Sample images from DeepFace repo
    urls = {
        "img1.jpg": "https://raw.githubusercontent.com/serengil/deepface/master/tests/dataset/img1.jpg",
        "img2.jpg": "https://raw.githubusercontent.com/serengil/deepface/master/tests/dataset/img2.jpg", # Same person as img1
        "img3.jpg": "https://raw.githubusercontent.com/serengil/deepface/master/tests/dataset/img3.jpg"  # Different person
    }
    
    # Download each image
    downloaded_files = []
    for filename, url in urls.items():
        output_path = os.path.join(output_dir, filename)
        
        try:
            # Download file
            print(f"Downloading {filename} from {url}")
            response = requests.get(url, verify=False)
            
            if response.status_code == 200:
                # Save file
                with open(output_path, "wb") as f:
                    f.write(response.content)
                
                if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                    print(f"✅ {filename} downloaded successfully ({os.path.getsize(output_path)} bytes)")
                    downloaded_files.append(output_path)
                else:
                    print(f"❌ Failed to save {filename}")
            else:
                print(f"❌ Failed to download {filename} - HTTP status code: {response.status_code}")
        
        except Exception as e:
            print(f"❌ Error downloading {filename}: {e}")
    
    return downloaded_files

def test_face_verification():
    """Test face verification using DeepFace.verify"""
    # First, download the sample faces
    print("\n=== Downloading Sample Faces ===")
    download_sample_faces()
    
    # Now test verification
    print("\n=== Testing Face Verification ===")
    
    try:
        # Test 1: Same person (should return verified=True)
        print("\nTest 1: Comparing same person (img1.jpg vs img2.jpg)")
        result = DeepFace.verify(
            img1_path="img1.jpg", 
            img2_path="img2.jpg",
            enforce_detection=False,
            model_name="VGG-Face"
        )
        print(f"Verification result: {result}")
        print(f"Same person: {'✅ Yes' if result['verified'] else '❌ No'}")
        print(f"Distance: {result['distance']:.4f} (threshold: {result['threshold']:.4f})")
        
        # Test 2: Different people (should return verified=False)
        print("\nTest 2: Comparing different people (img1.jpg vs img3.jpg)")
        result = DeepFace.verify(
            img1_path="img1.jpg", 
            img2_path="img3.jpg",
            enforce_detection=False,
            model_name="VGG-Face"
        )
        print(f"Verification result: {result}")
        print(f"Same person: {'✅ Yes' if result['verified'] else '❌ No'}")
        print(f"Distance: {result['distance']:.4f} (threshold: {result['threshold']:.4f})")
        
        # Test 3: Using numpy arrays
        print("\nTest 3: Comparing using numpy arrays")
        img1 = cv2.imread("img1.jpg")
        img2 = cv2.imread("img2.jpg")
        
        if img1 is not None and img2 is not None:
            result = DeepFace.verify(
                img1_path=img1, 
                img2_path=img2,
                enforce_detection=False,
                model_name="VGG-Face"
            )
            print(f"Verification result: {result}")
            print(f"Same person: {'✅ Yes' if result['verified'] else '❌ No'}")
            print(f"Distance: {result['distance']:.4f} (threshold: {result['threshold']:.4f})")
        else:
            print("❌ Failed to load images as numpy arrays")
        
    except Exception as e:
        import traceback
        print(f"❌ Error during face verification: {e}")
        print(traceback.format_exc())

if __name__ == "__main__":
    test_face_verification()