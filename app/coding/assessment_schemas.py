"""
Pydantic schemas for coding assessments.

These schemas define the API contract between the frontend
and the coding assessment backend.
"""

from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


# ==========================================================
# Constants
# ==========================================================

MIN_QUESTIONS = 1
MAX_QUESTIONS = 10

MIN_DURATION_MINUTES = 15
MAX_DURATION_MINUTES = 180

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
# Start Assessment Request
# ==========================================================


class AssessmentStartRequest(BaseModel):
    """
    Request sent when the candidate wants to configure
    a new coding assessment.
    """

    mode: str = Field(
        ...,
        description=(
            "Assessment mode: "
            "company_oa, contest, or personalized."
        ),
    )

    company: Optional[str] = Field(
        default=None,
        description="Optional company name.",
    )

    role: Optional[str] = Field(
        default=None,
        description="Optional target role.",
    )

    topics: List[str] = Field(
        default_factory=list,
        description=(
            "Requested coding topics. "
            "Primarily used for personalized practice."
        ),
    )

    question_count: Optional[int] = Field(
        default=None,
        ge=MIN_QUESTIONS,
        le=MAX_QUESTIONS,
        description=(
            "Optional number of questions. "
            "If omitted, AI chooses it."
        ),
    )

    interviewer_mode: Optional[str] = Field(
        default=None,
        description="off or smart.",
    )

    @field_validator("mode")
    @classmethod
    def validate_mode(cls, value: str) -> str:
        value = value.strip().lower()

        if value not in VALID_MODES:
            raise ValueError(
                "mode must be one of: "
                "company_oa, contest, personalized"
            )

        return value

    @field_validator("company", "role")
    @classmethod
    def normalize_optional_text(
        cls,
        value: Optional[str],
    ) -> Optional[str]:

        if value is None:
            return None

        value = value.strip()

        return value or None

    @field_validator("topics")
    @classmethod
    def normalize_topics(
        cls,
        value: List[str],
    ) -> List[str]:

        cleaned = []

        for topic in value:
            topic = str(topic).strip()

            if topic and topic not in cleaned:
                cleaned.append(topic)

        return cleaned

    @field_validator("interviewer_mode")
    @classmethod
    def validate_interviewer_mode(
        cls,
        value: Optional[str],
    ) -> Optional[str]:

        if value is None:
            return None

        value = value.strip().lower()

        if value not in VALID_INTERVIEWER_MODES:
            raise ValueError(
                "interviewer_mode must be either "
                "'off' or 'smart'."
            )

        return value


# ==========================================================
# Assessment Plan Response
# ==========================================================


class AssessmentPlanResponse(BaseModel):
    """
    Assessment configuration returned by the AI planner.
    """

    mode: str

    company: Optional[str] = None

    role: Optional[str] = None

    topics: List[str] = Field(
        default_factory=list
    )

    difficulty: str = "mixed"

    question_count: int = Field(
        ...,
        ge=MIN_QUESTIONS,
        le=MAX_QUESTIONS,
    )

    duration_minutes: int = Field(
        ...,
        ge=MIN_DURATION_MINUTES,
        le=MAX_DURATION_MINUTES,
    )

    interviewer_mode: str = "smart"

    reasoning: str = ""


# ==========================================================
# Question Count Update
# ==========================================================


class QuestionCountUpdateRequest(BaseModel):
    """
    Request used when the candidate changes the number
    of assessment questions.
    """

    question_count: int = Field(
        ...,
        ge=MIN_QUESTIONS,
        le=MAX_QUESTIONS,
    )


# ==========================================================
# Assessment Question
# ==========================================================


class AssessmentQuestionResponse(BaseModel):
    """
    Problem information shown to the frontend.

    This intentionally contains only information needed
    by the coding interface.
    """

    question_number: int = Field(
        ...,
        ge=1,
    )

    problem_id: int

    title: str

    statement: str

    category: str

    difficulty: str

    constraints: List[str] = Field(
        default_factory=list
    )

    examples: List[dict] = Field(
        default_factory=list
    )

    hints_available: bool = False


# ==========================================================
# Assessment Start Response
# ==========================================================


class AssessmentStartResponse(BaseModel):
    """
    Complete response returned after creating an assessment.
    """

    success: bool = True

    assessment_id: str

    mode: str

    company: Optional[str] = None

    role: Optional[str] = None

    topics: List[str] = Field(
        default_factory=list
    )

    difficulty: str

    question_count: int = Field(
        ...,
        ge=MIN_QUESTIONS,
        le=MAX_QUESTIONS,
    )

    duration_minutes: int = Field(
        ...,
        ge=MIN_DURATION_MINUTES,
        le=MAX_DURATION_MINUTES,
    )

    interviewer_mode: str

    questions: List[AssessmentQuestionResponse] = Field(
        default_factory=list
    )


# ==========================================================
# Question Submission
# ==========================================================


class AssessmentQuestionSubmission(BaseModel):
    """
    Candidate's code submission for one assessment question.
    """

    assessment_id: str

    problem_id: int

    code: str

    language: str = "cpp"

    submit: bool = False


# ==========================================================
# Execution Response
# ==========================================================


class AssessmentExecutionResponse(BaseModel):
    """
    Execution result returned after running candidate code.
    """

    problem_id: int

    passed: bool

    passed_tests: int = 0

    total_tests: int = 0

    stdout: Optional[str] = None

    stderr: Optional[str] = None

    error: Optional[str] = None

    execution_time_ms: Optional[float] = None

    memory_used_kb: Optional[float] = None

    can_submit: bool = False


# ==========================================================
# Interviewer Event Response
# ==========================================================


class AssessmentInterviewerResponse(BaseModel):
    """
    Optional smart interviewer intervention.
    """

    triggered: bool = False

    question: Optional[str] = None

    reason: Optional[str] = None

    related_concept: Optional[str] = None


# ==========================================================
# Question Result
# ==========================================================


class AssessmentQuestionResult(BaseModel):
    """
    Result of one coding question.
    """

    question_number: int

    problem_id: int

    title: str

    submitted: bool = False

    passed: bool = False

    passed_tests: int = 0

    total_tests: int = 0

    score: Optional[float] = None

    feedback: Optional[str] = None

    interviewer: Optional[
        AssessmentInterviewerResponse
    ] = None


# ==========================================================
# Final Assessment Result
# ==========================================================


class AssessmentResultResponse(BaseModel):
    """
    Complete final coding assessment report.
    """

    success: bool = True

    assessment_id: str

    completed: bool = True

    mode: str

    company: Optional[str] = None

    role: Optional[str] = None

    question_count: int

    attempted_questions: int

    solved_questions: int

    overall_score: Optional[float] = None

    questions: List[AssessmentQuestionResult] = Field(
        default_factory=list
    )

    strengths: List[str] = Field(
        default_factory=list
    )

    weaknesses: List[str] = Field(
        default_factory=list
    )

    recommendations: List[str] = Field(
        default_factory=list
    )

    summary: str = ""


# ==========================================================
# Generic API Response
# ==========================================================


class AssessmentMessageResponse(BaseModel):
    """
    Small response used by actions such as completing
    or cancelling an assessment.
    """

    success: bool = True

    message: str


# ==========================================================
# Exports
# ==========================================================

__all__ = [
    "AssessmentStartRequest",
    "AssessmentPlanResponse",
    "QuestionCountUpdateRequest",
    "AssessmentQuestionResponse",
    "AssessmentStartResponse",
    "AssessmentQuestionSubmission",
    "AssessmentExecutionResponse",
    "AssessmentInterviewerResponse",
    "AssessmentQuestionResult",
    "AssessmentResultResponse",
    "AssessmentMessageResponse",
]