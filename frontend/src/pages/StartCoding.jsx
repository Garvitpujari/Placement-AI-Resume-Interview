// import { useState } from "react";
// import "./StartCoding.css";

// const API_BASE = "http://127.0.0.1:8000";

// function StartCoding() {
//   const [mode, setMode] = useState("personalized");
//   const [company, setCompany] = useState("");
//   const [role, setRole] = useState("");
//   const [topics, setTopics] = useState([]);
//   const [questionCount, setQuestionCount] = useState(4);
//   const [smartAI, setSmartAI] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const duration = questionCount * 15;

//   const topicOptions = [
//     "Arrays",
//     "Strings",
//     "Hashing",
//     "Linked List",
//     "Stack",
//     "Queue",
//     "Binary Search",
//     "Two Pointers",
//     "Sliding Window",
//     "Trees",
//     "Graphs",
//     "Dynamic Programming",
//   ];

//   const handleTopicToggle = (topic) => {
//     setTopics((current) =>
//       current.includes(topic)
//         ? current.filter((item) => item !== topic)
//         : [...current, topic]
//     );
//   };

//   const decreaseQuestions = () => {
//     setQuestionCount((current) => Math.max(1, current - 1));
//   };

//   const increaseQuestions = () => {
//     setQuestionCount((current) => Math.min(10, current + 1));
//   };

//   const handleStartAssessment = async () => {
//     setError("");

//     if (mode === "company_oa" && !company.trim()) {
//       setError("Please enter the company name.");
//       return;
//     }

//     if (mode === "personalized" && topics.length === 0) {
//       setError("Select at least one topic for personalized practice.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch(
//         `${API_BASE}/api/coding/assessment/create`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             mode,
//             company: company.trim() || null,
//             role: role.trim() || null,
//             topics,
//             question_count: questionCount,
//             interviewer_mode: smartAI ? "smart" : "off",
//             language: "cpp",
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.detail || "Unable to create coding assessment."
//         );
//       }

//       /*
//        * Store the assessment ID so the coding page can use it.
//        */
//       localStorage.setItem(
//         "coding_assessment_id",
//         data.assessment_id
//       );

//       localStorage.setItem(
//         "coding_assessment",
//         JSON.stringify(data)
//       );

//       /*
//        * Temporary navigation.
//        * The actual coding workspace will be created next.
//        */
//       window.location.href = "/coding-assessment";
//     } catch (err) {
//       setError(
//         err.message || "Something went wrong while starting the assessment."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div id="start-coding-page" className="start-coding-page">
//       <header id="coding-header" className="coding-header">
//         <button
//           id="coding-back-button"
//           className="coding-back-button"
//           onClick={() => window.history.back()}
//         >
//           ← Back
//         </button>

//         <div className="coding-header-title">
//           <h1>Start Coding</h1>
//           <p>Let AI create the right coding assessment for you.</p>
//         </div>
//       </header>

//       <main id="coding-assessment-container" className="coding-assessment-container">
//         <section
//           id="assessment-mode-section"
//           className="coding-section"
//         >
//           <div className="section-heading">
//             <h2>Choose your practice mode</h2>
//             <p>
//               AI will adapt the assessment according to your selected mode.
//             </p>
//           </div>

//           <div id="assessment-mode-options" className="assessment-mode-options">
//             <button
//               id="mode-company-oa"
//               className={`mode-card ${
//                 mode === "company_oa" ? "active" : ""
//               }`}
//               onClick={() => setMode("company_oa")}
//             >
//               <span className="mode-icon">🏢</span>

//               <span className="mode-card-content">
//                 <strong>Company OA</strong>
//                 <span>
//                   Practice questions similar to company online assessments.
//                 </span>
//               </span>
//             </button>

//             <button
//               id="mode-contest"
//               className={`mode-card ${
//                 mode === "contest" ? "active" : ""
//               }`}
//               onClick={() => setMode("contest")}
//             >
//               <span className="mode-icon">🏆</span>

//               <span className="mode-card-content">
//                 <strong>Contest</strong>
//                 <span>
//                   Solve a timed competitive-programming style assessment.
//                 </span>
//               </span>
//             </button>

//             <button
//               id="mode-personalized"
//               className={`mode-card ${
//                 mode === "personalized" ? "active" : ""
//               }`}
//               onClick={() => setMode("personalized")}
//             >
//               <span className="mode-icon">🧠</span>

//               <span className="mode-card-content">
//                 <strong>Personalized Practice</strong>
//                 <span>
//                   AI selects questions based on your coding history and weak
//                   areas.
//                 </span>
//               </span>
//             </button>
//           </div>
//         </section>

//         <section
//           id="assessment-details-section"
//           className="coding-section"
//         >
//           <div className="section-heading">
//             <h2>Assessment details</h2>
//             <p>
//               These details help the AI select the most relevant questions.
//             </p>
//           </div>

//           <div className="coding-form-grid">
//             <div id="company-field-container" className="coding-field">
//               <label htmlFor="company-input">
//                 Company
//                 <span className="optional-label">Optional</span>
//               </label>

//               <input
//                 id="company-input"
//                 type="text"
//                 placeholder="e.g. Microsoft, Amazon"
//                 value={company}
//                 onChange={(event) => setCompany(event.target.value)}
//               />
//             </div>

//             <div id="role-field-container" className="coding-field">
//               <label htmlFor="role-input">
//                 Role
//                 <span className="optional-label">Optional</span>
//               </label>

//               <input
//                 id="role-input"
//                 type="text"
//                 placeholder="e.g. Software Engineer"
//                 value={role}
//                 onChange={(event) => setRole(event.target.value)}
//               />
//             </div>
//           </div>
//         </section>

//         {mode === "personalized" && (
//           <section
//             id="topics-section"
//             className="coding-section"
//           >
//             <div className="section-heading">
//               <h2>Choose topics</h2>
//               <p>
//                 Select the areas you want the AI to focus on.
//               </p>
//             </div>

//             <div id="topic-options" className="topic-options">
//               {topicOptions.map((topic) => (
//                 <button
//                   key={topic}
//                   id={`topic-${topic
//                     .toLowerCase()
//                     .replaceAll(" ", "-")}`}
//                   className={`topic-chip ${
//                     topics.includes(topic) ? "selected" : ""
//                   }`}
//                   onClick={() => handleTopicToggle(topic)}
//                 >
//                   {topics.includes(topic) && (
//                     <span className="topic-check">✓</span>
//                   )}

//                   {topic}
//                 </button>
//               ))}
//             </div>
//           </section>
//         )}

//         <section
//           id="assessment-settings-section"
//           className="coding-section"
//         >
//           <div className="section-heading">
//             <h2>Assessment settings</h2>
//             <p>
//               AI can automatically determine the best difficulty and question
//               mix.
//             </p>
//           </div>

//           <div className="coding-settings-grid">
//             <div
//               id="question-count-control"
//               className="setting-card"
//             >
//               <div className="setting-card-header">
//                 <div>
//                   <strong>Questions</strong>
//                   <span>
//                     Choose between 1 and 10 questions.
//                   </span>
//                 </div>
//               </div>

//               <div className="question-counter">
//                 <button
//                   id="decrease-question-count"
//                   className="counter-button"
//                   onClick={decreaseQuestions}
//                   disabled={questionCount <= 1}
//                 >
//                   −
//                 </button>

//                 <span
//                   id="question-count-value"
//                   className="question-count-value"
//                 >
//                   {questionCount}
//                 </span>

//                 <button
//                   id="increase-question-count"
//                   className="counter-button"
//                   onClick={increaseQuestions}
//                   disabled={questionCount >= 10}
//                 >
//                   +
//                 </button>
//               </div>
//             </div>

//             <div
//               id="assessment-duration"
//               className="setting-card"
//             >
//               <div className="setting-card-header">
//                 <div>
//                   <strong>Estimated time</strong>
//                   <span>
//                     Automatically adjusted with question count.
//                   </span>
//                 </div>
//               </div>

//               <div
//                 id="duration-value"
//                 className="duration-value"
//               >
//                 {duration}
//                 <span>minutes</span>
//               </div>
//             </div>

//             <div
//               id="difficulty-setting"
//               className="setting-card"
//             >
//               <div className="setting-card-header">
//                 <div>
//                   <strong>Difficulty</strong>
//                   <span>
//                     AI decides the best difficulty mix.
//                   </span>
//                 </div>
//               </div>

//               <div
//                 id="difficulty-value"
//                 className="ai-selected-value"
//               >
//                 ✨ AI Selected
//               </div>
//             </div>
//           </div>
//         </section>

//         <section
//           id="smart-ai-section"
//           className="coding-section"
//         >
//           <div
//             id="smart-ai-toggle-container"
//             className="smart-ai-card"
//           >
//             <div className="smart-ai-content">
//               <div className="smart-ai-icon">🤖</div>

//               <div>
//                 <h3>Smart AI Interviewer</h3>
//                 <p>
//                   AI may ask a small number of meaningful follow-up questions
//                   when your code or solution reasoning requires clarification.
//                 </p>
//               </div>
//             </div>

//             <button
//               id="smart-ai-toggle"
//               className={`toggle-button ${
//                 smartAI ? "enabled" : ""
//               }`}
//               onClick={() => setSmartAI((current) => !current)}
//               aria-label="Toggle Smart AI Interviewer"
//             >
//               <span className="toggle-circle" />
//             </button>
//           </div>
//         </section>

//         {error && (
//           <div
//             id="coding-assessment-error"
//             className="coding-assessment-error"
//           >
//             {error}
//           </div>
//         )}

//         <section
//           id="assessment-start-section"
//           className="assessment-start-section"
//         >
//           <div className="assessment-summary">
//             <span>
//               {questionCount} question
//               {questionCount !== 1 ? "s" : ""}
//             </span>

//             <span>•</span>

//             <span>{duration} minutes</span>

//             <span>•</span>

//             <span>
//               {smartAI ? "Smart AI enabled" : "AI interviewer off"}
//             </span>
//           </div>

//           <button
//             id="start-assessment-button"
//             className="start-assessment-button"
//             onClick={handleStartAssessment}
//             disabled={loading}
//           >
//             {loading
//               ? "Creating Assessment..."
//               : "Create My Assessment →"}
//           </button>
//         </section>
//       </main>
//     </div>
//   );
// }

// export default StartCoding;


// import { useState } from "react";
// import "./StartCoding.css";

// const API_BASE = "http://127.0.0.1:8000";

// function StartCoding() {
//   const [mode, setMode] = useState("personalized");
//   const [company, setCompany] = useState("");
//   const [role, setRole] = useState("");
//   const [topics, setTopics] = useState([]);
//   const [questionCount, setQuestionCount] = useState(4);
//   const [smartAI, setSmartAI] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const duration = questionCount * 15;

//   const topicOptions = [
//     "Arrays",
//     "Strings",
//     "Hashing",
//     "Linked List",
//     "Stack",
//     "Queue",
//     "Binary Search",
//     "Two Pointers",
//     "Sliding Window",
//     "Trees",
//     "Graphs",
//     "Dynamic Programming",
//   ];

//   const handleTopicToggle = (topic) => {
//     setTopics((current) =>
//       current.includes(topic)
//         ? current.filter((item) => item !== topic)
//         : [...current, topic]
//     );
//   };

//   const decreaseQuestions = () => {
//     setQuestionCount((current) => Math.max(1, current - 1));
//   };

//   const increaseQuestions = () => {
//     setQuestionCount((current) => Math.min(10, current + 1));
//   };

//   const openLatestFeedback = () => {
//     const latest = localStorage.getItem("coding_assessment_result");

//     if (!latest) {
//       setError(
//         "No completed coding assessment feedback is available yet. Complete an assessment first."
//       );
//       return;
//     }

//     window.location.href = "/coding-result";
//   };

//   const openAssessmentHistory = () => {
//     window.location.href = "/coding-history";
//   };

//   const handleStartAssessment = async () => {
//     setError("");

//     if (mode === "company_oa" && !company.trim()) {
//       setError("Please enter the company name.");
//       return;
//     }

//     if (mode === "personalized" && topics.length === 0) {
//       setError("Select at least one topic for personalized practice.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch(
//         `${API_BASE}/api/coding/assessment/create`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             mode,
//             company: company.trim() || null,
//             role: role.trim() || null,
//             topics,
//             question_count: questionCount,
//             interviewer_mode: smartAI ? "smart" : "off",
//             language: "cpp",
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.detail || "Unable to create coding assessment."
//         );
//       }

//       /*
//        * Store the assessment ID so the coding page can use it.
//        */
//       localStorage.setItem(
//         "coding_assessment_id",
//         data.assessment_id
//       );

//       localStorage.setItem(
//         "coding_assessment",
//         JSON.stringify(data)
//       );

//       /*
//        * Temporary navigation.
//        * The actual coding workspace will be created next.
//        */
//       window.location.href = "/coding-assessment";
//     } catch (err) {
//       setError(
//         err.message || "Something went wrong while starting the assessment."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div id="start-coding-page" className="start-coding-page">
//       <header id="coding-header" className="coding-header">
//         <button
//           id="coding-back-button"
//           className="coding-back-button"
//           onClick={() => window.history.back()}
//         >
//           ← Back
//         </button>

//         <div className="coding-header-title">
//           <h1>Start Coding</h1>
//           <p>Let AI create the right coding assessment for you.</p>
//         </div>

//         <div className="coding-header-actions">
//           <button
//             type="button"
//             className="coding-feedback-button"
//             onClick={openLatestFeedback}
//           >
//             View AI Feedback
//           </button>

//           <button
//             type="button"
//             className="coding-history-button"
//             onClick={openAssessmentHistory}
//           >
//             Assessment History
//           </button>
//         </div>
//       </header>

//       <main id="coding-assessment-container" className="coding-assessment-container">
//         <section
//           id="assessment-mode-section"
//           className="coding-section"
//         >
//           <div className="section-heading">
//             <h2>Choose your practice mode</h2>
//             <p>
//               AI will adapt the assessment according to your selected mode.
//             </p>
//           </div>

//           <div id="assessment-mode-options" className="assessment-mode-options">
//             <button
//               id="mode-company-oa"
//               className={`mode-card ${
//                 mode === "company_oa" ? "active" : ""
//               }`}
//               onClick={() => setMode("company_oa")}
//             >
//               <span className="mode-icon">🏢</span>

//               <span className="mode-card-content">
//                 <strong>Company OA</strong>
//                 <span>
//                   Practice questions similar to company online assessments.
//                 </span>
//               </span>
//             </button>

//             <button
//               id="mode-contest"
//               className={`mode-card ${
//                 mode === "contest" ? "active" : ""
//               }`}
//               onClick={() => setMode("contest")}
//             >
//               <span className="mode-icon">🏆</span>

//               <span className="mode-card-content">
//                 <strong>Contest</strong>
//                 <span>
//                   Solve a timed competitive-programming style assessment.
//                 </span>
//               </span>
//             </button>

//             <button
//               id="mode-personalized"
//               className={`mode-card ${
//                 mode === "personalized" ? "active" : ""
//               }`}
//               onClick={() => setMode("personalized")}
//             >
//               <span className="mode-icon">🧠</span>

//               <span className="mode-card-content">
//                 <strong>Personalized Practice</strong>
//                 <span>
//                   AI selects questions based on your coding history and weak
//                   areas.
//                 </span>
//               </span>
//             </button>
//           </div>
//         </section>

//         <section
//           id="assessment-details-section"
//           className="coding-section"
//         >
//           <div className="section-heading">
//             <h2>Assessment details</h2>
//             <p>
//               These details help the AI select the most relevant questions.
//             </p>
//           </div>

//           <div className="coding-form-grid">
//             <div id="company-field-container" className="coding-field">
//               <label htmlFor="company-input">
//                 Company
//                 <span className="optional-label">Optional</span>
//               </label>

//               <input
//                 id="company-input"
//                 type="text"
//                 placeholder="e.g. Microsoft, Amazon"
//                 value={company}
//                 onChange={(event) => setCompany(event.target.value)}
//               />
//             </div>

//             <div id="role-field-container" className="coding-field">
//               <label htmlFor="role-input">
//                 Role
//                 <span className="optional-label">Optional</span>
//               </label>

//               <input
//                 id="role-input"
//                 type="text"
//                 placeholder="e.g. Software Engineer"
//                 value={role}
//                 onChange={(event) => setRole(event.target.value)}
//               />
//             </div>
//           </div>
//         </section>

//         {mode === "personalized" && (
//           <section
//             id="topics-section"
//             className="coding-section"
//           >
//             <div className="section-heading">
//               <h2>Choose topics</h2>
//               <p>
//                 Select the areas you want the AI to focus on.
//               </p>
//             </div>

//             <div id="topic-options" className="topic-options">
//               {topicOptions.map((topic) => (
//                 <button
//                   key={topic}
//                   id={`topic-${topic
//                     .toLowerCase()
//                     .replaceAll(" ", "-")}`}
//                   className={`topic-chip ${
//                     topics.includes(topic) ? "selected" : ""
//                   }`}
//                   onClick={() => handleTopicToggle(topic)}
//                 >
//                   {topics.includes(topic) && (
//                     <span className="topic-check">✓</span>
//                   )}

//                   {topic}
//                 </button>
//               ))}
//             </div>
//           </section>
//         )}

//         <section
//           id="assessment-settings-section"
//           className="coding-section"
//         >
//           <div className="section-heading">
//             <h2>Assessment settings</h2>
//             <p>
//               AI can automatically determine the best difficulty and question
//               mix.
//             </p>
//           </div>

//           <div className="coding-settings-grid">
//             <div
//               id="question-count-control"
//               className="setting-card"
//             >
//               <div className="setting-card-header">
//                 <div>
//                   <strong>Questions</strong>
//                   <span>
//                     Choose between 1 and 10 questions.
//                   </span>
//                 </div>
//               </div>

//               <div className="question-counter">
//                 <button
//                   id="decrease-question-count"
//                   className="counter-button"
//                   onClick={decreaseQuestions}
//                   disabled={questionCount <= 1}
//                 >
//                   −
//                 </button>

//                 <span
//                   id="question-count-value"
//                   className="question-count-value"
//                 >
//                   {questionCount}
//                 </span>

//                 <button
//                   id="increase-question-count"
//                   className="counter-button"
//                   onClick={increaseQuestions}
//                   disabled={questionCount >= 10}
//                 >
//                   +
//                 </button>
//               </div>
//             </div>

//             <div
//               id="assessment-duration"
//               className="setting-card"
//             >
//               <div className="setting-card-header">
//                 <div>
//                   <strong>Estimated time</strong>
//                   <span>
//                     Automatically adjusted with question count.
//                   </span>
//                 </div>
//               </div>

//               <div
//                 id="duration-value"
//                 className="duration-value"
//               >
//                 {duration}
//                 <span>minutes</span>
//               </div>
//             </div>

//             <div
//               id="difficulty-setting"
//               className="setting-card"
//             >
//               <div className="setting-card-header">
//                 <div>
//                   <strong>Difficulty</strong>
//                   <span>
//                     AI decides the best difficulty mix.
//                   </span>
//                 </div>
//               </div>

//               <div
//                 id="difficulty-value"
//                 className="ai-selected-value"
//               >
//                 ✨ AI Selected
//               </div>
//             </div>
//           </div>
//         </section>

//         <section
//           id="smart-ai-section"
//           className="coding-section"
//         >
//           <div
//             id="smart-ai-toggle-container"
//             className="smart-ai-card"
//           >
//             <div className="smart-ai-content">
//               <div className="smart-ai-icon">🤖</div>

//               <div>
//                 <h3>Smart AI Interviewer</h3>
//                 <p>
//                   AI may ask a small number of meaningful follow-up questions
//                   when your code or solution reasoning requires clarification.
//                 </p>
//               </div>
//             </div>

//             <button
//               id="smart-ai-toggle"
//               className={`toggle-button ${
//                 smartAI ? "enabled" : ""
//               }`}
//               onClick={() => setSmartAI((current) => !current)}
//               aria-label="Toggle Smart AI Interviewer"
//             >
//               <span className="toggle-circle" />
//             </button>
//           </div>
//         </section>

//         {error && (
//           <div
//             id="coding-assessment-error"
//             className="coding-assessment-error"
//           >
//             {error}
//           </div>
//         )}

//         <section
//           id="assessment-review-section"
//           className="coding-section assessment-review-section"
//         >
//           <div className="assessment-review-content">
//             <div className="assessment-review-icon">📊</div>
//             <div>
//               <h2>Review your coding assessments</h2>
//               <p>
//                 Open your latest AI feedback or browse previous coding
//                 assessments, results, scores and question-level evaluations.
//               </p>
//             </div>
//           </div>

//           <div className="assessment-review-actions">
//             <button
//               type="button"
//               className="assessment-review-primary"
//               onClick={openLatestFeedback}
//             >
//               View Latest AI Feedback →
//             </button>

//             <button
//               type="button"
//               className="assessment-review-secondary"
//               onClick={openAssessmentHistory}
//             >
//               Browse Assessment History
//             </button>
//           </div>
//         </section>

//         <section
//           id="assessment-start-section"
//           className="assessment-start-section"
//         >
//           <div className="assessment-summary">
//             <span>
//               {questionCount} question
//               {questionCount !== 1 ? "s" : ""}
//             </span>

//             <span>•</span>

//             <span>{duration} minutes</span>

//             <span>•</span>

//             <span>
//               {smartAI ? "Smart AI enabled" : "AI interviewer off"}
//             </span>
//           </div>

//           <button
//             id="start-assessment-button"
//             className="start-assessment-button"
//             onClick={handleStartAssessment}
//             disabled={loading}
//           >
//             {loading
//               ? "Creating Assessment..."
//               : "Create My Assessment →"}
//           </button>
//         </section>
//       </main>
//     </div>
//   );
// }

// export default StartCoding;

import { useState } from "react";
import "./StartCoding.css";

const API_BASE = "http://127.0.0.1:8000";

function StartCoding() {
  const [mode, setMode] = useState("personalized");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [topics, setTopics] = useState([]);
  const [questionCount, setQuestionCount] = useState(4);
  const [smartAI, setSmartAI] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const duration = questionCount * 15;

  const topicOptions = [
    "Arrays",
    "Strings",
    "Hashing",
    "Linked List",
    "Stack",
    "Queue",
    "Binary Search",
    "Two Pointers",
    "Sliding Window",
    "Trees",
    "Graphs",
    "Dynamic Programming",
  ];

  const handleTopicToggle = (topic) => {
    setTopics((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : [...current, topic]
    );
  };

  const decreaseQuestions = () => {
    setQuestionCount((current) => Math.max(1, current - 1));
  };

  const increaseQuestions = () => {
    setQuestionCount((current) => Math.min(10, current + 1));
  };

  const openLatestFeedback = () => {
    const latest = localStorage.getItem("coding_assessment_result");

    if (!latest) {
      setError(
        "No completed coding assessment feedback is available yet. Complete an assessment first."
      );
      return;
    }

    window.location.href = "/coding-result";
  };

  const openAssessmentHistory = () => {
    window.location.href = "/coding-history";
  };

  const handleStartAssessment = async () => {
    setError("");

    if (mode === "company_oa" && !company.trim()) {
      setError("Please enter the company name.");
      return;
    }

    if (mode === "personalized" && topics.length === 0) {
      setError("Select at least one topic for personalized practice.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/coding/assessment/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode,
            company: company.trim() || null,
            role: role.trim() || null,
            topics,
            question_count: questionCount,
            interviewer_mode: smartAI ? "smart" : "off",
            language: "cpp",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to create coding assessment."
        );
      }

      /*
       * Store the assessment ID so the coding page can use it.
       */
      localStorage.setItem(
        "coding_assessment_id",
        data.assessment_id
      );

      localStorage.setItem(
        "coding_assessment",
        JSON.stringify(data)
      );

      /*
       * Temporary navigation.
       * The actual coding workspace will be created next.
       */
      window.location.href = "/coding-assessment";
    } catch (err) {
      setError(
        err.message || "Something went wrong while starting the assessment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="start-coding-page" className="start-coding-page">
      <header id="coding-header" className="coding-header">
        <button
          id="coding-back-button"
          className="coding-back-button"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>

        <div className="coding-header-title">
          <h1>Start Coding</h1>
          <p>Let AI create the right coding assessment for you.</p>
        </div>

        <div className="coding-header-actions">
          <button
            type="button"
            className="coding-feedback-button"
            onClick={openLatestFeedback}
          >
            View AI Feedback
          </button>

          <button
            type="button"
            className="coding-history-button"
            onClick={openAssessmentHistory}
          >
            Assessment History
          </button>
        </div>
      </header>

      <main id="coding-assessment-container" className="coding-assessment-container">
        <section
          id="assessment-mode-section"
          className="coding-section"
        >
          <div className="section-heading">
            <h2>Choose your practice mode</h2>
            <p>
              AI will adapt the assessment according to your selected mode.
            </p>
          </div>

          <div id="assessment-mode-options" className="assessment-mode-options">
            <button
              id="mode-company-oa"
              className={`mode-card ${
                mode === "company_oa" ? "active" : ""
              }`}
              onClick={() => setMode("company_oa")}
            >
              <span className="mode-icon">🏢</span>

              <span className="mode-card-content">
                <strong>Company OA</strong>
                <span>
                  Practice questions similar to company online assessments.
                </span>
              </span>
            </button>

            <button
              id="mode-contest"
              className={`mode-card ${
                mode === "contest" ? "active" : ""
              }`}
              onClick={() => setMode("contest")}
            >
              <span className="mode-icon">🏆</span>

              <span className="mode-card-content">
                <strong>Contest</strong>
                <span>
                  Solve a timed competitive-programming style assessment.
                </span>
              </span>
            </button>

            <button
              id="mode-personalized"
              className={`mode-card ${
                mode === "personalized" ? "active" : ""
              }`}
              onClick={() => setMode("personalized")}
            >
              <span className="mode-icon">🧠</span>

              <span className="mode-card-content">
                <strong>Personalized Practice</strong>
                <span>
                  AI selects questions based on your coding history and weak
                  areas.
                </span>
              </span>
            </button>
          </div>
        </section>

        <section
          id="assessment-details-section"
          className="coding-section"
        >
          <div className="section-heading">
            <h2>Assessment details</h2>
            <p>
              These details help the AI select the most relevant questions.
            </p>
          </div>

          <div className="coding-form-grid">
            <div id="company-field-container" className="coding-field">
              <label htmlFor="company-input">
                Company
                <span className="optional-label">Optional</span>
              </label>

              <input
                id="company-input"
                type="text"
                placeholder="e.g. Microsoft, Amazon"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
            </div>

            <div id="role-field-container" className="coding-field">
              <label htmlFor="role-input">
                Role
                <span className="optional-label">Optional</span>
              </label>

              <input
                id="role-input"
                type="text"
                placeholder="e.g. Software Engineer"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              />
            </div>
          </div>
        </section>

        {mode === "personalized" && (
          <section
            id="topics-section"
            className="coding-section"
          >
            <div className="section-heading">
              <h2>Choose topics</h2>
              <p>
                Select the areas you want the AI to focus on.
              </p>
            </div>

            <div id="topic-options" className="topic-options">
              {topicOptions.map((topic) => (
                <button
                  key={topic}
                  id={`topic-${topic
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                  className={`topic-chip ${
                    topics.includes(topic) ? "selected" : ""
                  }`}
                  onClick={() => handleTopicToggle(topic)}
                >
                  {topics.includes(topic) && (
                    <span className="topic-check">✓</span>
                  )}

                  {topic}
                </button>
              ))}
            </div>
          </section>
        )}

        <section
          id="assessment-settings-section"
          className="coding-section"
        >
          <div className="section-heading">
            <h2>Assessment settings</h2>
            <p>
              AI can automatically determine the best difficulty and question
              mix.
            </p>
          </div>

          <div className="coding-settings-grid">
            <div
              id="question-count-control"
              className="setting-card"
            >
              <div className="setting-card-header">
                <div>
                  <strong>Questions</strong>
                  <span>
                    Choose between 1 and 10 questions.
                  </span>
                </div>
              </div>

              <div className="question-counter">
                <button
                  id="decrease-question-count"
                  className="counter-button"
                  onClick={decreaseQuestions}
                  disabled={questionCount <= 1}
                >
                  −
                </button>

                <span
                  id="question-count-value"
                  className="question-count-value"
                >
                  {questionCount}
                </span>

                <button
                  id="increase-question-count"
                  className="counter-button"
                  onClick={increaseQuestions}
                  disabled={questionCount >= 10}
                >
                  +
                </button>
              </div>
            </div>

            <div
              id="assessment-duration"
              className="setting-card"
            >
              <div className="setting-card-header">
                <div>
                  <strong>Estimated time</strong>
                  <span>
                    Automatically adjusted with question count.
                  </span>
                </div>
              </div>

              <div
                id="duration-value"
                className="duration-value"
              >
                {duration}
                <span>minutes</span>
              </div>
            </div>

            <div
              id="difficulty-setting"
              className="setting-card"
            >
              <div className="setting-card-header">
                <div>
                  <strong>Difficulty</strong>
                  <span>
                    AI decides the best difficulty mix.
                  </span>
                </div>
              </div>

              <div
                id="difficulty-value"
                className="ai-selected-value"
              >
                ✨ AI Selected
              </div>
            </div>
          </div>
        </section>

        <section
          id="smart-ai-section"
          className="coding-section"
        >
          <div
            id="smart-ai-toggle-container"
            className="smart-ai-card"
          >
            <div className="smart-ai-content">
              <div className="smart-ai-icon">🤖</div>

              <div>
                <h3>Smart AI Interviewer</h3>
                <p>
                  AI may ask a small number of meaningful follow-up questions
                  when your code or solution reasoning requires clarification.
                </p>
              </div>
            </div>

            <button
              id="smart-ai-toggle"
              className={`toggle-button ${
                smartAI ? "enabled" : ""
              }`}
              onClick={() => setSmartAI((current) => !current)}
              aria-label="Toggle Smart AI Interviewer"
            >
              <span className="toggle-circle" />
            </button>
          </div>
        </section>

        {error && (
          <div
            id="coding-assessment-error"
            className="coding-assessment-error"
          >
            {error}
          </div>
        )}

        <section
          id="assessment-start-section"
          className="assessment-start-section"
        >
          <div className="assessment-summary">
            <span>
              {questionCount} question
              {questionCount !== 1 ? "s" : ""}
            </span>

            <span>•</span>

            <span>{duration} minutes</span>

            <span>•</span>

            <span>
              {smartAI ? "Smart AI enabled" : "AI interviewer off"}
            </span>
          </div>

          <button
            type="button"
            id="start-assessment-button"
            className="start-assessment-button"
            onClick={handleStartAssessment}
            disabled={loading}
          >
            {loading
              ? "Creating Assessment..."
              : "Create My Assessment →"}
          </button>
        </section>
      </main>
    </div>
  );
}

export default StartCoding;