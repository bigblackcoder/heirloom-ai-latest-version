#!/usr/bin/env python3
"""
Simple script to list all face records in the face database.
Used for testing and verification purposes.
"""

import os
import json
import uuid
import glob

def list_face_database():
    """List all face records in the database."""
    
    # Define the database directory
    db_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "face_db")
    
    # Check if database directory exists
    if not os.path.exists(db_dir):
        print(f"Database directory '{db_dir}' does not exist. Creating it...")
        os.makedirs(db_dir, exist_ok=True)
        return []
    
    # List all JSON files in the database directory
    json_files = glob.glob(os.path.join(db_dir, "*.json"))
    
    # Read and return face metadata
    face_records = []
    for json_file in json_files:
        try:
            with open(json_file, "r") as f:
                record = json.load(f)
                # Add the file name as record ID
                record['file_name'] = os.path.basename(json_file)
                face_records.append(record)
        except Exception as e:
            print(f"Error reading {json_file}: {e}")
    
    return face_records

if __name__ == "__main__":
    # List all face records
    records = list_face_database()
    
    # Print a summary
    print(f"\nFace Database Summary: {len(records)} records found\n")
    
    # Print details for each record
    if records:
        for i, record in enumerate(records, 1):
            print(f"Record #{i}:")
            print(f"  Face ID: {record.get('face_id', 'Unknown')}")
            print(f"  User ID: {record.get('user_id', 'Unknown')}")
            print(f"  Created: {record.get('created_at', 'Unknown')}")
            print(f"  File: {record.get('file_name', 'Unknown')}")
            print()
    else:
        print("No face records found in the database.")