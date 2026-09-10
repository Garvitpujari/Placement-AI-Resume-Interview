"""
solution_judge_service.py

Judges a candidate's submitted coding solution against
the known solution space of the problem.

Reference knowledge:
    - brute-force approach
    - better approaches
    - optimal approach
    - time complexity
    - space complexity
    - common mistakes
    - problem constraints

The actual code is executed separately.

This service combines:
    execution result
    +
    problem knowledge
    +
    candidate code
    ↓
    solution judgement

The LLM is used only for reasoning that cannot reliably
be determined from execution alone.
"""

from typing import Optional, Dict, Any

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database.models import (
    CodingProblem,
    CodingProblemApproach,
)

from .problem_knowledge_service import (
    build_problem_knowledge,
    build_llm_knowledge_context,
)


# ==========================================================
# Judgement Schema
# ==========================================================

class SolutionJudgement(BaseModel):
    """
    Structured judgement of a candidate's solution.
    """

    correct: bool = Field(
        description="Whether the solution is correct."
    )

    approach_level: str = Field(
        description=(
            "Classify the solution as brute, better, "
            "optimal, or unclear."
        )
    )

    approach_name: Optional[str] = Field(
        default=None,
        description=(
            "Known approach that most closely matches "
            "the candidate's solution."
        )
    )

    time_complexity: Optional[str] = Field(
        default=None,
        description=(
            "Estimated time complexity of the candidate "
            "solution."
        )
    )

    space_complexity: Optional[str] = Field(
        default=None,
        description=(
            "Estimated space complexity of the candidate "
            "solution."
        )
    )

    optimal: bool = Field(
        default=False,
        description=(
            "Whether the candidate reached the known "
            "optimal approach."
        )
    )

    better_approach_available: bool = Field(
        default=False,
        description=(
            "Whether a better known approach exists."
        )
    )

    reasoning: str = Field(
        description=(
            "Reasoning behind the judgement."
        )
    )

    strengths: list[str] = Field(
        default_factory=list,
        description=(
            "Strengths demonstrated by the candidate."
        )
    )

    weaknesses: list[str] = Field(
        default_factory=list,
        description=(
            "Weaknesses demonstrated by the candidate."
        )
    )

    recommended_follow_up: Optional[str] = Field(
        default=None,
        description=(
            "Useful interviewer follow-up question."
        )
    )


# ==========================================================
# Build Candidate Context
# ==========================================================

def build_candidate_solution_context(
    code: str,
    execution_result: Optional[
        Dict[str, Any]
    ],
) -> str:
    """
    Build the candidate-side context for judgement.
    """

    execution_result = (
        execution_result or {}
    )

    return f"""
Candidate code:

{code}

Execution result:

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
"""


# ==========================================================
# Build Judgement Prompt
# ==========================================================

def build_judgement_prompt(
    problem_context: str,
    candidate_context: str,
) -> str:
    """
    Build the reasoning prompt for the solution judge.
    """

    return f"""
You are evaluating a candidate's solution in a coding
interview.

The problem knowledge below is the reference knowledge
available to the system.

Do NOT invent a new solution if the stored knowledge
already describes the relevant approaches.

Your task is to compare the candidate's implementation
with the known approaches.

==================================================
PROBLEM KNOWLEDGE
==================================================

{problem_context}

==================================================
CANDIDATE SOLUTION
==================================================

{candidate_context}

==================================================
JUDGEMENT RULES
==================================================

Determine:

1. Is the candidate solution correct?

2. Which known approach does it most closely match?

3. Is it brute force, better, optimal, or unclear?

4. What is its likely time complexity?

5. What is its likely space complexity?

6. Does a better known approach exist?

7. Did the candidate reach the known optimal approach?

8. What did the candidate do well?

9. What should be improved?

10. What would be the most useful interviewer
    follow-up question?

IMPORTANT:

Do not classify a solution as optimal merely because
all tests pass.

Correctness and optimization are separate judgements.

A brute-force solution can be completely correct.

A solution can also pass visible tests while still
being unsuitable for the problem constraints.

Use the problem constraints and stored approaches
when determining whether the approach is appropriate.

Do not judge code quality merely from variable names
or formatting.

Focus on algorithmic reasoning and the known solution
space.

Return one structured judgement.
"""


# ==========================================================
# Judge Solution
# ==========================================================

def judge_solution(
    db: Session,
    llm,
    problem_id: int,
    code: str,
    execution_result: Optional[
        Dict[str, Any]
    ] = None,
) -> SolutionJudgement:
    """
    Judge the submitted candidate solution.

    This function retrieves the authoritative problem
    knowledge from the database and asks the supplied
    reasoning model to compare the candidate solution
    against it.
    """

    # ======================================================
    # Load Problem Knowledge
    # ======================================================

    knowledge = build_problem_knowledge(
        db=db,
        problem_id=problem_id,
    )

    problem_context = (
        build_llm_knowledge_context(
            knowledge
        )
    )

    candidate_context = (
        build_candidate_solution_context(
            code=code,
            execution_result=execution_result,
        )
    )

    prompt = build_judgement_prompt(
        problem_context=problem_context,
        candidate_context=candidate_context,
    )

    # ======================================================
    # Structured LLM Judgement
    # ======================================================

    structured_llm = llm.with_structured_output(
        SolutionJudgement
    )

    judgement = structured_llm.invoke(
        prompt
    )

    return judgement