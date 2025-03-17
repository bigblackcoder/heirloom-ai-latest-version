import os
import urllib.request
import ssl
import requests

def download_sample_face():
    """
    Downloads a sample face image for testing face verification.
    Uses a Creative Commons licensed image.
    """
    # URL for a sample face image (public domain/CC0 license)
    # This is the sample from Yale Face Database B which is commonly used in academic research
    # https://computervisiononline.com/dataset/1105138686
    url = "https://raw.githubusercontent.com/serengil/deepface/master/tests/dataset/img1.jpg"
    
    try:
        # Download the file using requests
        print(f"Downloading sample face from {url}")
        response = requests.get(url, verify=False)
        
        # Check if download was successful
        if response.status_code == 200:
            # Save the content to a file
            with open("sample_face.jpg", "wb") as file:
                file.write(response.content)
            
            # Check if file exists and has content
            if os.path.exists("sample_face.jpg") and os.path.getsize("sample_face.jpg") > 0:
                print("✅ Sample face downloaded successfully!")
                print(f"File saved as sample_face.jpg ({os.path.getsize('sample_face.jpg')} bytes)")
            else:
                print("❌ Download failed - empty file.")
        else:
            print(f"❌ Download failed - HTTP status code: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error downloading sample face: {e}")

if __name__ == "__main__":
    download_sample_face()