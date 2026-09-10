"""
interviewer_event_service.py

Generates interviewer interventions during a live coding session.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.models import InterviewerEvent as InterviewerEventModel

from .problem_knowledge_service import (
    build_problem_knowledge,
    build_llm_knowledge_context,
)


class InterviewerEvent(BaseModel):
    """Structured interviewer intervention."""

    should_intervene: bool = Field(default=False)
    question: Optional[str] = None
    reason: Optional[str] = None
    related_concept: Optional[str] = None
    related_code: Optional[str] = None


def build_interviewer_context(
    code: str,
    execution_result: Optional[Dict[str, Any]] = None,
    judgement: Optional[Any] = None,
    observations: Optional[List[Any]] = None,
) -> str:
    """Build candidate-side context for the interviewer."""

    execution_result = execution_result or {}
    observations = observations or []

    judgement_text = "Not available."

    if judgement is not None:
        judgement_text = (
            f"Correct: {getattr(judgement, 'correct', False)}\n"
            f"Approach level: {getattr(judgement, 'approach_level', 'unknown')}\n"
            f"Approach: {getattr(judgement, 'approach_name', None)}\n"
            f"Reasoning: {getattr(judgement, 'reasoning', None)}"
        )

    observation_text = "\n".join(
        str(getattr(observation, "observation", observation))
        for observation in observations
    )

    return f"""
CANDIDATE CODE
==============

{code}

EXECUTION
=========

Passed:
{execution_result.get("passed", False)}

Passed tests:
{execution_result.get("passed_tests", 0)}
/
{execution_result.get("total_tests", 0)}

Execution time:
{execution_result.get("execution_time_ms")}

Error:
{execution_result.get("error") or "None"}

SOLUTION JUDGEMENT
==================

{judgement_text}

OBSERVATIONS
============

{observation_text or "No observations available."}
"""


def build_interviewer_prompt(
    problem_context: str,
    candidate_context: str,
) -> str:
    """Build the reasoning prompt used by the interviewer."""

    return f"""
You are an AI technical interviewer observing a live
coding interview.

Decide whether an interviewer intervention would be useful
at this moment.

Do not solve the problem or reveal the optimal solution.
Prefer questions that make the candidate explain reasoning.

PROBLEM KNOWLEDGE
=================
{problem_context}

CANDIDATE CONTEXT
=================
{candidate_context}

INTERVIEWER RULES
=================
Intervene when useful evidence exists, such as:
- The candidate appears stuck.
- The approach has an obvious weakness.
- The candidate has a correct but inefficient approach.
- Complexity should be explained.
- An important design choice should be justified.
- A meaningful mistake was made.
- The candidate reached a potentially optimal approach
  and should explain why it works.

Do not intervene merely because the code is long.
Do not reveal hidden test cases.
Do not directly provide the answer.

If there is no useful intervention, return should_intervene=false.

Return exactly one structured interviewer event.
"""


def generate_interviewer_event(
    db: Session,
    llm,
    session_id: int,
    problem_id: int,
    code: str,
    execution_result: Optional[Dict[str, Any]] = None,
    judgement: Optional[Any] = None,
    observations: Optional[List[Any]] = None,
) -> InterviewerEvent:
    """Generate an interviewer intervention."""

    knowledge = build_problem_knowledge(
        db=db,
        problem_id=problem_id,
    )

    problem_context = build_llm_knowledge_context(knowledge)

    candidate_context = build_interviewer_context(
        code=code,
        execution_result=execution_result,
        judgement=judgement,
        observations=observations,
    )

    prompt = build_interviewer_prompt(
        problem_context=problem_context,
        candidate_context=candidate_context,
    )

    structured_llm = llm.with_structured_output(InterviewerEvent)

    return structured_llm.invoke(prompt)


def save_interviewer_event(
    db: Session,
    session_id: int,
    event: InterviewerEvent,
):
    """Persist a generated interviewer event."""

    if not event.should_intervene or not event.question:
        return None

    # SQLAlchemy model is explicitly aliased to avoid collision
    # with the Pydantic InterviewerEvent schema above.
    record = InterviewerEventModel(
        session_id=session_id,
        question=event.question,
        reason=event.reason,
        related_code=event.related_code,
        related_concept=event.related_concept,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


def generate_and_save_interviewer_event(
    db: Session,
    llm,
    session_id: int,
    problem_id: int,
    code: str,
    execution_result: Optional[Dict[str, Any]] = None,
    judgement: Optional[Any] = None,
    observations: Optional[List[Any]] = None,
):
    """Generate an interviewer event and persist it when appropriate."""

    event = generate_interviewer_event(
        db=db,
        llm=llm,
        session_id=session_id,
        problem_id=problem_id,
        code=code,
        execution_result=execution_result,
        judgement=judgement,
        observations=observations,
    )

    saved_event = save_interviewer_event(
        db=db,
        session_id=session_id,
        event=event,
    )

    return {
        "event": event,
        "saved_event": saved_event,
    }