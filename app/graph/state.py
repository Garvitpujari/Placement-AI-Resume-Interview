"""
state.py

Defines the shared state flowing through the LangGraph workflow.

Only contains working memory for the current execution.
Permanent memory is stored in PostgreSQL.
"""

import operator
from typing import List, Optional

from typing_extensions import Annotated, TypedDict

from app.graph.schemas import (
    CandidateMemoryItem,
    CompanyResearch,
    ConversationTurn,
    InterviewFeedback,
    InterviewQuestion,
    Mode,
)

class PlacementState(TypedDict):
    """
    Shared state for one execution of the Placement AI graph.
    """

    # ==========================================================
    # User
    # ==========================================================

    user_id: int

    # ==========================================================
    # User Request
    # ==========================================================

    user_query: str

    mode: Optional[Mode]

    # ==========================================================
    # Interview Setup
    # ==========================================================

    company: str

    role: str

    resume_text: str

    candidate_profile: str


    # ==========================================================
    # Candidate Memory
    # ==========================================================

    candidate_memories: List[CandidateMemoryItem]

    # ==========================================================
    # Current Interview
    # ==========================================================

    interview_id: str

    current_question: Optional[InterviewQuestion]

    conversation: Annotated[
        List[ConversationTurn],
        operator.add,
    ]
    # ==========================================================
    # Interview Progress
    # ==========================================================

    question_count: int

    max_questions: int

    interview_completed: bool

    current_answer: str

    setup_completed: bool


    # ==========================================================
    # Company Research
    # ==========================================================

    company_info: Optional[CompanyResearch]

    # ==========================================================
    # Final Feedback
    # ==========================================================

    feedback: Optional[InterviewFeedback]