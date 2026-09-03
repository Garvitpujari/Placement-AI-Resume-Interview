"""
profile_generator.py

Generates a compact interview profile from the resume.

If the resume is short, the original resume is used.
If the resume is long, it is summarized once using the fast LLM.
"""

from langchain_core.prompts import ChatPromptTemplate

from app.config import fast_llm


# ==========================================================
# Configuration
# ==========================================================

MAX_WORDS = 500


# ==========================================================
# Prompt
# ==========================================================

profile_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are an expert technical recruiter.

Convert the candidate's resume into a concise interview profile.

Keep ONLY information useful for conducting interviews.

Include:

- Education
- Experience
- Technical Skills
- Projects
- Certifications (if any)
- Achievements (if any)

Do NOT invent information.

Return plain text only.
""",
        ),
        (
            "human",
            """
Resume:

{resume}
""",
        ),
    ]
)

profile_chain = profile_prompt | fast_llm


# ==========================================================
# Helper
# ==========================================================

def get_candidate_profile(resume_text: str) -> str:
    """
    Returns either:
    - Original resume (if short)
    - Summarized interview profile (if long)
    """

    if not resume_text:
        return ""

    word_count = len(resume_text.split())

    if word_count <= MAX_WORDS:
        return resume_text

    profile = profile_chain.invoke(
        {
            "resume": resume_text
        }
    )

    return profile.content.strip()  # strip for clean remove space etc