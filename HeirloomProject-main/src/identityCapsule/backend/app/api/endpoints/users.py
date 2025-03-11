from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.api.endpoints.auth import get_current_user
from app.services.storage import StorageService
from app.services.face_verification import FaceVerificationService
from typing import Optional

router = APIRouter()
storage_service = StorageService()
face_service = FaceVerificationService()

@router.post("/users/upload-profile-image", response_model=UserResponse)
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a profile image for the current user"""
    # Save new image
    image_path = await storage_service.save_image(file)
    if not image_path:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save image"
        )
    
    # Delete old image if it exists
    profile_image_url = getattr(current_user, 'profile_image_url', None)
    if profile_image_url:
        await storage_service.delete_image(profile_image_url)
    
    # Update user profile
    current_user.profile_image_url = image_path
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.post("/users/verify-identity")
async def verify_identity(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Verify user's identity using facial recognition"""
    profile_image_url = getattr(current_user, 'profile_image_url', None)
    if not profile_image_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No profile image found. Please upload a profile image first."
        )
    
    # Save verification image temporarily
    verify_image_path = await storage_service.save_image(file)
    if not verify_image_path:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save verification image"
        )
    
    try:
        try:
            # Verify faces
            is_match, confidence = await face_service.verify_faces(
                current_user.profile_image_url,
                verify_image_path
            )
            
            # Clean up verification image
            await storage_service.delete_image(verify_image_path)
            
            return {
                "verified": bool(is_match),  # Ensure boolean
                "confidence": float(confidence),  # Ensure float
                "message": "Verification completed successfully"
            }
        except Exception as e:
            # Clean up on error
            await storage_service.delete_image(verify_image_path)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Face verification failed: {str(e)}"
            )
        
    except Exception as e:
        # Clean up on error
        await storage_service.delete_image(verify_image_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification failed: {str(e)}"
        )
