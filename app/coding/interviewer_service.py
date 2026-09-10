"""
interviewer_service.py

Data-driven interviewer for the live coding module.

The interviewer uses:

    Candidate skill history
    +
    Current coding problem
    +
    Known problem approaches
    +
    Current candidate code
    +
    Recent coding observations
    +
    Execution results

to decide whether an intervention is useful.

The interviewer does NOT contain fixed questions for
specific data structures or syntax.
"""

from typing import Optional, List, Dict, Any

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database.models import (
    CodingProblem,
    CodingProblemApproach,
)

from ..database.crud import (
    get_user_memories,
)

from .crud import (
    save_interviewer_event,
)

# ==========================================================
# Interviewer Decision
# ==========================================================

class InterviewerDecision(BaseModel):
    """
    Structured decision produced by the interviewer.
    """

    should_intervene: bool = Field(
        default=False,
        description=(
            "Whether the interviewer should "
            "intervene at this point."
        ),
    )

    question: Optional[str] = Field(
        default=None,
        description=(
            "The single question to ask the candidate."
        ),
    )

    reason: Optional[str] = Field(
        default=None,
        description=(
            "Reason why the intervention is useful."
        ),
    )

    intervention_type: Optional[str] = Field(
        default=None,
        description=(
            "hint, approach, complexity, concept, "
            "dry_run, clarification, or follow_up"
        ),
    )

    related_pattern: Optional[str] = Field(
        default=None,
        description=(
            "Problem pattern related to the intervention."
        ),
    )


# ==========================================================
# Candidate Skill Context
# ==========================================================

def build_candidate_skill_context(
    db: Session,
    user_id: int,
) -> str:
    """
    Build the candidate's historical skill context.

    We do not inspect individual keywords here.

    We use the persistent candidate memories that have
    already been generated from previous interviews,
    coding sessions, and assessments.
    """

    memories = get_user_memories(
        db=db,
        user_id=user_id,
    )

    if not memories:
        return (
            "No previous candidate skill history "
            "is available."
        )

    lines = []

    for memory in memories:

        line = (
            f"- Category: {memory.category}"
        )

        if memory.subcategory:
            line += (
                f" | Subcategory: "
                f"{memory.subcategory}"
            )

        line += (
            f" | Memory: {memory.memory}"
            f" | Importance: {memory.importance}"
            f" | Confidence: {memory.confidence}"
        )

        if memory.evidence:
            line += (
                f" | Evidence: {memory.evidence}"
            )

        lines.append(line)

    return "\n".join(lines)


# ==========================================================
# Problem Knowledge
# ==========================================================

def build_problem_knowledge(
    problem: CodingProblem,
    approaches: List[CodingProblemApproach],
) -> str:
    """
    Build the complete known solution space for the
    current problem.

    This information should primarily come from our
    stored/web-researched problem knowledge.
    """

    lines = [
        f"Title: {problem.title}",
        f"Category: {problem.category}",
        f"Difficulty: {problem.difficulty}",
        "",
        "Problem statement:",
        problem.statement or "",
        "",
        "Known approaches:",
    ]

    if approaches:

        for index, approach in enumerate(
            approaches,
            start=1,
        ):

            lines.extend(
                [
                    "",
                    f"Approach {index}:",
                    f"Name: {approach.name}",
                    (
                        "Explanation: "
                        f"{approach.explanation or ''}"
                    ),
                    (
                        "Time complexity: "
                        f"{approach.time_complexity or 'Unknown'}"
                    ),
                    (
                        "Space complexity: "
                        f"{approach.space_complexity or 'Unknown'}"
                    ),
                ]
            )

    else:

        lines.append(
            "No stored approaches are available."
        )

    if problem.optimal_approach:

        lines.extend(
            [
                "",
                "Stored optimal approach:",
                problem.optimal_approach,
            ]
        )

    if problem.common_mistakes:

        lines.extend(
            [
                "",
                "Known common mistakes:",
                problem.common_mistakes,
            ]
        )

    if problem.hints:

        lines.extend(
            [
                "",
                "Available hints:",
                problem.hints,
            ]
        )

    return "\n".join(lines)


# ==========================================================
# Recent Observations
# ==========================================================

def build_observation_context(
    observations: Optional[
        List[Dict[str, Any]]
    ],
) -> str:
    """
    Convert recent observations into compact context.
    """

    if not observations:
        return (
            "No recent coding observations "
            "are available."
        )

    lines = []

    for observation in observations:

        lines.append(
            (
                f"- {observation.get('observation', '')}"
                f" | category="
                f"{observation.get('category', '')}"
                f" | severity="
                f"{observation.get('severity', '')}"
                f" | evidence="
                f"{observation.get('evidence', '')}"
            )
        )

    return "\n".join(lines)


# ==========================================================
# Execution Context
# ==========================================================

def build_execution_context(
    execution_result: Optional[Dict[str, Any]],
) -> str:
    """
    Convert the latest execution result into context.
    """

    if not execution_result:

        return (
            "The candidate has not submitted code "
            "for execution yet."
        )

    return "\n".join(
        [
            (
                "Passed: "
                f"{execution_result.get('passed', False)}"
            ),
            (
                "Passed tests: "
                f"{execution_result.get('passed_tests', 0)}"
                "/"
                f"{execution_result.get('total_tests', 0)}"
            ),
            (
                "Execution time: "
                f"{execution_result.get('execution_time_ms')}"
            ),
            (
                "Error: "
                f"{execution_result.get('error') or 'None'}"
            ),
        ]
    )


# ==========================================================
# Build Interviewer Prompt
# ==========================================================

def build_interviewer_prompt(
    candidate_skill_context: str,
    problem_knowledge: str,
    current_code: str,
    observation_context: str,
    execution_context: str,
) -> str:
    """
    Build the reasoning prompt.

    The prompt explicitly prevents the model from
    generating an intervention merely because it
    recognizes a particular syntax or data structure.
    """

    return f"""
You are the interviewer in a live coding assessment.

Your job is to evaluate the candidate's CURRENT STATE
against the known solution space of the CURRENT PROBLEM.

Do not interrupt the candidate unnecessarily.

Most coding updates should result in:

should_intervene = false

Only intervene when there is meaningful evidence that
an interviewer question would improve the assessment.

==================================================
CANDIDATE SKILL HISTORY
==================================================

{candidate_skill_context}

==================================================
CURRENT PROBLEM KNOWLEDGE
==================================================

{problem_knowledge}

==================================================
CURRENT CANDIDATE CODE
==================================================

{current_code}

==================================================
RECENT OBSERVATIONS
==================================================

{observation_context}

==================================================
LATEST EXECUTION
==================================================

{execution_context}

==================================================
DECISION RULES
==================================================

Use the stored problem knowledge as the reference.

Compare the candidate's current approach with the known
brute-force, better, and optimal approaches whenever
those approaches are available.

Consider:

1. Is the candidate making reasonable progress?

2. Is the candidate apparently stuck?

3. Is the candidate using an approach that is valid but
   substantially worse than a known approach?

4. Has the candidate reached or approached the optimal
   approach?

5. Is there evidence of an important conceptual mistake?

6. Is the candidate's complexity significantly worse
   than what the problem constraints require?

7. Would asking about the approach, complexity,
   correctness, or a dry run meaningfully assess the
   candidate?

8. Does the candidate's historical skill profile suggest
   a useful area to probe?

IMPORTANT:

Do NOT use fixed questions based only on keywords.

For example, do NOT reason:

"unordered_map appeared, therefore ask why unordered_map."

Instead reason about WHY the candidate chose their
current approach in the context of THIS problem and
its known approaches.

Do not reveal the optimal solution unless the interview
rules explicitly allow a hint.

If the candidate is doing well and there is nothing
useful to ask, do not intervene.

If intervention is necessary, generate ONE concise,
natural interviewer question.

Possible intervention types:

- hint
- approach
- complexity
- concept
- dry_run
- clarification
- follow_up

==================================================
OUTPUT
==================================================

Return a structured interviewer decision.
"""


# ==========================================================
# Ask Interviewer Model
# ==========================================================

def ask_interviewer(
    llm,
    prompt: str,
) -> InterviewerDecision:
    """
    Ask the supplied LLM for a structured interviewer
    decision.

    The LLM is injected into this function rather than
    imported globally, so the coding module does not
    depend on a particular model/provider.
    """

    structured_llm = llm.with_structured_output(
        InterviewerDecision
    )

    return structured_llm.invoke(
        prompt
    )


# ==========================================================
# Decide Intervention
# ==========================================================

def decide_intervention(
    db: Session,
    llm,
    user_id: int,
    problem: CodingProblem,
    approaches: List[CodingProblemApproach],
    current_code: str,
    observations: Optional[
        List[Dict[str, Any]]
    ] = None,
    execution_result: Optional[
        Dict[str, Any]
    ] = None,
) -> InterviewerDecision:
    """
    Complete interviewer reasoning pipeline.
    """

    candidate_skill_context = (
        build_candidate_skill_context(
            db=db,
            user_id=user_id,
        )
    )

    problem_knowledge = (
        build_problem_knowledge(
            problem=problem,
            approaches=approaches,
        )
    )

    observation_context = (
        build_observation_context(
            observations
        )
    )

    execution_context = (
        build_execution_context(
            execution_result
        )
    )

    prompt = build_interviewer_prompt(
        candidate_skill_context=(
            candidate_skill_context
        ),
        problem_knowledge=problem_knowledge,
        current_code=current_code,
        observation_context=observation_context,
        execution_context=execution_context,
    )

    return ask_interviewer(
        llm=llm,
        prompt=prompt,
    )


# ==========================================================
# Save Interviewer Event
# ==========================================================

def save_intervention(
    db: Session,
    session_id: int,
    decision: InterviewerDecision,
    current_code: str,
):
    """
    Save the interviewer event only when an actual
    intervention was requested.
    """

    if not decision.should_intervene:
        return None

    if not decision.question:
        return None

    return save_interviewer_event(
        db=db,
        session_id=session_id,
        question=decision.question,
        reason=decision.reason or "",
        related_code=current_code,
        related_concept=(
            decision.related_pattern
        ),
    )