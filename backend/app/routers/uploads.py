import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from ..auth import get_current_user
from ..models import User

router = APIRouter(prefix="/upload", tags=["Uploads"])

UPLOAD_DIR = "backend/static/uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "pdf", "doc", "docx"}

@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload a file or image and return the URL."""
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="File extension not allowed")

    # Generate unique filename
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

    # Return the relative URL
    return {"url": f"/static/uploads/{filename}"}
