"""
problem_selector.py

Selects coding problems for a candidate from the GLOBAL
coding-problem bank.

Responsibilities:
- Respect requested category.
- Respect requested difficulty.
- Avoid previously attempted problems.
- Prefer problems matching weaker candidate patterns.
- Use stored problem knowledge for deterministic routing.
- Rank candidates instead of simply taking the first match.
- Fall back safely when adaptive candidates are unavailable.

This module does NOT:
- Generate problems.
- Search the web.
- Call the LLM.
- Execute candidate code.
- Evaluate candidate code.
- Generate candidate feedback.

Architecture:

Candidate request
        |
        v
Candidate history + skills
        |
        v
Global problem bank
        |
        v
Problem knowledge
        |
        v
Deterministic scoring
        |
        v
Best suitable problem
"""

from typing import Optional, List, Dict, Any, Tuple

from sqlalchemy.orm import Session

from app.database.models import (
    CodingProblem,
    CodingSession,
)

from .candidate_skill_service import (
    get_candidate_coding_skills,
)

from .problem_bank.problem_repository import (
    get_problem_routing_context,
)

from .problem_pattern_service import (
    get_problems_by_pattern,
)


# ==========================================================
# Scoring Configuration
# ==========================================================

SCORE_PRIMARY_PATTERN = 50
SCORE_SECONDARY_PATTERN = 30
SCORE_RECOGNITION_SIGNAL = 10
SCORE_CATEGORY = 20
SCORE_DIFFICULTY = 20
SCORE_UNATTEMPTED = 25
SCORE_WEAK_PATTERN = 40


# ==========================================================
# Candidate History
# ==========================================================

def get_attempted_problem_ids(
    db: Session,
    user_id: int,
) -> List[int]:
    """
    Return IDs of coding problems previously attempted
    by the candidate.
    """

    sessions = (
        db.query(CodingSession)
        .filter(
            CodingSession.user_id == user_id
        )
        .all()
    )

    return [
        session.problem_id
        for session in sessions
        if session.problem_id is not None
    ]


# ==========================================================
# Candidate Problem History
# ==========================================================

def get_attempted_problem_titles(
    db: Session,
    user_id: int,
) -> List[str]:
    """
    Return titles of problems previously attempted.
    """

    attempted_ids = get_attempted_problem_ids(
        db=db,
        user_id=user_id,
    )

    if not attempted_ids:
        return []

    problems = (
        db.query(CodingProblem)
        .filter(
            CodingProblem.id.in_(
                attempted_ids
            )
        )
        .all()
    )

    return [
        problem.title
        for problem in problems
    ]


# ==========================================================
# Candidate Skills
# ==========================================================

def get_candidate_skill_map(
    db: Session,
    user_id: int,
) -> Dict[str, Dict[str, Any]]:
    """
    Return candidate coding skills indexed by normalized
    pattern name.
    """

    skills = get_candidate_coding_skills(
        db=db,
        user_id=user_id,
    )

    result = {}

    for skill in skills:

        pattern = skill.get(
            "pattern"
        )

        if not pattern:
            continue

        normalized = pattern.strip().lower()

        result[normalized] = skill

    return result


# ==========================================================
# Weak Candidate Patterns
# ==========================================================

def get_weak_candidate_patterns(
    db: Session,
    user_id: int,
) -> List[str]:
    """
    Return candidate patterns with confidence below 0.70.

    Weakest patterns are returned first.
    """

    skills = get_candidate_coding_skills(
        db=db,
        user_id=user_id,
    )

    weak_skills = []

    for skill in skills:

        confidence = skill.get(
            "confidence"
        )

        if confidence is None:
            confidence = 0.5

        if confidence < 0.70:

            pattern = skill.get(
                "pattern"
            )

            if pattern:

                weak_skills.append(
                    {
                        "pattern": pattern,
                        "confidence": confidence,
                    }
                )

    weak_skills.sort(
        key=lambda item: item[
            "confidence"
        ]
    )

    return [
        item["pattern"]
        for item in weak_skills
    ]


# ==========================================================
# Problem Candidates
# ==========================================================

def get_problem_candidates(
    db: Session,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
):
    """
    Get problems matching explicitly requested
    category/difficulty.
    """

    query = db.query(
        CodingProblem
    )

    if category:

        query = query.filter(
            CodingProblem.category.ilike(
                category
            )
        )

    if difficulty:

        query = query.filter(
            CodingProblem.difficulty.ilike(
                difficulty
            )
        )

    return query.all()


# ==========================================================
# All Problem Candidates
# ==========================================================

def get_all_problem_candidates(
    db: Session,
):
    """
    Retrieve the complete global problem bank.
    """

    return (
        db.query(
            CodingProblem
        )
        .all()
    )


# ==========================================================
# Pattern-Based Candidates
# ==========================================================

def get_pattern_problem_candidates(
    db: Session,
    weak_patterns: List[str],
    difficulty: Optional[str] = None,
    category: Optional[str] = None,
):
    """
    Find problems associated with candidate weak patterns.

    Final selection happens through deterministic scoring.
    """

    if not weak_patterns:
        return []

    candidates = []

    seen_ids = set()

    for pattern in weak_patterns:

        pattern_problems = (
            get_problems_by_pattern(
                db=db,
                pattern=pattern,
                difficulty=difficulty,
            )
        )

        for problem in pattern_problems:

            if category:

                problem_category = (
                    problem.category or ""
                ).strip().lower()

                requested_category = (
                    category.strip().lower()
                )

                if (
                    problem_category
                    != requested_category
                ):
                    continue

            if problem.id in seen_ids:
                continue

            seen_ids.add(
                problem.id
            )

            candidates.append(
                problem
            )

    return candidates


# ==========================================================
# Remove Attempted Problems
# ==========================================================

def remove_attempted_problems(
    problems: List[CodingProblem],
    attempted_ids: List[int],
):
    """
    Remove problems previously attempted by the candidate.
    """

    attempted_set = set(
        attempted_ids
    )

    return [
        problem
        for problem in problems
        if problem.id not in attempted_set
    ]


# ==========================================================
# Normalize Text
# ==========================================================

def _normalize(
    value: Any,
) -> str:
    """
    Normalize text for deterministic comparison.
    """

    if value is None:
        return ""

    return str(
        value
    ).strip().lower()


# ==========================================================
# Normalize List
# ==========================================================

def _normalize_list(
    value: Any,
) -> List[str]:
    """
    Normalize a routing-context field into List[str].
    """

    if value is None:
        return []

    if isinstance(
        value,
        list,
    ):

        result = []

        for item in value:

            normalized = _normalize(
                item
            )

            if normalized:
                result.append(
                    normalized
                )

        return result

    normalized = _normalize(
        value
    )

    if not normalized:
        return []

    return [normalized]


# ==========================================================
# Pattern Match
# ==========================================================

def _pattern_matches(
    requested_pattern: str,
    knowledge: Dict[str, Any],
) -> Tuple[bool, bool]:
    """
    Determine whether a pattern matches the primary or
    secondary pattern.

    Returns:

        (
            primary_match,
            secondary_match
        )
    """

    requested = _normalize(
        requested_pattern
    )

    if not requested:
        return False, False

    primary = _normalize(
        knowledge.get(
            "primary_pattern"
        )
    )

    secondary = _normalize_list(
        knowledge.get(
            "secondary_patterns"
        )
    )

    if (
        requested == primary
        or requested in primary
        or primary in requested
    ):

        return True, False

    for pattern in secondary:

        if (
            requested == pattern
            or requested in pattern
            or pattern in requested
        ):

            return False, True

    return False, False


# ==========================================================
# Problem Score
# ==========================================================

def score_problem(
    problem: CodingProblem,
    routing_context: Optional[
        Dict[str, Any]
    ],
    weak_patterns: List[str],
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    attempted_ids: Optional[List[int]] = None,
) -> Tuple[int, List[str]]:
    """
    Calculate a deterministic suitability score.

    No LLM is involved.
    """

    score = 0

    reasons = []

    attempted_ids = (
        attempted_ids or []
    )

    if routing_context is None:
        routing_context = {}

    problem_category = _normalize(
        problem.category
    )

    problem_difficulty = _normalize(
        problem.difficulty
    )

    requested_category = _normalize(
        category
    )

    requested_difficulty = _normalize(
        difficulty
    )

    # ======================================================
    # Category
    # ======================================================

    if requested_category:

        if (
            problem_category
            == requested_category
        ):

            score += SCORE_CATEGORY

            reasons.append(
                "category match"
            )

    # ======================================================
    # Difficulty
    # ======================================================

    if requested_difficulty:

        if (
            problem_difficulty
            == requested_difficulty
        ):

            score += SCORE_DIFFICULTY

            reasons.append(
                "difficulty match"
            )

    # ======================================================
    # Unattempted
    # ======================================================

    if problem.id not in attempted_ids:

        score += SCORE_UNATTEMPTED

        reasons.append(
            "unattempted"
        )

    # ======================================================
    # Weak Pattern
    # ======================================================

    knowledge = routing_context

    primary_pattern = _normalize(
        knowledge.get(
            "primary_pattern"
        )
    )

    secondary_patterns = _normalize_list(
        knowledge.get(
            "secondary_patterns"
        )
    )

    recognition_signals = _normalize_list(
        knowledge.get(
            "recognition_signals"
        )
    )

    for weak_pattern in weak_patterns:

        normalized_weak = _normalize(
            weak_pattern
        )

        if not normalized_weak:
            continue

        # --------------------------------------------------
        # Primary pattern
        # --------------------------------------------------

        if (
            normalized_weak == primary_pattern
            or normalized_weak in primary_pattern
            or primary_pattern in normalized_weak
        ):

            score += SCORE_PRIMARY_PATTERN
            score += SCORE_WEAK_PATTERN

            reasons.append(
                f"weak primary pattern: "
                f"{weak_pattern}"
            )

            continue

        # --------------------------------------------------
        # Secondary pattern
        # --------------------------------------------------

        secondary_match = False

        for secondary in secondary_patterns:

            if (
                normalized_weak == secondary
                or normalized_weak in secondary
                or secondary in normalized_weak
            ):

                secondary_match = True

                break

        if secondary_match:

            score += SCORE_SECONDARY_PATTERN
            score += SCORE_WEAK_PATTERN

            reasons.append(
                f"weak secondary pattern: "
                f"{weak_pattern}"
            )

            continue

        # --------------------------------------------------
        # Recognition signal
        # --------------------------------------------------

        for signal in recognition_signals:

            if (
                normalized_weak in signal
                or signal in normalized_weak
            ):

                score += SCORE_RECOGNITION_SIGNAL

                reasons.append(
                    f"recognition signal match: "
                    f"{weak_pattern}"
                )

                break

    return score, reasons


# ==========================================================
# Rank Candidates
# ==========================================================

def rank_problem_candidates(
    db: Session,
    problems: List[CodingProblem],
    weak_patterns: List[str],
    category: Optional[str],
    difficulty: Optional[str],
    attempted_ids: List[int],
):
    """
    Score and rank all candidate problems.

    Highest score wins.

    Ties are resolved deterministically by problem ID.
    """

    ranked = []

    for problem in problems:

        routing_context = (
            get_problem_routing_context(
                db=db,
                problem_id=problem.id,
            )
        )

        score, reasons = score_problem(
            problem=problem,
            routing_context=routing_context,
            weak_patterns=weak_patterns,
            category=category,
            difficulty=difficulty,
            attempted_ids=attempted_ids,
        )

        ranked.append(
            {
                "problem": problem,
                "score": score,
                "reasons": reasons,
            }
        )

    ranked.sort(
        key=lambda item: (
            -item["score"],
            item["problem"].id,
        )
    )

    return ranked


# ==========================================================
# Select Problem
# ==========================================================

def select_problem(
    db: Session,
    user_id: int,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
):
    """
    Select the best coding problem for a candidate.

    Strategy:

    1. Load candidate history.
    2. Load candidate weak patterns.
    3. Generate candidates.
    4. Remove attempted problems.
    5. Load stored routing knowledge.
    6. Score candidates.
    7. Return highest-scoring problem.
    8. Fall back safely if necessary.

    No LLM is used.
    """

    print(
        "\n========== PROBLEM SELECTOR =========="
    )

    print(
        f"Category: {category}"
    )

    print(
        f"Difficulty: {difficulty}"
    )

    # ======================================================
    # Candidate History
    # ======================================================

    attempted_ids = (
        get_attempted_problem_ids(
            db=db,
            user_id=user_id,
        )
    )

    print(
        f"Previously attempted problems: "
        f"{len(attempted_ids)}"
    )

    # ======================================================
    # Candidate Weak Patterns
    # ======================================================

    weak_patterns = (
        get_weak_candidate_patterns(
            db=db,
            user_id=user_id,
        )
    )

    if weak_patterns:

        print(
            "Candidate weaker patterns: "
            + ", ".join(
                weak_patterns
            )
        )

    else:

        print(
            "No weak coding patterns found."
        )

    # ======================================================
    # Candidate Pool
    # ======================================================

    candidates = []

    requested_candidates = (
        get_problem_candidates(
            db=db,
            category=category,
            difficulty=difficulty,
        )
    )

    candidates.extend(
        requested_candidates
    )

    # ------------------------------------------------------
    # Adaptive candidates
    # ------------------------------------------------------

    adaptive_candidates = (
        get_pattern_problem_candidates(
            db=db,
            weak_patterns=weak_patterns,
            difficulty=difficulty,
            category=category,
        )
    )

    existing_ids = {
        problem.id
        for problem in candidates
    }

    for problem in adaptive_candidates:

        if problem.id not in existing_ids:

            candidates.append(
                problem
            )

            existing_ids.add(
                problem.id
            )

    print(
        f"Initial candidate pool: "
        f"{len(candidates)}"
    )

    # ======================================================
    # Fresh Candidates
    # ======================================================

    fresh_candidates = (
        remove_attempted_problems(
            problems=candidates,
            attempted_ids=attempted_ids,
        )
    )

    print(
        f"Unattempted candidates: "
        f"{len(fresh_candidates)}"
    )

    # ======================================================
    # Rank Fresh Candidates
    # ======================================================

    if fresh_candidates:

        ranked = rank_problem_candidates(
            db=db,
            problems=fresh_candidates,
            weak_patterns=weak_patterns,
            category=category,
            difficulty=difficulty,
            attempted_ids=attempted_ids,
        )

        if ranked:

            selected_item = ranked[0]

            selected = selected_item[
                "problem"
            ]

            print(
                "\nSelected problem: "
                f"{selected.title}"
            )

            print(
                f"Score: "
                f"{selected_item['score']}"
            )

            if selected_item["reasons"]:

                print(
                    "Reasons: "
                    + ", ".join(
                        selected_item[
                            "reasons"
                        ]
                    )
                )

            return selected

    # ======================================================
    # Reuse Matching Problem
    # ======================================================

    print(
        "No unattempted matching problem available."
    )

    if candidates:

        ranked = rank_problem_candidates(
            db=db,
            problems=candidates,
            weak_patterns=weak_patterns,
            category=category,
            difficulty=difficulty,
            attempted_ids=attempted_ids,
        )

        if ranked:

            selected_item = ranked[0]

            selected = selected_item[
                "problem"
            ]

            print(
                "\nAll matching problems have "
                "already been attempted."
            )

            print(
                "Allowing problem reuse: "
                f"{selected.title}"
            )

            return selected

    # ======================================================
    # Global Fallback
    # ======================================================

    print(
        "No problem matched the requested filters."
    )

    print(
        "Checking the global problem bank..."
    )

    global_candidates = (
        get_all_problem_candidates(
            db=db
        )
    )

    fresh_global = (
        remove_attempted_problems(
            problems=global_candidates,
            attempted_ids=attempted_ids,
        )
    )

    if fresh_global:

        ranked = rank_problem_candidates(
            db=db,
            problems=fresh_global,
            weak_patterns=weak_patterns,
            category=None,
            difficulty=None,
            attempted_ids=attempted_ids,
        )

        if ranked:

            selected_item = ranked[0]

            selected = selected_item[
                "problem"
            ]

            print(
                "\nSelected global fallback: "
                f"{selected.title}"
            )

            print(
                f"Score: "
                f"{selected_item['score']}"
            )

            return selected

    # ======================================================
    # Nothing Available
    # ======================================================

    print(
        "No suitable coding problems were found."
    )

    return None


# ==========================================================
# Selection Summary
# ==========================================================

def get_selection_summary(
    db: Session,
    user_id: int,
):
    """
    Return information about the candidate's coding
    history and current weak patterns.
    """

    attempted_ids = (
        get_attempted_problem_ids(
            db=db,
            user_id=user_id,
        )
    )

    attempted_titles = (
        get_attempted_problem_titles(
            db=db,
            user_id=user_id,
        )
    )

    weak_patterns = (
        get_weak_candidate_patterns(
            db=db,
            user_id=user_id,
        )
    )

    return {

        "attempted_problem_count": len(
            attempted_ids
        ),

        "attempted_problem_ids": (
            attempted_ids
        ),

        "attempted_problem_titles": (
            attempted_titles
        ),

        "weak_patterns": (
            weak_patterns
        ),
    }