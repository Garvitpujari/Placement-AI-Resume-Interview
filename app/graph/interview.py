"""
interview.py

Interview Agent

Responsibilities:
- Generate interview questions.
- Continue the interview using previous conversation.
- Evaluate candidate answers.
- Stop when max_questions have been answered.

Flow:

    Generate question
          ↓
    Candidate answers
          ↓
    Store answer in conversation
          ↓
    Evaluate answer
          ↓
    Generate next question
          ↓
    ...
          ↓
    Final answer evaluated
          ↓
    Interview completed
"""

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda

from app.config import (
    fast_llm,
    interview_llm,
)

from app.graph.schemas import (
    InterviewQuestion,
    AnswerEvaluation,
    ConversationTurn,
)

from app.graph.state import PlacementState


# ==========================================================
# Interview Prompt
# ==========================================================

interview_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are an experienced {role} interviewer.

Ask exactly one interview question.

Use:

- Company
- Role
- Candidate Profile
- Candidate Memory
- Company Research
- Previous Conversation

Rules:

- Never repeat a previously asked question.
- Do not ask a semantically similar question that tests the same
  underlying concept.
- Treat differently worded questions about the same concept as
  repetitions.
- Before generating a question, review the previous questions and
  identify what concepts have already been assessed.
- Cover different concepts across the interview.
- Do not repeatedly ask optimization, accuracy, performance, or
  improvement questions about the same technology unless a
  follow-up is specifically required.
- Prefer a new topic or skill area when the current concept has
  already been sufficiently assessed.
- Use follow-up questions only when the candidate's previous answer
  genuinely requires clarification or deeper probing.
- The follow_up field MUST be a boolean.
- Return true or false only for follow_up.
- NEVER return "True" or "False" as strings.
- Return ONLY an InterviewQuestion object.
- Do not completely ignore strong topics.
- Reduce the frequency of strong topics when mastery is demonstrated.
- Give more attention to weak or improving topics when appropriate.
""",
        ),
        (
            "human",
            """
Company:
{company}

Role:
{role}

Candidate Profile:
{candidate_profile}

Candidate Memory:
{candidate_memories}

Company Research:
{company_info}

Previous Conversation:
{conversation}

Previously Asked Questions:
{previous_questions}

Generate exactly one new question.

The new question must:

- test a new concept, OR
- be a genuine follow-up to the immediately previous answer.

Do not merely rephrase any previously asked question.

The `follow_up` field must be a boolean:
true or false, never a string.
""",
        ),
    ]
)


# ==========================================================
# Evaluation Prompt
# ==========================================================

evaluation_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are evaluating a candidate's answer in a
{role} interview.

Evaluate the answer based on:

- Technical correctness
- Completeness
- Communication
- Depth of understanding

Return ONLY an AnswerEvaluation object.

Set follow_up_required=true only when the candidate's
answer genuinely requires clarification or deeper probing.
""",
        ),
        (
            "human",
            """
Question:
{question}

Candidate Answer:
{answer}
""",
        ),
    ]
)


# ==========================================================
# Structured Output
# ==========================================================

structured_llm = interview_llm.with_structured_output(
    InterviewQuestion
)

evaluation_llm = fast_llm.with_structured_output(
    AnswerEvaluation
)


# ==========================================================
# Input Normalization
# ==========================================================

def prepare_interview_chain_input(values: dict) -> dict:
    """
    Normalize interview-chain inputs.

    Supports older callers that may provide `resume`
    or `resume_text` instead of `candidate_profile`.
    """

    values = dict(values)

    values.setdefault(
        "candidate_profile",
        values.get(
            "resume",
            values.get(
                "resume_text",
                "",
            ),
        ),
    )

    values.setdefault(
        "candidate_memories",
        [],
    )

    values.setdefault(
        "previous_questions",
        [],
    )

    values.setdefault(
        "company_info",
        None,
    )

    values.setdefault(
        "conversation",
        [],
    )

    return values


# ==========================================================
# Chains
# ==========================================================

interview_chain = (
    RunnableLambda(
        prepare_interview_chain_input
    )
    | interview_prompt
    | structured_llm
)

evaluation_chain = (
    evaluation_prompt
    | evaluation_llm
)


# ==========================================================
# Small Helpers
# ==========================================================

def _get_question_text(question) -> str:
    """Safely extract question text from a Pydantic object or dict."""

    if question is None:
        return ""

    if isinstance(question, dict):
        return str(
            question.get(
                "question",
                "",
            )
            or ""
        )

    return str(
        getattr(
            question,
            "question",
            "",
        )
        or ""
    )


def _get_question_field(
    question,
    field: str,
    default=None,
):
    """Safely extract a question field from object/dict."""

    if question is None:
        return default

    if isinstance(question, dict):
        return question.get(
            field,
            default,
        )

    return getattr(
        question,
        field,
        default,
    )


def _conversation_has_answer(
    conversation,
    question_text: str,
) -> bool:
    """
    Prevent accidental duplicate ConversationTurn creation.

    This protects the API if the same state is accidentally invoked
    more than once before the state is persisted.
    """

    for turn in conversation:
        if (
            getattr(turn, "question", None)
            == question_text
            and str(
                getattr(
                    turn,
                    "answer",
                    "",
                )
                or ""
            ).strip()
        ):
            return True

    return False


# ==========================================================
# Evaluate Previous Answer
# ==========================================================

def evaluate_previous_answer(
    conversation,
    current_answer: str,
    role: str,
):
    """
    Evaluate the most recent candidate answer.

    The answer is expected to already be stored inside the latest
    ConversationTurn.

    Evaluation is skipped when:
    - there is no conversation,
    - the answer is empty,
    - the latest turn already has an evaluation.
    """

    if not conversation:
        return

    latest_turn = conversation[-1]

    answer = (
        current_answer
        or getattr(
            latest_turn,
            "answer",
            "",
        )
        or ""
    )

    if not str(answer).strip():
        return

    existing_evaluation = getattr(
        latest_turn,
        "evaluation",
        None,
    )

    if existing_evaluation:
        return

    evaluation = evaluation_chain.invoke(
        {
            "role": role or "Software Engineering",
            "question": latest_turn.question,
            "answer": str(answer).strip(),
        }
    )

    latest_turn.score = evaluation.score

    latest_turn.evaluation = (
        evaluation.evaluation
    )

    # Keep ConversationTurn.follow_up synchronized with the
    # evaluation result.
    latest_turn.follow_up = (
        evaluation.follow_up_required
    )


# ==========================================================
# Interview Node
# ==========================================================

def interview(
    state: PlacementState,
) -> PlacementState:
    """
    Generate the next interview question.

    Lifecycle:

        Previous question
              ↓
        Candidate answer
              ↓
        Store ConversationTurn
              ↓
        Evaluate answer
              ↓
        Check question limit
              ↓
        Generate next question

    The interview is marked complete only after the candidate
    has answered the final generated question.
    """

    try:
        # ==================================================
        # Safe Runtime State
        # ==================================================

        conversation = state.get(
            "conversation",
            [],
        )

        # Work with a real list so we can append safely.
        if conversation is None:
            conversation = []

        current_answer = state.get(
            "current_answer",
            "",
        ) or ""

        candidate_profile = state.get(
            "candidate_profile",
            "",
        ) or ""

        candidate_memories = state.get(
            "candidate_memories",
            [],
        ) or []

        company_info = state.get(
            "company_info",
            None,
        )

        company = state.get(
            "company",
            "",
        ) or ""

        role = state.get(
            "role",
            "",
        ) or ""

        question_count = int(
            state.get(
                "question_count",
                0,
            )
            or 0
        )

        max_questions = int(
            state.get(
                "max_questions",
                5,
            )
            or 0
        )

        current_question = state.get(
            "current_question",
            None,
        )

        # ==================================================
        # Store Candidate Answer
        # ==================================================
        #
        # On the first submission:
        #
        #   current_question = Q1
        #   current_answer   = A1
        #   conversation     = []
        #
        # We must create Q1/A1 before evaluation.
        #

        if (
            current_question is not None
            and str(current_answer).strip()
        ):
            question_text = _get_question_text(
                current_question
            )

            if question_text:
                already_stored = _conversation_has_answer(
                    conversation,
                    question_text,
                )

                if not already_stored:
                    conversation.append(
                        ConversationTurn(
                            question=question_text,
                            answer=str(
                                current_answer
                            ).strip(),
                            topic=_get_question_field(
                                current_question,
                                "category",
                                None,
                            ),
                            difficulty=_get_question_field(
                                current_question,
                                "difficulty",
                                None,
                            ),
                            follow_up=bool(
                                _get_question_field(
                                    current_question,
                                    "follow_up",
                                    False,
                                )
                            ),
                        )
                    )

                # The answer has now been consumed.
                state["current_answer"] = ""

        # Keep state synchronized.
        state["conversation"] = conversation

        # ==================================================
        # Evaluate Latest Answer
        # ==================================================

        evaluate_previous_answer(
            conversation=conversation,
            current_answer="",
            role=role,
        )

        state["conversation"] = conversation

        # ==================================================
        # Check Whether Final Question Was Answered
        # ==================================================

        if (
            question_count >= max_questions
            and conversation
        ):
            state["interview_completed"] = True
            state["current_question"] = None
            state["current_answer"] = ""
            return state

        # ==================================================
        # Handle Zero / Invalid Question Limit
        # ==================================================

        if max_questions <= 0:
            state["interview_completed"] = True
            state["current_question"] = None
            state["current_answer"] = ""
            return state

        # ==================================================
        # Previous Questions
        # ==================================================

        previous_questions = [
            getattr(
                turn,
                "question",
                "",
            )
            for turn in conversation
        ]

        # ==================================================
        # Candidate Memory Logging
        # ==================================================

        print(
            "\n========== CANDIDATE MEMORY =========="
        )

        if candidate_memories:
            for memory in candidate_memories:
                print(
                    f"- [{getattr(memory, 'category', '')}] "
                    f"{getattr(memory, 'memory', '')} "
                    f"(importance={getattr(memory, 'importance', '')}, "
                    f"confidence={getattr(memory, 'confidence', '')})"
                )
        else:
            print(
                "No candidate memories found."
            )

        print(
            "========== END CANDIDATE MEMORY ==========\n"
        )

        # ==================================================
        # Generate Next Question
        # ==================================================

        question = interview_chain.invoke(
            {
                "company": company,
                "role": role,
                "candidate_profile": candidate_profile,
                "candidate_memories": candidate_memories,
                "company_info": company_info,
                "conversation": conversation,
                "previous_questions": previous_questions,
            }
        )

        state["current_question"] = question

        state["question_count"] = (
            question_count + 1
        )

        state["current_answer"] = ""

        # The newly generated question still needs to be answered.
        state["interview_completed"] = False

        return state

    except Exception as e:
        raise RuntimeError(
            f"Interview Agent failed: {e}"
        ) from e
