"""
code_execution_service.py

Executes candidate code against coding-problem test cases.

Responsibilities:
- Compile C++ code.
- Execute compiled C++ code.
- Execute Python function-style candidate solutions.
- Run visible/hidden test cases.
- Capture stdout/stderr.
- Detect compilation/runtime errors.
- Measure execution time.
- Compare structured Python function results.
- Return a structured execution result.

This module does NOT:
- Decide whether an approach is optimal.
- Analyze candidate reasoning.
- Generate interviewer questions.
- Modify candidate code.
- Generate problems.

IMPORTANT:
This is a local-development execution layer.
Before exposing it through an API, we will need a
proper sandbox/container with CPU, memory, filesystem,
process, and timeout restrictions.
"""

import os
import subprocess
import tempfile
import time

from dataclasses import dataclass
from typing import List, Optional


from .coding_execution_adapter import (
    adapt_candidate_code,
    compare_function_result,
)


# ==========================================================
# Execution Result
# ==========================================================

@dataclass
class TestExecutionResult:
    """
    Result of executing candidate code against one test case.
    """

    passed: bool

    input_data: str

    expected_output: str

    actual_output: str = ""

    stdout: str = ""

    stderr: str = ""

    error: Optional[str] = None

    execution_time_ms: Optional[float] = None


@dataclass
class CodeExecutionResult:
    """
    Complete execution result for a candidate submission.
    """

    passed: bool

    passed_tests: int

    total_tests: int

    test_results: List[TestExecutionResult]

    stdout: str = ""

    stderr: str = ""

    error: Optional[str] = None

    execution_time_ms: Optional[float] = None


# ==========================================================
# Execution Limits
# ==========================================================

COMPILE_TIMEOUT_SECONDS = 30

EXECUTION_TIMEOUT_SECONDS = 5


SUPPORTED_LANGUAGES = {
    "cpp",
    "python",
}


# ==========================================================
# Output Normalization
# ==========================================================

def normalize_output(
    output: str,
) -> str:
    """
    Normalize raw program output.

    Used primarily for C++ / stdin-stdout execution.
    """

    if output is None:
        return ""

    lines = (
        output
        .replace("\r\n", "\n")
        .replace("\r", "\n")
        .split("\n")
    )

    lines = [
        line.rstrip()
        for line in lines
    ]

    return "\n".join(lines).strip()


# ==========================================================
# C++ Compilation
# ==========================================================

def compile_cpp(
    code: str,
    workdir: str,
):
    """
    Compile C++ source code using g++.

    Returns:

        (
            success,
            executable_path,
            stderr,
        )

    Requires g++ to be installed and available
    on PATH.
    """

    source_path = os.path.join(
        workdir,
        "main.cpp",
    )

    executable_path = os.path.join(
        workdir,
        "main.exe",
    )

    with open(
        source_path,
        "w",
        encoding="utf-8",
    ) as file:

        file.write(code)

    try:

        result = subprocess.run(
            [
                "g++",
                source_path,
                "-std=c++17",
                "-O2",
                "-o",
                executable_path,
            ],
            capture_output=True,
            text=True,
            timeout=COMPILE_TIMEOUT_SECONDS,
        )

    except FileNotFoundError:

        return (
            False,
            None,
            "g++ was not found. "
            "Install MinGW/GCC and add it to PATH.",
        )

    except subprocess.TimeoutExpired:

        return (
            False,
            None,
            "Compilation timed out.",
        )

    if result.returncode != 0:

        return (
            False,
            None,
            result.stderr,
        )

    return (
        True,
        executable_path,
        result.stderr,
    )


# ==========================================================
# Python Preparation
# ==========================================================

def prepare_python(
    code: str,
    workdir: str,
):
    """
    Save Python source code into the execution directory.
    """

    source_path = os.path.join(
        workdir,
        "main.py",
    )

    with open(
        source_path,
        "w",
        encoding="utf-8",
    ) as file:

        file.write(code)

    return source_path


# ==========================================================
# Execute One Test Case
# ==========================================================

def execute_test_case(
    executable,
    input_data: str,
    expected_output: str,
    language: str,
    function_mode: bool = False,
    unordered_output: bool = False,
):
    """
    Execute one test case.

    C++:
        Candidate program receives stdin and writes stdout.

    Python function mode:
        Candidate solution is wrapped by the execution
        adapter. JSON input is sent through stdin and the
        candidate function result is printed as JSON.
    """

    start_time = time.perf_counter()

    try:

        if language == "cpp":

            command = [
                executable,
            ]

        elif language == "python":

            command = [
                "python",
                executable,
            ]

        else:

            raise ValueError(
                f"Unsupported language: {language}"
            )

        process = subprocess.run(
            command,
            input=input_data,
            capture_output=True,
            text=True,
            timeout=EXECUTION_TIMEOUT_SECONDS,
        )

        execution_time_ms = (
            time.perf_counter()
            - start_time
        ) * 1000

        actual_output = normalize_output(
            process.stdout
        )

        expected = normalize_output(
            expected_output
        )

        # ==================================================
        # Compare Result
        # ==================================================

        if function_mode and language == "python":

            try:

                passed = (
                    process.returncode == 0
                    and compare_function_result(
                        actual_output=actual_output,
                        expected_output=expected,
                        unordered_output=(
                            unordered_output
                        ),
                    )
                )

            except Exception as exc:

                passed = False

                comparison_error = str(exc)

                error = comparison_error

            else:

                error = None

        else:

            passed = (
                process.returncode == 0
                and actual_output == expected
            )

            error = None

        # ==================================================
        # Runtime Error
        # ==================================================

        if process.returncode != 0:

            error = (
                process.stderr
                or "Program exited with "
                f"code {process.returncode}."
            )

        return TestExecutionResult(
            passed=passed,
            input_data=input_data,
            expected_output=expected,
            actual_output=actual_output,
            stdout=process.stdout,
            stderr=process.stderr,
            error=error,
            execution_time_ms=execution_time_ms,
        )

    except subprocess.TimeoutExpired as exc:

        execution_time_ms = (
            time.perf_counter()
            - start_time
        ) * 1000

        return TestExecutionResult(
            passed=False,
            input_data=input_data,
            expected_output=expected_output,
            actual_output="",
            stdout=(
                exc.stdout
                if exc.stdout
                else ""
            ),
            stderr=(
                exc.stderr
                if exc.stderr
                else ""
            ),
            error="Execution timed out.",
            execution_time_ms=execution_time_ms,
        )

    except Exception as exc:

        execution_time_ms = (
            time.perf_counter()
            - start_time
        ) * 1000

        return TestExecutionResult(
            passed=False,
            input_data=input_data,
            expected_output=expected_output,
            actual_output="",
            stdout="",
            stderr="",
            error=str(exc),
            execution_time_ms=execution_time_ms,
        )


# ==========================================================
# Execute Candidate Code
# ==========================================================

def execute_code(
    code: str,
    language: str,
    test_cases,
    problem_title: Optional[str] = None,
):
    """
    Compile and execute candidate code against all
    supplied test cases.

    Parameters:

        code:
            Candidate submission.

        language:
            cpp or python.

        test_cases:
            Objects containing:

                input
                expected_output
                hidden

        problem_title:
            Coding problem title.

            When supplied for Python, the candidate is
            treated as a function-style interview solution.

            Example:

                Group Anagrams
                    ↓
                group_anagrams(...)

            When omitted, Python keeps the legacy
            stdin/stdout behavior.
    """

    language = language.lower().strip()

    if language not in SUPPORTED_LANGUAGES:

        raise ValueError(
            f"Unsupported language: {language}"
        )

    if not code.strip():

        raise ValueError(
            "Candidate code is empty."
        )

    if not test_cases:

        raise ValueError(
            "No test cases supplied."
        )

    print(
        "\n======================================"
    )

    print(
        "CODE EXECUTION"
    )

    print(
        "======================================"
    )

    print(
        f"Language: {language}"
    )

    print(
        f"Test cases: {len(test_cases)}"
    )

    # ======================================================
    # Python Interview Mode
    # ======================================================

    function_mode = (
        language == "python"
        and bool(problem_title)
    )

    unordered_output = False

    executable_code = code

    if function_mode:

        class ProblemTitleProxy:
            """
            Minimal object required by the adapter.
            """

            def __init__(
                self,
                title,
            ):
                self.title = title

                # Statement is intentionally absent here.
                # The adapter currently determines the
                # function name from the title.
                self.statement = ""

        problem_proxy = ProblemTitleProxy(
            problem_title
        )

        adapted = adapt_candidate_code(
            problem=problem_proxy,
            candidate_code=code,
        )

        executable_code = adapted["code"]

        # --------------------------------------------------
        # Group Anagrams and other unordered-output
        # problems need semantic comparison.
        #
        # The adapter itself can determine this from the
        # problem statement when a full problem object is
        # supplied. Since this low-level function receives
        # only the title, preserve the known Group Anagrams
        # contract here.
        # --------------------------------------------------

        unordered_output = (
            problem_title.strip().lower()
            in {
                "group anagrams",
            }
        )

        print(
            f"Python function mode: ON"
        )

        print(
            f"Function: "
            f"{adapted['function_name']}"
        )

        print(
            f"Unordered output: "
            f"{unordered_output}"
        )

    # ======================================================
    # Temporary Workspace
    # ======================================================

    with tempfile.TemporaryDirectory(
        prefix="placement_coding_"
    ) as workdir:

        # ==================================================
        # Prepare Program
        # ==================================================

        if language == "cpp":

            (
                compiled,
                executable,
                compile_error,
            ) = compile_cpp(
                code=code,
                workdir=workdir,
            )

            if not compiled:

                print(
                    "Compilation failed."
                )

                return CodeExecutionResult(
                    passed=False,
                    passed_tests=0,
                    total_tests=len(test_cases),
                    test_results=[],
                    stdout="",
                    stderr=compile_error or "",
                    error=compile_error,
                    execution_time_ms=0.0,
                )

        else:

            executable = prepare_python(
                code=executable_code,
                workdir=workdir,
            )

        # ==================================================
        # Execute Test Cases
        # ==================================================

        results = []

        total_execution_time = 0.0

        for index, test_case in enumerate(
            test_cases,
            start=1,
        ):

            print(
                f"Running test case "
                f"{index}/{len(test_cases)}..."
            )

            result = execute_test_case(
                executable=executable,
                input_data=test_case.input,
                expected_output=(
                    test_case.expected_output
                ),
                language=language,
                function_mode=function_mode,
                unordered_output=unordered_output,
            )

            results.append(result)

            if result.execution_time_ms:

                total_execution_time += (
                    result.execution_time_ms
                )

            print(
                f"Result: "
                f"{'PASS' if result.passed else 'FAIL'}"
            )

            if result.error:

                print(
                    f"Error: {result.error}"
                )

        # ==================================================
        # Summary
        # ==================================================

        passed_tests = sum(
            1
            for result in results
            if result.passed
        )

        total_tests = len(results)

        passed = (
            passed_tests == total_tests
        )

        print(
            "\n--------------------------------------"
        )

        print(
            f"Passed: "
            f"{passed_tests}/{total_tests}"
        )

        print(
            f"Status: "
            f"{'PASS' if passed else 'FAIL'}"
        )

        print(
            f"Execution time: "
            f"{total_execution_time:.2f} ms"
        )

        print(
            "======================================"
        )

        # ==================================================
        # Aggregate Output
        # ==================================================

        stdout = "\n".join(
            result.stdout
            for result in results
            if result.stdout
        )

        stderr = "\n".join(
            result.stderr
            for result in results
            if result.stderr
        )

        errors = [
            result.error
            for result in results
            if result.error
        ]

        return CodeExecutionResult(
            passed=passed,
            passed_tests=passed_tests,
            total_tests=total_tests,
            test_results=results,
            stdout=stdout,
            stderr=stderr,
            error=(
                "\n".join(errors)
                if errors
                else None
            ),
            execution_time_ms=(
                total_execution_time
            ),
        )