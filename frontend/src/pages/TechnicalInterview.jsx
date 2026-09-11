import { useEffect, useRef, useState } from "react";
import "./SpecializedInterview.css";

const API =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const TECHNICAL_TOPICS = [
  "Data Structures & Algorithms",
  "OOP",
  "DBMS",
  "SQL",
  "Operating Systems",
  "Computer Networks",
  "Python",
  "C++",
  "Java",
  "JavaScript",
  "FastAPI",
  "Backend Development",
  "REST APIs",
  "Docker",
  "Git & GitHub",
  "System Design",
  "Concurrency",
  "Distributed Systems",
  "Machine Learning",
  "React",
];

function speak(text) {
  if (!text || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
}

function TechnicalInterview() {
  const [setup, setSetup] = useState(true);

  const [role, setRole] = useState("Backend Developer");
  const [company, setCompany] = useState("");

  const [selectedTopics, setSelectedTopics] = useState([
    "Python",
    "DBMS",
    "SQL",
    "Operating Systems",
    "Computer Networks",
    "Backend Development",
    "REST APIs",
  ]);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [sessionId, setSessionId] = useState(null);
  const [number, setNumber] = useState(0);
  const [max, setMax] = useState(6);

  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const [clarify, setClarify] = useState("");
  const [message, setMessage] = useState("");

  const [finalFeedback, setFinalFeedback] = useState(null);

  const recognition = useRef(null);

  const toggleTopic = (topic) => {
    setSelectedTopics((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : [...current, topic]
    );
  };

  const selectAllTopics = () => {
    setSelectedTopics([...TECHNICAL_TOPICS]);
  };

  const clearTopics = () => {
    setSelectedTopics([]);
  };

  const start = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      /*
       * If the candidate does not manually select subjects,
       * send the complete technical subject list.
       *
       * The backend can then choose suitable questions based
       * on the target role.
       */
      const topics = selectedTopics.length
        ? selectedTopics
        : TECHNICAL_TOPICS;

      const res = await fetch(
        `${API}/api/interview/modes/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: "technical",
            role: role || "Software Engineer",
            company,
            topics,
            max_questions: Number(max) || 6,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail ||
            "Could not start technical interview."
        );
      }

      setSessionId(data.session_id);
      setQuestion(data.current_question || "");
      setNumber(data.question_number || 1);
      setMax(data.max_questions || max);

      setSetup(false);

      if (data.current_question) {
        setTimeout(() => {
          speak(data.current_question);
        }, 200);
      }
    } catch (err) {
      setMessage(
        err.message ||
          "Could not start technical interview."
      );
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    if (!answer.trim() || loading || !sessionId) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${API}/api/interview/modes/${sessionId}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answer: answer.trim(),
            action: "answer",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail ||
            "Could not process answer."
        );
      }

      setAnswer("");

      if (data.completed) {
        setFinalFeedback(
          data.final_feedback || {
            overall_score: 0,
            summary: "Interview completed.",
          }
        );

        setQuestion("");
        return;
      }

      const nextQuestion =
        data.next_question ||
        data.current_question ||
        "";

      setQuestion(nextQuestion);

      setNumber(
        data.question_number ||
          number + 1
      );

      if (nextQuestion) {
        setTimeout(() => {
          speak(nextQuestion);
        }, 200);
      }
    } catch (err) {
      setMessage(
        err.message ||
          "Could not process answer."
      );
    } finally {
      setLoading(false);
    }
  };

  const ask = async () => {
    if (
      !clarify.trim() ||
      loading ||
      !sessionId
    ) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${API}/api/interview/modes/${sessionId}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answer: clarify.trim(),
            action: "clarification",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail ||
            "Could not answer clarification."
        );
      }

      const reply =
        data.interviewer_response ||
        "Sure, let's continue.";

      setClarify("");
      setMessage(reply);

      speak(reply);
    } catch (err) {
      setMessage(
        err.message ||
          "Could not answer clarification."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    const SR =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SR) {
      setMessage(
        "Speech recognition is not supported. You can type your answer."
      );
      return;
    }

    if (listening) {
      recognition.current?.stop();
      return;
    }

    const r = new SR();

    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";

    r.onresult = (ev) => {
      let text = "";

      for (
        let i = ev.resultIndex;
        i < ev.results.length;
        i++
      ) {
        text +=
          ev.results[i][0].transcript;
      }

      setAnswer((prev) =>
        `${prev} ${text}`.trim()
      );
    };

    r.onstart = () => {
      setListening(true);
      setMessage("");
    };

    r.onend = () => {
      setListening(false);
    };

    r.onerror = (event) => {
      setListening(false);

      if (event.error !== "aborted") {
        setMessage(
          "Microphone input stopped."
        );
      }
    };

    recognition.current = r;

    try {
      r.start();
    } catch (_) {}
  };

  useEffect(() => {
    return () => {
      try {
        recognition.current?.stop();
      } catch (_) {}

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /*
   * ========================================================
   * SETUP SCREEN
   * ========================================================
   */

  if (setup) {
    return (
      <div className="special-page">
        <div className="special-card setup-card">
          <p className="eyebrow">
            PLACEMENT AI
          </p>

          <h1>
            Technical Interview
          </h1>

          <p className="muted">
            Choose the technical subjects you want to
            practice. The AI interviewer will generate
            questions from the selected subjects and adapt
            the difficulty based on your answers.
          </p>

          <form
            onSubmit={start}
            className="special-form"
          >
            <label>
              Target Role

              <input
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                placeholder="e.g. Backend Developer"
              />
            </label>

            <label>
              Company{" "}
              <span className="optional">
                Optional
              </span>

              <input
                value={company}
                onChange={(e) =>
                  setCompany(e.target.value)
                }
                placeholder="e.g. Amazon"
              />
            </label>

            {/* =================================================
                TECHNICAL SUBJECT PICKER
            ================================================= */}

            <div className="technical-topic-picker">
              <div className="topic-picker-header">
                <div>
                  <strong>
                    Technical Subjects
                  </strong>

                  <span>
                    Select what you want the AI
                    interviewer to test.
                  </span>
                </div>

                <span className="topic-count">
                  {selectedTopics.length} selected
                </span>
              </div>

              <div
                className="topic-picker-actions"
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="secondary"
                  onClick={selectAllTopics}
                >
                  Select All
                </button>

                <button
                  type="button"
                  className="secondary"
                  onClick={clearTopics}
                >
                  Clear
                </button>
              </div>

              <div className="technical-topic-grid">
                {TECHNICAL_TOPICS.map(
                  (topic) => {
                    const selected =
                      selectedTopics.includes(
                        topic
                      );

                    return (
                      <button
                        type="button"
                        key={topic}
                        className={`technical-topic-chip${
                          selected
                            ? " selected"
                            : ""
                        }`}
                        onClick={() =>
                          toggleTopic(topic)
                        }
                      >
                        <span>
                          {selected
                            ? "✓"
                            : "○"}
                        </span>

                        {topic}
                      </button>
                    );
                  }
                )}
              </div>

              <p
                className="muted"
                style={{
                  marginTop: "12px",
                  fontSize: "13px",
                }}
              >
                Examples: OS, DBMS, CN, SQL, DSA,
                OOP, Python, C++, Java, Backend,
                APIs, Docker and System Design.
              </p>
            </div>

            {/* =================================================
                QUESTION COUNT
            ================================================= */}

            <label>
              Number of Questions

              <input
                type="number"
                min="1"
                max="10"
                value={max}
                onChange={(e) => {
                  const value =
                    Number(e.target.value);

                  setMax(
                    Math.min(
                      10,
                      Math.max(
                        1,
                        value || 1
                      )
                    )
                  );
                }}
              />
            </label>

            {message && (
              <div className="error">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                !role.trim()
              }
            >
              {loading
                ? "Starting..."
                : "Start Technical Interview →"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /*
   * ========================================================
   * COMPLETION SCREEN
   * ========================================================
   */

  if (finalFeedback) {
    return (
      <div className="special-page">
        <div className="special-card completion">
          <p className="eyebrow">
            INTERVIEW COMPLETE
          </p>

          <h1>
            Technical Round Finished
          </h1>

          <div className="score">
            {finalFeedback.overall_score ?? 0}

            <small>/10</small>
          </div>

          <p>
            {finalFeedback.summary ||
              "Your technical interview has been completed."}
          </p>

          {finalFeedback.strengths?.length >
            0 && (
            <div className="feedback-section">
              <h3>Strengths</h3>

              <ul>
                {finalFeedback.strengths.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {finalFeedback.weaknesses?.length >
            0 && (
            <div className="feedback-section">
              <h3>
                Areas to Improve
              </h3>

              <ul>
                {finalFeedback.weaknesses.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              (window.location.href = "/")
            }
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /*
   * ========================================================
   * LIVE INTERVIEW SCREEN
   * ========================================================
   */

  return (
    <div className="special-page">
      <div className="special-shell">
        <header className="special-header">
          <div>
            <span className="eyebrow">
              TECHNICAL INTERVIEW
            </span>

            <h1>
              {role ||
                "Software Engineer"}
            </h1>

            {company && (
              <p className="muted">
                {company}
              </p>
            )}
          </div>

          <span className="progress">
            Question {number} / {max}
          </span>
        </header>

        <main className="interview-grid">
          <section className="special-card question-card">
            <span className="eyebrow">
              AI INTERVIEWER
            </span>

            <h2>
              {question}
            </h2>

            <button
              type="button"
              className="secondary"
              onClick={() =>
                speak(question)
              }
            >
              🔊 Repeat Question
            </button>
          </section>

          <section className="special-card answer-card">
            <div className="card-title">
              <h2>Your Answer</h2>

              <button
                type="button"
                className={
                  listening
                    ? "voice active"
                    : "voice"
                }
                onClick={toggleVoice}
              >
                {listening
                  ? "⏹ Stop Listening"
                  : "🎤 Speak Answer"}
              </button>
            </div>

            <textarea
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value)
              }
              placeholder="Explain your thinking clearly..."
              onKeyDown={(e) => {
                if (
                  e.ctrlKey &&
                  e.key === "Enter"
                ) {
                  e.preventDefault();
                  send();
                }
              }}
            />

            <button
              type="button"
              onClick={send}
              disabled={
                loading ||
                !answer.trim()
              }
            >
              {loading
                ? "Thinking..."
                : "Submit Answer →"}
            </button>

            <div className="ask-box">
              <strong>
                Ask Interviewer
              </strong>

              <input
                value={clarify}
                onChange={(e) =>
                  setClarify(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter"
                  ) {
                    e.preventDefault();
                    ask();
                  }
                }}
                placeholder="e.g. Can we assume all numbers are positive?"
              />

              <button
                type="button"
                className="secondary"
                onClick={ask}
                disabled={
                  !clarify.trim() ||
                  loading
                }
              >
                Ask
              </button>
            </div>

            {message && (
              <div className="info">
                {message}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default TechnicalInterview;