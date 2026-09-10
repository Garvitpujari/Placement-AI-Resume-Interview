"""
Coding Assessment Service

Coordinates the complete assessment-level setup.

Responsibilities:
- Ask the AI planner for an assessment configuration.
- Apply candidate-selected question count when provided.
- Select multiple unique problems from the existing problem bank.
- Respect candidate history and weak coding patterns.
- Keep assessment runtime state together.
- Start the exact assessment-selected coding problem.
- Preserve CodingSessionState between Run and Submit.
- Provide question-level progression.

This module does NOT:
- Create new coding problems.
- Execute candidate code.
- Judge solutions.
- Replace problem_selector.py.
- Replace coding_session_orchestrator.py.

The existing coding engine remains responsible for:
- creating coding sessions
- executing code
- judging solutions
- observing code
- interviewer behavior
"""

from typing import (
    Any,
    Dict,
    List,
    Optional,
)

from uuid import uuid4

from sqlalchemy.orm import Session

from app.database.models import CodingProblem

from .assessment_planner import (
    plan_assessment,
    update_question_count,
)

from .problem_selector import (
    get_all_problem_candidates,
    get_problem_candidates,
    get_weak_candidate_patterns,
    rank_problem_candidates,
    remove_attempted_problems,
)

from .coding_session_orchestrator import (
    start_coding_session,
)

from .state import (
    CodingSessionState,
)


# ==========================================================
# Constants
# ==========================================================

MIN_QUESTIONS = 1
MAX_QUESTIONS = 10

DEFAULT_LANGUAGE = "cpp"


# ==========================================================
# Runtime Assessment Storage
# ==========================================================

"""
Assessment runtime storage.

The assessment itself stores:
    - selected questions
    - current question index
    - coding session metadata
    - question results

The actual CodingSessionState is stored separately so that:

    Run
      ↓
    same CodingSessionState
      ↓
    Submit

works correctly.

This remains process-local for development/demo.
"""

ASSESSMENT_SESSIONS: Dict[
    str,
    Dict[str, Any],
] = {}

ASSESSMENT_CODING_STATES: Dict[
    str,
    Dict[int, CodingSessionState],
] = {}


# ==========================================================
# Utility Functions
# ==========================================================

def _normalize(
    value: Any,
) -> str:
    """
    Normalize a value for comparisons.
    """

    if value is None:
        return ""

    return str(
        value
    ).strip().lower()


def _clamp(
    value: int,
    minimum: int,
    maximum: int,
) -> int:
    """
    Keep an integer inside a fixed range.
    """

    return max(
        minimum,
        min(
            maximum,
            int(value),
        ),
    )


# ==========================================================
# Problem Serialization
# ==========================================================

def _serialize_problem(
    problem: CodingProblem,
    question_number: int,
) -> Dict[str, Any]:
    """
    Convert a database CodingProblem into the representation
    required by the assessment layer.
    """

    constraints = []

    if problem.constraints:

        if isinstance(
            problem.constraints,
            list,
        ):

            constraints = (
                problem.constraints
            )

        else:

            constraints = [
                item.strip()
                for item in str(
                    problem.constraints
                ).split("\n")
                if item.strip()
            ]

    examples = []

    if problem.examples:

        if isinstance(
            problem.examples,
            list,
        ):

            examples = (
                problem.examples
            )

        else:

            examples = [
                {
                    "text": str(
                        problem.examples
                    )
                }
            ]

    return {

        "question_number":
            question_number,

        "problem_id":
            problem.id,

        "title":
            problem.title,

        "statement":
            problem.statement,

        "category":
            problem.category,

        "difficulty":
            problem.difficulty,

        "constraints":
            constraints,

        "examples":
            examples,

        "hints_available":
            bool(
                problem.hints
            ),
    }


# ==========================================================
# Candidate Pool
# ==========================================================

def _get_candidate_pool(
    db: Session,
    *,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
) -> List[CodingProblem]:
    """
    Get problems from the existing global problem bank.

    Explicit filters are preferred.

    If no matching problems exist, fall back to the
    complete problem bank.
    """

    candidates = get_problem_candidates(
        db=db,
        category=category,
        difficulty=difficulty,
    )

    if candidates:
        return candidates

    return get_all_problem_candidates(
        db=db
    )


# ==========================================================
# Multi-Question Selection
# ==========================================================

def select_assessment_problems(
    db: Session,
    user_id: int,
    *,
    question_count: int,
    difficulty: Optional[str] = None,
    topics: Optional[List[str]] = None,
) -> List[CodingProblem]:
    """
    Select multiple unique problems for an assessment.

    Selection:

        candidate history
              ↓
        weak patterns
              ↓
        problem candidates
              ↓
        ranking
              ↓
        unique assessment problems

    No new problems are generated.
    """

    question_count = _clamp(
        question_count,
        MIN_QUESTIONS,
        MAX_QUESTIONS,
    )

    # ------------------------------------------------------
    # Candidate history
    # ------------------------------------------------------

    from .problem_selector import (
        get_attempted_problem_ids,
    )

    attempted_ids = (
        get_attempted_problem_ids(
            db=db,
            user_id=user_id,
        )
    )

    # ------------------------------------------------------
    # Candidate weak patterns
    # ------------------------------------------------------

    weak_patterns = (
        get_weak_candidate_patterns(
            db=db,
            user_id=user_id,
        )
    )

    selected_problems: List[
        CodingProblem
    ] = []

    selected_ids = set()

    # ------------------------------------------------------
    # Topics
    # ------------------------------------------------------

    normalized_topics = [
        _normalize(topic)
        for topic in (
            topics or []
        )
        if _normalize(topic)
    ]

    # ------------------------------------------------------
    # Difficulty
    # ------------------------------------------------------

    normalized_difficulty = _normalize(
        difficulty
    )

    if normalized_difficulty == "easy":

        difficulty_sequence = [
            "easy"
        ] * question_count

    elif normalized_difficulty == "medium":

        difficulty_sequence = [
            "medium"
        ] * question_count

    elif normalized_difficulty == "hard":

        difficulty_sequence = [
            "hard"
        ] * question_count

    else:

        # Mixed assessment.

        if question_count == 1:

            difficulty_sequence = [
                "medium"
            ]

        elif question_count == 2:

            difficulty_sequence = [
                "easy",
                "medium",
            ]

        elif question_count == 3:

            difficulty_sequence = [
                "easy",
                "medium",
                "hard",
            ]

        elif question_count == 4:

            difficulty_sequence = [
                "easy",
                "medium",
                "medium",
                "hard",
            ]

        else:

            difficulty_sequence = []

            for index in range(
                question_count
            ):

                if index == 0:

                    difficulty_sequence.append(
                        "easy"
                    )

                elif index < question_count - 2:

                    difficulty_sequence.append(
                        "medium"
                    )

                else:

                    difficulty_sequence.append(
                        "hard"
                    )

    # ------------------------------------------------------
    # Select each question
    # ------------------------------------------------------

    for target_difficulty in (
        difficulty_sequence
    ):

        category = None

        if normalized_topics:

            category = normalized_topics[
                len(selected_problems)
                % len(normalized_topics)
            ]

        candidates = _get_candidate_pool(
            db=db,
            category=category,
            difficulty=target_difficulty,
        )

        # --------------------------------------------------
        # Remove attempted problems
        # --------------------------------------------------

        fresh_candidates = (
            remove_attempted_problems(
                problems=candidates,
                attempted_ids=attempted_ids,
            )
        )

        # --------------------------------------------------
        # Remove duplicates
        # --------------------------------------------------

        fresh_candidates = [
            problem
            for problem in fresh_candidates
            if problem.id
            not in selected_ids
        ]

        # --------------------------------------------------
        # If no fresh problem exists,
        # allow attempted problems.
        # --------------------------------------------------

        if not fresh_candidates:

            fresh_candidates = [
                problem
                for problem in candidates
                if problem.id
                not in selected_ids
            ]

        # --------------------------------------------------
        # Category fallback
        # --------------------------------------------------

        if not fresh_candidates:

            all_candidates = (
                get_all_problem_candidates(
                    db=db
                )
            )

            fresh_candidates = [
                problem
                for problem in all_candidates
                if problem.id
                not in selected_ids
            ]

        if not fresh_candidates:
            continue

        # --------------------------------------------------
        # Rank candidates
        # --------------------------------------------------

        ranked = rank_problem_candidates(
            db=db,
            problems=fresh_candidates,
            weak_patterns=weak_patterns,
            category=category,
            difficulty=target_difficulty,
            attempted_ids=attempted_ids,
        )

        if not ranked:
            continue

        selected = ranked[0][
            "problem"
        ]

        selected_problems.append(
            selected
        )

        selected_ids.add(
            selected.id
        )

        if (
            len(selected_problems)
            >= question_count
        ):
            break

    # ------------------------------------------------------
    # Final fallback
    # ------------------------------------------------------

    if (
        len(selected_problems)
        < question_count
    ):

        all_candidates = (
            get_all_problem_candidates(
                db=db
            )
        )

        remaining = [
            problem
            for problem in all_candidates
            if problem.id
            not in selected_ids
        ]

        remaining_fresh = [
            problem
            for problem in remaining
            if problem.id
            not in attempted_ids
        ]

        if remaining_fresh:
            remaining = (
                remaining_fresh
            )

        for problem in remaining:

            selected_problems.append(
                problem
            )

            selected_ids.add(
                problem.id
            )

            if (
                len(selected_problems)
                >= question_count
            ):
                break

    # ------------------------------------------------------
    # Last-resort reuse
    # ------------------------------------------------------

    if (
        len(selected_problems)
        < question_count
        and selected_problems
    ):

        index = 0

        while (
            len(selected_problems)
            < question_count
        ):

            selected_problems.append(
                selected_problems[
                    index
                    % len(selected_problems)
                ]
            )

            index += 1

    return selected_problems[
        :question_count
    ]


# ==========================================================
# Create Assessment
# ==========================================================

def create_assessment(
    db: Session,
    user_id: int,
    *,
    mode: str,
    company: Optional[str] = None,
    role: Optional[str] = None,
    topics: Optional[List[str]] = None,
    question_count: Optional[int] = None,
    interviewer_mode: Optional[str] = None,
    language: str = DEFAULT_LANGUAGE,
    candidate_history: Optional[Any] = None,
) -> Dict[str, Any]:
    """
    Create a complete coding assessment.

    Important:
    This signature is intentionally compatible with the
    assessment API in main.py.

    Do NOT replace this with a smart_ai-only signature.
    """

    if not user_id:

        raise ValueError(
            "user_id is required to create an assessment."
        )

    if not mode:

        raise ValueError(
            "Assessment mode is required."
        )

    # ------------------------------------------------------
    # Candidate information
    # ------------------------------------------------------

    from .problem_selector import (
        get_selection_summary,
    )

    selection_summary = (
        get_selection_summary(
            db=db,
            user_id=user_id,
        )
    )

    weak_patterns = (
        selection_summary.get(
            "weak_patterns",
            [],
        )
    )

    attempted_count = (
        selection_summary.get(
            "attempted_problem_count",
            0,
        )
    )

    # ------------------------------------------------------
    # AI planning
    # ------------------------------------------------------

    plan = plan_assessment(
        mode=mode,
        company=company,
        role=role,
        topics=topics,
        weak_patterns=weak_patterns,
        attempted_problem_count=attempted_count,
        candidate_history=candidate_history,
    )

    # ------------------------------------------------------
    # Candidate question-count override
    # ------------------------------------------------------

    if question_count is not None:

        plan = update_question_count(
            plan,
            question_count,
        )

    # ------------------------------------------------------
    # Candidate interviewer-mode override
    # ------------------------------------------------------

    if interviewer_mode:

        normalized_interviewer_mode = (
            _normalize(
                interviewer_mode
            )
        )

        if normalized_interviewer_mode in {
            "off",
            "smart",
        }:

            plan.interviewer_mode = (
                normalized_interviewer_mode
            )

    # ------------------------------------------------------
    # Select problems
    # ------------------------------------------------------

    problems = select_assessment_problems(
        db=db,
        user_id=user_id,
        question_count=plan.question_count,
        difficulty=plan.difficulty,
        topics=plan.topics,
    )

    if not problems:

        raise ValueError(
            "No coding problems are available in the problem bank."
        )

    actual_question_count = len(
        problems
    )

    if (
        actual_question_count
        != plan.question_count
    ):

        plan = update_question_count(
            plan,
            actual_question_count,
        )

    # ------------------------------------------------------
    # Assessment ID
    # ------------------------------------------------------

    assessment_id = str(
        uuid4()
    )

    # ------------------------------------------------------
    # Build questions
    # ------------------------------------------------------

    question_data = []

    for index, problem in enumerate(
        problems,
        start=1,
    ):

        question_data.append(
            _serialize_problem(
                problem=problem,
                question_number=index,
            )
        )

    # ------------------------------------------------------
    # Runtime assessment state
    # ------------------------------------------------------

    assessment_state = {

        "assessment_id":
            assessment_id,

        "user_id":
            user_id,

        "mode":
            plan.mode,

        "company":
            plan.company,

        "role":
            plan.role,

        "topics":
            plan.topics,

        "difficulty":
            plan.difficulty,

        "question_count":
            plan.question_count,

        "duration_minutes":
            plan.duration_minutes,

        "interviewer_mode":
            plan.interviewer_mode,

        "reasoning":
            plan.reasoning,

        "language":
            language,

        "problem_ids": [
            problem.id
            for problem in problems
        ],

        "questions":
            question_data,

        "current_question_index":
            0,

        "completed_question_indices":
            [],

        "coding_sessions":
            {},

        "results":
            [],

        "completed":
            False,
    }

    ASSESSMENT_SESSIONS[
        assessment_id
    ] = assessment_state

    ASSESSMENT_CODING_STATES[
        assessment_id
    ] = {}

    return assessment_state


# ==========================================================
# Get Assessment
# ==========================================================

def get_assessment(
    assessment_id: str,
) -> Optional[Dict[str, Any]]:
    """
    Return an active assessment.
    """

    return ASSESSMENT_SESSIONS.get(
        assessment_id
    )


# ==========================================================
# Validate Assessment Ownership
# ==========================================================

def get_user_assessment(
    assessment_id: str,
    user_id: int,
) -> Dict[str, Any]:
    """
    Get an assessment and ensure it belongs to
    the supplied candidate.
    """

    assessment = get_assessment(
        assessment_id
    )

    if assessment is None:

        raise ValueError(
            "Assessment not found or expired."
        )

    if assessment[
        "user_id"
    ] != user_id:

        raise ValueError(
            "Assessment does not belong to this user."
        )

    return assessment


# ==========================================================
# Get Current Question
# ==========================================================

def get_current_question(
    assessment_id: str,
    user_id: int,
) -> Dict[str, Any]:
    """
    Return the current assessment question.
    """

    assessment = get_user_assessment(
        assessment_id=assessment_id,
        user_id=user_id,
    )

    if assessment[
        "completed"
    ]:

        raise ValueError(
            "Assessment has already been completed."
        )

    index = assessment[
        "current_question_index"
    ]

    questions = assessment[
        "questions"
    ]

    if index >= len(
        questions
    ):

        assessment[
            "completed"
        ] = True

        raise ValueError(
            "Assessment has no remaining questions."
        )

    return questions[index]


# ==========================================================
# Get Current Coding State
# ==========================================================

def get_assessment_coding_state(
    assessment_id: str,
    user_id: int,
    question_index: Optional[int] = None,
) -> CodingSessionState:
    """
    Return the actual CodingSessionState belonging to the
    assessment question.

    This is the state used by both:

        Run
        Submit

    so the same coding session survives between requests.
    """

    assessment = get_user_assessment(
        assessment_id=assessment_id,
        user_id=user_id,
    )

    if question_index is None:

        question_index = assessment[
            "current_question_index"
        ]

    state = (
        ASSESSMENT_CODING_STATES
        .get(
            assessment_id,
            {},
        )
        .get(
            question_index,
        )
    )

    if state is None:

        raise ValueError(
            "Coding question has not been started."
        )

    return state


# ==========================================================
# Start Assessment Question
# ==========================================================

def start_assessment_question(
    db: Session,
    *,
    assessment_id: str,
    user_id: int,
) -> Dict[str, Any]:
    """
    Start the EXACT problem selected by the assessment.

    Critical rule:

        assessment problem
                ↓
        explicit problem_id
                ↓
        coding_session_orchestrator

    The normal problem selector must NOT silently select
    another problem.
    """

    assessment = get_user_assessment(
        assessment_id=assessment_id,
        user_id=user_id,
    )

    if assessment[
        "completed"
    ]:

        raise ValueError(
            "Assessment has already been completed."
        )

    question_index = (
        assessment[
            "current_question_index"
        ]
    )

    questions = assessment[
        "questions"
    ]

    if question_index >= len(
        questions
    ):

        raise ValueError(
            "No questions remain in this assessment."
        )

    # ------------------------------------------------------
    # Existing session
    # ------------------------------------------------------

    existing_session = (
        assessment[
            "coding_sessions"
        ].get(
            question_index
        )
    )

    if existing_session:

        state = get_assessment_coding_state(
            assessment_id=assessment_id,
            user_id=user_id,
            question_index=question_index,
        )

        return {
            **existing_session,
            "state": state,
        }

    # ------------------------------------------------------
    # Assessment-selected problem
    # ------------------------------------------------------

    question = questions[
        question_index
    ]

    problem_id = question[
        "problem_id"
    ]

    if not problem_id:

        raise ValueError(
            "Assessment question has no problem_id."
        )

    # ------------------------------------------------------
    # Start exact coding session
    # ------------------------------------------------------

    state = start_coding_session(
        db=db,

        user_id=user_id,

        mode=assessment[
            "mode"
        ],

        language=assessment[
            "language"
        ],

        difficulty=question[
            "difficulty"
        ],

        company=assessment[
            "company"
        ],

        role=assessment[
            "role"
        ],

        duration_minutes=assessment[
            "duration_minutes"
        ],

        number_of_questions=assessment[
            "question_count"
        ],

        problem_id=problem_id,
    )

    # ------------------------------------------------------
    # Defensive verification
    # ------------------------------------------------------

    if state.problem_id != problem_id:

        raise ValueError(
            "Coding session problem does not match "
            "the assessment-selected problem."
        )

    # ------------------------------------------------------
    # Store coding state
    # ------------------------------------------------------

    if assessment_id not in (
        ASSESSMENT_CODING_STATES
    ):

        ASSESSMENT_CODING_STATES[
            assessment_id
        ] = {}

    ASSESSMENT_CODING_STATES[
        assessment_id
    ][question_index] = state

    # ------------------------------------------------------
    # Store session metadata
    # ------------------------------------------------------

    session_data = {

        "session_id":
            state.session_id,

        "problem_id":
            state.problem_id,

        "question_index":
            question_index,

        "question_number":
            question_index + 1,

        "language":
            state.language,

        "mode":
            state.mode,

        "difficulty":
            state.difficulty,

        "company":
            state.company,

        "role":
            state.role,
    }

    assessment[
        "coding_sessions"
    ][question_index] = session_data

    return {
        **session_data,
        "state": state,
    }


# ==========================================================
# Complete Current Question
# ==========================================================

def complete_current_question(
    assessment_id: str,
    user_id: int,
    result: Optional[
        Dict[str, Any]
    ] = None,
) -> Dict[str, Any]:
    """
    Mark the current question complete and move the
    assessment pointer to the next question.
    """

    assessment = get_user_assessment(
        assessment_id=assessment_id,
        user_id=user_id,
    )

    if assessment[
        "completed"
    ]:

        raise ValueError(
            "Assessment has already been completed."
        )

    current_index = assessment[
        "current_question_index"
    ]

    # ------------------------------------------------------
    # Prevent duplicate completion
    # ------------------------------------------------------

    if current_index not in (
        assessment[
            "completed_question_indices"
        ]
    ):

        assessment[
            "completed_question_indices"
        ].append(
            current_index
        )

    # ------------------------------------------------------
    # Store result
    # ------------------------------------------------------

    if result is not None:

        assessment[
            "results"
        ].append(
            result
        )

    # ------------------------------------------------------
    # Remove current runtime state
    #
    # It is no longer needed after question completion.
    # ------------------------------------------------------

    states = (
        ASSESSMENT_CODING_STATES.get(
            assessment_id
        )
    )

    if states is not None:

        states.pop(
            current_index,
            None,
        )

    # ------------------------------------------------------
    # Remove current session metadata
    # ------------------------------------------------------

    assessment[
        "coding_sessions"
    ].pop(
        current_index,
        None,
    )

    # ------------------------------------------------------
    # Advance pointer
    # ------------------------------------------------------

    next_index = (
        current_index + 1
    )

    assessment[
        "current_question_index"
    ] = next_index

    # ------------------------------------------------------
    # Assessment completed
    # ------------------------------------------------------

    if next_index >= len(
        assessment["questions"]
    ):

        assessment[
            "completed"
        ] = True

        return {

            "completed":
                True,

            "next_question":
                None,

            "results":
                assessment[
                    "results"
                ],
        }

    # ------------------------------------------------------
    # More questions remain
    # ------------------------------------------------------

    return {

        "completed":
            False,

        "next_question":
            assessment[
                "questions"
            ][next_index],

        "results":
            assessment[
                "results"
            ],
    }


# ==========================================================
# Update Question Count
# ==========================================================

def update_assessment_question_count(
    assessment_id: str,
    user_id: int,
    question_count: int,
) -> Dict[str, Any]:
    """
    Change the number of questions before the assessment
    begins.

    Duration is recalculated automatically.
    """

    assessment = get_user_assessment(
        assessment_id=assessment_id,
        user_id=user_id,
    )

    if assessment[
        "current_question_index"
    ] != 0:

        raise ValueError(
            "Question count can only be changed "
            "before the assessment begins."
        )

    if assessment[
        "coding_sessions"
    ]:

        raise ValueError(
            "Question count cannot be changed after "
            "a coding question has started."
        )

    question_count = _clamp(
        question_count,
        MIN_QUESTIONS,
        MAX_QUESTIONS,
    )

    assessment[
        "question_count"
    ] = question_count

    # ------------------------------------------------------
    # 15 minutes per question
    # ------------------------------------------------------

    assessment[
        "duration_minutes"
    ] = max(
        15,
        min(
            180,
            question_count * 15,
        ),
    )

    current_questions = (
        assessment[
            "questions"
        ]
    )

    if len(
        current_questions
    ) < question_count:

        raise ValueError(
            "The current assessment does not contain enough "
            "questions for the requested count. "
            "Recreate the assessment with the new count."
        )

    assessment[
        "questions"
    ] = current_questions[
        :question_count
    ]

    assessment[
        "problem_ids"
    ] = [
        question[
            "problem_id"
        ]
        for question in assessment[
            "questions"
        ]
    ]

    return assessment


# ==========================================================
# Complete Assessment
# ==========================================================

def complete_assessment(
    assessment_id: str,
    user_id: int,
) -> Dict[str, Any]:
    """
    Mark an assessment as completed.
    """

    assessment = get_user_assessment(
        assessment_id=assessment_id,
        user_id=user_id,
    )

    assessment[
        "completed"
    ] = True

    return assessment


# ==========================================================
# Delete Assessment
# ==========================================================

def delete_assessment(
    assessment_id: str,
    user_id: int,
) -> bool:
    """
    Remove an assessment and all of its in-memory
    coding state.
    """

    assessment = get_user_assessment(
        assessment_id=assessment_id,
        user_id=user_id,
    )

    if assessment is None:
        return False

    ASSESSMENT_SESSIONS.pop(
        assessment_id,
        None,
    )

    ASSESSMENT_CODING_STATES.pop(
        assessment_id,
        None,
    )

    return True


# ==========================================================
# Public Exports
# ==========================================================

__all__ = [

    "ASSESSMENT_SESSIONS",

    "ASSESSMENT_CODING_STATES",

    "create_assessment",

    "get_assessment",

    "get_user_assessment",

    "get_current_question",

    "get_assessment_coding_state",

    "start_assessment_question",

    "complete_current_question",

    "update_assessment_question_count",

    "complete_assessment",

    "delete_assessment",

    "select_assessment_problems",
]