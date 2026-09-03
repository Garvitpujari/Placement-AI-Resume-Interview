"""
router.py

Router Agent

This is the first LangGraph node.

Responsibilities:
- Understand the user's request.
- Decide which workflow should run.
- Extract company name.
- Extract job role.
- Update the shared PlacementState.

The router DOES NOT:
- Conduct interviews
- Perform company research
- Generate feedback
"""

from langchain_core.prompts import ChatPromptTemplate

from app.config import fast_llm
from app.graph.schemas import RoutingDecision
from app.graph.state import PlacementState


# ==========================================================
# Router Prompt
# ==========================================================

router_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are the Router Agent of an AI Placement Platform.

Your ONLY responsibility is to classify the user's request.

Determine:

1. mode
2. company
3. role

Supported modes:
- interview
- research

Rules:

- mode must be either "interview" or "research".
- company should contain ONLY the company name.
- role should contain ONLY the job role.

IMPORTANT COMPANY RULES:
- NEVER infer or guess a company.
- NEVER use a company from examples, memory, context, or general knowledge.
- ONLY return a company if the user explicitly names that company
  in the current user request.
- If the user does not explicitly name a company, company MUST be null.
- NEVER infer a company from the requested technology.
- NEVER infer a company from the requested role.
- NEVER infer a company from the interview style.
- NEVER infer a company from the candidate profile.
- NEVER infer a company from the resume.
- For a general interview request without a named company,
  return company = null.

ROLE RULES:
- ONLY return a role if the user explicitly mentions a role.
- Do not infer a role from general interview topics.
- If no role is explicitly mentioned, role MUST be null.

Return only structured data.
Do not explain your reasoning.

Examples:

User:
Take a Microsoft SDE interview.

Output:
mode = interview
company = Microsoft
role = SDE

----------------------------

User:
Research Amazon hiring process.

Output:
mode = research
company = Amazon
role = null

----------------------------

User:
Give me a GenAI and Agentic AI interview.

Output:
mode = interview
company = null
role = null

----------------------------

User:
Give me an Amazon GenAI interview.

Output:
mode = interview
company = Amazon
role = null
""",
        ),
        (
            "human",
            "{query}",
        ),
    ]
)


# ==========================================================
# Structured LLM
# ==========================================================

structured_llm = fast_llm.with_structured_output(
    RoutingDecision
)

router_chain = router_prompt | structured_llm


# ==========================================================
# Router Node
# ==========================================================

def router(state: PlacementState) -> PlacementState:
    """
    LangGraph Router Node.

    Reads the user's request, determines the workflow,
    validates the extracted company against the actual
    user query, updates PlacementState, and returns it.
    """

    print("========== ROUTER START ==========")

    try:

        # ======================================================
        # Ask LLM to classify the user's request
        # ======================================================

        decision = router_chain.invoke(
            {
                "query": state["user_query"]
            }
        )

        # ======================================================
        # Debug: Raw LLM Decision
        # ======================================================

        print("ROUTER DECISION:")
        print("Mode:", decision.mode)
        print("Company:", decision.company)
        print("Role:", decision.role)

        # ======================================================
        # Defensive Company Validation
        # ======================================================
        # Even if the LLM incorrectly guesses a company,
        # reject it unless the company was explicitly mentioned
        # in the user's current request.

        query = state["user_query"].lower()

        if decision.company:

            company_name = decision.company.strip().lower()

            if company_name not in query:
                print(
                    f"Router rejected inferred company: "
                    f"{decision.company}"
                )

                decision.company = None

        # ======================================================
        # Defensive Role Validation
        # ======================================================
        # Same principle for the role.
        # We don't want the LLM inventing a role that the
        # user did not explicitly request.

        if decision.role:

            role_name = decision.role.strip().lower()

            if role_name not in query:
                print(
                    f"Router rejected inferred role: "
                    f"{decision.role}"
                )

                decision.role = None

        # ======================================================
        # Debug: Validated Decision
        # ======================================================

        print("ROUTER AFTER VALIDATION:")
        print("Mode:", decision.mode)
        print("Company:", decision.company)
        print("Role:", decision.role)

        # ======================================================
        # Update Shared State
        # ======================================================

        state["mode"] = decision.mode

        state["company"] = (
            decision.company.strip()
            if decision.company
            else ""
        )

        state["role"] = (
            decision.role.strip()
            if decision.role
            else ""
        )

        print("========== ROUTER END ==========")

        return state

    except Exception as e:

        raise RuntimeError(
            f"Router Agent failed: {e}"
        ) from e