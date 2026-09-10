"""
problem_validator.py

Validates an enriched coding problem before it is allowed
into the global Placement AI problem bank.

This module does NOT:
- Research problems.
- Generate problems.
- Execute candidate code.
- Judge candidate submissions.

Its only job is to protect the problem bank from incomplete
or unusable problem knowledge.
"""

from typing import Any, Dict, List


# ==========================================================
# Required Fields
# ==========================================================

REQUIRED_FIELDS = [
    "title",
    "statement",
    "category",
    "difficulty",
    "problem_identity",
    "core_intuition",
]


# ==========================================================
# Allowed Difficulties
# ==========================================================

ALLOWED_DIFFICULTIES = {
    "easy",
    "medium",
    "hard",
}


# ==========================================================
# Helpers
# ==========================================================

def _clean(value: Any) -> str:
    """
    Safely convert a value into a stripped string.
    """

    if value is None:
        return ""

    return str(value).strip()


def _is_non_empty_list(
    value: Any,
) -> bool:
    """
    Check whether a value is a non-empty list.
    """

    return (
        isinstance(value, list)
        and len(value) > 0
    )


# ==========================================================
# Validate Required Fields
# ==========================================================

def validate_required_fields(
    problem: Dict[str, Any],
) -> List[str]:
    """
    Validate fields that every problem must have.
    """

    errors = []

    for field in REQUIRED_FIELDS:

        if not _clean(
            problem.get(field)
        ):

            errors.append(
                f"Missing required field: {field}"
            )

    return errors


# ==========================================================
# Validate Problem Identity
# ==========================================================

def validate_problem_identity(
    problem: Dict[str, Any],
) -> List[str]:
    """
    Make sure the problem has enough information to
    identify its underlying algorithmic purpose.
    """

    errors = []

    identity = _clean(
        problem.get(
            "problem_identity"
        )
    )

    intuition = _clean(
        problem.get(
            "core_intuition"
        )
    )

    if len(identity) < 10:

        errors.append(
            "Problem identity is too short."
        )

    if len(intuition) < 10:

        errors.append(
            "Core intuition is too short."
        )

    return errors


# ==========================================================
# Validate Difficulty
# ==========================================================

def validate_difficulty(
    problem: Dict[str, Any],
) -> List[str]:
    """
    Validate difficulty normalization.
    """

    errors = []

    difficulty = _clean(
        problem.get(
            "difficulty"
        )
    ).lower()

    if difficulty not in ALLOWED_DIFFICULTIES:

        errors.append(
            "Difficulty must be one of: "
            "easy, medium, hard."
        )

    return errors


# ==========================================================
# Validate Pattern Knowledge
# ==========================================================

def validate_patterns(
    problem: Dict[str, Any],
) -> List[str]:
    """
    Validate pattern knowledge.

    A problem should normally have at least one pattern
    or a clearly defined algorithmic category.
    """

    errors = []

    category = _clean(
        problem.get(
            "category"
        )
    )

    primary_pattern = _clean(
        problem.get(
            "primary_pattern"
        )
    )

    secondary_patterns = problem.get(
        "secondary_patterns",
        [],
    )

    if not category:

        errors.append(
            "Problem category is missing."
        )

    if not primary_pattern and not _is_non_empty_list(
        secondary_patterns
    ):

        errors.append(
            "No algorithmic pattern identified."
        )

    return errors


# ==========================================================
# Validate Approaches
# ==========================================================

def validate_approaches(
    problem: Dict[str, Any],
) -> List[str]:
    """
    Validate solution approaches.
    """

    errors = []

    approaches = problem.get(
        "approaches",
        [],
    )

    if not _is_non_empty_list(
        approaches
    ):

        errors.append(
            "At least one solution approach "
            "is required."
        )

        return errors

    for index, approach in enumerate(
        approaches
    ):

        if not isinstance(
            approach,
            dict,
        ):

            errors.append(
                f"Approach {index + 1} "
                "must be an object."
            )

            continue

        if not _clean(
            approach.get("name")
        ):

            errors.append(
                f"Approach {index + 1} "
                "has no name."
            )

        if not _clean(
            approach.get("explanation")
        ):

            errors.append(
                f"Approach {index + 1} "
                "has no explanation."
            )

    if not _clean(
        problem.get(
            "optimal_approach"
        )
    ):

        errors.append(
            "Optimal approach is missing."
        )

    return errors


# ==========================================================
# Validate Interview Knowledge
# ==========================================================

def validate_interview_knowledge(
    problem: Dict[str, Any],
) -> List[str]:
    """
    Validate the knowledge required for adaptive
    interviewing.
    """

    errors = []

    if not _is_non_empty_list(
        problem.get(
            "recognition_signals",
            [],
        )
    ):

        errors.append(
            "Recognition signals are missing."
        )

    if not _is_non_empty_list(
        problem.get(
            "when_to_use",
            [],
        )
    ):

        errors.append(
            "When-to-use knowledge is missing."
        )

    if not _is_non_empty_list(
        problem.get(
            "key_concepts",
            [],
        )
    ):

        errors.append(
            "Key concepts are missing."
        )

    return errors


# ==========================================================
# Validate Candidate Assistance
# ==========================================================

def validate_hints(
    problem: Dict[str, Any],
) -> List[str]:
    """
    Validate progressive candidate hints.
    """

    errors = []

    hints = problem.get(
        "hints",
        [],
    )

    if not _is_non_empty_list(
        hints
    ):

        errors.append(
            "At least one hint is required."
        )

    return errors


# ==========================================================
# Validate Execution Data
# ==========================================================

def validate_test_cases(
    problem: Dict[str, Any],
) -> List[str]:
    """
    Validate test cases.

    The execution engine, not the LLM, will later determine
    whether candidate code passes these tests.

    This validator only checks that usable test cases exist.
    """

    errors = []

    test_cases = problem.get(
        "test_cases",
        [],
    )

    if not _is_non_empty_list(
        test_cases
    ):

        errors.append(
            "At least one test case is required."
        )

        return errors

    for index, test_case in enumerate(
        test_cases
    ):

        if not isinstance(
            test_case,
            dict,
        ):

            errors.append(
                f"Test case {index + 1} "
                "must be an object."
            )

            continue

        if not _clean(
            test_case.get("input")
        ):

            errors.append(
                f"Test case {index + 1} "
                "has no input."
            )

        if not _clean(
            test_case.get(
                "expected_output"
            )
        ):

            errors.append(
                f"Test case {index + 1} "
                "has no expected output."
            )

    return errors


# ==========================================================
# Validate Complete Problem
# ==========================================================

def validate_problem(
    problem: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Run all validation checks.

    Returns:

        {
            "valid": True/False,
            "errors": [...]
        }
    """

    if not isinstance(
        problem,
        dict,
    ):

        return {
            "valid": False,
            "errors": [
                "Problem must be a dictionary."
            ],
        }

    errors = []

    errors.extend(
        validate_required_fields(
            problem
        )
    )

    errors.extend(
        validate_problem_identity(
            problem
        )
    )

    errors.extend(
        validate_difficulty(
            problem
        )
    )

    errors.extend(
        validate_patterns(
            problem
        )
    )

    errors.extend(
        validate_approaches(
            problem
        )
    )

    errors.extend(
        validate_interview_knowledge(
            problem
        )
    )

    errors.extend(
        validate_hints(
            problem
        )
    )

    errors.extend(
        validate_test_cases(
            problem
        )
    )

    return {
        "valid": len(errors) == 0,
        "errors": errors,
    }


# ==========================================================
# Convenience Function
# ==========================================================

def is_valid_problem(
    problem: Dict[str, Any],
) -> bool:
    """
    Simple True/False validation helper.
    """

    result = validate_problem(
        problem
    )

    return result["valid"]