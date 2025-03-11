import magic
import face_recognition
import os

def test_dependencies():
    print("Testing dependencies...")
    
    # Test libmagic
    try:
        mime = magic.Magic(mime=True)
        mime.from_buffer(b"test")
        print("✓ libmagic loaded successfully")
    except Exception as e:
        print(f"✗ libmagic error: {str(e)}")
        raise
    
    # Test face_recognition
    try:
        # Create a small test image
        test_image = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
        test_path = "test_image.png"
        with open(test_path, "wb") as f:
            f.write(test_image)
        
        # Try to load it
        face_recognition.load_image_file(test_path)
        print("✓ face_recognition loaded successfully")
        
        # Cleanup
        os.remove(test_path)
    except Exception as e:
        print(f"✗ face_recognition error: {str(e)}")
        if os.path.exists(test_path):
            os.remove(test_path)
        raise

if __name__ == "__main__":
    test_dependencies()
