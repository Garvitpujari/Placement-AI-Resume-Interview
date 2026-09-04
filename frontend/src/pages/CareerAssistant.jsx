import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./CareerAssistant.css";

const API_URL = "http://127.0.0.1:8000";

function CareerAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function returnToDashboard() {
    window.location.href = "/";
  }

  async function sendMessage(event) {
    event?.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: message,
    };

    const historyForApi = [...messages, userMessage]
      .slice(-12)
      .map(({ role, content }) => ({
        role,
        content,
      }));

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("message", message);

      formData.append(
        "chat_history",
        JSON.stringify(historyForApi),
      );

      const response = await fetch(
        `${API_URL}/api/career/chat`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Career Assistant request failed.",
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content:
            data.response ||
            "I could not generate a response.",
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          content:
            error.message ||
            "Something went wrong. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage(event);
    }
  }

  function clearChat() {
    if (loading) {
      return;
    }

    setMessages([]);
    setInput("");

    textareaRef.current?.focus();
  }

  return (
    <div
      className="career-assistant-page"
      id="career-assistant-page"
    >
      {/* ====================================================
          HEADER
      ==================================================== */}

      <header
        className="career-assistant-header"
        id="career-assistant-header"
      >
        <div
          className="career-assistant-header-left"
          id="career-assistant-header-left"
        >
          <button
            id="career-dashboard-button"
            className="career-dashboard-button"
            type="button"
            onClick={returnToDashboard}
          >
            ← Dashboard
          </button>

          <div
            className="career-assistant-title-block"
            id="career-assistant-title-block"
          >
            <h1 id="career-assistant-title">
              AI Career Assistant
            </h1>

            <p id="career-assistant-subtitle">
              Your personalized placement preparation
              companion
            </p>
          </div>
        </div>

        <button
          id="career-clear-chat-button"
          className="career-clear-chat-button"
          type="button"
          onClick={clearChat}
          disabled={
            loading ||
            messages.length === 0
          }
        >
          Clear Chat
        </button>
      </header>

      {/* ====================================================
          MAIN CHAT AREA
      ==================================================== */}

      <main
        className="career-assistant-main"
        id="career-assistant-main"
      >
        <section
          id="career-chat-container"
          className="career-chat-container"
        >
          {/* ==================================================
              WELCOME
          ================================================== */}

          {messages.length === 0 && (
            <div
              id="career-welcome"
              className="career-welcome"
            >
              <div className="career-welcome-icon">
                AI
              </div>

              <h2>
                How can I help with your career?
              </h2>

              <p>
                Ask me about your placement preparation,
                weaknesses, interview skills, coding
                practice, or what you should focus on next.
              </p>

              <div
                className="career-suggestions"
                id="career-suggestions"
              >
                <button
                  type="button"
                  onClick={() =>
                    setInput(
                      "What should I improve for my placements?",
                    )
                  }
                >
                  What should I improve?
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setInput(
                      "What are my current weaknesses?",
                    )
                  }
                >
                  What are my weaknesses?
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setInput(
                      "What should I focus on this week?",
                    )
                  }
                >
                  What should I focus on?
                </button>
              </div>
            </div>
          )}

          {/* ==================================================
              MESSAGES
          ================================================== */}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`career-message-row ${
                message.role === "user"
                  ? "career-message-row-user"
                  : "career-message-row-assistant"
              }`}
            >
              <div
                className={`career-message ${
                  message.role === "user"
                    ? "career-user-message"
                    : "career-assistant-message"
                } ${
                  message.error
                    ? "career-error-message"
                    : ""
                }`}
              >
                <div className="career-message-label">
                  {message.role === "user"
                    ? "You"
                    : "AI Career Assistant"}
                </div>

                {/* ==================================================
                    MARKDOWN RESPONSE
                ================================================== */}

                <div className="career-message-content">
                  {message.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* ==================================================
              THINKING
          ================================================== */}

          {loading && (
            <div
              id="career-thinking"
              className="career-message-row career-message-row-assistant"
            >
              <div className="career-message career-assistant-message">
                <div className="career-message-label">
                  AI Career Assistant
                </div>

                <div className="career-thinking">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </section>

        {/* ====================================================
            INPUT
        ==================================================== */}

        <form
          id="career-chat-form"
          className="career-chat-form"
          onSubmit={sendMessage}
        >
          <textarea
            id="career-message-input"
            ref={textareaRef}
            className="career-message-input"
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask your career assistant..."
            rows={1}
            disabled={loading}
          />

          <button
            id="career-send-button"
            className="career-send-button"
            type="submit"
            disabled={
              !input.trim() || loading
            }
          >
            {loading ? "..." : "Send"}
          </button>
        </form>

        <p
          className="career-input-hint"
          id="career-input-hint"
        >
          Press Enter to send • Shift + Enter for a
          new line
        </p>
      </main>
    </div>
  );
}

export default CareerAssistant;