"""
code_snapshot_service.py

Handles persistence of candidate code snapshots.

Responsibilities:
- Save candidate code snapshots.
- Keep runtime snapshot state synchronized.
- Support periodic and submission snapshots.

This module does NOT:
- Execute code.
- Judge solutions.
- Generate interviewer questions.
"""

from datetime import datetime

from sqlalchemy.orm import Session

from app.database.models import CodeSnapshot

from .state import (
    CodingSessionState,
    CodeSnapshotState,
)


# ==========================================================
# Save Snapshot
# ==========================================================

def save_snapshot(
    db: Session,
    state: CodingSessionState,
    code: str,
    trigger: str = "periodic",
):
    """
    Save the candidate's current code as a snapshot.

    The snapshot is persisted to PostgreSQL and also added
    to the runtime CodingSessionState.
    """

    if not state.session_id:
        raise ValueError(
            "Coding session ID is required."
        )

    if not code or not code.strip():
        raise ValueError(
            "Cannot save an empty code snapshot."
        )

    # ------------------------------------------------------
    # Database Snapshot
    # ------------------------------------------------------

    snapshot = CodeSnapshot(
        session_id=state.session_id,
        code=code,
        language=state.language,
        trigger=trigger,
    )

    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    # ------------------------------------------------------
    # Runtime Snapshot
    # ------------------------------------------------------

    snapshot_state = CodeSnapshotState(
        code=code,
        language=state.language,
        trigger=trigger,
        timestamp=(
            snapshot.created_at.timestamp()
            if snapshot.created_at
            else datetime.utcnow().timestamp()
        ),
    )

    state.snapshots.append(
        snapshot_state
    )

    # Keep the runtime editor state synchronized.
    state.current_code = code

    return snapshot


# ==========================================================
# Get Latest Snapshot
# ==========================================================

def get_latest_snapshot(
    db: Session,
    session_id: int,
):
    """
    Return the latest persisted snapshot for a coding
    session.

    Returns None when no snapshot exists.
    """

    if not session_id:
        return None

    return (
        db.query(CodeSnapshot)
        .filter(
            CodeSnapshot.session_id
            == session_id
        )
        .order_by(
            CodeSnapshot.created_at.desc(),
            CodeSnapshot.id.desc(),
        )
        .first()
    )