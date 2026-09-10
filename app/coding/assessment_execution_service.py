"""
assessment_execution_service.py

Assessment-specific bridge between the existing coding execution
engine and the assessment API.

Run:
    Candidate code -> visible/sample tests only

Submit:
    Candidate code
        -> visible + hidden tests
        -> solution judgement
        -> candidate pattern memory
        -> interviewer event

Important:
    Hidden test inputs, expected outputs and actual outputs must
    never be returned to the candidate.
"""

from typing import Any, Dict

from sqlalchemy.orm import Session

from .execution_service import (
    execute_submission,
    get_execution_test_cases,
)
from .coding_session_orchestrator import (
    submit_and_judge_solution,
)
from .state import CodingSessionState


# ==========================================================
# Validation
# ==========================================================

def _validate_state(
    state: CodingSessionState,
) -> None:
    """
    Validate the runtime coding-session state.
    """

    if state is None:
        raise ValueError(
            "Coding session state is required."
        )

    if state.user_id is None:
        raise ValueError(
            "Coding session state has no user_id."
        )

    if state.problem_id is None:
        raise ValueError(
            "Coding problem is not selected."
        )

    if state.session_id is None:
        raise ValueError(
            "Coding session ID is required."
        )

    if not state.language:
        raise ValueError(
            "Programming language is required."
        )


# ==========================================================
# Generic Serialization
# ==========================================================

def _to_dict(
    value: Any,
) -> Dict[str, Any]:
    """
    Convert a Pydantic/model/dict-like object into a
    normal dictionary.
    """

    if isinstance(value, dict):
        return value

    if hasattr(
        value,
        "model_dump",
    ):
        return value.model_dump()

    if hasattr(
        value,
        "dict",
    ):
        return value.dict()

    return {}


def _get_value(
    value: Any,
    key: str,
    default: Any = None,
) -> Any:
    """
    Read a field from either a dictionary or an object.

    The execution/judgement layer may return Pydantic/model
    objects in one code path and dictionaries in another.
    Supporting both here prevents assessment results from
    silently becoming zero/empty values.
    """

    if isinstance(value, dict):
        return value.get(key, default)

    return getattr(value, key, default)


# ==========================================================
# Test Case Helpers
# ==========================================================

def _is_hidden(
    test_case: Any,
) -> bool:
    """
    Determine whether a test case is hidden.
    """

    if isinstance(
        test_case,
        dict,
    ):
        return bool(
            test_case.get(
                "hidden",
                False,
            )
        )

    return bool(
        getattr(
            test_case,
            "hidden",
            False,
        )
    )


def _count_hidden_tests(
    result: Any,
    test_cases,
) -> Dict[str, int]:
    """
    Calculate hidden-test aggregate counts.

    IMPORTANT:
    This function only returns counts.

    It never returns:
        - hidden input
        - hidden expected output
        - hidden actual output
    """

    test_results = getattr(
        result,
        "test_results",
        [],
    ) or []

    hidden_total = 0
    hidden_passed = 0

    for index, test_case in enumerate(
        test_cases
    ):
        if not _is_hidden(
            test_case
        ):
            continue

        hidden_total += 1

        if index < len(test_results):
            test_result = test_results[index]

            if bool(
                getattr(
                    test_result,
                    "passed",
                    False,
                )
            ):
                hidden_passed += 1

    return {
        "hidden_total": hidden_total,
        "hidden_passed": hidden_passed,
        "hidden_failed": max(
            hidden_total - hidden_passed,
            0,
        ),
    }


def _count_visible_tests(
    result: Any,
    test_cases,
) -> Dict[str, int]:
    """
    Calculate visible-test aggregate counts.
    """

    test_results = getattr(
        result,
        "test_results",
        [],
    ) or []

    visible_total = 0
    visible_passed = 0

    for index, test_case in enumerate(
        test_cases
    ):
        if _is_hidden(
            test_case
        ):
            continue

        visible_total += 1

        if index < len(test_results):
            test_result = test_results[index]

            if bool(
                getattr(
                    test_result,
                    "passed",
                    False,
                )
            ):
                visible_passed += 1

    return {
        "visible_total": visible_total,
        "visible_passed": visible_passed,
        "visible_failed": max(
            visible_total - visible_passed,
            0,
        ),
    }


# ==========================================================
# Candidate-Safe Test Results
# ==========================================================

def _build_safe_visible_tests(
    result: Any,
    test_cases,
):
    """
    Return detailed results only for visible tests.

    Hidden tests are intentionally excluded from this list.
    """

    test_results = getattr(
        result,
        "test_results",
        [],
    ) or []

    safe_tests = []

    for index, test_case in enumerate(
        test_cases
    ):
        if _is_hidden(
            test_case
        ):
            continue

        if index >= len(
            test_results
        ):
            break

        test_result = test_results[index]

        safe_tests.append(
            {
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
                "input": getattr(
                    test_result,
                    "input_data",
                    None,
                ),
                "expected_output": getattr(
                    test_result,
                    "expected_output",
                    None,
                ),
                "actual_output": getattr(
                    test_result,
                    "actual_output",
                    None,
                ),
            }
        )

    return safe_tests


# ==========================================================
# Candidate-Safe Execution Context
# ==========================================================

def _build_execution_context(
    result: Any,
    test_cases,
) -> Dict[str, Any]:
    """
    Build the execution information that can safely be sent
    to the frontend.

    Hidden test details are never returned.
    """

    visible_counts = _count_visible_tests(
        result=result,
        test_cases=test_cases,
    )

    hidden_counts = _count_hidden_tests(
        result=result,
        test_cases=test_cases,
    )

    return {
        # Overall
        "passed": bool(
            getattr(
                result,
                "passed",
                False,
            )
        ),
        "passed_tests": int(
            getattr(
                result,
                "passed_tests",
                0,
            )
            or 0
        ),
        "total_tests": int(
            getattr(
                result,
                "total_tests",
                0,
            )
            or 0
        ),

        # Visible aggregate
        "visible_passed": visible_counts[
            "visible_passed"
        ],
        "visible_total": visible_counts[
            "visible_total"
        ],
        "visible_failed": visible_counts[
            "visible_failed"
        ],

        # Hidden aggregate ONLY
        "hidden_passed": hidden_counts[
            "hidden_passed"
        ],
        "hidden_total": hidden_counts[
            "hidden_total"
        ],
        "hidden_failed": hidden_counts[
            "hidden_failed"
        ],

        # Execution metadata
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

        # Safe visible test details
        "tests": _build_safe_visible_tests(
            result=result,
            test_cases=test_cases,
        ),
    }


# ==========================================================
# Run Assessment Code
# ==========================================================

def run_assessment_code(
    db: Session,
    state: CodingSessionState,
    current_code: str,
) -> Dict[str, Any]:
    """
    Run candidate code against visible/sample tests only.

    Run MUST NOT:
        - execute hidden tests
        - mark the question as submitted
        - expose hidden test data

    The resulting execution is stored as state.last_execution.

    A successful Run becomes the prerequisite for Submit.
    """

    _validate_state(
        state
    )

    if (
        not current_code
        or not current_code.strip()
    ):
        raise ValueError(
            "Cannot run empty code."
        )

    # ------------------------------------------------------
    # Load visible tests only
    # ------------------------------------------------------

    visible_tests = get_execution_test_cases(
        db=db,
        problem_id=state.problem_id,
        include_hidden=False,
    )

    if not visible_tests:
        raise ValueError(
            "No visible/sample test cases are available."
        )

    # ------------------------------------------------------
    # Execute visible tests
    # ------------------------------------------------------

    result = execute_submission(
        db=db,
        state=state,
        code=current_code,
        include_hidden=False,
    )

    # ------------------------------------------------------
    # Safety check
    # ------------------------------------------------------

    # execute_submission(include_hidden=False) is designed
    # not to mark the session as submitted.
    state.submitted = False

    # ------------------------------------------------------
    # Candidate-safe execution result
    # ------------------------------------------------------

    execution = _build_execution_context(
        result=result,
        test_cases=visible_tests,
    )

    return {
        "code": current_code,

        "execution": execution,

        "can_submit": bool(
            execution["passed"]
        ),

        "status": (
            "ready_to_submit"
            if execution["passed"]
            else "sample_tests_failed"
        ),
    }


# ==========================================================
# Final Assessment Submission
# ==========================================================

def submit_assessment_solution(
    db: Session,
    state: CodingSessionState,
    current_code: str,
    llm,
) -> Dict[str, Any]:
    """
    Final assessment submission.

    Required flow:

        successful visible Run
                    +
             unchanged code
                    ↓
        existing coding execution
                    ↓
        visible + hidden tests
                    ↓
          AI solution judgement
                    ↓
       candidate pattern memory
                    ↓
          interviewer event
    """

    _validate_state(
        state
    )

    if (
        not current_code
        or not current_code.strip()
    ):
        raise ValueError(
            "Cannot submit empty code."
        )

    if state.submitted:
        raise ValueError(
            "This coding question has already been submitted."
        )

    # ------------------------------------------------------
    # Require a previous Run
    # ------------------------------------------------------

    last_execution = getattr(
        state,
        "last_execution",
        None,
    )

    if last_execution is None:
        raise ValueError(
            "Run the code successfully against the "
            "visible/sample tests before submitting."
        )

    if not bool(
        _get_value(
            last_execution,
            "passed",
            False,
        )
    ):
        raise ValueError(
            "Run the code successfully against the "
            "visible/sample tests before submitting."
        )

    # ------------------------------------------------------
    # Ensure code has not changed
    # ------------------------------------------------------

    last_run_code = _get_value(
        last_execution,
        "code",
        None,
    )

    if last_run_code != current_code:
        raise ValueError(
            "The code changed after the last Run. "
            "Run the updated code before submitting."
        )

    # ------------------------------------------------------
    # Delegate to existing coding engine
    # ------------------------------------------------------

    result = submit_and_judge_solution(
        db=db,
        state=state,
        current_code=current_code,
        llm=llm,
    )

    # ------------------------------------------------------
    # Load all tests for internal aggregate calculation
    # ------------------------------------------------------

    all_tests = get_execution_test_cases(
        db=db,
        problem_id=state.problem_id,
        include_hidden=True,
    )

    execution_result = result.get(
        "execution"
    )

    # ------------------------------------------------------
    # Candidate-safe execution context
    # ------------------------------------------------------

    execution_context = _build_execution_context(
        result=execution_result,
        test_cases=all_tests,
    )

    # ------------------------------------------------------
    # Preserve judgement / interviewer data
    # ------------------------------------------------------

    judgement = result.get(
        "judgement"
    )

    interviewer = result.get(
        "interviewer"
    )

    pattern_memory = result.get(
        "pattern_memory"
    )

    # ------------------------------------------------------
    # Explicitly mark this question submitted
    # ------------------------------------------------------

    state.submitted = True
    state.current_code = current_code

    return {
        "execution": execution_context,

        "execution_context": execution_context,

        "judgement": judgement,

        "interviewer": interviewer,

        "pattern_memory": pattern_memory,

        "interviewer_event_state": result.get(
            "interviewer_event_state"
        ),

        "state": state,

        "submitted": True,
    }


# ==========================================================
# Submission Status
# ==========================================================

def build_submission_status(
    result: Any,
) -> Dict[str, Any]:
    """
    Build a compact submission status object.
    """

    if isinstance(
        result,
        dict,
    ):
        context = result.get(
            "execution",
            result,
        )
    else:
        context = {}

    passed = bool(
        context.get(
            "passed",
            False,
        )
    )

    return {
        "status": (
            "accepted"
            if passed
            else "failed"
        ),

        "passed": passed,

        "passed_tests": context.get(
            "passed_tests",
            0,
        ),

        "total_tests": context.get(
            "total_tests",
            0,
        ),

        "visible_passed": context.get(
            "visible_passed",
            0,
        ),

        "visible_total": context.get(
            "visible_total",
            0,
        ),

        "hidden_passed": context.get(
            "hidden_passed",
            0,
        ),

        "hidden_total": context.get(
            "hidden_total",
            0,
        ),

        "hidden_failed": context.get(
            "hidden_failed",
            0,
        ),

        "execution_time_ms": context.get(
            "execution_time_ms"
        ),

        "error": context.get(
            "error"
        ),
    }


# ==========================================================
# Question Result
# ==========================================================

def build_question_result(
    result: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Build the compact result stored for one assessment
    question.

    This is intentionally candidate-safe.
    """

    execution = result.get(
        "execution",
        {},
    )

    judgement = result.get(
        "judgement"
    )

    judgement = _to_dict(
        judgement
    )

    interviewer = result.get(
        "interviewer"
    )

    interviewer = _to_dict(
        interviewer
    )

    # ------------------------------------------------------
    # Execution
    # ------------------------------------------------------

    passed = bool(
        execution.get(
            "passed",
            False,
        )
    )

    visible_passed = int(
        execution.get(
            "visible_passed",
            0,
        )
        or 0
    )

    visible_total = int(
        execution.get(
            "visible_total",
            0,
        )
        or 0
    )

    hidden_passed = int(
        execution.get(
            "hidden_passed",
            0,
        )
        or 0
    )

    hidden_total = int(
        execution.get(
            "hidden_total",
            0,
        )
        or 0
    )

    hidden_failed = int(
        execution.get(
            "hidden_failed",
            max(
                hidden_total - hidden_passed,
                0,
            ),
        )
        or 0
    )

    # ------------------------------------------------------
    # AI interviewer follow-up
    # ------------------------------------------------------

    recommended_follow_up = (
        judgement.get(
            "recommended_follow_up"
        )
    )

    if not recommended_follow_up:
        recommended_follow_up = (
            interviewer.get(
                "question"
            )
        )

    # ------------------------------------------------------
    # Final question result
    # ------------------------------------------------------

    return {
        # --------------------------------------------------
        # Overall execution
        # --------------------------------------------------

        "passed": passed,

        "passed_tests": int(
            execution.get(
                "passed_tests",
                0,
            )
            or 0
        ),

        "total_tests": int(
            execution.get(
                "total_tests",
                0,
            )
            or 0
        ),

        "execution_time_ms": execution.get(
            "execution_time_ms"
        ),

        # --------------------------------------------------
        # Visible tests
        # --------------------------------------------------

        "visible_passed": visible_passed,

        "visible_total": visible_total,

        "visible_failed": int(
            execution.get(
                "visible_failed",
                max(
                    visible_total - visible_passed,
                    0,
                ),
            )
            or 0
        ),

        # --------------------------------------------------
        # Hidden tests — aggregate only
        # --------------------------------------------------

        "hidden_passed": hidden_passed,

        "hidden_total": hidden_total,

        "hidden_failed": hidden_failed,

        # --------------------------------------------------
        # Solution judgement
        # --------------------------------------------------

        "correct": judgement.get(
            "correct"
        ),

        "optimal": judgement.get(
            "optimal"
        ),

        "approach_level": judgement.get(
            "approach_level"
        ),

        "approach_name": judgement.get(
            "approach_name"
        ),

        "time_complexity": judgement.get(
            "time_complexity"
        ),

        "space_complexity": judgement.get(
            "space_complexity"
        ),

        "strengths": judgement.get(
            "strengths",
            [],
        ),

        "weaknesses": judgement.get(
            "weaknesses",
            [],
        ),

        "reasoning": judgement.get(
            "reasoning"
        ),

        # --------------------------------------------------
        # AI interviewer
        # --------------------------------------------------

        "recommended_follow_up": (
            recommended_follow_up
        ),

        "interviewer_question": (
            interviewer.get(
                "question"
            )
        ),

        "interviewer_reason": (
            interviewer.get(
                "reason"
            )
        ),
    }