"""
execution_service.py

Connects code execution with the coding-session database.

Responsibilities:
- Load the coding problem's test cases.
- Execute candidate code.
- Save execution results to PostgreSQL.
- Update CodingSessionState.
- Keep hidden-test information private.

Important assessment behavior:
- Run executes ONLY visible/sample tests.
- Final Submit can execute visible + hidden tests.
- Run must NOT mark the coding session as submitted.
- Hidden test inputs/expected outputs are never exposed to the candidate.

This module does NOT:
- Analyze whether the solution is optimal.
- Generate interviewer questions.
- Analyze candidate reasoning.
"""

from sqlalchemy.orm import Session

from ..database.models import (
    CodingTestCase,
)

from .crud import (
    save_code_execution,
)

from .state import (
    CodingSessionState,
    CodeExecutionState,
)

from .code_execution_service import (
    execute_code,
)


# ==========================================================
# Load Test Cases
# ==========================================================

def get_execution_test_cases(
    db: Session,
    problem_id: int,
    include_hidden: bool = True,
):
    """
    Load test cases belonging to a coding problem.

    Parameters
    ----------
    db:
        SQLAlchemy database session.

    problem_id:
        CodingProblem ID.

    include_hidden:
        True:
            Return visible + hidden tests.

        False:
            Return only visible/sample tests.

    Normal coding submission keeps the original behavior because
    include_hidden defaults to True.

    Assessment Run explicitly passes include_hidden=False.
    """

    query = (
        db.query(CodingTestCase)
        .filter(
            CodingTestCase.problem_id
            == problem_id
        )
    )

    if not include_hidden:
        query = query.filter(
            CodingTestCase.hidden == 0
        )

    test_cases = query.all()

    if not test_cases:
        raise ValueError(
            f"No test cases found for problem {problem_id}."
        )

    return test_cases


# ==========================================================
# Execute Submission
# ==========================================================

def execute_submission(
    db: Session,
    state: CodingSessionState,
    code: str = None,
    include_hidden: bool = True,
):
    """
    Execute candidate code and persist the execution result.

    Parameters
    ----------
    db:
        SQLAlchemy database session.

    state:
        Current coding session state.

    code:
        Candidate source code. If omitted, state.current_code
        is used.

    include_hidden:
        True:
            Execute visible + hidden tests.

        False:
            Execute visible/sample tests only.

    Returns
    -------
    ExecutionResult

    Important:
    ----------
    include_hidden=False is intended for the assessment
    "Run" action.

    include_hidden=True is intended for final submission.

    A visible-only Run NEVER marks the session as submitted.
    """

    # ------------------------------------------------------
    # Validate session
    # ------------------------------------------------------

    if not state.session_id:
        raise ValueError(
            "Coding session ID is required."
        )

    if not state.problem_id:
        raise ValueError(
            "Problem ID is required."
        )

    # ------------------------------------------------------
    # Resolve code
    # ------------------------------------------------------

    if code is None:
        code = state.current_code

    if not code or not code.strip():
        raise ValueError(
            "Cannot execute empty code."
        )

    print(
        "\n======================================"
    )

    print(
        "EXECUTING CODING SUBMISSION"
    )

    print(
        "======================================"
    )

    # ------------------------------------------------------
    # Load appropriate test cases
    # ------------------------------------------------------

    test_cases = get_execution_test_cases(
        db=db,
        problem_id=state.problem_id,
        include_hidden=include_hidden,
    )

    print(
        f"Loaded {len(test_cases)} "
        f"{'visible + hidden' if include_hidden else 'visible'} "
        f"test cases."
    )

    # ------------------------------------------------------
    # Execute code
    # ------------------------------------------------------

    result = execute_code(
        code=code,
        language=state.language,
        test_cases=test_cases,
        problem_title=state.problem_title,
    )

    # ------------------------------------------------------
    # Persist execution
    # ------------------------------------------------------

    save_code_execution(
        db=db,
        session_id=state.session_id,
        code=code,
        language=state.language,
        passed=result.passed,
        passed_tests=result.passed_tests,
        total_tests=result.total_tests,
        stdout=result.stdout,
        stderr=result.stderr,
        error=result.error,
        execution_time_ms=result.execution_time_ms,
    )

    # ------------------------------------------------------
    # Convert execution result to runtime state
    # ------------------------------------------------------

    execution_state = CodeExecutionState(
        code=code,
        language=state.language,
        passed=result.passed,
        passed_tests=result.passed_tests,
        total_tests=result.total_tests,
        stdout=result.stdout,
        stderr=result.stderr,
        error=result.error,
        execution_time_ms=result.execution_time_ms,
    )

    state.last_execution = execution_state

    if state.executions is None:
        state.executions = []

    state.executions.append(
        execution_state
    )

    # ------------------------------------------------------
    # CRITICAL:
    #
    # Run -> submitted must remain False.
    #
    # Final submit -> submitted becomes True.
    # ------------------------------------------------------

    if include_hidden:
        state.submitted = True

    # ------------------------------------------------------
    # Logging
    # ------------------------------------------------------

    print(
        "\n======================================"
    )

    print(
        "EXECUTION SAVED"
    )

    print(
        f"Passed: "
        f"{result.passed_tests}/"
        f"{result.total_tests}"
    )

    print(
        f"Status: "
        f"{'PASS' if result.passed else 'FAIL'}"
    )

    print(
        f"Hidden tests included: "
        f"{include_hidden}"
    )

    print(
        f"Session submitted: "
        f"{state.submitted}"
    )

    print(
        "======================================"
    )

    return result


# ==========================================================
# Candidate-Safe Result
# ==========================================================

def get_candidate_execution_result(
    result,
    test_cases,
):
    """
    Convert an internal execution result into information that
    is safe to return to the candidate.

    Visible tests:
        - test number
        - pass/fail
        - input
        - expected output
        - actual output
        - execution time

    Hidden tests:
        - test number
        - pass/fail
        - execution time
        - hidden=True

    Hidden test input and expected output are NEVER returned.
    """

    visible_results = []

    # ------------------------------------------------------
    # Defensive handling
    # ------------------------------------------------------

    test_results = getattr(
        result,
        "test_results",
        [],
    )

    # ------------------------------------------------------
    # Build candidate-safe test information
    # ------------------------------------------------------

    for index, test_result in enumerate(
        test_results
    ):

        # The execution result and test-case list should normally
        # have the same length. Keep the guard here so malformed
        # execution data cannot accidentally expose information.

        if index >= len(test_cases):
            break

        test_case = test_cases[index]

        item = {
            "test_number": index + 1,

            "passed": bool(
                getattr(
                    test_result,
                    "passed",
                    False,
                )
            ),

            "execution_time_ms": getattr(
                test_result,
                "execution_time_ms",
                None,
            ),
        }

        # --------------------------------------------------
        # Visible test
        # --------------------------------------------------

        if not test_case.hidden:

            item["input"] = getattr(
                test_result,
                "input_data",
                None,
            )

            item["expected_output"] = getattr(
                test_result,
                "expected_output",
                None,
            )

            item["actual_output"] = getattr(
                test_result,
                "actual_output",
                None,
            )

        # --------------------------------------------------
        # Hidden test
        # --------------------------------------------------

        else:

            # DO NOT add:
            #
            # input
            # expected_output
            # actual_output
            #
            # for hidden tests.

            item["hidden"] = True

        visible_results.append(
            item
        )

    # ------------------------------------------------------
    # Candidate-safe overall result
    # ------------------------------------------------------

    return {
        "passed": bool(
            getattr(
                result,
                "passed",
                False,
            )
        ),

        "passed_tests": getattr(
            result,
            "passed_tests",
            0,
        ),

        "total_tests": getattr(
            result,
            "total_tests",
            0,
        ),

        "execution_time_ms": getattr(
            result,
            "execution_time_ms",
            None,
        ),

        "error": getattr(
            result,
            "error",
            None,
        ),

        "tests": visible_results,
    }