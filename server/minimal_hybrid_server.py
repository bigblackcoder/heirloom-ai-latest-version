
from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import uuid
import base64
import json
from datetime import datetime

app = Flask(__name__, template_folder='templates', static_folder='static')

# Create face_db directory if it doesn't exist
FACE_DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'face_db')
os.makedirs(FACE_DB_DIR, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['POST'])
def register():
    try:
        user_id = request.form.get('user_id')
        
        if not user_id:
            return jsonify({'success': False, 'error': 'User ID is required'})
        
        # Create user directory
        user_dir = os.path.join(FACE_DB_DIR, user_id)
        os.makedirs(user_dir, exist_ok=True)
        
        # Handle file upload
        if 'file' in request.files:
            file = request.files['file']
            if file.filename:
                face_id = str(uuid.uuid4())
                file_path = os.path.join(user_dir, f"{face_id}.jpg")
                file.save(file_path)
                
                # Save metadata
                metadata = {
                    'user_id': user_id,
                    'face_id': face_id,
                    'created_at': datetime.now().isoformat(),
                    'method': 'DeepFace'
                }
                
                with open(os.path.join(user_dir, f"{face_id}.json"), 'w') as f:
                    json.dump(metadata, f, indent=2)
                
                return jsonify({
                    'success': True,
                    'user_id': user_id,
                    'face_id': face_id,
                    'message': 'Face registered successfully'
                })
        
        return jsonify({'success': False, 'error': 'No file provided'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/verify', methods=['POST'])
def verify():
    try:
        user_id = request.form.get('user_id')
        
        if not user_id:
            return jsonify({'success': False, 'error': 'User ID is required'})
        
        # Check if user exists
        user_dir = os.path.join(FACE_DB_DIR, user_id)
        if not os.path.exists(user_dir):
            return jsonify({'success': False, 'error': 'User not found'})
        
        # Simulate verification with 80% success rate
        import random
        verified = random.random() < 0.8
        
        # Generate random distance and confidence
        distance = random.random() * 0.6 if verified else 0.7 + (random.random() * 0.3)
        confidence = 100 - (distance * 100)
        
        return jsonify({
            'success': True,
            'verified': verified,
            'method': 'DeepFace',
            'model': 'VGG-Face',
            'distance': distance,
            'threshold': 0.6,
            'confidence': confidence,
            'blockchain_data': {
                'verified': verified,
                'hitToken': f"0x{uuid.uuid4().hex[:16]}",
                'metadata': {
                    'verificationMethod': 'face',
                    'verificationTimestamp': datetime.now().isoformat()
                }
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/verify_native', methods=['POST'])
def verify_native():
    try:
        data = request.json
        user_id = data.get('user_id')
        platform = data.get('platform')
        
        if not user_id or not platform:
            return jsonify({'success': False, 'error': 'User ID and platform are required'})
        
        # Simulate native verification (always succeed in test)
        method = 'Apple FaceID' if platform == 'apple' else 'Google Biometric'
        
        return jsonify({
            'success': True,
            'verified': True,
            'method': method,
            'confidence': 95,
            'blockchain_data': {
                'verified': True,
                'hitToken': f"0x{uuid.uuid4().hex[:16]}",
                'metadata': {
                    'verificationMethod': platform,
                    'verificationTimestamp': datetime.now().isoformat()
                }
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/users', methods=['GET'])
def list_users():
    try:
        users = [d for d in os.listdir(FACE_DB_DIR) if os.path.isdir(os.path.join(FACE_DB_DIR, d))]
        return jsonify({'success': True, 'users': users})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/registered_faces/<user_id>.jpg')
def get_face_image(user_id):
    user_dir = os.path.join(FACE_DB_DIR, user_id)
    
    if not os.path.exists(user_dir):
        return "User not found", 404
    
    # Find first jpg file in user directory
    for file in os.listdir(user_dir):
        if file.endswith('.jpg'):
            return send_from_directory(user_dir, file)
    
    return "Face image not found", 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
