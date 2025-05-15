#!/bin/bash
# Script to start the FastAPI verification service

# Set environment variables
export PORT=8000

# Create required directories
mkdir -p face_db
mkdir -p verification_service/temp

# Start the uvicorn server
uvicorn verification_service.main:app --host 0.0.0.0 --port $PORT --reload