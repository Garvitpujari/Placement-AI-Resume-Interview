"""
main.py

FastAPI bridge for the Placement AI frontend.

Existing features:
- AI Career Assistant
- Resume Interview

Coding Assessment features:
- AI assessment planning
- Multi-question assessment creation
- Assessment retrieval
- Question progression
- Visible test execution
- Hidden test submission
- Assessment completion
"""

import json
import os
import tempfile
import uuid
from typing import Any, Dict

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from langchain_core.prompts import ChatPromptTemplate

from app.config import fast_llm

from app.database.database import SessionLocal

from app.graph.graph import graph
from app.graph.memory import retrieve_relevant_memories

from app.resume.profile_generator import get_candidate_profile
from app.resume.resume_service import get_resume_text

from app.coding.assessment_service import (
    create_assessment,
    get_assessment,
    get_user_assessment,
    get_current_question,
    start_assessment_question,
    complete_current_question,
    complete_assessment,
    delete_assessment,
    update_assessment_question_count,
    get_assessment_coding_state,
)

from app.coding.assessment_execution_service import (
    run_assessment_code,
    submit_assessment_solution,
    build_question_result,
)

from app.coding.coding_session_orchestrator import (
    process_live_code_update,
)

from app.coding.execution_service import (
    get_execution_test_cases,
)

from app.coding.schemas import (
    AssessmentStartRequest,
    AssessmentStartResponse,
    AssessmentQuestion,
    QuestionCountUpdateRequest,
    AssessmentQuestionResult,
    AssessmentResultResponse,
)


# ==========================================================
# FastAPI Application
# ==========================================================

app = FastAPI(
    title="Placement AI API",
    version="1.0.0",
)


# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================================
# Temporary Runtime Interview Storage
# ==========================================================

INTERVIEW_SESSIONS: Dict[str, Dict[str, Any]] = {}

CODING_VOICE_SESSIONS: Dict[str, Dict[str, Any]] = {}


# ==========================================================
# Serialization Helpers
# ==========================================================

def _serialize_question(question):
    """
    Convert an interview question object/dict into
    a JSON-safe dictionary.
    """

    if question is None:
        return None

    if isinstance(question, dict):
        return question

    if hasattr(question, "model_dump"):
        return question.model_dump()

    if hasattr(question, "dict"):
        return question.dict()

    return {
        "question": str(question),
    }


def _serialize_feedback(feedback):
    """
    Convert feedback into a JSON-safe representation.
    """

    if feedback is None:
        return None

    if isinstance(feedback, dict):
        return feedback

    if hasattr(feedback, "model_dump"):
        return feedback.model_dump()

    if hasattr(feedback, "dict"):
        return feedback.dict()

    return {
        "message": str(feedback),
    }


def _get_user_id() -> int:
    """
    Temporary development user identity.

    Replace this later with the authenticated user ID.
    """

    return 1


# ==========================================================
# Health Check
# ==========================================================

@app.get("/")
def root():
    return {
        "success": True,
        "message": "Placement AI API is running.",
    }


@app.get("/health")
def health():
    return {
        "success": True,
        "status": "healthy",
    }


# ==========================================================
# Career Assistant
# ==========================================================

@app.post("/api/career/chat")
def career_chat(
    message: str = Form(...),
):
    """
    AI Career Assistant endpoint.
    """

    try:
        user_id = _get_user_id()

        memories = retrieve_relevant_memories(
            user_id=user_id,
            query=message,
        )

        memory_text = ""

        if memories:
            memory_text = "\n".join(
                str(memory)
                for memory in memories
            )

        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
You are Placement AI, a helpful career assistant.

Use the candidate's relevant stored memories when useful.
Give practical, concise and accurate career guidance.
Do not invent candidate information.
""",
                ),
                (
                    "human",
                    """
Candidate memories:
{memories}

Candidate message:
{message}
""",
                ),
            ]
        )

        chain = prompt | fast_llm

        response = chain.invoke(
            {
                "memories": memory_text,
                "message": message,
            }
        )

        content = getattr(
            response,
            "content",
            str(response),
        )

        return {
            "success": True,
            "message": content,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not process career request: "
                f"{exc}"
            ),
        ) from exc


# ==========================================================
# Resume Interview — Start
# ==========================================================

@app.post("/api/resume/start")
def start_resume_interview(
    company: str = Form(""),
    role: str = Form(""),
):
    """
    Start a resume-based interview.
    """

    try:
        user_id = _get_user_id()

        profile = get_candidate_profile(
            user_id=user_id,
        )

        resume_text = get_resume_text(
            user_id=user_id,
        )

        interview_id = str(uuid.uuid4())

        state = {
            "interview_id": interview_id,
            "user_id": user_id,
            "company": company,
            "role": role,
            "resume_text": resume_text,
            "profile": profile,
            "question_count": 0,
            "max_questions": 5,
            "current_question": None,
            "current_answer": None,
            "interview_completed": False,
        }

        INTERVIEW_SESSIONS[
            interview_id
        ] = state

        return {
            "success": True,
            "interview_id": interview_id,
            "company": company,
            "role": role,
            "question": _serialize_question(
                state.get("current_question")
            ),
            "question_count": 0,
            "max_questions": 5,
            "completed": False,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not start resume interview: "
                f"{exc}"
            ),
        ) from exc


# ==========================================================
# Resume Interview — Answer
# ==========================================================

@app.post("/api/resume/answer")
def answer_resume_interview(
    interview_id: str = Form(...),
    answer: str = Form(...),
):
    """
    Process an answer in an active resume interview.
    """

    state = INTERVIEW_SESSIONS.get(
        interview_id
    )

    if state is None:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found.",
        )

    if state.get("interview_completed"):
        return {
            "success": True,
            "completed": True,
            "interview_id": interview_id,
            "question": None,
        }

    try:
        state["current_answer"] = answer

        result = graph.invoke(
            state
        )

        INTERVIEW_SESSIONS[
            interview_id
        ] = result

        completed = bool(
            result.get(
                "interview_completed",
                False,
            )
        )

        if completed:
            return {
                "success": True,
                "completed": True,
                "interview_id": interview_id,
                "question": None,
                "feedback": _serialize_feedback(
                    result.get(
                        "feedback"
                    )
                ),
            }

        next_question = result.get(
            "current_question"
        )

        if next_question is None:
            raise HTTPException(
                status_code=500,
                detail=(
                    "Answer was processed, but "
                    "no next interview question was generated."
                ),
            )

        return {
            "success": True,
            "completed": False,
            "interview_id": interview_id,
            "question": _serialize_question(
                next_question
            ),
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not process interview answer: "
                f"{exc}"
            ),
        ) from exc


# ==========================================================
# Resume Interview — Get State
# ==========================================================

@app.get("/api/resume/{interview_id}")
def get_resume_interview(
    interview_id: str,
):
    state = INTERVIEW_SESSIONS.get(
        interview_id
    )

    if state is None:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found or expired.",
        )

    return {
        "success": True,
        "interview_id": interview_id,
        "company": state.get(
            "company",
            "",
        ),
        "role": state.get(
            "role",
            "",
        ),
        "question": _serialize_question(
            state.get(
                "current_question"
            )
        ),
        "question_count": state.get(
            "question_count",
            0,
        ),
        "max_questions": state.get(
            "max_questions",
            5,
        ),
        "completed": bool(
            state.get(
                "interview_completed",
                False,
            )
        ),
    }


# ==========================================================
# Resume Interview — Delete
# ==========================================================

@app.delete("/api/resume/{interview_id}")
def delete_resume_interview(
    interview_id: str,
):
    removed = INTERVIEW_SESSIONS.pop(
        interview_id,
        None,
    )

    if removed is None:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found.",
        )

    return {
        "success": True,
        "message": "Interview session removed.",
    }


# ==========================================================
# ==========================================================
# CODING ASSESSMENT API
# ==========================================================
# ==========================================================


# ==========================================================
# Create Assessment
# ==========================================================

@app.post(
    "/api/coding/assessment/create",
    response_model=AssessmentStartResponse,
)
def create_coding_assessment(
    request: AssessmentStartRequest,
):
    """
    Create a new AI-planned coding assessment.

    The candidate supplies:
    - mode
    - optional company
    - optional role
    - optional topics
    - optional question count
    - optional interviewer mode

    The AI decides the assessment configuration when
    the candidate has not explicitly supplied a value.
    """

    db = SessionLocal()

    try:
        user_id = _get_user_id()

        assessment = create_assessment(
            db=db,
            user_id=user_id,
            mode=request.mode.value,
            company=request.company,
            role=request.role,
            topics=request.topics,
            question_count=request.question_count,
            interviewer_mode=(
                request.interviewer_mode.value
                if request.interviewer_mode
                else None
            ),
            language=request.language.value,
        )

        return AssessmentStartResponse(
            success=True,
            assessment_id=assessment[
                "assessment_id"
            ],
            mode=assessment[
                "mode"
            ],
            company=assessment.get(
                "company"
            ),
            role=assessment.get(
                "role"
            ),
            topics=assessment.get(
                "topics",
                [],
            ),
            difficulty=assessment[
                "difficulty"
            ],
            question_count=assessment[
                "question_count"
            ],
            duration_minutes=assessment[
                "duration_minutes"
            ],
            interviewer_mode=assessment[
                "interviewer_mode"
            ],
            questions=[
                AssessmentQuestion(
                    **question
                )
                for question in assessment[
                    "questions"
                ]
            ],
        )

    except HTTPException:
        raise

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not create coding assessment: "
                f"{exc}"
            ),
        ) from exc

    finally:
        db.close()


# ==========================================================
# Get Assessment
# ==========================================================

@app.get(
    "/api/coding/assessment/{assessment_id}",
)
def get_coding_assessment(
    assessment_id: str,
):
    """
    Return the current assessment state.
    """

    try:
        user_id = _get_user_id()

        assessment = get_user_assessment(
            assessment_id=assessment_id,
            user_id=user_id,
        )

        return {
            "success": True,
            **assessment,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not retrieve assessment: "
                f"{exc}"
            ),
        ) from exc


# ==========================================================
# Get Current Question
# ==========================================================

@app.get(
    "/api/coding/assessment/{assessment_id}/question",
)
def get_coding_assessment_question(
    assessment_id: str,
):
    """
    Return the current question without starting
    its coding execution session.
    """

    try:
        user_id = _get_user_id()

        question = get_current_question(
            assessment_id=assessment_id,
            user_id=user_id,
        )

        return {
            "success": True,
            "question": question,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not retrieve current question: "
                f"{exc}"
            ),
        ) from exc


# ==========================================================
# Start Assessment Question
# ==========================================================

@app.post(
    "/api/coding/assessment/{assessment_id}/question/start",
)
def start_coding_assessment_question(
    assessment_id: str,
):
    """
    Start the exact problem selected for the
    current assessment question.

    The assessment service stores the live
    CodingSessionState so that Run and Submit
    operate on the same coding session.
    """

    db = SessionLocal()

    try:
        user_id = _get_user_id()

        result = start_assessment_question(
            db=db,
            assessment_id=assessment_id,
            user_id=user_id,
        )

        db.commit()

        return {
            "success": True,
            **result,
        }

    except ValueError as exc:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Could not start coding question: "
                f"{exc}"
            ),
        ) from exc

    finally:
        db.close()



def _get_or_start_assessment_coding_state(
    db,
    assessment_id: str,
    user_id: int,
):
    """
    Return the runtime coding state for the current assessment
    question. If the frontend has not explicitly started the
    question yet, start the exact assessment-selected problem.

    This makes Run, Live Interview and Voice Interview resilient
    to a frontend refresh or an initial request arriving before
    the /question/start call.
    """

    try:
        return get_assessment_coding_state(
            assessment_id=assessment_id,
            user_id=user_id,
        )
    except ValueError as exc:
        if "not been started" not in str(exc).lower():
            raise

        start_assessment_question(
            db=db,
            assessment_id=assessment_id,
            user_id=user_id,
        )

        return get_assessment_coding_state(
            assessment_id=assessment_id,
            user_id=user_id,
        )


def _normalize_interviewer(value):
    """
    Convert an interviewer result/event into a frontend-safe dict.
    """
    if value is None:
        return None

    if isinstance(value, dict):
        event = value.get("event")

        if event is not None:
            return {
                "question": getattr(event, "question", None),
                "reason": getattr(event, "reason", None),
                "related_code": getattr(
                    event,
                    "related_code",
                    None,
                ),
                "related_concept": getattr(
                    event,
                    "related_concept",
                    None,
                ),
            }

        return {
            "question": value.get("question"),
            "reason": value.get("reason"),
            "related_code": value.get("related_code"),
            "related_concept": value.get("related_concept"),
        }

    return {
        "question": getattr(value, "question", None),
        "reason": getattr(value, "reason", None),
        "related_code": getattr(
            value,
            "related_code",
            None,
        ),
        "related_concept": getattr(
            value,
            "related_concept",
            None,
        ),
    }


def _ensure_submission_follow_up(
    *,
    state,
    judgement,
    interviewer,
):
    """
    Ensure every accepted/correct submission has a technical
    interviewer follow-up.

    The follow-up is intentionally concise and focuses on the
    candidate's approach, time complexity or space complexity.
    """
    normalized = _normalize_interviewer(interviewer)

    if normalized and normalized.get("question"):
        return normalized

    judgement_dict = judgement

    if hasattr(judgement_dict, "model_dump"):
        judgement_dict = judgement_dict.model_dump()
    elif hasattr(judgement_dict, "dict"):
        judgement_dict = judgement_dict.dict()

    if not isinstance(judgement_dict, dict):
        judgement_dict = {}

    correct = judgement_dict.get("correct")

    if correct is not True:
        return normalized

    return {
        "question": (
            "Walk me through your approach and explain "
            "its time and space complexity."
        ),
        "reason": (
            "Let's discuss the reasoning behind your "
            "accepted solution."
        ),
        "related_code": None,
        "related_concept": None,
    }

# ==========================================================
# Run Assessment Code
# ==========================================================

@app.post(
    "/api/coding/assessment/{assessment_id}/question/run"
)
def run_coding_assessment_code(
    assessment_id: str,
    payload: Dict[str, Any],
):
    """
    Run the current code against visible/sample tests only.

    Important:
    - Does not submit the question.
    - Does not execute hidden tests.
    - Stores the latest execution in the same
      CodingSessionState used by Submit.
    """

    db = SessionLocal()

    try:
        user_id = _get_user_id()

        state = _get_or_start_assessment_coding_state(
            db=db,
            assessment_id=assessment_id,
            user_id=user_id,
        )

        code = payload.get(
            "code",
            "",
        )

        if not isinstance(code, str):
            code = str(code)

        result = run_assessment_code(
            db=db,
            state=state,
            current_code=code,
        )

        db.commit()

        return {
            "success": True,
            **result,
        }

    except ValueError as exc:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Could not run coding solution: "
                f"{exc}"
            ),
        ) from exc

    finally:
        db.close()


# ==========================================================
# Submit Assessment Code
# ==========================================================

@app.post(
    "/api/coding/assessment/{assessment_id}/question/submit"
)
def submit_coding_assessment_solution(
    assessment_id: str,
    payload: Dict[str, Any],
):
    """
    Final submission.

    The same CodingSessionState used by Run is retrieved.

    Submission:
        visible Run
              ↓
        successful Run required
              ↓
        same code required
              ↓
        hidden + visible tests
              ↓
        existing judgement engine
              ↓
        interviewer / pattern memory
    """

    db = SessionLocal()

    try:
        user_id = _get_user_id()

        state = get_assessment_coding_state(
            assessment_id=assessment_id,
            user_id=user_id,
        )

        code = payload.get(
            "code",
            "",
        )

        if not isinstance(code, str):
            code = str(code)

        result = submit_assessment_solution(
            db=db,
            state=state,
            current_code=code,
            llm=fast_llm,
        )

        db.commit()

        judgement = result.get(
            "judgement"
        )

        if hasattr(
            judgement,
            "model_dump",
        ):
            judgement = judgement.model_dump()

        elif hasattr(
            judgement,
            "dict",
        ):
            judgement = judgement.dict()

        interviewer = _ensure_submission_follow_up(
            state=state,
            judgement=judgement,
            interviewer=result.get("interviewer"),
        )

        return {
            "success": True,
            "execution": result.get(
                "execution"
            ),
            "judgement": judgement,
            "interviewer": interviewer,
            "pattern_memory": result.get(
                "pattern_memory"
            ),
            "question_result": build_question_result(
                result
            ),
            "submitted": True,
        }

    except ValueError as exc:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Could not submit coding solution: "
                f"{exc}"
            ),
        ) from exc

    finally:
        db.close()


# ==========================================================
# Live Coding Interviewer
# ==========================================================

@app.post("/api/coding/assessment/{assessment_id}/question/live")
def live_coding_assessment_update(assessment_id: str, payload: Dict[str, Any]):
    db = SessionLocal()
    try:
        user_id = _get_user_id()
        state = _get_or_start_assessment_coding_state(
            db=db,
            assessment_id=assessment_id,
            user_id=user_id,
        )
        code = payload.get("code", "")
        if not isinstance(code, str): code = str(code)
        if not code.strip() or state.submitted:
            return {"success": True, "triggered": False, "interviewer": None}
        result = process_live_code_update(db=db, state=state, current_code=code, llm=fast_llm)
        db.commit()
        event = result.get("interviewer") or {}
        event_obj = event.get("event") if isinstance(event, dict) else None
        if event_obj is None or not getattr(event_obj, "should_intervene", False):
            return {"success": True, "triggered": False, "interviewer": None}
        question = getattr(event_obj, "question", None)
        if not question:
            return {"success": True, "triggered": False, "interviewer": None}
        return {"success": True, "triggered": True, "interviewer": {"question": question, "reason": getattr(event_obj,"reason",None), "related_code": getattr(event_obj,"related_code",None), "related_concept": getattr(event_obj,"related_concept",None)}}
    except ValueError as exc:
        db.rollback(); raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        db.rollback(); raise HTTPException(status_code=500, detail=f"Could not process live interviewer update: {exc}") from exc
    finally:
        db.close()


# ==========================================================
# Voice Interview Answer
# ==========================================================

@app.post("/api/coding/assessment/{assessment_id}/question/interview-answer")
def coding_interview_answer(assessment_id: str, payload: Dict[str, Any]):
    db = SessionLocal()

    try:
        user_id = _get_user_id()

        assessment = get_user_assessment(
            assessment_id=assessment_id,
            user_id=user_id,
        )

        state = _get_or_start_assessment_coding_state(
            db=db,
            assessment_id=assessment_id,
            user_id=user_id,
        )

        answer = str(
            payload.get("answer", "")
        ).strip()

        question = str(
            payload.get("question", "")
        ).strip()

        if not answer:
            raise HTTPException(
                status_code=400,
                detail="Interview answer is empty.",
            )

        key = (
            f"{assessment_id}:"
            f"{assessment['current_question_index']}"
        )

        turns = CODING_VOICE_SESSIONS.setdefault(
            key,
            {"turns": []},
        )["turns"]

        turns.append(
            {
                "role": "candidate",
                "content": answer,
            }
        )

        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
You are a technical coding interviewer.

Continue a concise interview about the candidate's
submitted coding solution.

Focus on:
- approach
- time complexity
- space complexity
- edge cases
- tradeoffs
- data structures

Ask exactly one natural technical follow-up question.

Never reveal hidden tests, hidden inputs, hidden
expected outputs, or hidden actual outputs.
""",
                ),
                (
                    "human",
                    """
Problem:
{problem}

Original interviewer question:
{question}

Candidate answer:
{answer}

Recent conversation:
{history}

Ask exactly one next technical follow-up question.
""",
                ),
            ]
        )

        msg = (
            prompt
            | fast_llm
        ).invoke(
            {
                "problem": (
                    state.problem_title
                    or "Coding problem"
                ),
                "question": question,
                "answer": answer,
                "history": str(
                    turns[-6:]
                ),
            }
        )

        next_question = getattr(
            msg,
            "content",
            str(msg),
        ).strip()

        if not next_question:
            next_question = (
                "Can you explain why you chose "
                "this approach and its complexity?"
            )

        turns.append(
            {
                "role": "interviewer",
                "content": next_question,
            }
        )

        db.commit()

        return {
            "success": True,
            "question": next_question,
            "conversation_key": key,
        }

    except HTTPException:
        db.rollback()
        raise

    except ValueError as exc:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Could not continue interviewer "
                f"conversation: {exc}"
            ),
        ) from exc

    finally:
        db.close()


# ==========================================================
# Change Question Count
# ==========================================================

@app.patch(
    "/api/coding/assessment/{assessment_id}/questions",
)
def change_assessment_question_count(
    assessment_id: str,
    request: QuestionCountUpdateRequest,
):
    """
    Change question count before the assessment begins.

    Duration is recalculated automatically.
    """

    try:
        user_id = _get_user_id()

        assessment = update_assessment_question_count(
            assessment_id=assessment_id,
            user_id=user_id,
            question_count=request.question_count,
        )

        return {
            "success": True,
            "assessment_id": assessment[
                "assessment_id"
            ],
            "question_count": assessment[
                "question_count"
            ],
            "duration_minutes": assessment[
                "duration_minutes"
            ],
            "questions": assessment[
                "questions"
            ],
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not update question count: "
                f"{exc}"
            ),
        ) from exc


# ==========================================================
# Complete Assessment Question
# ==========================================================

@app.post(
    "/api/coding/assessment/{assessment_id}/question/complete",
)
def finish_coding_assessment_question(
    assessment_id: str,
    result: Dict[str, Any],
):
    """
    Mark the current question complete and move
    to the next question.
    """

    try:
        user_id = _get_user_id()

        next_state = complete_current_question(
            assessment_id=assessment_id,
            user_id=user_id,
            result=result,
        )

        return {
            "success": True,
            **next_state,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not complete assessment question: "
                f"{exc}"
            ),
        ) from exc


# ==========================================================
# Complete Assessment
# ==========================================================

@app.post(
    "/api/coding/assessment/{assessment_id}/complete",
)
def finish_coding_assessment(
    assessment_id: str,
):
    """
    Mark the complete assessment as finished.
    """

    try:
        user_id = _get_user_id()

        assessment = complete_assessment(
            assessment_id=assessment_id,
            user_id=user_id,
        )

        return {
            "success": True,
            "assessment_id": assessment[
                "assessment_id"
            ],
            "completed": True,
            "results": assessment.get(
                "results",
                [],
            ),
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not complete assessment: "
                f"{exc}"
            ),
        ) from exc


# ==========================================================
# Delete Assessment
# ==========================================================

@app.delete(
    "/api/coding/assessment/{assessment_id}",
)
def remove_coding_assessment(
    assessment_id: str,
):
    """
    Remove an active coding assessment and its
    live CodingSessionState.
    """

    try:
        user_id = _get_user_id()

        deleted = delete_assessment(
            assessment_id=assessment_id,
            user_id=user_id,
        )

        if not deleted:
            raise HTTPException(
                status_code=404,
                detail="Coding assessment not found.",
            )

        return {
            "success": True,
            "message": "Coding assessment removed.",
        }

    except HTTPException:
        raise

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not delete assessment: "
                f"{type(exc).__name__}: {exc}"
            ),
        ) from exc