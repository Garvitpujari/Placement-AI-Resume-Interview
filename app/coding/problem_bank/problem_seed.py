"""
problem_seed.py

Seeds the global Placement AI coding-problem bank.

Flow:

Curated problem manifest
        ↓
Research existing sources
        ↓
Canonical extraction
        ↓
Knowledge enrichment
        ↓
Validation
        ↓
Database persistence

The problem is stored ONCE globally and can later be
served to many candidates.

This module does NOT:
- Invent coding problems.
- Generate candidate-specific problems.
- Execute candidate code.
- Judge candidate submissions.
"""


import argparse
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from app.coding.crud import (
    get_coding_problem,
    create_coding_problem,
    create_problem_knowledge,
    create_problem_approach,
    create_test_case,
)

from app.coding.problem_service import (
    research_problem,
)

from app.coding.problem_extractor import (
    extract_problem,
    extracted_problem_to_dict,
)

from app.coding.problem_bank.problem_enricher import (
    enrich_problem,
    knowledge_to_dict,
)

from app.coding.problem_bank.problem_validator import (
    validate_problem,
)

from app.coding.problem_bank.problem_manifest import (
    PROBLEM_MANIFEST,
)


# ==========================================================
# Configuration
# ==========================================================

DEFAULT_SEED_LIMIT = 100


# ==========================================================
# Research Text Builder
# ==========================================================

def build_research_text(
    research_results: List[Dict[str, Any]],
) -> str:

    if not research_results:
        return ""

    sections = []

    for index, result in enumerate(
        research_results,
        start=1,
    ):

        sections.append(
            f"""
================ SOURCE {index} ================

Title:
{result.get("title", "")}

URL:
{result.get("url", "")}

Content:
{result.get("content", "")}

Raw Content:
{result.get("raw_content", "")}
"""
        )

    return "\n".join(sections)


# ==========================================================
# Persist Complete Problem
# ==========================================================

def persist_complete_problem(
    db: Session,
    complete_problem: Dict[str, Any],
):
    """
    Persist the complete problem package.

    Database structure:

        CodingProblem
             |
             +--- CodingProblemKnowledge
             |
             +--- CodingProblemApproach
             |
             +--- CodingTestCase
    """

    print(
        "\nPersisting problem to database..."
    )

    # ======================================================
    # 1. Main Problem
    # ======================================================

    problem = create_coding_problem(
        db=db,

        title=complete_problem["title"],

        statement=complete_problem["statement"],

        category=complete_problem["category"],

        difficulty=complete_problem["difficulty"],

        constraints=complete_problem.get(
            "constraints",
            [],
        ),

        examples=complete_problem.get(
            "examples",
            [],
        ),

        optimal_approach=complete_problem.get(
            "optimal_approach",
        ),

        common_mistakes=complete_problem.get(
            "common_mistakes",
            [],
        ),

        hints=complete_problem.get(
            "hints",
            [],
        ),

        source=complete_problem.get(
            "source",
            "curated_research",
        ),

        source_url=complete_problem.get(
            "source_url",
        ),
    )

    print(
        f"  Problem saved: {problem.title}"
    )

    # ======================================================
    # 2. AI Knowledge
    # ======================================================

    knowledge = create_problem_knowledge(
        db=db,

        problem_id=problem.id,

        problem_identity=complete_problem.get(
            "problem_identity",
        ),

        core_intuition=complete_problem.get(
            "core_intuition",
        ),

        primary_pattern=complete_problem.get(
            "primary_pattern",
        ),

        secondary_patterns=complete_problem.get(
            "secondary_patterns",
            [],
        ),

        recognition_signals=complete_problem.get(
            "recognition_signals",
            [],
        ),

        when_to_use=complete_problem.get(
            "when_to_use",
            [],
        ),

        when_not_to_use=complete_problem.get(
            "when_not_to_use",
            [],
        ),

        key_concepts=complete_problem.get(
            "key_concepts",
            [],
        ),

        important_observations=complete_problem.get(
            "important_observations",
            [],
        ),

        edge_cases=complete_problem.get(
            "edge_cases",
            [],
        ),

        interviewer_focus=complete_problem.get(
            "interviewer_focus",
            [],
        ),

        follow_up_questions=complete_problem.get(
            "follow_up_questions",
            [],
        ),

        strong_candidate_signals=complete_problem.get(
            "strong_candidate_signals",
            [],
        ),

        weak_candidate_signals=complete_problem.get(
            "weak_candidate_signals",
            [],
        ),
    )

    print(
        f"  Knowledge saved: {knowledge.id}"
    )

    # ======================================================
    # 3. Approaches
    # ======================================================

    approaches = complete_problem.get(
        "approaches",
        [],
    )

    print(
        f"  Saving {len(approaches)} approaches..."
    )

    for approach in approaches:

        create_problem_approach(
            db=db,

            problem_id=problem.id,

            name=approach.get(
                "name",
                "",
            ),

            explanation=approach.get(
                "explanation",
                "",
            ),

            time_complexity=approach.get(
                "time_complexity",
            ),

            space_complexity=approach.get(
                "space_complexity",
            ),
        )

    # ======================================================
    # 4. Test Cases
    # ======================================================

    test_cases = complete_problem.get(
        "test_cases",
        [],
    )

    print(
        f"  Saving {len(test_cases)} test cases..."
    )

    for test_case in test_cases:

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
                "explanation",
            ),

            hidden=test_case.get(
                "hidden",
                False,
            ),
        )

    print(
        "\nComplete problem package persisted."
    )

    return problem


# ==========================================================
# Process One Problem
# ==========================================================

def seed_one_problem(
    db: Session,
    seed: Dict[str, str],
):
    title = seed["title"]

    category = seed.get(
        "category",
        "General",
    )

    difficulty = seed.get(
        "difficulty",
        "Medium",
    )

    print(
        "\n"
        + "=" * 60
    )

    print(
        f"SEEDING PROBLEM: {title}"
    )

    print(
        f"Category: {category}"
    )

    print(
        f"Difficulty: {difficulty}"
    )

    print(
        "=" * 60
    )

    # ======================================================
    # STEP 1 — Database Check
    # ======================================================

    existing = get_coding_problem(
        db=db,
        title=title,
    )

    if existing:

        print(
            "\nProblem already exists."
        )

        print(
            "Skipping duplicate."
        )

        return {
            "status": "exists",
            "title": title,
            "problem": existing,
        }

    # ======================================================
    # STEP 2 — Research Existing Problem
    # ======================================================

    print(
        "\n[1/5] Researching existing problem..."
    )

    research_results = research_problem(
        query=title,
        category=category,
    )

    if not research_results:

        print(
            "No research results found."
        )

        return {
            "status": "research_failed",
            "title": title,
            "problem": None,
        }

    print(
        f"Research results: "
        f"{len(research_results)}"
    )

    # ======================================================
    # STEP 3 — Extract Canonical Problem
    # ======================================================

    print(
        "\n[2/5] Extracting canonical problem..."
    )

    extracted = extract_problem(
        research_results
    )

    if not extracted:

        print(
            "Problem extraction failed."
        )

        return {
            "status": "extraction_failed",
            "title": title,
            "problem": None,
        }

    canonical = extracted_problem_to_dict(
        extracted
    )

    # Protect curated manifest metadata.

    canonical["title"] = title
    canonical["category"] = category
    canonical["difficulty"] = difficulty

    # ======================================================
    # STEP 4 — Enrich Knowledge
    # ======================================================

    print(
        "\n[3/5] Building AI problem knowledge..."
    )

    research_text = build_research_text(
        research_results
    )

    enriched = enrich_problem(
        problem=canonical,
        research_text=research_text,
    )

    if not enriched:

        print(
            "Problem enrichment failed."
        )

        return {
            "status": "enrichment_failed",
            "title": title,
            "problem": None,
        }

    knowledge = knowledge_to_dict(
        enriched
    )

    # ======================================================
    # STEP 5 — Merge + Validate
    # ======================================================

    print(
        "\n[4/5] Validating complete problem..."
    )

    complete_problem = {

        # Canonical problem

        "title": canonical["title"],

        "statement": canonical["statement"],

        "category": canonical["category"],

        "difficulty": canonical["difficulty"],

        "constraints": canonical.get(
            "constraints",
            [],
        ),

        "examples": canonical.get(
            "examples",
            [],
        ),

        "test_cases": canonical.get(
            "test_cases",
            [],
        ),

        "optimal_approach": canonical.get(
            "optimal_approach",
        ),

        "common_mistakes": canonical.get(
            "common_mistakes",
            [],
        ),

        "hints": canonical.get(
            "hints",
            [],
        ),

        # Enriched knowledge

        **knowledge,

        # Source metadata

        "source": "curated_research",

        "source_url": (
            research_results[0].get("url")
            if research_results
            else None
        ),
    }

    validation = validate_problem(
        complete_problem
    )

    if not validation["valid"]:

        print(
            "\nPROBLEM REJECTED"
        )

        print(
            "Validation errors:"
        )

        for error in validation["errors"]:

            print(
                f"  - {error}"
            )

        return {
            "status": "validation_failed",
            "title": title,
            "problem": None,
            "errors": validation["errors"],
        }

    print(
        "Validation passed."
    )

    # ======================================================
    # STEP 6 — Database Persistence
    # ======================================================

    print(
        "\n[5/5] Persisting complete problem..."
    )

    try:

        problem = persist_complete_problem(
            db=db,
            complete_problem=complete_problem,
        )

    except Exception as e:

        db.rollback()

        print(
            "\nDATABASE PERSISTENCE FAILED"
        )

        print(
            str(e)
        )

        return {
            "status": "persistence_failed",
            "title": title,
            "problem": None,
            "error": str(e),
        }

    # ======================================================
    # COMPLETE
    # ======================================================

    print(
        "\n"
        + "=" * 60
    )

    print(
        "PROBLEM READY"
    )

    print(
        f"ID: {problem.id}"
    )

    print(
        f"Title: {problem.title}"
    )

    print(
        "=" * 60
    )

    return {
        "status": "saved",
        "title": title,
        "problem": problem,
    }


# ==========================================================
# Seed Problem Bank
# ==========================================================

def seed_problem_bank(
    db: Session,
    limit: int = DEFAULT_SEED_LIMIT,
):
    """
    Seed problems from the global manifest.

    Already-existing problems are skipped.

    Example:

        limit=3

    processes only the first three manifest entries.

    limit=100

    processes the complete manifest.
    """

    if not PROBLEM_MANIFEST:

        print(
            "Problem manifest is empty."
        )

        return []

    total_manifest = len(
        PROBLEM_MANIFEST
    )

    limit = max(
        1,
        min(
            limit,
            total_manifest,
        ),
    )

    problems = PROBLEM_MANIFEST[:limit]

    results = []

    print(
        "\n"
        + "=" * 60
    )

    print(
        "PLACEMENT AI — PROBLEM BANK SEEDER"
    )

    print(
        f"Manifest problems: {total_manifest}"
    )

    print(
        f"Problems requested: {len(problems)}"
    )

    print(
        "=" * 60
    )

    for index, seed in enumerate(
        problems,
        start=1,
    ):

        print(
            f"\nPROBLEM "
            f"{index}/{len(problems)}"
        )

        try:

            result = seed_one_problem(
                db=db,
                seed=seed,
            )

        except Exception as e:

            db.rollback()

            title = seed.get(
                "title",
                "Unknown",
            )

            print(
                "\nUNEXPECTED PROBLEM FAILURE"
            )

            print(
                f"{title}: {e}"
            )

            result = {
                "status": "unexpected_failure",
                "title": title,
                "problem": None,
                "error": str(e),
            }

        results.append(
            result
        )

    # ======================================================
    # Summary
    # ======================================================

    saved = 0
    exists = 0
    failed = 0

    for result in results:

        status = result["status"]

        if status == "saved":
            saved += 1

        elif status == "exists":
            exists += 1

        else:
            failed += 1

    print(
        "\n"
        + "=" * 60
    )

    print(
        "SEEDING SUMMARY"
    )

    print(
        "=" * 60
    )

    print(
        f"Saved:             {saved}"
    )

    print(
        f"Already existed:   {exists}"
    )

    print(
        f"Failed:            {failed}"
    )

    print(
        f"Processed:         {len(results)}"
    )

    print(
        f"Manifest total:    {total_manifest}"
    )

    print(
        "=" * 60
    )

    return results


# ==========================================================
# CLI
# ==========================================================

def parse_arguments():

    parser = argparse.ArgumentParser(
        description=(
            "Seed the Placement AI "
            "global coding problem bank."
        )
    )

    parser.add_argument(
        "--limit",
        type=int,
        default=DEFAULT_SEED_LIMIT,
        help=(
            "Number of problems from the "
            "manifest to process. "
            "Default: 100."
        ),
    )

    return parser.parse_args()


# ==========================================================
# Main
# ==========================================================

if __name__ == "__main__":

    from app.database.database import (
        SessionLocal,
    )

    args = parse_arguments()

    db = SessionLocal()

    try:

        seed_problem_bank(
            db=db,
            limit=args.limit,
        )

    finally:

        db.close()