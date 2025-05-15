#!/bin/bash

# Start the Face Verification FastAPI service
echo "Starting Face Verification Service..."
cd "$(dirname "$0")"

# Check if uvicorn is available
if ! command -v uvicorn &> /dev/null; then
    echo "Error: uvicorn is not installed. Please install it with:"
    echo "pip install uvicorn"
    exit 1
fi

# Create face database directory if it doesn't exist
mkdir -p ../face_db

# Start the FastAPI service on port 8000
uvicorn main:app --host 0.0.0.0 --port 8000 --reload