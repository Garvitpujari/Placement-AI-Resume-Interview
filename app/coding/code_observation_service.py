"""
code_observation_service.py

Observes changes in the candidate's code during a live
coding session.

Responsibilities:
- Compare previous and current code.
- Detect meaningful coding changes.
- Identify simple coding patterns.
- Store observations in PostgreSQL.
- Return observations for the live interviewer.

This module does NOT:
- Decide whether the final solution is optimal.
- Execute code.
- Generate the coding problem.
- Directly interrupt the candidate.
- Perform deep LLM analysis.

The first version intentionally uses lightweight heuristics.
A later analysis layer can use AST + LLM analysis.
"""

from typing import List, Dict, Any

from sqlalchemy.orm import Session

from .crud import (
    save_coding_observation,
)


# ==========================================================
# Basic Code Comparison
# ==========================================================

def normalize_code(
    code: str,
) -> str:
    """
    Normalize code before comparison.
    """

    if not code:
        return ""

    return "\n".join(
        line.rstrip()
        for line in code.strip().splitlines()
    )


def code_changed(
    previous_code: str,
    current_code: str,
) -> bool:
    """
    Check whether meaningful code changes occurred.
    """

    return (
        normalize_code(previous_code)
        != normalize_code(current_code)
    )


# ==========================================================
# Pattern Detection
# ==========================================================

def detect_patterns(
    code: str,
) -> List[Dict[str, Any]]:
    """
    Detect simple coding patterns.

    This is intentionally lightweight.

    Later this will be replaced/extended with:
        AST analysis
        complexity analysis
        semantic analysis
        LLM reasoning
    """

    observations = []

    if not code:
        return observations

    code_lower = code.lower()

    # ------------------------------------------------------
    # unordered_map
    # ------------------------------------------------------

    if (
        "unordered_map" in code_lower
        or "unordered_map<" in code_lower
    ):
        observations.append(
            {
                "observation": (
                    "Candidate is using unordered_map."
                ),
                "category": "Data Structure",
                "severity": "info",
                "evidence": "unordered_map",
                "should_intervene": False,
            }
        )

    # ------------------------------------------------------
    # map
    # ------------------------------------------------------

    if (
        "map<" in code_lower
        or "std::map" in code_lower
    ):

        observations.append(
            {
                "observation": (
                    "Candidate is using an ordered map."
                ),
                "category": "Data Structure",
                "severity": "info",
                "evidence": "map",
                "should_intervene": False,
            }
        )

    # ------------------------------------------------------
    # set
    # ------------------------------------------------------

    if (
        "set<" in code_lower
        or "unordered_set" in code_lower
    ):

        observations.append(
            {
                "observation": (
                    "Candidate is using a set-based "
                    "data structure."
                ),
                "category": "Data Structure",
                "severity": "info",
                "evidence": "set/unordered_set",
                "should_intervene": False,
            }
        )

    # ------------------------------------------------------
    # Nested loops
    # ------------------------------------------------------

    loop_count = (
        code.count("for")
        + code.count("while")
    )

    if loop_count >= 2:

        observations.append(
            {
                "observation": (
                    "Candidate currently has multiple "
                    "loops in the solution."
                ),
                "category": "Complexity",
                "severity": "info",
                "evidence": (
                    f"Detected approximately "
                    f"{loop_count} loop keywords."
                ),
                "should_intervene": False,
            }
        )

    # ------------------------------------------------------
    # Sorting
    # ------------------------------------------------------

    if (
        "sort(" in code_lower
        or "std::sort" in code_lower
    ):

        observations.append(
            {
                "observation": (
                    "Candidate is using sorting."
                ),
                "category": "Algorithm",
                "severity": "info",
                "evidence": "sort",
                "should_intervene": False,
            }
        )

    # ------------------------------------------------------
    # Stack
    # ------------------------------------------------------

    if "stack<" in code_lower:

        observations.append(
            {
                "observation": (
                    "Candidate is using a stack."
                ),
                "category": "Data Structure",
                "severity": "info",
                "evidence": "stack",
                "should_intervene": False,
            }
        )

    # ------------------------------------------------------
    # Queue
    # ------------------------------------------------------

    if (
        "queue<" in code_lower
        or "priority_queue" in code_lower
    ):

        observations.append(
            {
                "observation": (
                    "Candidate is using a queue-based "
                    "data structure."
                ),
                "category": "Data Structure",
                "severity": "info",
                "evidence": "queue/priority_queue",
                "should_intervene": False,
            }
        )

    # ------------------------------------------------------
    # Recursion
    # ------------------------------------------------------

    if "recursive" in code_lower:

        observations.append(
            {
                "observation": (
                    "Candidate may be using recursion."
                ),
                "category": "Algorithm",
                "severity": "info",
                "evidence": "recursive",
                "should_intervene": False,
            }
        )

    # ------------------------------------------------------
    # Dynamic programming indicators
    # ------------------------------------------------------

    if (
        "dp[" in code_lower
        or "memo" in code_lower
        or "memoization" in code_lower
    ):

        observations.append(
            {
                "observation": (
                    "Candidate appears to be using "
                    "dynamic programming or memoization."
                ),
                "category": "Algorithm",
                "severity": "info",
                "evidence": "dp/memoization",
                "should_intervene": False,
            }
        )

    return observations


# ==========================================================
# Detect Changes Between Versions
# ==========================================================

def detect_code_changes(
    previous_code: str,
    current_code: str,
) -> List[Dict[str, Any]]:
    """
    Compare two code versions and identify meaningful
    changes.
    """

    observations = []

    previous = normalize_code(
        previous_code
    )

    current = normalize_code(
        current_code
    )

    if previous == current:
        return observations

    # ------------------------------------------------------
    # Data structure introduced
    # ------------------------------------------------------

    structures = [
        "unordered_map",
        "map",
        "unordered_set",
        "set",
        "vector",
        "stack",
        "queue",
        "priority_queue",
    ]

    for structure in structures:

        if (
            structure in current
            and structure not in previous
        ):

            observations.append(
                {
                    "observation": (
                        f"Candidate introduced "
                        f"{structure}."
                    ),
                    "category": "Data Structure Change",
                    "severity": "info",
                    "evidence": structure,
                    "should_intervene": True,
                }
            )

    # ------------------------------------------------------
    # Sorting introduced
    # ------------------------------------------------------

    if (
        "sort(" in current
        and "sort(" not in previous
    ):

        observations.append(
            {
                "observation": (
                    "Candidate introduced sorting "
                    "into the solution."
                ),
                "category": "Algorithm Change",
                "severity": "info",
                "evidence": "sort()",
                "should_intervene": False,
            }
        )

    # ------------------------------------------------------
    # Nested-loop pattern
    # ------------------------------------------------------

    previous_loops = (
        previous.count("for")
        + previous.count("while")
    )

    current_loops = (
        current.count("for")
        + current.count("while")
    )

    if current_loops > previous_loops:

        observations.append(
            {
                "observation": (
                    "Candidate added additional "
                    "loop-based logic."
                ),
                "category": "Complexity Change",
                "severity": "info",
                "evidence": (
                    f"loops: "
                    f"{previous_loops} → "
                    f"{current_loops}"
                ),
                "should_intervene": False,
            }
        )

    # ------------------------------------------------------
    # Code became substantially larger
    # ------------------------------------------------------

    previous_lines = len(
        previous.splitlines()
    )

    current_lines = len(
        current.splitlines()
    )

    if (
        current_lines
        > previous_lines + 15
    ):

        observations.append(
            {
                "observation": (
                    "Candidate substantially expanded "
                    "the implementation."
                ),
                "category": "Coding Progress",
                "severity": "info",
                "evidence": (
                    f"lines: "
                    f"{previous_lines} → "
                    f"{current_lines}"
                ),
                "should_intervene": False,
            }
        )

    return observations


# ==========================================================
# Analyze Code Snapshot
# ==========================================================

def observe_code(
    db: Session,
    session_id: int,
    previous_code: str,
    current_code: str,
) -> List[Dict[str, Any]]:
    """
    Analyze a new code version and persist meaningful
    observations.

    Returns the observations generated for this change.
    """

    print(
        "\n========== CODE OBSERVATION =========="
    )

    if not code_changed(
        previous_code,
        current_code,
    ):

        print(
            "No meaningful code change detected."
        )

        return []

    observations = []

    # ======================================================
    # Detect Version Changes
    # ======================================================

    changes = detect_code_changes(
        previous_code=previous_code,
        current_code=current_code,
    )

    observations.extend(
        changes
    )

    # ======================================================
    # Detect Current Patterns
    # ======================================================

    patterns = detect_patterns(
        code=current_code,
    )

    observations.extend(
        patterns
    )

    # ======================================================
    # Remove Duplicate Observations
    # ======================================================

    unique = {}

    for item in observations:

        key = (
            item["category"],
            item["observation"],
        )

        unique[key] = item

    observations = list(
        unique.values()
    )

    # ======================================================
    # Save Observations
    # ======================================================

    for item in observations:

        save_coding_observation(
            db=db,
            session_id=session_id,
            observation=item["observation"],
            category=item["category"],
            severity=item.get(
                "severity"
            ),
            evidence=item.get(
                "evidence"
            ),
            should_intervene=item.get(
                "should_intervene",
                False,
            ),
        )

        print(
            f"- [{item['category']}] "
            f"{item['observation']}"    
        )

    print(
        "======================================"
    )

    return observations