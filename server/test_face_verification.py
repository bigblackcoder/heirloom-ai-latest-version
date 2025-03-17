#!/usr/bin/env python3
import os
import sys
import json
import requests
import base64
import numpy as np
import cv2

def load_test_image(image_path="sample_face.jpg"):
    """Load a test image and convert it to base64"""
    if not os.path.exists(image_path):
        print(f"❌ Test image not found: {image_path}")
        sys.exit(1)
        
    with open(image_path, "rb") as f:
        image_data = f.read()
        
    return base64.b64encode(image_data).decode('utf-8')

def test_verification_api():
    """Test the face verification API endpoint"""
    print("\n=== Testing Face Verification API ===")
    
    # Load test image
    image_data = load_test_image()
    print(f"✅ Loaded test image (length: {len(image_data)} chars)")
    
    # Prepare data for API call
    url = "http://localhost:5000/api/verification/face"
    payload = {
        "image": f"data:image/jpeg;base64,{image_data}"
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    print(f"Making API request to {url}")
    try:
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print(f"\nAPI Response: {json.dumps(result, indent=2)}")
            
            if result.get('success', False):
                print("✅ Face verification successful!")
                confidence = result.get('confidence', 0)
                print(f"Confidence: {confidence:.2f}%")
                
                # Print any additional results
                if result.get('results'):
                    print("\nAdditional Results:")
                    results = result['results']
                    for key, value in results.items():
                        print(f"  {key}: {value}")
            else:
                print(f"❌ Face verification failed: {result.get('message', 'Unknown error')}")
        else:
            print(f"❌ API request failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
    
    except Exception as e:
        print(f"❌ Error testing verification API: {str(e)}")

if __name__ == "__main__":
    test_verification_api()