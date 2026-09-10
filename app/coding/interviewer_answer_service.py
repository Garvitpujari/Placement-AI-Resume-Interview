"""
interviewer_answer_service.py

Evaluates a candidate's response to a live interviewer question.

Responsibilities:
- Evaluate the candidate's reasoning.
- Determine whether the answer is correct/useful.
- Identify whether a follow-up is needed.
- Keep answer evaluation separate from code execution
  and solution judgement.
"""

from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session


class InterviewerAnswerEvaluation(BaseModel):
    """
    Structured evaluation of a candidate's answer.
    """

    quality: float = Field(
        ...,
        ge=0.0,
        le=10.0,
        description="Overall quality of the candidate's answer.",
    )

    correctness: float = Field(
        ...,
        ge=0.0,
        le=10.0,
        description="Correctness of the technical reasoning.",
    )

    reasoning_quality: float = Field(
        ...,
        ge=0.0,
        le=10.0,
        description="Quality and depth of the candidate's reasoning.",
    )

    answered: bool = Field(
        ...,
        description="Whether the candidate meaningfully answered the question.",
    )

    feedback: str = Field(
        ...,
        description="Concise interviewer feedback on the answer.",
    )

    strengths: list[str] = Field(
        default_factory=list,
        description="Strong aspects of the candidate's response.",
    )

    weaknesses: list[str] = Field(
        default_factory=list,
        description="Weak or missing aspects of the candidate's response.",
    )

    follow_up_needed: bool = Field(
        default=False,
        description="Whether the interviewer should ask a follow-up question.",
    )

    follow_up_reason: Optional[str] = Field(
        default=None,
        description="Why a follow-up is needed.",
    )


def build_answer_evaluation_prompt(
    question: str,
    candidate_answer: str,
    related_concept: Optional[str] = None,
) -> str:
    """
    Build the prompt used to evaluate a candidate answer.
    """

    return f"""
You are evaluating a candidate's answer during a
technical coding interview.

INTERVIEWER QUESTION
====================

{question}

RELATED CONCEPT
===============

{related_concept or "Not specified."}

CANDIDATE ANSWER
================

{candidate_answer}

EVALUATION RULES
================

Evaluate the candidate's reasoning, not their grammar.

Consider:

- Did the candidate actually answer the question?
- Is the technical reasoning correct?
- Did they explain why their reasoning is correct?
- Did they demonstrate understanding rather than memorization?
- Did they identify relevant trade-offs?
- Are there important gaps or misconceptions?

Do not provide a complete solution.

A strong answer should demonstrate genuine understanding.

If the answer is incomplete or reveals a misconception,
mark follow_up_needed=true and explain why.

Return only the structured evaluation.
"""


def evaluate_interviewer_answer(
    db: Session,
    llm,
    question: str,
    candidate_answer: str,
    related_concept: Optional[str] = None,
) -> InterviewerAnswerEvaluation:
    """
    Evaluate one candidate answer to an interviewer question.

    The database session is accepted so this service can later
    incorporate persisted problem/session context without
    changing its public API.
    """

    if not question or not question.strip():
        raise ValueError(
            "Interviewer question is required."
        )

    if not candidate_answer or not candidate_answer.strip():
        return InterviewerAnswerEvaluation(
            quality=0.0,
            correctness=0.0,
            reasoning_quality=0.0,
            answered=False,
            feedback=(
                "The candidate did not provide a meaningful answer."
            ),
            strengths=[],
            weaknesses=[
                "No meaningful answer was provided."
            ],
            follow_up_needed=True,
            follow_up_reason=(
                "The candidate needs to respond to the interviewer question."
            ),
        )

    prompt = build_answer_evaluation_prompt(
        question=question,
        candidate_answer=candidate_answer,
        related_concept=related_concept,
    )

    structured_llm = llm.with_structured_output(
        InterviewerAnswerEvaluation
    )

    return structured_llm.invoke(prompt)



def apply_answer_evaluation_to_state(
    state,
    evaluation: InterviewerAnswerEvaluation,
    candidate_answer: str,
):
    """
    Apply an evaluated candidate answer to the current
    interviewer event stored in CodingSessionState.
    """

    if state.current_interviewer_question is None:
        raise ValueError(
            "There is no current interviewer question."
        )

    event = state.current_interviewer_question

    event.candidate_answer = candidate_answer

    event.answer_quality = evaluation.quality

    event.answer_correctness = evaluation.correctness

    event.answer_reasoning_quality = (
        evaluation.reasoning_quality
    )

    event.answer_evaluated = True

    event.answer_feedback = evaluation.feedback

    event.answer_strengths = list(
        evaluation.strengths or []
    )

    event.answer_weaknesses = list(
        evaluation.weaknesses or []
    )

    event.follow_up_needed = (
        evaluation.follow_up_needed
    )

    event.follow_up_reason = (
        evaluation.follow_up_reason
    )

    state.interviewer_answer_count += 1

    return event