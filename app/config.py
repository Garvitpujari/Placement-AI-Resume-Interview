"""
config.py

Central configuration for the Placement AI backend.
"""

import os

from dotenv import load_dotenv
from langchain_groq import ChatGroq


# ==========================================================
# Load Environment Variables
# ==========================================================

load_dotenv()


# ==========================================================
# General Settings
# ==========================================================

TEMPERATURE = float(
    os.getenv("TEMPERATURE", "0.2")
)


# ==========================================================
# Groq Configuration
# ==========================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not configured."
    )


# ==========================================================
# Fast LLM
# Used for:
# - answer evaluation
# - feedback
# - company research
# - coding problem extraction
# - coding problem enrichment
# ==========================================================

FAST_MODEL = os.getenv(
    "FAST_MODEL",
    "openai/gpt-oss-120b",
)

fast_llm = ChatGroq(
    model=FAST_MODEL,
    temperature=TEMPERATURE,
    api_key=GROQ_API_KEY,
)


# ==========================================================
# Interview LLM
# ==========================================================

INTERVIEW_MODEL = os.getenv(
    "INTERVIEW_MODEL",
    "openai/gpt-oss-120b",
)

interview_llm = ChatGroq(
    model=INTERVIEW_MODEL,
    temperature=TEMPERATURE,
    api_key=GROQ_API_KEY,
)


# ==========================================================
# Coding Problem LLM
#
# Uses the same Groq API key intentionally.
# Keeping a separate client makes it easy to change the
# model later without affecting the rest of the application.
# ==========================================================

CODING_PROBLEM_MODEL = os.getenv(
    "CODING_PROBLEM_MODEL",
    FAST_MODEL,
)

coding_problem_llm = ChatGroq(
    model=CODING_PROBLEM_MODEL,
    temperature=TEMPERATURE,
    api_key=GROQ_API_KEY,
)


# ==========================================================
# Backward Compatibility
# ==========================================================

llm = interview_llm


# ==========================================================
# Other Configuration
# ==========================================================

DATABASE_URL = os.getenv(
    "DATABASE_URL"
)

TAVILY_API_KEY = os.getenv(
    "TAVILY_API_KEY"
)

LANGCHAIN_API_KEY = os.getenv(
    "LANGCHAIN_API_KEY"
)