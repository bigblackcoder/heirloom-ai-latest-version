#!/usr/bin/env python3
import os
import sys
import requests

def download_sample_face():
    """
    Downloads a sample face image for testing face verification.
    Uses a Creative Commons licensed image.
    """
    # URL for a sample face (from the DeepFace repository)
    url = "https://raw.githubusercontent.com/serengil/deepface/master/tests/dataset/img1.jpg"
    output_path = "sample_face.jpg"
    
    print(f"Downloading sample face from: {url}")
    
    try:
        # Create a session with relaxed SSL verification for test environments
        session = requests.Session()
        session.verify = False
        
        # Download the image
        response = session.get(url)
        
        if response.status_code == 200:
            # Save to file
            with open(output_path, "wb") as f:
                f.write(response.content)
            
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                print(f"✅ Sample face downloaded successfully as {output_path} ({os.path.getsize(output_path)} bytes)")
                return True
            else:
                print(f"❌ Failed to save sample face")
        else:
            print(f"❌ Failed to download sample face - HTTP status code: {response.status_code}")
    
    except Exception as e:
        print(f"❌ Error downloading sample face: {e}")
    
    return False

if __name__ == "__main__":
    # Disable SSL warnings for test environments
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    print("=== Downloading Sample Face for Testing ===")
    success = download_sample_face()
    
    if success:
        print("\nSample face is ready for testing!")
    else:
        print("\nFailed to download sample face.")
        sys.exit(1)