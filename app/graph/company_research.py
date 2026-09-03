"""
company_research.py

Company Research Agent

Responsibilities:
- Read the company name from the PlacementState.
- Generate structured information about the company.
- Store the result in state["company_info"].

Future Upgrade:
- Replace pure LLM generation with Tavily Search + LLM.
"""

from langchain_core.prompts import ChatPromptTemplate

from app.config import fast_llm

from app.graph.schemas import CompanyResearch
from app.graph.state import PlacementState

from app.database.database import SessionLocal
from app.database.crud import (
    get_company,
    create_company,
)

import json


# ==========================================================
# Prompt
# ==========================================================

research_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are a Company Research Agent for an AI Placement Platform.

Your job is to provide concise and structured information about a company.

Return ONLY a CompanyResearch object.

Include:

- Company overview
- Major products/services
- Hiring process
- Frequently asked interview topics
- Approximate salary information for software engineering roles

Do not explain anything outside the structured output.
""",
        ),
        (
            "human",
            """
Company:

{company}
""",
        ),
    ]
)

# ==========================================================
# Structured LLM
# ==========================================================

structured_llm = fast_llm.with_structured_output(
    CompanyResearch
)

research_chain = research_prompt | structured_llm


# ==========================================================
# Company Research Node
# ==========================================================

# def company_research(state: PlacementState) -> PlacementState:
#     """
#     LangGraph node that gathers structured information
#     about the target company.
#     """

#     try:

#         company_info = research_chain.invoke(
#             {
#                 "company": state["company"]
#             }
#         )

#         state["company_info"] = company_info

#         return state

#     except Exception as e:
#         raise RuntimeError(
#             f"Company Research Agent failed: {e}"
#         ) from e

# def company_research(state: PlacementState) -> PlacementState:

#     print("========== COMPANY START ==========")

#     try:

#         print("Before invoke")

#         company_info = research_chain.invoke(
#             {
#                 "company": state["company"]
#             }
#         )

#         print("After invoke")

#         state["company_info"] = company_info

#         print("========== COMPANY END ==========")

#         return state

#     except Exception as e:
#         print(e)
#         raise RuntimeError(
#             f"Company Research Agent failed: {e}"
#         ) from e


# # def company_research(state: PlacementState) -> PlacementState:

#     print("========== COMPANY START ==========")

#     db = SessionLocal()

#     try:

#         company = state["company"]

#         # ============================================
#         # Check Cache
#         # ============================================

#         cached = get_company(
#             db,
#             company,
#         )

#         if cached:

#             print("Loaded company from database cache.")

#             state["company_info"] = CompanyResearch(
#                 company_name=cached.name,
#                 overview=cached.overview,
#                 products=json.loads(cached.products), # json ki string ko python list me convert kr diya    
#                 hiring_process=json.loads( 
#                     cached.hiring_process
#                 ),
#                 interview_topics=json.loads(
#                     cached.interview_topics
#                 ),
#                 salary_info=cached.salary_info,
#             )

#             print("========== COMPANY END ==========")

#             return state

#         # ============================================
#         # LLM Research
#         # ============================================

#         print("Company not found in cache.")
#         print("Generating research...")

#         company_info = research_chain.invoke(
#             {
#                 "company": company
#             }
#         )

#         # ============================================
#         # Save to DB
#         # ============================================

#         create_company(
#             db=db,
#             name=company_info.company_name,
#             overview=company_info.overview,
#             products=company_info.products,
#             hiring_process=company_info.hiring_process,
#             interview_topics=company_info.interview_topics,
#             salary_info=company_info.salary_info,
#         )

#         print("Company saved to cache.")

#         state["company_info"] = company_info

#         print("========== COMPANY END ==========")

#         return state

#     except Exception as e:

#         print(e)

#         raise RuntimeError(
#             f"Company Research Agent failed: {e}"
#         ) from e

#     finally:
#         db.close()


def company_research(state: PlacementState) -> PlacementState:

    print("========== COMPANY START ==========")

    # ==========================================================
    # No Company Provided
    # ==========================================================

    if not state["company"]:
        print("No company provided. Skipping company research.")

        state["company_info"] = None

        print("========== COMPANY END ==========")

        return state

    db = SessionLocal()

    try:

        company = state["company"]

        # ============================================
        # Check Cache
        # ============================================

        cached = get_company(
            db,
            company,
        )

        if cached:

            print("Loaded company from database cache.")

            state["company_info"] = CompanyResearch(
                company_name=cached.name,
                overview=cached.overview,
                products=json.loads(cached.products),
                hiring_process=json.loads(
                    cached.hiring_process
                ),
                interview_topics=json.loads(
                    cached.interview_topics
                ),
                salary_info=cached.salary_info,
            )

            print("========== COMPANY END ==========")

            return state

        # ============================================
        # LLM Research
        # ============================================

        print("Company not found in cache.")
        print("Generating research...")

        company_info = research_chain.invoke(
            {
                "company": company
            }
        )

        # ============================================
        # Save to DB
        # ============================================

        create_company(
            db=db,
            name=company_info.company_name,
            overview=company_info.overview,
            products=company_info.products,
            hiring_process=company_info.hiring_process,
            interview_topics=company_info.interview_topics,
            salary_info=company_info.salary_info,
        )

        print("Company saved to cache.")

        state["company_info"] = company_info

        print("========== COMPANY END ==========")

        return state

    except Exception as e:

        print(e)

        raise RuntimeError(
            f"Company Research Agent failed: {e}"
        ) from e

    finally:
        db.close()