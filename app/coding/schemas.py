"""
schemas.py

Pydantic schemas for the Live Coding Interview and
Coding Assessment modules.

This module is intentionally separate from the existing
Placement AI interview schemas.
"""

from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ==========================================================
# Coding Mode
# ==========================================================

class CodingMode(str, Enum):
    """
    Type of coding session requested by the candidate.
    """

    MOCK_INTERVIEW = "mock_interview"
    CONTEST = "contest"
    PRACTICE = "practice"


# ==========================================================
# Assessment Mode
# ==========================================================

class AssessmentMode(str, Enum):
    """
    Type of multi-question coding assessment.
    """

    COMPANY_OA = "company_oa"
    CONTEST = "contest"
    PERSONALIZED = "personalized"


# ==========================================================
# Difficulty
# ==========================================================

class CodingDifficulty(str, Enum):

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    MIXED = "mixed"


# ==========================================================
# Programming Language
# ==========================================================

class ProgrammingLanguage(str, Enum):

    CPP = "cpp"
    PYTHON = "python"


# ==========================================================
# Problem Category
# ==========================================================

class ProblemCategory(str, Enum):

    ARRAY = "array"
    STRING = "string"
    HASHING = "hashing"
    LINKED_LIST = "linked_list"
    STACK = "stack"
    QUEUE = "queue"
    TREE = "tree"
    GRAPH = "graph"
    HEAP = "heap"
    BINARY_SEARCH = "binary_search"
    GREEDY = "greedy"
    DYNAMIC_PROGRAMMING = "dynamic_programming"
    BACKTRACKING = "backtracking"
    SORTING = "sorting"
    OTHER = "other"


# ==========================================================
# Interviewer Mode
# ==========================================================

class InterviewerMode(str, Enum):

    OFF = "off"
    SMART = "smart"


# ==========================================================
# Session Configuration
# ==========================================================

class CodingSessionConfig(BaseModel):
    """
    Configuration for one coding session.
    """

    mode: CodingMode

    company: Optional[str] = None

    role: Optional[str] = None

    difficulty: Optional[CodingDifficulty] = None

    category: Optional[ProblemCategory] = None

    language: ProgrammingLanguage = ProgrammingLanguage.CPP

    number_of_questions: Optional[int] = Field(
        default=None,
        ge=1,
    )

    duration_minutes: Optional[int] = Field(
        default=None,
        ge=1,
    )


# ==========================================================
# Assessment Configuration
# ==========================================================

class AssessmentConfig(BaseModel):
    """
    Configuration for a multi-question coding assessment.
    """

    mode: AssessmentMode

    company: Optional[str] = None

    role: Optional[str] = None

    topics: List[str] = Field(
        default_factory=list
    )

    difficulty: CodingDifficulty = (
        CodingDifficulty.MIXED
    )

    question_count: int = Field(
        default=4,
        ge=1,
        le=10,
    )

    duration_minutes: int = Field(
        default=60,
        ge=15,
        le=180,
    )

    interviewer_mode: InterviewerMode = (
        InterviewerMode.SMART
    )


# ==========================================================
# Assessment Start Request
# ==========================================================

class AssessmentStartRequest(BaseModel):
    """
    Request used to create a new coding assessment.

    question_count is optional because the AI can decide
    the initial number of questions.
    """

    mode: AssessmentMode

    company: Optional[str] = None

    role: Optional[str] = None

    topics: List[str] = Field(
        default_factory=list
    )

    question_count: Optional[int] = Field(
        default=None,
        ge=1,
        le=10,
    )

    interviewer_mode: Optional[InterviewerMode] = None

    language: ProgrammingLanguage = (
        ProgrammingLanguage.CPP
    )


# ==========================================================
# Assessment Plan
# ==========================================================

class AssessmentPlanResponse(BaseModel):
    """
    Configuration decided by the AI assessment planner.
    """

    mode: AssessmentMode

    company: Optional[str] = None

    role: Optional[str] = None

    topics: List[str] = Field(
        default_factory=list
    )

    difficulty: CodingDifficulty

    question_count: int = Field(
        ...,
        ge=1,
        le=10,
    )

    duration_minutes: int = Field(
        ...,
        ge=15,
        le=180,
    )

    interviewer_mode: InterviewerMode

    reasoning: str = ""


# ==========================================================
# Question Count Update
# ==========================================================

class QuestionCountUpdateRequest(BaseModel):
    """
    Used when the candidate changes the number of questions
    before starting the assessment.
    """

    question_count: int = Field(
        ...,
        ge=1,
        le=10,
    )


# ==========================================================
# Problem Approach
# ==========================================================

class ProblemApproach(BaseModel):
    """
    Represents one known approach for solving a problem.

    Example:

    Brute Force
    Better
    Optimal
    """

    name: str

    explanation: str

    time_complexity: Optional[str] = None

    space_complexity: Optional[str] = None

    code_available: bool = False


# ==========================================================
# Test Case
# ==========================================================

class CodingTestCase(BaseModel):
    """
    Test case used to evaluate candidate code.
    """

    input: str

    expected_output: str

    explanation: Optional[str] = None

    hidden: bool = False


# ==========================================================
# Coding Problem
# ==========================================================

class CodingProblem(BaseModel):
    """
    Complete structured representation of a coding problem.
    """

    title: str

    statement: str

    category: ProblemCategory

    difficulty: CodingDifficulty

    constraints: List[str] = Field(
        default_factory=list
    )

    examples: List[CodingTestCase] = Field(
        default_factory=list
    )

    approaches: List[ProblemApproach] = Field(
        default_factory=list
    )

    optimal_approach: Optional[str] = None

    common_mistakes: List[str] = Field(
        default_factory=list
    )

    hints: List[str] = Field(
        default_factory=list
    )

    source: Optional[str] = None

    source_url: Optional[str] = None


# ==========================================================
# Assessment Question
# ==========================================================

class AssessmentQuestion(BaseModel):
    """
    One question inside a coding assessment.
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

    examples: List[Dict[str, Any]] = Field(
        default_factory=list
    )

    hints_available: bool = False


# ==========================================================
# Assessment Start Response
# ==========================================================

class AssessmentStartResponse(BaseModel):
    """
    Response returned after an assessment is created.
    """

    success: bool = True

    assessment_id: str

    mode: AssessmentMode

    company: Optional[str] = None

    role: Optional[str] = None

    topics: List[str] = Field(
        default_factory=list
    )

    difficulty: CodingDifficulty

    question_count: int = Field(
        ...,
        ge=1,
        le=10,
    )

    duration_minutes: int = Field(
        ...,
        ge=15,
        le=180,
    )

    interviewer_mode: InterviewerMode

    questions: List[AssessmentQuestion] = Field(
        default_factory=list
    )


# ==========================================================
# Assessment Question Submission
# ==========================================================

class AssessmentQuestionSubmission(BaseModel):
    """
    Candidate code submitted for one assessment question.
    """

    assessment_id: str

    problem_id: int

    code: str

    language: ProgrammingLanguage = (
        ProgrammingLanguage.CPP
    )

    submit: bool = False


# ==========================================================
# Code Snapshot
# ==========================================================

class CodeSnapshot(BaseModel):
    """
    Snapshot of candidate code at a particular point in time.

    We will eventually create snapshots every few seconds
    or when a meaningful code change occurs.
    """

    code: str

    language: ProgrammingLanguage

    timestamp: Optional[str] = None

    trigger: Optional[str] = None


# ==========================================================
# Code Execution
# ==========================================================

class CodeExecution(BaseModel):
    """
    Result of executing candidate code.
    """

    code: str

    language: ProgrammingLanguage

    passed: bool

    passed_tests: int = 0

    total_tests: int = 0

    stdout: Optional[str] = None

    stderr: Optional[str] = None

    execution_time_ms: Optional[float] = None

    memory_used_kb: Optional[float] = None

    error: Optional[str] = None


# ==========================================================
# Assessment Execution
# ==========================================================

class AssessmentExecutionResponse(BaseModel):
    """
    Execution result for one assessment question.
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
# Coding Observation
# ==========================================================

class CodingObservation(BaseModel):
    """
    Observation made by the coding interviewer.

    This does NOT necessarily mean that the AI should
    immediately interrupt the candidate.
    """

    observation: str

    category: str

    severity: Optional[str] = None

    evidence: Optional[str] = None

    should_intervene: bool = False


# ==========================================================
# Interviewer Event
# ==========================================================

class InterviewerEvent(BaseModel):
    """
    Represents an intervention/question from the
    coding interviewer.
    """

    question: str

    reason: str

    related_code: Optional[str] = None

    related_concept: Optional[str] = None

    timestamp: Optional[str] = None


# ==========================================================
# Assessment Interviewer Response
# ==========================================================

class AssessmentInterviewerResponse(BaseModel):
    """
    Smart interviewer response for an assessment question.
    """

    triggered: bool = False

    question: Optional[str] = None

    reason: Optional[str] = None

    related_concept: Optional[str] = None


# ==========================================================
# Hint Event
# ==========================================================

class HintEvent(BaseModel):
    """
    Records a hint requested/given during the session.
    """

    level: int = Field(
        ...,
        ge=1,
        le=3,
    )

    hint: str

    timestamp: Optional[str] = None


# ==========================================================
# Dry Run
# ==========================================================

class DryRunSession(BaseModel):
    """
    Represents a candidate's dry-run activity.

    The actual drawing/canvas data will be handled
    separately by the frontend.
    """

    test_case_input: Optional[str] = None

    canvas_data: Optional[str] = None

    duration_seconds: Optional[int] = None

    timestamp: Optional[str] = None


# ==========================================================
# Coding Feedback
# ==========================================================

class CodingFeedback(BaseModel):
    """
    Final assessment of a coding session.
    """

    overall_score: float = Field(
        ...,
        ge=0,
        le=10,
    )

    problem_understanding: float = Field(
        ...,
        ge=0,
        le=10,
    )

    approach_quality: float = Field(
        ...,
        ge=0,
        le=10,
    )

    code_quality: float = Field(
        ...,
        ge=0,
        le=10,
    )

    correctness: float = Field(
        ...,
        ge=0,
        le=10,
    )

    optimization: float = Field(
        ...,
        ge=0,
        le=10,
    )

    communication: float = Field(
        ...,
        ge=0,
        le=10,
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

    summary: str


# ==========================================================
# Assessment Question Result
# ==========================================================

class AssessmentQuestionResult(BaseModel):
    """
    Final result for one assessment question.
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
# Assessment Final Result
# ==========================================================

class AssessmentResultResponse(BaseModel):
    """
    Complete final coding assessment report.
    """

    success: bool = True

    assessment_id: str

    completed: bool = True

    mode: AssessmentMode

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
# Generic Assessment Message
# ==========================================================

class AssessmentMessageResponse(BaseModel):
    """
    Generic response for assessment actions.
    """

    success: bool = True

    message: str


# ==========================================================
# Coding Session Result
# ==========================================================

class CodingSessionResult(BaseModel):
    """
    Complete result returned after a coding session.
    """

    session_id: Optional[int] = None

    problem: CodingProblem

    final_code: Optional[str] = None

    executions: List[CodeExecution] = Field(
        default_factory=list
    )

    observations: List[CodingObservation] = Field(
        default_factory=list
    )

    interviewer_events: List[InterviewerEvent] = Field(
        default_factory=list
    )

    hints: List[HintEvent] = Field(
        default_factory=list
    )

    dry_runs: List[DryRunSession] = Field(
        default_factory=list
    )

    feedback: Optional[CodingFeedback] = None