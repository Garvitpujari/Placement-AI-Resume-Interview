"""
problem_repository.py

Retrieval layer for the global coding-problem bank.

Responsibilities:
- Retrieve a problem from PostgreSQL.
- Retrieve its AI knowledge.
- Retrieve all known approaches.
- Retrieve all test cases.
- Return the complete reusable problem package.

This module does NOT:
- Call the LLM.
- Select a problem for a candidate.
- Analyze candidate code.
- Execute candidate code.
"""

from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from app.coding.crud import (
    get_coding_problem_by_id,
    get_problem_knowledge,
    get_problem_approaches,
    get_problem_test_cases,
)


# ==========================================================
# Deserialize JSON-like Database Fields
# ==========================================================

def _load_json(value):
    """
    Safely deserialize fields stored as JSON strings.
    """

    if value is None:
        return []

    if isinstance(value, (list, dict)):
        return value

    try:
        import json

        return json.loads(value)

    except Exception:
        return []


# ==========================================================
# Knowledge Serialization
# ==========================================================

def serialize_problem_knowledge(
    knowledge,
) -> Optional[Dict[str, Any]]:
    """
    Convert CodingProblemKnowledge into a plain dictionary.
    """

    if knowledge is None:
        return None

    return {
        "id": knowledge.id,

        "problem_identity": (
            knowledge.problem_identity
        ),

        "core_intuition": (
            knowledge.core_intuition
        ),

        "primary_pattern": (
            knowledge.primary_pattern
        ),

        "secondary_patterns": _load_json(
            knowledge.secondary_patterns
        ),

        "recognition_signals": _load_json(
            knowledge.recognition_signals
        ),

        "when_to_use": _load_json(
            knowledge.when_to_use
        ),

        "when_not_to_use": _load_json(
            knowledge.when_not_to_use
        ),

        "key_concepts": _load_json(
            knowledge.key_concepts
        ),

        "important_observations": _load_json(
            knowledge.important_observations
        ),

        "edge_cases": _load_json(
            knowledge.edge_cases
        ),

        "interviewer_focus": _load_json(
            knowledge.interviewer_focus
        ),

        "follow_up_questions": _load_json(
            knowledge.follow_up_questions
        ),

        "strong_candidate_signals": _load_json(
            knowledge.strong_candidate_signals
        ),

        "weak_candidate_signals": _load_json(
            knowledge.weak_candidate_signals
        ),
    }


# ==========================================================
# Approach Serialization
# ==========================================================

def serialize_approach(
    approach,
) -> Dict[str, Any]:
    """
    Convert one approach ORM object into a dictionary.
    """

    return {
        "id": approach.id,
        "name": approach.name,
        "explanation": approach.explanation,
        "time_complexity": (
            approach.time_complexity
        ),
        "space_complexity": (
            approach.space_complexity
        ),
    }


# ==========================================================
# Test Case Serialization
# ==========================================================

def serialize_test_case(
    test_case,
) -> Dict[str, Any]:
    """
    Convert one test case ORM object into a dictionary.

    Hidden information remains in the internal package.
    The candidate-safe execution layer is responsible for
    deciding what may be exposed.
    """

    return {
        "id": test_case.id,

        "input": test_case.input,

        "expected_output": (
            test_case.expected_output
        ),

        "explanation": (
            test_case.explanation
        ),

        "hidden": bool(
            test_case.hidden
        ),
    }


# ==========================================================
# Retrieve Complete Problem Package
# ==========================================================

def get_problem_package(
    db: Session,
    problem_id: int,
) -> Optional[Dict[str, Any]]:
    """
    Retrieve the complete knowledge package for a problem.

    Returns:

        {
            "problem": {...},
            "knowledge": {...},
            "approaches": [...],
            "test_cases": [...]
        }

    Returns None if the problem does not exist.
    """

    problem = get_coding_problem_by_id(
        db=db,
        problem_id=problem_id,
    )

    if problem is None:
        return None

    knowledge = get_problem_knowledge(
        db=db,
        problem_id=problem_id,
    )

    approaches = get_problem_approaches(
        db=db,
        problem_id=problem_id,
    )

    test_cases = get_problem_test_cases(
        db=db,
        problem_id=problem_id,
    )

    return {

        # ==================================================
        # Canonical Problem
        # ==================================================

        "problem": {

            "id": problem.id,

            "title": problem.title,

            "statement": problem.statement,

            "category": problem.category,

            "difficulty": problem.difficulty,

            "constraints": _load_json(
                problem.constraints
            ),

            "examples": _load_json(
                problem.examples
            ),

            "optimal_approach": (
                problem.optimal_approach
            ),

            "common_mistakes": _load_json(
                problem.common_mistakes
            ),

            "hints": _load_json(
                problem.hints
            ),

            "source": problem.source,

            "source_url": problem.source_url,
        },

        # ==================================================
        # AI Routing Knowledge
        # ==================================================

        "knowledge": serialize_problem_knowledge(
            knowledge
        ),

        # ==================================================
        # Known Solution Approaches
        # ==================================================

        "approaches": [
            serialize_approach(
                approach
            )
            for approach in approaches
        ],

        # ==================================================
        # Deterministic Test Cases
        # ==================================================

        "test_cases": [
            serialize_test_case(
                test_case
            )
            for test_case in test_cases
        ],
    }


# ==========================================================
# Retrieve By Title
# ==========================================================

def get_problem_package_by_title(
    db: Session,
    title: str,
) -> Optional[Dict[str, Any]]:
    """
    Retrieve a complete problem package by title.
    """

    from app.coding.crud import (
        get_coding_problem,
    )

    problem = get_coding_problem(
        db=db,
        title=title,
    )

    if problem is None:
        return None

    return get_problem_package(
        db=db,
        problem_id=problem.id,
    )


# ==========================================================
# Compact Problem Summary
# ==========================================================

def get_problem_routing_context(
    db: Session,
    problem_id: int,
) -> Optional[Dict[str, Any]]:
    """
    Return only the information required by the future
    problem-selection/routing layer.

    Candidate code is NOT involved here.
    """

    package = get_problem_package(
        db=db,
        problem_id=problem_id,
    )

    if package is None:
        return None

    problem = package["problem"]
    knowledge = package["knowledge"]

    if knowledge is None:
        return {
            "problem_id": problem["id"],
            "title": problem["title"],
            "category": problem["category"],
            "difficulty": problem["difficulty"],
            "primary_pattern": None,
            "secondary_patterns": [],
            "recognition_signals": [],
            "when_to_use": [],
            "when_not_to_use": [],
            "key_concepts": [],
        }

    return {
        "problem_id": problem["id"],

        "title": problem["title"],

        "category": problem["category"],

        "difficulty": problem["difficulty"],

        "primary_pattern": (
            knowledge["primary_pattern"]
        ),

        "secondary_patterns": (
            knowledge["secondary_patterns"]
        ),

        "recognition_signals": (
            knowledge["recognition_signals"]
        ),

        "when_to_use": (
            knowledge["when_to_use"]
        ),

        "when_not_to_use": (
            knowledge["when_not_to_use"]
        ),

        "key_concepts": (
            knowledge["key_concepts"]
        ),
    }