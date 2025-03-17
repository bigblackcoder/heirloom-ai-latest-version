#!/usr/bin/env python3
import os
import sys
import cv2
import numpy as np

def detect_face(image_path):
    """Detect a face in the image and return the face region"""
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return None
        
    # Load the image
    img = cv2.imread(image_path)
    if img is None:
        print(f"❌ Failed to load image: {image_path}")
        return None
        
    # Basic OpenCV face detection
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    if len(faces) == 0:
        print(f"❌ No faces detected in {image_path}")
        return None
        
    # Get the largest face
    max_area = 0
    max_face = None
    for (x, y, w, h) in faces:
        if w*h > max_area:
            max_area = w*h
            max_face = (x, y, w, h)
    
    # Extract face region
    x, y, w, h = max_face
    face_img = img[y:y+h, x:x+w]
    
    # Return the detected face
    return face_img

def compare_faces(img1_path, img2_path):
    """Compare two face images using simple histogram comparison"""
    # Detect faces
    face1 = detect_face(img1_path)
    face2 = detect_face(img2_path)
    
    if face1 is None or face2 is None:
        print("❌ Face detection failed for one or both images")
        return False, 0
    
    # Resize faces to same size for comparison
    face1 = cv2.resize(face1, (128, 128))
    face2 = cv2.resize(face2, (128, 128))
    
    # Convert to grayscale
    face1_gray = cv2.cvtColor(face1, cv2.COLOR_BGR2GRAY)
    face2_gray = cv2.cvtColor(face2, cv2.COLOR_BGR2GRAY)
    
    # Calculate histograms
    hist1 = cv2.calcHist([face1_gray], [0], None, [256], [0, 256])
    hist2 = cv2.calcHist([face2_gray], [0], None, [256], [0, 256])
    
    # Normalize histograms
    cv2.normalize(hist1, hist1, 0, 1, cv2.NORM_MINMAX)
    cv2.normalize(hist2, hist2, 0, 1, cv2.NORM_MINMAX)
    
    # Compare histograms
    similarity = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
    
    # Determine if same person based on similarity threshold
    threshold = 0.7  # Can be adjusted
    is_same_person = similarity >= threshold
    
    # Scale similarity to percentage
    confidence = similarity * 100
    
    return is_same_person, confidence

def test_simple_compare():
    """Test face comparison with a simple method"""
    print("\n=== Simple Face Comparison Test ===")
    
    # Test 1: Same person (should be similar)
    if os.path.exists("img1.jpg") and os.path.exists("img2.jpg"):
        print("\nTest 1: Comparing same person (img1.jpg vs img2.jpg)")
        is_same, confidence = compare_faces("img1.jpg", "img2.jpg")
        print(f"Same person: {'✅ Yes' if is_same else '❌ No'}")
        print(f"Confidence: {confidence:.2f}%")
    else:
        print("\n❌ Test images not found for Test 1")
    
    # Test 2: Different people (should be different)
    if os.path.exists("img1.jpg") and os.path.exists("img3.jpg"):
        print("\nTest 2: Comparing different people (img1.jpg vs img3.jpg)")
        is_same, confidence = compare_faces("img1.jpg", "img3.jpg")
        print(f"Same person: {'✅ Yes' if is_same else '❌ No'}")
        print(f"Confidence: {confidence:.2f}%")
    else:
        print("\n❌ Test images not found for Test 2")
    
    # Test 3: Compare with detected face
    if os.path.exists("sample_face.jpg") and os.path.exists("detected_face.jpg"):
        print("\nTest 3: Comparing original vs detected (sample_face.jpg vs detected_face.jpg)")
        is_same, confidence = compare_faces("sample_face.jpg", "detected_face.jpg")
        print(f"Same person: {'✅ Yes' if is_same else '❌ No'}")
        print(f"Confidence: {confidence:.2f}%")
    else:
        print("\n❌ Test images not found for Test 3")

if __name__ == "__main__":
    test_simple_compare()