"""
AI Assessment Planner for Placement AI.

Responsibilities:
- Decide the assessment configuration.
- Support:
    - Company OA
    - Contest
    - Personalized Practice
- Decide difficulty.
- Decide default question count.
- Decide topic distribution.
- Decide interviewer mode.
- Calculate duration from question count.
- Allow the candidate to change question count.
- Use candidate history and weak patterns when available.

This module does NOT:
- Select actual CodingProblem database rows.
- Execute candidate code.
- Judge candidate solutions.
- Modify candidate skill memory.
"""

import json
from typing import Any, Dict, List, Optional

from app.config import fast_llm


# ==========================================================
# Configuration
# ==========================================================

MIN_QUESTIONS = 1
MAX_QUESTIONS = 10

MIN_DURATION_MINUTES = 15
MAX_DURATION_MINUTES = 180

MINUTES_PER_QUESTION = 15

VALID_MODES = {
    "company_oa",
    "contest",
    "personalized",
}

VALID_DIFFICULTIES = {
    "easy",
    "medium",
    "hard",
    "mixed",
}

VALID_INTERVIEWER_MODES = {
    "off",
    "smart",
}


# ==========================================================
# Assessment Plan
# ==========================================================

class AssessmentPlan:
    """
    Normalized assessment configuration returned by the planner.
    """

    def __init__(
        self,
        mode: str,
        company: Optional[str],
        role: Optional[str],
        topics: List[str],
        difficulty: str,
        question_count: int,
        duration_minutes: int,
        interviewer_mode: str,
        reasoning: str = "",
    ):
        self.mode = mode
        self.company = company
        self.role = role
        self.topics = topics
        self.difficulty = difficulty
        self.question_count = question_count
        self.duration_minutes = duration_minutes
        self.interviewer_mode = interviewer_mode
        self.reasoning = reasoning

    def to_dict(self) -> Dict[str, Any]:
        return {
            "mode": self.mode,
            "company": self.company,
            "role": self.role,
            "topics": self.topics,
            "difficulty": self.difficulty,
            "question_count": self.question_count,
            "duration_minutes": self.duration_minutes,
            "interviewer_mode": self.interviewer_mode,
            "reasoning": self.reasoning,
        }


# ==========================================================
# Normalization Helpers
# ==========================================================

def _normalize_mode(
    mode: Optional[str],
) -> str:
    value = (
        mode or "personalized"
    ).strip().lower()

    if value not in VALID_MODES:
        raise ValueError(
            f"Invalid assessment mode '{mode}'. "
            f"Expected one of: {sorted(VALID_MODES)}."
        )

    return value


def _normalize_difficulty(
    difficulty: Optional[str],
) -> str:
    value = (
        difficulty or "mixed"
    ).strip().lower()

    if value not in VALID_DIFFICULTIES:
        return "mixed"

    return value


def _normalize_interviewer_mode(
    interviewer_mode: Optional[str],
) -> str:
    value = (
        interviewer_mode or "smart"
    ).strip().lower()

    if value not in VALID_INTERVIEWER_MODES:
        return "smart"

    return value


def _normalize_question_count(
    question_count: Optional[int],
) -> Optional[int]:
    if question_count is None:
        return None

    try:
        value = int(question_count)
    except (TypeError, ValueError):
        raise ValueError(
            "question_count must be an integer."
        )

    if not (
        MIN_QUESTIONS
        <= value
        <= MAX_QUESTIONS
    ):
        raise ValueError(
            f"question_count must be between "
            f"{MIN_QUESTIONS} and {MAX_QUESTIONS}."
        )

    return value


def _normalize_topics(
    topics: Optional[List[str]],
) -> List[str]:
    if not topics:
        return []

    normalized = []

    for topic in topics:
        if topic is None:
            continue

        value = str(topic).strip()

        if value and value not in normalized:
            normalized.append(value)

    return normalized


def _normalize_weak_patterns(
    weak_patterns: Optional[List[str]],
) -> List[str]:
    """
    Normalize candidate weak coding patterns.

    These are planning signals only.
    """

    if not weak_patterns:
        return []

    normalized = []

    for pattern in weak_patterns:
        if pattern is None:
            continue

        value = str(pattern).strip()

        if value and value not in normalized:
            normalized.append(value)

    return normalized


def _normalize_attempted_problem_count(
    attempted_problem_count: Optional[int],
) -> int:
    """
    Normalize the number of problems the candidate
    has already attempted.
    """

    if attempted_problem_count is None:
        return 0

    try:
        value = int(
            attempted_problem_count
        )
    except (TypeError, ValueError):
        return 0

    return max(0, value)


def _format_candidate_history(
    candidate_history: Optional[Any],
) -> str:
    """
    Convert candidate history into safe prompt text.

    This planner does not modify or persist the history.
    """

    if candidate_history is None:
        return "No candidate history available."

    try:
        if isinstance(
            candidate_history,
            str,
        ):
            value = candidate_history.strip()

            if value:
                return value

            return "No candidate history available."

        return json.dumps(
            candidate_history,
            ensure_ascii=False,
            default=str,
        )

    except Exception:
        return str(
            candidate_history
        )


# ==========================================================
# Duration
# ==========================================================

def calculate_duration(
    question_count: int,
) -> int:
    """
    Calculate assessment duration.

    Current product rule:
        1 question  -> 15 minutes
        2 questions -> 30 minutes
        4 questions -> 60 minutes
        6 questions -> 90 minutes
        10 questions -> 150 minutes

    The result is clamped to the platform's
    supported duration range.
    """

    question_count = max(
        MIN_QUESTIONS,
        min(
            MAX_QUESTIONS,
            int(question_count),
        ),
    )

    duration = (
        question_count
        * MINUTES_PER_QUESTION
    )

    return max(
        MIN_DURATION_MINUTES,
        min(
            MAX_DURATION_MINUTES,
            duration,
        ),
    )


# ==========================================================
# Question Count Update
# ==========================================================

def update_question_count(
    plan: AssessmentPlan,
    question_count: int,
) -> AssessmentPlan:
    """
    Update the question count and automatically
    recalculate the duration.
    """

    question_count = _normalize_question_count(
        question_count
    )

    if question_count is None:
        raise ValueError(
            "question_count is required."
        )

    plan.question_count = question_count

    plan.duration_minutes = calculate_duration(
        question_count
    )

    return plan


# ==========================================================
# AI Prompt
# ==========================================================

def _build_planning_prompt(
    mode: str,
    company: Optional[str],
    role: Optional[str],
    topics: List[str],
    requested_question_count: Optional[int],
    interviewer_mode: Optional[str],
    weak_patterns: Optional[List[str]] = None,
    attempted_problem_count: Optional[int] = 0,
    candidate_history: Optional[Any] = None,
) -> str:
    company_text = (
        company
        if company
        else "Not specified"
    )

    role_text = (
        role
        if role
        else "Not specified"
    )

    topics_text = (
        ", ".join(topics)
        if topics
        else "AI-selected"
    )

    question_text = (
        str(requested_question_count)
        if requested_question_count
        else "AI-selected"
    )

    interviewer_text = (
        interviewer_mode
        if interviewer_mode
        else "AI-selected"
    )

    normalized_weak_patterns = (
        _normalize_weak_patterns(
            weak_patterns
        )
    )

    weak_patterns_text = (
        ", ".join(
            normalized_weak_patterns
        )
        if normalized_weak_patterns
        else "No saved weak coding patterns available"
    )

    attempted_count = (
        _normalize_attempted_problem_count(
            attempted_problem_count
        )
    )

    history_text = _format_candidate_history(
        candidate_history
    )

    return f"""
You are the Assessment Planning Agent for a coding
placement preparation platform.

Create a practical coding assessment configuration.

Assessment mode:
{mode}

Company:
{company_text}

Role:
{role_text}

Requested topics:
{topics_text}

Candidate weak coding patterns:
{weak_patterns_text}

Candidate attempted problem count:
{attempted_count}

Candidate coding history:
{history_text}

Requested question count:
{question_text}

Requested interviewer mode:
{interviewer_text}

Rules:

1. The actual coding problems already exist in a
   global database problem bank.

2. You are ONLY planning the assessment.
   Do not invent coding problem titles.

3. Select an appropriate difficulty:
   - easy
   - medium
   - hard
   - mixed

4. Decide a sensible question count when the
   candidate did not explicitly provide one.

5. Question count must be between 1 and 10.

6. Decide a topic distribution suitable for the
   selected assessment mode.

7. For company OA:
   - prioritize realistic interview/OA topics
   - consider company and role when supplied.

8. For contest:
   - prefer a progression of difficulty
   - test different algorithmic patterns.

9. For personalized:
   - prioritize requested topics.
   - when no topics are supplied, prefer areas
     useful for candidate practice.
   - use saved weak coding patterns when available.
   - use candidate history when useful.
   - avoid simply repeating already attempted
     problems conceptually when possible.

10. Explicitly requested candidate topics must take
    priority over AI-generated topic alternatives.

11. Candidate weak patterns are planning signals only.
    Do not invent weak patterns.

12. Candidate history is planning context only.
    Do not invent historical facts.

13. Interviewer mode must be:
    - off
    - smart

14. Smart interviewer mode means limited,
    meaningful AI interruptions rather than
    interrupting constantly.

15. Return ONLY valid JSON.

Required JSON structure:

{{
    "difficulty": "mixed",
    "question_count": 4,
    "topics": ["Array", "Hashing"],
    "interviewer_mode": "smart",
    "reasoning": "Short explanation"
}}
"""


# ==========================================================
# AI Invocation
# ==========================================================

def _invoke_llm(
    prompt: str,
) -> Dict[str, Any]:
    """
    Ask the planning LLM for a JSON configuration.
    """

    response = fast_llm.invoke(
        prompt
    )

    content = getattr(
        response,
        "content",
        response,
    )

    if isinstance(
        content,
        list,
    ):
        parts = []

        for item in content:
            if isinstance(
                item,
                dict,
            ):
                parts.append(
                    str(
                        item.get(
                            "text",
                            item,
                        )
                    )
                )
            else:
                parts.append(
                    str(item)
                )

        content = "".join(parts)

    content = str(
        content
    ).strip()

    # ------------------------------------------------------
    # Remove optional markdown JSON fences
    # ------------------------------------------------------

    if content.startswith("```"):
        lines = content.splitlines()

        if lines:
            lines = lines[1:]

        if (
            lines
            and lines[-1].strip()
            == "```"
        ):
            lines = lines[:-1]

        content = "\n".join(
            lines
        ).strip()

    try:
        parsed = json.loads(
            content
        )

    except json.JSONDecodeError:
        # Try extracting the outermost JSON object.
        start = content.find(
            "{"
        )

        end = content.rfind(
            "}"
        )

        if (
            start == -1
            or end == -1
        ):
            raise ValueError(
                "Assessment planner returned invalid JSON."
            )

        try:
            parsed = json.loads(
                content[
                    start : end + 1
                ]
            )

        except json.JSONDecodeError as exc:
            raise ValueError(
                "Assessment planner returned invalid JSON."
            ) from exc

    if not isinstance(
        parsed,
        dict,
    ):
        raise ValueError(
            "Assessment planner response must be a JSON object."
        )

    return parsed


# ==========================================================
# Fallback Planning
# ==========================================================

def _fallback_plan(
    mode: str,
    company: Optional[str],
    role: Optional[str],
    topics: List[str],
    requested_question_count: Optional[int],
    interviewer_mode: Optional[str],
    weak_patterns: Optional[List[str]] = None,
    attempted_problem_count: Optional[int] = 0,
    candidate_history: Optional[Any] = None,
) -> AssessmentPlan:
    """
    Safe deterministic fallback if the LLM response
    cannot be parsed.
    """

    # These values are intentionally accepted even in
    # fallback mode so the planner interface remains
    # compatible with assessment_service.py.
    _normalize_weak_patterns(
        weak_patterns
    )

    _normalize_attempted_problem_count(
        attempted_problem_count
    )

    _format_candidate_history(
        candidate_history
    )

    if requested_question_count is not None:
        question_count = (
            requested_question_count
        )

    elif mode == "company_oa":
        question_count = 4

    elif mode == "contest":
        question_count = 5

    else:
        question_count = 3

    if mode == "contest":
        difficulty = "mixed"

    elif mode == "company_oa":
        difficulty = "medium"

    else:
        difficulty = "mixed"

    normalized_interviewer = (
        _normalize_interviewer_mode(
            interviewer_mode
        )
    )

    return AssessmentPlan(
        mode=mode,
        company=company,
        role=role,
        topics=topics,
        difficulty=difficulty,
        question_count=question_count,
        duration_minutes=calculate_duration(
            question_count
        ),
        interviewer_mode=(
            normalized_interviewer
        ),
        reasoning=(
            "Fallback assessment plan was used "
            "because the AI planner response could "
            "not be parsed."
        ),
    )


# ==========================================================
# Public Planner
# ==========================================================

def plan_assessment(
    mode: str,
    company: Optional[str] = None,
    role: Optional[str] = None,
    topics: Optional[List[str]] = None,
    question_count: Optional[int] = None,
    interviewer_mode: Optional[str] = None,
    weak_patterns: Optional[List[str]] = None,
    attempted_problem_count: Optional[int] = 0,
    candidate_history: Optional[Any] = None,
) -> AssessmentPlan:
    """
    Generate an assessment plan.

    Explicit candidate constraints are preserved.

    AI decides unspecified values.

    Candidate weak patterns, attempted problem count,
    and candidate history are optional planning context.
    They do not modify candidate memory.
    """

    mode = _normalize_mode(
        mode
    )

    company = (
        company.strip()
        if isinstance(
            company,
            str,
        )
        and company.strip()
        else None
    )

    role = (
        role.strip()
        if isinstance(
            role,
            str,
        )
        and role.strip()
        else None
    )

    topics = _normalize_topics(
        topics
    )

    question_count = (
        _normalize_question_count(
            question_count
        )
    )

    interviewer_mode = (
        _normalize_interviewer_mode(
            interviewer_mode
        )
        if interviewer_mode is not None
        else None
    )

    weak_patterns = (
        _normalize_weak_patterns(
            weak_patterns
        )
    )

    attempted_problem_count = (
        _normalize_attempted_problem_count(
            attempted_problem_count
        )
    )

    prompt = _build_planning_prompt(
        mode=mode,
        company=company,
        role=role,
        topics=topics,
        requested_question_count=(
            question_count
        ),
        interviewer_mode=(
            interviewer_mode
        ),
        weak_patterns=(
            weak_patterns
        ),
        attempted_problem_count=(
            attempted_problem_count
        ),
        candidate_history=(
            candidate_history
        ),
    )

    try:
        ai_result = _invoke_llm(
            prompt
        )

        difficulty = (
            _normalize_difficulty(
                ai_result.get(
                    "difficulty"
                )
            )
        )

        ai_question_count = (
            ai_result.get(
                "question_count"
            )
        )

        if question_count is not None:
            final_question_count = (
                question_count
            )

        else:
            try:
                final_question_count = int(
                    ai_question_count
                )

            except (
                TypeError,
                ValueError,
            ):
                final_question_count = 3

            final_question_count = max(
                MIN_QUESTIONS,
                min(
                    MAX_QUESTIONS,
                    final_question_count,
                ),
            )

        ai_topics = (
            _normalize_topics(
                ai_result.get(
                    "topics"
                )
            )
        )

        # Candidate-requested topics always take
        # priority over AI-generated alternatives.
        final_topics = (
            topics
            if topics
            else ai_topics
        )

        final_interviewer_mode = (
            interviewer_mode
            if interviewer_mode is not None
            else _normalize_interviewer_mode(
                ai_result.get(
                    "interviewer_mode",
                    "smart",
                )
            )
        )

        reasoning = str(
            ai_result.get(
                "reasoning",
                "",
            )
        ).strip()

        return AssessmentPlan(
            mode=mode,
            company=company,
            role=role,
            topics=final_topics,
            difficulty=difficulty,
            question_count=(
                final_question_count
            ),
            duration_minutes=(
                calculate_duration(
                    final_question_count
                )
            ),
            interviewer_mode=(
                final_interviewer_mode
            ),
            reasoning=reasoning,
        )

    except Exception:
        return _fallback_plan(
            mode=mode,
            company=company,
            role=role,
            topics=topics,
            requested_question_count=(
                question_count
            ),
            interviewer_mode=(
                interviewer_mode
            ),
            weak_patterns=(
                weak_patterns
            ),
            attempted_problem_count=(
                attempted_problem_count
            ),
            candidate_history=(
                candidate_history
            ),
        )