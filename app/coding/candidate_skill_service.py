"""
candidate_skill_service.py

Maintains the candidate's long-term coding skill profile.

The profile is based on coding patterns/topics such as:

    Arrays
    Hashing
    Two Pointers
    Sliding Window
    Binary Search
    Trees
    Graphs
    Dynamic Programming
    Greedy
    Backtracking
    etc.

This module does NOT:
- Select individual problems.
- Execute code.
- Generate interviewer questions.
- Analyze every keystroke.

Its purpose is to maintain persistent candidate skill
information that can later influence problem selection
and interview analysis.
"""

from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from ..database.crud import (
    create_memory,
    get_user_memories,
    update_memory,
)


# ==========================================================
# Skill Levels
# ==========================================================

SKILL_LEVELS = {
    "weak": 1,
    "developing": 2,
    "average": 3,
    "good": 4,
    "strong": 5,
}


# ==========================================================
# Convert Score To Skill Level
# ==========================================================

def score_to_skill_level(
    score: float,
) -> str:
    """
    Convert a 0-10 performance score into a broad
    persistent skill level.
    """

    if score < 3:
        return "weak"

    if score < 5:
        return "developing"

    if score < 7:
        return "average"

    if score < 9:
        return "good"

    return "strong"


# ==========================================================
# Find Existing Skill Memory
# ==========================================================

def find_skill_memory(
    memories,
    pattern: str,
):
    """
    Find an existing candidate memory representing
    performance in a particular coding pattern.
    """

    pattern_normalized = pattern.strip().lower()

    for memory in memories:

        category = (
            memory.category or ""
        ).strip().lower()

        subcategory = (
            memory.subcategory or ""
        ).strip().lower()

        memory_text = (
            memory.memory or ""
        ).strip().lower()

        if (
            pattern_normalized == category
            or pattern_normalized == subcategory
            or pattern_normalized in memory_text
        ):
            return memory

    return None


# ==========================================================
# Build Skill Memory Text
# ==========================================================

def build_skill_memory(
    pattern: str,
    skill_level: str,
) -> str:
    """
    Create a stable candidate-memory description.

    This is intentionally about the candidate's skill,
    not a particular question.
    """

    return (
        f"{pattern} coding pattern skill level: "
        f"{skill_level}"
    )


# ==========================================================
# Update Skill
# ==========================================================

def update_candidate_skill(
    db: Session,
    user_id: int,
    pattern: str,
    score: float,
    evidence: Optional[str] = None,
):
    """
    Update the candidate's persistent skill for a
    coding pattern.

    Existing memory is updated rather than creating an
    unlimited number of duplicate memories for the same
    pattern.
    """

    if not pattern:
        return None

    skill_level = score_to_skill_level(
        score
    )

    memories = get_user_memories(
        db=db,
        user_id=user_id,
    )

    existing = find_skill_memory(
        memories=memories,
        pattern=pattern,
    )

    memory_text = build_skill_memory(
        pattern=pattern,
        skill_level=skill_level,
    )

    importance = min(
        10,
        max(
            1,
            int(round(score)),
        ),
    )

    confidence = min(
        1.0,
        max(
            0.0,
            score / 10,
        ),
    )

    if existing:

        return update_memory(
            db=db,
            memory_id=existing.id,
            user_id=user_id,
            memory=memory_text,
            category=pattern,
            subcategory="Coding Pattern",
            importance=importance,
            confidence=confidence,
            evidence=evidence,
        )

    return create_memory(
        db=db,
        user_id=user_id,
        memory=memory_text,
        category=pattern,
        subcategory="Coding Pattern",
        importance=importance,
        confidence=confidence,
        evidence=evidence,
    )


# ==========================================================
# Update Multiple Skills
# ==========================================================

def update_candidate_skills(
    db: Session,
    user_id: int,
    pattern_scores: Dict[str, float],
    evidence: Optional[str] = None,
):
    """
    Update multiple coding-pattern skills at once.

    Example:

        {
            "Arrays": 8,
            "Hashing": 9,
            "Two Pointers": 4
        }
    """

    results = {}

    for pattern, score in pattern_scores.items():

        results[pattern] = update_candidate_skill(
            db=db,
            user_id=user_id,
            pattern=pattern,
            score=score,
            evidence=evidence,
        )

    return results


# ==========================================================
# Get Coding Skills
# ==========================================================

def get_candidate_coding_skills(
    db: Session,
    user_id: int,
) -> List[Dict]:
    """
    Return the candidate's persistent coding-pattern
    profile in a simple structure.
    """

    memories = get_user_memories(
        db=db,
        user_id=user_id,
    )

    skills = []

    for memory in memories:

        if memory.subcategory != "Coding Pattern":
            continue

        skills.append(
            {
                "pattern": memory.category,
                "skill": memory.memory,
                "importance": memory.importance,
                "confidence": memory.confidence,
                "evidence": memory.evidence,
            }
        )

    return skills