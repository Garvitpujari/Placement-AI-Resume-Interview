"""
memory.py

Retrieves candidate memories relevant to the current interview.
"""

from langchain_core.prompts import ChatPromptTemplate

from app.config import fast_llm

from app.graph.schemas import (
    CandidateMemoryItem,
    CandidateMemoryResponse,
)

from app.graph.state import PlacementState

from app.database.database import SessionLocal

from app.database.crud import (
    get_user_memories,
    create_memory,
)


# ==========================================================
# Memory Analysis Prompt
# ==========================================================

memory_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are a long-term candidate memory analyst
for a placement preparation system.

Analyze the completed interview and identify
important information about the candidate that
should be remembered for future interviews.

Focus on:

- Strengths
- Weaknesses
- Improving skills
- Persistent difficulties
- Demonstrated mastery
- Important behavioral or communication patterns

Create separate memory items for different skills
or observations.

Do not create a memory for every individual answer.

Only create memories that are useful for future
placement preparation.

Do not ignore strong topics. Strong topics may have
lower frequency in future interviews, but should remain
part of the candidate's profile.

Return a CandidateMemoryResponse containing the memory items.
"""
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

Previous Candidate Memories:
{candidate_memories}

Current Interview Conversation:
{conversation}

Final Interview Feedback:
{feedback}
"""
        ),
    ]
)


# ==========================================================
# Structured Output
# ==========================================================

memory_llm = fast_llm.with_structured_output(
    CandidateMemoryResponse
)

memory_chain = memory_prompt | memory_llm


# ==========================================================
# Memory Retrieval
# ==========================================================

def retrieve_relevant_memories(
    state: PlacementState,
) -> dict:
    """
    Retrieve candidate memories relevant to the
    current interview.

    The database currently expects an integer user_id.
    Demo/test states may use a string identifier such as
    "demo_user". In that situation, return an empty memory
    list instead of sending an invalid value to PostgreSQL.
    """

    user_id = state.get(
        "user_id",
        None,
    )

    # ======================================================
    # Validate Database User ID
    # ======================================================

    if not isinstance(
        user_id,
        int,
    ):
        print(
            "Memory retrieval skipped: "
            "user_id is not a database integer."
        )

        return {
            "candidate_memories": []
        }

    # ======================================================
    # Retrieve Persistent Memories
    # ======================================================

    db = SessionLocal()

    try:

        memories = get_user_memories(
            db=db,
            user_id=user_id,
        )

        candidate_memories = [
            CandidateMemoryItem(
                memory=memory.memory,
                category=memory.category,
                subcategory=memory.subcategory,
                importance=memory.importance,
                confidence=memory.confidence,
                evidence=memory.evidence,
            )
            for memory in memories
        ]

        return {
            "candidate_memories": candidate_memories
        }

    finally:
        db.close()


# ==========================================================
# Memory Analysis
# ==========================================================

def analyze_and_save_memories(
    state: PlacementState,
) -> PlacementState:
    """
    Analyze the completed interview and save
    long-term candidate memories.

    Persistent memory is only written when the state
    contains a valid integer database user_id.
    """

    # ======================================================
    # Completion Check
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

    # ======================================================
    # User ID Validation
    # ======================================================

    user_id = state.get(
        "user_id",
        None,
    )

    if not isinstance(
        user_id,
        int,
    ):
        print(
            "Memory analysis skipped: "
            "user_id is not a database integer."
        )

        return state

    try:

        # ==================================================
        # Build Safe Context
        # ==================================================

        memories = memory_chain.invoke(
            {
                "company": state.get(
                    "company",
                    "",
                ),
                "role": state.get(
                    "role",
                    "",
                ),
                "candidate_profile": state.get(
                    "candidate_profile",
                    state.get(
                        "resume_text",
                        "",
                    ),
                ),
                "candidate_memories": state.get(
                    "candidate_memories",
                    [],
                ),
                "conversation": conversation,
                "feedback": state.get(
                    "feedback",
                    None,
                ),
            }
        )

        memories = memories.memories

        # ==================================================
        # Persist Memories
        # ==================================================

        db = SessionLocal()

        try:

            for memory in memories:

                create_memory(
                    db=db,
                    user_id=user_id,
                    memory=memory.memory,
                    category=memory.category,
                    subcategory=memory.subcategory,
                    importance=memory.importance,
                    confidence=memory.confidence,
                    evidence=memory.evidence,
                )

        finally:

            db.close()

        return state

    except Exception as e:

        raise RuntimeError(
            f"Memory Analysis failed: {e}"
        ) from e