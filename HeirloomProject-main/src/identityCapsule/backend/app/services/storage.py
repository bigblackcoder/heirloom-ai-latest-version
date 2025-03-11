import os
import aiofiles
import magic
from fastapi import UploadFile, HTTPException
from app.core.config import settings
from typing import Optional
import uuid

class StorageService:
    def __init__(self):
        self.storage_path = settings.STORAGE_PATH
        os.makedirs(self.storage_path, exist_ok=True)
    
    async def save_image(self, file: UploadFile) -> Optional[str]:
        """Save an image file and return its URL"""
        try:
            # Read file content
            content = await file.read()
            
            # Verify file is an image
            mime = magic.Magic(mime=True)
            file_type = mime.from_buffer(content)
            if not file_type.startswith('image/'):
                raise HTTPException(
                    status_code=400,
                    detail="File must be an image"
                )
            
            # Generate unique filename
            file_ext = os.path.splitext(file.filename or "")[1]
            filename = f"{uuid.uuid4()}{file_ext}"
            filepath = os.path.join(self.storage_path, filename)
            
            # Save file
            async with aiofiles.open(filepath, 'wb') as f:
                await f.write(content)
            
            return filepath
            
        except Exception as e:
            print(f"Error saving file: {str(e)}")
            return None
    
    async def delete_image(self, filepath: str) -> bool:
        """Delete an image file"""
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                return True
            return False
        except Exception as e:
            print(f"Error deleting file: {str(e)}")
            return False
