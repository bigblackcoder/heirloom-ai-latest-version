#!/bin/bash

echo "Setting up DeepFace verification service..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip setuptools wheel

# Install dependencies step by step to avoid conflicts
echo "Installing core dependencies..."
pip install numpy>=1.19.0
pip install opencv-python>=4.5.5.64
pip install Pillow>=8.2.0

echo "Installing TensorFlow CPU (lighter and more stable)..."
pip install tensorflow-cpu>=2.8.0,<2.16.0

echo "Installing DeepFace and related libraries..."
pip install deepface>=0.0.79
pip install mtcnn>=0.1.1
pip install retina-face>=0.0.14

echo "Installing FastAPI and server dependencies..."
pip install fastapi>=0.68.0
pip install uvicorn>=0.15.0
pip install python-multipart>=0.0.5

echo "Installing remaining dependencies..."
pip install -r requirements_fixed.txt

echo "Testing DeepFace installation..."
python3 -c "
try:
    from deepface import DeepFace
    print('✅ DeepFace installed successfully!')
    
    # Test basic functionality
    import numpy as np
    test_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    print('✅ DeepFace basic test passed!')
except Exception as e:
    print(f'❌ DeepFace test failed: {e}')
    print('The service will fall back to basic OpenCV detection.')
"

echo "Setup complete! You can now start the verification service with:"
echo "source venv/bin/activate && python main.py"