"""
coding_session_service.py

Orchestration layer for Live Coding sessions.

Responsibilities:
- Start a coding session.
- Obtain/select a coding problem.
- Create the CodingSession database record.
- Prepare runtime session state.
- Coordinate snapshots, execution, and submission.

This module does NOT:
- Execute candidate code directly.
- Analyze code directly.
- Decide brute/better/optimal.
- Generate interviewer questions.
- Generate coding problems.
"""

from typing import Optional, Dict, Any

from sqlalchemy.orm import Session

from ..database.models import CodingProblem

from .crud import (
    create_coding_session,
)

from .problem_pipeline import (
    get_problem_for_candidate,
)

from .state import (
    CodingSessionState,
)


# ==========================================================
# Problem Selection
# ==========================================================

def select_problem(
    db: Session,
    user_id: int,
    query: str,
    title: Optional[str] = None,
):
    """
    Obtain a coding problem through the problem pipeline.

    The candidate user_id is passed through so the pipeline
    can consider the candidate's previous coding history.
    """

    if not query and not title:
        raise ValueError(
            "A coding problem query or title is required."
        )

    return get_problem_for_candidate(
        db=db,
        user_id=user_id,
        query=query or title,
    )


# ==========================================================
# Create Runtime State
# ==========================================================

def create_session_state(
    session_id: int,
    user_id: int,
    problem: CodingProblem,
    mode: str,
    language: str,
    duration_minutes: Optional[int],
    number_of_questions: Optional[int],
):
    """
    Create the in-memory state used while the coding
    assessment is running.
    """

    state = CodingSessionState(
        session_id=session_id,
        user_id=user_id,
        problem_id=problem.id,
        problem_title=problem.title,
        problem_statement=problem.statement,
        category=problem.category,
        difficulty=problem.difficulty,
        mode=mode,
        language=language,
        duration_minutes=duration_minutes,
        number_of_questions=number_of_questions,
    )

    return state


# ==========================================================
# Start Coding Session
# ==========================================================

def start_coding_session(
    db: Session,
    user_id: int,
    query: str,
    mode: str = "practice",
    company: Optional[str] = None,
    role: Optional[str] = None,
    language: str = "cpp",
    duration_minutes: Optional[int] = None,
    number_of_questions: Optional[int] = None,
    title: Optional[str] = None,
):
    """
    Start a complete coding session.

    Flow:

        User request
             ↓
        Problem pipeline
             ↓
        Problem selected
             ↓
        CodingSession created
             ↓
        Runtime state created
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

    # ======================================================
    # Validate Language
    # ======================================================

    language = language.lower().strip()

    if language not in {
        "cpp",
        "python",
    }:

        raise ValueError(
            "Supported languages are cpp and python."
        )

    # ======================================================
    # Select Problem
    # ======================================================

    print(
        "\nSelecting coding problem..."
    )

    problem = select_problem(
        db=db,
        user_id=user_id,
        query=query,
        title=title,
    )

    if not problem:

        raise ValueError(
            "Could not obtain a coding problem."
        )

    print(
        f"Problem: {problem.title}"
    )

    print(
        f"Category: {problem.category}"
    )

    print(
        f"Difficulty: {problem.difficulty}"
    )

    # ======================================================
    # Create Database Session
    # ======================================================

    coding_session = create_coding_session(
        db=db,
        user_id=user_id,
        problem_id=problem.id,
        mode=mode,
        company=company,
        role=role,
        language=language,
        duration_minutes=duration_minutes,
        number_of_questions=number_of_questions,
    )

    print(
        f"Coding session ID: "
        f"{coding_session.id}"
    )

    # ======================================================
    # Create Runtime State
    # ======================================================

    state = create_session_state(
        session_id=coding_session.id,
        user_id=user_id,
        problem=problem,
        mode=mode,
        language=language,
        duration_minutes=duration_minutes,
        number_of_questions=number_of_questions,
    )

    print(
        "\nCoding session ready."
    )

    print(
        "======================================"
    )

    return state


# ==========================================================
# Update Current Code
# ==========================================================

def update_current_code(
    state: CodingSessionState,
    code: str,
):
    """
    Update the current editor contents in runtime state.

    This does NOT automatically save a database snapshot.

    Snapshot timing is handled separately by the snapshot
    monitor.
    """

    state.current_code = code

    return state


# ==========================================================
# Mark Session Started
# ==========================================================

def mark_session_started(
    state: CodingSessionState,
):
    """
    Mark the runtime session as actively started.
    """

    state.started = True

    return state


# ==========================================================
# Mark Session Completed
# ==========================================================

def mark_session_completed(
    state: CodingSessionState,
):
    """
    Mark the runtime coding session as completed.
    """

    state.completed = True
    state.submitted = True

    return state


# ==========================================================
# Session Summary
# ==========================================================

def get_session_summary(
    state: CodingSessionState,
) -> Dict[str, Any]:
    """
    Return a compact summary of the current session.

    This is useful for the API/frontend layer.
    """

    last_execution = getattr(
        state,
        "last_execution",
        None,
    )

    return {
        "session_id": state.session_id,
        "user_id": state.user_id,
        "problem_id": state.problem_id,
        "mode": state.mode,
        "language": state.language,
        "duration_minutes": (
            state.duration_minutes
        ),
        "number_of_questions": (
            state.number_of_questions
        ),
        "started": getattr(
            state,
            "started",
            False,
        ),
        "submitted": getattr(
            state,
            "submitted",
            False,
        ),
        "completed": getattr(
            state,
            "completed",
            False,
        ),
        "has_code": bool(
            state.current_code
        ),
        "has_execution": (
            last_execution is not None
        ),
    }