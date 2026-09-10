"""
problem_extractor.py

Converts web research results into a structured coding problem.

The extractor works only with existing coding problems found
in established coding/interview sources.

It does NOT:
- invent new problems
- select problems for candidates
- execute candidate code
- judge candidate code
- decide whether a candidate solution is optimal

Its responsibility is:

Research
    ↓
Compact useful source material
    ↓
Structured extraction
    ↓
Normalized coding-problem knowledge
    ↓
Persistence layer
"""

from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Field, ConfigDict

from app.config import fast_llm

from app.coding.problem_service import (
    save_researched_problem,
)


# ==========================================================
# Configuration
# ==========================================================

MAX_SOURCES = 5

MAX_CONTENT_CHARS_PER_SOURCE = 6000

MAX_TOTAL_RESEARCH_CHARS = 24000


# ==========================================================
# Preferred Sources
# ==========================================================

PREFERRED_SOURCE_DOMAINS = (
    "leetcode.com",
    "codeforces.com",
    "geeksforgeeks.org",
    "codingninjas.com",
    "naukri.com",
    "hackerrank.com",
)


# ==========================================================
# Extraction Prompt
# ==========================================================

problem_extraction_prompt = """
You are a coding-problem knowledge extraction agent.

Extract an EXISTING coding problem from the supplied
research material.

Do NOT invent a new problem.

The wording may differ between sources, but preserve the
actual core problem and intended algorithmic task.

==========================================================
CANONICAL PROBLEM
==========================================================

Extract:

1. Problem title
2. Problem statement
3. Category
4. Difficulty
5. Constraints
6. Examples
7. Important solution approaches
8. Time complexity of each approach
9. Space complexity of each approach
10. Best/optimal approach
11. Common mistakes
12. Useful hints

CATEGORY RULE:

Return ONE primary category only.

Examples:

Array
String
Hashing
Linked List
Stack
Queue
Tree
Graph
Heap
Binary Search
Greedy
Dynamic Programming
Backtracking
Sorting
Other

If multiple categories seem relevant, choose the single
best primary category.

Put secondary algorithmic ideas into:
- primary_pattern
- secondary_patterns

Do NOT return category as an array.

For approaches distinguish when supported by research:

- Brute Force
- Better / Intermediate
- Optimal

Only include approaches supported by the research.

Do NOT call an approach optimal merely because it looks
efficient. The research must support the classification.

Do not invent unsupported constraints, examples,
complexities, or approaches.

==========================================================
EXECUTION CONTRACT
==========================================================

This problem will eventually be executed by a real
candidate program.

Therefore test-case input MUST be executable stdin.

Do NOT return descriptive input such as:

    k = 2, prices = [2,4,1]

Do NOT return:

    nums = [2,7,11,15], target = 9

Instead return the exact raw text that should be supplied
to stdin.

For example, if the canonical input contract is:

    first line: k
    second line: n
    third line: n space-separated prices

then a test case must contain:

    2
    3
    2 4 1

Preserve the source's actual input contract.

Do NOT invent an input format.

If the research does not provide enough information to
determine an executable stdin format, leave the test cases
empty rather than inventing one.

==========================================================
TEST CASES
==========================================================

Include:

- normal cases
- important edge cases
- boundary cases
- hidden-style cases where appropriate

Each test case must contain:

input:
    Raw executable stdin only.

expected_output:
    Raw expected stdout only.

explanation:
    Optional explanation of what the case tests.

hidden:
    true or false.

Do not expose hidden test cases to candidates later.

IMPORTANT:

Test cases must match the exact executable input contract
of the extracted problem.

Do not combine variable declarations with values.

Do not use labels such as:

    n =
    target =
    prices =
    nums =

==========================================================
CODING KNOWLEDGE
==========================================================

Also extract persistent knowledge useful for candidate
routing and interview analysis.

Extract:

1. Problem identity
2. Core intuition
3. Primary pattern
4. Secondary patterns
5. Recognition signals
6. When to use
7. When not to use
8. Key concepts
9. Important observations
10. Edge cases
11. Interviewer focus
12. Follow-up questions
13. Strong candidate signals
14. Weak candidate signals

For fields that naturally contain multiple items, return
a list when possible.

If a field contains one item, either a single string or a
one-element list is acceptable.

Only include knowledge supported by the research.

If information is unavailable or uncertain, leave the
corresponding field empty.

Return structured data only.
"""


# ==========================================================
# Structured Output Schemas
# ==========================================================

class ExtractedExample(BaseModel):

    input: str

    output: str

    explanation: Optional[str] = None


class ExtractedApproach(BaseModel):

    name: str

    explanation: str

    time_complexity: Optional[str] = None

    space_complexity: Optional[str] = None


class ExtractedTestCase(BaseModel):

    input: str

    expected_output: str

    explanation: Optional[str] = None

    hidden: bool = False


class ExtractedCodingProblem(BaseModel):

    model_config = ConfigDict(
        extra="ignore"
    )

    # ------------------------------------------------------
    # Canonical problem
    # ------------------------------------------------------

    title: str

    statement: str

    # IMPORTANT:
    # LLMs sometimes return ["Array", "Greedy"].
    # We accept both here and normalize afterward.
    category: Union[
        str,
        List[str],
    ] = "General"

    difficulty: str = "Medium"

    constraints: List[str] = Field(
        default_factory=list
    )

    examples: List[ExtractedExample] = Field(
        default_factory=list
    )

    approaches: List[ExtractedApproach] = Field(
        default_factory=list
    )

    optimal_approach: Optional[str] = None

    common_mistakes: List[str] = Field(
        default_factory=list
    )

    hints: List[str] = Field(
        default_factory=list
    )

    test_cases: List[ExtractedTestCase] = Field(
        default_factory=list
    )

    # ------------------------------------------------------
    # Persistent coding knowledge
    # ------------------------------------------------------

    problem_identity: str = ""

    core_intuition: str = ""

    primary_pattern: str = ""

    secondary_patterns: Union[
        List[str],
        str,
    ] = Field(
        default_factory=list
    )

    recognition_signals: Union[
        List[str],
        str,
    ] = Field(
        default_factory=list
    )

    when_to_use: Union[
        List[str],
        str,
    ] = Field(
        default_factory=list
    )

    when_not_to_use: Union[
        List[str],
        str,
    ] = Field(
        default_factory=list
    )

    key_concepts: Union[
        List[str],
        str,
    ] = Field(
        default_factory=list
    )

    important_observations: Union[
        List[str],
        str,
    ] = Field(
        default_factory=list
    )

    edge_cases: Union[
        List[str],
        str,
    ] = Field(
        default_factory=list
    )

    interviewer_focus: Union[
        List[str],
        str,
    ] = Field(
        default_factory=list
    )

    follow_up_questions: Union[
        List[str],
        str,
    ] = Field(
        default_factory=list
    )

    strong_candidate_signals: Union[
        List[str],
        str,
    ] = Field(
        default_factory=list
    )

    weak_candidate_signals: Union[
        List[str],
        str,
    ] = Field(
        default_factory=list
    )


# ==========================================================
# Structured LLM
# ==========================================================

# JSON mode is used instead of provider tool/function calling.
# This avoids failures caused by malformed function-call arguments
# such as duplicate JSON keys or truncated tool-call payloads.
extractor_llm = fast_llm.bind(
    response_format={"type": "json_object"}
)

MAX_EXTRACTION_ATTEMPTS = 3
MAX_TEST_CASE_ATTEMPTS = 2

STRICT_JSON_INSTRUCTION = """
Return ONLY one valid JSON object.

Rules:
- Use double quotes for every JSON key and string.
- Never use trailing commas.
- Never repeat a JSON key.
- Never return markdown fences.
- Never return explanatory text outside the JSON object.
- category MUST be one string, never an array.
- test_cases MUST be an array.
- approaches MUST be an array.
- All list fields MUST be JSON arrays.
- If information is unavailable, use an empty array or empty string.
- Do not invent information unsupported by the research.
"""


def _response_text(result: Any) -> str:
    """Extract plain text from a LangChain model response."""
    if result is None:
        return ""
    content = getattr(result, "content", result)
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict) and item.get("text"):
                parts.append(str(item["text"]))
        return "".join(parts).strip()
    return str(content).strip()


def _parse_json_object(raw: str) -> Dict[str, Any]:
    """Parse a JSON object without unsafe repair."""
    import json
    text = (raw or "").strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].strip().startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    value = json.loads(text)
    if not isinstance(value, dict):
        raise ValueError("LLM response must be a JSON object.")
    return value


def _build_extraction_prompt(
    research_text: str,
    attempt: int,
    previous_error: Optional[str] = None,
) -> str:
    retry_note = ""
    if previous_error:
        retry_note = f"""
Previous attempt failed:
{previous_error}
Correct that failure. Return a fresh valid JSON object.
"""
    return f"""
{problem_extraction_prompt}

{STRICT_JSON_INSTRUCTION}

Extraction attempt {attempt} of {MAX_EXTRACTION_ATTEMPTS}.
{retry_note}
Before responding, verify:
1. Every JSON key is unique.
2. category is one string.
3. Every list field is an array.
4. Every test case has input and expected_output.
5. Test input is raw executable stdin, not variable assignments.
6. Do not invent an input contract.
7. Return JSON only.

WEB RESEARCH:
{research_text}
"""


def _normalize_extraction_dict(
    data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Normalize common LLM field-name and shape variations before
    Pydantic validation.

    These are deterministic aliases only; no missing problem content
    is invented here.
    """

    if not isinstance(data, dict):
        raise ValueError("Extraction result must be a JSON object.")

    normalized = dict(data)

    aliases = {
        "problem_title": "title",
        "problem_name": "title",
        "problem_statement": "statement",
        "problem_description": "statement",
        "description": "statement",
        "difficulty_level": "difficulty",
        "problem_category": "category",
        "testCases": "test_cases",
        "commonMistakes": "common_mistakes",
        "optimalApproach": "optimal_approach",
    }

    for old_key, new_key in aliases.items():
        if new_key not in normalized and old_key in normalized:
            normalized[new_key] = normalized[old_key]

    list_fields = {
        "constraints",
        "examples",
        "approaches",
        "common_mistakes",
        "hints",
        "test_cases",
        "secondary_patterns",
        "recognition_signals",
        "when_to_use",
        "when_not_to_use",
        "key_concepts",
        "important_observations",
        "edge_cases",
        "interviewer_focus",
        "follow_up_questions",
        "strong_candidate_signals",
        "weak_candidate_signals",
    }

    for field in list_fields:
        if field not in normalized:
            continue

        value = normalized[field]

        if value is None or value == "":
            normalized[field] = []
        elif isinstance(value, tuple):
            normalized[field] = list(value)
        elif not isinstance(value, list):
            normalized[field] = [value]

    approaches = normalized.get("approaches", [])

    if isinstance(approaches, list):
        fixed_approaches = []

        for approach in approaches:
            if not isinstance(approach, dict):
                continue

            item = dict(approach)

            approach_aliases = {
                "description": "explanation",
                "details": "explanation",
                "approach_description": "explanation",
                "time": "time_complexity",
                "time_complexity_analysis": "time_complexity",
                "space": "space_complexity",
                "space_complexity_analysis": "space_complexity",
            }

            for old_key, new_key in approach_aliases.items():
                if new_key not in item and old_key in item:
                    item[new_key] = item[old_key]

            if not item.get("explanation"):
                for candidate in ("description", "details", "reason"):
                    if item.get(candidate):
                        item["explanation"] = item[candidate]
                        break

            fixed_approaches.append(item)

        normalized["approaches"] = fixed_approaches

    category = normalized.get("category")

    if isinstance(category, list):
        values = [
            str(value).strip()
            for value in category
            if value is not None and str(value).strip()
        ]
        normalized["category"] = values[0] if values else ""
    elif category is None:
        normalized["category"] = ""

    for field in (
        "title",
        "statement",
        "difficulty",
        "category",
        "optimal_approach",
        "source",
        "source_url",
    ):
        if field not in normalized:
            continue

        value = normalized[field]

        if value is None:
            normalized[field] = ""
        elif not isinstance(value, str):
            normalized[field] = str(value)

    return normalized


def _validate_extracted_dict(
    data: Dict[str, Any],
) -> ExtractedCodingProblem:
    """Normalize common LLM variations, then validate the canonical schema."""

    normalized = _normalize_extraction_dict(data)

    return ExtractedCodingProblem.model_validate(normalized)


def _generate_test_cases(
    problem: ExtractedCodingProblem,
    research_text: str,
) -> ExtractedCodingProblem:
    """Attempt targeted recovery when canonical extraction has no cases."""
    if problem.test_cases:
        return problem

    print("No test cases extracted. Attempting targeted test-case generation...")
    previous_error = None

    for attempt in range(1, MAX_TEST_CASE_ATTEMPTS + 1):
        prompt = f"""
You are a test-case generation agent for an EXISTING coding problem.

Return ONLY valid JSON with exactly this shape:
{{
  "test_cases": [
    {{
      "input": "raw executable stdin",
      "expected_output": "raw executable stdout",
      "explanation": "what the case tests",
      "hidden": false
    }}
  ]
}}

Rules:
- Never repeat a JSON key.
- Never return markdown or prose outside JSON.
- Input must be executable stdin, never variable assignments.
- Do not use labels such as nums=, target=, n=, prices=.
- Preserve the exact input contract established by the research.
- If the research does not establish an executable input contract, return
  an empty test_cases array rather than inventing one.
- Include normal and edge cases when the contract is known.

Canonical problem:
Title: {problem.title}
Statement: {problem.statement}
Category: {problem.category}
Difficulty: {problem.difficulty}
Constraints: {problem.constraints}
Examples: {[x.model_dump() for x in problem.examples]}

Research:
{research_text}

Attempt: {attempt}/{MAX_TEST_CASE_ATTEMPTS}
{('Previous failure: ' + previous_error) if previous_error else ''}
"""
        try:
            response = extractor_llm.invoke(prompt)
            data = _parse_json_object(_response_text(response))
            raw_cases = data.get("test_cases", [])
            if not isinstance(raw_cases, list):
                raise ValueError("test_cases must be a JSON array")
            cases = []
            for item in raw_cases:
                if isinstance(item, dict):
                    cases.append(ExtractedTestCase.model_validate(item))
            problem.test_cases = cases
            problem = validate_extracted_test_cases(problem)
            if problem.test_cases:
                print(f"Generated {len(problem.test_cases)} executable test cases.")
                return problem
            previous_error = "No valid executable test cases were produced."
        except Exception as exc:
            previous_error = str(exc)
            print(f"Test-case generation attempt {attempt}/{MAX_TEST_CASE_ATTEMPTS} failed: {exc}")

    print("Unable to recover executable test cases.")
    return problem


# ==========================================================
# Normalization Helpers
# ==========================================================

def normalize_string(
    value: Any,
) -> str:
    """
    Normalize any scalar value into a string.
    """

    if value is None:
        return ""

    if isinstance(
        value,
        str,
    ):

        return value.strip()

    return str(value).strip()


def normalize_string_list(
    value: Any,
) -> List[str]:
    """
    Normalize a value returned by the LLM into List[str].

    Accepts:

        None
        ""
        "single value"
        ["value 1", "value 2"]

    Returns:

        []
        ["single value"]
        ["value 1", "value 2"]
    """

    if value is None:

        return []

    if isinstance(
        value,
        str,
    ):

        value = value.strip()

        if not value:

            return []

        return [value]

    if isinstance(
        value,
        list,
    ):

        normalized = []

        for item in value:

            if item is None:

                continue

            if isinstance(
                item,
                str,
            ):

                item = item.strip()

                if item:

                    normalized.append(
                        item
                    )

            else:

                normalized.append(
                    str(item)
                )

        return normalized

    return [
        str(value)
    ]


def normalize_category(
    value: Any,
) -> str:
    """
    Normalize category into exactly ONE canonical string.

    The LLM may return:

        "Array"

    or:

        ["Array", "Greedy"]

    The database receives only:

        "Array"
    """

    if value is None:

        return "General"

    if isinstance(
        value,
        list,
    ):

        for item in value:

            if not isinstance(
                item,
                str,
            ):

                continue

            item = item.strip()

            if item:

                return item

        return "General"

    if isinstance(
        value,
        str,
    ):

        value = value.strip()

        return (
            value
            if value
            else "General"
        )

    return "General"


def normalize_extracted_problem(
    problem: ExtractedCodingProblem,
) -> ExtractedCodingProblem:
    """
    Normalize flexible LLM output into the exact structure
    expected by the persistence layer.
    """

    # ------------------------------------------------------
    # Category
    # ------------------------------------------------------

    problem.category = normalize_category(
        problem.category
    )

    # ------------------------------------------------------
    # Difficulty
    # ------------------------------------------------------

    problem.difficulty = (
        normalize_string(
            problem.difficulty
        )
        or "Medium"
    )

    # ------------------------------------------------------
    # Scalar fields
    # ------------------------------------------------------

    problem.title = normalize_string(
        problem.title
    )

    problem.statement = normalize_string(
        problem.statement
    )

    problem.optimal_approach = (
        normalize_string(
            problem.optimal_approach
        )
        or None
    )

    problem.problem_identity = (
        normalize_string(
            problem.problem_identity
        )
    )

    problem.core_intuition = (
        normalize_string(
            problem.core_intuition
        )
    )

    problem.primary_pattern = (
        normalize_string(
            problem.primary_pattern
        )
    )

    # ------------------------------------------------------
    # List fields
    # ------------------------------------------------------

    list_fields = (
        "constraints",
        "common_mistakes",
        "hints",
        "secondary_patterns",
        "recognition_signals",
        "when_to_use",
        "when_not_to_use",
        "key_concepts",
        "important_observations",
        "edge_cases",
        "interviewer_focus",
        "follow_up_questions",
        "strong_candidate_signals",
        "weak_candidate_signals",
    )

    for field_name in list_fields:

        value = getattr(
            problem,
            field_name,
        )

        setattr(
            problem,
            field_name,
            normalize_string_list(
                value
            ),
        )

    # ------------------------------------------------------
    # Normalize examples
    # ------------------------------------------------------

    normalized_examples = []

    for example in problem.examples:

        input_data = normalize_string(
            example.input
        )

        output_data = normalize_string(
            example.output
        )

        if not input_data:
            continue

        if not output_data:
            continue

        normalized_examples.append(
            ExtractedExample(
                input=input_data,
                output=output_data,
                explanation=(
                    normalize_string(
                        example.explanation
                    )
                    or None
                ),
            )
        )

    problem.examples = (
        normalized_examples
    )

    # ------------------------------------------------------
    # Normalize approaches
    # ------------------------------------------------------

    normalized_approaches = []

    for approach in problem.approaches:

        name = normalize_string(
            approach.name
        )

        explanation = normalize_string(
            approach.explanation
        )

        if not name:
            continue

        if not explanation:
            continue

        normalized_approaches.append(
            ExtractedApproach(
                name=name,
                explanation=explanation,
                time_complexity=(
                    normalize_string(
                        approach.time_complexity
                    )
                    or None
                ),
                space_complexity=(
                    normalize_string(
                        approach.space_complexity
                    )
                    or None
                ),
            )
        )

    problem.approaches = (
        normalized_approaches
    )

    return problem


# ==========================================================
# Source Ranking
# ==========================================================

def source_score(
    result: Dict[str, Any],
) -> int:

    url = (
        result.get(
            "url",
            "",
        )
        or ""
    ).lower()

    title = (
        result.get(
            "title",
            "",
        )
        or ""
    ).lower()

    score = 0

    for domain in PREFERRED_SOURCE_DOMAINS:

        if domain in url:

            score += 100

            break

    useful_terms = (
        "solution",
        "approach",
        "explanation",
        "complexity",
        "leetcode",
        "codeforces",
        "interview",
    )

    for term in useful_terms:

        if term in title:

            score += 5

    content = (
        result.get(
            "content",
            "",
        )
        or ""
    )

    if content.strip():

        score += 10

    return score


# ==========================================================
# Select Best Sources
# ==========================================================

def select_best_sources(
    research_results: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:

    if not research_results:

        return []

    ranked = sorted(
        research_results,
        key=source_score,
        reverse=True,
    )

    return ranked[
        :MAX_SOURCES
    ]


# ==========================================================
# Clean Source Content
# ==========================================================

def clean_source_content(
    content: str,
) -> str:

    if not content:

        return ""

    content = content.strip()

    lines = []

    previous_blank = False

    for line in content.splitlines():

        line = line.strip()

        if not line:

            if previous_blank:

                continue

            previous_blank = True

            lines.append("")

            continue

        previous_blank = False

        lines.append(
            line
        )

    content = "\n".join(
        lines
    )

    return content[
        :MAX_CONTENT_CHARS_PER_SOURCE
    ]


# ==========================================================
# Research Formatting
# ==========================================================

def format_research_for_llm(
    research_results: List[Dict[str, Any]],
) -> str:

    if not research_results:

        return ""

    selected_sources = select_best_sources(
        research_results
    )

    sections = []

    total_chars = 0

    for index, result in enumerate(
        selected_sources,
        start=1,
    ):

        title = (
            result.get(
                "title",
                "",
            )
            or ""
        )

        url = (
            result.get(
                "url",
                "",
            )
            or ""
        )

        content = clean_source_content(
            result.get(
                "content",
                "",
            )
            or ""
        )

        if not content:

            continue

        section = f"""
================ SOURCE {index} ================

Title:
{title}

URL:
{url}

Content:
{content}
"""

        remaining = (
            MAX_TOTAL_RESEARCH_CHARS
            - total_chars
        )

        if remaining <= 0:

            break

        section = section[
            :remaining
        ]

        sections.append(
            section
        )

        total_chars += len(
            section
        )

    return "\n".join(
        sections
    )


# ==========================================================
# Validate Extracted Test Cases
# ==========================================================

def validate_extracted_test_cases(
    problem: ExtractedCodingProblem,
) -> ExtractedCodingProblem:
    """
    Reject obviously descriptive test-case input.

    This is intentionally conservative.
    It does not attempt to understand every possible
    programming-language input format.
    """

    cleaned_cases = []

    forbidden_patterns = (
        " = [",
        " = {",
        " = (",
        "nums =",
        "prices =",
        "target =",
        "array =",
        "input =",
        "output =",
    )

    for test_case in problem.test_cases:

        input_data = (
            test_case.input
            or ""
        ).strip()

        expected_output = (
            test_case.expected_output
            or ""
        ).strip()

        if not input_data:

            continue

        if not expected_output:

            continue

        lowered = input_data.lower()

        if any(
            pattern.lower() in lowered
            for pattern in forbidden_patterns
        ):

            print(
                "Warning: rejecting non-executable "
                f"test input: {input_data}"
            )

            continue

        cleaned_cases.append(
            ExtractedTestCase(
                input=input_data,
                expected_output=expected_output,
                explanation=(
                    normalize_string(
                        test_case.explanation
                    )
                    or None
                ),
                hidden=bool(
                    test_case.hidden
                ),
            )
        )

    problem.test_cases = (
        cleaned_cases
    )

    return problem


# ==========================================================
# Extract Problem
# ==========================================================

def extract_problem(
    research_results: List[Dict[str, Any]],
) -> Optional[ExtractedCodingProblem]:
    """Extract an existing coding problem with bounded JSON-mode retries."""
    if not research_results:
        print("No research available for extraction.")
        return None

    research_text = format_research_for_llm(research_results)
    if not research_text.strip():
        print("Research content is empty.")
        return None

    selected_sources = select_best_sources(research_results)
    print(f"Using {len(selected_sources)} research sources for extraction.")
    print(f"Extraction payload size: {len(research_text)} characters.")

    previous_error = None
    for attempt in range(1, MAX_EXTRACTION_ATTEMPTS + 1):
        print(f"Extraction attempt {attempt}/{MAX_EXTRACTION_ATTEMPTS}...")
        try:
            result = extractor_llm.invoke(
                _build_extraction_prompt(
                    research_text=research_text,
                    attempt=attempt,
                    previous_error=previous_error,
                )
            )
            raw = _response_text(result)
            if not raw:
                raise ValueError("LLM returned empty content.")

            data = _parse_json_object(raw)
            extracted = _validate_extracted_dict(data)
            extracted = normalize_extracted_problem(extracted)
            extracted = validate_extracted_test_cases(extracted)

            if not extracted.test_cases:
                extracted = _generate_test_cases(extracted, research_text)
                extracted = normalize_extracted_problem(extracted)
                extracted = validate_extracted_test_cases(extracted)

            return extracted
        except Exception as exc:
            previous_error = str(exc)
            print(
                f"Problem extraction attempt {attempt}/{MAX_EXTRACTION_ATTEMPTS} "
                f"failed: {exc}"
            )

    print(f"Problem extraction failed after {MAX_EXTRACTION_ATTEMPTS} attempts.")
    return None


# ==========================================================
# Convert Extracted Problem
# ==========================================================

def extracted_problem_to_dict(
    problem: ExtractedCodingProblem,
):

    return {

        # --------------------------------------------------
        # Canonical problem
        # --------------------------------------------------

        "title": problem.title,

        "statement": problem.statement,

        "category": problem.category,

        "difficulty": problem.difficulty,

        "constraints": problem.constraints,

        "examples": [
            example.model_dump()
            for example in problem.examples
        ],

        "approaches": [
            approach.model_dump()
            for approach in problem.approaches
        ],

        "optimal_approach": (
            problem.optimal_approach
        ),

        "common_mistakes": (
            problem.common_mistakes
        ),

        "hints": (
            problem.hints
        ),

        "test_cases": [
            test_case.model_dump()
            for test_case in problem.test_cases
        ],

        # --------------------------------------------------
        # Persistent coding knowledge
        # --------------------------------------------------

        "problem_identity": (
            problem.problem_identity
        ),

        "core_intuition": (
            problem.core_intuition
        ),

        "primary_pattern": (
            problem.primary_pattern
        ),

        "secondary_patterns": (
            normalize_string_list(
                problem.secondary_patterns
            )
        ),

        "recognition_signals": (
            normalize_string_list(
                problem.recognition_signals
            )
        ),

        "when_to_use": (
            normalize_string_list(
                problem.when_to_use
            )
        ),

        "when_not_to_use": (
            normalize_string_list(
                problem.when_not_to_use
            )
        ),

        "key_concepts": (
            normalize_string_list(
                problem.key_concepts
            )
        ),

        "important_observations": (
            normalize_string_list(
                problem.important_observations
            )
        ),

        "edge_cases": (
            normalize_string_list(
                problem.edge_cases
            )
        ),

        "interviewer_focus": (
            normalize_string_list(
                problem.interviewer_focus
            )
        ),

        "follow_up_questions": (
            normalize_string_list(
                problem.follow_up_questions
            )
        ),

        "strong_candidate_signals": (
            normalize_string_list(
                problem.strong_candidate_signals
            )
        ),

        "weak_candidate_signals": (
            normalize_string_list(
                problem.weak_candidate_signals
            )
        ),
    }


# ==========================================================
# Extract + Save
# ==========================================================

def extract_and_save_problem(
    db,
    research_results: List[Dict[str, Any]],
    source: str = "web_research",
    source_url: str = None,
):

    extracted = extract_problem(
        research_results
    )

    if not extracted:

        return {
            "status": "failed",
            "problem": None,
        }

    data = extracted_problem_to_dict(
        extracted
    )

    problem = save_researched_problem(
        db=db,

        # --------------------------------------------------
        # Canonical problem
        # --------------------------------------------------

        title=data["title"],

        statement=data["statement"],

        category=data["category"],

        difficulty=data["difficulty"],

        constraints=data["constraints"],

        examples=data["examples"],

        optimal_approach=data[
            "optimal_approach"
        ],

        common_mistakes=data[
            "common_mistakes"
        ],

        hints=data["hints"],

        approaches=data["approaches"],

        test_cases=data["test_cases"],

        source=source,

        source_url=source_url,

        # --------------------------------------------------
        # Persistent knowledge
        # --------------------------------------------------

        problem_identity=data[
            "problem_identity"
        ],

        core_intuition=data[
            "core_intuition"
        ],

        primary_pattern=data[
            "primary_pattern"
        ],

        secondary_patterns=data[
            "secondary_patterns"
        ],

        recognition_signals=data[
            "recognition_signals"
        ],

        when_to_use=data[
            "when_to_use"
        ],

        when_not_to_use=data[
            "when_not_to_use"
        ],

        key_concepts=data[
            "key_concepts"
        ],

        important_observations=data[
            "important_observations"
        ],

        edge_cases=data[
            "edge_cases"
        ],

        interviewer_focus=data[
            "interviewer_focus"
        ],

        follow_up_questions=data[
            "follow_up_questions"
        ],

        strong_candidate_signals=data[
            "strong_candidate_signals"
        ],

        weak_candidate_signals=data[
            "weak_candidate_signals"
        ],
    )

    return {
        "status": "saved",
        "problem": problem,
    }