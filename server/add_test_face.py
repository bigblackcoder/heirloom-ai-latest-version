#!/usr/bin/env python3
"""
Script to add a test face to the database without using DeepFace.
This is useful for testing the database functionality when DeepFace is too resource-intensive.
"""

import os
import sys
import json
import uuid
import datetime
import base64
from pathlib import Path

def add_test_face(image_path, user_id):
    """
    Add a test face to the database without face recognition.
    
    Args:
        image_path: Path to the image file
        user_id: User ID to associate with this face
        
    Returns:
        face_id: The UUID of the created face record
    """
    # Generate a unique face ID
    face_id = str(uuid.uuid4())
    
    # Define the database directory
    db_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "face_db")
    
    # Ensure the database directory exists
    os.makedirs(db_dir, exist_ok=True)
    
    # Create a metadata record
    metadata = {
        "face_id": face_id,
        "user_id": str(user_id),
        "created_at": datetime.datetime.now().isoformat(),
        "image_path": image_path
    }
    
    # Save metadata to JSON file
    json_path = os.path.join(db_dir, f"{face_id}.json")
    with open(json_path, "w") as f:
        json.dump(metadata, f, indent=2)
    
    # Copy the image to the face database (optional)
    try:
        image_filename = os.path.join(db_dir, f"{face_id}.jpg")
        with open(image_path, "rb") as src, open(image_filename, "wb") as dest:
            dest.write(src.read())
    except Exception as e:
        print(f"Warning: Failed to copy image file: {e}")
    
    return face_id

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python add_test_face.py <image_path> <user_id>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    user_id = sys.argv[2]
    
    if not os.path.exists(image_path):
        print(f"Error: Image file '{image_path}' does not exist")
        sys.exit(1)
    
    face_id = add_test_face(image_path, user_id)
    print(f"Added test face with ID: {face_id} for user ID: {user_id}")
    
    # Run list_face_db.py to show the updated database
    os.system(f"{sys.executable} {os.path.join(os.path.dirname(__file__), 'list_face_db.py')}")