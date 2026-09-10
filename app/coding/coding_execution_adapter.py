"""
coding_execution_adapter.py

Interview-friendly execution adapter.

Responsibilities:
- Infer the candidate function name from the problem title.
- Parse stored JSON test-case inputs.
- Wrap normal candidate function code into an executable
  stdin/stdout Python program.
- Parse candidate output.
- Compare structured outputs.
- Support unordered outputs.

This module does NOT:
- Execute processes directly.
- Compile C++.
- Judge solution quality.
- Generate interviewer questions.
- Persist execution results.
"""

import ast
import json
import re
from typing import Any, Dict


# ==========================================================
# Function Name Helpers
# ==========================================================

def snake_case(
    value: str,
) -> str:
    """
    Convert a problem title into a conventional
    Python function name.

    Example:

        Group Anagrams
        -> group_anagrams
    """

    value = re.sub(
        r"[^a-zA-Z0-9]+",
        "_",
        value.strip(),
    )

    value = re.sub(
        r"_+",
        "_",
        value,
    )

    return value.strip("_").lower()


def infer_function_name(
    title: str,
) -> str:
    """
    Infer the Python function name from the
    coding problem title.
    """

    if not title:
        raise ValueError(
            "Problem title is required to infer "
            "the candidate function name."
        )

    return snake_case(title)


# ==========================================================
# Parse Test Input
# ==========================================================

def parse_test_input(
    input_data: str,
) -> Any:
    """
    Parse a stored test-case input.

    JSON is preferred.

    Python literal parsing is retained as
    a compatibility fallback.
    """

    if input_data is None:
        return None

    text = input_data.strip()

    if not text:
        return None

    try:

        return json.loads(
            text
        )

    except json.JSONDecodeError:

        try:

            return ast.literal_eval(
                text
            )

        except (
            ValueError,
            SyntaxError,
        ) as exc:

            raise ValueError(
                "Unable to parse test-case input: "
                f"{input_data}"
            ) from exc


# ==========================================================
# Serialize Output
# ==========================================================

def serialize_output(
    value: Any,
) -> str:
    """
    Serialize a Python value as compact JSON.
    """

    return json.dumps(
        value,
        ensure_ascii=False,
        separators=(",", ":"),
    )


# ==========================================================
# Canonicalize Output
# ==========================================================

def canonicalize_output(
    value: Any,
) -> Any:
    """
    Recursively canonicalize collection output.

    This is used for problems where output ordering
    is not semantically important.

    Example:

        [
            ["tan", "nat"],
            ["eat", "tea", "ate"]
        ]

    can be compared independently of group ordering.
    """

    if isinstance(value, list):

        canonical_items = [
            canonicalize_output(item)
            for item in value
        ]

        # --------------------------------------------------
        # Nested lists
        # --------------------------------------------------

        if all(
            isinstance(
                item,
                list,
            )
            for item in canonical_items
        ):

            return sorted(
                canonical_items,
                key=serialize_output,
            )

        # --------------------------------------------------
        # Scalar lists
        # --------------------------------------------------

        if all(
            isinstance(
                item,
                (
                    str,
                    int,
                    float,
                    bool,
                    type(None),
                ),
            )
            for item in canonical_items
        ):

            return sorted(
                canonical_items,
                key=lambda item: (
                    str(type(item)),
                    str(item),
                ),
            )

        return canonical_items

    if isinstance(value, dict):

        return {
            key: canonicalize_output(
                value[key]
            )
            for key in sorted(value)
        }

    return value


# ==========================================================
# Compare Outputs
# ==========================================================

def outputs_equal(
    actual: Any,
    expected: Any,
    unordered: bool = False,
) -> bool:
    """
    Compare actual and expected values.

    When unordered=True, collection ordering
    is ignored.
    """

    if unordered:

        actual = canonicalize_output(
            actual
        )

        expected = canonicalize_output(
            expected
        )

    return actual == expected


# ==========================================================
# Build Python Wrapper
# ==========================================================

def build_python_wrapper(
    candidate_code: str,
    function_name: str,
) -> str:
    """
    Build an executable wrapper around candidate code.

    The current Placement AI test-case format represents
    the complete function argument structure.

    Example:

        Stored input:
            ["a", "b"]

        Candidate function:
            function(values)

        Wrapper calls:
            function(["a", "b"])

    Therefore we do NOT automatically unpack lists.

    This is especially important for:

        [""]

    which must become:

        group_anagrams([""])

    rather than:

        group_anagrams("")
    """

    return f'''
import json

{candidate_code}

_raw_input = input()

_input = json.loads(
    _raw_input
)

_result = {function_name}(
    _input
)

print(
    json.dumps(
        _result,
        ensure_ascii=False,
        separators=(",", ":"),
    )
)
'''


# ==========================================================
# Build Execution Contract
# ==========================================================

def build_execution_contract(
    problem,
) -> Dict[str, Any]:
    """
    Build the Python execution contract for a problem.

    The current CodingProblem model does not contain
    an explicit function-name field.

    Therefore the function name is inferred from title.

    The problem statement is also inspected to determine
    whether output ordering is explicitly arbitrary.
    """

    title = (
        getattr(
            problem,
            "title",
            "",
        )
        or ""
    )

    statement = (
        getattr(
            problem,
            "statement",
            "",
        )
        or ""
    )

    function_name = infer_function_name(
        title
    )

    unordered_output = bool(
        re.search(
            r"(any order|any ordering|"
            r"order does not matter)",
            statement,
            flags=re.IGNORECASE,
        )
    )

    return {
        "language": "python",
        "function_name": function_name,
        "unordered_output": unordered_output,
    }


# ==========================================================
# Adapt Candidate Code
# ==========================================================

def adapt_candidate_code(
    problem,
    candidate_code: str,
) -> Dict[str, Any]:
    """
    Convert candidate function code into an executable
    stdin/stdout Python program.

    Returns:

        {
            "code": "...",
            "function_name": "...",
            "unordered_output": True/False,
        }
    """

    if not candidate_code:
        raise ValueError(
            "Candidate code is empty."
        )

    if not candidate_code.strip():
        raise ValueError(
            "Candidate code is empty."
        )

    contract = build_execution_contract(
        problem
    )

    function_name = contract[
        "function_name"
    ]

    executable_code = build_python_wrapper(
        candidate_code=candidate_code,
        function_name=function_name,
    )

    return {
        "code": executable_code,
        "function_name": function_name,
        "unordered_output": (
            contract["unordered_output"]
        ),
    }


# ==========================================================
# Parse Function Output
# ==========================================================

def parse_function_output(
    output: str,
) -> Any:
    """
    Parse JSON printed by the Python wrapper.
    """

    normalized = (
        output or ""
    ).strip()

    if not normalized:

        raise ValueError(
            "Candidate program produced no output."
        )

    try:

        return json.loads(
            normalized
        )

    except json.JSONDecodeError as exc:

        raise ValueError(
            "Candidate function output is not "
            "valid JSON: "
            f"{normalized}"
        ) from exc


# ==========================================================
# Compare Function Result
# ==========================================================

def compare_function_result(
    actual_output: str,
    expected_output: str,
    unordered_output: bool = False,
) -> bool:
    """
    Compare the candidate's structured function
    output against the stored expected output.
    """

    actual = parse_function_output(
        actual_output
    )

    expected = parse_test_input(
        expected_output
    )

    return outputs_equal(
        actual=actual,
        expected=expected,
        unordered=unordered_output,
    )