"""
coding_monitor.py

Real-time monitoring layer for a coding session.

Responsibilities:
- Receive the current editor code.
- Detect whether the code changed.
- Save snapshots when required.
- Avoid duplicate snapshots.
- Provide the latest code state to later analysis layers.

This module does NOT:
- Execute code.
- Judge correctness.
- Decide brute/better/optimal.
- Generate interviewer questions.
- Call the LLM on every snapshot.

The monitor is intentionally lightweight.
"""

from typing import Optional, Dict, Any

from sqlalchemy.orm import Session

from .crud import (
    get_code_snapshots,
)

from .code_snapshot_service import (
    save_snapshot,
)

from .state import (
    CodingSessionState,
)


# ==========================================================
# Normalize Code
# ==========================================================

def normalize_code(
    code: Optional[str],
) -> str:
    """
    Normalize code before comparing snapshots.
    """

    if not code:
        return ""

    return "\n".join(
        line.rstrip()
        for line in code.strip().splitlines()
    )


# ==========================================================
# Get Latest Snapshot
# ==========================================================

def get_latest_snapshot(
    db: Session,
    session_id: int,
):
    """
    Retrieve the most recent snapshot for a session.
    """

    snapshots = get_code_snapshots(
        db=db,
        session_id=session_id,
    )

    if not snapshots:
        return None

    return snapshots[-1]


# ==========================================================
# Check Code Change
# ==========================================================

def has_code_changed(
    latest_snapshot,
    current_code: str,
) -> bool:
    """
    Determine whether the editor currently contains code
    that differs from the latest saved snapshot.
    """

    if latest_snapshot is None:
        return bool(
            normalize_code(current_code)
        )

    return (
        normalize_code(
            latest_snapshot.code
        )
        != normalize_code(
            current_code
        )
    )


# ==========================================================
# Save If Changed
# ==========================================================

def save_if_changed(
    db: Session,
    state: CodingSessionState,
    current_code: str,
    trigger: str = "interval",
):
    """
    Save the current editor contents only if they differ
    from the latest saved snapshot.

    Returns:
        snapshot object if saved
        None if nothing changed
    """

    if not current_code:
        return None

    latest_snapshot = get_latest_snapshot(
        db=db,
        session_id=state.session_id,
    )

    if not has_code_changed(
        latest_snapshot=latest_snapshot,
        current_code=current_code,
    ):

        return None

    snapshot = save_snapshot(
        db=db,
        state=state,
        code=current_code,
        trigger=trigger,
    )

    state.current_code = current_code

    return snapshot


# ==========================================================
# Process Editor Update
# ==========================================================

def process_editor_update(
    db: Session,
    state: CodingSessionState,
    current_code: str,
):
    """
    Process a new editor state.

    This function is intended to be called periodically,
    for example every 5 or 10 seconds.
    """

    state.current_code = current_code

    snapshot = save_if_changed(
        db=db,
        state=state,
        current_code=current_code,
        trigger="interval",
    )

    return {
        "changed": snapshot is not None,
        "snapshot_id": (
            snapshot.id
            if snapshot
            else None
        ),
        "code": current_code,
    }


# ==========================================================
# Final Submission Snapshot
# ==========================================================

def prepare_submission_code(
    db: Session,
    state: CodingSessionState,
    current_code: str,
):
    """
    Prepare the exact code that should be submitted.

    If the candidate changed the editor after the most
    recent periodic snapshot, save that new version.

    If nothing changed, reuse the latest snapshot.

    This prevents duplicate snapshots while ensuring
    that edits made immediately before submission are
    never lost.
    """

    state.current_code = current_code

    latest_snapshot = get_latest_snapshot(
        db=db,
        session_id=state.session_id,
    )

    # ------------------------------------------------------
    # No snapshot exists
    # ------------------------------------------------------

    if latest_snapshot is None:

        snapshot = save_snapshot(
            db=db,
            state=state,
            code=current_code,
            trigger="submission",
        )

        return {
            "code": current_code,
            "snapshot": snapshot,
        }

    # ------------------------------------------------------
    # Code changed since latest snapshot
    # ------------------------------------------------------

    if has_code_changed(
        latest_snapshot=latest_snapshot,
        current_code=current_code,
    ):

        snapshot = save_snapshot(
            db=db,
            state=state,
            code=current_code,
            trigger="submission",
        )

        return {
            "code": current_code,
            "snapshot": snapshot,
        }

    # ------------------------------------------------------
    # No change
    # ------------------------------------------------------

    return {
        "code": latest_snapshot.code,
        "snapshot": latest_snapshot,
    }


# ==========================================================
# Monitor Status
# ==========================================================

def get_monitor_status(
    db: Session,
    state: CodingSessionState,
) -> Dict[str, Any]:
    """
    Return information about the current snapshot state.
    """

    latest_snapshot = get_latest_snapshot(
        db=db,
        session_id=state.session_id,
    )

    if latest_snapshot is None:

        return {
            "has_snapshot": False,
            "snapshot_id": None,
            "last_saved_code": "",
            "current_code_changed": bool(
                state.current_code
            ),
        }

    changed = has_code_changed(
        latest_snapshot=latest_snapshot,
        current_code=state.current_code,
    )

    return {
        "has_snapshot": True,
        "snapshot_id": latest_snapshot.id,
        "last_saved_code": latest_snapshot.code,
        "current_code_changed": changed,
    }