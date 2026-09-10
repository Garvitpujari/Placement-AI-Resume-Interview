"""
coding_feedback_service.py

Converts the solution judgement into persistent coding
feedback and candidate skill updates.

Flow:

    SolutionJudgement
            ↓
    CodingFeedback
            ↓
    Candidate skill profile
            ↓
    Future problem selection

This module does NOT:
- Execute code.
- Generate problems.
- Analyze every keystroke.
- Generate interviewer questions.
"""

from typing import Dict, Optional

from sqlalchemy.orm import Session

from .crud import (
    save_coding_feedback,
)

from .candidate_skill_service import (
    update_candidate_skills,
)

from .solution_judge_service import (
    SolutionJudgement,
)


# ==========================================================
# Calculate Feedback Scores
# ==========================================================

def calculate_feedback_scores(
    judgement: SolutionJudgement,
) -> Dict[str, float]:
    """
    Convert the structured solution judgement into
    normalized feedback scores.

    Scores are on a 0-10 scale.
    """

    # ------------------------------------------------------
    # Correctness
    # ------------------------------------------------------

    correctness = (
        10.0
        if judgement.correct
        else 0.0
    )

    # ------------------------------------------------------
    # Optimization
    # ------------------------------------------------------

    if judgement.optimal:

        optimization = 10.0

    elif judgement.better_approach_available:

        optimization = 6.0

    else:

        optimization = 8.0

    # ------------------------------------------------------
    # Approach Quality
    # ------------------------------------------------------

    approach_level = (
        judgement.approach_level
        or ""
    ).lower()

    if approach_level == "optimal":

        approach_quality = 10.0

    elif approach_level == "better":

        approach_quality = 8.0

    elif approach_level == "brute":

        approach_quality = 5.0

    else:

        approach_quality = 5.0

    # ------------------------------------------------------
    # Problem Understanding
    # ------------------------------------------------------

    if judgement.correct:

        problem_understanding = 9.0

    else:

        problem_understanding = 5.0

    # ------------------------------------------------------
    # Code Quality
    # ------------------------------------------------------

    # Code-quality assessment will become richer later.
    # For now it follows the quality of the judged
    # algorithmic solution rather than formatting.

    if judgement.correct:

        code_quality = 8.0

    else:

        code_quality = 5.0

    # ------------------------------------------------------
    # Communication
    # ------------------------------------------------------

    # Communication is not reliably measurable from the
    # solution judgement alone. Keep this neutral until
    # the interview/communication layer provides evidence.

    communication = 5.0

    # ------------------------------------------------------
    # Overall
    # ------------------------------------------------------

    overall = (
        problem_understanding
        + approach_quality
        + code_quality
        + correctness
        + optimization
        + communication
    ) / 6.0

    return {
        "overall_score": round(
            overall,
            2,
        ),
        "problem_understanding": (
            problem_understanding
        ),
        "approach_quality": (
            approach_quality
        ),
        "code_quality": (
            code_quality
        ),
        "correctness": correctness,
        "optimization": optimization,
        "communication": communication,
    }


# ==========================================================
# Build Feedback Text
# ==========================================================

def build_feedback_text(
    judgement: SolutionJudgement,
):
    """
    Convert the judgement into candidate-facing feedback.
    """

    strengths = list(
        judgement.strengths or []
    )

    weaknesses = list(
        judgement.weaknesses or []
    )

    recommendations = []

    if judgement.better_approach_available:

        recommendations.append(
            "Explore the better known approach "
            "and compare its complexity with the "
            "current solution."
        )

    if not judgement.optimal:

        recommendations.append(
            "Practice identifying when a correct "
            "solution can be improved further."
        )

    if judgement.recommended_follow_up:

        recommendations.append(
            judgement.recommended_follow_up
        )

    summary_parts = [
        (
            "Solution status: "
            + (
                "correct"
                if judgement.correct
                else "incorrect"
            )
        ),
        (
            "Approach: "
            + (
                judgement.approach_level
                or "unclear"
            )
        ),
    ]

    if judgement.time_complexity:

        summary_parts.append(
            "Time complexity: "
            + judgement.time_complexity
        )

    if judgement.space_complexity:

        summary_parts.append(
            "Space complexity: "
            + judgement.space_complexity
        )

    summary = ". ".join(
        summary_parts
    ) + "."

    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "summary": summary,
    }


# ==========================================================
# Update Candidate Pattern Skills
# ==========================================================

def update_skills_from_judgement(
    db: Session,
    user_id: int,
    pattern: Optional[str],
    judgement: SolutionJudgement,
    evidence: Optional[str] = None,
):
    """
    Update the candidate's persistent skill profile
    based on the judged result.

    The pattern should come from the problem's known
    pattern/category, not from arbitrary code keywords.
    """

    if not pattern:

        return {}

    # ------------------------------------------------------
    # Base score
    # ------------------------------------------------------

    if not judgement.correct:

        score = 3.0

    elif judgement.optimal:

        score = 9.0

    elif judgement.better_approach_available:

        score = 6.5

    else:

        score = 8.0

    return update_candidate_skills(
        db=db,
        user_id=user_id,
        pattern_scores={
            pattern: score,
        },
        evidence=evidence,
    )


# ==========================================================
# Persist Coding Feedback
# ==========================================================

def save_judgement_feedback(
    db: Session,
    session_id: int,
    user_id: int,
    judgement: SolutionJudgement,
    pattern: Optional[str] = None,
    evidence: Optional[str] = None,
):
    """
    Persist the final coding judgement and update the
    candidate's long-term coding skill memory.
    """

    scores = calculate_feedback_scores(
        judgement=judgement,
    )

    feedback_text = build_feedback_text(
        judgement=judgement,
    )

    feedback = save_coding_feedback(
        db=db,
        session_id=session_id,
        overall_score=scores[
            "overall_score"
        ],
        problem_understanding=scores[
            "problem_understanding"
        ],
        approach_quality=scores[
            "approach_quality"
        ],
        code_quality=scores[
            "code_quality"
        ],
        correctness=scores[
            "correctness"
        ],
        optimization=scores[
            "optimization"
        ],
        communication=scores[
            "communication"
        ],
        strengths="\n".join(
            feedback_text["strengths"]
        ),
        weaknesses="\n".join(
            feedback_text["weaknesses"]
        ),
        recommendations="\n".join(
            feedback_text["recommendations"]
        ),
        summary=feedback_text["summary"],
    )

    # ------------------------------------------------------
    # Update persistent candidate skill
    # ------------------------------------------------------

    skill_updates = (
        update_skills_from_judgement(
            db=db,
            user_id=user_id,
            pattern=pattern,
            judgement=judgement,
            evidence=evidence,
        )
    )

    return {
        "feedback": feedback,
        "skill_updates": skill_updates,
        "scores": scores,
    }