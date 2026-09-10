"""
reset_problem_bank.py

Safely resets the coding problem bank and coding sessions
used during development.

This removes:
- coding_feedback
- coding_observations
- code_executions
- code_snapshots
- coding_sessions
- coding_test_cases
- coding_problem_patterns
- coding_problem_approaches
- coding_problem_knowledge
- coding_problems

It preserves:
- users
- resumes
- interview_sessions
- conversations
- feedback
- companies
- candidate_memories

Use this before a clean problem-bank regeneration.
"""

from sqlalchemy import text

from app.database.database import engine


TABLES_TO_CLEAR = [
    # Children of coding_sessions
    "coding_feedback",
    "coding_observations",
    "code_executions",
    "code_snapshots",

    # Children of coding_problems
    "coding_sessions",
    "coding_test_cases",
    "coding_problem_patterns",
    "coding_problem_approaches",
    "coding_problem_knowledge",

    # Parent
    "coding_problems",
]


def reset_problem_bank():
    print()
    print("=" * 60)
    print("PLACEMENT AI — PROBLEM BANK RESET")
    print("=" * 60)

    with engine.begin() as db:

        print()
        print("Clearing development coding data...")

        for table in TABLES_TO_CLEAR:

            print(
                f"Deleting from {table}..."
            )

            db.execute(
                text(
                    f"DELETE FROM {table}"
                )
            )

    print()
    print("=" * 60)
    print("PROBLEM BANK RESET COMPLETE")
    print("=" * 60)

    print()
    print("Cleared:")
    for table in TABLES_TO_CLEAR:
        print(f"  - {table}")

    print()
    print("Preserved:")
    print("  - users")
    print("  - resumes")
    print("  - interview_sessions")
    print("  - conversations")
    print("  - feedback")
    print("  - companies")
    print("  - candidate_memories")

    print()


if __name__ == "__main__":
    reset_problem_bank()