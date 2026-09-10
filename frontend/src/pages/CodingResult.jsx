import { useMemo, useState } from "react";
import "./CodingResult.css";

function CodingResult() {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const record = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("coding_assessment_result") || "null"
      );
    } catch {
      return null;
    }
  }, []);

  const results = record?.results || [];
  const assessment = record?.assessment || {};
  const questions = assessment?.questions || [];

  const attempted = results.filter((item) => item?.submitted !== false && (item?.question_number != null || item?.problem_id != null)).length;
  const solved = results.filter((item) => Boolean(item?.passed ?? item?.accepted)).length;

  const totalPassed = results.reduce((sum, item) => {
    const visiblePassed = Number(
      item?.passed_tests ??
      item?.visible_passed_tests ??
      item?.execution?.passed_tests ??
      item?.execution?.visible_passed_tests ??
      0
    );

    const hiddenPassed = Number(
      item?.hidden_passed_tests ??
      item?.hidden_tests_passed ??
      item?.execution?.hidden_passed_tests ??
      item?.execution?.hidden_tests_passed ??
      0
    );

    return sum + visiblePassed + hiddenPassed;
  }, 0);

  const totalTests = results.reduce((sum, item) => {
    const visibleTotal = Number(
      item?.total_tests ??
      item?.visible_total_tests ??
      item?.execution?.total_tests ??
      item?.execution?.visible_total_tests ??
      0
    );

    const hiddenTotal = Number(
      item?.hidden_total_tests ??
      item?.hidden_tests_total ??
      item?.execution?.hidden_total_tests ??
      item?.execution?.hidden_tests_total ??
      0
    );

    return sum + visibleTotal + hiddenTotal;
  }, 0);

  const accuracy =
    totalTests > 0
      ? Math.round((totalPassed / totalTests) * 100)
      : results.length > 0
      ? Math.round((solved / results.length) * 100)
      : 0;

  const scores = results
    .map((item) =>
      Number(
        item?.score ??
        item?.overall_score ??
        item?.judgement?.score ??
        item?.judgement?.overall_score
      )
    )
    .filter((score) => Number.isFinite(score));

  const averageScore =
    scores.length > 0
      ? (
          scores.reduce((sum, score) => sum + score, 0) /
          scores.length
        ).toFixed(1)
      : results.length > 0
      ? ((solved / results.length) * 10).toFixed(1)
      : "—";

  const storedOverallScore = Number(
    record?.overall_score ?? assessment?.overall_score
  );

  const overallScore =
    Number.isFinite(storedOverallScore) &&
    (storedOverallScore !== 0 || solved === 0 || results.length === 0)
      ? storedOverallScore.toFixed(1)
      : averageScore;

  const allStrengths = [
    ...new Set(
      results.flatMap((item) => item?.judgement?.strengths || [])
    ),
  ];

  const allWeaknesses = [
    ...new Set(
      results.flatMap((item) => item?.judgement?.weaknesses || [])
    ),
  ];

  const recommendations = [
    ...new Set(
      results.flatMap((item) => item?.judgement?.recommendations || [])
    ),
  ];

  const getResultForQuestion = (index, question) =>
    results.find((item) => {
      const sameQuestionNumber =
        item?.question_number != null &&
        Number(item.question_number) === index + 1;

      const sameProblemId =
        question?.problem_id != null &&
        item?.problem_id != null &&
        String(item.problem_id) === String(question.problem_id);

      return sameQuestionNumber || sameProblemId;
    });

  if (!record) {
    return (
      <div className="coding-result-page">
        <div className="result-empty">
          <h1>No assessment result found</h1>
          <p>
            Complete a coding assessment first to view its feedback.
          </p>
          <button onClick={() => { window.location.href = "/start-coding"; }}>
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="coding-result-page">
      <header className="result-topbar">
        <div>
          <div className="result-eyebrow">AI CODING ASSESSMENT</div>
          <h1>Assessment Complete</h1>
          <p>
            Your coding performance and AI feedback are ready to review.
          </p>
        </div>

        <div className="result-topbar-actions">
          <button
            className="result-secondary-button"
            onClick={() => { window.location.href = "/coding-history"; }}
          >
            Assessment History
          </button>
          <button
            className="result-secondary-button"
            onClick={() => { window.location.href = "/start-coding"; }}
          >
            New Assessment
          </button>
        </div>
      </header>

      <main className="result-container">
        <section className="score-hero">
          <div>
            <div className="score-label">Overall Score</div>
            <div className="score-value">
              {overallScore}
              {overallScore !== "—" && (
                <span className="score-out-of">/10</span>
              )}
            </div>
            <p>
              {solved} of {questions.length || results.length} questions
              solved successfully.
            </p>
          </div>

          <div className="score-ring">
            <strong>{accuracy}%</strong>
            <span>Accuracy</span>
          </div>
        </section>

        <section className="result-stats">
          <div>
            <span>Questions attempted</span>
            <strong>{attempted}</strong>
          </div>
          <div>
            <span>Questions solved</span>
            <strong>{solved}</strong>
          </div>
          <div>
            <span>Test accuracy</span>
            <strong>{accuracy}%</strong>
          </div>
          <div>
            <span>Average AI score</span>
            <strong>{averageScore}</strong>
          </div>
        </section>

        <section className="result-card">
          <div className="result-card-heading">
            <div>
              <h2>Question-by-question feedback</h2>
              <p>
                Select a question to review its execution result and AI
                evaluation.
              </p>
            </div>
          </div>

          <div className="question-result-list">
            {(questions.length > 0 ? questions : results).map(
              (question, index) => {
                const item =
                  getResultForQuestion(index, question) ||
                  (questions.length ? null : question);

                const isSelected = selectedQuestion === index;

                return (
                  <div
                    key={question.problem_id || index}
                    className={`question-result-row ${
                      isSelected ? "selected" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="question-result-row-trigger"
                      onClick={() =>
                        setSelectedQuestion(
                          isSelected ? null : index
                        )
                      }
                      aria-expanded={isSelected}
                    >
                    <span className="question-result-number">
                      Q{index + 1}
                    </span>

                    <span className="question-result-title">
                      <strong>
                        {question.title || "Coding Problem"}
                      </strong>
                      <small>
                        {question.category ||
                          item?.judgement?.approach_name ||
                          "Coding assessment"}
                      </small>
                    </span>

                    <span
                      className={`question-result-status ${
                        item?.passed ? "passed" : "failed"
                      }`}
                    >
                      {item?.passed ? "Passed" : "Needs improvement"}
                    </span>

                    <span className="question-result-score">
                      {item?.score ?? "—"}
                    </span>

                    <span className="question-result-chevron">
                      {isSelected ? "−" : "+"}
                    </span>
                    </button>

                    {isSelected && (
                      <div
                        className="question-feedback-panel"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="feedback-test-summary">
                          <strong>
                            {item?.passed_tests || 0} /{" "}
                            {item?.total_tests || 0}
                          </strong>
                          <span>tests passed</span>
                        </div>

                        {item?.feedback && (
                          <div className="feedback-block">
                            <h4>AI Feedback</h4>
                            <p>{item.feedback}</p>
                          </div>
                        )}

                        {item?.judgement?.time_complexity && (
                          <div className="feedback-metrics">
                            <div>
                              <span>Time</span>
                              <strong>
                                {item.judgement.time_complexity}
                              </strong>
                            </div>
                            <div>
                              <span>Space</span>
                              <strong>
                                {item.judgement.space_complexity || "—"}
                              </strong>
                            </div>
                            <div>
                              <span>Optimal</span>
                              <strong>
                                {item.judgement.optimal === undefined
                                  ? "—"
                                  : item.judgement.optimal
                                  ? "Yes"
                                  : "No"}
                              </strong>
                            </div>
                          </div>
                        )}

                        {item?.judgement?.strengths?.length > 0 && (
                          <div className="feedback-block">
                            <h4>Strengths</h4>
                            <ul>
                              {item.judgement.strengths.map(
                                (strength, strengthIndex) => (
                                  <li key={strengthIndex}>
                                    {strength}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                        {item?.judgement?.weaknesses?.length > 0 && (
                          <div className="feedback-block">
                            <h4>Areas to improve</h4>
                            <ul>
                              {item.judgement.weaknesses.map(
                                (weakness, weaknessIndex) => (
                                  <li key={weaknessIndex}>
                                    {weakness}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                        {item?.interviewer?.question && (
                          <div className="feedback-interviewer">
                            <strong>AI Interviewer</strong>
                            <p>{item.interviewer.question}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </section>

        {(allStrengths.length > 0 ||
          allWeaknesses.length > 0 ||
          recommendations.length > 0) && (
          <section className="feedback-columns">
            {allStrengths.length > 0 && (
              <div className="result-card">
                <h2>Overall strengths</h2>
                <ul>
                  {allStrengths.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {allWeaknesses.length > 0 && (
              <div className="result-card">
                <h2>Focus areas</h2>
                <ul>
                  {allWeaknesses.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="result-card">
                <h2>Recommended practice</h2>
                <ul>
                  {recommendations.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        <section className="result-card result-summary">
          <h2>Assessment summary</h2>
          <p>
            {assessment.summary ||
              record.summary ||
              "Review the question-level feedback above to understand your strengths and the areas that need more practice."}
          </p>

          <div className="result-actions">
            <button
              className="result-primary-button"
              onClick={() => { window.location.href = "/start-coding"; }}
            >
              Take Another Assessment
            </button>
            <button
              className="result-secondary-button"
              onClick={() => { window.location.href = "/"; }}
            >
              Back to Home
            </button>
          </div>
        </section>

        <div className="result-session-id">
          Session: {record.assessment_id || "current assessment"}
          {record.completed_at && (
            <> · Completed {new Date(record.completed_at).toLocaleString()}</>
          )}
        </div>
      </main>
    </div>
  );
}

export default CodingResult;
