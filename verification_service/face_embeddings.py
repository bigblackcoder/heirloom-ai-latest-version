#!/usr/bin/env python3
"""
Face embedding extraction and similarity matching
"""

import numpy as np
import cv2
import base64
from typing import List, Tuple, Optional, Dict, Any
import logging

logger = logging.getLogger("face-embeddings")

# Global flag for DeepFace availability
DEEPFACE_AVAILABLE = False

try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
    logger.info("DeepFace loaded for embedding extraction!")
except ImportError:
    logger.warning("DeepFace not available, using basic face detection")
    DEEPFACE_AVAILABLE = False

def extract_face_embedding(image_data: str, model_name: str = "VGG-Face") -> Optional[np.ndarray]:
    """
    Extract face embedding from image data
    
    Args:
        image_data: Base64 encoded image
        model_name: Model to use for embedding extraction
        
    Returns:
        Face embedding as numpy array or None if failed
    """
    if not DEEPFACE_AVAILABLE:
        logger.warning("DeepFace not available, cannot extract embeddings")
        return None
    
    try:
        # Decode base64 image
        if "base64," in image_data:
            image_data = image_data.split("base64,")[1]
        
        image_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if image is None:
            logger.error("Failed to decode image")
            return None
        
        # Extract embedding using DeepFace
        embedding = DeepFace.represent(
            img_path=image,
            model_name=model_name,
            enforce_detection=True
        )
        
        # DeepFace returns a list, get first embedding
        if isinstance(embedding, list) and len(embedding) > 0:
            embedding_vector = embedding[0]["embedding"]
            return np.array(embedding_vector, dtype=np.float32)
        
        return None
        
    except Exception as e:
        logger.error(f"Error extracting face embedding: {str(e)}")
        return None

def compute_similarity(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
    """
    Compute cosine similarity between two face embeddings
    
    Args:
        embedding1: First face embedding
        embedding2: Second face embedding
        
    Returns:
        Similarity score between 0 and 1
    """
    try:
        # Normalize vectors
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        # Compute cosine similarity
        similarity = np.dot(embedding1, embedding2) / (norm1 * norm2)
        
        # Convert to range [0, 1]
        similarity = (similarity + 1) / 2
        
        return float(similarity)
        
    except Exception as e:
        logger.error(f"Error computing similarity: {str(e)}")
        return 0.0

def find_best_match(query_embedding: np.ndarray, stored_embeddings: List[Tuple[str, np.ndarray]], threshold: float = 0.8) -> Optional[Tuple[str, float]]:
    """
    Find the best matching face from stored embeddings
    
    Args:
        query_embedding: Query face embedding
        stored_embeddings: List of (face_id, embedding) tuples
        threshold: Minimum similarity threshold
        
    Returns:
        (face_id, similarity) tuple of best match or None
    """
    best_match = None
    best_similarity = 0.0
    
    for face_id, stored_embedding in stored_embeddings:
        similarity = compute_similarity(query_embedding, stored_embedding)
        
        if similarity > best_similarity and similarity >= threshold:
            best_similarity = similarity
            best_match = (face_id, similarity)
    
    return best_match

def verify_face_with_embeddings(image_data: str, stored_embeddings: List[Tuple[str, np.ndarray]], threshold: float = 0.8) -> Dict[str, Any]:
    """
    Verify face using embedding comparison
    
    Args:
        image_data: Base64 encoded image
        stored_embeddings: List of stored face embeddings
        threshold: Similarity threshold for verification
        
    Returns:
        Verification result dictionary
    """
    try:
        # Extract embedding from input image
        query_embedding = extract_face_embedding(image_data)
        
        if query_embedding is None:
            return {
                "success": False,
                "confidence": 0.0,
                "message": "Failed to extract face embedding from image",
                "embedding_available": False
            }
        
        # Find best match
        match_result = find_best_match(query_embedding, stored_embeddings, threshold)
        
        if match_result:
            face_id, similarity = match_result
            return {
                "success": True,
                "confidence": float(similarity),
                "matched": True,
                "face_id": face_id,
                "message": f"Face matched with {similarity:.2%} confidence",
                "embedding_available": True,
                "embedding_dimensions": len(query_embedding)
            }
        else:
            return {
                "success": True,
                "confidence": 0.0,
                "matched": False,
                "message": "No matching face found above threshold",
                "embedding_available": True,
                "embedding_dimensions": len(query_embedding)
            }
            
    except Exception as e:
        logger.error(f"Error in face verification with embeddings: {str(e)}")
        return {
            "success": False,
            "confidence": 0.0,
            "message": f"Verification error: {str(e)}",
            "embedding_available": DEEPFACE_AVAILABLE
        }

def get_available_models() -> List[str]:
    """
    Get list of available face recognition models
    
    Returns:
        List of model names
    """
    if not DEEPFACE_AVAILABLE:
        return []
    
    return [
        "VGG-Face",
        "Facenet",
        "Facenet512", 
        "OpenFace",
        "DeepFace",
        "DeepID",
        "ArcFace",
        "Dlib",
        "SFace"
    ]