"""
problem_enricher.py

Builds the reusable knowledge package for an EXISTING coding
problem.

The LLM only organizes knowledge.

It does NOT:
- create new problems
- execute code
- compile code
- verify candidate code
- judge candidate submissions
- replace the compiler/test runner
"""

import json
import re

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from app.config import fast_llm


# ==========================================================
# Limits
# ==========================================================

MAX_APPROACHES = 5
MAX_EXAMPLES = 4
MAX_CONSTRAINTS = 12
MAX_MISTAKES = 12
MAX_HINTS = 8


# ==========================================================
# Structured Knowledge Models
# ==========================================================

class EnrichedApproach(BaseModel):

    name: str = ""

    explanation: str = ""

    time_complexity: Optional[str] = None

    space_complexity: Optional[str] = None

    when_useful: Optional[str] = None

    limitations: Optional[str] = None


class EnrichedProblemKnowledge(BaseModel):

    core_intuition: str = ""

    problem_identity: str = ""

    primary_pattern: Optional[str] = None

    secondary_patterns: List[str] = Field(
        default_factory=list
    )

    recognition_signals: List[str] = Field(
        default_factory=list
    )

    when_to_use: List[str] = Field(
        default_factory=list
    )

    when_not_to_use: List[str] = Field(
        default_factory=list
    )

    approaches: List[EnrichedApproach] = Field(
        default_factory=list
    )

    optimal_approach: Optional[str] = None

    key_concepts: List[str] = Field(
        default_factory=list
    )

    important_observations: List[str] = Field(
        default_factory=list
    )

    edge_cases: List[str] = Field(
        default_factory=list
    )

    common_mistakes: List[str] = Field(
        default_factory=list
    )

    hints: List[str] = Field(
        default_factory=list
    )

    interviewer_focus: List[str] = Field(
        default_factory=list
    )

    follow_up_questions: List[str] = Field(
        default_factory=list
    )

    strong_candidate_signals: List[str] = Field(
        default_factory=list
    )

    weak_candidate_signals: List[str] = Field(
        default_factory=list
    )


# ==========================================================
# Prompt
# ==========================================================

ENRICHMENT_PROMPT = """
You are the knowledge-organization component of Placement AI.

You are given an EXISTING coding problem that has already
been extracted from established coding sources.

Your job is to organize complete technical knowledge about
that existing problem.

Do NOT:
- create another problem
- change the problem objective
- change expected output
- invent unsupported constraints
- invent unrelated approaches
- invent unsupported algorithmic facts

Preserve the core algorithmic intuition.

==========================================================
REQUIRED KNOWLEDGE
==========================================================

problem_identity:
What fundamental computational problem is being solved?

core_intuition:
What is the central algorithmic insight?

primary_pattern:
The main algorithmic pattern.

secondary_patterns:
Other genuinely relevant patterns.

recognition_signals:
Concrete clues that should make a candidate recognize
this pattern in a NEW problem.

when_to_use:
Return a JSON array of concise explanations describing
when this pattern should be considered.

when_not_to_use:
Return a JSON array explaining meaningful limitations
or situations where another approach is preferable.

approaches:
Include legitimate brute-force, intermediate, and optimal
approaches when they actually exist.

For each approach include:
- name
- explanation
- time complexity
- space complexity
- when useful
- limitations

optimal_approach:
Return a STRING explaining why the best approach fits
the problem.

IMPORTANT:
optimal_approach MUST be a string.
Do NOT return an object.
Do NOT return:
{
    "name": "...",
    "explanation": "..."
}

Instead return a concise string containing the approach
and its reasoning.

key_concepts:
Actual algorithmic concepts being tested.

important_observations:
Important insights a strong candidate should discover.

edge_cases:
Meaningful edge cases.

common_mistakes:
Realistic candidate mistakes.

hints:
Progressive hints from subtle to explicit.

interviewer_focus:
Return a JSON array containing useful information about
what an interviewer should observe.

follow_up_questions:
Useful interviewer follow-ups.

strong_candidate_signals:
Signals of genuine understanding.

weak_candidate_signals:
Signals of weak understanding.

==========================================================
OUTPUT RULE
==========================================================

Return ONLY valid JSON.

Do not use markdown.

Do not write:

```json

Do not write explanations before or after the JSON.

The JSON must match the requested fields.
"""


# ==========================================================
# IMPORTANT
# ==========================================================

# DO NOT use:
#
#     fast_llm.with_structured_output(...)
#
# because the current Groq model is returning a normal JSON
# response while LangChain is requiring a tool call.
#
# We therefore use the normal LLM and validate the JSON
# ourselves with Pydantic.

enricher_llm = fast_llm


# ==========================================================
# Normalization
# ==========================================================

def normalize_string(
    value: Any,
) -> str:

    if value is None:
        return ""

    if isinstance(value, str):
        return value.strip()

    return str(value).strip()


def normalize_string_list(
    value: Any,
) -> List[str]:
    """
    Convert model output into List[str].

    Supports:

        ["a", "b"]

    or:

        "a"

    or multiline text.
    """

    if value is None:
        return []

    if isinstance(value, list):

        result = []

        for item in value:

            text = normalize_string(
                item
            )

            if text:
                result.append(text)

        return result

    if isinstance(value, str):

        text = value.strip()

        if not text:
            return []

        lines = []

        for line in text.splitlines():

            line = line.strip()

            if line.startswith("- "):
                line = line[2:].strip()

            elif line.startswith("* "):
                line = line[2:].strip()

            if line:
                lines.append(line)

        if len(lines) > 1:
            return lines

        return [text]

    text = normalize_string(
        value
    )

    if not text:
        return []

    return [text]


def normalize_optimal_approach(
    value: Any,
) -> str:
    """
    Normalize optimal_approach.

    The LLM may occasionally return a structured object
    even though the schema requires a string.

    Convert that object into a stable textual representation.
    """

    if value is None:
        return ""

    if isinstance(value, str):
        return value.strip()

    if isinstance(value, dict):

        name = normalize_string(
            value.get("name")
        )

        explanation = normalize_string(
            value.get("explanation")
        )

        time_complexity = normalize_string(
            value.get("time_complexity")
        )

        space_complexity = normalize_string(
            value.get("space_complexity")
        )

        parts = []

        if name:
            parts.append(
                f"Approach: {name}"
            )

        if explanation:
            parts.append(
                f"Explanation: {explanation}"
            )

        if time_complexity:
            parts.append(
                f"Time: {time_complexity}"
            )

        if space_complexity:
            parts.append(
                f"Space: {space_complexity}"
            )

        return "\n".join(parts)

    return normalize_string(value)


# ==========================================================
# Compact Input
# ==========================================================

def compact_list(
    value: Any,
    limit: int,
):

    if not value:
        return []

    if isinstance(value, list):
        return value[:limit]

    return value


def compact_problem(
    problem: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Only the canonical extracted problem is sent to the
    enrichment model.

    Original research is NOT sent again.
    """

    return {

        "title": normalize_string(
            problem.get("title")
        ),

        "statement": normalize_string(
            problem.get("statement")
        ),

        "category": normalize_string(
            problem.get(
                "category",
                "General",
            )
        ),

        "difficulty": normalize_string(
            problem.get(
                "difficulty",
                "Medium",
            )
        ),

        "constraints": compact_list(
            problem.get(
                "constraints",
                [],
            ),
            MAX_CONSTRAINTS,
        ),

        "examples": compact_list(
            problem.get(
                "examples",
                [],
            ),
            MAX_EXAMPLES,
        ),

        "approaches": compact_list(
            problem.get(
                "approaches",
                [],
            ),
            MAX_APPROACHES,
        ),

        "optimal_approach": normalize_optimal_approach(
            problem.get(
                "optimal_approach",
                "",
            )
        ),

        "common_mistakes": compact_list(
            problem.get(
                "common_mistakes",
                [],
            ),
            MAX_MISTAKES,
        ),

        "hints": compact_list(
            problem.get(
                "hints",
                [],
            ),
            MAX_HINTS,
        ),
    }


# ==========================================================
# Extract JSON From LLM
# ==========================================================

def extract_json_object(
    text: str,
) -> Dict[str, Any]:
    """
    Extract a JSON object even if the model accidentally
    surrounds it with markdown or explanatory text.
    """

    if not text:

        raise ValueError(
            "LLM returned empty response."
        )

    text = text.strip()

    text = re.sub(
        r"^```(?:json)?\s*",
        "",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"\s*```$",
        "",
        text,
        flags=re.IGNORECASE,
    )

    text = text.strip()

    try:

        result = json.loads(
            text
        )

        if isinstance(result, dict):
            return result

    except json.JSONDecodeError:

        pass

    start = text.find("{")

    end = text.rfind("}")

    if start == -1 or end == -1:

        raise ValueError(
            "No JSON object found in LLM response."
        )

    candidate = text[
        start:end + 1
    ]

    result = json.loads(
        candidate
    )

    if not isinstance(result, dict):

        raise ValueError(
            "LLM JSON response is not an object."
        )

    return result


# ==========================================================
# Enrich Existing Problem
# ==========================================================

def enrich_problem(
    problem: Dict[str, Any],
    research_text: str = "",
) -> Optional[EnrichedProblemKnowledge]:
    """
    Enrich the canonical problem.

    research_text is intentionally ignored.

    It remains in the function signature so the existing
    seeding pipeline does not need to change.
    """

    if not problem:

        raise ValueError(
            "Problem data is required."
        )

    compact = compact_problem(
        problem
    )

    if not compact["title"]:

        raise ValueError(
            "Problem title is required."
        )

    if not compact["statement"]:

        raise ValueError(
            "Problem statement is required."
        )

    prompt = f"""
{ENRICHMENT_PROMPT}

==========================================================
CANONICAL PROBLEM
==========================================================

Title:
{compact["title"]}

Statement:
{compact["statement"]}

Category:
{compact["category"]}

Difficulty:
{compact["difficulty"]}

Constraints:
{compact["constraints"]}

Examples:
{compact["examples"]}

Existing Approaches:
{compact["approaches"]}

Existing Optimal Approach:
{compact["optimal_approach"]}

Existing Common Mistakes:
{compact["common_mistakes"]}

Existing Hints:
{compact["hints"]}
"""

    print(
        "Building compact problem knowledge..."
    )

    print(
        f"Enrichment payload size: "
        f"{len(prompt)} characters."
    )

    try:

        response = enricher_llm.invoke(
            prompt
        )

        if hasattr(
            response,
            "content",
        ):

            raw_text = response.content

        else:

            raw_text = str(
                response
            )

        data = extract_json_object(
            raw_text
        )

        # --------------------------------------------------
        # Normalize scalar / flexible fields
        # --------------------------------------------------

        data["core_intuition"] = normalize_string(
            data.get(
                "core_intuition",
                "",
            )
        )

        data["problem_identity"] = normalize_string(
            data.get(
                "problem_identity",
                "",
            )
        )

        data["primary_pattern"] = normalize_string(
            data.get(
                "primary_pattern",
                "",
            )
        )

        data["optimal_approach"] = normalize_optimal_approach(
            data.get(
                "optimal_approach",
                "",
            )
        )

        # --------------------------------------------------
        # Normalize list fields
        # --------------------------------------------------

        list_fields = [

            "secondary_patterns",

            "recognition_signals",

            "when_to_use",

            "when_not_to_use",

            "key_concepts",

            "important_observations",

            "edge_cases",

            "common_mistakes",

            "hints",

            "interviewer_focus",

            "follow_up_questions",

            "strong_candidate_signals",

            "weak_candidate_signals",
        ]

        for field in list_fields:

            data[field] = normalize_string_list(
                data.get(
                    field,
                    [],
                )
            )

        # --------------------------------------------------
        # Normalize approaches
        # --------------------------------------------------

        normalized_approaches = []

        raw_approaches = data.get(
            "approaches",
            [],
        )

        if isinstance(
            raw_approaches,
            list,
        ):

            for approach in raw_approaches:

                if not isinstance(
                    approach,
                    dict,
                ):
                    continue

                normalized_approaches.append(
                    {
                        "name": normalize_string(
                            approach.get(
                                "name",
                                "",
                            )
                        ),

                        "explanation": normalize_string(
                            approach.get(
                                "explanation",
                                "",
                            )
                        ),

                        "time_complexity": (
                            normalize_string(
                                approach.get(
                                    "time_complexity"
                                )
                            )
                            or None
                        ),

                        "space_complexity": (
                            normalize_string(
                                approach.get(
                                    "space_complexity"
                                )
                            )
                            or None
                        ),

                        "when_useful": (
                            normalize_string(
                                approach.get(
                                    "when_useful"
                                )
                            )
                            or None
                        ),

                        "limitations": (
                            normalize_string(
                                approach.get(
                                    "limitations"
                                )
                            )
                            or None
                        ),
                    }
                )

        data["approaches"] = normalized_approaches

        # --------------------------------------------------
        # Validate with Pydantic
        # --------------------------------------------------

        knowledge = (
            EnrichedProblemKnowledge.model_validate(
                data
            )
        )

        return knowledge

    except Exception as e:

        print(
            f"Problem enrichment failed: {e}"
        )

        return None


# ==========================================================
# Knowledge Validation
# ==========================================================

def validate_enriched_knowledge(
    knowledge: EnrichedProblemKnowledge,
) -> List[str]:
    """
    Validate minimum knowledge required by the repository.
    """

    errors = []

    if not normalize_string(
        knowledge.problem_identity
    ):

        errors.append(
            "Problem identity knowledge is missing."
        )

    if not normalize_string(
        knowledge.core_intuition
    ):

        errors.append(
            "Core intuition is missing."
        )

    if not normalize_string(
        knowledge.primary_pattern
    ):

        errors.append(
            "Primary pattern is missing."
        )

    if not knowledge.when_to_use:

        errors.append(
            "When-to-use knowledge is missing."
        )

    if not knowledge.when_not_to_use:

        errors.append(
            "When-not-to-use knowledge is missing."
        )

    if not knowledge.approaches:

        errors.append(
            "At least one solution approach is required."
        )

    if not knowledge.interviewer_focus:

        errors.append(
            "Interviewer-focus knowledge is missing."
        )

    if not normalize_string(
        knowledge.optimal_approach
    ):

        errors.append(
            "Optimal approach knowledge is missing."
        )

    return errors


# ==========================================================
# Knowledge → Dictionary
# ==========================================================

def knowledge_to_dict(
    knowledge: EnrichedProblemKnowledge,
) -> Dict[str, Any]:
    """
    Convert validated knowledge into a plain dictionary.
    """

    return {

        "core_intuition": normalize_string(
            knowledge.core_intuition
        ),

        "problem_identity": normalize_string(
            knowledge.problem_identity
        ),

        "primary_pattern": normalize_string(
            knowledge.primary_pattern
        ),

        "secondary_patterns": normalize_string_list(
            knowledge.secondary_patterns
        ),

        "recognition_signals": normalize_string_list(
            knowledge.recognition_signals
        ),

        "when_to_use": normalize_string_list(
            knowledge.when_to_use
        ),

        "when_not_to_use": normalize_string_list(
            knowledge.when_not_to_use
        ),

        "approaches": [
            approach.model_dump()
            for approach in knowledge.approaches
        ],

        "optimal_approach": normalize_string(
            knowledge.optimal_approach
        ),

        "key_concepts": normalize_string_list(
            knowledge.key_concepts
        ),

        "important_observations": normalize_string_list(
            knowledge.important_observations
        ),

        "edge_cases": normalize_string_list(
            knowledge.edge_cases
        ),

        "common_mistakes": normalize_string_list(
            knowledge.common_mistakes
        ),

        "hints": normalize_string_list(
            knowledge.hints
        ),

        "interviewer_focus": normalize_string_list(
            knowledge.interviewer_focus
        ),

        "follow_up_questions": normalize_string_list(
            knowledge.follow_up_questions
        ),

        "strong_candidate_signals": normalize_string_list(
            knowledge.strong_candidate_signals
        ),

        "weak_candidate_signals": normalize_string_list(
            knowledge.weak_candidate_signals
        ),
    }


# ==========================================================
# Convenience Wrapper
# ==========================================================

def enrich_problem_to_dict(
    problem: Dict[str, Any],
    research_text: str = "",
) -> Optional[Dict[str, Any]]:
    """
    Enrich and validate an existing problem.
    """

    knowledge = enrich_problem(
        problem=problem,
        research_text=research_text,
    )

    if knowledge is None:

        return None

    errors = validate_enriched_knowledge(
        knowledge
    )

    if errors:

        print(
            "\nPROBLEM KNOWLEDGE VALIDATION FAILED"
        )

        for error in errors:

            print(
                f"  - {error}"
            )

        return None

    return knowledge_to_dict(
        knowledge
    )