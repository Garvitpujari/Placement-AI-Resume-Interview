"""
submission_service.py

Coordinates the candidate's final coding submission.

Responsibilities:
- Receive the latest code from the editor.
- Compare it with the latest saved snapshot.
- Save a snapshot if the candidate changed code after
  the last periodic snapshot.
- Execute the exact code that was submitted.
- Mark the coding session as submitted.

This module does NOT:
- Decide whether the solution is optimal.
- Analyze the candidate's approach.
- Generate interviewer questions.
- Generate final coding feedback.
"""

from sqlalchemy.orm import Session
from .crud import (
    get_code_snapshots,
)

from .code_snapshot_service import (
    save_snapshot,
)

from .execution_service import (
    execute_submission,
)

from .state import (
    CodingSessionState,
)

# ==========================================================
# Latest Snapshot
# ==========================================================

def get_latest_snapshot(
    db: Session,
    session_id: int,
):
    """
    Retrieve the most recent saved code snapshot.

    Returns None if no snapshot exists yet.
    """

    snapshots = get_code_snapshots(
        db=db,
        session_id=session_id,
    )

    if not snapshots:
        return None

    return snapshots[-1]


# ==========================================================
# Check Whether Submission Needs Snapshot
# ==========================================================

def needs_submission_snapshot(
    latest_snapshot,
    current_code: str,
) -> bool:
    """
    Determine whether the candidate changed their code
    after the most recent periodic snapshot.

    If the current editor contents are different from
    the latest saved snapshot, we must save the current
    version before executing it.
    """

    if latest_snapshot is None:
        return True

    saved_code = (
        latest_snapshot.code or ""
    ).strip()

    submitted_code = (
        current_code or ""
    ).strip()

    return saved_code != submitted_code


# ==========================================================
# Submit Coding Solution
# ==========================================================

def submit_coding_solution(
    db: Session,
    state: CodingSessionState,
    current_code: str,
):
    """
    Submit the candidate's current editor contents.

    Flow:

        editor code
             ↓
        compare latest snapshot
             ↓
        changed?
          /      \
        YES      NO
         ↓        ↓
      snapshot   reuse latest
         \        /
          ↓      ↓
        execute exact code
             ↓
        save execution
             ↓
        mark submitted
    """

    print(
        "\n======================================"
    )

    print(
        "CODING SUBMISSION"
    )

    print(
        "======================================"
    )

    if not current_code or not current_code.strip():

        raise ValueError(
            "Cannot submit empty code."
        )

    # ======================================================
    # Update Runtime Code
    # ======================================================

    state.current_code = current_code

    # ======================================================
    # Find Latest Snapshot
    # ======================================================

    latest_snapshot = get_latest_snapshot(
        db=db,
        session_id=state.session_id,
    )

    # ======================================================
    # Save Missing Changes
    # ======================================================

    if needs_submission_snapshot(
        latest_snapshot=latest_snapshot,
        current_code=current_code,
    ):

        print(
            "Code changed since the latest snapshot."
        )

        print(
            "Saving latest submission version..."
        )

        save_snapshot(
            db=db,
            state=state,
            code=current_code,
            trigger="submission",
        )

    else:

        print(
            "Current code matches the latest snapshot."
        )

        print(
            "No duplicate snapshot required."
        )

    # ======================================================
    # Execute EXACT Submitted Code
    # ======================================================

    print(
        "\nExecuting submitted code..."
    )

    result = execute_submission(
        db=db,
        state=state,
        code=current_code,
    )

    # ======================================================
    # Mark Submission
    # ======================================================

    state.submitted = True

    print(
        "\n======================================"
    )

    print(
        "SUBMISSION COMPLETE"
    )

    print(
        f"Passed: "
        f"{result.passed_tests}/"
        f"{result.total_tests}"
    )

    print(
        f"Status: "
        f"{'PASSED' if result.passed else 'FAILED'}"
    )

    print(
        "======================================"
    )

    return result