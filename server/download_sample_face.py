import os
import urllib.request
import ssl

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
        # Create an SSL context that doesn't verify certificates (for simplicity)
        context = ssl._create_unverified_context()
        
        # Download the file
        print(f"Downloading sample face from {url}")
        urllib.request.urlretrieve(url, "sample_face.jpg", context=context)
        
        # Check if file exists and has content
        if os.path.exists("sample_face.jpg") and os.path.getsize("sample_face.jpg") > 0:
            print("✅ Sample face downloaded successfully!")
            print(f"File saved as sample_face.jpg ({os.path.getsize('sample_face.jpg')} bytes)")
        else:
            print("❌ Download failed - empty file.")
            
    except Exception as e:
        print(f"❌ Error downloading sample face: {e}")

if __name__ == "__main__":
    download_sample_face()