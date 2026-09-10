"""
interview_service.py

Service layer for managing interview sessions.

This file sits between the AI graph and the database.

Responsibilities:
- User management
- Interview session management
- Conversation persistence
- Feedback persistence
"""

from sqlalchemy.orm import Session

from app.database.crud import (
    create_user,
    get_user_by_email,
    create_interview_session,
    save_conversation,
    save_feedback,
    create_memory,
    get_user_memories,
    update_memory,
)

# ==========================================================
# User
# ==========================================================

def get_or_create_user(
    db: Session,
    name: str,
    email: str,
    password: str,
):
    """
    Returns an existing user or creates one.
    """

    user = get_user_by_email(db, email)

    if user:
        return user

    return create_user(
        db=db,
        name=name,
        email=email,
        password=password,
    )


# ==========================================================
# Interview Session
# ==========================================================

def start_interview(
    db: Session,
    user_id: int,
    company: str,
    role: str,
):
    """
    Creates a new interview session.
    """

    return create_interview_session(
        db=db,
        user_id=user_id,
        company=company,
        role=role,
    )


# ==========================================================
# Conversation
# ==========================================================

def save_interview_turn(
    db: Session,
    interview_id: int,
    conversation_turn,
):
    """
    Saves one interview interaction.
    """

    return save_conversation(
        db=db,
        interview_id=interview_id,
        question=conversation_turn.question,
        answer=conversation_turn.answer,
        topic=conversation_turn.topic,
        difficulty=conversation_turn.difficulty,
        score=conversation_turn.score,
        evaluation=conversation_turn.evaluation,
    )


# ==========================================================
# Feedback
# ==========================================================

def finish_interview(
    db: Session,
    interview_id: int,
    feedback,
):
    """
    Saves final interview feedback.
    """

    return save_feedback(
        db=db,
        interview_id=interview_id,
        overall_score=feedback.overall_score,
        strengths="\n".join(feedback.strengths),
        weaknesses="\n".join(feedback.weaknesses),
        recommendations="\n".join(
            feedback.recommendations
        ),
        summary=feedback.summary,
    )

# ==========================================================
# Candidate Memory
# ==========================================================

def save_candidate_memory(
    db: Session,
    user_id: int,
    memory: str,
    category: str,
    subcategory: str = None,
    importance: int = 5,
    confidence: float = 0.5,
    evidence: str = None,
):
    """
    Saves a long-term candidate memory.
    """

    return create_memory(
        db=db,
        user_id=user_id,
        memory=memory,
        category=category,
        subcategory=subcategory,
        importance=importance,
        confidence=confidence,
        evidence=evidence,
    )


def get_candidate_memories(
    db: Session,
    user_id: int,
):
    """
    Retrieves all long-term memories for a user.
    """

    return get_user_memories(
        db=db,
        user_id=user_id,
    )


def update_candidate_memory(
    db: Session,
    memory_id: int,
    user_id: int,
    memory: str,
    category: str,
    subcategory: str = None,
    importance: int = 5,
    confidence: float = 0.5,
    evidence: str = None,
):
    """
    Updates an existing long-term candidate memory.
    """

    return update_memory(
        db=db,
        memory_id=memory_id,
        user_id=user_id,
        memory=memory,
        category=category,
        subcategory=subcategory,
        importance=importance,
        confidence=confidence,
        evidence=evidence,
    )