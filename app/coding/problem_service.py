"""
problem_service.py

Problem discovery and persistence service for the coding module.

Responsibilities:
- Check whether a coding problem already exists.
- Research missing problems from the web.
- Provide research results to the extraction/enrichment pipeline.
- Persist a complete problem package atomically.

This module does NOT:
- Invent coding problems.
- Select problems for candidates.
- Execute candidate code.
- Judge candidate code.
"""

import json
import os
import time
import urllib.error
import urllib.request

from sqlalchemy.orm import Session

from app.coding.crud import (
    get_coding_problem,
    create_coding_problem,
    create_problem_knowledge,
    create_problem_approach,
    create_test_case,
)


# ==========================================================
# Configuration
# ==========================================================

TAVILY_API_KEY = os.getenv(
    "TAVILY_API_KEY"
)

TAVILY_SEARCH_URL = (
    "https://api.tavily.com/search"
)

# Time to wait after a rate-limit response.
RATE_LIMIT_COOLDOWN_SECONDS = 10

# Maximum number of research queries per problem.
MAX_RESEARCH_QUERIES = 5


# ==========================================================
# Web Search
# ==========================================================

def search_web(
    query: str,
    max_results: int = 5,
):
    """
    Search the web using Tavily.

    Returns:
        dict  -> successful response
        {}    -> normal failure
        None  -> rate-limit response

    None is intentionally used for rate limiting so the
    caller can distinguish it from an ordinary failed query.
    """

    if not TAVILY_API_KEY:

        print(
            "TAVILY_API_KEY not configured. "
            "Skipping web research."
        )

        return {}

    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "search_depth": "advanced",
        "max_results": max_results,
        "include_answer": True,
        "include_raw_content": True,
    }

    data = json.dumps(
        payload
    ).encode("utf-8")

    request = urllib.request.Request(
        TAVILY_SEARCH_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:

        with urllib.request.urlopen(
            request,
            timeout=30,
        ) as response:

            response_data = response.read()

        return json.loads(
            response_data.decode(
                "utf-8"
            )
        )

    except urllib.error.HTTPError as e:

        # --------------------------------------------------
        # Rate limit / throttling
        # --------------------------------------------------

        if e.code == 432:

            print(
                "\n"
                + "!" * 60
            )

            print(
                "TAVILY RATE LIMIT / HTTP 432"
            )

            print(
                "Research will stop immediately "
                "for this problem."
            )

            print(
                "!" * 60
            )

            return None

        print(
            f"Web research failed: HTTP Error "
            f"{e.code}: {e.reason}"
        )

        return {}

    except Exception as e:

        print(
            f"Web research failed: {e}"
        )

        return {}


# ==========================================================
# Research Queries
# ==========================================================

def build_research_queries(
    query: str,
    category: str = "General",
):
    """
    Build multiple research queries so the extraction
    pipeline can learn the problem from different angles.
    """

    return [
        f'"{query}" coding problem',

        f'"{query}" brute force better optimal solution',

        f'"{query}" time complexity space complexity',

        f'"{query}" LeetCode Codeforces solution',

        f'"{query}" interview approach common mistakes',
    ]


# ==========================================================
# Research Problem
# ==========================================================

def research_problem(
    query: str,
    category: str = "General",
):
    """
    Research a coding problem from multiple web queries.

    Important rate-limit behavior:

    If Tavily returns HTTP 432:
        - stop immediately
        - do not execute remaining queries
        - return the results already collected

    This prevents unnecessary requests after the service
    has started rejecting requests.
    """

    queries = build_research_queries(
        query=query,
        category=category,
    )

    # Safety guard.
    queries = queries[
        :MAX_RESEARCH_QUERIES
    ]

    all_results = []

    seen_urls = set()

    for search_index, search_query in enumerate(
        queries,
        start=1,
    ):

        print(
            f"Researching: {search_query}"
        )

        result = search_web(
            query=search_query
        )

        # --------------------------------------------------
        # Rate limited
        # --------------------------------------------------

        if result is None:

            print(
                "\nResearch stopped because "
                "the web research service returned "
                "HTTP 432."
            )

            print(
                f"Queries completed before rate limit: "
                f"{search_index - 1}/{len(queries)}"
            )

            # Do not make another request.
            break

        # --------------------------------------------------
        # Normal failed query
        # --------------------------------------------------

        if not result:

            continue

        # --------------------------------------------------
        # Tavily answer
        # --------------------------------------------------

        if isinstance(result, dict):

            answer = result.get(
                "answer"
            )

            if answer:

                all_results.append(
                    {
                        "type": "answer",
                        "content": answer,
                        "source": "tavily",
                    }
                )

            # --------------------------------------------------
            # Tavily results
            # --------------------------------------------------

            results = result.get(
                "results",
                [],
            )

            for item in results:

                url = item.get(
                    "url"
                )

                if url and url in seen_urls:

                    continue

                if url:

                    seen_urls.add(url)

                all_results.append(
                    {
                        "type": "result",
                        "title": item.get(
                            "title"
                        ),
                        "url": url,
                        "content": item.get(
                            "content"
                        ),
                        "raw_content": item.get(
                            "raw_content"
                        ),
                    }
                )

    # ------------------------------------------------------
    # Cooldown after a rate-limit event
    # ------------------------------------------------------

    # We intentionally do not sleep here.
    #
    # The seeder may process many problems, and sleeping
    # inside every failed problem would make the batch slow.
    #
    # The next research attempt can be handled by the
    # caller/process-level rate-limit policy.

    return all_results


# ==========================================================
# Compatibility Wrapper
# ==========================================================

def search_coding_problems(
    query: str,
    category: str = "General",
):
    """
    Compatibility wrapper used by the problem pipeline.
    """

    return research_problem(
        query=query,
        category=category,
    )


# ==========================================================
# Find Best Source
# ==========================================================

def find_best_source(
    research_results,
):
    """
    Return the first useful source containing a URL.
    """

    if not research_results:

        return None

    for result in research_results:

        if result.get("url"):

            return result

    return research_results[0]


# ==========================================================
# Save Researched Problem
# ==========================================================

def save_researched_problem(
    db: Session,
    title: str,
    category: str,
    difficulty: str,
    statement: str,
    constraints=None,
    examples=None,
    optimal_approach=None,
    common_mistakes=None,
    hints=None,
    approaches=None,
    test_cases=None,
    source=None,
    source_url=None,

    # ------------------------------------------------------
    # AI knowledge
    # ------------------------------------------------------

    problem_identity=None,
    core_intuition=None,
    primary_pattern=None,
    secondary_patterns=None,
    recognition_signals=None,
    when_to_use=None,
    when_not_to_use=None,
    key_concepts=None,
    important_observations=None,
    edge_cases=None,
    interviewer_focus=None,
    follow_up_questions=None,
    strong_candidate_signals=None,
    weak_candidate_signals=None,
):
    """
    Persist a complete coding problem package atomically.

    Transaction:

        create problem
             ↓
        create knowledge
             ↓
        create approaches
             ↓
        create test cases
             ↓
        ONE COMMIT

    If anything fails:

        ROLLBACK

    Therefore a partial problem package cannot remain
    persisted.
    """

    # ======================================================
    # Duplicate Check
    # ======================================================

    existing = get_coding_problem(
        db=db,
        title=title,
    )

    if existing:

        print(
            "Problem already exists in database."
        )

        return existing

    try:

        # ==================================================
        # 1. Create Canonical Problem
        # ==================================================

        problem = create_coding_problem(
            db=db,

            title=title,

            statement=statement,

            category=category,

            difficulty=difficulty,

            constraints=constraints or [],

            examples=examples or [],

            optimal_approach=optimal_approach,

            common_mistakes=(
                common_mistakes or []
            ),

            hints=hints or [],

            source=source,

            source_url=source_url,

            commit=False,
        )

        print(
            f"  Problem prepared: {problem.title}"
        )

        # ==================================================
        # 2. Create AI Knowledge
        # ==================================================

        create_problem_knowledge(
            db=db,

            problem_id=problem.id,

            problem_identity=(
                problem_identity or ""
            ),

            core_intuition=(
                core_intuition or ""
            ),

            primary_pattern=(
                primary_pattern or ""
            ),

            secondary_patterns=(
                secondary_patterns or []
            ),

            recognition_signals=(
                recognition_signals or []
            ),

            when_to_use=(
                when_to_use or []
            ),

            when_not_to_use=(
                when_not_to_use or []
            ),

            key_concepts=(
                key_concepts or []
            ),

            important_observations=(
                important_observations or []
            ),

            edge_cases=(
                edge_cases or []
            ),

            interviewer_focus=(
                interviewer_focus or []
            ),

            follow_up_questions=(
                follow_up_questions or []
            ),

            strong_candidate_signals=(
                strong_candidate_signals or []
            ),

            weak_candidate_signals=(
                weak_candidate_signals or []
            ),

            commit=False,
        )

        print(
            "  Knowledge prepared."
        )

        # ==================================================
        # 3. Create Approaches
        # ==================================================

        print(
            f"  Preparing "
            f"{len(approaches or [])} approaches..."
        )

        for approach in approaches or []:

            create_problem_approach(
                db=db,

                problem_id=problem.id,

                name=approach.get(
                    "name",
                    "Unknown",
                ),

                explanation=approach.get(
                    "explanation",
                    "",
                ),

                time_complexity=approach.get(
                    "time_complexity"
                ),

                space_complexity=approach.get(
                    "space_complexity"
                ),

                commit=False,
            )

        # ==================================================
        # 4. Create Test Cases
        # ==================================================

        print(
            f"  Preparing "
            f"{len(test_cases or [])} test cases..."
        )

        for test_case in test_cases or []:

            create_test_case(
                db=db,

                problem_id=problem.id,

                input_data=test_case.get(
                    "input",
                    "",
                ),

                expected_output=test_case.get(
                    "expected_output",
                    "",
                ),

                explanation=test_case.get(
                    "explanation"
                ),

                hidden=test_case.get(
                    "hidden",
                    False,
                ),

                commit=False,
            )

        # ==================================================
        # 5. ONE FINAL COMMIT
        # ==================================================

        print(
            "  Committing complete problem package..."
        )

        db.commit()

        db.refresh(problem)

        print(
            "Complete problem package persisted."
        )

        return problem

    except Exception as e:

        # ==================================================
        # ROLLBACK EVERYTHING
        # ==================================================

        print(
            "DATABASE PERSISTENCE FAILED"
        )

        print(
            f"Error: {e}"
        )

        db.rollback()

        print(
            "Transaction rolled back."
        )

        raise


# ==========================================================
# Database First → Web Research
# ==========================================================

def get_or_research_problem(
    db: Session,
    title: str,
    category: str = "General",
    difficulty: str = "Medium",
):
    """
    Look for a problem locally first.

    If it exists:
        return database problem.

    Otherwise:
        perform web research.
    """

    print(
        "\n========== CODING PROBLEM SEARCH =========="
    )

    # ======================================================
    # Database
    # ======================================================

    existing = get_coding_problem(
        db=db,
        title=title,
    )

    if existing:

        print(
            "Problem found in local database."
        )

        return {
            "status": "database",
            "problem": existing,
            "research": [],
        }

    # ======================================================
    # Web Research
    # ======================================================

    print(
        "Problem not found in local database."
    )

    print(
        "Starting web research..."
    )

    research_results = research_problem(
        query=title,
        category=category,
    )

    # ======================================================
    # Research Found
    # ======================================================

    if research_results:

        print(
            f"Found {len(research_results)} "
            "research results."
        )

        return {
            "status": "web_research",
            "problem": None,
            "research": research_results,
        }

    # ======================================================
    # Nothing Found
    # ======================================================

    print(
        "No useful web research found."
    )

    return {
        "status": "not_found",
        "problem": None,
        "research": [],
    }