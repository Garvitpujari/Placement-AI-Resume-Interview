"""
schemas.py

Contains all Pydantic models used throughout the Placement AI backend.
"""

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


# ==========================================================
# Mode Enum
# ==========================================================

class Mode(str, Enum):
    INTERVIEW = "interview"
    RESEARCH = "research"


# ==========================================================
# Conversation
# ==========================================================

# class ConversationTurn(BaseModel):
#     """Represents a single interview interaction."""

#     question: str = Field(
#         ...,
#         description="Interview question asked by the AI."
#     )

#     answer: str = Field(
#         default="",
#         description="Candidate answer."
#     )


# ==========================================================
# Conversation
# ==========================================================

# for each question

class ConversationTurn(BaseModel):
    """Represents one interview interaction."""

    question: str = Field(
        ...,
        description="Interview question asked by the AI."
    )

    answer: str = Field(
        default="",
        description="Candidate answer."
    )

    topic: Optional[str] = Field(
        default=None,
        description="Topic being assessed (DSA, OOP, DBMS, etc.)."
    )

    difficulty: Optional[str] = Field(
        default=None,
        description="Difficulty level of the question."
    )

    follow_up: bool = Field(
        default=False,
        description="Whether this question is a follow-up."
    )

    score: Optional[float] = Field(
        default=None,
        ge=0,
        le=10,
        description="Score assigned after evaluating the answer."
    )

    evaluation: Optional[str] = Field(
        default=None,
        description="Brief evaluation of the candidate's answer."
    )


# ==========================================================
# Company Research
# ==========================================================

class CompanyResearch(BaseModel):
    """Information collected about a company."""

    company_name: str

    overview: str

    products: List[str] = Field(default_factory=list)

    hiring_process: List[str] = Field(default_factory=list)

    interview_topics: List[str] = Field(default_factory=list)

    salary_info: Optional[str] = None


# ==========================================================
# Interview Feedback
# ==========================================================

class InterviewFeedback(BaseModel):
    """Final feedback after interview completion."""

    overall_score: float = Field(
        ...,
        ge=0,
        le=10,
    )

    strengths: List[str] = Field(default_factory=list)

    weaknesses: List[str] = Field(default_factory=list)

    recommendations: List[str] = Field(default_factory=list)

    summary: str


# ==========================================================
# Routing Decision
# ==========================================================
 # what to do based on users query
class RoutingDecision(BaseModel):
    """Router output."""

    mode: Mode

    company: Optional[str] = None

    role: Optional[str] = None

    reason: Optional[str] = None


# ==========================================================
# Interview Question
# ==========================================================

class InterviewQuestion(BaseModel):
    """Current interview question."""

    question: str

    category: Optional[str] = None  # whole system does not fails if it fails

    difficulty: Optional[str] = None

    follow_up: bool = False


# ==========================================================
# Answer Evaluation
# ==========================================================

class AnswerEvaluation(BaseModel):
    """
    Evaluation of the candidate's answer.
    """

    score: float = Field(
        ...,
        ge=0,
        le=10,
        description="Overall score for the answer."
    )

    evaluation: str = Field(
        ...,
        description="Brief evaluation of the answer."
    )

    follow_up_required: bool = Field(
        default=False,
        description="Whether a follow-up question is required."
    )

    reason: str = Field(
        ...,
        description="Reason for the evaluation and follow-up decision."
    )

    # ==========================================================
# Interview Turn
# ==========================================================

class InterviewTurn(BaseModel):
    """
    Evaluates the previous answer and generates
    the next interview question in a single LLM call.
    """

    score: float = Field(
        ...,
        ge=0,
        le=10,
        description="Overall score for the previous answer."
    )

    evaluation: str = Field(
        ...,
        description="Evaluation of the previous answer."
    )

    follow_up_required: bool = Field(
        default=False,
        description="Whether a follow-up question is required."
    )

    question: str = Field(
        ...,
        description="Next interview question."
    )

    category: Optional[str] = Field(
        default=None,
        description="Question category."
    )

    difficulty: Optional[str] = Field(
        default=None,
        description="Difficulty level."
    )

    follow_up: bool = Field(
        default=False,
        description="Whether this question is a follow-up."
    )



# ==========================================================
# Candidate Memory
# ==========================================================

class CandidateMemoryItem(BaseModel):
    """A long-term insight about the candidate."""

    memory: str

    category: str

    subcategory: Optional[str] = None

    importance: int = Field(
        ...,
        ge=1,
        le=10,
        description="Importance of this memory for future placement assessments."
    )

    confidence: float = Field(
        ...,
        ge=0,
        le=1,
        description="Confidence that this memory is supported by the evidence."
    )

    evidence: Optional[str] = Field(
        default=None,
        description="Evidence supporting this memory."
    )



# ==========================================================
# Candidate Memory Response
# ==========================================================

class CandidateMemoryResponse(BaseModel):
    """Structured response containing multiple candidate memories."""

    memories: List[CandidateMemoryItem] = Field(
        default_factory=list,
        description="Long-term candidate memories extracted from the interview."
    )