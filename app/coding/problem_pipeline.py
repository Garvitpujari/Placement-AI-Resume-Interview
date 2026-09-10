"""
problem_pipeline.py

Main orchestration layer for coding problems.

Flow:

User Request
    ↓
Problem Selector
    ↓
Check candidate history
    ↓
Suitable existing problem?
    ├── YES → return it
    │
    └── NO
          ↓
       Web Research
          ↓
       Problem Extraction
          ↓
       Save to Database
          ↓
       Return problem

This module does NOT:
- Execute candidate code.
- Analyze candidate code.
- Generate interviewer questions.
- Evaluate optimization.
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.coding.problem_selector import (
    select_problem,
)

from app.coding.problem_service import (
    search_coding_problems,
)

from app.coding.problem_extractor import (
    extract_and_save_problem,
)


# ==========================================================
# Existing Problem Selection
# ==========================================================

def select_existing_problem(
    db: Session,
    user_id: int,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
):
    """
    Select an existing problem while considering
    the candidate's previous coding history.
    """

    return select_problem(
        db=db,
        user_id=user_id,
        category=category,
        difficulty=difficulty,
    )


# ==========================================================
# Web Research
# ==========================================================

def research_new_problem(
    db: Session,
    query: str,
):
    """
    Search the web and convert the research into
    a structured coding problem.

    LLM usage happens only during extraction.
    """

    print(
        "\n========== NEW PROBLEM RESEARCH =========="
    )

    print(
        f"Research query: {query}"
    )

    research_results = search_coding_problems(
        query=query,
    )

    if not research_results:

        print(
            "No useful research found."
        )

        return None

    print(
        f"Research results found: "
        f"{len(research_results)}"
    )

    result = extract_and_save_problem(
        db=db,
        research_results=research_results,
        source="web_research",
    )

    if result["status"] != "saved":

        print(
            "Problem extraction failed."
        )

        return None

    print(
        "New problem extracted and saved."
    )

    return result["problem"]


# ==========================================================
# Main Pipeline
# ==========================================================

def get_problem_for_candidate(
    db: Session,
    user_id: int,
    query: str,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
):
    """
    Main entry point for obtaining a coding problem.

    Strategy:

    1. Check our database.
    2. Consider candidate history.
    3. Avoid previously attempted problems.
    4. If a suitable problem exists, use it.
    5. Otherwise perform web research.
    6. Extract and save the researched problem.
    7. Return the problem.
    """

    print(
        "\n======================================"
    )

    print(
        "CODING PROBLEM PIPELINE"
    )

    print(
        "======================================"
    )

    print(
        f"Candidate ID: {user_id}"
    )

    print(
        f"Request: {query}"
    )

    print(
        f"Category: {category}"
    )

    print(
        f"Difficulty: {difficulty}"
    )

    # ======================================================
    # STEP 1
    # Existing problem selection
    # ======================================================

    problem = select_existing_problem(
        db=db,
        user_id=user_id,
        category=category,
        difficulty=difficulty,
    )

    if problem:

        print(
            "\nUsing existing problem from database:"
        )

        print(
            f"Problem: {problem.title}"
        )

        print(
            "======================================"
        )

        return problem

    # ======================================================
    # STEP 2
    # No suitable existing problem
    # ======================================================

    print(
        "\nNo suitable unused problem found."
    )

    print(
        "Starting web research..."
    )

    # ======================================================
    # STEP 3
    # Web research
    # ======================================================

    problem = research_new_problem(
        db=db,
        query=query,
    )

    if problem:

        print(
            "\nNew problem ready:"
        )

        print(
            f"Problem: {problem.title}"
        )

        print(
            "======================================"
        )

        return problem

    # ======================================================
    # STEP 4
    # Nothing found
    # ======================================================

    print(
        "\nUnable to find a suitable coding problem."
    )

    print(
        "======================================"
    )

    return None