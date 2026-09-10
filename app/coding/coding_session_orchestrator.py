"""
coding_session_orchestrator.py

Coordinates the major stages of a live coding session.

Flow:

    Candidate
        ↓
    Problem selection
        ↓
    Database coding session
        ↓
    Coding session state
        ↓
    Live editor updates
        ↓
    Code observation
        ↓
    Interviewer intervention
        ↓
    Submission / execution
        ↓
    Solution judgement
        ↓
    Candidate pattern update
        ↓
    Interviewer event
        ↓
    Session state update

This module does NOT:
- Execute code directly.
- Implement solution judgement logic.
- Implement problem-selection logic.
- Implement interviewer reasoning.

It DOES:
- Create/validate the database CodingSession record.
- Keep runtime state consistent with the database session.
- Prevent invalid session/user references from reaching child services.
- Coordinate execution, judgement, skill updates, and interviewer events.
"""

from typing import Any, Dict, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.models import (
    CodingProblem,
    CodingSession,
    User,
)

from .state import CodingSessionState

from .problem_selector import (
    select_problem,
)

from .submission_service import (
    submit_coding_solution,
)

from .solution_judge_service import (
    judge_solution,
)

from .candidate_skill_service import (
    update_candidate_skills,
)

from .problem_pattern_service import (
    get_problem_pattern_names,
)

from .code_observation_service import (
    observe_code,
)

from .interviewer_event_service import (
    generate_and_save_interviewer_event,
)


# ==========================================================
# Validation Helpers
# ==========================================================

def _validate_user(
    db: Session,
    user_id: int,
) -> User:
    """
    Validate that the candidate exists before any child record
    is created.

    This prevents errors such as:

        candidate_memories.user_id = 1
        users.id = 1 does not exist

    from appearing later as a low-level PostgreSQL FK error.
    """

    if user_id is None:
        raise ValueError(
            "user_id is required to start a coding session."
        )

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if user is None:
        raise ValueError(
            f"Cannot start coding session: user_id={user_id} "
            "does not exist in the users table."
        )

    return user


def _get_or_create_database_session(
    db: Session,
    user_id: int,
    problem_id: int,
    mode: str,
    language: str,
    company: Optional[str],
    role: Optional[str],
    duration_minutes: Optional[int],
    number_of_questions: Optional[int],
    session_id: Optional[int] = None,
) -> CodingSession:
    """
    Resolve the persistent CodingSession.

    If session_id is supplied, validate and reuse it.

    Otherwise create the CodingSession here. This is important because
    live observation, execution, and interviewer-event tables all use
    coding_sessions.id as their foreign key.
    """

    if session_id is not None:
        session = (
            db.query(CodingSession)
            .filter(
                CodingSession.id == session_id,
            )
            .first()
        )

        if session is None:
            raise ValueError(
                f"Coding session id={session_id} does not exist."
            )

        if session.user_id != user_id:
            raise ValueError(
                "Coding session does not belong to the supplied user."
            )

        if session.problem_id != problem_id:
            raise ValueError(
                "Coding session problem does not match the selected problem."
            )

        return session

    session = CodingSession(
        user_id=user_id,
        problem_id=problem_id,
        mode=mode,
        company=company,
        role=role,
        language=language,
        duration_minutes=duration_minutes,
        number_of_questions=number_of_questions,
    )

    db.add(session)

    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise

    return session


def _validate_runtime_state(
    state: CodingSessionState,
) -> None:
    """
    Validate the minimum state required by live coding operations.
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
            "Coding session ID is required. "
            "Create the database CodingSession before live updates."
        )


def _score_judgement(
    judgement,
) -> float:
    """
    Convert solution judgement into the 0-10 skill score used by
    candidate pattern memory.

    Priority:
        incorrect       -> 3.0
        optimal         -> 9.0
        non-optimal     -> 6.5
        otherwise       -> 8.0
    """

    if not judgement.correct:
        return 3.0

    if judgement.optimal:
        return 9.0

    if judgement.better_approach_available:
        return 6.5

    return 8.0


def _update_pattern_memory(
    db: Session,
    state: CodingSessionState,
    judgement,
):
    """
    Update candidate skill memory for every pattern attached to the
    current problem.

    Pattern memory is deliberately isolated in this helper so that the
    orchestration path remains easy to test.
    """

    patterns = get_problem_pattern_names(
        db=db,
        problem_id=state.problem_id,
    )

    if not patterns:
        return None

    score = _score_judgement(
        judgement
    )

    pattern_scores = {
        pattern.strip(): score
        for pattern in patterns
        if pattern and pattern.strip()
    }

    if not pattern_scores:
        return None

    try:
        return update_candidate_skills(
            db=db,
            user_id=state.user_id,
            pattern_scores=pattern_scores,
            evidence=(
                getattr(
                    judgement,
                    "reasoning",
                    None,
                )
                or ""
            ),
        )

    except IntegrityError as exc:
        db.rollback()

        raise ValueError(
            "Candidate skill memory could not be updated because "
            f"user_id={state.user_id} is not a valid users.id. "
            "Create/resolve the candidate user before starting the "
            "coding session."
        ) from exc


# ==========================================================
# Start Coding Session
# ==========================================================

def start_coding_session(
    db: Session,
    user_id: int,
    mode: str,
    language: str = "cpp",
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    company: Optional[str] = None,
    role: Optional[str] = None,
    duration_minutes: Optional[int] = None,
    number_of_questions: Optional[int] = None,
    session_id: Optional[int] = None,
    problem_id: Optional[int] = None,
) -> CodingSessionState:
    """
    Create the runtime state for a new coding session.

    The persistent CodingSession is also created here when session_id
    is not supplied.

    If the API/application layer already creates the CodingSession,
    pass its ID through session_id and this function will validate and
    reuse it instead of creating a duplicate.
    """

    # ------------------------------------------------------
    # Candidate must exist before adaptive selection/memory
    # ------------------------------------------------------

    _validate_user(
        db=db,
        user_id=user_id,
    )

    # ------------------------------------------------------
    # Select problem
    # ------------------------------------------------------

    if problem_id is not None:
        problem = (
            db.query(CodingProblem)
            .filter(CodingProblem.id == problem_id)
            .first()
        )
        if problem is None:
            raise ValueError(
                f"Coding problem id={problem_id} does not exist."
            )
    else:
        problem = select_problem(
            db=db,
            user_id=user_id,
            category=category,
            difficulty=difficulty,
        )

        if problem is None:
            raise ValueError(
                "No suitable coding problem found."
            )

    # ------------------------------------------------------
    # Create or validate persistent CodingSession
    # ------------------------------------------------------

    database_session = _get_or_create_database_session(
        db=db,
        user_id=user_id,
        problem_id=problem.id,
        mode=mode,
        language=language,
        company=company,
        role=role,
        duration_minutes=duration_minutes,
        number_of_questions=number_of_questions,
        session_id=session_id,
    )

    # ------------------------------------------------------
    # Build runtime state
    # ------------------------------------------------------

    state = CodingSessionState(
        session_id=database_session.id,
        user_id=user_id,
        problem_id=problem.id,
        problem_title=problem.title,
        problem_statement=problem.statement,
        category=problem.category,
        difficulty=problem.difficulty,
        mode=mode,
        company=company,
        role=role,
        language=language,
        duration_minutes=duration_minutes,
        number_of_questions=number_of_questions,
        started=True,
    )

    return state


# ==========================================================
# Live Code Update
# ==========================================================

def process_live_code_update(
    db: Session,
    state: CodingSessionState,
    current_code: str,
    llm,
) -> Dict[str, Any]:
    """
    Process a candidate's code while the interview is active.

    Flow:

        Editor update
            ↓
        Code observation
            ↓
        Interviewer reasoning
            ↓
        Optional interviewer event

    This function is separate from submission and judging.
    """

    _validate_runtime_state(
        state
    )

    current_code = (
        current_code
        if current_code is not None
        else ""
    )

    # ------------------------------------------------------
    # Capture previous code BEFORE updating state
    # ------------------------------------------------------

    previous_code = (
        state.current_code or ""
    )

    # ------------------------------------------------------
    # Observe current code
    # ------------------------------------------------------

    observations = observe_code(
        db=db,
        session_id=state.session_id,
        previous_code=previous_code,
        current_code=current_code,
    )

    # ------------------------------------------------------
    # Update runtime code
    # ------------------------------------------------------

    state.current_code = current_code

    # ------------------------------------------------------
    # Store observations in runtime state
    # ------------------------------------------------------

    if observations:
        if state.observations is None:
            state.observations = []

        state.observations.extend(
            observations
        )

    # ------------------------------------------------------
    # Interviewer intervention
    # ------------------------------------------------------

    interviewer_result = None

    if observations:
        interviewer_result = (
            generate_and_save_interviewer_event(
                db=db,
                llm=llm,
                session_id=state.session_id,
                problem_id=state.problem_id,
                code=current_code,
                observations=observations,
            )
        )

    # ------------------------------------------------------
    # Return live update
    # ------------------------------------------------------

    return {
        "changed": (
            previous_code != current_code
        ),
        "code": current_code,
        "observations": observations,
        "interviewer": interviewer_result,
        "state": state,
    }


# ==========================================================
# Submit And Judge
# ==========================================================

def submit_and_judge_solution(
    db: Session,
    state: CodingSessionState,
    current_code: str,
    llm,
) -> Dict[str, Any]:
    """
    Submit the candidate's code, execute it, judge the solution,
    update candidate pattern memory, and generate the post-submission
    interviewer intervention.

    This is the post-submission orchestration path.
    """

    _validate_runtime_state(
        state
    )

    if state.submitted:
        raise ValueError(
            "This coding session has already been submitted."
        )

    current_code = (
        current_code
        if current_code is not None
        else ""
    )

    # ======================================================
    # Submission / Execution
    # ======================================================

    execution_result = submit_coding_solution(
        db=db,
        state=state,
        current_code=current_code,
    )

    # ======================================================
    # Build Execution Context
    # ======================================================

    execution_context = {
        "passed": execution_result.passed,
        "passed_tests": (
            execution_result.passed_tests
        ),
        "total_tests": (
            execution_result.total_tests
        ),
        "stdout": (
            execution_result.stdout
        ),
        "stderr": (
            execution_result.stderr
        ),
        "error": (
            execution_result.error
        ),
        "execution_time_ms": (
            execution_result.execution_time_ms
        ),
    }

    # ======================================================
    # Solution Judgement
    # ======================================================

    judgement = judge_solution(
        db=db,
        llm=llm,
        problem_id=state.problem_id,
        code=current_code,
        execution_result=execution_context,
    )

    # ======================================================
    # Candidate Pattern Update
    # ======================================================

    pattern_memory = _update_pattern_memory(
        db=db,
        state=state,
        judgement=judgement,
    )

    # ======================================================
    # Post-Submission Interviewer Event
    # ======================================================

    interviewer_result = (
        generate_and_save_interviewer_event(
            db=db,
            llm=llm,
            session_id=state.session_id,
            problem_id=state.problem_id,
            code=current_code,
            execution_result=execution_context,
            judgement=judgement,
            observations=(
                state.observations or []
            ),
        )
    )

    # ======================================================
    # Completion State
    # ======================================================

    state.current_code = current_code
    state.submitted = True

    return {
        "execution": execution_result,
        "execution_context": execution_context,
        "judgement": judgement,
        "pattern_memory": pattern_memory,
        "interviewer": interviewer_result,
        "state": state,
    }


# ==========================================================
# Complete Session
# ==========================================================

def complete_coding_session(
    state: CodingSessionState,
):
    """
    Mark the runtime coding session as completed.

    Database persistence remains the responsibility of the
    API/application layer that owns the CodingSession record.
    """

    if state is None:
        raise ValueError(
            "Coding session state is required."
        )

    if not state.started:
        raise ValueError(
            "Cannot complete a coding session that has not started."
        )

    state.completed = True

    return state
