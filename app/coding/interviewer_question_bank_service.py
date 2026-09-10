"""
interviewer_question_bank_service.py

Generates reusable interviewer questions for coding problems.

Responsibilities:
- Generate problem-specific interviewer questions.
- Store reusable questions in the database.
- Avoid duplicate questions for the same problem.
- Keep question generation separate from live interview decisions.

This module does NOT:
- Decide whether to interrupt a candidate.
- Analyze live candidate code.
- Execute candidate code.
- Create session-level InterviewerEvent records.
"""

from typing import List

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database.models import (
    CodingProblem,
    CodingProblemApproach,
    CodingInterviewerQuestion,
)

from .problem_knowledge_service import (
    build_problem_knowledge,
    build_llm_knowledge_context,
)


# ==========================================================
# Structured Question
# ==========================================================

class GeneratedInterviewerQuestion(BaseModel):
    """
    One reusable interviewer question.
    """

    question: str = Field(
        ...,
        description="A concise interviewer question.",
    )

    question_type: str = Field(
        ...,
        description=(
            "One of: approach, complexity, correctness, "
            "concept, edge_case, optimization, dry_run, "
            "follow_up."
        ),
    )

    trigger: str = Field(
        ...,
        description=(
            "Situation in which this question would be "
            "useful during an interview."
        ),
    )

    related_concept: str = Field(
        ...,
        description="The coding concept or pattern being tested.",
    )

    expected_reasoning: str = Field(
        ...,
        description=(
            "What a strong candidate should reason about. "
            "Do not provide a complete solution."
        ),
    )


class GeneratedInterviewerQuestionSet(BaseModel):
    """
    Structured collection of reusable questions.
    """

    questions: List[
        GeneratedInterviewerQuestion
    ] = Field(
        ...,
        min_length=3,
        max_length=8,
    )


# ==========================================================
# Build Problem Context
# ==========================================================

def build_question_generation_context(
    db: Session,
    problem_id: int,
) -> str:
    """
    Build compact problem knowledge for question generation.
    """

    knowledge = build_problem_knowledge(
        db=db,
        problem_id=problem_id,
    )

    return build_llm_knowledge_context(
        knowledge
    )


# ==========================================================
# Build Prompt
# ==========================================================

def build_question_generation_prompt(
    problem: CodingProblem,
    problem_context: str,
) -> str:
    """
    Build the prompt used to generate reusable questions.
    """

    return f"""
You are designing a reusable interviewer question bank
for a technical coding interview.

Generate 5 to 8 questions specifically for the coding
problem below.

The questions will later be used by a live interviewer AI
to probe the candidate's reasoning.

==================================================
PROBLEM
==================================================

Title:
{problem.title}

Category:
{problem.category}

Difficulty:
{problem.difficulty}

Statement:
{problem.statement}

==================================================
STORED PROBLEM KNOWLEDGE
==================================================

{problem_context}

==================================================
QUESTION DESIGN RULES
==================================================

Each question must:

- Be specific to THIS problem.
- Test reasoning rather than memorization.
- Be concise and natural to ask verbally.
- Avoid directly revealing the optimal solution.
- Avoid giving the candidate the answer.
- Be useful during a real technical interview.
- Be different from the other generated questions.

Cover a useful mixture of:

- approach
- correctness
- complexity
- optimization
- edge cases
- concepts
- dry runs
- follow-ups

Do not generate trivial questions such as:

"What is the answer?"

Do not generate questions whose answer simply repeats
the problem statement.

Do not assume a specific candidate implementation,
because these questions are reusable across candidates.

For expected_reasoning, describe what a strong candidate
should explain without writing the solution for them.

Return only the structured question set.
"""


# ==========================================================
# Generate Questions
# ==========================================================

def generate_interviewer_questions(
    db: Session,
    llm,
    problem_id: int,
) -> GeneratedInterviewerQuestionSet:
    """
    Generate reusable interviewer questions for one problem.
    """

    problem = (
        db.query(CodingProblem)
        .filter(
            CodingProblem.id == problem_id
        )
        .first()
    )

    if problem is None:
        raise ValueError(
            f"Coding problem {problem_id} does not exist."
        )

    problem_context = (
        build_question_generation_context(
            db=db,
            problem_id=problem_id,
        )
    )

    prompt = build_question_generation_prompt(
        problem=problem,
        problem_context=problem_context,
    )

    structured_llm = (
        llm.with_structured_output(
            GeneratedInterviewerQuestionSet
        )
    )

    return structured_llm.invoke(
        prompt
    )


# ==========================================================
# Existing Questions
# ==========================================================

def get_existing_interviewer_questions(
    db: Session,
    problem_id: int,
):
    """
    Return existing reusable questions for a problem.
    """

    return (
        db.query(
            CodingInterviewerQuestion
        )
        .filter(
            CodingInterviewerQuestion.problem_id
            == problem_id
        )
        .order_by(
            CodingInterviewerQuestion.id
        )
        .all()
    )


# ==========================================================
# Save Questions
# ==========================================================

def save_interviewer_questions(
    db: Session,
    problem_id: int,
    question_set: GeneratedInterviewerQuestionSet,
):
    """
    Save generated questions while avoiding duplicates.
    """

    existing = (
        get_existing_interviewer_questions(
            db=db,
            problem_id=problem_id,
        )
    )

    existing_questions = {
        question.question.strip().lower()
        for question in existing
    }

    saved = []

    for generated in question_set.questions:

        question_text = (
            generated.question.strip()
        )

        if not question_text:
            continue

        normalized = (
            question_text.lower()
        )

        if normalized in existing_questions:
            continue

        record = CodingInterviewerQuestion(
            problem_id=problem_id,
            question=question_text,
            question_type=(
                generated.question_type
            ),
            trigger=generated.trigger,
            related_concept=(
                generated.related_concept
            ),
            expected_reasoning=(
                generated.expected_reasoning
            ),
        )

        db.add(record)

        existing_questions.add(
            normalized
        )

        saved.append(record)

    if saved:
        db.commit()

        for record in saved:
            db.refresh(record)

    return saved


# ==========================================================
# Generate And Save
# ==========================================================

def generate_and_save_interviewer_questions(
    db: Session,
    llm,
    problem_id: int,
):
    """
    Generate and persist reusable questions for a problem.

    If questions already exist, generation is skipped.
    """

    existing = (
        get_existing_interviewer_questions(
            db=db,
            problem_id=problem_id,
        )
    )

    if existing:
        return {
            "generated": False,
            "skipped": True,
            "saved": 0,
            "questions": existing,
        }

    question_set = (
        generate_interviewer_questions(
            db=db,
            llm=llm,
            problem_id=problem_id,
        )
    )

    saved = save_interviewer_questions(
        db=db,
        problem_id=problem_id,
        question_set=question_set,
    )

    return {
        "generated": True,
        "skipped": False,
        "saved": len(saved),
        "questions": saved,
    }


# ==========================================================
# Select Interviewer Question
# ==========================================================

def select_interviewer_question(
    db: Session,
    problem_id: int,
    question_type: str | None = None,
):
    """
    Select one reusable interviewer question for a problem.

    If question_type is provided, prefer a question of that
    type. Otherwise, return the first available question.

    This function only selects a reusable question.
    Live intervention decisions remain the responsibility
    of interviewer_event_service.py.
    """

    questions = get_existing_interviewer_questions(
        db=db,
        problem_id=problem_id,
    )

    if not questions:
        return None

    if question_type:
        requested_type = (
            question_type.strip().lower()
        )

        for question in questions:
            if (
                question.question_type
                and question.question_type.strip().lower()
                == requested_type
            ):
                return question

    return questions[0]