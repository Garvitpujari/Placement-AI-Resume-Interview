"""
problem_knowledge_service.py

Provides the complete knowledge package for a coding problem.

The knowledge package contains:
- problem statement
- category / pattern
- difficulty
- known approaches
- brute / better / optimal approaches
- complexities
- common mistakes
- hints
- source information

This module does NOT:
- generate candidate code
- execute code
- judge candidate code
- generate interviewer questions

Its purpose is to provide reliable problem knowledge
to those later modules.
"""

import json

from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from ..database.models import (
    CodingProblem,
    CodingProblemApproach,
    CodingTestCase,
)


# ==========================================================
# JSON Helper
# ==========================================================

def parse_json_list(
    value,
) -> List[Any]:
    """
    Safely convert a JSON string stored in the database
    into a Python list.
    """

    if not value:
        return []

    if isinstance(value, list):
        return value

    try:
        result = json.loads(value)

        if isinstance(result, list):
            return result

        return [result]

    except (
        json.JSONDecodeError,
        TypeError,
    ):
        return []


# ==========================================================
# Load Problem
# ==========================================================

def get_problem(
    db: Session,
    problem_id: int,
) -> Optional[CodingProblem]:
    """
    Retrieve a coding problem by ID.
    """

    return (
        db.query(CodingProblem)
        .filter(
            CodingProblem.id == problem_id
        )
        .first()
    )


# ==========================================================
# Load Approaches
# ==========================================================

def get_problem_approaches(
    db: Session,
    problem_id: int,
) -> List[CodingProblemApproach]:
    """
    Retrieve all known approaches for a problem.
    """

    return (
        db.query(CodingProblemApproach)
        .filter(
            CodingProblemApproach.problem_id
            == problem_id
        )
        .order_by(
            CodingProblemApproach.id
        )
        .all()
    )


# ==========================================================
# Load Test Cases
# ==========================================================

def get_problem_test_cases(
    db: Session,
    problem_id: int,
) -> List[CodingTestCase]:
    """
    Retrieve test cases for the problem.
    """

    return (
        db.query(CodingTestCase)
        .filter(
            CodingTestCase.problem_id
            == problem_id
        )
        .order_by(
            CodingTestCase.id
        )
        .all()
    )


# ==========================================================
# Build Approach Knowledge
# ==========================================================

def build_approach_knowledge(
    approaches: List[CodingProblemApproach],
) -> List[Dict[str, Any]]:
    """
    Convert database approach records into a
    serializable knowledge structure.
    """

    result = []

    for approach in approaches:

        result.append(
            {
                "id": approach.id,
                "name": approach.name,
                "explanation": (
                    approach.explanation
                ),
                "time_complexity": (
                    approach.time_complexity
                ),
                "space_complexity": (
                    approach.space_complexity
                ),
            }
        )

    return result


# ==========================================================
# Build Test Case Knowledge
# ==========================================================

def build_test_case_knowledge(
    test_cases: List[CodingTestCase],
) -> List[Dict[str, Any]]:
    """
    Build test-case information.

    Hidden test cases are represented internally but
    their expected output should not be exposed to
    candidate-facing systems.
    """

    result = []

    for test_case in test_cases:

        item = {
            "id": test_case.id,
            "hidden": bool(
                test_case.hidden
            ),
        }

        if not test_case.hidden:

            item["input"] = (
                test_case.input
            )

            item["expected_output"] = (
                test_case.expected_output
            )

            item["explanation"] = (
                test_case.explanation
            )

        result.append(item)

    return result


# ==========================================================
# Build Complete Knowledge
# ==========================================================

def build_problem_knowledge(
    db: Session,
    problem_id: int,
) -> Dict[str, Any]:
    """
    Build the complete knowledge package for a problem.

    This is the main function used by the judge,
    interviewer, and future problem-analysis modules.
    """

    problem = get_problem(
        db=db,
        problem_id=problem_id,
    )

    if not problem:

        raise ValueError(
            f"Coding problem {problem_id} "
            f"was not found."
        )

    approaches = get_problem_approaches(
        db=db,
        problem_id=problem_id,
    )

    test_cases = get_problem_test_cases(
        db=db,
        problem_id=problem_id,
    )

    knowledge = {
        # --------------------------------------------------
        # Core Problem
        # --------------------------------------------------

        "problem": {
            "id": problem.id,
            "title": problem.title,
            "statement": problem.statement,
            "category": problem.category,
            "difficulty": problem.difficulty,
            "constraints": parse_json_list(
                problem.constraints
            ),
            "examples": parse_json_list(
                problem.examples
            ),
        },

        # --------------------------------------------------
        # Solution Knowledge
        # --------------------------------------------------

        "approaches": build_approach_knowledge(
            approaches
        ),

        "optimal_approach": (
            problem.optimal_approach
        ),

        # --------------------------------------------------
        # Learning Knowledge
        # --------------------------------------------------

        "common_mistakes": parse_json_list(
            problem.common_mistakes
        ),

        "hints": parse_json_list(
            problem.hints
        ),

        # --------------------------------------------------
        # Test Cases
        # --------------------------------------------------

        "test_cases": build_test_case_knowledge(
            test_cases
        ),

        # --------------------------------------------------
        # Source
        # --------------------------------------------------

        "source": problem.source,

        "source_url": problem.source_url,
    }

    return knowledge


# ==========================================================
# Compact Knowledge For LLM
# ==========================================================

def build_llm_knowledge_context(
    knowledge: Dict[str, Any],
) -> str:
    """
    Convert the structured knowledge package into a
    compact textual context for reasoning.

    This keeps the interviewer/judge independent from
    the database representation.
    """

    problem = knowledge["problem"]

    lines = [
        f"Problem: {problem['title']}",
        f"Category: {problem['category']}",
        f"Difficulty: {problem['difficulty']}",
        "",
        "Problem statement:",
        problem["statement"] or "",
        "",
        "Constraints:",
        str(problem["constraints"]),
        "",
        "Known approaches:",
    ]

    for index, approach in enumerate(
        knowledge["approaches"],
        start=1,
    ):

        lines.extend(
            [
                "",
                f"Approach {index}: "
                f"{approach['name']}",
                (
                    "Explanation: "
                    f"{approach['explanation'] or ''}"
                ),
                (
                    "Time: "
                    f"{approach['time_complexity'] or 'Unknown'}"
                ),
                (
                    "Space: "
                    f"{approach['space_complexity'] or 'Unknown'}"
                ),
            ]
        )

    if knowledge["optimal_approach"]:

        lines.extend(
            [
                "",
                "Optimal approach:",
                knowledge["optimal_approach"],
            ]
        )

    if knowledge["common_mistakes"]:

        lines.extend(
            [
                "",
                "Common mistakes:",
                str(
                    knowledge["common_mistakes"]
                ),
            ]
        )

    if knowledge["hints"]:

        lines.extend(
            [
                "",
                "Hints:",
                str(
                    knowledge["hints"]
                ),
            ]
        )

    return "\n".join(lines)