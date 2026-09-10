"""Adaptive live Technical + System Design interview engine."""

from __future__ import annotations

import json
import time
import uuid
from typing import Any, Dict, List, Optional

from langchain_core.prompts import ChatPromptTemplate

from app.config import fast_llm
from app.database.crud import create_memory, get_user_memories
from app.database.database import SessionLocal


class InterviewModeEngine:
    """
    Runtime engine for Technical and System Design interviews.

    System Design is intentionally conversational:
    - no fixed question count
    - questions follow the discussion
    - AI can challenge a candidate during the design
    - candidate clarification does not advance the interview
    - scoring is hidden until final evaluation
    """

    sessions: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def start(
        cls,
        *,
        user_id: int,
        mode: str,
        role: str,
        company: str = "",
        topics: Optional[List[str]] = None,
        problem: str = "",
        max_questions: int = 6,
    ) -> Dict[str, Any]:
        mode = (
            mode or "technical"
        ).strip().lower()

        if mode not in {
            "technical",
            "system_design",
        }:
            raise ValueError(
                "Unsupported interview mode."
            )

        if mode == "technical":
            topic_list = [
                str(x).strip()
                for x in (topics or [])
                if str(x).strip()
            ]

            if not topic_list:
                topic_list = cls._infer_topics(
                    role
                )
        else:
            topic_list = []

        session_id = str(
            uuid.uuid4()
        )

        session: Dict[str, Any] = {
            "id": session_id,
            "user_id": int(user_id),
            "mode": mode,
            "role": (
                role or "Software Engineer"
            ).strip()
            or "Software Engineer",
            "company": (
                company or ""
            ).strip(),
            "topics": topic_list,
            "problem": (
                problem or ""
            ).strip()
            or cls._default_system_problem(),

            # Retained for technical interviews.
            # System design does NOT use a fixed question count.
            "max_questions": max(
                1,
                min(
                    int(
                        max_questions or 6
                    ),
                    20,
                ),
            ),

            "question_number": 1,
            "conversation": [],
            "scores": [],
            "completed": False,
            "current_question": "",
            "pending_interruption": "",
            "interruptions": 0,
            "last_interruption_at": 0.0,
            "design_state": {},
            "covered_areas": [],
            "started_at": time.time(),
        }

        cls.sessions[
            session_id
        ] = session

        # Generate the first question only after
        # the interview has actually started.
        question = cls._generate_question(
            session,
            opening=True,
        )

        session[
            "current_question"
        ] = question

        return cls.public(
            session
        )

    @classmethod
    def public(
        cls,
        session: Dict[str, Any],
    ) -> Dict[str, Any]:
        return {
            "session_id": session["id"],
            "mode": session["mode"],
            "role": session["role"],
            "company": session["company"],
            "topics": session["topics"],
            "problem": session["problem"],
            "question_number": session[
                "question_number"
            ],
            "current_question": session.get(
                "current_question",
                "",
            ),
            "pending_interruption": bool(
                session.get(
                    "pending_interruption"
                )
            ),
            "interruptions": session.get(
                "interruptions",
                0,
            ),
            "completed": session[
                "completed"
            ],
            "conversation": session[
                "conversation"
            ],
        }

    # =========================================================
    # MAIN ANSWER HANDLER
    # =========================================================

    @classmethod
    def answer(
        cls,
        session_id: str,
        answer: str,
        action: str = "answer",
        design_state: Optional[
            Dict[str, Any]
        ] = None,
    ) -> Dict[str, Any]:

        session = cls.sessions.get(
            session_id
        )

        if not session:
            raise ValueError(
                "Interview session not found."
            )

        if session["completed"]:
            raise ValueError(
                "Interview is already completed."
            )

        if design_state is not None:
            session[
                "design_state"
            ] = design_state

        action = (
            action or "answer"
        ).strip().lower()

        answer = (
            answer or ""
        ).strip()

        # -----------------------------------------------------
        # Candidate asks a doubt.
        # -----------------------------------------------------

        if action == "clarification":
            if not answer:
                raise ValueError(
                    "Clarification cannot be empty."
                )

            response = cls._clarify(
                session,
                answer,
            )

            return {
                **cls.public(session),
                "interviewer_response": response,
                "clarification": True,
                "completed": False,
            }

        # -----------------------------------------------------
        # Candidate explicitly finishes.
        # -----------------------------------------------------

        if action == "finish":
            complete_design = (
                answer
                or cls._serialize_design(
                    session.get(
                        "design_state"
                    )
                    or {}
                )
            )

            if not complete_design.strip():
                raise ValueError(
                    "Please add some design before finishing the interview."
                )

            session[
                "completed"
            ] = True

            session[
                "current_question"
            ] = ""

            session[
                "pending_interruption"
            ] = ""

            feedback = (
                cls._final_feedback(
                    session,
                    complete_design,
                )
            )

            return {
                **cls.public(session),
                "completed": True,
                "final_feedback": feedback,
            }

        if not answer:
            raise ValueError(
                "Answer cannot be empty."
            )

        # -----------------------------------------------------
        # Interruption answer.
        # -----------------------------------------------------

        pending = session.get(
            "pending_interruption",
            "",
        )

        if pending:
            result = (
                cls._evaluate_interruption_answer(
                    session,
                    pending,
                    answer,
                )
            )

            session[
                "pending_interruption"
            ] = ""

            turn_type = "interruption"
            question = pending

        # -----------------------------------------------------
        # Normal conversational answer.
        # -----------------------------------------------------

        else:
            question = session.get(
                "current_question",
                "",
            )

            result = (
                cls._continue_conversation(
                    session,
                    question,
                    answer,
                )
            )

            turn_type = "normal"

        # Save useful evidence silently.
        cls._save_memory(
            session,
            answer,
            result,
        )

        session[
            "conversation"
        ].append(
            {
                "type": turn_type,
                "question": question,
                "answer": answer,
                # Score is retained internally but
                # never exposed during the live interview.
                "score": result.get(
                    "score",
                    0,
                ),
                "evaluation": result.get(
                    "evaluation",
                    "",
                ),
                "design_state": design_state,
            }
        )

        # -----------------------------------------------------
        # Normal answer
        # -----------------------------------------------------

        if turn_type == "normal":
            session[
                "scores"
            ].append(
                float(
                    result.get(
                        "score",
                        0,
                    )
                    or 0
                )
            )

            session[
                "question_number"
            ] += 1

            next_question = (
                result.get(
                    "next_question"
                )
                or ""
            ).strip()

            if not next_question:
                next_question = (
                    cls._generate_question(
                        session
                    )
                )

            session[
                "current_question"
            ] = next_question

            # Technical interviews can retain their
            # configured cap. System design cannot.
            if (
                session["mode"]
                == "technical"
                and session[
                    "question_number"
                ]
                > session[
                    "max_questions"
                ]
            ):
                session[
                    "question_number"
                ] = session[
                    "max_questions"
                ]

            interviewer_response = (
                result.get(
                    "interviewer_response"
                )
                or ""
            ).strip()

            return {
                **cls.public(session),
                "completed": False,
                "interviewer_response": interviewer_response,
                "next_question": next_question,
                "next_focus": result.get(
                    "next_focus",
                    "",
                ),

                # Deliberately do not return:
                # score
                # evaluation
                # strengths
                # weaknesses
            }

        # -----------------------------------------------------
        # Interruption answer
        # -----------------------------------------------------

        interviewer_response = (
            result.get(
                "interviewer_response"
            )
            or "Good. Continue with your design."
        ).strip()

        return {
            **cls.public(session),
            "completed": False,
            "interviewer_response": interviewer_response,
            "next_question": session.get(
                "current_question",
                "",
            ),
            "interruption_answered": True,
        }

    # =========================================================
    # LIVE OBSERVATION
    # =========================================================

    @classmethod
    def live_observation(
        cls,
        session_id: str,
        design_state: Optional[
            Dict[str, Any]
        ] = None,
    ) -> Dict[str, Any]:

        session = cls.sessions.get(
            session_id
        )

        if not session:
            raise ValueError(
                "Interview session not found."
            )

        if (
            session["completed"]
            or session["mode"]
            != "system_design"
        ):
            return {
                "should_interrupt": False,
                "question": "",
            }

        pending = session.get(
            "pending_interruption",
            "",
        )

        if pending:
            return {
                "should_interrupt": True,
                "question": pending,
                "interruption_number": session.get(
                    "interruptions",
                    0,
                ),
            }

        design_state = (
            design_state or {}
        )

        session[
            "design_state"
        ] = design_state

        design_text = (
            cls._serialize_design(
                design_state
            )
        )

        # Don't interrupt when the candidate
        # has barely started.
        if len(
            design_text
        ) < 100:
            return {
                "should_interrupt": False,
                "question": "",
            }

        now = time.time()

        # Give the candidate time to continue
        # before another interruption.
        if (
            now
            - float(
                session.get(
                    "last_interruption_at",
                    0.0,
                )
            )
            < 25
        ):
            return {
                "should_interrupt": False,
                "question": "",
            }

        # Six interruptions is only a safety ceiling,
        # NOT a question-count limit.
        if (
            int(
                session.get(
                    "interruptions",
                    0,
                )
            )
            >= 6
        ):
            return {
                "should_interrupt": False,
                "question": "",
            }

        prompt = (
            ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        """
You are silently observing a LIVE system-design interview.

The candidate is actively building a system and discussing
their decisions with another interviewer.

Your job is NOT to evaluate the candidate and NOT to provide
feedback.

Decide whether there is ONE meaningful reason to interrupt
the candidate right now.

Interrupt only when the candidate has made a concrete:
- architecture choice
- database choice
- caching choice
- scaling assumption
- reliability decision
- API decision
- consistency decision
- security decision
- technology choice
- important trade-off

Do NOT interrupt merely because a design section is empty.

Do NOT interrupt too frequently.

If the candidate is simply continuing a reasonable discussion,
return false.

Return JSON only:

{
  "should_interrupt": true or false,
  "question": "..."
}

When false, question must be an empty string.

When true, ask ONE concise challenge question.

Do not answer the question.
""",
                    ),
                    (
                        "human",
                        """
Problem:
{problem}

Role:
{role}

Current interviewer question:
{current_question}

Candidate design:
{design}

Recent conversation:
{conversation}

Return JSON only.
""",
                    ),
                ]
            )
        )

        raw = cls._invoke_text(
            prompt,
            {
                "problem": session[
                    "problem"
                ],
                "role": session[
                    "role"
                ],
                "current_question": session.get(
                    "current_question",
                    "",
                ),
                "design": design_text,
                "conversation": json.dumps(
                    session[
                        "conversation"
                    ][-8:],
                    ensure_ascii=False,
                ),
            },
        )

        data = cls._parse_json(
            raw
        )

        should_interrupt = bool(
            data.get(
                "should_interrupt",
                False,
            )
        )

        question = str(
            data.get(
                "question",
                "",
            )
            or ""
        ).strip()

        if (
            should_interrupt
            and question
        ):
            session[
                "pending_interruption"
            ] = question

            session[
                "interruptions"
            ] = int(
                session.get(
                    "interruptions",
                    0,
                )
            ) + 1

            session[
                "last_interruption_at"
            ] = now

            return {
                "should_interrupt": True,
                "question": question,
                "interruption_number": session[
                    "interruptions"
                ],
            }

        return {
            "should_interrupt": False,
            "question": "",
        }

    # =========================================================
    # NORMAL CONVERSATION
    # =========================================================

    @classmethod
    def _continue_conversation(
        cls,
        session: Dict[str, Any],
        question: str,
        answer: str,
    ) -> Dict[str, Any]:

        if session[
            "mode"
        ] == "system_design":

            system_prompt = """
You are a senior system-design interviewer conducting
a REAL LIVE INTERVIEW.

You are having a conversation with the candidate.

Do NOT give feedback such as:
- "good answer"
- "you covered..."
- "your answer is strong"
- scores
- strengths
- weaknesses

Do NOT turn the interview into a questionnaire.

Instead:
1. Understand what the candidate just said.
2. Continue the natural technical discussion.
3. Ask the next question based on their actual answer.
4. Probe deeper when something deserves discussion.
5. Move to another design area only when the current
   discussion is sufficiently explored.
6. Challenge assumptions naturally.
7. Keep the interview conversational.
8. Do not force every design section to be completed.
9. Do not use a fixed number of questions.
10. Never announce an evaluation during the interview.

The candidate is allowed to leave some areas unexplored.

Return JSON only:

{
  "interviewer_response": "...",
  "next_question": "...",
  "next_focus": "...",
  "memory": "..."
}

interviewer_response should sound like the spoken
interviewer's natural transition.

next_question should be the next thing the interviewer
wants to discuss.

Do not include scores or evaluation in the spoken response.
"""

            prompt = (
                ChatPromptTemplate.from_messages(
                    [
                        (
                            "system",
                            system_prompt,
                        ),
                        (
                            "human",
                            """
Problem:
{problem}

Role:
{role}

Current question:
{question}

Candidate answer:
{answer}

Current design:
{design}

Previous conversation:
{conversation}

Candidate memory:
{memories}

Continue the live interview.

Return JSON only.
""",
                        ),
                    ]
                )
            )

            return cls._parse_json(
                cls._invoke_text(
                    prompt,
                    {
                        "problem": session[
                            "problem"
                        ],
                        "role": session[
                            "role"
                        ],
                        "question": question,
                        "answer": answer,
                        "design": cls._serialize_design(
                            session.get(
                                "design_state"
                            )
                            or {}
                        ),
                        "conversation": json.dumps(
                            session[
                                "conversation"
                            ][-10:],
                            ensure_ascii=False,
                        ),
                        "memories": cls._memory_context(
                            session[
                                "user_id"
                            ]
                        ),
                    },
                )
            )

        # -----------------------------------------------------
        # Technical interview
        # -----------------------------------------------------

        prompt = (
            ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        """
You are a senior technical interviewer.

Conduct a realistic conversational interview.

Stay inside the allowed technical topics.

Ask adaptive questions based on the candidate's answer.
Avoid repeating concepts already discussed.

Do not give detailed feedback after every answer.

Return JSON only:
{
  "interviewer_response": "...",
  "next_question": "...",
  "next_focus": "...",
  "score": 0-10,
  "evaluation": "...",
  "memory": "..."
}

The score and evaluation are internal and must NOT
be included in interviewer_response.
""",
                    ),
                    (
                        "human",
                        """
Role:
{role}

Company:
{company}

Allowed topics:
{topics}

Current question:
{question}

Candidate answer:
{answer}

Conversation:
{conversation}

Memory:
{memories}

Return JSON only.
""",
                    ),
                ]
            )
        )

        return cls._parse_json(
            cls._invoke_text(
                prompt,
                {
                    "role": session[
                        "role"
                    ],
                    "company": session[
                        "company"
                    ]
                    or "General",
                    "topics": ", ".join(
                        session[
                            "topics"
                        ]
                    ),
                    "question": question,
                    "answer": answer,
                    "conversation": json.dumps(
                        session[
                            "conversation"
                        ][-10:],
                        ensure_ascii=False,
                    ),
                    "memories": cls._memory_context(
                        session[
                            "user_id"
                        ]
                    ),
                },
            )
        )

    # =========================================================
    # INTERRUPTION EVALUATION
    # =========================================================

    @classmethod
    def _evaluate_interruption_answer(
        cls,
        session: Dict[str, Any],
        question: str,
        answer: str,
    ) -> Dict[str, Any]:

        prompt = (
            ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        """
You are continuing a LIVE system-design interview.

The candidate has just answered an interviewer
challenge question.

Do NOT give formal feedback.

Respond naturally as an interviewer would.

You may:
- acknowledge the answer briefly
- challenge it further
- clarify an implication
- connect it back to the design
- move the conversation forward

Return JSON only:

{
  "interviewer_response": "...",
  "memory": "...",
  "next_focus": "..."
}

Do not provide a score.
Do not provide strengths or weaknesses.
""",
                    ),
                    (
                        "human",
                        """
Problem:
{problem}

Role:
{role}

Interruption question:
{question}

Candidate answer:
{answer}

Current design:
{design}

Recent conversation:
{conversation}

Return JSON only.
""",
                    ),
                ]
            )
        )

        data = cls._parse_json(
            cls._invoke_text(
                prompt,
                {
                    "problem": session[
                        "problem"
                    ],
                    "role": session[
                        "role"
                    ],
                    "question": question,
                    "answer": answer,
                    "design": cls._serialize_design(
                        session.get(
                            "design_state"
                        )
                        or {}
                    ),
                    "conversation": json.dumps(
                        session[
                            "conversation"
                        ][-8:],
                        ensure_ascii=False,
                    ),
                },
            )
        )

        return {
            "interviewer_response": str(
                data.get(
                    "interviewer_response"
                )
                or "Good. Continue with your design."
            ).strip(),
            "score": 0.0,
            "evaluation": "",
            "next_question": "",
            "next_focus": str(
                data.get(
                    "next_focus"
                )
                or ""
            ).strip(),
            "memory": str(
                data.get(
                    "memory"
                )
                or ""
            ).strip(),
        }

    # =========================================================
    # QUESTION GENERATION
    # =========================================================

    @classmethod
    def _generate_question(
        cls,
        session: Dict[str, Any],
        opening: bool = False,
    ) -> str:

        memories = cls._memory_context(
            session["user_id"]
        )

        if (
            session["mode"]
            == "system_design"
        ):
            system = """
You are a senior system-design interviewer.

You are conducting a REAL LIVE interview.

Ask ONE concise question.

The question must naturally follow the candidate's
current discussion and design.

Do not follow a rigid questionnaire.

Move between requirements, constraints, architecture,
APIs, data, scaling, reliability, security and trade-offs
according to what the candidate actually discusses.

Do not provide the answer.

Do not give feedback or a score.
"""

            if opening:
                system += """
This is the opening question.

Start the live interview naturally by asking the
candidate to begin discussing the requirements
or clarify the initial scope.
"""

            prompt = (
                ChatPromptTemplate.from_messages(
                    [
                        (
                            "system",
                            system,
                        ),
                        (
                            "human",
                            """
Problem:
{problem}

Role:
{role}

Current design:
{design}

Previous conversation:
{conversation}

Candidate memory:
{memories}

Generate the next interview question only.
""",
                        ),
                    ]
                )
            )

            return cls._invoke_text(
                prompt,
                {
                    "problem": session[
                        "problem"
                    ],
                    "role": session[
                        "role"
                    ],
                    "design": cls._serialize_design(
                        session.get(
                            "design_state"
                        )
                        or {}
                    ),
                    "conversation": json.dumps(
                        session[
                            "conversation"
                        ][-8:],
                        ensure_ascii=False,
                    ),
                    "memories": memories,
                },
            )

        # -----------------------------------------------------
        # Technical
        # -----------------------------------------------------

        prompt = (
            ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        """
You are a senior technical interviewer.

Ask ONE concise adaptive question.

Stay strictly within the allowed topics.

Avoid concepts already covered.

Follow the candidate's previous discussion.

Do not provide the answer.
""",
                    ),
                    (
                        "human",
                        """
Role:
{role}

Company:
{company}

Allowed topics:
{topics}

Conversation:
{conversation}

Candidate memory:
{memories}

Generate the next interview question only.
""",
                    ),
                ]
            )
        )

        return cls._invoke_text(
            prompt,
            {
                "role": session[
                    "role"
                ],
                "company": session[
                    "company"
                ]
                or "General",
                "topics": ", ".join(
                    session[
                        "topics"
                    ]
                ),
                "conversation": json.dumps(
                    session[
                        "conversation"
                    ][-8:],
                    ensure_ascii=False,
                ),
                "memories": memories,
            },
        )

    # =========================================================
    # CLARIFICATION
    # =========================================================

    @classmethod
    def _clarify(
        cls,
        session: Dict[str, Any],
        asked: str,
    ) -> str:

        prompt = (
            ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        """
You are the interviewer in a LIVE system-design interview.

Answer the candidate's clarification directly and briefly.

Clarify requirements, assumptions or constraints,
but do not design the solution for the candidate.

Do not evaluate the candidate.

Keep the conversation moving.
""",
                    ),
                    (
                        "human",
                        """
Problem:
{problem}

Current interview discussion:
{current}

Candidate asks:
{asked}

Role:
{role}

Return only the spoken response.
""",
                    ),
                ]
            )
        )

        return cls._invoke_text(
            prompt,
            {
                "problem": session[
                    "problem"
                ],
                "current": session.get(
                    "current_question",
                    "",
                ),
                "asked": asked,
                "role": session[
                    "role"
                ],
            },
        )

    # =========================================================
    # FINAL EVALUATION
    # =========================================================

    @classmethod
    def _final_feedback(
        cls,
        session: Dict[str, Any],
        complete_design: str,
    ) -> Dict[str, Any]:

        memories = cls._memory_context(
            session["user_id"]
        )

        prompt = (
            ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        """
You are the FINAL evaluator for a system-design interview.

The live interview is now finished.

Evaluate the complete design AND the complete interview
discussion.

Consider:
- requirements
- constraints and estimation
- architecture
- APIs
- data/database
- scalability
- reliability
- security
- observability
- trade-offs
- communication
- technical reasoning

Return JSON only:

{
  "overall_score": 0-10,
  "summary": "...",
  "strengths": [],
  "weaknesses": [],
  "evidence": []
}

Do not invent facts.
""",
                    ),
                    (
                        "human",
                        """
Problem:
{problem}

Role:
{role}

Complete design:
{design}

Complete interview conversation:
{conversation}

Candidate memory:
{memories}

Return JSON only.
""",
                    ),
                ]
            )
        )

        data = cls._parse_json(
            cls._invoke_text(
                prompt,
                {
                    "problem": session[
                        "problem"
                    ],
                    "role": session[
                        "role"
                    ],
                    "design": complete_design,
                    "conversation": json.dumps(
                        session[
                            "conversation"
                        ],
                        ensure_ascii=False,
                    ),
                    "memories": memories,
                },
            )
        )

        return {
            "overall_score": cls._safe_score(
                data.get(
                    "overall_score",
                    0,
                )
            ),
            "summary": str(
                data.get(
                    "summary"
                )
                or "The system-design interview is complete."
            ).strip(),
            "strengths": cls._string_list(
                data.get(
                    "strengths"
                )
            ),
            "weaknesses": cls._string_list(
                data.get(
                    "weaknesses"
                )
            ),
            "evidence": cls._string_list(
                data.get(
                    "evidence"
                )
            ),
            "discussion_turns": len(
                session[
                    "conversation"
                ]
            ),
            "interruptions": int(
                session.get(
                    "interruptions",
                    0,
                )
            ),
        }

    # =========================================================
    # DESIGN SERIALIZATION
    # =========================================================

    @staticmethod
    def _serialize_design(
        design: Dict[str, Any]
    ) -> str:

        return "\n".join(
            f"{key}: {str(value).strip()}"
            for key, value in design.items()
            if str(value or "").strip()
        )

    # =========================================================
    # TOPIC INFERENCE
    # =========================================================

    @staticmethod
    def _infer_topics(
        role: str
    ) -> List[str]:

        role_l = (
            role or ""
        ).lower()

        if any(
            x in role_l
            for x in (
                "backend",
                "api",
                "server",
            )
        ):
            return [
                "Python",
                "FastAPI",
                "SQL",
                "DBMS",
                "Operating Systems",
                "Computer Networks",
                "Concurrency",
            ]

        if any(
            x in role_l
            for x in (
                "frontend",
                "react",
                "web",
            )
        ):
            return [
                "JavaScript",
                "React",
                "Web Performance",
                "APIs",
                "Browser Fundamentals",
                "HTTP",
                "CSS",
            ]

        if any(
            x in role_l
            for x in (
                "ml",
                "machine learning",
                "ai",
            )
        ):
            return [
                "Python",
                "Machine Learning",
                "Deep Learning",
                "Model Evaluation",
                "Deployment",
                "Data",
            ]

        return [
            "DSA",
            "OOP",
            "DBMS",
            "Operating Systems",
            "Computer Networks",
            "SQL",
        ]

    # =========================================================
    # DEFAULT SYSTEM DESIGN PROBLEM
    # =========================================================

    @staticmethod
    def _default_system_problem() -> str:
        return (
            "Design a scalable URL shortening service "
            "used by millions of users."
        )

    # =========================================================
    # CANDIDATE MEMORY
    # =========================================================

    @classmethod
    def _memory_context(
        cls,
        user_id: int,
    ) -> str:

        db = SessionLocal()

        try:
            memories = get_user_memories(
                db,
                user_id,
            )

            if not memories:
                return (
                    "No previous candidate memory is available."
                )

            return "\n".join(
                f"- [{m.category}] "
                f"{m.memory} "
                f"(confidence={m.confidence:.2f})"
                for m in memories[-20:]
            )

        except Exception:
            return (
                "Candidate memory is unavailable for this turn."
            )

        finally:
            db.close()

    @classmethod
    def _save_memory(
        cls,
        session: Dict[str, Any],
        answer: str,
        result: Dict[str, Any],
    ) -> None:

        memory = str(
            result.get(
                "memory"
            )
            or ""
        ).strip()

        if not memory:
            return

        db = SessionLocal()

        try:
            # Database column is VARCHAR(100).
            # Keep memory safely within that limit.
            memory_value = memory[:100]

            category = (
                "technical_interview"
                if session["mode"]
                == "technical"
                else "system_design"
            )

            subcategory = str(
                result.get(
                    "next_focus"
                )
                or "interview"
            )[:100]

            create_memory(
                db=db,
                user_id=session[
                    "user_id"
                ],
                memory=memory_value,
                category=category,
                subcategory=subcategory,
                importance=6,
                confidence=0.75,
                evidence=(
                    f"Interview answer: "
                    f"{answer[:800]}"
                ),
            )

        except Exception:
            # Memory persistence must NEVER
            # break a live interview.
            try:
                db.rollback()
            except Exception:
                pass

        finally:
            db.close()

    # =========================================================
    # HELPERS
    # =========================================================

    @staticmethod
    def _safe_score(
        value: Any
    ) -> float:

        try:
            return max(
                0.0,
                min(
                    10.0,
                    float(
                        value or 0
                    ),
                ),
            )
        except Exception:
            return 0.0

    @staticmethod
    def _string_list(
        value: Any
    ) -> List[str]:

        if not isinstance(
            value,
            list,
        ):
            return []

        return [
            str(x).strip()
            for x in value
            if str(x).strip()
        ]

    @staticmethod
    def _parse_json(
        raw: str
    ) -> Dict[str, Any]:

        text = (
            raw or ""
        ).strip()

        if text.startswith(
            "```"
        ):
            text = text.strip(
                "`"
            )

            if text.startswith(
                "json"
            ):
                text = text[
                    4:
                ].strip()

        try:
            parsed = json.loads(
                text
            )

            return (
                parsed
                if isinstance(
                    parsed,
                    dict,
                )
                else {}
            )

        except Exception:
            start = text.find(
                "{"
            )

            end = text.rfind(
                "}"
            )

            if (
                start >= 0
                and end > start
            ):
                try:
                    parsed = json.loads(
                        text[
                            start : end + 1
                        ]
                    )

                    return (
                        parsed
                        if isinstance(
                            parsed,
                            dict,
                        )
                        else {}
                    )

                except Exception:
                    pass

        return {}

    @staticmethod
    def _invoke_text(
        prompt: ChatPromptTemplate,
        values: Dict[str, Any],
    ) -> str:

        result = (
            prompt | fast_llm
        ).invoke(values)

        content = getattr(
            result,
            "content",
            result,
        )

        if isinstance(
            content,
            list,
        ):
            content = "".join(
                (
                    part.get(
                        "text",
                        "",
                    )
                    if isinstance(
                        part,
                        dict,
                    )
                    else str(part)
                )
                for part in content
            )

        return str(
            content
        ).strip()