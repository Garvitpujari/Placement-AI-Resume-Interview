"""
session_service.py

Live Coding Session Service.

Responsibilities:
- Create a coding session.
- Store the selected problem.
- Store candidate/language/mode information.
- Store duration and question count.
- Provide basic session retrieval.
- Prepare the session for future code execution,
  snapshots, observations, dry runs, and feedback.

This module does NOT:
- Execute code.
- Analyze code.
- Generate interviewer questions.
- Evaluate optimization.
"""


from typing import Optional

from sqlalchemy.orm import Session

from app.coding.crud import (
    create_coding_session,
)

from app.database.models import (
    CodingSession,
)


# ==========================================================
# Create Coding Session
# ==========================================================

def start_coding_session(
    db: Session,
    user_id: int,
    problem_id: int,
    mode: str,
    company: Optional[str] = None,
    role: Optional[str] = None,
    language: str = "cpp",
    duration_minutes: Optional[int] = None,
    number_of_questions: Optional[int] = None,
):
    """
    Create and persist a new coding session.

    Example modes:

        mock_interview
        coding_contest
        practice

    Example languages:

        cpp
        python
    """

    print(
        "\n======================================"
    )
    print(
        "STARTING CODING SESSION"
    )
    print(
        "======================================"
    )

    print(
        f"User ID: {user_id}"
    )

    print(
        f"Problem ID: {problem_id}"
    )

    print(
        f"Mode: {mode}"
    )

    print(
        f"Language: {language}"
    )

    print(
        f"Company: {company}"
    )

    print(
        f"Role: {role}"
    )

    print(
        f"Duration: {duration_minutes}"
    )

    print(
        f"Questions: {number_of_questions}"
    )

    # ======================================================
    # Validation
    # ======================================================

    if not user_id:
        raise ValueError(
            "user_id is required."
        )

    if not problem_id:
        raise ValueError(
            "problem_id is required."
        )

    if not mode:
        raise ValueError(
            "Coding session mode is required."
        )

    # ======================================================
    # Language Validation
    # ======================================================

    supported_languages = {
        "cpp",
        "python",
    }

    language = language.lower().strip()

    if language not in supported_languages:

        raise ValueError(
            f"Unsupported language: {language}. "
            f"Supported languages: "
            f"{sorted(supported_languages)}"
        )

    # ======================================================
    # Create Database Session
    # ======================================================

    session = create_coding_session(
        db=db,
        user_id=user_id,
        problem_id=problem_id,
        mode=mode,
        company=company,
        role=role,
        language=language,
        duration_minutes=duration_minutes,
        number_of_questions=number_of_questions,
    )

    print(
        "\nCoding session created."
    )

    print(
        f"Session ID: {session.id}"
    )

    print(
        "======================================"
    )

    return session


# ==========================================================
# Get Coding Session
# ==========================================================

def get_coding_session(
    db: Session,
    session_id: int,
):
    """
    Retrieve a coding session by ID.
    """

    return (
        db.query(CodingSession)
        .filter(
            CodingSession.id == session_id
        )
        .first()
    )


# ==========================================================
# Validate Coding Session
# ==========================================================

def validate_coding_session(
    session: CodingSession,
):
    """
    Perform basic validation before the coding
    environment is launched.
    """

    if session is None:
        raise ValueError(
            "Coding session does not exist."
        )

    if session.problem_id is None:
        raise ValueError(
            "Coding session has no problem."
        )

    if session.user_id is None:
        raise ValueError(
            "Coding session has no candidate."
        )

    if not session.language:
        raise ValueError(
            "Coding session has no language."
        )

    return True


# ==========================================================
# Session Summary
# ==========================================================

def get_session_summary(
    session: CodingSession,
):
    """
    Return a simple serializable representation
    of the coding session.

    This will later be expanded with:

    - snapshots
    - executions
    - observations
    - interviewer events
    - dry runs
    - hints
    - final feedback
    """

    if session is None:
        return None

    return {
        "session_id": session.id,
        "user_id": session.user_id,
        "problem_id": session.problem_id,
        "mode": session.mode,
        "company": session.company,
        "role": session.role,
        "language": session.language,
        "duration_minutes": session.duration_minutes,
        "number_of_questions": (
            session.number_of_questions
        ),
    }