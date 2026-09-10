"""
session_initializer.py

Initializes the runtime state for a live coding session.

Responsibilities:
- Load the CodingSession from the database.
- Load the associated CodingProblem.
- Validate the session.
- Build CodingSessionState.

This module does NOT:
- Execute code.
- Analyze code.
- Generate interviewer questions.
- Run the timer.
"""

from sqlalchemy.orm import Session

from app.database.models import (
    CodingSession,
    CodingProblem,
)

from app.coding.state import (
    CodingSessionState,
)

from app.coding.session_service import (
    validate_coding_session,
)


# ==========================================================
# Initialize Session
# ==========================================================

def initialize_coding_session(
    db: Session,
    session_id: int,
) -> CodingSessionState:
    """
    Load a persisted CodingSession and its problem,
    then convert them into the runtime coding state.
    """

    print(
        "\n======================================"
    )

    print(
        "INITIALIZING CODING SESSION"
    )

    print(
        "======================================"
    )

    # ======================================================
    # Load Coding Session
    # ======================================================

    session = (
        db.query(CodingSession)
        .filter(
            CodingSession.id == session_id
        )
        .first()
    )

    if session is None:

        raise ValueError(
            f"Coding session {session_id} "
            f"was not found."
        )

    # ======================================================
    # Validate Session
    # ======================================================

    validate_coding_session(
        session
    )

    # ======================================================
    # Load Problem
    # ======================================================

    problem = (
        db.query(CodingProblem)
        .filter(
            CodingProblem.id
            == session.problem_id
        )
        .first()
    )

    if problem is None:

        raise ValueError(
            f"Coding problem "
            f"{session.problem_id} "
            f"was not found."
        )

    # ======================================================
    # Build Runtime State
    # ======================================================

    state = CodingSessionState(

        user_id=session.user_id,

        session_id=session.id,

        problem_id=problem.id,

        problem_title=problem.title,

        problem_statement=problem.statement,

        category=problem.category,

        difficulty=problem.difficulty,

        mode=session.mode,

        company=session.company,

        role=session.role,

        language=session.language,

        duration_minutes=(
            session.duration_minutes
        ),

        number_of_questions=(
            session.number_of_questions
        ),

        current_code="",

        previous_code="",

        started=True,

        completed=False,

        submitted=False,

        current_question_number=1,
    )

    print(
        f"Session ID: {state.session_id}"
    )

    print(
        f"Problem: {state.problem_title}"
    )

    print(
        f"Category: {state.category}"
    )

    print(
        f"Difficulty: {state.difficulty}"
    )

    print(
        f"Language: {state.language}"
    )

    print(
        f"Mode: {state.mode}"
    )

    print(
        "Coding session initialized."
    )

    print(
        "======================================"
    )

    return state