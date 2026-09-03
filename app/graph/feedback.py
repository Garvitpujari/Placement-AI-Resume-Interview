"""
feedback.py

Feedback Agent

Responsibilities:
- Evaluate the completed interview.
- Analyze the entire conversation.
- Generate structured interview feedback.

Future Upgrades:
- Compare against previous interviews
- Personalized recommendations
- Skill-wise scoring
- Company-specific evaluation
"""

from langchain_core.prompts import ChatPromptTemplate

from app.config import fast_llm
from app.graph.schemas import InterviewFeedback
from app.graph.state import PlacementState


# ==========================================================
# Prompt
# ==========================================================

feedback_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are an experienced Software Engineering interviewer.

You have completed the interview.

Evaluate the candidate based on:

- Technical knowledge
- Problem solving
- Communication
- Depth of understanding
- Overall interview performance

Return ONLY a valid InterviewFeedback object.

Scoring:
0 = Very Poor
10 = Excellent

Provide:
- Overall score
- Strengths
- Weaknesses
- Recommendations
- Short summary
""",
        ),
        (
            "human",
            """
Company:
{company}

Role:
{role}

Interview Conversation:
{conversation}
""",
        ),
    ]
)


# ==========================================================
# Structured Output
# ==========================================================

structured_llm = fast_llm.with_structured_output(
    InterviewFeedback
)

feedback_chain = feedback_prompt | structured_llm


# ==========================================================
# Feedback Node
# ==========================================================

def feedback(
    state: PlacementState,
) -> PlacementState:
    """
    Generates structured interview feedback only
    after the interview has finished.

    Missing runtime fields are handled safely so
    partially initialized test states do not raise
    KeyError.
    """

    # ======================================================
    # Interview Completion Check
    # ======================================================

    if not state.get(
        "interview_completed",
        False,
    ):
        return state

    # ======================================================
    # Conversation Check
    # ======================================================

    conversation = state.get(
        "conversation",
        [],
    )

    if not conversation:
        return state

    try:

        # ==================================================
        # Generate Feedback
        # ==================================================

        interview_feedback = feedback_chain.invoke(
            {
                "company": state.get(
                    "company",
                    "",
                ),
                "role": state.get(
                    "role",
                    "",
                ),
                "conversation": conversation,
            }
        )

        state["feedback"] = interview_feedback

        return state

    except Exception as e:

        raise RuntimeError(
            f"Feedback Agent failed: {e}"
        ) from e