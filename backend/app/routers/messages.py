from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_, or_, desc, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime

from ..database import get_db
from ..models import User, UserRole, Chat, Message, JobSeekerProfile, KindergartenEmployer, Kindergarten
from ..schemas import ChatOut, MessageOut, MessageCreate
from ..auth import get_current_user

router = APIRouter(prefix="/chats", tags=["Messages"])

@router.get("", response_model=List[ChatOut])
async def get_my_chats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all chats for the current user."""
    query = select(Chat).options(
        selectinload(Chat.job_seeker),
        selectinload(Chat.kindergarten)
    )
    
    if current_user.role == UserRole.JOB_SEEKER:
        # Get JobSeekerProfile id
        prof_res = await db.execute(select(JobSeekerProfile.id).where(JobSeekerProfile.user_id == current_user.id))
        profile_id = prof_res.scalar_one_or_none()
        query = query.where(Chat.job_seeker_id == profile_id)
    elif current_user.role == UserRole.KINDERGARTEN_EMPLOYER:
        # Get Kindergarten id
        emp_res = await db.execute(select(KindergartenEmployer.kindergarten_id).where(KindergartenEmployer.user_id == current_user.id))
        kindergarten_id = emp_res.scalar_one_or_none()
        query = query.where(Chat.kindergarten_id == kindergarten_id)
    else:
        return []

    result = await db.execute(query.order_by(desc(Chat.last_message_at)))
    chats = result.scalars().all()
    
    # Format response with other party info
    response = []
    for chat in chats:
        c_dict = chat.__dict__.copy()
        if current_user.role == UserRole.JOB_SEEKER:
            c_dict["other_party_name"] = chat.kindergarten.name
            c_dict["other_party_photo"] = chat.kindergarten.logo_url
            c_dict["unread_count"] = chat.unread_by_seeker
        else:
            c_dict["other_party_name"] = chat.job_seeker.full_name
            c_dict["other_party_photo"] = chat.job_seeker.photo_url
            c_dict["unread_count"] = chat.unread_by_employer
        response.append(c_dict)
    
    return response

@router.get("/{chat_id}", response_model=List[MessageOut])
async def get_chat_messages(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get messages for a specific chat."""
    # Authenticate chat ownership
    chat_res = await db.execute(select(Chat).where(Chat.id == chat_id))
    chat = chat_res.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Verify user belongs to chat
    if current_user.role == UserRole.JOB_SEEKER:
        prof_res = await db.execute(select(JobSeekerProfile.id).where(JobSeekerProfile.user_id == current_user.id))
        if chat.job_seeker_id != prof_res.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == UserRole.KINDERGARTEN_EMPLOYER:
        emp_res = await db.execute(select(KindergartenEmployer.kindergarten_id).where(KindergartenEmployer.user_id == current_user.id))
        if chat.kindergarten_id != emp_res.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Access denied")

    msg_result = await db.execute(select(Message).where(Message.chat_id == chat_id).order_by(Message.created_at))
    return msg_result.scalars().all()

@router.post("/{chat_id}/messages", response_model=MessageOut)
async def send_message(
    chat_id: int,
    msg_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message in a chat."""
    chat_res = await db.execute(select(Chat).where(Chat.id == chat_id))
    chat = chat_res.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    new_msg = Message(
        chat_id=chat_id,
        sender_id=current_user.id,
        content=msg_data.content
    )
    db.add(new_msg)
    
    # Update chat metadata
    chat.last_message = msg_data.content
    chat.last_message_at = datetime.now()
    if current_user.role == UserRole.JOB_SEEKER:
        chat.unread_by_employer += 1
    else:
        chat.unread_by_seeker += 1
        
    await db.commit()
    await db.refresh(new_msg)
    return new_msg

@router.patch("/{chat_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_chat_as_read(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark all messages in a chat as read."""
    if current_user.role == UserRole.JOB_SEEKER:
        await db.execute(update(Chat).where(Chat.id == chat_id).values(unread_by_seeker=0))
    else:
        await db.execute(update(Chat).where(Chat.id == chat_id).values(unread_by_employer=0))
    
    await db.execute(
        update(Message)
        .where(and_(Message.chat_id == chat_id, Message.sender_id != current_user.id))
        .values(is_read=True, read_at=datetime.now())
    )
    await db.commit()
    return None
