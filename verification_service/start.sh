
#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Face Verification Service..."

# Use the virtual environment Python with all dependencies
./venv_deepface/bin/python main.py
