"""
problem_selection_service.py

Selects coding problems for a candidate based on:

- Candidate coding-pattern history
- Requested coding mode
- Company
- Difficulty
- Number of questions
- Previously attempted problems

The goal is to avoid repeatedly giving the same problem
while targeting useful patterns for the candidate.

This module does NOT:
- Generate problems
- Execute code
- Judge solutions
- Generate interviewer questions

It only decides WHICH existing problem should be used.
"""

from typing import List, Optional, Set, Dict, Any

from sqlalchemy.orm import Session

from ..database.models import (
    CodingProblem,
    CodingSession,
)

from ..database.crud import (
    get_user_memories,
)


# ==========================================================
# Difficulty Ranking
# ==========================================================

DIFFICULTY_RANK = {
    "easy": 1,
    "medium": 2,
    "hard": 3,
}


# ==========================================================
# Normalize
# ==========================================================

def normalize(
    value: Optional[str],
) -> str:
    """
    Normalize text used for comparisons.
    """

    if not value:
        return ""

    return value.strip().lower()


# ==========================================================
# Candidate Skill Profile
# ==========================================================

def get_candidate_skill_profile(
    db: Session,
    user_id: int,
) -> Dict[str, str]:
    """
    Read the candidate's persistent coding-pattern
    memories.

    Returns:

        {
            "arrays": "good",
            "hashing": "strong",
            "dynamic programming": "weak"
        }
    """

    memories = get_user_memories(
        db=db,
        user_id=user_id,
    )

    profile = {}

    for memory in memories:

        if (
            memory.subcategory
            != "Coding Pattern"
        ):
            continue

        pattern = normalize(
            memory.category
        )

        if not pattern:
            continue

        text = normalize(
            memory.memory
        )

        if "strong" in text:
            level = "strong"

        elif "good" in text:
            level = "good"

        elif "average" in text:
            level = "average"

        elif "developing" in text:
            level = "developing"

        elif "weak" in text:
            level = "weak"

        else:
            level = "unknown"

        profile[pattern] = level

    return profile


# ==========================================================
# Previously Attempted Problems
# ==========================================================

def get_attempted_problem_ids(
    db: Session,
    user_id: int,
) -> Set[int]:
    """
    Return problem IDs that the candidate has already
    encountered.

    This prevents the selector from repeatedly returning
    the same problem.
    """

    sessions = (
        db.query(CodingSession)
        .filter(
            CodingSession.user_id == user_id
        )
        .all()
    )

    return {
        session.problem_id
        for session in sessions
        if session.problem_id is not None
    }


# ==========================================================
# Problem Pattern Matching
# ==========================================================

def problem_matches_pattern(
    problem: CodingProblem,
    pattern: str,
) -> bool:
    """
    Determine whether a problem belongs to a requested
    coding pattern.

    The category is our primary source.

    This does not inspect candidate code.
    """

    category = normalize(
        problem.category
    )

    return (
        category == normalize(pattern)
        or normalize(pattern) in category
        or category in normalize(pattern)
    )


# ==========================================================
# Difficulty Matching
# ==========================================================

def difficulty_matches(
    problem: CodingProblem,
    requested_difficulty: Optional[str],
) -> bool:
    """
    Check whether a problem matches the requested
    difficulty.

    If difficulty is not specified, every difficulty
    is allowed.
    """

    if not requested_difficulty:
        return True

    return (
        normalize(problem.difficulty)
        == normalize(requested_difficulty)
    )


# ==========================================================
# Company Matching
# ==========================================================

def company_matches(
    problem: CodingProblem,
    company: Optional[str],
) -> bool:
    """
    Check whether a problem is associated with the
    requested company.

    Company-specific metadata can later be expanded
    into a dedicated relationship/table.
    """

    if not company:
        return True

    source = normalize(
        problem.source
    )

    source_url = normalize(
        problem.source_url
    )

    company_name = normalize(
        company
    )

    return (
        company_name in source
        or company_name in source_url
    )


# ==========================================================
# Score Candidate Problem
# ==========================================================

def score_problem(
    problem: CodingProblem,
    skill_profile: Dict[str, str],
    requested_pattern: Optional[str],
    requested_difficulty: Optional[str],
    company: Optional[str],
) -> float:
    """
    Give a problem a selection score.

    Higher score means the problem is a stronger
    candidate for the current assessment.

    This is selection logic, NOT candidate evaluation.
    """

    score = 0.0

    category = normalize(
        problem.category
    )

    # ------------------------------------------------------
    # Explicit pattern request
    # ------------------------------------------------------

    if requested_pattern:

        requested = normalize(
            requested_pattern
        )

        if category == requested:

            score += 50

        elif (
            requested in category
            or category in requested
        ):

            score += 30

    # ------------------------------------------------------
    # Candidate weakness targeting
    # ------------------------------------------------------

    skill = skill_profile.get(
        category
    )

    if skill == "weak":

        score += 25

    elif skill == "developing":

        score += 20

    elif skill == "average":

        score += 10

    elif skill == "good":

        score += 3

    elif skill == "strong":

        score += 1

    # ------------------------------------------------------
    # Difficulty
    # ------------------------------------------------------

    if requested_difficulty:

        if difficulty_matches(
            problem,
            requested_difficulty,
        ):

            score += 20

    # ------------------------------------------------------
    # Company
    # ------------------------------------------------------

    if company and company_matches(
        problem,
        company,
    ):

        score += 15

    return score


# ==========================================================
# Fetch Candidate Problems
# ==========================================================

def get_available_problems(
    db: Session,
    attempted_ids: Set[int],
) -> List[CodingProblem]:
    """
    Get problems that the candidate has not already
    attempted.

    We deliberately exclude previously attempted
    problems here.
    """

    query = db.query(
        CodingProblem
    )

    if attempted_ids:

        query = query.filter(
            ~CodingProblem.id.in_(
                attempted_ids
            )
        )

    return query.all()


# ==========================================================
# Select Problems
# ==========================================================

def select_problems(
    db: Session,
    user_id: int,
    number_of_questions: int = 1,
    pattern: Optional[str] = None,
    difficulty: Optional[str] = None,
    company: Optional[str] = None,
) -> List[CodingProblem]:
    """
    Select problems for a coding assessment.

    Selection considers:

        candidate history
        requested pattern
        difficulty
        company
        previous attempts
    """

    if number_of_questions < 1:

        raise ValueError(
            "number_of_questions must be at least 1."
        )

    skill_profile = (
        get_candidate_skill_profile(
            db=db,
            user_id=user_id,
        )
    )

    attempted_ids = (
        get_attempted_problem_ids(
            db=db,
            user_id=user_id,
        )
    )

    available = get_available_problems(
        db=db,
        attempted_ids=attempted_ids,
    )

    # ------------------------------------------------------
    # Filter by explicit difficulty
    # ------------------------------------------------------

    if difficulty:

        available = [
            problem
            for problem in available
            if difficulty_matches(
                problem,
                difficulty,
            )
        ]

    # ------------------------------------------------------
    # Filter by explicit pattern
    # ------------------------------------------------------

    if pattern:

        matching = [
            problem
            for problem in available
            if problem_matches_pattern(
                problem,
                pattern,
            )
        ]

        # Only use the pattern filter when matching
        # problems actually exist.
        #
        # This prevents the system from failing merely
        # because our local database is incomplete.

        if matching:

            available = matching

    # ------------------------------------------------------
    # Score
    # ------------------------------------------------------

    scored = []

    for problem in available:

        score = score_problem(
            problem=problem,
            skill_profile=skill_profile,
            requested_pattern=pattern,
            requested_difficulty=difficulty,
            company=company,
        )

        scored.append(
            (
                score,
                problem,
            )
        )

    # ------------------------------------------------------
    # Highest relevance first
    # ------------------------------------------------------

    scored.sort(
        key=lambda item: item[0],
        reverse=True,
    )

    return [
        problem
        for _, problem in scored[
            :number_of_questions
        ]
    ]


# ==========================================================
# Select Single Problem
# ==========================================================

def select_problem(
    db: Session,
    user_id: int,
    pattern: Optional[str] = None,
    difficulty: Optional[str] = None,
    company: Optional[str] = None,
) -> Optional[CodingProblem]:
    """
    Select one problem.
    """

    problems = select_problems(
        db=db,
        user_id=user_id,
        number_of_questions=1,
        pattern=pattern,
        difficulty=difficulty,
        company=company,
    )

    if not problems:
        return None

    return problems[0]