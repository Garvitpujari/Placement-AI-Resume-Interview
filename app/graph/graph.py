"""
graph.py

Builds the complete Placement AI LangGraph workflow.
"""

from langgraph.graph import StateGraph, START, END

from app.graph.state import PlacementState

from app.graph.router import router
from app.graph.company_research import company_research
from app.graph.memory import (
    retrieve_relevant_memories,
    analyze_and_save_memories,
)
from app.graph.interview import interview
from app.graph.feedback import feedback


# ==========================================================
# Build Graph
# ==========================================================

builder = StateGraph(PlacementState)


# ==========================================================
# Nodes
# ==========================================================

builder.add_node(
    "router",
    router,
)

builder.add_node(
    "company_research",
    company_research,
)

builder.add_node(
    "memory",
    retrieve_relevant_memories,
)

builder.add_node(
    "interview",
    interview,
)

builder.add_node(
    "feedback",
    feedback,
)

builder.add_node(
    "memory_analysis",
    analyze_and_save_memories,
)


# ==========================================================
# Conditional Routing
# ==========================================================

def start_router(
    state: PlacementState,
):
    """
    Decide whether this is the first graph execution
    or a continuation of an existing interview.

    Missing setup_completed means this is treated as
    the initial setup phase.
    """

    if state.get(
        "setup_completed",
        False,
    ):
        return "memory"

    return "router"


def company_router(
    state: PlacementState,
):
    """
    Decide whether company research is required.

    If a company was explicitly provided,
    perform company research.

    Otherwise, skip company research and
    continue directly to candidate memory retrieval.
    """

    if state.get(
        "company",
        "",
    ):
        return "company_research"

    return "memory"


def interview_router(
    state: PlacementState,
):
    """
    Route after the interview node.

    If the interview is complete,
    generate final feedback.

    Otherwise, stop execution and wait
    for the user's next answer.

    Missing interview_completed means the
    interview is not yet complete.
    """

    if state.get(
        "interview_completed",
        False,
    ):
        return "feedback"

    return END


# ==========================================================
# START Routing
# ==========================================================

builder.add_conditional_edges(
    START,
    start_router,
    {
        "router": "router",
        "memory": "memory",
    },
)


# ==========================================================
# Router → Company Research / Memory
# ==========================================================

builder.add_conditional_edges(
    "router",
    company_router,
    {
        "company_research": "company_research",
        "memory": "memory",
    },
)


# ==========================================================
# Company Research → Memory
# ==========================================================

builder.add_edge(
    "company_research",
    "memory",
)


# ==========================================================
# Memory → Interview
# ==========================================================

builder.add_edge(
    "memory",
    "interview",
)


# ==========================================================
# Interview Routing
# ==========================================================

builder.add_conditional_edges(
    "interview",
    interview_router,
    {
        "feedback": "feedback",
        END: END,
    },
)


# ==========================================================
# Feedback → Permanent Memory
# ==========================================================

builder.add_edge(
    "feedback",
    "memory_analysis",
)


# ==========================================================
# Permanent Memory → END
# ==========================================================

builder.add_edge(
    "memory_analysis",
    END,
)


# ==========================================================
# Compile Graph
# ==========================================================

graph = builder.compile()