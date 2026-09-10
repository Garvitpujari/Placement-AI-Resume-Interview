import { useMemo, useState } from "react";
import "./CodingHistory.css";

const HISTORY_KEY = "coding_assessment_history";
const RESULT_KEY = "coding_assessment_result";


function parseBoolean(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "1", "yes", "passed", "pass", "accepted"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no", "failed", "fail", "rejected"].includes(normalized)) {
      return false;
    }
  }

  return Boolean(value);
}

function readHistory() {
  try {
    const raw = localStorage.getItem(
      HISTORY_KEY
    );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function getMode(session) {
  return (
    session?.assessment?.mode ||
    session?.mode ||
    ""
  ).toLowerCase();
}

function getSessionGroup(session) {
  const mode = getMode(session);

  if (
    mode === "company_oa" ||
    mode === "company" ||
    mode === "oa"
  ) {
    return "oa";
  }

  if (
    mode === "contest"
  ) {
    return "contest";
  }

  return "practice";
}

function getGroupLabel(group) {
  if (group === "oa") {
    return "Company OA";
  }

  if (group === "contest") {
    return "Contest";
  }

  return "Practice";
}

function getSessionNumber(
  session,
  history
) {
  const group =
    getSessionGroup(session);

  const sameGroup = history.filter(
    (item) =>
      getSessionGroup(item) ===
      group
  );

  const index =
    sameGroup.findIndex(
      (item) =>
        item === session ||
        item?.history_id ===
          session?.history_id
    );

  return index >= 0
    ? index + 1
    : 1;
}

function getSessionTitle(
  session,
  history
) {
  const group =
    getSessionGroup(session);

  const number =
    getSessionNumber(
      session,
      history
    );

  if (group === "oa") {
    return `OA ${number}`;
  }

  if (group === "contest") {
    return `Contest ${number}`;
  }

  return `Practice ${number}`;
}

function getAssessmentName(session) {
  const assessment =
    session?.assessment || {};

  if (
    assessment.company &&
    assessment.role
  ) {
    return `${assessment.company} · ${assessment.role}`;
  }

  if (assessment.company) {
    return assessment.company;
  }

  if (assessment.role) {
    return assessment.role;
  }

  if (assessment.topics) {
    if (
      Array.isArray(
        assessment.topics
      ) &&
      assessment.topics.length > 0
    ) {
      return assessment.topics.join(
        ", "
      );
    }
  }

  return getGroupLabel(
    getSessionGroup(session)
  );
}

function getResults(session) {
  return Array.isArray(
    session?.results
  )
    ? session.results
    : [];
}

function getPassedCount(session) {
  return getResults(session).filter((result) => {
    const value =
      result?.passed ??
      result?.execution?.passed;

    return parseBoolean(value) === true;
  }).length;
}

function getQuestionCount(session) {
  return getResults(session).length;
}

function getHiddenStats(session) {
  const results =
    getResults(session);

  let passed = 0;
  let total = 0;
  let failed = 0;
  let hasStats = false;

  for (const result of results) {
    const execution =
      result?.execution || {};

    const hiddenPassed =
      result?.hidden_passed_tests ??
      result?.hidden_tests_passed ??
      execution?.hidden_passed_tests ??
      execution?.hidden_tests_passed;

    const hiddenTotal =
      result?.hidden_total_tests ??
      result?.hidden_tests_total ??
      execution?.hidden_total_tests ??
      execution?.hidden_tests_total;

    const hiddenFailedDirect =
      result?.hidden_failed_tests ??
      result?.hidden_tests_failed ??
      execution?.hidden_failed_tests ??
      execution?.hidden_tests_failed;

    if (
      hiddenPassed !== null &&
      hiddenPassed !== undefined &&
      hiddenTotal !== null &&
      hiddenTotal !== undefined
    ) {
      hasStats = true;

      passed += Number(
        hiddenPassed
      );

      total += Number(
        hiddenTotal
      );

      if (
        hiddenFailedDirect !==
          null &&
        hiddenFailedDirect !==
          undefined
      ) {
        failed += Number(
          hiddenFailedDirect
        );
      } else {
        failed += Math.max(
          0,
          Number(hiddenTotal) -
            Number(hiddenPassed)
        );
      }
    }
  }

  if (!hasStats) {
    return null;
  }

  return {
    passed,
    total,
    failed,
  };
}

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Date unavailable";
  }

  return date.toLocaleString();
}

function getCompletedAt(session) {
  return (
    session?.completed_at ||
    session?.assessment
      ?.completed_at ||
    session?.created_at ||
    session?.assessment
      ?.created_at ||
    null
  );
}

function getSessionStatus(session) {
  const results =
    getResults(session);

  if (results.length === 0) {
    return "No results";
  }

  const passed =
    getPassedCount(session);

  if (passed === results.length) {
    return "All questions passed";
  }

  return `${passed}/${results.length} questions passed`;
}

function CodingHistory() {

  const [history, setHistory] =
    useState(() =>
      readHistory()
    );

  const [filter, setFilter] =
    useState("all");

  const filteredHistory =
    useMemo(() => {
      if (filter === "all") {
        return history;
      }

      return history.filter(
        (session) =>
          getSessionGroup(
            session
          ) === filter
      );
    }, [history, filter]);

  function openSession(session) {
    /*
     * CodingResult reads the selected
     * session from coding_assessment_result.
     */
    localStorage.setItem(
      RESULT_KEY,
      JSON.stringify({
        assessment:
          session.assessment ||
          {},
        results:
          session.results ||
          [],
        completed: true,
        history_id:
          session.history_id ||
          null,
        completed_at:
          session.completed_at ||
          null,
      })
    );

    if (
      session.assessment_id
    ) {
      localStorage.setItem(
        "coding_assessment_id",
        String(
          session.assessment_id
        )
      );
    }

    window.location.href = "/coding-result";
  }

  function clearHistory() {
    const confirmed =
      window.confirm(
        "Delete all coding assessment history from this browser?"
      );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      HISTORY_KEY
    );

    setHistory([]);
  }

  return (
    <div className="coding-history-page">
      <header className="coding-history-header">
        <div>
          <p className="coding-history-eyebrow">
            CODING PRACTICE
          </p>

          <h1>
            Coding History
          </h1>

          <p className="coding-history-subtitle">
            Every completed coding session
            has its own report. OA,
            practice and contest feedback
            stay separate.
          </p>
        </div>

        <div className="coding-history-actions">
          <button
            className="coding-history-new-button"
            onClick={() =>
              window.location.href = "/start-coding"
            }
          >
            New Assessment
          </button>

          {history.length > 0 && (
            <button
              className="coding-history-clear-button"
              onClick={clearHistory}
            >
              Clear History
            </button>
          )}
        </div>
      </header>

      <main className="coding-history-main">
        <div className="coding-history-filters">
          <button
            className={
              filter === "all"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("all")
            }
          >
            All
          </button>

          <button
            className={
              filter === "oa"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("oa")
            }
          >
            Company OA
          </button>

          <button
            className={
              filter === "practice"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter(
                "practice"
              )
            }
          >
            Practice
          </button>

          <button
            className={
              filter === "contest"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter(
                "contest"
              )
            }
          >
            Contest
          </button>
        </div>

        {filteredHistory.length ===
          0 ? (
          <section className="coding-history-empty">
            <div className="coding-history-empty-icon">
              ⌁
            </div>

            <h2>
              No completed sessions yet
            </h2>

            <p>
              Complete a coding assessment
              and its detailed report will
              appear here.
            </p>

            <button
              onClick={() =>
                window.location.href = "/start-coding"
              }
            >
              Start Your First Session →
            </button>
          </section>
        ) : (
          <section className="coding-history-list">
            {filteredHistory.map(
              (
                session,
                index
              ) => {
                const results =
                  getResults(
                    session
                  );

                const passed =
                  getPassedCount(
                    session
                  );

                const questionCount =
                  getQuestionCount(
                    session
                  );

                const hidden =
                  getHiddenStats(
                    session
                  );

                const title =
                  getSessionTitle(
                    session,
                    history
                  );

                const group =
                  getSessionGroup(
                    session
                  );

                return (
                  <article
                    className="coding-history-card"
                    key={
                      session?.history_id ||
                      session?.assessment_id ||
                      index
                    }
                  >
                    <div className="coding-history-card-main">
                      <div className="coding-history-card-title-row">
                        <div>
                          <span
                            className={`coding-history-type ${group}`}
                          >
                            {getGroupLabel(
                              group
                            )}
                          </span>

                          <h2>
                            {title}
                          </h2>

                          <p className="coding-history-assessment-name">
                            {getAssessmentName(
                              session
                            )}
                          </p>
                        </div>

                        <span className="coding-history-date">
                          {formatDate(
                            getCompletedAt(
                              session
                            )
                          )}
                        </span>
                      </div>

                      <div className="coding-history-stats">
                        <div>
                          <span>
                            Questions
                          </span>

                          <strong>
                            {questionCount}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Passed
                          </span>

                          <strong>
                            {passed}/
                            {questionCount}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Status
                          </span>

                          <strong>
                            {getSessionStatus(
                              session
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Hidden Tests
                          </span>

                          <strong>
                            {hidden
                              ? `${hidden.passed}/${hidden.total}`
                              : "Evaluated"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Hidden Failed
                          </span>

                          <strong>
                            {hidden
                              ? hidden.failed
                              : "—"}
                          </strong>
                        </div>
                      </div>

                      <div className="coding-history-question-preview">
                        {results
                          .slice(
                            0,
                            4
                          )
                          .map(
                            (
                              result,
                              resultIndex
                            ) => {
                              const resultPassed =
                                parseBoolean(
                                  result?.passed ??
                                    result?.execution
                                      ?.passed
                                ) === true;

                              return (
                                <span
                                  key={
                                    result?.problem_id ||
                                    resultIndex
                                  }
                                  className={
                                    resultPassed
                                      ? "passed"
                                      : "failed"
                                  }
                                >
                                  Q
                                  {resultIndex +
                                    1}{" "}
                                  ·{" "}
                                  {resultPassed
                                    ? "Passed"
                                    : "Failed"}
                                </span>
                              );
                            }
                          )}

                        {results.length >
                          4 && (
                          <span className="more">
                            +
                            {results.length -
                              4}{" "}
                            more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="coding-history-card-footer">
                      <button
                        className="coding-history-view-button"
                        onClick={() =>
                          openSession(
                            session
                          )
                        }
                      >
                        View Detailed Feedback →
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default CodingHistory;