"""
problem_pattern_service.py

Handles coding-problem pattern metadata.

Responsibilities:
- Read patterns attached to a coding problem.
- Find problems matching a coding pattern.
- Add pattern metadata to a problem.
- Avoid hardcoded problem-specific logic.

This service does NOT:
- Select the final problem for the candidate.
- Execute candidate code.
- Judge candidate solutions.
- Generate interviewer questions.

The final selection decision remains in problem_selector.py.
"""


from typing import List, Optional

from sqlalchemy.orm import Session

from app.database.models import (
    CodingProblem,
    CodingProblemPattern,
)


# ==========================================================
# Get Problem Patterns
# ==========================================================

def get_problem_patterns(
    db: Session,
    problem_id: int,
) -> List[CodingProblemPattern]:
    """
    Return all patterns associated with a coding problem.
    """

    return (
        db.query(CodingProblemPattern)
        .filter(
            CodingProblemPattern.problem_id
            == problem_id
        )
        .order_by(
            CodingProblemPattern.id.asc()
        )
        .all()
    )


# ==========================================================
# Get Pattern Names
# ==========================================================

def get_problem_pattern_names(
    db: Session,
    problem_id: int,
) -> List[str]:
    """
    Return the names of all patterns associated with
    a coding problem.
    """

    patterns = get_problem_patterns(
        db=db,
        problem_id=problem_id,
    )

    return [
        pattern.pattern
        for pattern in patterns
        if pattern.pattern
    ]


# ==========================================================
# Find Problems By Pattern
# ==========================================================

def get_problems_by_pattern(
    db: Session,
    pattern: str,
    difficulty: Optional[str] = None,
) -> List[CodingProblem]:
    """
    Find real coding problems associated with a specific
    algorithmic pattern.

    Examples:

        Sliding Window
        Two Pointers
        Binary Search
        Dynamic Programming

    Pattern matching is case-insensitive.
    """

    if not pattern or not pattern.strip():
        return []

    query = (
        db.query(CodingProblem)
        .join(
            CodingProblemPattern,
            CodingProblemPattern.problem_id
            == CodingProblem.id,
        )
        .filter(
            CodingProblemPattern.pattern.ilike(
                pattern.strip()
            )
        )
    )

    if difficulty:

        query = query.filter(
            CodingProblem.difficulty.ilike(
                difficulty.strip()
            )
        )

    return (
        query
        .order_by(
            CodingProblem.id.asc()
        )
        .all()
    )


# ==========================================================
# Find Problems By Any Pattern
# ==========================================================

def get_problems_by_patterns(
    db: Session,
    patterns: List[str],
    difficulty: Optional[str] = None,
) -> List[CodingProblem]:
    """
    Find problems matching any of the supplied patterns.

    Duplicate problems are removed.

    This is useful when a candidate has multiple weak
    patterns.
    """

    if not patterns:
        return []

    normalized_patterns = [
        pattern.strip()
        for pattern in patterns
        if pattern and pattern.strip()
    ]

    if not normalized_patterns:
        return []

    query = (
        db.query(CodingProblem)
        .join(
            CodingProblemPattern,
            CodingProblemPattern.problem_id
            == CodingProblem.id,
        )
        .filter(
            CodingProblemPattern.pattern.in_(
                normalized_patterns
            )
        )
    )

    if difficulty:

        query = query.filter(
            CodingProblem.difficulty.ilike(
                difficulty.strip()
            )
        )

    problems = (
        query
        .order_by(
            CodingProblem.id.asc()
        )
        .all()
    )

    # ------------------------------------------------------
    # Remove duplicates
    # ------------------------------------------------------

    unique_problems = []
    seen_ids = set()

    for problem in problems:

        if problem.id in seen_ids:
            continue

        seen_ids.add(
            problem.id
        )

        unique_problems.append(
            problem
        )

    return unique_problems


# ==========================================================
# Add Problem Pattern
# ==========================================================

def add_problem_pattern(
    db: Session,
    problem_id: int,
    pattern: str,
    explanation: Optional[str] = None,
):
    """
    Attach a pattern to an existing coding problem.

    Duplicate pattern entries for the same problem are
    avoided.
    """

    if not pattern or not pattern.strip():
        raise ValueError(
            "Problem pattern is required."
        )

    existing = (
        db.query(CodingProblemPattern)
        .filter(
            CodingProblemPattern.problem_id
            == problem_id,
            CodingProblemPattern.pattern.ilike(
                pattern.strip()
            ),
        )
        .first()
    )

    if existing:
        return existing

    problem = (
        db.query(CodingProblem)
        .filter(
            CodingProblem.id == problem_id
        )
        .first()
    )

    if problem is None:
        raise ValueError(
            f"Coding problem {problem_id} "
            f"does not exist."
        )

    pattern_record = CodingProblemPattern(
        problem_id=problem_id,
        pattern=pattern.strip(),
        explanation=explanation,
    )

    db.add(
        pattern_record
    )

    db.commit()

    db.refresh(
        pattern_record
    )

    return pattern_record


# ==========================================================
# Add Multiple Problem Patterns
# ==========================================================

def add_problem_patterns(
    db: Session,
    problem_id: int,
    patterns: List[str],
):
    """
    Attach multiple patterns to a coding problem.

    Existing pattern records are reused.
    """

    records = []

    for pattern in patterns:

        if not pattern or not pattern.strip():
            continue

        record = add_problem_pattern(
            db=db,
            problem_id=problem_id,
            pattern=pattern,
        )

        records.append(
            record
        )

    return records


# ==========================================================
# Remove Problem Pattern
# ==========================================================

def remove_problem_pattern(
    db: Session,
    problem_id: int,
    pattern: str,
) -> bool:
    """
    Remove a pattern from a coding problem.

    Returns True if a record was removed.
    """

    record = (
        db.query(CodingProblemPattern)
        .filter(
            CodingProblemPattern.problem_id
            == problem_id,
            CodingProblemPattern.pattern.ilike(
                pattern.strip()
            ),
        )
        .first()
    )

    if record is None:
        return False

    db.delete(
        record
    )

    db.commit()

    return True


# ==========================================================
# Build Pattern Context
# ==========================================================

def build_problem_pattern_context(
    db: Session,
    problem_id: int,
):
    """
    Build a compact pattern context for other services.

    Useful for:
    - problem selection
    - solution judgement
    - interviewer reasoning
    """

    patterns = get_problem_patterns(
        db=db,
        problem_id=problem_id,
    )

    return [
        {
            "pattern": pattern.pattern,
            "explanation": pattern.explanation,
        }
        for pattern in patterns
    ]