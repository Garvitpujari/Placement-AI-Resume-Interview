"""
skill_pattern_service.py

Maintains the candidate's coding skill/pattern profile.

The profile is built from actual coding-session evidence.

Examples of patterns:

    Arrays
    Hashing
    Two Pointers
    Sliding Window
    Binary Search
    Trees
    Graphs
    Dynamic Programming
    Greedy

The service stores observations in CandidateMemory rather than
creating a separate skill table.

This module does NOT:
- Execute candidate code.
- Judge the submitted solution.
- Select the next coding problem.
- Generate interviewer questions.
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.database.models import CandidateMemory


# ==========================================================
# Skill Levels
# ==========================================================

SKILL_LEVELS = (
    "weak",
    "developing",
    "good",
    "strong",
)


# ==========================================================
# Find Existing Pattern Memory
# ==========================================================

def get_pattern_memory(
    db: Session,
    user_id: int,
    pattern: str,
):
    """
    Find the existing CandidateMemory entry for a coding
    pattern.

    Coding patterns are stored as:

        category = "Coding Pattern"
        subcategory = pattern
    """

    return (
        db.query(CandidateMemory)
        .filter(
            CandidateMemory.user_id == user_id,
            CandidateMemory.category
            == "Coding Pattern",
            CandidateMemory.subcategory
            == pattern,
        )
        .order_by(
            CandidateMemory.last_updated.desc()
        )
        .first()
    )


# ==========================================================
# Determine Skill Level
# ==========================================================

def get_skill_level(
    confidence: float,
) -> str:
    """
    Convert confidence into a broad skill level.

    This is intentionally simple. The confidence value is
    the persistent signal; the label is only a readable
    representation.
    """

    if confidence < 0.35:
        return "weak"

    if confidence < 0.55:
        return "developing"

    if confidence < 0.80:
        return "good"

    return "strong"


# ==========================================================
# Update Pattern
# ==========================================================

def update_pattern_skill(
    db: Session,
    user_id: int,
    pattern: str,
    success: bool,
    evidence: str,
    importance: int = 5,
):
    """
    Update the candidate's knowledge of a coding pattern.

    A successful demonstration increases confidence.

    A failed demonstration decreases confidence.

    The service does not attempt to decide whether the
    candidate is good or bad from one submission. It simply
    updates the accumulated evidence.
    """

    if not pattern or not pattern.strip():
        raise ValueError(
            "Coding pattern is required."
        )

    pattern = pattern.strip()

    memory = get_pattern_memory(
        db=db,
        user_id=user_id,
        pattern=pattern,
    )

    # ------------------------------------------------------
    # First Observation
    # ------------------------------------------------------

    if memory is None:

        confidence = (
            0.60
            if success
            else 0.30
        )

        level = get_skill_level(
            confidence
        )

        memory = CandidateMemory(
            user_id=user_id,
            memory=(
                f"Candidate skill level for "
                f"{pattern}: {level}"
            ),
            category="Coding Pattern",
            subcategory=pattern,
            importance=importance,
            confidence=confidence,
            evidence=evidence,
        )

        db.add(memory)
        db.commit()
        db.refresh(memory)

        return memory

    # ------------------------------------------------------
    # Existing Observation
    # ------------------------------------------------------

    current_confidence = (
        memory.confidence
        if memory.confidence is not None
        else 0.5
    )

    if success:

        # Move confidence upward gradually.
        confidence = min(
            1.0,
            current_confidence + 0.10,
        )

    else:

        # Move confidence downward gradually.
        confidence = max(
            0.0,
            current_confidence - 0.10,
        )

    level = get_skill_level(
        confidence
    )

    memory.confidence = confidence

    memory.importance = max(
        memory.importance or 0,
        importance,
    )

    memory.memory = (
        f"Candidate skill level for "
        f"{pattern}: {level}"
    )

    memory.evidence = (
        f"{memory.evidence or ''}\n"
        f"{evidence}"
    ).strip()

    db.commit()
    db.refresh(memory)

    return memory


# ==========================================================
# Record Judgement
# ==========================================================

def record_solution_pattern(
    db: Session,
    user_id: int,
    pattern: str,
    judgement,
    evidence: Optional[str] = None,
):
    """
    Convert a solution judgement into candidate-pattern
    evidence.

    A correct solution is considered a successful
    demonstration of the pattern.

    An incorrect solution is considered unsuccessful
    evidence.

    Optimization level is retained in the evidence so
    future problem selection has richer information.
    """

    success = bool(
        judgement.correct
    )

    approach_level = getattr(
        judgement,
        "approach_level",
        "unclear",
    )

    approach_name = getattr(
        judgement,
        "approach_name",
        None,
    )

    reasoning = getattr(
        judgement,
        "reasoning",
        None,
    )

    judgement_evidence = (
        evidence
        or
        (
            f"Solution judgement: "
            f"{'correct' if success else 'incorrect'}; "
            f"approach level: {approach_level}; "
            f"approach: "
            f"{approach_name or 'unknown'}; "
            f"reasoning: "
            f"{reasoning or 'not provided'}"
        )
    )

    return update_pattern_skill(
        db=db,
        user_id=user_id,
        pattern=pattern,
        success=success,
        evidence=judgement_evidence,
    )


# ==========================================================
# Get Candidate Pattern Profile
# ==========================================================

def get_candidate_pattern_profile(
    db: Session,
    user_id: int,
):
    """
    Return the candidate's accumulated coding-pattern
    profile.

    The result is ordered from strongest confidence to
    weakest confidence.
    """

    memories = (
        db.query(CandidateMemory)
        .filter(
            CandidateMemory.user_id == user_id,
            CandidateMemory.category
            == "Coding Pattern",
        )
        .order_by(
            CandidateMemory.confidence.desc()
        )
        .all()
    )

    profile = []

    for memory in memories:

        confidence = (
            memory.confidence
            if memory.confidence is not None
            else 0.5
        )

        profile.append(
            {
                "pattern": memory.subcategory,
                "level": get_skill_level(
                    confidence
                ),
                "confidence": confidence,
                "importance": (
                    memory.importance
                ),
                "evidence": memory.evidence,
            }
        )

    return profile