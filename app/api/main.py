"""
FastAPI bridge for the Placement AI frontend.

Resume interviews already have company and role selected by the candidate,
so the general conversational Router Agent is bypassed.
"""

import os
import tempfile
import uuid
from typing import Any, Dict

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.graph.graph import graph
from app.graph.memory import retrieve_relevant_memories
from app.config import fast_llm
from langchain_core.prompts import ChatPromptTemplate
from app.resume.profile_generator import get_candidate_profile
from app.resume.resume_service import get_resume_text


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


# ==========================================================
# Serialization Helpers
# ==========================================================

def _serialize_question(question):
    if question is None:
        return None

    if hasattr(question, "model_dump"):
        return question.model_dump()

    if hasattr(question, "dict"):
        return question.dict()

    if isinstance(question, dict):
        return question

    return {
        "question": str(
            getattr(
                question,
                "question",
                question,
            )
        ),
        "category": getattr(
            question,
            "category",
            None,
        ),
        "difficulty": getattr(
            question,
            "difficulty",
            None,
        ),
        "follow_up": bool(
            getattr(
                question,
                "follow_up",
                False,
            )
        ),
    }


def _serialize_feedback(feedback):
    if feedback is None:
        return None

    if hasattr(feedback, "model_dump"):
        return feedback.model_dump()

    if hasattr(feedback, "dict"):
        return feedback.dict()

    if isinstance(feedback, dict):
        return feedback

    return {
        "overall_score": getattr(
            feedback,
            "overall_score",
            None,
        ),
        "strengths": getattr(
            feedback,
            "strengths",
            [],
        ),
        "weaknesses": getattr(
            feedback,
            "weaknesses",
            [],
        ),
        "recommendations": getattr(
            feedback,
            "recommendations",
            [],
        ),
        "summary": getattr(
            feedback,
            "summary",
            "",
        ),
    }


def _get_user_id() -> int:
    """
    Development user ID.

    Set PLACEMENT_USER_ID to an existing users.id before using
    permanent interview/memory persistence.
    """

    raw_user_id = os.getenv(
        "PLACEMENT_USER_ID",
        "1",
    )

    try:
        user_id = int(raw_user_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=500,
            detail="PLACEMENT_USER_ID must be an integer.",
        ) from exc

    if user_id <= 0:
        raise HTTPException(
            status_code=500,
            detail="PLACEMENT_USER_ID must be greater than 0.",
        )

    return user_id


# ==========================================================
# Resume State
# ==========================================================

def _build_resume_state(
    *,
    user_id: int,
    interview_id: str,
    company: str,
    role: str,
    resume_text: str,
    candidate_profile: str,
) -> Dict[str, Any]:
    """
    Build the complete PlacementState required by LangGraph.

    setup_completed=True is critical for Resume Interview:
    the general conversational Router Agent is bypassed because
    company and role are already explicitly selected by the user.
    """

    return {
        "user_id": user_id,

        # Kept for PlacementState compatibility.
        # Resume Interview does not route through the general router.
        "user_query": (
            f"Conduct a {role} interview for {company} "
            "using the candidate's resume."
        ),

        "mode": "interview",

        "company": company,
        "role": role,

        "resume_text": resume_text,
        "candidate_profile": candidate_profile,

        "candidate_memories": [],

        "interview_id": interview_id,
        "current_question": None,
        "current_answer": "",
        "conversation": [],

        "question_count": 0,
        "max_questions": 5,

        "interview_completed": False,
        "setup_completed": True,

        "company_info": None,
        "feedback": None,
    }


# ==========================================================
# Health
# ==========================================================

@app.get("/")
def root():
    return {
        "message": "Placement AI API is running"
    }


# ==========================================================
# AI Career Assistant
# ==========================================================

career_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are an AI Career Assistant for a placement preparation platform.

Give personalized and practical career guidance based on the
candidate's saved progress and memories.

Candidate Memories:
{memories}

Previous Conversation:
{conversation}

Rules:
- Use the candidate's actual memories when relevant.
- Use the previous conversation to maintain context and answer follow-up questions naturally.
- Do not invent candidate information.
- If the memories do not contain enough information, say so naturally.
- Give concise, actionable advice.
- The user may continue this conversation for as long as they want.
- Do not restart the conversation or repeat the full previous answer unless useful.
"""
        ),
        (
            "human",
            "{message}",
        ),
    ]
)


career_chain = career_prompt | fast_llm


@app.post("/api/career/chat")
def career_chat(
    message: str = Form(...),
    chat_history: str = Form("[]"),
):
    message = message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty.",
        )

    try:
        user_id = _get_user_id()

        memory_state = retrieve_relevant_memories(
            {
                "user_id": user_id,
            }
        )

        memories = memory_state.get(
            "candidate_memories",
            [],
        )

        try:
            import json

            parsed_history = json.loads(chat_history)
            if not isinstance(parsed_history, list):
                parsed_history = []
        except (json.JSONDecodeError, TypeError):
            parsed_history = []

        # Keep the prompt bounded while allowing an unlimited frontend chat.
        recent_history = parsed_history[-12:]

        conversation_lines = []

        for item in recent_history:
            if not isinstance(item, dict):
                continue

            role = item.get("role", "")
            content = str(item.get("content", "")).strip()

            if not content:
                continue

            if role == "user":
                conversation_lines.append(
                    f"User: {content}"
                )
            elif role == "assistant":
                conversation_lines.append(
                    f"Assistant: {content}"
                )

        conversation = (
            "\n".join(conversation_lines)
            if conversation_lines
            else "No previous conversation."
        )

        response = career_chain.invoke(
            {
                "memories": memories,
                "conversation": conversation,
                "message": message,
            }
        )

        return {
            "success": True,
            "response": response.content,
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Career Assistant failed: {exc}",
        ) from exc


# ==========================================================
# Resume Interview — Start
# ==========================================================

@app.post("/api/resume/start")
async def start_resume_interview(
    role: str = Form(...),
    company: str = Form(...),
    resume: UploadFile = File(...),
):
    role = role.strip()
    company = company.strip()

    if not role:
        raise HTTPException(
            status_code=400,
            detail="Role is required.",
        )

    if not company:
        raise HTTPException(
            status_code=400,
            detail="Company is required.",
        )

    if not resume.filename:
        raise HTTPException(
            status_code=400,
            detail="Resume file is required.",
        )

    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF resumes are supported.",
        )

    temp_path = None

    try:
        file_bytes = await resume.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded resume is empty.",
            )

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf",
        ) as temp_file:
            temp_file.write(file_bytes)
            temp_path = temp_file.name

        resume_text = get_resume_text(
            temp_path
        )

        if not resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the resume.",
            )

        candidate_profile = get_candidate_profile(
            resume_text
        )

        interview_id = str(
            uuid.uuid4()
        )

        state = _build_resume_state(
            user_id=_get_user_id(),
            interview_id=interview_id,
            company=company,
            role=role,
            resume_text=resume_text,
            candidate_profile=candidate_profile,
        )

        result = graph.invoke(
            state
        )

        INTERVIEW_SESSIONS[
            interview_id
        ] = result

        return {
            "success": True,
            "interview_id": interview_id,
            "company": result.get(
                "company",
                company,
            ),
            "role": result.get(
                "role",
                role,
            ),
            "question": _serialize_question(
                result.get(
                    "current_question"
                )
            ),
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Resume interview could not be started: "
                f"{exc}"
            ),
        ) from exc

    finally:
        if temp_path:
            try:
                os.remove(
                    temp_path
                )
            except OSError:
                pass


# ==========================================================
# Resume Interview — Submit Answer
# ==========================================================

@app.post("/api/resume/answer")
async def submit_resume_answer(
    interview_id: str = Form(...),
    answer: str = Form(...),
):
    interview_id = interview_id.strip()
    answer = answer.strip()

    if not interview_id:
        raise HTTPException(
            status_code=400,
            detail="Interview ID is required.",
        )

    if not answer:
        raise HTTPException(
            status_code=400,
            detail="Answer cannot be empty.",
        )

    state = INTERVIEW_SESSIONS.get(
        interview_id
    )

    if state is None:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found or expired.",
        )

    if state.get(
        "interview_completed",
        False,
    ):
        raise HTTPException(
            status_code=400,
            detail="This interview has already been completed.",
        )

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
