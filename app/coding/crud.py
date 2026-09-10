"""
crud.py

Database operations for the Live Coding module.

CRUD functions normally commit their own changes for backward
compatibility.

For multi-step operations that must be atomic, pass:

    commit=False

The caller is then responsible for committing or rolling back
the complete transaction.
"""

import json

from sqlalchemy.orm import Session

from app.database.models import (
    CodingProblem,
    CodingProblemApproach,
    CodingTestCase,
    CodingSession,
    CodeSnapshot,
    CodeExecution,
    CodingObservation,
    InterviewerEvent,
    CodingHint,
    DryRun,
    CodingFeedback,
)


# ==========================================================
# Coding Problem
# ==========================================================

def get_coding_problem(
    db: Session,
    title: str,
):
    return (
        db.query(CodingProblem)
        .filter(CodingProblem.title.ilike(title))
        .first()
    )


def get_coding_problem_by_id(
    db: Session,
    problem_id: int,
):
    return (
        db.query(CodingProblem)
        .filter(
            CodingProblem.id == problem_id
        )
        .first()
    )


def create_coding_problem(
    db: Session,
    title: str,
    statement: str,
    category: str,
    difficulty: str,
    constraints=None,
    examples=None,
    optimal_approach=None,
    common_mistakes=None,
    hints=None,
    source=None,
    source_url=None,
    commit: bool = True,
):
    problem = CodingProblem(
        title=title,
        statement=statement,
        category=category,
        difficulty=difficulty,
        constraints=json.dumps(
            constraints or []
        ),
        examples=json.dumps(
            examples or []
        ),
        optimal_approach=optimal_approach,
        common_mistakes=json.dumps(
            common_mistakes or []
        ),
        hints=json.dumps(
            hints or []
        ),
        source=source,
        source_url=source_url,
    )

    db.add(problem)

    if commit:
        db.commit()
        db.refresh(problem)

    else:
        db.flush()

    return problem


# ==========================================================
# Problem Knowledge
# ==========================================================

def get_problem_knowledge(
    db: Session,
    problem_id: int,
):
    from app.database.models import (
        CodingProblemKnowledge,
    )

    return (
        db.query(CodingProblemKnowledge)
        .filter(
            CodingProblemKnowledge.problem_id
            == problem_id
        )
        .first()
    )




def create_problem_knowledge(
    db: Session,
    problem_id: int,
    problem_identity: str,
    core_intuition: str,
    primary_pattern: str,
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
    commit: bool = True,
):
    from app.database.models import (
        CodingProblemKnowledge,
    )

    knowledge = CodingProblemKnowledge(
        problem_id=problem_id,
        problem_identity=problem_identity,
        core_intuition=core_intuition,
        primary_pattern=primary_pattern,
        secondary_patterns=json.dumps(
            secondary_patterns or []
        ),
        recognition_signals=json.dumps(
            recognition_signals or []
        ),
        when_to_use=json.dumps(
            when_to_use or []
        ),
        when_not_to_use=json.dumps(
            when_not_to_use or []
        ),
        key_concepts=json.dumps(
            key_concepts or []
        ),
        important_observations=json.dumps(
            important_observations or []
        ),
        edge_cases=json.dumps(
            edge_cases or []
        ),
        interviewer_focus=json.dumps(
            interviewer_focus or []
        ),
        follow_up_questions=json.dumps(
            follow_up_questions or []
        ),
        strong_candidate_signals=json.dumps(
            strong_candidate_signals or []
        ),
        weak_candidate_signals=json.dumps(
            weak_candidate_signals or []
        ),
    )

    db.add(knowledge)

    if commit:
        db.commit()
        db.refresh(knowledge)
    else:
        db.flush()

    return knowledge
# ==========================================================
# Problem Approaches
# ==========================================================

def create_problem_approach(
    db: Session,
    problem_id: int,
    name: str,
    explanation: str,
    time_complexity: str = None,
    space_complexity: str = None,
    commit: bool = True,
):
    approach = CodingProblemApproach(
        problem_id=problem_id,
        name=name,
        explanation=explanation,
        time_complexity=time_complexity,
        space_complexity=space_complexity,
    )

    db.add(approach)

    if commit:
        db.commit()
        db.refresh(approach)

    else:
        db.flush()

    return approach


def get_problem_approaches(
    db: Session,
    problem_id: int,
):
    return (
        db.query(CodingProblemApproach)
        .filter(
            CodingProblemApproach.problem_id
            == problem_id
        )
        .all()
    )


# ==========================================================
# Test Cases
# ==========================================================

def create_test_case(
    db: Session,
    problem_id: int,
    input_data: str,
    expected_output: str,
    explanation: str = None,
    hidden: bool = False,
    commit: bool = True,
):
    test_case = CodingTestCase(
        problem_id=problem_id,
        input=input_data,
        expected_output=expected_output,
        explanation=explanation,
        hidden=1 if hidden else 0,
    )

    db.add(test_case)

    if commit:
        db.commit()
        db.refresh(test_case)

    else:
        db.flush()

    return test_case


def get_problem_test_cases(
    db: Session,
    problem_id: int,
):
    return (
        db.query(CodingTestCase)
        .filter(
            CodingTestCase.problem_id
            == problem_id
        )
        .all()
    )


# ==========================================================
# Coding Session
# ==========================================================

def create_coding_session(
    db: Session,
    user_id: int,
    problem_id: int,
    mode: str,
    company: str = None,
    role: str = None,
    language: str = "cpp",
    duration_minutes: int = None,
    number_of_questions: int = None,
    commit: bool = True,
):
    session = CodingSession(
        user_id=user_id,
        problem_id=problem_id,
        mode=mode,
        company=company,
        role=role,
        language=language,
        duration_minutes=duration_minutes,
        number_of_questions=number_of_questions,
    )

    db.add(session)

    if commit:
        db.commit()
        db.refresh(session)

    else:
        db.flush()

    return session


# ==========================================================
# Code Snapshots
# ==========================================================

def save_code_snapshot(
    db: Session,
    session_id: int,
    code: str,
    language: str,
    trigger: str = None,
    commit: bool = True,
):
    snapshot = CodeSnapshot(
        session_id=session_id,
        code=code,
        language=language,
        trigger=trigger,
    )

    db.add(snapshot)

    if commit:
        db.commit()
        db.refresh(snapshot)

    else:
        db.flush()

    return snapshot


def get_code_snapshots(
    db: Session,
    session_id: int,
):
    return (
        db.query(CodeSnapshot)
        .filter(
            CodeSnapshot.session_id
            == session_id
        )
        .order_by(
            CodeSnapshot.created_at
        )
        .all()
    )


# ==========================================================
# Code Execution
# ==========================================================

def save_code_execution(
    db: Session,
    session_id: int,
    code: str,
    language: str,
    passed: bool,
    passed_tests: int = 0,
    total_tests: int = 0,
    stdout: str = None,
    stderr: str = None,
    error: str = None,
    execution_time_ms: float = None,
    memory_used_kb: float = None,
    commit: bool = True,
):
    execution = CodeExecution(
        session_id=session_id,
        code=code,
        language=language,
        passed=1 if passed else 0,
        passed_tests=passed_tests,
        total_tests=total_tests,
        stdout=stdout,
        stderr=stderr,
        error=error,
        execution_time_ms=execution_time_ms,
        memory_used_kb=memory_used_kb,
    )

    db.add(execution)

    if commit:
        db.commit()
        db.refresh(execution)

    else:
        db.flush()

    return execution


# ==========================================================
# Coding Observations
# ==========================================================

def save_coding_observation(
    db: Session,
    session_id: int,
    observation: str,
    category: str,
    severity: str = None,
    evidence: str = None,
    should_intervene: bool = False,
    commit: bool = True,
):
    item = CodingObservation(
        session_id=session_id,
        observation=observation,
        category=category,
        severity=severity,
        evidence=evidence,
        should_intervene=(
            1 if should_intervene else 0
        ),
    )

    db.add(item)

    if commit:
        db.commit()
        db.refresh(item)

    else:
        db.flush()

    return item


# ==========================================================
# Interviewer Events
# ==========================================================

def save_interviewer_event(
    db: Session,
    session_id: int,
    question: str,
    reason: str,
    related_code: str = None,
    related_concept: str = None,
    commit: bool = True,
):
    event = InterviewerEvent(
        session_id=session_id,
        question=question,
        reason=reason,
        related_code=related_code,
        related_concept=related_concept,
    )

    db.add(event)

    if commit:
        db.commit()
        db.refresh(event)

    else:
        db.flush()

    return event


# ==========================================================
# Hints
# ==========================================================

def save_coding_hint(
    db: Session,
    session_id: int,
    level: int,
    hint: str,
    commit: bool = True,
):
    item = CodingHint(
        session_id=session_id,
        level=level,
        hint=hint,
    )

    db.add(item)

    if commit:
        db.commit()
        db.refresh(item)

    else:
        db.flush()

    return item


# ==========================================================
# Dry Runs
# ==========================================================

def save_dry_run(
    db: Session,
    session_id: int,
    test_case_input: str = None,
    canvas_data: str = None,
    duration_seconds: int = None,
    commit: bool = True,
):
    dry_run = DryRun(
        session_id=session_id,
        test_case_input=test_case_input,
        canvas_data=canvas_data,
        duration_seconds=duration_seconds,
    )

    db.add(dry_run)

    if commit:
        db.commit()
        db.refresh(dry_run)

    else:
        db.flush()

    return dry_run


# ==========================================================
# Coding Feedback
# ==========================================================

def save_coding_feedback(
    db: Session,
    session_id: int,
    overall_score: float,
    problem_understanding: float,
    approach_quality: float,
    code_quality: float,
    correctness: float,
    optimization: float,
    communication: float,
    strengths: str,
    weaknesses: str,
    recommendations: str,
    summary: str,
    commit: bool = True,
):
    feedback = CodingFeedback(
        session_id=session_id,
        overall_score=overall_score,
        problem_understanding=(
            problem_understanding
        ),
        approach_quality=(
            approach_quality
        ),
        code_quality=code_quality,
        correctness=correctness,
        optimization=optimization,
        communication=communication,
        strengths=strengths,
        weaknesses=weaknesses,
        recommendations=recommendations,
        summary=summary,
    )

    db.add(feedback)

    if commit:
        db.commit()
        db.refresh(feedback)

    else:
        db.flush()

    return feedback