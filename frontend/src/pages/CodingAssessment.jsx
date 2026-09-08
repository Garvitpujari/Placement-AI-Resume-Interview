
// // // // // import React, {
// // // // //   useCallback,
// // // // //   useEffect,
// // // // //   useMemo,
// // // // //   useRef,
// // // // //   useState,
// // // // // } from "react";
// // // // // import "./CodingAssessment.css";

// // // // // const API_BASE = "http://127.0.0.1:8000";

// // // // // const ASSESSMENT_ID_KEY = "coding_assessment_id";
// // // // // const ASSESSMENT_KEY = "coding_assessment";
// // // // // const HISTORY_KEY = "coding_assessment_history";

// // // // // function safeJsonParse(value, fallback = null) {
// // // // //   if (typeof value !== "string") {
// // // // //     return value ?? fallback;
// // // // //   }

// // // // //   try {
// // // // //     return JSON.parse(value);
// // // // //   } catch {
// // // // //     return fallback;
// // // // //   }
// // // // // }

// // // // // function normalizeArray(value) {
// // // // //   if (Array.isArray(value)) {
// // // // //     return value;
// // // // //   }

// // // // //   if (typeof value === "string") {
// // // // //     const parsed = safeJsonParse(value, null);

// // // // //     if (Array.isArray(parsed)) {
// // // // //       return parsed;
// // // // //     }

// // // // //     return value
// // // // //       .split("\n")
// // // // //       .map((item) => item.trim())
// // // // //       .filter(Boolean);
// // // // //   }

// // // // //   return [];
// // // // // }

// // // // // function normalizeExamples(value) {
// // // // //   if (!value) {
// // // // //     return [];
// // // // //   }

// // // // //   let examples = value;

// // // // //   if (typeof examples === "string") {
// // // // //     examples = safeJsonParse(examples, null);

// // // // //     if (!examples) {
// // // // //       return [];
// // // // //     }
// // // // //   }

// // // // //   if (!Array.isArray(examples)) {
// // // // //     examples = [examples];
// // // // //   }

// // // // //   return examples
// // // // //     .map((example) => {
// // // // //       if (typeof example === "string") {
// // // // //         const parsed = safeJsonParse(example, null);

// // // // //         if (parsed && typeof parsed === "object") {
// // // // //           return parsed;
// // // // //         }

// // // // //         return {
// // // // //           input: example,
// // // // //         };
// // // // //       }

// // // // //       if (example && typeof example === "object") {
// // // // //         if (
// // // // //           typeof example.text === "string" &&
// // // // //           !example.input &&
// // // // //           !example.output
// // // // //         ) {
// // // // //           const nested = safeJsonParse(example.text, null);

// // // // //           if (Array.isArray(nested)) {
// // // // //             return nested[0] || example;
// // // // //           }

// // // // //           if (nested && typeof nested === "object") {
// // // // //             return nested;
// // // // //           }

// // // // //           return {
// // // // //             explanation: example.text,
// // // // //           };
// // // // //         }

// // // // //         return example;
// // // // //       }

// // // // //       return null;
// // // // //     })
// // // // //     .filter(Boolean);
// // // // // }

// // // // // function formatExampleInput(value) {
// // // // //   if (value === undefined || value === null) {
// // // // //     return "";
// // // // //   }

// // // // //   if (typeof value === "string") {
// // // // //     return value;
// // // // //   }

// // // // //   return JSON.stringify(value, null, 2);
// // // // // }

// // // // // function formatExampleOutput(value) {
// // // // //   if (value === undefined || value === null) {
// // // // //     return "";
// // // // //   }

// // // // //   if (typeof value === "string") {
// // // // //     return value;
// // // // //   }

// // // // //   return JSON.stringify(value, null, 2);
// // // // // }

// // // // // function formatTime(totalSeconds) {
// // // // //   const safeSeconds = Math.max(0, Number(totalSeconds) || 0);

// // // // //   const hours = Math.floor(safeSeconds / 3600);
// // // // //   const minutes = Math.floor((safeSeconds % 3600) / 60);
// // // // //   const seconds = safeSeconds % 60;

// // // // //   if (hours > 0) {
// // // // //     return `${String(hours).padStart(2, "0")}:${String(
// // // // //       minutes
// // // // //     ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
// // // // //   }

// // // // //   return `${String(minutes).padStart(2, "0")}:${String(
// // // // //     seconds
// // // // //   ).padStart(2, "0")}`;
// // // // // }

// // // // // function getAssessmentId() {
// // // // //   return (
// // // // //     localStorage.getItem(ASSESSMENT_ID_KEY) ||
// // // // //     safeJsonParse(localStorage.getItem(ASSESSMENT_KEY), {})?.assessment_id ||
// // // // //     null
// // // // //   );
// // // // // }

// // // // // function getStoredAssessment() {
// // // // //   return safeJsonParse(
// // // // //     localStorage.getItem(ASSESSMENT_KEY),
// // // // //     {}
// // // // //   );
// // // // // }

// // // // // function getAssessmentStartKey(assessmentId) {
// // // // //   return `coding_assessment_start_${assessmentId}`;
// // // // // }

// // // // // function getCodeKey(assessmentId, questionIndex) {
// // // // //   return `coding_assessment_code_${assessmentId}_${questionIndex}`;
// // // // // }

// // // // // function getSessionResultKey(assessmentId) {
// // // // //   return `coding_assessment_result_${assessmentId}`;
// // // // // }

// // // // // function extractAssessmentQuestion(payload) {
// // // // //   if (!payload) {
// // // // //     return null;
// // // // //   }

// // // // //   if (payload.question) {
// // // // //     return payload.question;
// // // // //   }

// // // // //   if (payload.current_question) {
// // // // //     return payload.current_question;
// // // // //   }

// // // // //   if (payload.next_question) {
// // // // //     return payload.next_question;
// // // // //   }

// // // // //   if (payload.assessment?.question) {
// // // // //     return payload.assessment.question;
// // // // //   }

// // // // //   return null;
// // // // // }

// // // // // function extractExecution(payload) {
// // // // //   if (!payload) {
// // // // //     return null;
// // // // //   }

// // // // //   return (
// // // // //     payload.execution ||
// // // // //     payload.result ||
// // // // //     payload.execution_result ||
// // // // //     null
// // // // //   );
// // // // // }

// // // // // function extractJudgement(payload) {
// // // // //   if (!payload) {
// // // // //     return null;
// // // // //   }

// // // // //   return (
// // // // //     payload.judgement ||
// // // // //     payload.solution_judgement ||
// // // // //     payload.evaluation ||
// // // // //     null
// // // // //   );
// // // // // }

// // // // // function extractInterviewer(payload) {
// // // // //   if (!payload) {
// // // // //     return null;
// // // // //   }

// // // // //   return (
// // // // //     payload.interviewer ||
// // // // //     payload.interviewer_event ||
// // // // //     payload.event ||
// // // // //     null
// // // // //   );
// // // // // }

// // // // // function getVisiblePassed(execution) {
// // // // //   if (!execution) {
// // // // //     return 0;
// // // // //   }

// // // // //   return Number(
// // // // //     execution.visible_passed_tests ??
// // // // //       execution.passed_tests ??
// // // // //       execution.passed ??
// // // // //       0
// // // // //   );
// // // // // }

// // // // // function getVisibleTotal(execution) {
// // // // //   if (!execution) {
// // // // //     return 0;
// // // // //   }

// // // // //   return Number(
// // // // //     execution.visible_total_tests ??
// // // // //       execution.total_tests ??
// // // // //       execution.tests?.length ??
// // // // //       0
// // // // //   );
// // // // // }

// // // // // function getHiddenPassed(execution) {
// // // // //   if (!execution) {
// // // // //     return 0;
// // // // //   }

// // // // //   return Number(
// // // // //     execution.hidden_passed_tests ??
// // // // //       execution.hidden_passed ??
// // // // //       0
// // // // //   );
// // // // // }

// // // // // function getHiddenTotal(execution) {
// // // // //   if (!execution) {
// // // // //     return 0;
// // // // //   }

// // // // //   return Number(
// // // // //     execution.hidden_total_tests ??
// // // // //       execution.hidden_total ??
// // // // //       0
// // // // //   );
// // // // // }

// // // // // function getHiddenFailed(execution) {
// // // // //   const passed = getHiddenPassed(execution);
// // // // //   const total = getHiddenTotal(execution);

// // // // //   if (!total) {
// // // // //     return Number(execution?.hidden_failed_tests ?? 0);
// // // // //   }

// // // // //   return Math.max(0, total - passed);
// // // // // }

// // // // // function isAccepted(judgement, execution) {
// // // // //   if (
// // // // //     judgement &&
// // // // //     typeof judgement.correct === "boolean"
// // // // //   ) {
// // // // //     return judgement.correct;
// // // // //   }

// // // // //   if (
// // // // //     execution &&
// // // // //     typeof execution.passed === "boolean"
// // // // //   ) {
// // // // //     return execution.passed;
// // // // //   }

// // // // //   return false;
// // // // // }

// // // // // function getStarterCode(question, assessmentId, questionIndex) {
// // // // //   const stored = localStorage.getItem(
// // // // //     getCodeKey(assessmentId, questionIndex)
// // // // //   );

// // // // //   // An empty saved editor value must NOT hide the default boilerplate.
// // // // //   if (typeof stored === "string" && stored.trim()) {
// // // // //     return stored;
// // // // //   }

// // // // //   const fallbackStarter = `#include <bits/stdc++.h>
// // // // // using namespace std;

// // // // // int main() {
// // // // //     // Enter the code here

// // // // //     return 0;
// // // // // }
// // // // // `;

// // // // //   // Prefer a real C++ starter only when it contains a main block.
// // // // //   // This keeps the assessment editor in stdin/stdout main()-based format.
// // // // //   const questionStarter =
// // // // //     typeof question?.starter_code === "string"
// // // // //       ? question.starter_code
// // // // //       : "";
// // // // //   const questionTemplate =
// // // // //     typeof question?.code_template === "string"
// // // // //       ? question.code_template
// // // // //       : "";

// // // // //   if (questionStarter.trim() && /\bint\s+main\s*\(/.test(questionStarter)) {
// // // // //     return questionStarter;
// // // // //   }

// // // // //   if (questionTemplate.trim() && /\bint\s+main\s*\(/.test(questionTemplate)) {
// // // // //     return questionTemplate;
// // // // //   }

// // // // //   return fallbackStarter;
// // // // // }

// // // // // function getSpeechRecognitionConstructor() {
// // // // //   return (
// // // // //     window.SpeechRecognition ||
// // // // //     window.webkitSpeechRecognition ||
// // // // //     null
// // // // //   );
// // // // // }

// // // // // function speakText(text, onEnd) {
// // // // //   if (!text) {
// // // // //     onEnd?.();
// // // // //     return;
// // // // //   }

// // // // //   if (!("speechSynthesis" in window)) {
// // // // //     onEnd?.();
// // // // //     return;
// // // // //   }

// // // // //   window.speechSynthesis.cancel();

// // // // //   const utterance = new SpeechSynthesisUtterance(text);

// // // // //   utterance.rate = 0.95;
// // // // //   utterance.pitch = 1;
// // // // //   utterance.volume = 1;

// // // // //   utterance.onend = () => {
// // // // //     onEnd?.();
// // // // //   };

// // // // //   utterance.onerror = () => {
// // // // //     onEnd?.();
// // // // //   };

// // // // //   window.speechSynthesis.speak(utterance);
// // // // // }


// // // // // const codingAssessmentFinalStyles = `
// // // // //   .topbar-action-button {
// // // // //     border: 1px solid rgba(255,255,255,.16);
// // // // //     background: rgba(255,255,255,.06);
// // // // //     color: inherit;
// // // // //     border-radius: 7px;
// // // // //     padding: 7px 10px;
// // // // //     font-size: 12px;
// // // // //     font-weight: 600;
// // // // //     cursor: pointer;
// // // // //     white-space: nowrap;
// // // // //   }
// // // // //   .topbar-action-button:hover { background: rgba(255,255,255,.12); }
// // // // //   .topbar-action-button.secondary { opacity: .9; }
// // // // //   .failed-tests-summary {
// // // // //     margin-top: 14px;
// // // // //     padding: 12px 14px;
// // // // //     border: 1px solid rgba(255,255,255,.10);
// // // // //     border-radius: 8px;
// // // // //     display: flex;
// // // // //     flex-direction: column;
// // // // //     gap: 4px;
// // // // //     font-size: 13px;
// // // // //   }
// // // // //   .failed-tests-summary span { opacity: .72; font-size: 12px; }
// // // // //   @media (max-width: 900px) {
// // // // //     .topbar-action-button { padding: 6px 8px; font-size: 11px; }
// // // // //   }
// // // // // `;

// // // // // if (typeof document !== "undefined" && !document.getElementById("coding-assessment-final-styles")) {
// // // // //   const style = document.createElement("style");
// // // // //   style.id = "coding-assessment-final-styles";
// // // // //   style.textContent = codingAssessmentFinalStyles;
// // // // //   document.head.appendChild(style);
// // // // // }

// // // // // export default function CodingAssessment() {

// // // // //   const [assessmentId, setAssessmentId] = useState(
// // // // //     getAssessmentId()
// // // // //   );

// // // // //   const [assessment, setAssessment] = useState(
// // // // //     getStoredAssessment()
// // // // //   );

// // // // //   const [question, setQuestion] = useState(null);

// // // // //   const [currentIndex, setCurrentIndex] = useState(0);

// // // // //   const [code, setCode] = useState("");

// // // // //   const [loading, setLoading] = useState(true);

// // // // //   const [running, setRunning] = useState(false);

// // // // //   const [submitting, setSubmitting] = useState(false);

// // // // //   const [error, setError] = useState("");

// // // // //   const [execution, setExecution] = useState(null);

// // // // //   const [visibleTestCases, setVisibleTestCases] = useState([]);

// // // // //   const [judgement, setJudgement] = useState(null);

// // // // //   const [submitResult, setSubmitResult] = useState(null);

// // // // //   const [canSubmit, setCanSubmit] = useState(false);

// // // // //   const [completedResults, setCompletedResults] =
// // // // //     useState([]);

// // // // //   const [secondsRemaining, setSecondsRemaining] =
// // // // //     useState(0);

// // // // //   const [assessmentFinished, setAssessmentFinished] =
// // // // //     useState(false);

// // // // //   const [timeExpired, setTimeExpired] =
// // // // //     useState(false);

// // // // //   const [interviewerQuestion, setInterviewerQuestion] =
// // // // //     useState("");

// // // // //   const [interviewerReason, setInterviewerReason] =
// // // // //     useState("");

// // // // //   const [showInterviewerPrompt, setShowInterviewerPrompt] =
// // // // //     useState(false);

// // // // //   const [interviewerOpen, setInterviewerOpen] =
// // // // //     useState(false);

// // // // //   const [interviewerState, setInterviewerState] =
// // // // //     useState("idle");

// // // // //   const [interviewerTranscript, setInterviewerTranscript] =
// // // // //     useState("");

// // // // //   const [interviewerResponse, setInterviewerResponse] =
// // // // //     useState("");

// // // // //   const [candidateQuestion, setCandidateQuestion] =
// // // // //     useState("");

// // // // //   const [voiceSupported, setVoiceSupported] =
// // // // //     useState(false);

// // // // //   const [liveObservation, setLiveObservation] =
// // // // //     useState(false);

// // // // //   const [jumpMessage, setJumpMessage] =
// // // // //     useState("");

// // // // //   const [showExamples, setShowExamples] =
// // // // //     useState(true);

// // // // //   const [showConstraints, setShowConstraints] =
// // // // //     useState(true);

// // // // //   const recognitionRef = useRef(null);

// // // // //   const liveTimerRef = useRef(null);

// // // // //   const mountedRef = useRef(true);
// // // // //   const interviewerGreetingShownRef = useRef(false);

// // // // //   const lastSubmittedCodeRef = useRef("");

// // // // //   const durationMinutes = Number(
// // // // //     assessment?.duration_minutes || 15
// // // // //   );

// // // // //   const questions = Array.isArray(
// // // // //     assessment?.questions
// // // // //   )
// // // // //     ? assessment.questions
// // // // //     : [];

// // // // //   const totalQuestions =
// // // // //     Number(
// // // // //       assessment?.question_count ||
// // // // //         questions.length ||
// // // // //         1
// // // // //     );

// // // // //   const examples = useMemo(
// // // // //     () => normalizeExamples(question?.examples),
// // // // //     [question?.examples]
// // // // //   );

// // // // //   const constraints = useMemo(
// // // // //     () => normalizeArray(question?.constraints),
// // // // //     [question?.constraints]
// // // // //   );

// // // // //   const visiblePassed = getVisiblePassed(execution);

// // // // //   const visibleTotal = getVisibleTotal(execution);

// // // // //   const hiddenPassed = getHiddenPassed(
// // // // //     submitResult?.execution || execution
// // // // //   );

// // // // //   const hiddenTotal = getHiddenTotal(
// // // // //     submitResult?.execution || execution
// // // // //   );

// // // // //   const hiddenFailed = getHiddenFailed(
// // // // //     submitResult?.execution || execution
// // // // //   );

// // // // //   const accepted = isAccepted(
// // // // //     judgement,
// // // // //     submitResult?.execution || execution
// // // // //   );

// // // // //   const executionStatus = useMemo(() => {
// // // // //     const message = String(execution?.error || "").toLowerCase();

// // // // //     if (!execution) {
// // // // //       return "idle";
// // // // //     }

// // // // //     if (
// // // // //       message.includes("timed out") ||
// // // // //       message.includes("time limit") ||
// // // // //       message.includes("timeout")
// // // // //     ) {
// // // // //       return "tle";
// // // // //     }

// // // // //     if (
// // // // //       message.includes("compilation") ||
// // // // //       message.includes("g++") ||
// // // // //       message.includes("error:") && !execution?.tests?.length
// // // // //     ) {
// // // // //       return "compile_error";
// // // // //     }

// // // // //     if (message || execution?.stderr) {
// // // // //       return "runtime_error";
// // // // //     }

// // // // //     if (execution?.passed) {
// // // // //       return "accepted";
// // // // //     }

// // // // //     return "wrong_answer";
// // // // //   }, [execution]);

// // // // //   const isCurrentCompleted =
// // // // //     completedResults.some(
// // // // //       (item) =>
// // // // //         Number(item?.question_number) ===
// // // // //         currentIndex + 1
// // // // //     );

// // // // //   const clearInterviewer = useCallback(() => {
// // // // //     if (recognitionRef.current) {
// // // // //       try {
// // // // //         recognitionRef.current.stop();
// // // // //       } catch {
// // // // //         // Ignore browser recognition stop errors.
// // // // //       }
// // // // //     }

// // // // //     recognitionRef.current = null;

// // // // //     if ("speechSynthesis" in window) {
// // // // //       window.speechSynthesis.cancel();
// // // // //     }

// // // // //     setInterviewerState("idle");
// // // // //   }, []);

// // // // //   const saveCode = useCallback(
// // // // //     (value) => {
// // // // //       setCode(value);

// // // // //       if (assessmentId !== null) {
// // // // //         localStorage.setItem(
// // // // //           getCodeKey(
// // // // //             assessmentId,
// // // // //             currentIndex
// // // // //           ),
// // // // //           value
// // // // //         );
// // // // //       }

// // // // //       setCanSubmit(false);

// // // // //       if (execution) {
// // // // //         setExecution(null);
// // // // //       }

// // // // //       if (submitResult) {
// // // // //         setSubmitResult(null);
// // // // //       }

// // // // //       if (judgement) {
// // // // //         setJudgement(null);
// // // // //       }
// // // // //     },
// // // // //     [
// // // // //       assessmentId,
// // // // //       currentIndex,
// // // // //       execution,
// // // // //       submitResult,
// // // // //       judgement,
// // // // //     ]
// // // // //   );

// // // // //   const loadQuestion = useCallback(
// // // // //     async (index = 0) => {
// // // // //       if (!assessmentId) {
// // // // //         setError(
// // // // //           "No active coding assessment was found."
// // // // //         );
// // // // //         setLoading(false);
// // // // //         return;
// // // // //       }

// // // // //       try {
// // // // //         setLoading(true);
// // // // //         setError("");

// // // // //         const assessmentResponse =
// // // // //           await fetch(
// // // // //             `${API_BASE}/api/coding/assessment/${assessmentId}`
// // // // //           );

// // // // //         if (assessmentResponse.ok) {
// // // // //           const assessmentData =
// // // // //             await assessmentResponse.json();

// // // // //           setAssessment(assessmentData);

// // // // //           localStorage.setItem(
// // // // //             ASSESSMENT_KEY,
// // // // //             JSON.stringify(assessmentData)
// // // // //           );

// // // // //           const storedSessionResult = safeJsonParse(
// // // // //             localStorage.getItem(
// // // // //               getSessionResultKey(assessmentId)
// // // // //             ),
// // // // //             null
// // // // //           );

// // // // //           if (
// // // // //             Array.isArray(storedSessionResult?.results)
// // // // //           ) {
// // // // //             setCompletedResults(
// // // // //               storedSessionResult.results
// // // // //             );
// // // // //           }

// // // // //           if (assessmentData.completed) {
// // // // //             setAssessmentFinished(true);
// // // // //             window.location.href = "/coding-result";
// // // // //             return;
// // // // //           }
// // // // //         }

// // // // //         const questionResponse =
// // // // //           await fetch(
// // // // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question?question_index=${index}`
// // // // //           );

// // // // //         if (!questionResponse.ok) {
// // // // //           const body =
// // // // //             await questionResponse.json().catch(
// // // // //               () => null
// // // // //             );

// // // // //           if (
// // // // //             body?.detail ===
// // // // //               "Assessment has already been completed." ||
// // // // //             body?.detail ===
// // // // //               "Assessment has no remaining questions."
// // // // //           ) {
// // // // //             setAssessmentFinished(true);
// // // // //             window.location.href = "/coding-result";
// // // // //             return;
// // // // //           }

// // // // //           throw new Error(
// // // // //             body?.detail ||
// // // // //               "Could not load assessment question."
// // // // //           );
// // // // //         }

// // // // //         const questionData =
// // // // //           await questionResponse.json();

// // // // //         const resolvedQuestion =
// // // // //           extractAssessmentQuestion(
// // // // //             questionData
// // // // //           ) || questionData;

// // // // //         setQuestion(resolvedQuestion);
// // // // //         setVisibleTestCases([]);

// // // // //         // Load the real candidate-visible test bank. If the endpoint is
// // // // //         // unavailable, keep the problem examples as a safe fallback.
// // // // //         const fallbackTests = normalizeExamples(
// // // // //           resolvedQuestion?.examples
// // // // //         ).map((item, itemIndex) => ({
// // // // //           test_number: itemIndex + 1,
// // // // //           input: item?.input ?? item?.stdin ?? "",
// // // // //           expected_output:
// // // // //             item?.expected_output ??
// // // // //             item?.output ??
// // // // //             item?.expected ??
// // // // //             "",
// // // // //           explanation: item?.explanation || "",
// // // // //         }));

// // // // //         try {
// // // // //           const testsResponse = await fetch(
// // // // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/tests?question_index=${index}`
// // // // //           );

// // // // //           if (testsResponse.ok) {
// // // // //             const testsData = await testsResponse.json();
// // // // //             const serverTests = Array.isArray(testsData?.tests)
// // // // //               ? testsData.tests
// // // // //               : [];
// // // // //             setVisibleTestCases(
// // // // //               serverTests.length ? serverTests : fallbackTests
// // // // //             );
// // // // //           } else {
// // // // //             setVisibleTestCases(fallbackTests);
// // // // //           }
// // // // //         } catch {
// // // // //           setVisibleTestCases(fallbackTests);
// // // // //         }

// // // // //         const resolvedIndex = Number(
// // // // //           resolvedQuestion?.question_number
// // // // //             ? resolvedQuestion.question_number - 1
// // // // //             : index
// // // // //         );

// // // // //         setCurrentIndex(
// // // // //           Math.max(0, resolvedIndex)
// // // // //         );

// // // // //         const savedCode =
// // // // //           localStorage.getItem(
// // // // //             getCodeKey(
// // // // //               assessmentId,
// // // // //               Math.max(0, resolvedIndex)
// // // // //             )
// // // // //           );

// // // // //         const starterCode =
// // // // //           getStarterCode(
// // // // //             resolvedQuestion,
// // // // //             assessmentId,
// // // // //             Math.max(0, resolvedIndex)
// // // // //           );

// // // // //         setCode(
// // // // //           typeof savedCode === "string" && savedCode.trim()
// // // // //             ? savedCode
// // // // //             : starterCode
// // // // //         );

// // // // //         setExecution(null);
// // // // //         setJudgement(null);
// // // // //         setSubmitResult(null);
// // // // //         setCanSubmit(false);

// // // // //         lastSubmittedCodeRef.current = "";

// // // // //         clearInterviewer();
// // // // //       } catch (err) {
// // // // //         if (mountedRef.current) {
// // // // //           setError(
// // // // //             err?.message ||
// // // // //               "Unable to load coding assessment."
// // // // //           );
// // // // //         }
// // // // //       } finally {
// // // // //         if (mountedRef.current) {
// // // // //           setLoading(false);
// // // // //         }
// // // // //       }
// // // // //     },
// // // // //     [
// // // // //       assessmentId,
// // // // //       clearInterviewer,
// // // // //     ]
// // // // //   );

// // // // //   useEffect(() => {
// // // // //     mountedRef.current = true;

// // // // //     const SpeechRecognition =
// // // // //       getSpeechRecognitionConstructor();

// // // // //     setVoiceSupported(
// // // // //       Boolean(SpeechRecognition)
// // // // //     );

// // // // //     return () => {
// // // // //       mountedRef.current = false;

// // // // //       if (liveTimerRef.current) {
// // // // //         clearTimeout(liveTimerRef.current);
// // // // //       }

// // // // //       clearInterviewer();
// // // // //     };
// // // // //   }, [clearInterviewer]);

// // // // //   useEffect(() => {
// // // // //     if (
// // // // //       !question ||
// // // // //       interviewerGreetingShownRef.current
// // // // //     ) {
// // // // //       return;
// // // // //     }

// // // // //     interviewerGreetingShownRef.current = true;

// // // // //     const greeting =
// // // // //       "Hi. Can you please solve this problem? Take a moment to understand it, then walk me through your approach. I will be here if you want to discuss any assumption or clarification.";

// // // // //     const timer = setTimeout(() => {
// // // // //       speakText(greeting);
// // // // //     }, 500);

// // // // //     return () => clearTimeout(timer);
// // // // //   }, [question]);

// // // // //   useEffect(() => {
// // // // //     if (
// // // // //       !question ||
// // // // //       interviewerGreetingShownRef.current
// // // // //     ) {
// // // // //       return;
// // // // //     }

// // // // //     interviewerGreetingShownRef.current = true;

// // // // //     const greeting =
// // // // //       "Hi. Can you please solve this problem? Take a moment to understand it, then walk me through your approach. I will be here if you want to discuss an assumption or ask me a question.";

// // // // //     const timer = setTimeout(() => {
// // // // //       speakText(greeting);
// // // // //     }, 600);

// // // // //     return () => clearTimeout(timer);
// // // // //   }, [question]);

// // // // //   useEffect(() => {
// // // // //     if (!assessmentId) {
// // // // //       return;
// // // // //     }

// // // // //     const startKey =
// // // // //       getAssessmentStartKey(assessmentId);

// // // // //     let startedAt =
// // // // //       Number(
// // // // //         localStorage.getItem(startKey)
// // // // //       ) || 0;

// // // // //     if (!startedAt) {
// // // // //       startedAt = Date.now();

// // // // //       localStorage.setItem(
// // // // //         startKey,
// // // // //         String(startedAt)
// // // // //       );
// // // // //     }

// // // // //     const totalSeconds =
// // // // //       durationMinutes * 60;

// // // // //     const updateTimer = () => {
// // // // //       const elapsed = Math.floor(
// // // // //         (Date.now() - startedAt) / 1000
// // // // //       );

// // // // //       const remaining = Math.max(
// // // // //         0,
// // // // //         totalSeconds - elapsed
// // // // //       );

// // // // //       setSecondsRemaining(remaining);

// // // // //       if (remaining <= 0) {
// // // // //         setError(
// // // // //           "Assessment time has expired."
// // // // //         );
// // // // //         setTimeExpired(true);
// // // // //         setAssessmentFinished(true);
// // // // //         clearInterviewer();
// // // // //       }
// // // // //     };

// // // // //     updateTimer();

// // // // //     const interval = setInterval(
// // // // //       updateTimer,
// // // // //       1000
// // // // //     );

// // // // //     return () => clearInterval(interval);
// // // // //   }, [
// // // // //     assessmentId,
// // // // //     durationMinutes,
// // // // //     clearInterviewer,
// // // // //   ]);

// // // // //   useEffect(() => {
// // // // //     if (!assessmentId) {
// // // // //       return;
// // // // //     }

// // // // //     let cancelled = false;

// // // // //     const initializeQuestion = async () => {
// // // // //       try {
// // // // //         await startQuestion();
// // // // //         if (!cancelled) {
// // // // //           await loadQuestion(currentIndex);
// // // // //         }
// // // // //       } catch {
// // // // //         // loadQuestion surfaces the useful API error.
// // // // //       }
// // // // //     };

// // // // //     initializeQuestion();

// // // // //     return () => {
// // // // //       cancelled = true;
// // // // //     };
// // // // //   }, [assessmentId]);

// // // // //   useEffect(() => {
// // // // //     if (!assessmentId) {
// // // // //       return;
// // // // //     }

// // // // //     localStorage.setItem(
// // // // //       getCodeKey(
// // // // //         assessmentId,
// // // // //         currentIndex
// // // // //       ),
// // // // //       code
// // // // //     );
// // // // //   }, [
// // // // //     assessmentId,
// // // // //     currentIndex,
// // // // //     code,
// // // // //   ]);

// // // // //   const requestLiveObservation =
// // // // //     useCallback(async () => {
// // // // //       if (
// // // // //         !assessmentId ||
// // // // //         !code.trim() ||
// // // // //         code.trim().length < 20 ||
// // // // //         submitResult ||
// // // // //         assessmentFinished
// // // // //       ) {
// // // // //         return;
// // // // //       }

// // // // //       try {
// // // // //         setLiveObservation(true);

// // // // //         const response =
// // // // //           await fetch(
// // // // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/live`,
// // // // //             {
// // // // //               method: "POST",
// // // // //               headers: {
// // // // //                 "Content-Type":
// // // // //                   "application/json",
// // // // //               },
// // // // //               body: JSON.stringify({
// // // // //                 code,
// // // // //                 question_index: currentIndex,
// // // // //                 language:
// // // // //                   assessment?.language ||
// // // // //                   "cpp",
// // // // //               }),
// // // // //             }
// // // // //           );

// // // // //         if (!response.ok) {
// // // // //           return;
// // // // //         }

// // // // //         const data =
// // // // //           await response.json();

// // // // //         const interviewer =
// // // // //           extractInterviewer(data);

// // // // //         const newQuestion =
// // // // //           interviewer?.question ||
// // // // //           data?.question ||
// // // // //           "";

// // // // //         if (newQuestion) {
// // // // //           setInterviewerQuestion(
// // // // //             newQuestion
// // // // //           );

// // // // //           setInterviewerReason(
// // // // //             interviewer?.reason ||
// // // // //               "I have a question about your approach."
// // // // //           );

// // // // //           setShowInterviewerPrompt(
// // // // //             true
// // // // //           );

// // // // //           // The interviewer must be able to interrupt the candidate
// // // // //           // during coding instead of waiting for a manual click.
// // // // //           setInterviewerOpen(true);
// // // // //           setInterviewerState("speaking");
// // // // //           speakText(newQuestion, () => {
// // // // //             if (mountedRef.current) {
// // // // //               setInterviewerState("listening");
// // // // //             }
// // // // //           });
// // // // //         }
// // // // //       } catch {
// // // // //         // Live observation is intentionally
// // // // //         // non-blocking for coding.
// // // // //       } finally {
// // // // //         if (mountedRef.current) {
// // // // //           setLiveObservation(false);
// // // // //         }
// // // // //       }
// // // // //     }, [
// // // // //       assessmentId,
// // // // //       code,
// // // // //       submitResult,
// // // // //       assessmentFinished,
// // // // //       currentIndex,
// // // // //       assessment?.language,
// // // // //     ]);

// // // // //   useEffect(() => {
// // // // //     if (!code.trim()) {
// // // // //       return;
// // // // //     }

// // // // //     if (liveTimerRef.current) {
// // // // //       clearTimeout(
// // // // //         liveTimerRef.current
// // // // //       );
// // // // //     }

// // // // //     liveTimerRef.current =
// // // // //       setTimeout(
// // // // //         requestLiveObservation,
// // // // //         4000
// // // // //       );

// // // // //     return () => {
// // // // //       if (liveTimerRef.current) {
// // // // //         clearTimeout(
// // // // //           liveTimerRef.current
// // // // //         );
// // // // //       }
// // // // //     };
// // // // //   }, [
// // // // //     code,
// // // // //     requestLiveObservation,
// // // // //   ]);

// // // // //   const startQuestion = useCallback(
// // // // //     async (index = currentIndex) => {
// // // // //       if (!assessmentId) {
// // // // //         return;
// // // // //       }

// // // // //       try {
// // // // //         const response =
// // // // //           await fetch(
// // // // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/start?question_index=${index}`,
// // // // //             {
// // // // //               method: "POST",
// // // // //               headers: {
// // // // //                 "Content-Type":
// // // // //                   "application/json",
// // // // //               },
// // // // //             }
// // // // //           );

// // // // //         if (!response.ok) {
// // // // //           const body =
// // // // //             await response.json().catch(
// // // // //               () => null
// // // // //             );

// // // // //           if (
// // // // //             body?.detail?.includes(
// // // // //               "already been completed"
// // // // //             )
// // // // //           ) {
// // // // //             window.location.href = "/coding-result";
// // // // //             return;
// // // // //           }

// // // // //           throw new Error(
// // // // //             body?.detail ||
// // // // //               "Could not start question."
// // // // //           );
// // // // //         }
// // // // //       } catch (err) {
// // // // //         setError(
// // // // //           err?.message ||
// // // // //             "Could not start coding question."
// // // // //         );
// // // // //       }
// // // // //     },
// // // // //     [assessmentId, currentIndex]
// // // // //   );

// // // // //   const handleRun = useCallback(
// // // // //     async () => {
// // // // //       if (
// // // // //         !assessmentId ||
// // // // //         !code.trim() ||
// // // // //         running ||
// // // // //         submitting ||
// // // // //         secondsRemaining <= 0
// // // // //       ) {
// // // // //         return;
// // // // //       }

// // // // //       try {
// // // // //         setRunning(true);
// // // // //         setError("");

// // // // //         setExecution(null);
// // // // //         setSubmitResult(null);
// // // // //         setJudgement(null);
// // // // //         setCanSubmit(false);

// // // // //         const response =
// // // // //           await fetch(
// // // // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/run`,
// // // // //             {
// // // // //               method: "POST",
// // // // //               headers: {
// // // // //                 "Content-Type":
// // // // //                   "application/json",
// // // // //               },
// // // // //               body: JSON.stringify({
// // // // //                 code,
// // // // //                 question_index: currentIndex,
// // // // //                 language:
// // // // //                   assessment?.language ||
// // // // //                   "cpp",
// // // // //               }),
// // // // //             }
// // // // //           );

// // // // //         const data =
// // // // //           await response.json().catch(
// // // // //             () => null
// // // // //           );

// // // // //         if (!response.ok) {
// // // // //           throw new Error(
// // // // //             data?.detail ||
// // // // //               "Code execution failed."
// // // // //           );
// // // // //         }

// // // // //         const result =
// // // // //           extractExecution(data) ||
// // // // //           data;

// // // // //         setExecution(result);

// // // // //         const passed =
// // // // //           data?.can_submit === true ||
// // // // //           result?.passed === true ||
// // // // //           (
// // // // //             getVisibleTotal(result) > 0 &&
// // // // //             getVisiblePassed(result) ===
// // // // //               getVisibleTotal(result)
// // // // //           );

// // // // //         setCanSubmit(passed);

// // // // //         if (!passed) {
// // // // //           setError(
// // // // //             "Fix the failing visible tests and Run again before submitting."
// // // // //           );
// // // // //         }
// // // // //       } catch (err) {
// // // // //         setError(
// // // // //           err?.message ||
// // // // //             "Could not execute your code."
// // // // //         );
// // // // //       } finally {
// // // // //         setRunning(false);
// // // // //       }
// // // // //     },
// // // // //     [
// // // // //       assessmentId,
// // // // //       code,
// // // // //       running,
// // // // //       submitting,
// // // // //       secondsRemaining,
// // // // //       assessment?.language,
// // // // //     ]
// // // // //   );

// // // // //   const buildQuestionResult = useCallback(
// // // // //     (
// // // // //       submitData,
// // // // //       resultExecution,
// // // // //       resultJudgement,
// // // // //       resultInterviewer
// // // // //     ) => {
// // // // //       const finalExecution =
// // // // //         resultExecution ||
// // // // //         extractExecution(
// // // // //           submitData
// // // // //         ) ||
// // // // //         {};

// // // // //       const finalJudgement =
// // // // //         resultJudgement ||
// // // // //         extractJudgement(
// // // // //           submitData
// // // // //         ) ||
// // // // //         {};

// // // // //       const finalInterviewer =
// // // // //         resultInterviewer ||
// // // // //         extractInterviewer(
// // // // //           submitData
// // // // //         ) ||
// // // // //         {};

// // // // //       return {
// // // // //         question_number:
// // // // //           question?.question_number ??
// // // // //           currentIndex + 1,

// // // // //         problem_id:
// // // // //           question?.problem_id,

// // // // //         title:
// // // // //           question?.title ||
// // // // //           "Coding Question",

// // // // //         category:
// // // // //           question?.category,

// // // // //         difficulty:
// // // // //           question?.difficulty,

// // // // //         code,

// // // // //         accepted:
// // // // //           isAccepted(
// // // // //             finalJudgement,
// // // // //             finalExecution
// // // // //           ),

// // // // //         // Normalized fields used by CodingResult/History. Keep the
// // // // //         // original execution/judgement fields below untouched.
// // // // //         passed:
// // // // //           isAccepted(
// // // // //             finalJudgement,
// // // // //             finalExecution
// // // // //           ),

// // // // //         submitted: true,

// // // // //         score:
// // // // //           Number.isFinite(Number(finalJudgement?.score))
// // // // //             ? Number(finalJudgement.score)
// // // // //             : Number.isFinite(Number(finalJudgement?.rating))
// // // // //             ? Number(finalJudgement.rating)
// // // // //             : isAccepted(finalJudgement, finalExecution)
// // // // //             ? 10
// // // // //             : 0,

// // // // //         passed_tests:
// // // // //           getVisiblePassed(finalExecution) +
// // // // //           getHiddenPassed(finalExecution),

// // // // //         total_tests:
// // // // //           getVisibleTotal(finalExecution) +
// // // // //           getHiddenTotal(finalExecution),

// // // // //         visible_passed_tests:
// // // // //           getVisiblePassed(
// // // // //             finalExecution
// // // // //           ),

// // // // //         visible_total_tests:
// // // // //           getVisibleTotal(
// // // // //             finalExecution
// // // // //           ),

// // // // //         hidden_passed_tests:
// // // // //           getHiddenPassed(
// // // // //             finalExecution
// // // // //           ),

// // // // //         hidden_total_tests:
// // // // //           getHiddenTotal(
// // // // //             finalExecution
// // // // //           ),

// // // // //         hidden_failed_tests:
// // // // //           getHiddenFailed(
// // // // //             finalExecution
// // // // //           ),

// // // // //         execution_time_ms:
// // // // //           finalExecution?.execution_time_ms ??
// // // // //           finalExecution?.execution_time ??
// // // // //           null,

// // // // //         feedback:
// // // // //           finalJudgement?.reasoning ||
// // // // //           finalJudgement?.feedback ||
// // // // //           "",

// // // // //         approach:
// // // // //           finalJudgement?.approach_name ||
// // // // //           finalJudgement?.approach_level ||
// // // // //           "",

// // // // //         time_complexity:
// // // // //           finalJudgement?.time_complexity ||
// // // // //           "",

// // // // //         space_complexity:
// // // // //           finalJudgement?.space_complexity ||
// // // // //           "",

// // // // //         optimal:
// // // // //           finalJudgement?.optimal,

// // // // //         strengths:
// // // // //           finalJudgement?.strengths || [],

// // // // //         weaknesses:
// // // // //           finalJudgement?.weaknesses || [],

// // // // //         interviewer_question:
// // // // //           finalInterviewer?.question ||
// // // // //           finalJudgement?.recommended_follow_up ||
// // // // //           "",

// // // // //         interviewer_reason:
// // // // //           finalInterviewer?.reason ||
// // // // //           "",

// // // // //         submitted_at:
// // // // //           new Date().toISOString(),
// // // // //       };
// // // // //     },
// // // // //     [
// // // // //       question,
// // // // //       currentIndex,
// // // // //       code,
// // // // //     ]
// // // // //   );

// // // // //   const saveSessionResult = useCallback(
// // // // //     (results) => {
// // // // //       if (!assessmentId) {
// // // // //         return;
// // // // //       }

// // // // //       const existingHistory =
// // // // //         safeJsonParse(
// // // // //           localStorage.getItem(
// // // // //             HISTORY_KEY
// // // // //           ),
// // // // //           []
// // // // //         );

// // // // //       const safeHistory =
// // // // //         Array.isArray(existingHistory)
// // // // //           ? existingHistory
// // // // //           : [];

// // // // //       const resultObject = {
// // // // //         assessment_id:
// // // // //           assessmentId,

// // // // //         mode:
// // // // //           assessment?.mode ||
// // // // //           "personalized",

// // // // //         company:
// // // // //           assessment?.company ||
// // // // //           null,

// // // // //         role:
// // // // //           assessment?.role ||
// // // // //           null,

// // // // //         topics:
// // // // //           assessment?.topics ||
// // // // //           [],

// // // // //         question_count:
// // // // //           totalQuestions,

// // // // //         duration_minutes:
// // // // //           durationMinutes,

// // // // //         completed: true,

// // // // //         completed_at:
// // // // //           new Date().toISOString(),

// // // // //         results,
// // // // //       };

// // // // //       const withoutCurrent =
// // // // //         safeHistory.filter(
// // // // //           (item) =>
// // // // //             item?.assessment_id !==
// // // // //             assessmentId
// // // // //         );

// // // // //       withoutCurrent.push(
// // // // //         resultObject
// // // // //       );

// // // // //       localStorage.setItem(
// // // // //         HISTORY_KEY,
// // // // //         JSON.stringify(
// // // // //           withoutCurrent
// // // // //         )
// // // // //       );

// // // // //       localStorage.setItem(
// // // // //         getSessionResultKey(
// // // // //           assessmentId
// // // // //         ),
// // // // //         JSON.stringify(
// // // // //           resultObject
// // // // //         )
// // // // //       );

// // // // //       localStorage.setItem(
// // // // //         "coding_assessment_result",
// // // // //         JSON.stringify(
// // // // //           resultObject
// // // // //         )
// // // // //       );
// // // // //     },
// // // // //     [
// // // // //       assessmentId,
// // // // //       assessment?.mode,
// // // // //       assessment?.company,
// // // // //       assessment?.role,
// // // // //       assessment?.topics,
// // // // //       totalQuestions,
// // // // //       durationMinutes,
// // // // //     ]
// // // // //   );

// // // // //   useEffect(() => {
// // // // //     if (!timeExpired || !assessmentId) {
// // // // //       return;
// // // // //     }

// // // // //     // Preserve whatever has already been completed so the feedback page
// // // // //     // remains useful even when the timer expires before the final question.
// // // // //     saveSessionResult(completedResults);
// // // // //   }, [
// // // // //     timeExpired,
// // // // //     assessmentId,
// // // // //     completedResults,
// // // // //     saveSessionResult,
// // // // //   ]);

// // // // //   const handleSubmit = useCallback(
// // // // //     async () => {
// // // // //       if (
// // // // //         !assessmentId ||
// // // // //         !code.trim() ||
// // // // //         submitting ||
// // // // //         running ||
// // // // //         !canSubmit ||
// // // // //         secondsRemaining <= 0
// // // // //       ) {
// // // // //         return;
// // // // //       }

// // // // //       if (
// // // // //         lastSubmittedCodeRef.current &&
// // // // //         lastSubmittedCodeRef.current !==
// // // // //           code
// // // // //       ) {
// // // // //         setError(
// // // // //           "Your code changed after the last Run. Run it again before submitting."
// // // // //         );
// // // // //         setCanSubmit(false);
// // // // //         return;
// // // // //       }

// // // // //       try {
// // // // //         setSubmitting(true);
// // // // //         setError("");

// // // // //         const response =
// // // // //           await fetch(
// // // // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/submit`,
// // // // //             {
// // // // //               method: "POST",
// // // // //               headers: {
// // // // //                 "Content-Type":
// // // // //                   "application/json",
// // // // //               },
// // // // //               body: JSON.stringify({
// // // // //                 code,
// // // // //                 question_index: currentIndex,
// // // // //                 language:
// // // // //                   assessment?.language ||
// // // // //                   "cpp",
// // // // //               }),
// // // // //             }
// // // // //           );

// // // // //         const data =
// // // // //           await response.json().catch(
// // // // //             () => null
// // // // //           );

// // // // //         if (!response.ok) {
// // // // //           throw new Error(
// // // // //             data?.detail ||
// // // // //               "Submission failed."
// // // // //           );
// // // // //         }

// // // // //         const finalExecution =
// // // // //           extractExecution(data) ||
// // // // //           {};

// // // // //         const finalJudgement =
// // // // //           extractJudgement(data) ||
// // // // //           {};

// // // // //         const finalInterviewer =
// // // // //           extractInterviewer(data) ||
// // // // //           {};

// // // // //         setSubmitResult(data);
// // // // //         setExecution(finalExecution);
// // // // //         setJudgement(finalJudgement);

// // // // //         lastSubmittedCodeRef.current =
// // // // //           code;

// // // // //         setCanSubmit(false);

// // // // //         const questionResult =
// // // // //           buildQuestionResult(
// // // // //             data,
// // // // //             finalExecution,
// // // // //             finalJudgement,
// // // // //             finalInterviewer
// // // // //           );

// // // // //         const updatedResults = [
// // // // //           ...completedResults,
// // // // //           questionResult,
// // // // //         ];

// // // // //         const uniqueResults =
// // // // //           updatedResults.filter(
// // // // //             (item, index, array) =>
// // // // //               array.findIndex(
// // // // //                 (candidate) =>
// // // // //                   candidate?.question_number ===
// // // // //                   item?.question_number
// // // // //               ) === index
// // // // //           );

// // // // //         setCompletedResults(
// // // // //           uniqueResults
// // // // //         );

// // // // //         localStorage.setItem(
// // // // //           getSessionResultKey(
// // // // //             assessmentId
// // // // //           ),
// // // // //           JSON.stringify({
// // // // //             ...safeJsonParse(
// // // // //               localStorage.getItem(
// // // // //                 getSessionResultKey(
// // // // //                   assessmentId
// // // // //                 )
// // // // //               ),
// // // // //               {}
// // // // //             ),
// // // // //             assessment_id:
// // // // //               assessmentId,
// // // // //             mode:
// // // // //               assessment?.mode ||
// // // // //               "personalized",
// // // // //             results:
// // // // //               uniqueResults,
// // // // //           })
// // // // //         );

// // // // //         const followUpQuestion =
// // // // //           finalInterviewer?.question ||
// // // // //           finalJudgement?.recommended_follow_up ||
// // // // //           (isAccepted(
// // // // //             finalJudgement,
// // // // //             finalExecution
// // // // //           )
// // // // //             ? "Walk me through your approach and explain its time and space complexity."
// // // // //             : "");

// // // // //         setInterviewerQuestion(
// // // // //           followUpQuestion
// // // // //         );

// // // // //         setInterviewerReason(
// // // // //           finalInterviewer?.reason ||
// // // // //             (followUpQuestion
// // // // //               ? "Let's discuss your solution and the reasoning behind it."
// // // // //               : "Let's discuss your solution.")
// // // // //         );

// // // // //         if (followUpQuestion) {
// // // // //           setShowInterviewerPrompt(true);
// // // // //         }
// // // // //       } catch (err) {
// // // // //         setError(
// // // // //           err?.message ||
// // // // //             "Could not submit solution."
// // // // //         );
// // // // //       } finally {
// // // // //         setSubmitting(false);
// // // // //       }
// // // // //     },
// // // // //     [
// // // // //       assessmentId,
// // // // //       code,
// // // // //       submitting,
// // // // //       running,
// // // // //       canSubmit,
// // // // //       secondsRemaining,
// // // // //       assessment?.language,
// // // // //       assessment?.mode,
// // // // //       completedResults,
// // // // //       buildQuestionResult,
// // // // //     ]
// // // // //   );

// // // // //   const openInterviewer =
// // // // //     useCallback(() => {
// // // // //       if (!interviewerQuestion) {
// // // // //         return;
// // // // //       }

// // // // //       setShowInterviewerPrompt(false);
// // // // //       setInterviewerOpen(true);
// // // // //       setInterviewerTranscript("");
// // // // //       setInterviewerResponse("");
// // // // //       setInterviewerState("speaking");

// // // // //       speakText(
// // // // //         interviewerQuestion,
// // // // //         () => {
// // // // //           if (
// // // // //             mountedRef.current
// // // // //           ) {
// // // // //             setInterviewerState(
// // // // //               "idle"
// // // // //             );
// // // // //           }
// // // // //         }
// // // // //       );
// // // // //     }, [interviewerQuestion]);

// // // // //   const startListening =
// // // // //     useCallback(() => {
// // // // //       const Recognition =
// // // // //         getSpeechRecognitionConstructor();

// // // // //       if (!Recognition) {
// // // // //         setError(
// // // // //           "Voice input is not supported by this browser."
// // // // //         );
// // // // //         return;
// // // // //       }

// // // // //       if (recognitionRef.current) {
// // // // //         try {
// // // // //           recognitionRef.current.stop();
// // // // //         } catch {
// // // // //           // Ignore.
// // // // //         }
// // // // //       }

// // // // //       const recognition =
// // // // //         new Recognition();

// // // // //       recognition.lang = "en-US";
// // // // //       recognition.interimResults = true;
// // // // //       recognition.continuous = false;

// // // // //       recognition.onstart = () => {
// // // // //         setInterviewerState(
// // // // //           "listening"
// // // // //         );
// // // // //       };

// // // // //       recognition.onresult = (
// // // // //         event
// // // // //       ) => {
// // // // //         let transcript = "";

// // // // //         for (
// // // // //           let i = event.resultIndex;
// // // // //           i < event.results.length;
// // // // //           i++
// // // // //         ) {
// // // // //           transcript +=
// // // // //             event.results[i][0]
// // // // //               .transcript;
// // // // //         }

// // // // //         setInterviewerTranscript(
// // // // //           transcript
// // // // //         );
// // // // //       };

// // // // //       recognition.onerror = (
// // // // //         event
// // // // //       ) => {
// // // // //         setInterviewerState(
// // // // //           "idle"
// // // // //         );

// // // // //         if (
// // // // //           event?.error ===
// // // // //           "not-allowed"
// // // // //         ) {
// // // // //           setError(
// // // // //             "Microphone permission was denied."
// // // // //           );
// // // // //         }
// // // // //       };

// // // // //       recognition.onend = () => {
// // // // //         setInterviewerState(
// // // // //           "idle"
// // // // //         );

// // // // //         setInterviewerTranscript(
// // // // //           (previous) =>
// // // // //             previous.trim()
// // // // //         );
// // // // //       };

// // // // //       recognitionRef.current =
// // // // //         recognition;

// // // // //       recognition.start();
// // // // //     }, []);

// // // // //   const submitInterviewAnswer =
// // // // //     useCallback(async () => {
// // // // //       const answer =
// // // // //         interviewerTranscript.trim();

// // // // //       if (!answer) {
// // // // //         return;
// // // // //       }

// // // // //       setInterviewerState(
// // // // //         "processing"
// // // // //       );

// // // // //       try {
// // // // //         const response =
// // // // //           await fetch(
// // // // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/interview-answer`,
// // // // //             {
// // // // //               method: "POST",
// // // // //               headers: {
// // // // //                 "Content-Type":
// // // // //                   "application/json",
// // // // //               },
// // // // //               body: JSON.stringify({
// // // // //                 answer,
// // // // //                 question:
// // // // //                   interviewerQuestion,
// // // // //                 code,
// // // // //                 question_index: currentIndex,
// // // // //                 language:
// // // // //                   assessment?.language ||
// // // // //                   "cpp",
// // // // //               }),
// // // // //             }
// // // // //           );

// // // // //         const data =
// // // // //           await response.json().catch(
// // // // //             () => null
// // // // //           );

// // // // //         if (!response.ok) {
// // // // //           throw new Error(
// // // // //             data?.detail ||
// // // // //               "Could not process interview answer."
// // // // //           );
// // // // //         }

// // // // //         const nextQuestion =
// // // // //           data?.question ||
// // // // //           data?.interviewer?.question ||
// // // // //           data?.next_question ||
// // // // //           "";

// // // // //         const responseText =
// // // // //           data?.response ||
// // // // //           data?.message ||
// // // // //           data?.feedback ||
// // // // //           "";

// // // // //         setInterviewerResponse(
// // // // //           responseText
// // // // //         );

// // // // //         if (nextQuestion) {
// // // // //           setInterviewerQuestion(
// // // // //             nextQuestion
// // // // //           );

// // // // //           setInterviewerTranscript(
// // // // //             ""
// // // // //           );

// // // // //           setInterviewerState(
// // // // //             "speaking"
// // // // //           );

// // // // //           speakText(
// // // // //             nextQuestion,
// // // // //             () => {
// // // // //               if (
// // // // //                 mountedRef.current
// // // // //               ) {
// // // // //                 setInterviewerState(
// // // // //                   "listening"
// // // // //                 );
// // // // //               }
// // // // //             }
// // // // //           );
// // // // //         } else {
// // // // //           if (responseText) {
// // // // //             speakText(
// // // // //               responseText,
// // // // //               () => {
// // // // //                 if (
// // // // //                   mountedRef.current
// // // // //                 ) {
// // // // //                   setInterviewerState(
// // // // //                     "idle"
// // // // //                   );
// // // // //                 }
// // // // //               }
// // // // //             );
// // // // //           } else {
// // // // //             setInterviewerState(
// // // // //               "idle"
// // // // //             );
// // // // //           }
// // // // //         }
// // // // //       } catch (err) {
// // // // //         setInterviewerState(
// // // // //           "idle"
// // // // //         );

// // // // //         setError(
// // // // //           err?.message ||
// // // // //             "Could not process your interview answer."
// // // // //         );
// // // // //       }
// // // // //     }, [
// // // // //       assessmentId,
// // // // //       interviewerTranscript,
// // // // //       interviewerQuestion,
// // // // //       code,
// // // // //       currentIndex,
// // // // //       assessment?.language,
// // // // //     ]);

// // // // //   const askInterviewer = useCallback(async () => {
// // // // //     const asked = candidateQuestion.trim();

// // // // //     if (!assessmentId || !asked) {
// // // // //       return;
// // // // //     }

// // // // //     try {
// // // // //       setError("");
// // // // //       setInterviewerResponse("");
// // // // //       setInterviewerState("thinking");

// // // // //       const response = await fetch(
// // // // //         `${API_BASE}/api/coding/assessment/${assessmentId}/question/interview-answer`,
// // // // //         {
// // // // //           method: "POST",
// // // // //           headers: {
// // // // //             "Content-Type": "application/json",
// // // // //           },
// // // // //           body: JSON.stringify({
// // // // //             answer: asked,
// // // // //             question: interviewerQuestion || "Candidate clarification",
// // // // //             code,
// // // // //             question_index: currentIndex,
// // // // //             action: "clarification",
// // // // //           }),
// // // // //         }
// // // // //       );

// // // // //       const data = await response.json().catch(() => null);

// // // // //       if (!response.ok) {
// // // // //         throw new Error(
// // // // //           data?.detail || "Could not contact the interviewer."
// // // // //         );
// // // // //       }

// // // // //       const reply =
// // // // //         data?.response ||
// // // // //         "I can clarify the assumptions without giving away the solution.";

// // // // //       setCandidateQuestion("");
// // // // //       setInterviewerResponse(reply);
// // // // //       setInterviewerState("speaking");

// // // // //       speakText(reply, () => {
// // // // //         if (mountedRef.current) {
// // // // //           setInterviewerState("idle");
// // // // //         }
// // // // //       });
// // // // //     } catch (err) {
// // // // //       setInterviewerState("idle");
// // // // //       setError(
// // // // //         err?.message ||
// // // // //           "Could not contact the interviewer."
// // // // //       );
// // // // //     }
// // // // //   }, [
// // // // //     assessmentId,
// // // // //     candidateQuestion,
// // // // //     interviewerQuestion,
// // // // //     code,
// // // // //     currentIndex,
// // // // //   ]);

// // // // //   const closeInterviewer =
// // // // //     useCallback(() => {
// // // // //       clearInterviewer();

// // // // //       setInterviewerOpen(false);
// // // // //       setShowInterviewerPrompt(false);
// // // // //     }, [clearInterviewer]);

// // // // //   const completeAndGoNext =
// // // // //     useCallback(async () => {
// // // // //       if (
// // // // //         !assessmentId ||
// // // // //         !submitResult
// // // // //       ) {
// // // // //         return;
// // // // //       }

// // // // //       try {
// // // // //         setError("");

// // // // //         const result =
// // // // //           buildQuestionResult(
// // // // //             submitResult,
// // // // //             execution,
// // // // //             judgement,
// // // // //             extractInterviewer(
// // // // //               submitResult
// // // // //             )
// // // // //           );

// // // // //         const mergedResults =
// // // // //           completedResults.some(
// // // // //             (item) =>
// // // // //               item?.question_number ===
// // // // //               result?.question_number
// // // // //           )
// // // // //             ? completedResults
// // // // //             : [
// // // // //                 ...completedResults,
// // // // //                 result,
// // // // //               ];

// // // // //         const response =
// // // // //           await fetch(
// // // // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/complete`,
// // // // //             {
// // // // //               method: "POST",
// // // // //               headers: {
// // // // //                 "Content-Type":
// // // // //                   "application/json",
// // // // //               },
// // // // //               body: JSON.stringify({
// // // // //                 result,
// // // // //               }),
// // // // //             }
// // // // //           );

// // // // //         const data =
// // // // //           await response.json().catch(
// // // // //             () => null
// // // // //           );

// // // // //         if (!response.ok) {
// // // // //           throw new Error(
// // // // //             data?.detail ||
// // // // //               "Could not complete question."
// // // // //           );
// // // // //         }

// // // // //         if (
// // // // //           data?.completed === true
// // // // //         ) {
// // // // //           saveSessionResult(
// // // // //             mergedResults
// // // // //           );

// // // // //           setAssessmentFinished(
// // // // //             true
// // // // //           );

// // // // //           // Keep the candidate on the assessment page and show the
// // // // //           // completion actions. The feedback button performs the
// // // // //           // navigation after the candidate chooses it.
// // // // //           return;
// // // // //         }

// // // // //         setCompletedResults(
// // // // //           mergedResults
// // // // //         );

// // // // //         const nextIndex =
// // // // //           currentIndex + 1;

// // // // //         setCurrentIndex(
// // // // //           nextIndex
// // // // //         );

// // // // //         setQuestion(null);
// // // // //         setExecution(null);
// // // // //         setJudgement(null);
// // // // //         setSubmitResult(null);
// // // // //         setCanSubmit(false);
// // // // //         setInterviewerQuestion("");
// // // // //         setInterviewerTranscript("");
// // // // //         setInterviewerResponse("");

// // // // //         clearInterviewer();

// // // // //         await startQuestion();

// // // // //         await loadQuestion(
// // // // //           nextIndex
// // // // //         );
// // // // //       } catch (err) {
// // // // //         setError(
// // // // //           err?.message ||
// // // // //             "Could not move to the next question."
// // // // //         );
// // // // //       }
// // // // //     }, [
// // // // //       assessmentId,
// // // // //       submitResult,
// // // // //       buildQuestionResult,
// // // // //       execution,
// // // // //       judgement,
// // // // //       completedResults,
// // // // //       saveSessionResult,
// // // // //       currentIndex,
// // // // //       clearInterviewer,
// // // // //       startQuestion,
// // // // //       loadQuestion,
// // // // //     ]);

// // // // //   const jumpToQuestion =
// // // // //     useCallback(
// // // // //       async (index) => {
// // // // //         if (index < 0 || index >= totalQuestions) {
// // // // //           return;
// // // // //         }

// // // // //         if (index === currentIndex) {
// // // // //           return;
// // // // //         }

// // // // //         setJumpMessage("");
// // // // //         setCurrentIndex(index);
// // // // //         setQuestion(null);
// // // // //         setExecution(null);
// // // // //         setJudgement(null);
// // // // //         setSubmitResult(null);
// // // // //         setCanSubmit(false);
// // // // //         setInterviewerQuestion("");
// // // // //         setInterviewerTranscript("");
// // // // //         setInterviewerResponse("");
// // // // //         clearInterviewer();

// // // // //         // IMPORTANT: a question switch must update the backend coding
// // // // //         // session before loading tests. Otherwise Q2 can display Q1's
// // // // //         // test bank (the exact bug seen in the assessment UI).
// // // // //         await startQuestion(index);
// // // // //         await loadQuestion(index);
// // // // //       },
// // // // //       [
// // // // //         currentIndex,
// // // // //         totalQuestions,
// // // // //         clearInterviewer,
// // // // //         startQuestion,
// // // // //         loadQuestion,
// // // // //       ]
// // // // //     );

// // // // //   const goDashboard =
// // // // //     useCallback(() => {
// // // // //       window.location.href = "/";
// // // // //     }, []);

// // // // //   const goFeedback =
// // // // //     useCallback(() => {
// // // // //       window.location.href = "/coding-result";
// // // // //     }, []);

// // // // //   const handleExitAssessment = useCallback(() => {
// // // // //     if (assessmentId) {
// // // // //       saveSessionResult(completedResults);
// // // // //     }
// // // // //     window.location.href = "/coding-result";
// // // // //   }, [assessmentId, completedResults, saveSessionResult]);

// // // // //   const handleReturnDashboard = useCallback(() => {
// // // // //     if (assessmentId) {
// // // // //       saveSessionResult(completedResults);
// // // // //     }
// // // // //     window.location.href = "/";
// // // // //   }, [assessmentId, completedResults, saveSessionResult]);

// // // // //   const timerDanger =
// // // // //     secondsRemaining <= 300;

// // // // //   const timerText =
// // // // //     formatTime(
// // // // //       secondsRemaining
// // // // //     );

// // // // //   if (loading && !question) {
// // // // //     return (
// // // // //       <div className="coding-page">
// // // // //         <div className="coding-loading">
// // // // //           <div className="coding-spinner" />
// // // // //           <p>
// // // // //             Preparing your coding assessment...
// // // // //           </p>
// // // // //         </div>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   if (
// // // // //     assessmentFinished
// // // // //   ) {
// // // // //     return (
// // // // //       <div className="coding-page">
// // // // //         <div className="coding-complete">
// // // // //           <div className="complete-icon">
// // // // //             ✓
// // // // //           </div>

// // // // //           <h1>
// // // // //             {timeExpired
// // // // //               ? "Time's Up"
// // // // //               : "Assessment Complete"}
// // // // //           </h1>

// // // // //           <p>
// // // // //             {timeExpired
// // // // //               ? "Your assessment time has ended. Your completed work has been saved and is available in AI feedback."
// // // // //               : "Your coding assessment has been completed successfully."}
// // // // //           </p>

// // // // //           <div className="complete-actions">
// // // // //             <button
// // // // //               className="primary-button"
// // // // //               onClick={
// // // // //                 handleExitAssessment
// // // // //               }
// // // // //             >
// // // // //               View AI Feedback
// // // // //             </button>

// // // // //             <button
// // // // //               className="secondary-button"
// // // // //               onClick={
// // // // //                 handleReturnDashboard
// // // // //               }
// // // // //             >
// // // // //               Return to Dashboard
// // // // //             </button>
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   return (
// // // // //     <div className="coding-page">
// // // // //       <header className="coding-topbar">
// // // // //         <div className="coding-brand">
// // // // //           <span>AI Coding Assessment</span>
// // // // //           <div className="top-interviewer">
// // // // //             <span className="top-interviewer-dot" />
// // // // //             <span className="top-interviewer-name">AI Interviewer</span>
// // // // //             <span className="top-interviewer-status">
// // // // //               {liveObservation ? "Observing" : "Available"}
// // // // //             </span>
// // // // //           </div>
// // // // //         </div>

// // // // //         <div className="coding-topbar-right">
// // // // //           <span>
// // // // //             {assessment?.mode ===
// // // // //             "company_oa"
// // // // //               ? "Company OA"
// // // // //               : assessment?.mode ===
// // // // //                 "contest"
// // // // //               ? "Contest"
// // // // //               : "Personalized"}
// // // // //           </span>

// // // // //           <span className="topbar-divider">
// // // // //             |
// // // // //           </span>

// // // // //           <span>
// // // // //             Question{" "}
// // // // //             {currentIndex + 1} /{" "}
// // // // //             {totalQuestions}
// // // // //           </span>

// // // // //           <span
// // // // //             className={
// // // // //               timerDanger
// // // // //                 ? "timer danger"
// // // // //                 : "timer"
// // // // //             }
// // // // //           >
// // // // //             ⏱ {timerText}
// // // // //           </span>

// // // // //           <button
// // // // //             type="button"
// // // // //             className="topbar-action-button"
// // // // //             onClick={handleExitAssessment}
// // // // //             title="Open AI feedback and assessment results"
// // // // //           >
// // // // //             AI Feedback
// // // // //           </button>

// // // // //           <button
// // // // //             type="button"
// // // // //             className="topbar-action-button secondary"
// // // // //             onClick={handleReturnDashboard}
// // // // //             title="Leave the assessment and return to dashboard"
// // // // //           >
// // // // //             Dashboard
// // // // //           </button>
// // // // //         </div>
// // // // //       </header>

// // // // //       <div className="coding-workspace">
// // // // //         <aside className="question-sidebar">
// // // // //           <div className="sidebar-title">
// // // // //             Questions
// // // // //           </div>

// // // // //           <div className="question-list">
// // // // //             {Array.from({
// // // // //               length: totalQuestions,
// // // // //             }).map(
// // // // //               (_, index) => {
// // // // //                 const result =
// // // // //                   completedResults.find(
// // // // //                     (item) =>
// // // // //                       Number(
// // // // //                         item?.question_number
// // // // //                       ) ===
// // // // //                       index + 1
// // // // //                   );

// // // // //                 const isCurrent =
// // // // //                   index ===
// // // // //                   currentIndex;

// // // // //                 const isCompleted =
// // // // //                   Boolean(result);

// // // // //                 return (
// // // // //                   <button
// // // // //                     type="button"
// // // // //                     key={index}
// // // // //                     className={[
// // // // //                       "question-pill",
// // // // //                       isCurrent
// // // // //                         ? "active"
// // // // //                         : "",
// // // // //                       isCompleted
// // // // //                         ? "completed"
// // // // //                         : "",
// // // // //                     ]
// // // // //                       .filter(Boolean)
// // // // //                       .join(" ")}
// // // // //                     onClick={() =>
// // // // //                       jumpToQuestion(index)
// // // // //                     }
// // // // //                     aria-current={
// // // // //                       isCurrent ? "step" : undefined
// // // // //                     }
// // // // //                   >
// // // // //                     <span className="question-pill-number">
// // // // //                       {isCompleted
// // // // //                         ? "✓"
// // // // //                         : index + 1}
// // // // //                     </span>

// // // // //                     <span>
// // // // //                       Question{" "}
// // // // //                       {index + 1}
// // // // //                     </span>
// // // // //                   </button>
// // // // //                 );
// // // // //               }
// // // // //             )}
// // // // //           </div>

// // // // //           <div className="sidebar-bottom">
// // // // //             <button
// // // // //               className="dashboard-link"
// // // // //               onClick={
// // // // //                 goDashboard
// // // // //               }
// // // // //             >
// // // // //               ← Dashboard
// // // // //             </button>
// // // // //           </div>
// // // // //         </aside>

// // // // //         <main className="coding-main">
// // // // //           {error && (
// // // // //             <div className="coding-alert">
// // // // //               <span>{error}</span>

// // // // //               <button
// // // // //                 onClick={() =>
// // // // //                   setError("")
// // // // //                 }
// // // // //               >
// // // // //                 ×
// // // // //               </button>
// // // // //             </div>
// // // // //           )}

// // // // //           {jumpMessage && (
// // // // //             <div className="jump-message">
// // // // //               {jumpMessage}
// // // // //             </div>
// // // // //           )}

// // // // //           <section className="problem-panel">
// // // // //             <div className="problem-header">
// // // // //               <div>
// // // // //                 <div className="problem-meta">
// // // // //                   <span>
// // // // //                     {question?.difficulty ||
// // // // //                       "Medium"}
// // // // //                   </span>

// // // // //                   <span>·</span>

// // // // //                   <span>
// // // // //                     {question?.category ||
// // // // //                       "Algorithms"}
// // // // //                   </span>
// // // // //                 </div>

// // // // //                 <h1>
// // // // //                   {question?.title ||
// // // // //                     "Coding Problem"}
// // // // //                 </h1>
// // // // //               </div>

// // // // //               <div className="problem-number">
// // // // //                 {currentIndex + 1}/
// // // // //                 {totalQuestions}
// // // // //               </div>
// // // // //             </div>

// // // // //             <div className="problem-statement">
// // // // //               {question?.statement ||
// // // // //                 question?.description ||
// // // // //                 "Solve the problem using an efficient algorithm."}
// // // // //             </div>

// // // // //             <div className="problem-section">
// // // // //               <button
// // // // //                 className="section-toggle"
// // // // //                 onClick={() =>
// // // // //                   setShowExamples(
// // // // //                     (value) =>
// // // // //                       !value
// // // // //                   )
// // // // //                 }
// // // // //               >
// // // // //                 <span>
// // // // //                   Examples
// // // // //                 </span>

// // // // //                 <span>
// // // // //                   {showExamples
// // // // //                     ? "⌃"
// // // // //                     : "⌄"}
// // // // //                 </span>
// // // // //               </button>

// // // // //               {showExamples &&
// // // // //                 examples.slice(0, 3).map(
// // // // //                   (
// // // // //                     example,
// // // // //                     index
// // // // //                   ) => (
// // // // //                     <div
// // // // //                       className="example-card"
// // // // //                       key={index}
// // // // //                     >
// // // // //                       <div className="example-title">
// // // // //                         Example{" "}
// // // // //                         {index + 1}
// // // // //                       </div>

// // // // //                       {example.input !==
// // // // //                         undefined && (
// // // // //                         <div className="example-row">
// // // // //                           <div className="example-label">
// // // // //                             Input
// // // // //                           </div>

// // // // //                           <pre>
// // // // //                             {formatExampleInput(
// // // // //                               example.input
// // // // //                             )}
// // // // //                           </pre>
// // // // //                         </div>
// // // // //                       )}

// // // // //                       {example.output !==
// // // // //                         undefined && (
// // // // //                         <div className="example-row">
// // // // //                           <div className="example-label">
// // // // //                             Output
// // // // //                           </div>

// // // // //                           <pre>
// // // // //                             {formatExampleOutput(
// // // // //                               example.output
// // // // //                             )}
// // // // //                           </pre>
// // // // //                         </div>
// // // // //                       )}

// // // // //                       {example.expected_output !==
// // // // //                         undefined && (
// // // // //                         <div className="example-row">
// // // // //                           <div className="example-label">
// // // // //                             Output
// // // // //                           </div>

// // // // //                           <pre>
// // // // //                             {formatExampleOutput(
// // // // //                               example.expected_output
// // // // //                             )}
// // // // //                           </pre>
// // // // //                         </div>
// // // // //                       )}

// // // // //                       {example.explanation && (
// // // // //                         <div className="example-explanation">
// // // // //                           {example.explanation}
// // // // //                         </div>
// // // // //                       )}
// // // // //                     </div>
// // // // //                   )
// // // // //                 )}

// // // // //               {showExamples && examples.length > 3 && (
// // // // //                 <div className="examples-more-note">
// // // // //                   Showing the first 3 examples. Review the problem statement for the remaining examples.
// // // // //                 </div>
// // // // //               )}
// // // // //             </div>

// // // // //             {constraints.length >
// // // // //               0 && (
// // // // //               <div className="problem-section">
// // // // //                 <button
// // // // //                   className="section-toggle"
// // // // //                   onClick={() =>
// // // // //                     setShowConstraints(
// // // // //                       (value) =>
// // // // //                         !value
// // // // //                     )
// // // // //                   }
// // // // //                 >
// // // // //                   <span>
// // // // //                     Constraints
// // // // //                   </span>

// // // // //                   <span>
// // // // //                     {showConstraints
// // // // //                       ? "⌃"
// // // // //                       : "⌄"}
// // // // //                   </span>
// // // // //                 </button>

// // // // //                 {showConstraints && (
// // // // //                   <ul className="constraints-list">
// // // // //                     {constraints.map(
// // // // //                       (
// // // // //                         constraint,
// // // // //                         index
// // // // //                       ) => (
// // // // //                         <li
// // // // //                           key={
// // // // //                             index
// // // // //                           }
// // // // //                         >
// // // // //                           {typeof constraint ===
// // // // //                           "object"
// // // // //                             ? JSON.stringify(
// // // // //                                 constraint
// // // // //                               )
// // // // //                             : constraint}
// // // // //                         </li>
// // // // //                       )
// // // // //                     )}
// // // // //                   </ul>
// // // // //                 )}
// // // // //               </div>
// // // // //             )}
// // // // //           </section>

// // // // //           <section className="editor-panel">
// // // // //             <div className="editor-header">
// // // // //               <div className="editor-language">
// // // // //                 <span className="language-dot" />
// // // // //                 C++
// // // // //               </div>

// // // // //               <div className="editor-actions">
// // // // //                 <button
// // // // //                   type="button"
// // // // //                   className="run-button"
// // // // //                   disabled={
// // // // //                     running ||
// // // // //                     submitting ||
// // // // //                     secondsRemaining <= 0 ||
// // // // //                     isCurrentCompleted
// // // // //                   }
// // // // //                   onClick={
// // // // //                     handleRun
// // // // //                   }
// // // // //                 >
// // // // //                   {running
// // // // //                     ? "Running..."
// // // // //                     : "▶ Run"}
// // // // //                 </button>

// // // // //                 <button
// // // // //                   type="button"
// // // // //                   className={
// // // // //                     canSubmit
// // // // //                       ? "submit-button"
// // // // //                       : "submit-button disabled"
// // // // //                   }
// // // // //                   disabled={
// // // // //                     !canSubmit ||
// // // // //                     running ||
// // // // //                     submitting ||
// // // // //                     isCurrentCompleted
// // // // //                   }
// // // // //                   title={
// // // // //                     !canSubmit
// // // // //                       ? "Run your code successfully first"
// // // // //                       : ""
// // // // //                   }
// // // // //                   onClick={
// // // // //                     handleSubmit
// // // // //                   }
// // // // //                 >
// // // // //                   {submitting
// // // // //                     ? "Submitting..."
// // // // //                     : "Submit"}
// // // // //                 </button>
// // // // //               </div>
// // // // //             </div>

// // // // //             <textarea
// // // // //               className="code-editor"
// // // // //               spellCheck="false"
// // // // //               value={code}
// // // // //               onChange={(event) =>
// // // // //                 saveCode(
// // // // //                   event.target
// // // // //                     .value
// // // // //                 )
// // // // //               }
// // // // //               disabled={
// // // // //                 secondsRemaining <= 0 ||
// // // // //                 assessmentFinished ||
// // // // //                 (isCurrentCompleted &&
// // // // //                   !submitResult)
// // // // //               }
// // // // //             />
// // // // //           </section>

// // // // //           <section className="test-panel">
// // // // //             <div className="test-panel-header">
// // // // //               <div className="test-panel-heading">
// // // // //                 <strong>Test Cases</strong>

// // // // //                 {execution && (
// // // // //                   <span className="test-summary">
// // // // //                     {visiblePassed} / {visibleTotal} cases passed
// // // // //                   </span>
// // // // //                 )}
// // // // //               </div>

// // // // //               <div className="test-panel-statuses">
// // // // //                 {execution && executionStatus === "accepted" && (
// // // // //                   <span className="test-status-badge accepted">✓ Accepted</span>
// // // // //                 )}

// // // // //                 {execution && executionStatus === "wrong_answer" && (
// // // // //                   <span className="test-status-badge failed">Wrong Answer</span>
// // // // //                 )}

// // // // //                 {execution && executionStatus === "tle" && (
// // // // //                   <span className="test-status-badge tle">TLE</span>
// // // // //                 )}

// // // // //                 {execution && executionStatus === "compile_error" && (
// // // // //                   <span className="test-status-badge failed">Compile Error</span>
// // // // //                 )}

// // // // //                 {execution && executionStatus === "runtime_error" && (
// // // // //                   <span className="test-status-badge failed">Runtime Error</span>
// // // // //                 )}

// // // // //                 {submitResult && (
// // // // //                   <span className="hidden-summary">
// // // // //                     Hidden {hiddenPassed} / {hiddenTotal} · Failed {hiddenFailed}
// // // // //                   </span>
// // // // //                 )}
// // // // //               </div>
// // // // //             </div>

// // // // //             <div className="test-result-body">
// // // // //               {execution && (
// // // // //                 <div className="execution-overview">
// // // // //                   <div className="execution-overview-main">
// // // // //                     <strong>
// // // // //                       {visiblePassed} / {visibleTotal} cases passed
// // // // //                     </strong>

// // // // //                     {execution.execution_time_ms != null && (
// // // // //                       <span>
// // // // //                         {Number(execution.execution_time_ms).toFixed(0)} ms
// // // // //                       </span>
// // // // //                     )}
// // // // //                   </div>

// // // // //                   {submitResult && (
// // // // //                     <div className="execution-hidden-summary">
// // // // //                       <span>Hidden {hiddenPassed} / {hiddenTotal}</span>
// // // // //                       <span>Hidden failed {hiddenFailed}</span>
// // // // //                     </div>
// // // // //                   )}
// // // // //                 </div>
// // // // //               )}

// // // // //               {execution?.error && (
// // // // //                 <div className="execution-error-card">
// // // // //                   <div className="execution-error-title">
// // // // //                     {executionStatus === "tle"
// // // // //                       ? "Time Limit Exceeded"
// // // // //                       : executionStatus === "compile_error"
// // // // //                       ? "Compilation Error"
// // // // //                       : executionStatus === "runtime_error"
// // // // //                       ? "Runtime Error"
// // // // //                       : "Execution Error"}
// // // // //                   </div>
// // // // //                   <pre className="execution-error">
// // // // //                     {execution.error}
// // // // //                   </pre>
// // // // //                 </div>
// // // // //               )}

// // // // //               {(execution?.tests?.length
// // // // //                 ? execution.tests
// // // // //                 : visibleTestCases
// // // // //               ).map((test, index) => {
// // // // //                 const hasExecution = Boolean(execution?.tests?.length);
// // // // //                 const passed = hasExecution ? test.passed === true : null;
// // // // //                 const input = test.input ?? test.input_data ?? "";
// // // // //                 const expected =
// // // // //                   test.expected_output ?? test.expected ?? "";
// // // // //                 const actual =
// // // // //                   test.actual_output ?? test.stdout ?? "";

// // // // //                 return (
// // // // //                   <article
// // // // //                     className={`test-case-card ${
// // // // //                       passed === true
// // // // //                         ? "pass"
// // // // //                         : passed === false
// // // // //                         ? "fail"
// // // // //                         : "pending"
// // // // //                     }`}
// // // // //                     key={`${test.test_number ?? index + 1}-${index}`}
// // // // //                   >
// // // // //                     <div className="test-case-card-header">
// // // // //                       <strong>Test Case {test.test_number ?? index + 1}</strong>

// // // // //                       <span
// // // // //                         className={`test-case-status-pill ${
// // // // //                           passed === true
// // // // //                             ? "pass"
// // // // //                             : passed === false
// // // // //                             ? "fail"
// // // // //                             : "pending"
// // // // //                         }`}
// // // // //                       >
// // // // //                         {passed === true
// // // // //                           ? "✓ Passed"
// // // // //                           : passed === false
// // // // //                           ? "✕ Failed"
// // // // //                           : "Not Run"}
// // // // //                       </span>
// // // // //                     </div>

// // // // //                     <div className="test-case-values">
// // // // //                       <div>
// // // // //                         <span>Input</span>
// // // // //                         <pre>{formatExampleInput(input)}</pre>
// // // // //                       </div>

// // // // //                       <div>
// // // // //                         <span>Expected Output</span>
// // // // //                         <pre>{formatExampleOutput(expected)}</pre>
// // // // //                       </div>

// // // // //                       {hasExecution && (
// // // // //                         <div>
// // // // //                           <span>Your Output</span>
// // // // //                           <pre>
// // // // //                             {formatExampleOutput(actual) || "(no output)"}
// // // // //                           </pre>
// // // // //                         </div>
// // // // //                       )}
// // // // //                     </div>

// // // // //                     {test.error && (
// // // // //                       <div className="test-case-error">
// // // // //                         {test.error}
// // // // //                       </div>
// // // // //                     )}

// // // // //                     {test.explanation && (
// // // // //                       <div className="test-case-explanation">
// // // // //                         {test.explanation}
// // // // //                       </div>
// // // // //                     )}
// // // // //                   </article>
// // // // //                 );
// // // // //               })}

// // // // //               {!visibleTestCases.length && !execution?.tests?.length && (
// // // // //                 <div className="empty-tests">
// // // // //                   You must run your code first.
// // // // //                 </div>
// // // // //               )}
// // // // //             </div>
// // // // //           </section>

// // // // //           {submitResult && (
// // // // //             <section className="submission-summary">
// // // // //               <div className="submission-summary-title">
// // // // //                 {accepted
// // // // //                   ? "Solution Accepted"
// // // // //                   : "Submission Evaluated"}
// // // // //               </div>

// // // // //               <div className="submission-grid">
// // // // //                 <div>
// // // // //                   <span>
// // // // //                     Approach
// // // // //                   </span>

// // // // //                   <strong>
// // // // //                     {judgement?.approach_name ||
// // // // //                       judgement?.approach_level ||
// // // // //                       "Evaluated"}
// // // // //                   </strong>
// // // // //                 </div>

// // // // //                 <div>
// // // // //                   <span>
// // // // //                     Time Complexity
// // // // //                   </span>

// // // // //                   <strong>
// // // // //                     {judgement?.time_complexity ||
// // // // //                       "—"}
// // // // //                   </strong>
// // // // //                 </div>

// // // // //                 <div>
// // // // //                   <span>
// // // // //                     Space Complexity
// // // // //                   </span>

// // // // //                   <strong>
// // // // //                     {judgement?.space_complexity ||
// // // // //                       "—"}
// // // // //                   </strong>
// // // // //                 </div>
// // // // //               </div>

// // // // //               {submitResult && hiddenFailed > 0 && (
// // // // //                 <div className="failed-tests-summary">
// // // // //                   <strong>Hidden tests failed: {hiddenFailed}</strong>
// // // // //                   <span>Hidden test inputs and expected outputs remain private.</span>
// // // // //                 </div>
// // // // //               )}

// // // // //               {execution?.tests?.some((test) => test?.passed === false) && (
// // // // //                 <div className="failed-tests-summary visible-failed">
// // // // //                   <strong>Failed visible test cases</strong>
// // // // //                   <span>Open the test cases above to review the input, expected output, and your output.</span>
// // // // //                 </div>
// // // // //               )}
// // // // //             </section>
// // // // //           )}

// // // // //           <section className="candidate-ask-section">
// // // // //             <div className="candidate-ask-interviewer">
// // // // //               <div className="candidate-ask-heading">
// // // // //                 <div>
// // // // //                   <strong>Ask the Interviewer</strong>
// // // // //                   <span>
// // // // //                     Ask a clarification or talk through an assumption without advancing the coding question.
// // // // //                   </span>
// // // // //                 </div>
// // // // //               </div>

// // // // //               <div className="candidate-ask-row">
// // // // //                 <input
// // // // //                   type="text"
// // // // //                   value={candidateQuestion}
// // // // //                   onChange={(event) =>
// // // // //                     setCandidateQuestion(event.target.value)
// // // // //                   }
// // // // //                   onKeyDown={(event) => {
// // // // //                     if (event.key === "Enter") {
// // // // //                       askInterviewer();
// // // // //                     }
// // // // //                   }}
// // // // //                   placeholder="e.g. Can we assume all numbers are positive?"
// // // // //                   disabled={submitting || assessmentFinished}
// // // // //                 />

// // // // //                 <button
// // // // //                   type="button"
// // // // //                   className="ask-button"
// // // // //                   onClick={askInterviewer}
// // // // //                   disabled={!candidateQuestion.trim() || submitting}
// // // // //                 >
// // // // //                   Ask Interview
// // // // //                 </button>

// // // // //                 {voiceSupported && (
// // // // //                   <button
// // // // //                     type="button"
// // // // //                     className="ask-voice-button"
// // // // //                     onClick={() => {
// // // // //                       setInterviewerQuestion(
// // // // //                         "Sure. What would you like to ask me about this problem?"
// // // // //                       );
// // // // //                       setInterviewerReason(
// // // // //                         "Candidate-initiated question."
// // // // //                       );
// // // // //                       setInterviewerOpen(true);
// // // // //                       setInterviewerTranscript("");
// // // // //                       setInterviewerResponse("");
// // // // //                       setInterviewerState("idle");
// // // // //                       setTimeout(() => {
// // // // //                         if (mountedRef.current) {
// // // // //                           startListening();
// // // // //                         }
// // // // //                       }, 100);
// // // // //                     }}
// // // // //                     disabled={submitting || assessmentFinished}
// // // // //                     title="Ask the interviewer by voice"
// // // // //                   >
// // // // //                     🎙 Speak to Interviewer
// // // // //                   </button>
// // // // //                 )}
// // // // //               </div>
// // // // //             </div>
// // // // //           </section>

// // // // //           {showInterviewerPrompt &&
// // // // //             interviewerQuestion && (
// // // // //               <div className="interviewer-popup">
// // // // //                 <div className="popup-icon">
// // // // //                   🎙
// // // // //                 </div>

// // // // //                 <div className="popup-content">
// // // // //                   <div className="popup-title">
// // // // //                     AI Interviewer
// // // // //                   </div>

// // // // //                   <div className="popup-text">
// // // // //                     {interviewerReason ||
// // // // //                       "I have a question about your approach. Would you like to discuss it?"}
// // // // //                   </div>
// // // // //                 </div>

// // // // //                 <button
// // // // //                   type="button"
// // // // //                   className="ask-button"
// // // // //                   onClick={
// // // // //                     openInterviewer
// // // // //                   }
// // // // //                 >
// // // // //                   Ask Me
// // // // //                 </button>
// // // // //               </div>
// // // // //             )}

// // // // //           {interviewerOpen && (
// // // // //             <div className="voice-interview-panel">
// // // // //               <div className="voice-panel-header">
// // // // //                 <div>
// // // // //                   <strong>
// // // // //                     AI Interviewer
// // // // //                   </strong>

// // // // //                   <span>
// // // // //                     Follow-up discussion
// // // // //                   </span>
// // // // //                 </div>

// // // // //                 <button
// // // // //                   className="voice-close"
// // // // //                   onClick={
// // // // //                     closeInterviewer
// // // // //                   }
// // // // //                 >
// // // // //                   ×
// // // // //                 </button>
// // // // //               </div>

// // // // //               <div className="voice-question">
// // // // //                 <div className="voice-label">
// // // // //                   AI
// // // // //                 </div>

// // // // //                 <p>
// // // // //                   {interviewerQuestion}
// // // // //                 </p>

// // // // //                 {interviewerState ===
// // // // //                   "speaking" && (
// // // // //                   <div className="voice-state">
// // // // //                     🔊 Speaking...
// // // // //                   </div>
// // // // //                 )}
// // // // //               </div>

// // // // //               <div className="voice-answer">
// // // // //                 <div className="voice-label">You</div>

// // // // //                 <textarea
// // // // //                   className="interviewer-text-answer"
// // // // //                   value={interviewerTranscript}
// // // // //                   onChange={(event) =>
// // // // //                     setInterviewerTranscript(event.target.value)
// // // // //                   }
// // // // //                   onKeyDown={(event) => {
// // // // //                     if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
// // // // //                       event.preventDefault();
// // // // //                       if (voiceSupported && interviewerState !== "listening" && interviewerState !== "processing") {
// // // // //                         startListening();
// // // // //                       }
// // // // //                     }
// // // // //                   }}
// // // // //                   placeholder="Type your answer here, or press Enter to start recording..."
// // // // //                   disabled={interviewerState === "processing"}
// // // // //                 />

// // // // //                 {interviewerState === "listening" && (
// // // // //                   <div className="listening-indicator">
// // // // //                     <span className="pulse" />
// // // // //                     🎙 Listening...
// // // // //                   </div>
// // // // //                 )}
// // // // //               </div>

// // // // //               {interviewerResponse && (
// // // // //                 <div className="voice-feedback">
// // // // //                   {interviewerResponse}
// // // // //                 </div>
// // // // //               )}

// // // // //               <div className="voice-actions">
// // // // //                 {voiceSupported ? (
// // // // //                   <button
// // // // //                     type="button"
// // // // //                     className="record-button"
// // // // //                     onClick={
// // // // //                       interviewerState === "listening"
// // // // //                         ? () => {
// // // // //                             try { recognitionRef.current?.stop(); } catch {}
// // // // //                           }
// // // // //                         : startListening
// // // // //                     }
// // // // //                     disabled={interviewerState === "speaking" || interviewerState === "processing"}
// // // // //                   >
// // // // //                     🎙 {interviewerState === "listening" ? "End Recording" : "Start Recording"}
// // // // //                   </button>
// // // // //                 ) : (
// // // // //                   <span className="voice-warning">Voice input is not supported in this browser.</span>
// // // // //                 )}

// // // // //                 <button
// // // // //                   type="button"
// // // // //                   className="answer-button"
// // // // //                   onClick={submitInterviewAnswer}
// // // // //                   disabled={!interviewerTranscript.trim() || interviewerState === "processing" || interviewerState === "speaking"}
// // // // //                 >
// // // // //                   Send Answer →
// // // // //                 </button>
// // // // //               </div>
// // // // //             </div>
// // // // //           )}

// // // // //           {submitResult && !isCurrentCompleted && (
// // // // //             <div className="question-navigation-footer">
// // // // //               <div>
// // // // //                 <strong>
// // // // //                   Question{" "}
// // // // //                   {currentIndex + 1}{" "}
// // // // //                   completed
// // // // //                 </strong>

// // // // //                 <span>
// // // // //                   {accepted
// // // // //                     ? "Solution accepted."
// // // // //                     : "Submission evaluated."}
// // // // //                 </span>
// // // // //               </div>

// // // // //               {currentIndex <
// // // // //               totalQuestions - 1 ? (
// // // // //                 <button
// // // // //                   className="next-button"
// // // // //                   onClick={
// // // // //                     completeAndGoNext
// // // // //                   }
// // // // //                 >
// // // // //                   Next Question →
// // // // //                 </button>
// // // // //               ) : (
// // // // //                 <button
// // // // //                   className="next-button"
// // // // //                   onClick={
// // // // //                     completeAndGoNext
// // // // //                   }
// // // // //                 >
// // // // //                   Finish Assessment ✓
// // // // //                 </button>
// // // // //               )}
// // // // //             </div>
// // // // //           )}

// // // // //           {isCurrentCompleted && (
// // // // //             <div className="review-banner">
// // // // //               This question has already been completed.
// // // // //               You are viewing it in review mode.
// // // // //             </div>
// // // // //           )}
// // // // //         </main>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }




// // // // import React, {
// // // //   useCallback,
// // // //   useEffect,
// // // //   useMemo,
// // // //   useRef,
// // // //   useState,
// // // // } from "react";
// // // // import "./CodingAssessment.css";

// // // // const API_BASE = "http://127.0.0.1:8000";

// // // // const ASSESSMENT_ID_KEY = "coding_assessment_id";
// // // // const ASSESSMENT_KEY = "coding_assessment";
// // // // const HISTORY_KEY = "coding_assessment_history";

// // // // function safeJsonParse(value, fallback = null) {
// // // //   if (typeof value !== "string") {
// // // //     return value ?? fallback;
// // // //   }

// // // //   try {
// // // //     return JSON.parse(value);
// // // //   } catch {
// // // //     return fallback;
// // // //   }
// // // // }

// // // // function normalizeArray(value) {
// // // //   if (Array.isArray(value)) {
// // // //     return value;
// // // //   }

// // // //   if (typeof value === "string") {
// // // //     const parsed = safeJsonParse(value, null);

// // // //     if (Array.isArray(parsed)) {
// // // //       return parsed;
// // // //     }

// // // //     return value
// // // //       .split("\n")
// // // //       .map((item) => item.trim())
// // // //       .filter(Boolean);
// // // //   }

// // // //   return [];
// // // // }

// // // // function normalizeExamples(value) {
// // // //   if (!value) {
// // // //     return [];
// // // //   }

// // // //   let examples = value;

// // // //   if (typeof examples === "string") {
// // // //     examples = safeJsonParse(examples, null);

// // // //     if (!examples) {
// // // //       return [];
// // // //     }
// // // //   }

// // // //   if (!Array.isArray(examples)) {
// // // //     examples = [examples];
// // // //   }

// // // //   return examples
// // // //     .map((example) => {
// // // //       if (typeof example === "string") {
// // // //         const parsed = safeJsonParse(example, null);

// // // //         if (parsed && typeof parsed === "object") {
// // // //           return parsed;
// // // //         }

// // // //         return {
// // // //           input: example,
// // // //         };
// // // //       }

// // // //       if (example && typeof example === "object") {
// // // //         if (
// // // //           typeof example.text === "string" &&
// // // //           !example.input &&
// // // //           !example.output
// // // //         ) {
// // // //           const nested = safeJsonParse(example.text, null);

// // // //           if (Array.isArray(nested)) {
// // // //             return nested[0] || example;
// // // //           }

// // // //           if (nested && typeof nested === "object") {
// // // //             return nested;
// // // //           }

// // // //           return {
// // // //             explanation: example.text,
// // // //           };
// // // //         }

// // // //         return example;
// // // //       }

// // // //       return null;
// // // //     })
// // // //     .filter(Boolean);
// // // // }

// // // // function formatExampleInput(value) {
// // // //   if (value === undefined || value === null) {
// // // //     return "";
// // // //   }

// // // //   if (typeof value === "string") {
// // // //     return value;
// // // //   }

// // // //   return JSON.stringify(value, null, 2);
// // // // }

// // // // function formatExampleOutput(value) {
// // // //   if (value === undefined || value === null) {
// // // //     return "";
// // // //   }

// // // //   if (typeof value === "string") {
// // // //     return value;
// // // //   }

// // // //   return JSON.stringify(value, null, 2);
// // // // }

// // // // function formatTime(totalSeconds) {
// // // //   const safeSeconds = Math.max(0, Number(totalSeconds) || 0);

// // // //   const hours = Math.floor(safeSeconds / 3600);
// // // //   const minutes = Math.floor((safeSeconds % 3600) / 60);
// // // //   const seconds = safeSeconds % 60;

// // // //   if (hours > 0) {
// // // //     return `${String(hours).padStart(2, "0")}:${String(
// // // //       minutes
// // // //     ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
// // // //   }

// // // //   return `${String(minutes).padStart(2, "0")}:${String(
// // // //     seconds
// // // //   ).padStart(2, "0")}`;
// // // // }

// // // // function getAssessmentId() {
// // // //   return (
// // // //     localStorage.getItem(ASSESSMENT_ID_KEY) ||
// // // //     safeJsonParse(localStorage.getItem(ASSESSMENT_KEY), {})?.assessment_id ||
// // // //     null
// // // //   );
// // // // }

// // // // function getStoredAssessment() {
// // // //   return safeJsonParse(
// // // //     localStorage.getItem(ASSESSMENT_KEY),
// // // //     {}
// // // //   );
// // // // }

// // // // function getAssessmentStartKey(assessmentId) {
// // // //   return `coding_assessment_start_${assessmentId}`;
// // // // }

// // // // function getCodeKey(assessmentId, questionIndex) {
// // // //   return `coding_assessment_code_${assessmentId}_${questionIndex}`;
// // // // }

// // // // function getSessionResultKey(assessmentId) {
// // // //   return `coding_assessment_result_${assessmentId}`;
// // // // }

// // // // function extractAssessmentQuestion(payload) {
// // // //   if (!payload) {
// // // //     return null;
// // // //   }

// // // //   if (payload.question) {
// // // //     return payload.question;
// // // //   }

// // // //   if (payload.current_question) {
// // // //     return payload.current_question;
// // // //   }

// // // //   if (payload.next_question) {
// // // //     return payload.next_question;
// // // //   }

// // // //   if (payload.assessment?.question) {
// // // //     return payload.assessment.question;
// // // //   }

// // // //   return null;
// // // // }

// // // // function extractExecution(payload) {
// // // //   if (!payload) {
// // // //     return null;
// // // //   }

// // // //   return (
// // // //     payload.execution ||
// // // //     payload.result ||
// // // //     payload.execution_result ||
// // // //     null
// // // //   );
// // // // }

// // // // function extractJudgement(payload) {
// // // //   if (!payload) {
// // // //     return null;
// // // //   }

// // // //   return (
// // // //     payload.judgement ||
// // // //     payload.solution_judgement ||
// // // //     payload.evaluation ||
// // // //     null
// // // //   );
// // // // }

// // // // function extractInterviewer(payload) {
// // // //   if (!payload) {
// // // //     return null;
// // // //   }

// // // //   return (
// // // //     payload.interviewer ||
// // // //     payload.interviewer_event ||
// // // //     payload.event ||
// // // //     null
// // // //   );
// // // // }

// // // // function getVisiblePassed(execution) {
// // // //   if (!execution) {
// // // //     return 0;
// // // //   }

// // // //   return Number(
// // // //     execution.visible_passed_tests ??
// // // //       execution.passed_tests ??
// // // //       execution.passed ??
// // // //       0
// // // //   );
// // // // }

// // // // function getVisibleTotal(execution) {
// // // //   if (!execution) {
// // // //     return 0;
// // // //   }

// // // //   return Number(
// // // //     execution.visible_total_tests ??
// // // //       execution.total_tests ??
// // // //       execution.tests?.length ??
// // // //       0
// // // //   );
// // // // }

// // // // function getHiddenPassed(execution) {
// // // //   if (!execution) {
// // // //     return 0;
// // // //   }

// // // //   return Number(
// // // //     execution.hidden_passed_tests ??
// // // //       execution.hidden_passed ??
// // // //       0
// // // //   );
// // // // }

// // // // function getHiddenTotal(execution) {
// // // //   if (!execution) {
// // // //     return 0;
// // // //   }

// // // //   return Number(
// // // //     execution.hidden_total_tests ??
// // // //       execution.hidden_total ??
// // // //       0
// // // //   );
// // // // }

// // // // function getHiddenFailed(execution) {
// // // //   const passed = getHiddenPassed(execution);
// // // //   const total = getHiddenTotal(execution);

// // // //   if (!total) {
// // // //     return Number(execution?.hidden_failed_tests ?? 0);
// // // //   }

// // // //   return Math.max(0, total - passed);
// // // // }

// // // // function isAccepted(judgement, execution) {
// // // //   if (
// // // //     judgement &&
// // // //     typeof judgement.correct === "boolean"
// // // //   ) {
// // // //     return judgement.correct;
// // // //   }

// // // //   if (
// // // //     execution &&
// // // //     typeof execution.passed === "boolean"
// // // //   ) {
// // // //     return execution.passed;
// // // //   }

// // // //   return false;
// // // // }

// // // // function getStarterCode(question, assessmentId, questionIndex) {
// // // //   const stored = localStorage.getItem(
// // // //     getCodeKey(assessmentId, questionIndex)
// // // //   );

// // // //   // An empty saved editor value must NOT hide the default boilerplate.
// // // //   if (typeof stored === "string" && stored.trim()) {
// // // //     return stored;
// // // //   }

// // // //   const fallbackStarter = `#include <bits/stdc++.h>
// // // // using namespace std;

// // // // int main() {
// // // //     // Enter the code here

// // // //     return 0;
// // // // }
// // // // `;

// // // //   // Prefer a real C++ starter only when it contains a main block.
// // // //   // This keeps the assessment editor in stdin/stdout main()-based format.
// // // //   const questionStarter =
// // // //     typeof question?.starter_code === "string"
// // // //       ? question.starter_code
// // // //       : "";
// // // //   const questionTemplate =
// // // //     typeof question?.code_template === "string"
// // // //       ? question.code_template
// // // //       : "";

// // // //   if (questionStarter.trim() && /\bint\s+main\s*\(/.test(questionStarter)) {
// // // //     return questionStarter;
// // // //   }

// // // //   if (questionTemplate.trim() && /\bint\s+main\s*\(/.test(questionTemplate)) {
// // // //     return questionTemplate;
// // // //   }

// // // //   return fallbackStarter;
// // // // }

// // // // function getSpeechRecognitionConstructor() {
// // // //   return (
// // // //     window.SpeechRecognition ||
// // // //     window.webkitSpeechRecognition ||
// // // //     null
// // // //   );
// // // // }

// // // // function speakText(text, onEnd) {
// // // //   if (!text) {
// // // //     onEnd?.();
// // // //     return;
// // // //   }

// // // //   if (!("speechSynthesis" in window)) {
// // // //     onEnd?.();
// // // //     return;
// // // //   }

// // // //   window.speechSynthesis.cancel();

// // // //   const utterance = new SpeechSynthesisUtterance(text);

// // // //   utterance.rate = 0.95;
// // // //   utterance.pitch = 1;
// // // //   utterance.volume = 1;

// // // //   utterance.onend = () => {
// // // //     onEnd?.();
// // // //   };

// // // //   utterance.onerror = () => {
// // // //     onEnd?.();
// // // //   };

// // // //   window.speechSynthesis.speak(utterance);
// // // // }


// // // // const codingAssessmentFinalStyles = `
// // // //   .topbar-action-button {
// // // //     border: 1px solid rgba(255,255,255,.16);
// // // //     background: rgba(255,255,255,.06);
// // // //     color: inherit;
// // // //     border-radius: 7px;
// // // //     padding: 7px 10px;
// // // //     font-size: 12px;
// // // //     font-weight: 600;
// // // //     cursor: pointer;
// // // //     white-space: nowrap;
// // // //   }
// // // //   .topbar-action-button:hover { background: rgba(255,255,255,.12); }
// // // //   .topbar-action-button.secondary { opacity: .9; }
// // // //   .failed-tests-summary {
// // // //     margin-top: 14px;
// // // //     padding: 12px 14px;
// // // //     border: 1px solid rgba(255,255,255,.10);
// // // //     border-radius: 8px;
// // // //     display: flex;
// // // //     flex-direction: column;
// // // //     gap: 4px;
// // // //     font-size: 13px;
// // // //   }
// // // //   .failed-tests-summary span { opacity: .72; font-size: 12px; }
// // // //   @media (max-width: 900px) {
// // // //     .topbar-action-button { padding: 6px 8px; font-size: 11px; }
// // // //   }
// // // // `;

// // // // if (typeof document !== "undefined" && !document.getElementById("coding-assessment-final-styles")) {
// // // //   const style = document.createElement("style");
// // // //   style.id = "coding-assessment-final-styles";
// // // //   style.textContent = codingAssessmentFinalStyles;
// // // //   document.head.appendChild(style);
// // // // }

// // // // export default function CodingAssessment() {

// // // //   const [assessmentId, setAssessmentId] = useState(
// // // //     getAssessmentId()
// // // //   );

// // // //   const [assessment, setAssessment] = useState(
// // // //     getStoredAssessment()
// // // //   );

// // // //   const [question, setQuestion] = useState(null);

// // // //   const [currentIndex, setCurrentIndex] = useState(0);

// // // //   const [code, setCode] = useState("");

// // // //   const [loading, setLoading] = useState(true);

// // // //   const [running, setRunning] = useState(false);

// // // //   const [submitting, setSubmitting] = useState(false);

// // // //   const [error, setError] = useState("");

// // // //   const [execution, setExecution] = useState(null);

// // // //   const [visibleTestCases, setVisibleTestCases] = useState([]);

// // // //   const [judgement, setJudgement] = useState(null);

// // // //   const [submitResult, setSubmitResult] = useState(null);

// // // //   const [canSubmit, setCanSubmit] = useState(false);

// // // //   const [completedResults, setCompletedResults] =
// // // //     useState([]);

// // // //   const [secondsRemaining, setSecondsRemaining] =
// // // //     useState(0);

// // // //   const [assessmentFinished, setAssessmentFinished] =
// // // //     useState(false);

// // // //   const [timeExpired, setTimeExpired] =
// // // //     useState(false);

// // // //   const [interviewerQuestion, setInterviewerQuestion] =
// // // //     useState("");

// // // //   const [interviewerReason, setInterviewerReason] =
// // // //     useState("");

// // // //   const [showInterviewerPrompt, setShowInterviewerPrompt] =
// // // //     useState(false);

// // // //   const [interviewerOpen, setInterviewerOpen] =
// // // //     useState(false);

// // // //   const [interviewerState, setInterviewerState] =
// // // //     useState("idle");

// // // //   const [interviewerTranscript, setInterviewerTranscript] =
// // // //     useState("");

// // // //   const [interviewerResponse, setInterviewerResponse] =
// // // //     useState("");

// // // //   const [candidateQuestion, setCandidateQuestion] =
// // // //     useState("");

// // // //   const [voiceSupported, setVoiceSupported] =
// // // //     useState(false);

// // // //   const [liveObservation, setLiveObservation] =
// // // //     useState(false);

// // // //   const [jumpMessage, setJumpMessage] =
// // // //     useState("");

// // // //   const [showExamples, setShowExamples] =
// // // //     useState(true);

// // // //   const [showConstraints, setShowConstraints] =
// // // //     useState(true);

// // // //   const recognitionRef = useRef(null);

// // // //   const liveTimerRef = useRef(null);

// // // //   // Keep the interviewer discussion bounded so it cannot enter an
// // // //   // endless follow-up loop on a single coding question.
// // // //   const MAX_INTERVIEWER_QUESTIONS = 3;
// // // //   const interviewerQuestionCountRef = useRef(0);

// // // //   const mountedRef = useRef(true);
// // // //   const interviewerGreetingShownRef = useRef(false);

// // // //   const lastSubmittedCodeRef = useRef("");

// // // //   const durationMinutes = Number(
// // // //     assessment?.duration_minutes || 15
// // // //   );

// // // //   const questions = Array.isArray(
// // // //     assessment?.questions
// // // //   )
// // // //     ? assessment.questions
// // // //     : [];

// // // //   const totalQuestions =
// // // //     Number(
// // // //       assessment?.question_count ||
// // // //         questions.length ||
// // // //         1
// // // //     );

// // // //   useEffect(() => {
// // // //     // Each coding question gets its own small interviewer discussion.
// // // //     interviewerQuestionCountRef.current = 0;
// // // //   }, [currentIndex]);

// // // //   const examples = useMemo(
// // // //     () => normalizeExamples(question?.examples),
// // // //     [question?.examples]
// // // //   );

// // // //   const constraints = useMemo(
// // // //     () => normalizeArray(question?.constraints),
// // // //     [question?.constraints]
// // // //   );

// // // //   const visiblePassed = getVisiblePassed(execution);

// // // //   const visibleTotal = getVisibleTotal(execution);

// // // //   const hiddenPassed = getHiddenPassed(
// // // //     submitResult?.execution || execution
// // // //   );

// // // //   const hiddenTotal = getHiddenTotal(
// // // //     submitResult?.execution || execution
// // // //   );

// // // //   const hiddenFailed = getHiddenFailed(
// // // //     submitResult?.execution || execution
// // // //   );

// // // //   const accepted = isAccepted(
// // // //     judgement,
// // // //     submitResult?.execution || execution
// // // //   );

// // // //   const executionStatus = useMemo(() => {
// // // //     const message = String(execution?.error || "").toLowerCase();

// // // //     if (!execution) {
// // // //       return "idle";
// // // //     }

// // // //     if (
// // // //       message.includes("timed out") ||
// // // //       message.includes("time limit") ||
// // // //       message.includes("timeout")
// // // //     ) {
// // // //       return "tle";
// // // //     }

// // // //     if (
// // // //       message.includes("compilation") ||
// // // //       message.includes("g++") ||
// // // //       message.includes("error:") && !execution?.tests?.length
// // // //     ) {
// // // //       return "compile_error";
// // // //     }

// // // //     if (message || execution?.stderr) {
// // // //       return "runtime_error";
// // // //     }

// // // //     if (execution?.passed) {
// // // //       return "accepted";
// // // //     }

// // // //     return "wrong_answer";
// // // //   }, [execution]);

// // // //   const isCurrentCompleted =
// // // //     completedResults.some(
// // // //       (item) =>
// // // //         Number(item?.question_number) ===
// // // //         currentIndex + 1
// // // //     );

// // // //   const clearInterviewer = useCallback(() => {
// // // //     if (recognitionRef.current) {
// // // //       try {
// // // //         recognitionRef.current.stop();
// // // //       } catch {
// // // //         // Ignore browser recognition stop errors.
// // // //       }
// // // //     }

// // // //     recognitionRef.current = null;

// // // //     if ("speechSynthesis" in window) {
// // // //       window.speechSynthesis.cancel();
// // // //     }

// // // //     setInterviewerState("idle");
// // // //   }, []);

// // // //   const saveCode = useCallback(
// // // //     (value) => {
// // // //       setCode(value);

// // // //       if (assessmentId !== null) {
// // // //         localStorage.setItem(
// // // //           getCodeKey(
// // // //             assessmentId,
// // // //             currentIndex
// // // //           ),
// // // //           value
// // // //         );
// // // //       }

// // // //       setCanSubmit(false);

// // // //       if (execution) {
// // // //         setExecution(null);
// // // //       }

// // // //       if (submitResult) {
// // // //         setSubmitResult(null);
// // // //       }

// // // //       if (judgement) {
// // // //         setJudgement(null);
// // // //       }
// // // //     },
// // // //     [
// // // //       assessmentId,
// // // //       currentIndex,
// // // //       execution,
// // // //       submitResult,
// // // //       judgement,
// // // //     ]
// // // //   );

// // // //   const loadQuestion = useCallback(
// // // //     async (index = 0) => {
// // // //       if (!assessmentId) {
// // // //         setError(
// // // //           "No active coding assessment was found."
// // // //         );
// // // //         setLoading(false);
// // // //         return;
// // // //       }

// // // //       try {
// // // //         setLoading(true);
// // // //         setError("");

// // // //         const assessmentResponse =
// // // //           await fetch(
// // // //             `${API_BASE}/api/coding/assessment/${assessmentId}`
// // // //           );

// // // //         if (assessmentResponse.ok) {
// // // //           const assessmentData =
// // // //             await assessmentResponse.json();

// // // //           setAssessment(assessmentData);

// // // //           localStorage.setItem(
// // // //             ASSESSMENT_KEY,
// // // //             JSON.stringify(assessmentData)
// // // //           );

// // // //           const storedSessionResult = safeJsonParse(
// // // //             localStorage.getItem(
// // // //               getSessionResultKey(assessmentId)
// // // //             ),
// // // //             null
// // // //           );

// // // //           if (
// // // //             Array.isArray(storedSessionResult?.results)
// // // //           ) {
// // // //             setCompletedResults(
// // // //               storedSessionResult.results
// // // //             );
// // // //           }

// // // //           if (assessmentData.completed) {
// // // //             setAssessmentFinished(true);
// // // //             window.location.href = "/coding-result";
// // // //             return;
// // // //           }
// // // //         }

// // // //         const questionResponse =
// // // //           await fetch(
// // // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question?question_index=${index}`
// // // //           );

// // // //         if (!questionResponse.ok) {
// // // //           const body =
// // // //             await questionResponse.json().catch(
// // // //               () => null
// // // //             );

// // // //           if (
// // // //             body?.detail ===
// // // //               "Assessment has already been completed." ||
// // // //             body?.detail ===
// // // //               "Assessment has no remaining questions."
// // // //           ) {
// // // //             setAssessmentFinished(true);
// // // //             window.location.href = "/coding-result";
// // // //             return;
// // // //           }

// // // //           throw new Error(
// // // //             body?.detail ||
// // // //               "Could not load assessment question."
// // // //           );
// // // //         }

// // // //         const questionData =
// // // //           await questionResponse.json();

// // // //         const resolvedQuestion =
// // // //           extractAssessmentQuestion(
// // // //             questionData
// // // //           ) || questionData;

// // // //         setQuestion(resolvedQuestion);
// // // //         setVisibleTestCases([]);

// // // //         // Load the real candidate-visible test bank. If the endpoint is
// // // //         // unavailable, keep the problem examples as a safe fallback.
// // // //         const fallbackTests = normalizeExamples(
// // // //           resolvedQuestion?.examples
// // // //         ).map((item, itemIndex) => ({
// // // //           test_number: itemIndex + 1,
// // // //           input: item?.input ?? item?.stdin ?? "",
// // // //           expected_output:
// // // //             item?.expected_output ??
// // // //             item?.output ??
// // // //             item?.expected ??
// // // //             "",
// // // //           explanation: item?.explanation || "",
// // // //         }));

// // // //         try {
// // // //           const testsResponse = await fetch(
// // // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/tests?question_index=${index}`
// // // //           );

// // // //           if (testsResponse.ok) {
// // // //             const testsData = await testsResponse.json();
// // // //             const serverTests = Array.isArray(testsData?.tests)
// // // //               ? testsData.tests
// // // //               : [];
// // // //             setVisibleTestCases(
// // // //               serverTests.length ? serverTests : fallbackTests
// // // //             );
// // // //           } else {
// // // //             setVisibleTestCases(fallbackTests);
// // // //           }
// // // //         } catch {
// // // //           setVisibleTestCases(fallbackTests);
// // // //         }

// // // //         const resolvedIndex = Number(
// // // //           resolvedQuestion?.question_number
// // // //             ? resolvedQuestion.question_number - 1
// // // //             : index
// // // //         );

// // // //         setCurrentIndex(
// // // //           Math.max(0, resolvedIndex)
// // // //         );

// // // //         const savedCode =
// // // //           localStorage.getItem(
// // // //             getCodeKey(
// // // //               assessmentId,
// // // //               Math.max(0, resolvedIndex)
// // // //             )
// // // //           );

// // // //         const starterCode =
// // // //           getStarterCode(
// // // //             resolvedQuestion,
// // // //             assessmentId,
// // // //             Math.max(0, resolvedIndex)
// // // //           );

// // // //         setCode(
// // // //           typeof savedCode === "string" && savedCode.trim()
// // // //             ? savedCode
// // // //             : starterCode
// // // //         );

// // // //         setExecution(null);
// // // //         setJudgement(null);
// // // //         setSubmitResult(null);
// // // //         setCanSubmit(false);

// // // //         lastSubmittedCodeRef.current = "";

// // // //         clearInterviewer();
// // // //       } catch (err) {
// // // //         if (mountedRef.current) {
// // // //           setError(
// // // //             err?.message ||
// // // //               "Unable to load coding assessment."
// // // //           );
// // // //         }
// // // //       } finally {
// // // //         if (mountedRef.current) {
// // // //           setLoading(false);
// // // //         }
// // // //       }
// // // //     },
// // // //     [
// // // //       assessmentId,
// // // //       clearInterviewer,
// // // //     ]
// // // //   );

// // // //   useEffect(() => {
// // // //     mountedRef.current = true;

// // // //     const SpeechRecognition =
// // // //       getSpeechRecognitionConstructor();

// // // //     setVoiceSupported(
// // // //       Boolean(SpeechRecognition)
// // // //     );

// // // //     return () => {
// // // //       mountedRef.current = false;

// // // //       if (liveTimerRef.current) {
// // // //         clearTimeout(liveTimerRef.current);
// // // //       }

// // // //       clearInterviewer();
// // // //     };
// // // //   }, [clearInterviewer]);

// // // //   useEffect(() => {
// // // //     if (
// // // //       !question ||
// // // //       interviewerGreetingShownRef.current
// // // //     ) {
// // // //       return;
// // // //     }

// // // //     interviewerGreetingShownRef.current = true;

// // // //     const greeting =
// // // //       "Hi. Can you please solve this problem? Take a moment to understand it, then walk me through your approach. I will be here if you want to discuss any assumption or clarification.";

// // // //     const timer = setTimeout(() => {
// // // //       speakText(greeting);
// // // //     }, 500);

// // // //     return () => clearTimeout(timer);
// // // //   }, [question]);

// // // //   useEffect(() => {
// // // //     if (
// // // //       !question ||
// // // //       interviewerGreetingShownRef.current
// // // //     ) {
// // // //       return;
// // // //     }

// // // //     interviewerGreetingShownRef.current = true;

// // // //     const greeting =
// // // //       "Hi. Can you please solve this problem? Take a moment to understand it, then walk me through your approach. I will be here if you want to discuss an assumption or ask me a question.";

// // // //     const timer = setTimeout(() => {
// // // //       speakText(greeting);
// // // //     }, 600);

// // // //     return () => clearTimeout(timer);
// // // //   }, [question]);

// // // //   useEffect(() => {
// // // //     if (!assessmentId) {
// // // //       return;
// // // //     }

// // // //     const startKey =
// // // //       getAssessmentStartKey(assessmentId);

// // // //     let startedAt =
// // // //       Number(
// // // //         localStorage.getItem(startKey)
// // // //       ) || 0;

// // // //     if (!startedAt) {
// // // //       startedAt = Date.now();

// // // //       localStorage.setItem(
// // // //         startKey,
// // // //         String(startedAt)
// // // //       );
// // // //     }

// // // //     const totalSeconds =
// // // //       durationMinutes * 60;

// // // //     const updateTimer = () => {
// // // //       const elapsed = Math.floor(
// // // //         (Date.now() - startedAt) / 1000
// // // //       );

// // // //       const remaining = Math.max(
// // // //         0,
// // // //         totalSeconds - elapsed
// // // //       );

// // // //       setSecondsRemaining(remaining);

// // // //       if (remaining <= 0) {
// // // //         setError(
// // // //           "Assessment time has expired."
// // // //         );
// // // //         setTimeExpired(true);
// // // //         setAssessmentFinished(true);
// // // //         clearInterviewer();
// // // //       }
// // // //     };

// // // //     updateTimer();

// // // //     const interval = setInterval(
// // // //       updateTimer,
// // // //       1000
// // // //     );

// // // //     return () => clearInterval(interval);
// // // //   }, [
// // // //     assessmentId,
// // // //     durationMinutes,
// // // //     clearInterviewer,
// // // //   ]);

// // // //   useEffect(() => {
// // // //     if (!assessmentId) {
// // // //       return;
// // // //     }

// // // //     let cancelled = false;

// // // //     const initializeQuestion = async () => {
// // // //       try {
// // // //         await startQuestion();
// // // //         if (!cancelled) {
// // // //           await loadQuestion(currentIndex);
// // // //         }
// // // //       } catch {
// // // //         // loadQuestion surfaces the useful API error.
// // // //       }
// // // //     };

// // // //     initializeQuestion();

// // // //     return () => {
// // // //       cancelled = true;
// // // //     };
// // // //   }, [assessmentId]);

// // // //   useEffect(() => {
// // // //     if (!assessmentId) {
// // // //       return;
// // // //     }

// // // //     localStorage.setItem(
// // // //       getCodeKey(
// // // //         assessmentId,
// // // //         currentIndex
// // // //       ),
// // // //       code
// // // //     );
// // // //   }, [
// // // //     assessmentId,
// // // //     currentIndex,
// // // //     code,
// // // //   ]);

// // // //   const requestLiveObservation =
// // // //     useCallback(async () => {
// // // //       if (
// // // //         !assessmentId ||
// // // //         !code.trim() ||
// // // //         code.trim().length < 20 ||
// // // //         submitResult ||
// // // //         assessmentFinished
// // // //       ) {
// // // //         return;
// // // //       }

// // // //       try {
// // // //         setLiveObservation(true);

// // // //         const response =
// // // //           await fetch(
// // // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/live`,
// // // //             {
// // // //               method: "POST",
// // // //               headers: {
// // // //                 "Content-Type":
// // // //                   "application/json",
// // // //               },
// // // //               body: JSON.stringify({
// // // //                 code,
// // // //                 question_index: currentIndex,
// // // //                 language:
// // // //                   assessment?.language ||
// // // //                   "cpp",
// // // //               }),
// // // //             }
// // // //           );

// // // //         if (!response.ok) {
// // // //           return;
// // // //         }

// // // //         const data =
// // // //           await response.json();

// // // //         const interviewer =
// // // //           extractInterviewer(data);

// // // //         const newQuestion =
// // // //           interviewer?.question ||
// // // //           data?.question ||
// // // //           "";

// // // //         if (
// // // //           newQuestion &&
// // // //           interviewerQuestionCountRef.current <
// // // //             MAX_INTERVIEWER_QUESTIONS
// // // //         ) {
// // // //           interviewerQuestionCountRef.current += 1;

// // // //           setInterviewerQuestion(
// // // //             newQuestion
// // // //           );

// // // //           setInterviewerReason(
// // // //             interviewer?.reason ||
// // // //               "I have a question about your approach."
// // // //           );

// // // //           setShowInterviewerPrompt(
// // // //             true
// // // //           );

// // // //           // The interviewer may interrupt with a meaningful question,
// // // //           // but NEVER start the candidate microphone automatically.
// // // //           setInterviewerOpen(true);
// // // //           setInterviewerState("speaking");
// // // //           speakText(newQuestion, () => {
// // // //             if (mountedRef.current) {
// // // //               setInterviewerState("idle");
// // // //             }
// // // //           });
// // // //         }
// // // //       } catch {
// // // //         // Live observation is intentionally
// // // //         // non-blocking for coding.
// // // //       } finally {
// // // //         if (mountedRef.current) {
// // // //           setLiveObservation(false);
// // // //         }
// // // //       }
// // // //     }, [
// // // //       assessmentId,
// // // //       code,
// // // //       submitResult,
// // // //       assessmentFinished,
// // // //       currentIndex,
// // // //       assessment?.language,
// // // //     ]);

// // // //   useEffect(() => {
// // // //     if (!code.trim()) {
// // // //       return;
// // // //     }

// // // //     if (liveTimerRef.current) {
// // // //       clearTimeout(
// // // //         liveTimerRef.current
// // // //       );
// // // //     }

// // // //     liveTimerRef.current =
// // // //       setTimeout(
// // // //         requestLiveObservation,
// // // //         4000
// // // //       );

// // // //     return () => {
// // // //       if (liveTimerRef.current) {
// // // //         clearTimeout(
// // // //           liveTimerRef.current
// // // //         );
// // // //       }
// // // //     };
// // // //   }, [
// // // //     code,
// // // //     requestLiveObservation,
// // // //   ]);

// // // //   const startQuestion = useCallback(
// // // //     async (index = currentIndex) => {
// // // //       if (!assessmentId) {
// // // //         return;
// // // //       }

// // // //       try {
// // // //         const response =
// // // //           await fetch(
// // // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/start?question_index=${index}`,
// // // //             {
// // // //               method: "POST",
// // // //               headers: {
// // // //                 "Content-Type":
// // // //                   "application/json",
// // // //               },
// // // //             }
// // // //           );

// // // //         if (!response.ok) {
// // // //           const body =
// // // //             await response.json().catch(
// // // //               () => null
// // // //             );

// // // //           if (
// // // //             body?.detail?.includes(
// // // //               "already been completed"
// // // //             )
// // // //           ) {
// // // //             window.location.href = "/coding-result";
// // // //             return;
// // // //           }

// // // //           throw new Error(
// // // //             body?.detail ||
// // // //               "Could not start question."
// // // //           );
// // // //         }
// // // //       } catch (err) {
// // // //         setError(
// // // //           err?.message ||
// // // //             "Could not start coding question."
// // // //         );
// // // //       }
// // // //     },
// // // //     [assessmentId, currentIndex]
// // // //   );

// // // //   const handleRun = useCallback(
// // // //     async () => {
// // // //       if (
// // // //         !assessmentId ||
// // // //         !code.trim() ||
// // // //         running ||
// // // //         submitting ||
// // // //         secondsRemaining <= 0
// // // //       ) {
// // // //         return;
// // // //       }

// // // //       try {
// // // //         setRunning(true);
// // // //         setError("");

// // // //         setExecution(null);
// // // //         setSubmitResult(null);
// // // //         setJudgement(null);
// // // //         setCanSubmit(false);

// // // //         const response =
// // // //           await fetch(
// // // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/run`,
// // // //             {
// // // //               method: "POST",
// // // //               headers: {
// // // //                 "Content-Type":
// // // //                   "application/json",
// // // //               },
// // // //               body: JSON.stringify({
// // // //                 code,
// // // //                 question_index: currentIndex,
// // // //                 language:
// // // //                   assessment?.language ||
// // // //                   "cpp",
// // // //               }),
// // // //             }
// // // //           );

// // // //         const data =
// // // //           await response.json().catch(
// // // //             () => null
// // // //           );

// // // //         if (!response.ok) {
// // // //           throw new Error(
// // // //             data?.detail ||
// // // //               "Code execution failed."
// // // //           );
// // // //         }

// // // //         const result =
// // // //           extractExecution(data) ||
// // // //           data;

// // // //         setExecution(result);

// // // //         const passed =
// // // //           data?.can_submit === true ||
// // // //           result?.passed === true ||
// // // //           (
// // // //             getVisibleTotal(result) > 0 &&
// // // //             getVisiblePassed(result) ===
// // // //               getVisibleTotal(result)
// // // //           );

// // // //         setCanSubmit(passed);

// // // //         if (!passed) {
// // // //           setError(
// // // //             "Fix the failing visible tests and Run again before submitting."
// // // //           );
// // // //         }
// // // //       } catch (err) {
// // // //         setError(
// // // //           err?.message ||
// // // //             "Could not execute your code."
// // // //         );
// // // //       } finally {
// // // //         setRunning(false);
// // // //       }
// // // //     },
// // // //     [
// // // //       assessmentId,
// // // //       code,
// // // //       running,
// // // //       submitting,
// // // //       secondsRemaining,
// // // //       assessment?.language,
// // // //     ]
// // // //   );

// // // //   const buildQuestionResult = useCallback(
// // // //     (
// // // //       submitData,
// // // //       resultExecution,
// // // //       resultJudgement,
// // // //       resultInterviewer
// // // //     ) => {
// // // //       const finalExecution =
// // // //         resultExecution ||
// // // //         extractExecution(
// // // //           submitData
// // // //         ) ||
// // // //         {};

// // // //       const finalJudgement =
// // // //         resultJudgement ||
// // // //         extractJudgement(
// // // //           submitData
// // // //         ) ||
// // // //         {};

// // // //       const finalInterviewer =
// // // //         resultInterviewer ||
// // // //         extractInterviewer(
// // // //           submitData
// // // //         ) ||
// // // //         {};

// // // //       return {
// // // //         question_number:
// // // //           question?.question_number ??
// // // //           currentIndex + 1,

// // // //         problem_id:
// // // //           question?.problem_id,

// // // //         title:
// // // //           question?.title ||
// // // //           "Coding Question",

// // // //         category:
// // // //           question?.category,

// // // //         difficulty:
// // // //           question?.difficulty,

// // // //         code,

// // // //         accepted:
// // // //           isAccepted(
// // // //             finalJudgement,
// // // //             finalExecution
// // // //           ),

// // // //         // Normalized fields used by CodingResult/History. Keep the
// // // //         // original execution/judgement fields below untouched.
// // // //         passed:
// // // //           isAccepted(
// // // //             finalJudgement,
// // // //             finalExecution
// // // //           ),

// // // //         submitted: true,

// // // //         score:
// // // //           Number.isFinite(Number(finalJudgement?.score))
// // // //             ? Number(finalJudgement.score)
// // // //             : Number.isFinite(Number(finalJudgement?.rating))
// // // //             ? Number(finalJudgement.rating)
// // // //             : isAccepted(finalJudgement, finalExecution)
// // // //             ? 10
// // // //             : 0,

// // // //         passed_tests:
// // // //           getVisiblePassed(finalExecution) +
// // // //           getHiddenPassed(finalExecution),

// // // //         total_tests:
// // // //           getVisibleTotal(finalExecution) +
// // // //           getHiddenTotal(finalExecution),

// // // //         visible_passed_tests:
// // // //           getVisiblePassed(
// // // //             finalExecution
// // // //           ),

// // // //         visible_total_tests:
// // // //           getVisibleTotal(
// // // //             finalExecution
// // // //           ),

// // // //         hidden_passed_tests:
// // // //           getHiddenPassed(
// // // //             finalExecution
// // // //           ),

// // // //         hidden_total_tests:
// // // //           getHiddenTotal(
// // // //             finalExecution
// // // //           ),

// // // //         hidden_failed_tests:
// // // //           getHiddenFailed(
// // // //             finalExecution
// // // //           ),

// // // //         execution_time_ms:
// // // //           finalExecution?.execution_time_ms ??
// // // //           finalExecution?.execution_time ??
// // // //           null,

// // // //         feedback:
// // // //           finalJudgement?.reasoning ||
// // // //           finalJudgement?.feedback ||
// // // //           "",

// // // //         approach:
// // // //           finalJudgement?.approach_name ||
// // // //           finalJudgement?.approach_level ||
// // // //           "",

// // // //         time_complexity:
// // // //           finalJudgement?.time_complexity ||
// // // //           "",

// // // //         space_complexity:
// // // //           finalJudgement?.space_complexity ||
// // // //           "",

// // // //         optimal:
// // // //           finalJudgement?.optimal,

// // // //         strengths:
// // // //           finalJudgement?.strengths || [],

// // // //         weaknesses:
// // // //           finalJudgement?.weaknesses || [],

// // // //         interviewer_question:
// // // //           finalInterviewer?.question ||
// // // //           finalJudgement?.recommended_follow_up ||
// // // //           "",

// // // //         interviewer_reason:
// // // //           finalInterviewer?.reason ||
// // // //           "",

// // // //         submitted_at:
// // // //           new Date().toISOString(),
// // // //       };
// // // //     },
// // // //     [
// // // //       question,
// // // //       currentIndex,
// // // //       code,
// // // //     ]
// // // //   );

// // // //   const saveSessionResult = useCallback(
// // // //     (results) => {
// // // //       if (!assessmentId) {
// // // //         return;
// // // //       }

// // // //       const existingHistory =
// // // //         safeJsonParse(
// // // //           localStorage.getItem(
// // // //             HISTORY_KEY
// // // //           ),
// // // //           []
// // // //         );

// // // //       const safeHistory =
// // // //         Array.isArray(existingHistory)
// // // //           ? existingHistory
// // // //           : [];

// // // //       const resultObject = {
// // // //         assessment_id:
// // // //           assessmentId,

// // // //         mode:
// // // //           assessment?.mode ||
// // // //           "personalized",

// // // //         company:
// // // //           assessment?.company ||
// // // //           null,

// // // //         role:
// // // //           assessment?.role ||
// // // //           null,

// // // //         topics:
// // // //           assessment?.topics ||
// // // //           [],

// // // //         question_count:
// // // //           totalQuestions,

// // // //         duration_minutes:
// // // //           durationMinutes,

// // // //         completed: true,

// // // //         completed_at:
// // // //           new Date().toISOString(),

// // // //         results,
// // // //       };

// // // //       const withoutCurrent =
// // // //         safeHistory.filter(
// // // //           (item) =>
// // // //             item?.assessment_id !==
// // // //             assessmentId
// // // //         );

// // // //       withoutCurrent.push(
// // // //         resultObject
// // // //       );

// // // //       localStorage.setItem(
// // // //         HISTORY_KEY,
// // // //         JSON.stringify(
// // // //           withoutCurrent
// // // //         )
// // // //       );

// // // //       localStorage.setItem(
// // // //         getSessionResultKey(
// // // //           assessmentId
// // // //         ),
// // // //         JSON.stringify(
// // // //           resultObject
// // // //         )
// // // //       );

// // // //       localStorage.setItem(
// // // //         "coding_assessment_result",
// // // //         JSON.stringify(
// // // //           resultObject
// // // //         )
// // // //       );
// // // //     },
// // // //     [
// // // //       assessmentId,
// // // //       assessment?.mode,
// // // //       assessment?.company,
// // // //       assessment?.role,
// // // //       assessment?.topics,
// // // //       totalQuestions,
// // // //       durationMinutes,
// // // //     ]
// // // //   );

// // // //   useEffect(() => {
// // // //     if (!timeExpired || !assessmentId) {
// // // //       return;
// // // //     }

// // // //     // Preserve whatever has already been completed so the feedback page
// // // //     // remains useful even when the timer expires before the final question.
// // // //     saveSessionResult(completedResults);
// // // //   }, [
// // // //     timeExpired,
// // // //     assessmentId,
// // // //     completedResults,
// // // //     saveSessionResult,
// // // //   ]);

// // // //   const handleSubmit = useCallback(
// // // //     async () => {
// // // //       if (
// // // //         !assessmentId ||
// // // //         !code.trim() ||
// // // //         submitting ||
// // // //         running ||
// // // //         !canSubmit ||
// // // //         secondsRemaining <= 0
// // // //       ) {
// // // //         return;
// // // //       }

// // // //       if (
// // // //         lastSubmittedCodeRef.current &&
// // // //         lastSubmittedCodeRef.current !==
// // // //           code
// // // //       ) {
// // // //         setError(
// // // //           "Your code changed after the last Run. Run it again before submitting."
// // // //         );
// // // //         setCanSubmit(false);
// // // //         return;
// // // //       }

// // // //       try {
// // // //         setSubmitting(true);
// // // //         setError("");

// // // //         const response =
// // // //           await fetch(
// // // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/submit`,
// // // //             {
// // // //               method: "POST",
// // // //               headers: {
// // // //                 "Content-Type":
// // // //                   "application/json",
// // // //               },
// // // //               body: JSON.stringify({
// // // //                 code,
// // // //                 question_index: currentIndex,
// // // //                 language:
// // // //                   assessment?.language ||
// // // //                   "cpp",
// // // //               }),
// // // //             }
// // // //           );

// // // //         const data =
// // // //           await response.json().catch(
// // // //             () => null
// // // //           );

// // // //         if (!response.ok) {
// // // //           throw new Error(
// // // //             data?.detail ||
// // // //               "Submission failed."
// // // //           );
// // // //         }

// // // //         const finalExecution =
// // // //           extractExecution(data) ||
// // // //           {};

// // // //         const finalJudgement =
// // // //           extractJudgement(data) ||
// // // //           {};

// // // //         const finalInterviewer =
// // // //           extractInterviewer(data) ||
// // // //           {};

// // // //         setSubmitResult(data);
// // // //         setExecution(finalExecution);
// // // //         setJudgement(finalJudgement);

// // // //         lastSubmittedCodeRef.current =
// // // //           code;

// // // //         setCanSubmit(false);

// // // //         const questionResult =
// // // //           buildQuestionResult(
// // // //             data,
// // // //             finalExecution,
// // // //             finalJudgement,
// // // //             finalInterviewer
// // // //           );

// // // //         const updatedResults = [
// // // //           ...completedResults,
// // // //           questionResult,
// // // //         ];

// // // //         const uniqueResults =
// // // //           updatedResults.filter(
// // // //             (item, index, array) =>
// // // //               array.findIndex(
// // // //                 (candidate) =>
// // // //                   candidate?.question_number ===
// // // //                   item?.question_number
// // // //               ) === index
// // // //           );

// // // //         setCompletedResults(
// // // //           uniqueResults
// // // //         );

// // // //         localStorage.setItem(
// // // //           getSessionResultKey(
// // // //             assessmentId
// // // //           ),
// // // //           JSON.stringify({
// // // //             ...safeJsonParse(
// // // //               localStorage.getItem(
// // // //                 getSessionResultKey(
// // // //                   assessmentId
// // // //                 )
// // // //               ),
// // // //               {}
// // // //             ),
// // // //             assessment_id:
// // // //               assessmentId,
// // // //             mode:
// // // //               assessment?.mode ||
// // // //               "personalized",
// // // //             results:
// // // //               uniqueResults,
// // // //           })
// // // //         );

// // // //         const followUpQuestion =
// // // //           finalInterviewer?.question ||
// // // //           finalJudgement?.recommended_follow_up ||
// // // //           (isAccepted(
// // // //             finalJudgement,
// // // //             finalExecution
// // // //           )
// // // //             ? "Walk me through your approach and explain its time and space complexity."
// // // //             : "");

// // // //         setInterviewerQuestion(
// // // //           followUpQuestion
// // // //         );

// // // //         setInterviewerReason(
// // // //           finalInterviewer?.reason ||
// // // //             (followUpQuestion
// // // //               ? "Let's discuss your solution and the reasoning behind it."
// // // //               : "Let's discuss your solution.")
// // // //         );

// // // //         if (followUpQuestion) {
// // // //           setShowInterviewerPrompt(true);
// // // //         }
// // // //       } catch (err) {
// // // //         setError(
// // // //           err?.message ||
// // // //             "Could not submit solution."
// // // //         );
// // // //       } finally {
// // // //         setSubmitting(false);
// // // //       }
// // // //     },
// // // //     [
// // // //       assessmentId,
// // // //       code,
// // // //       submitting,
// // // //       running,
// // // //       canSubmit,
// // // //       secondsRemaining,
// // // //       assessment?.language,
// // // //       assessment?.mode,
// // // //       completedResults,
// // // //       buildQuestionResult,
// // // //     ]
// // // //   );

// // // //   const openInterviewer =
// // // //     useCallback(() => {
// // // //       if (!interviewerQuestion) {
// // // //         return;
// // // //       }

// // // //       setShowInterviewerPrompt(false);
// // // //       setInterviewerOpen(true);
// // // //       setInterviewerTranscript("");
// // // //       setInterviewerResponse("");
// // // //       setInterviewerState("speaking");

// // // //       speakText(
// // // //         interviewerQuestion,
// // // //         () => {
// // // //           if (
// // // //             mountedRef.current
// // // //           ) {
// // // //             setInterviewerState(
// // // //               "idle"
// // // //             );
// // // //           }
// // // //         }
// // // //       );
// // // //     }, [interviewerQuestion]);

// // // //   const startListening =
// // // //     useCallback(() => {
// // // //       const Recognition =
// // // //         getSpeechRecognitionConstructor();

// // // //       if (!Recognition) {
// // // //         setError(
// // // //           "Voice input is not supported by this browser."
// // // //         );
// // // //         return;
// // // //       }

// // // //       if (recognitionRef.current) {
// // // //         try {
// // // //           recognitionRef.current.stop();
// // // //         } catch {
// // // //           // Ignore.
// // // //         }
// // // //       }

// // // //       const recognition =
// // // //         new Recognition();

// // // //       recognition.lang = "en-US";
// // // //       recognition.interimResults = true;
// // // //       recognition.continuous = false;

// // // //       recognition.onstart = () => {
// // // //         setInterviewerState(
// // // //           "listening"
// // // //         );
// // // //       };

// // // //       recognition.onresult = (
// // // //         event
// // // //       ) => {
// // // //         let transcript = "";

// // // //         for (
// // // //           let i = event.resultIndex;
// // // //           i < event.results.length;
// // // //           i++
// // // //         ) {
// // // //           transcript +=
// // // //             event.results[i][0]
// // // //               .transcript;
// // // //         }

// // // //         setInterviewerTranscript(
// // // //           transcript
// // // //         );
// // // //       };

// // // //       recognition.onerror = (
// // // //         event
// // // //       ) => {
// // // //         setInterviewerState(
// // // //           "idle"
// // // //         );

// // // //         if (
// // // //           event?.error ===
// // // //           "not-allowed"
// // // //         ) {
// // // //           setError(
// // // //             "Microphone permission was denied."
// // // //           );
// // // //         }
// // // //       };

// // // //       recognition.onend = () => {
// // // //         setInterviewerState(
// // // //           "idle"
// // // //         );

// // // //         setInterviewerTranscript(
// // // //           (previous) =>
// // // //             previous.trim()
// // // //         );
// // // //       };

// // // //       recognitionRef.current =
// // // //         recognition;

// // // //       recognition.start();
// // // //     }, []);

// // // //   const submitInterviewAnswer =
// // // //     useCallback(async () => {
// // // //       const answer =
// // // //         interviewerTranscript.trim();

// // // //       if (!answer) {
// // // //         return;
// // // //       }

// // // //       setInterviewerState(
// // // //         "processing"
// // // //       );

// // // //       try {
// // // //         const response =
// // // //           await fetch(
// // // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/interview-answer`,
// // // //             {
// // // //               method: "POST",
// // // //               headers: {
// // // //                 "Content-Type":
// // // //                   "application/json",
// // // //               },
// // // //               body: JSON.stringify({
// // // //                 answer,
// // // //                 question:
// // // //                   interviewerQuestion,
// // // //                 code,
// // // //                 question_index: currentIndex,
// // // //                 language:
// // // //                   assessment?.language ||
// // // //                   "cpp",
// // // //               }),
// // // //             }
// // // //           );

// // // //         const data =
// // // //           await response.json().catch(
// // // //             () => null
// // // //           );

// // // //         if (!response.ok) {
// // // //           throw new Error(
// // // //             data?.detail ||
// // // //               "Could not process interview answer."
// // // //           );
// // // //         }

// // // //         const nextQuestion =
// // // //           data?.question ||
// // // //           data?.interviewer?.question ||
// // // //           data?.next_question ||
// // // //           "";

// // // //         const responseText =
// // // //           data?.response ||
// // // //           data?.message ||
// // // //           data?.feedback ||
// // // //           "";

// // // //         setInterviewerResponse(
// // // //           responseText
// // // //         );

// // // //         if (
// // // //           nextQuestion &&
// // // //           interviewerQuestionCountRef.current <
// // // //             MAX_INTERVIEWER_QUESTIONS
// // // //         ) {
// // // //           interviewerQuestionCountRef.current += 1;

// // // //           setInterviewerQuestion(
// // // //             nextQuestion
// // // //           );

// // // //           setInterviewerTranscript(
// // // //             ""
// // // //           );

// // // //           setInterviewerState(
// // // //             "speaking"
// // // //           );

// // // //           speakText(
// // // //             nextQuestion,
// // // //             () => {
// // // //               if (
// // // //                 mountedRef.current
// // // //               ) {
// // // //                 // Candidate must explicitly click Start Recording.
// // // //                 setInterviewerState(
// // // //                   "idle"
// // // //                 );
// // // //               }
// // // //             }
// // // //           );
// // // //         } else {
// // // //           if (responseText) {
// // // //             speakText(
// // // //               responseText,
// // // //               () => {
// // // //                 if (
// // // //                   mountedRef.current
// // // //                 ) {
// // // //                   setInterviewerState(
// // // //                     "idle"
// // // //                   );
// // // //                 }
// // // //               }
// // // //             );
// // // //           } else {
// // // //             setInterviewerState(
// // // //               "idle"
// // // //             );
// // // //           }
// // // //         }
// // // //       } catch (err) {
// // // //         setInterviewerState(
// // // //           "idle"
// // // //         );

// // // //         setError(
// // // //           err?.message ||
// // // //             "Could not process your interview answer."
// // // //         );
// // // //       }
// // // //     }, [
// // // //       assessmentId,
// // // //       interviewerTranscript,
// // // //       interviewerQuestion,
// // // //       code,
// // // //       currentIndex,
// // // //       assessment?.language,
// // // //     ]);

// // // //   const askInterviewer = useCallback(async () => {
// // // //     const asked = candidateQuestion.trim();

// // // //     if (!assessmentId || !asked) {
// // // //       return;
// // // //     }

// // // //     try {
// // // //       setError("");
// // // //       setInterviewerResponse("");
// // // //       setInterviewerState("thinking");

// // // //       const response = await fetch(
// // // //         `${API_BASE}/api/coding/assessment/${assessmentId}/question/interview-answer`,
// // // //         {
// // // //           method: "POST",
// // // //           headers: {
// // // //             "Content-Type": "application/json",
// // // //           },
// // // //           body: JSON.stringify({
// // // //             answer: asked,
// // // //             question: interviewerQuestion || "Candidate clarification",
// // // //             code,
// // // //             question_index: currentIndex,
// // // //             action: "clarification",
// // // //           }),
// // // //         }
// // // //       );

// // // //       const data = await response.json().catch(() => null);

// // // //       if (!response.ok) {
// // // //         throw new Error(
// // // //           data?.detail || "Could not contact the interviewer."
// // // //         );
// // // //       }

// // // //       const reply =
// // // //         data?.response ||
// // // //         "I can clarify the assumptions without giving away the solution.";

// // // //       const clarificationQuestion =
// // // //         data?.question ||
// // // //         data?.interviewer?.question ||
// // // //         "";

// // // //       setCandidateQuestion("");
// // // //       setInterviewerResponse(reply);

// // // //       if (
// // // //         clarificationQuestion &&
// // // //         interviewerQuestionCountRef.current <
// // // //           MAX_INTERVIEWER_QUESTIONS
// // // //       ) {
// // // //         interviewerQuestionCountRef.current += 1;
// // // //         setInterviewerQuestion(clarificationQuestion);
// // // //       }

// // // //       setInterviewerState("speaking");

// // // //       speakText(
// // // //         clarificationQuestion || reply,
// // // //         () => {
// // // //           if (mountedRef.current) {
// // // //             // Never auto-start microphone after AI speaks.
// // // //             setInterviewerState("idle");
// // // //           }
// // // //         }
// // // //       );
// // // //     } catch (err) {
// // // //       setInterviewerState("idle");
// // // //       setError(
// // // //         err?.message ||
// // // //           "Could not contact the interviewer."
// // // //       );
// // // //     }
// // // //   }, [
// // // //     assessmentId,
// // // //     candidateQuestion,
// // // //     interviewerQuestion,
// // // //     code,
// // // //     currentIndex,
// // // //   ]);

// // // //   const closeInterviewer =
// // // //     useCallback(() => {
// // // //       clearInterviewer();

// // // //       setInterviewerOpen(false);
// // // //       setShowInterviewerPrompt(false);
// // // //     }, [clearInterviewer]);

// // // //   const completeAndGoNext =
// // // //     useCallback(async () => {
// // // //       if (
// // // //         !assessmentId ||
// // // //         !submitResult
// // // //       ) {
// // // //         return;
// // // //       }

// // // //       try {
// // // //         setError("");

// // // //         const result =
// // // //           buildQuestionResult(
// // // //             submitResult,
// // // //             execution,
// // // //             judgement,
// // // //             extractInterviewer(
// // // //               submitResult
// // // //             )
// // // //           );

// // // //         const mergedResults =
// // // //           completedResults.some(
// // // //             (item) =>
// // // //               item?.question_number ===
// // // //               result?.question_number
// // // //           )
// // // //             ? completedResults
// // // //             : [
// // // //                 ...completedResults,
// // // //                 result,
// // // //               ];

// // // //         const response =
// // // //           await fetch(
// // // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/complete`,
// // // //             {
// // // //               method: "POST",
// // // //               headers: {
// // // //                 "Content-Type":
// // // //                   "application/json",
// // // //               },
// // // //               body: JSON.stringify({
// // // //                 result,
// // // //               }),
// // // //             }
// // // //           );

// // // //         const data =
// // // //           await response.json().catch(
// // // //             () => null
// // // //           );

// // // //         if (!response.ok) {
// // // //           throw new Error(
// // // //             data?.detail ||
// // // //               "Could not complete question."
// // // //           );
// // // //         }

// // // //         if (
// // // //           data?.completed === true
// // // //         ) {
// // // //           saveSessionResult(
// // // //             mergedResults
// // // //           );

// // // //           setAssessmentFinished(
// // // //             true
// // // //           );

// // // //           // Keep the candidate on the assessment page and show the
// // // //           // completion actions. The feedback button performs the
// // // //           // navigation after the candidate chooses it.
// // // //           return;
// // // //         }

// // // //         setCompletedResults(
// // // //           mergedResults
// // // //         );

// // // //         const nextIndex =
// // // //           currentIndex + 1;

// // // //         setCurrentIndex(
// // // //           nextIndex
// // // //         );

// // // //         setQuestion(null);
// // // //         setExecution(null);
// // // //         setJudgement(null);
// // // //         setSubmitResult(null);
// // // //         setCanSubmit(false);
// // // //         setInterviewerQuestion("");
// // // //         setInterviewerTranscript("");
// // // //         setInterviewerResponse("");

// // // //         clearInterviewer();

// // // //         await startQuestion();

// // // //         await loadQuestion(
// // // //           nextIndex
// // // //         );
// // // //       } catch (err) {
// // // //         setError(
// // // //           err?.message ||
// // // //             "Could not move to the next question."
// // // //         );
// // // //       }
// // // //     }, [
// // // //       assessmentId,
// // // //       submitResult,
// // // //       buildQuestionResult,
// // // //       execution,
// // // //       judgement,
// // // //       completedResults,
// // // //       saveSessionResult,
// // // //       currentIndex,
// // // //       clearInterviewer,
// // // //       startQuestion,
// // // //       loadQuestion,
// // // //     ]);

// // // //   const jumpToQuestion =
// // // //     useCallback(
// // // //       async (index) => {
// // // //         if (index < 0 || index >= totalQuestions) {
// // // //           return;
// // // //         }

// // // //         if (index === currentIndex) {
// // // //           return;
// // // //         }

// // // //         setJumpMessage("");
// // // //         setCurrentIndex(index);
// // // //         setQuestion(null);
// // // //         setExecution(null);
// // // //         setJudgement(null);
// // // //         setSubmitResult(null);
// // // //         setCanSubmit(false);
// // // //         setInterviewerQuestion("");
// // // //         setInterviewerTranscript("");
// // // //         setInterviewerResponse("");
// // // //         clearInterviewer();

// // // //         // IMPORTANT: a question switch must update the backend coding
// // // //         // session before loading tests. Otherwise Q2 can display Q1's
// // // //         // test bank (the exact bug seen in the assessment UI).
// // // //         await startQuestion(index);
// // // //         await loadQuestion(index);
// // // //       },
// // // //       [
// // // //         currentIndex,
// // // //         totalQuestions,
// // // //         clearInterviewer,
// // // //         startQuestion,
// // // //         loadQuestion,
// // // //       ]
// // // //     );

// // // //   const goDashboard =
// // // //     useCallback(() => {
// // // //       window.location.href = "/";
// // // //     }, []);

// // // //   const goFeedback =
// // // //     useCallback(() => {
// // // //       window.location.href = "/coding-result";
// // // //     }, []);

// // // //   const handleExitAssessment = useCallback(() => {
// // // //     if (assessmentId) {
// // // //       saveSessionResult(completedResults);
// // // //     }
// // // //     window.location.href = "/coding-result";
// // // //   }, [assessmentId, completedResults, saveSessionResult]);

// // // //   const handleReturnDashboard = useCallback(() => {
// // // //     if (assessmentId) {
// // // //       saveSessionResult(completedResults);
// // // //     }
// // // //     window.location.href = "/";
// // // //   }, [assessmentId, completedResults, saveSessionResult]);

// // // //   const timerDanger =
// // // //     secondsRemaining <= 300;

// // // //   const timerText =
// // // //     formatTime(
// // // //       secondsRemaining
// // // //     );

// // // //   if (loading && !question) {
// // // //     return (
// // // //       <div className="coding-page">
// // // //         <div className="coding-loading">
// // // //           <div className="coding-spinner" />
// // // //           <p>
// // // //             Preparing your coding assessment...
// // // //           </p>
// // // //         </div>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   if (
// // // //     assessmentFinished
// // // //   ) {
// // // //     return (
// // // //       <div className="coding-page">
// // // //         <div className="coding-complete">
// // // //           <div className="complete-icon">
// // // //             ✓
// // // //           </div>

// // // //           <h1>
// // // //             {timeExpired
// // // //               ? "Time's Up"
// // // //               : "Assessment Complete"}
// // // //           </h1>

// // // //           <p>
// // // //             {timeExpired
// // // //               ? "Your assessment time has ended. Your completed work has been saved and is available in AI feedback."
// // // //               : "Your coding assessment has been completed successfully."}
// // // //           </p>

// // // //           <div className="complete-actions">
// // // //             <button
// // // //               className="primary-button"
// // // //               onClick={
// // // //                 handleExitAssessment
// // // //               }
// // // //             >
// // // //               View AI Feedback
// // // //             </button>

// // // //             <button
// // // //               className="secondary-button"
// // // //               onClick={
// // // //                 handleReturnDashboard
// // // //               }
// // // //             >
// // // //               Return to Dashboard
// // // //             </button>
// // // //           </div>
// // // //         </div>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div className="coding-page">
// // // //       <header className="coding-topbar">
// // // //         <div className="coding-brand">
// // // //           <span>AI Coding Assessment</span>
// // // //           <div className="top-interviewer">
// // // //             <span className="top-interviewer-dot" />
// // // //             <span className="top-interviewer-name">AI Interviewer</span>
// // // //             <span className="top-interviewer-status">
// // // //               {liveObservation ? "Observing" : "Available"}
// // // //             </span>
// // // //           </div>
// // // //         </div>

// // // //         <div className="coding-topbar-right">
// // // //           <span>
// // // //             {assessment?.mode ===
// // // //             "company_oa"
// // // //               ? "Company OA"
// // // //               : assessment?.mode ===
// // // //                 "contest"
// // // //               ? "Contest"
// // // //               : "Personalized"}
// // // //           </span>

// // // //           <span className="topbar-divider">
// // // //             |
// // // //           </span>

// // // //           <span>
// // // //             Question{" "}
// // // //             {currentIndex + 1} /{" "}
// // // //             {totalQuestions}
// // // //           </span>

// // // //           <span
// // // //             className={
// // // //               timerDanger
// // // //                 ? "timer danger"
// // // //                 : "timer"
// // // //             }
// // // //           >
// // // //             ⏱ {timerText}
// // // //           </span>

// // // //           <button
// // // //             type="button"
// // // //             className="topbar-action-button"
// // // //             onClick={handleExitAssessment}
// // // //             title="Open AI feedback and assessment results"
// // // //           >
// // // //             AI Feedback
// // // //           </button>

// // // //           <button
// // // //             type="button"
// // // //             className="topbar-action-button secondary"
// // // //             onClick={handleReturnDashboard}
// // // //             title="Leave the assessment and return to dashboard"
// // // //           >
// // // //             Dashboard
// // // //           </button>
// // // //         </div>
// // // //       </header>

// // // //       <div className="coding-workspace">
// // // //         <aside className="question-sidebar">
// // // //           <div className="sidebar-title">
// // // //             Questions
// // // //           </div>

// // // //           <div className="question-list">
// // // //             {Array.from({
// // // //               length: totalQuestions,
// // // //             }).map(
// // // //               (_, index) => {
// // // //                 const result =
// // // //                   completedResults.find(
// // // //                     (item) =>
// // // //                       Number(
// // // //                         item?.question_number
// // // //                       ) ===
// // // //                       index + 1
// // // //                   );

// // // //                 const isCurrent =
// // // //                   index ===
// // // //                   currentIndex;

// // // //                 const isCompleted =
// // // //                   Boolean(result);

// // // //                 return (
// // // //                   <button
// // // //                     type="button"
// // // //                     key={index}
// // // //                     className={[
// // // //                       "question-pill",
// // // //                       isCurrent
// // // //                         ? "active"
// // // //                         : "",
// // // //                       isCompleted
// // // //                         ? "completed"
// // // //                         : "",
// // // //                     ]
// // // //                       .filter(Boolean)
// // // //                       .join(" ")}
// // // //                     onClick={() =>
// // // //                       jumpToQuestion(index)
// // // //                     }
// // // //                     aria-current={
// // // //                       isCurrent ? "step" : undefined
// // // //                     }
// // // //                   >
// // // //                     <span className="question-pill-number">
// // // //                       {isCompleted
// // // //                         ? "✓"
// // // //                         : index + 1}
// // // //                     </span>

// // // //                     <span>
// // // //                       Question{" "}
// // // //                       {index + 1}
// // // //                     </span>
// // // //                   </button>
// // // //                 );
// // // //               }
// // // //             )}
// // // //           </div>

// // // //           <div className="sidebar-bottom">
// // // //             <button
// // // //               className="dashboard-link"
// // // //               onClick={
// // // //                 goDashboard
// // // //               }
// // // //             >
// // // //               ← Dashboard
// // // //             </button>
// // // //           </div>
// // // //         </aside>

// // // //         <main className="coding-main">
// // // //           {error && (
// // // //             <div className="coding-alert">
// // // //               <span>{error}</span>

// // // //               <button
// // // //                 onClick={() =>
// // // //                   setError("")
// // // //                 }
// // // //               >
// // // //                 ×
// // // //               </button>
// // // //             </div>
// // // //           )}

// // // //           {jumpMessage && (
// // // //             <div className="jump-message">
// // // //               {jumpMessage}
// // // //             </div>
// // // //           )}

// // // //           <section className="problem-panel">
// // // //             <div className="problem-header">
// // // //               <div>
// // // //                 <div className="problem-meta">
// // // //                   <span>
// // // //                     {question?.difficulty ||
// // // //                       "Medium"}
// // // //                   </span>

// // // //                   <span>·</span>

// // // //                   <span>
// // // //                     {question?.category ||
// // // //                       "Algorithms"}
// // // //                   </span>
// // // //                 </div>

// // // //                 <h1>
// // // //                   {question?.title ||
// // // //                     "Coding Problem"}
// // // //                 </h1>
// // // //               </div>

// // // //               <div className="problem-number">
// // // //                 {currentIndex + 1}/
// // // //                 {totalQuestions}
// // // //               </div>
// // // //             </div>

// // // //             <div className="problem-statement">
// // // //               {question?.statement ||
// // // //                 question?.description ||
// // // //                 "Solve the problem using an efficient algorithm."}
// // // //             </div>

// // // //             <div className="problem-section">
// // // //               <button
// // // //                 className="section-toggle"
// // // //                 onClick={() =>
// // // //                   setShowExamples(
// // // //                     (value) =>
// // // //                       !value
// // // //                   )
// // // //                 }
// // // //               >
// // // //                 <span>
// // // //                   Examples
// // // //                 </span>

// // // //                 <span>
// // // //                   {showExamples
// // // //                     ? "⌃"
// // // //                     : "⌄"}
// // // //                 </span>
// // // //               </button>

// // // //               {showExamples &&
// // // //                 examples.slice(0, 3).map(
// // // //                   (
// // // //                     example,
// // // //                     index
// // // //                   ) => (
// // // //                     <div
// // // //                       className="example-card"
// // // //                       key={index}
// // // //                     >
// // // //                       <div className="example-title">
// // // //                         Example{" "}
// // // //                         {index + 1}
// // // //                       </div>

// // // //                       {example.input !==
// // // //                         undefined && (
// // // //                         <div className="example-row">
// // // //                           <div className="example-label">
// // // //                             Input
// // // //                           </div>

// // // //                           <pre>
// // // //                             {formatExampleInput(
// // // //                               example.input
// // // //                             )}
// // // //                           </pre>
// // // //                         </div>
// // // //                       )}

// // // //                       {example.output !==
// // // //                         undefined && (
// // // //                         <div className="example-row">
// // // //                           <div className="example-label">
// // // //                             Output
// // // //                           </div>

// // // //                           <pre>
// // // //                             {formatExampleOutput(
// // // //                               example.output
// // // //                             )}
// // // //                           </pre>
// // // //                         </div>
// // // //                       )}

// // // //                       {example.expected_output !==
// // // //                         undefined && (
// // // //                         <div className="example-row">
// // // //                           <div className="example-label">
// // // //                             Output
// // // //                           </div>

// // // //                           <pre>
// // // //                             {formatExampleOutput(
// // // //                               example.expected_output
// // // //                             )}
// // // //                           </pre>
// // // //                         </div>
// // // //                       )}

// // // //                       {example.explanation && (
// // // //                         <div className="example-explanation">
// // // //                           {example.explanation}
// // // //                         </div>
// // // //                       )}
// // // //                     </div>
// // // //                   )
// // // //                 )}

// // // //               {showExamples && examples.length > 3 && (
// // // //                 <div className="examples-more-note">
// // // //                   Showing the first 3 examples. Review the problem statement for the remaining examples.
// // // //                 </div>
// // // //               )}
// // // //             </div>

// // // //             {constraints.length >
// // // //               0 && (
// // // //               <div className="problem-section">
// // // //                 <button
// // // //                   className="section-toggle"
// // // //                   onClick={() =>
// // // //                     setShowConstraints(
// // // //                       (value) =>
// // // //                         !value
// // // //                     )
// // // //                   }
// // // //                 >
// // // //                   <span>
// // // //                     Constraints
// // // //                   </span>

// // // //                   <span>
// // // //                     {showConstraints
// // // //                       ? "⌃"
// // // //                       : "⌄"}
// // // //                   </span>
// // // //                 </button>

// // // //                 {showConstraints && (
// // // //                   <ul className="constraints-list">
// // // //                     {constraints.map(
// // // //                       (
// // // //                         constraint,
// // // //                         index
// // // //                       ) => (
// // // //                         <li
// // // //                           key={
// // // //                             index
// // // //                           }
// // // //                         >
// // // //                           {typeof constraint ===
// // // //                           "object"
// // // //                             ? JSON.stringify(
// // // //                                 constraint
// // // //                               )
// // // //                             : constraint}
// // // //                         </li>
// // // //                       )
// // // //                     )}
// // // //                   </ul>
// // // //                 )}
// // // //               </div>
// // // //             )}
// // // //           </section>

// // // //           <section className="editor-panel">
// // // //             <div className="editor-header">
// // // //               <div className="editor-language">
// // // //                 <span className="language-dot" />
// // // //                 C++
// // // //               </div>

// // // //               <div className="editor-actions">
// // // //                 <button
// // // //                   type="button"
// // // //                   className="run-button"
// // // //                   disabled={
// // // //                     running ||
// // // //                     submitting ||
// // // //                     secondsRemaining <= 0 ||
// // // //                     isCurrentCompleted
// // // //                   }
// // // //                   onClick={
// // // //                     handleRun
// // // //                   }
// // // //                 >
// // // //                   {running
// // // //                     ? "Running..."
// // // //                     : "▶ Run"}
// // // //                 </button>

// // // //                 <button
// // // //                   type="button"
// // // //                   className={
// // // //                     canSubmit
// // // //                       ? "submit-button"
// // // //                       : "submit-button disabled"
// // // //                   }
// // // //                   disabled={
// // // //                     !canSubmit ||
// // // //                     running ||
// // // //                     submitting ||
// // // //                     isCurrentCompleted
// // // //                   }
// // // //                   title={
// // // //                     !canSubmit
// // // //                       ? "Run your code successfully first"
// // // //                       : ""
// // // //                   }
// // // //                   onClick={
// // // //                     handleSubmit
// // // //                   }
// // // //                 >
// // // //                   {submitting
// // // //                     ? "Submitting..."
// // // //                     : "Submit"}
// // // //                 </button>
// // // //               </div>
// // // //             </div>

// // // //             <textarea
// // // //               className="code-editor"
// // // //               spellCheck="false"
// // // //               value={code}
// // // //               onChange={(event) =>
// // // //                 saveCode(
// // // //                   event.target
// // // //                     .value
// // // //                 )
// // // //               }
// // // //               disabled={
// // // //                 secondsRemaining <= 0 ||
// // // //                 assessmentFinished ||
// // // //                 (isCurrentCompleted &&
// // // //                   !submitResult)
// // // //               }
// // // //             />
// // // //           </section>

// // // //           <section className="test-panel">
// // // //             <div className="test-panel-header">
// // // //               <div className="test-panel-heading">
// // // //                 <strong>Test Cases</strong>

// // // //                 {execution && (
// // // //                   <span className="test-summary">
// // // //                     {visiblePassed} / {visibleTotal} cases passed
// // // //                   </span>
// // // //                 )}
// // // //               </div>

// // // //               <div className="test-panel-statuses">
// // // //                 {execution && executionStatus === "accepted" && (
// // // //                   <span className="test-status-badge accepted">✓ Accepted</span>
// // // //                 )}

// // // //                 {execution && executionStatus === "wrong_answer" && (
// // // //                   <span className="test-status-badge failed">Wrong Answer</span>
// // // //                 )}

// // // //                 {execution && executionStatus === "tle" && (
// // // //                   <span className="test-status-badge tle">TLE</span>
// // // //                 )}

// // // //                 {execution && executionStatus === "compile_error" && (
// // // //                   <span className="test-status-badge failed">Compile Error</span>
// // // //                 )}

// // // //                 {execution && executionStatus === "runtime_error" && (
// // // //                   <span className="test-status-badge failed">Runtime Error</span>
// // // //                 )}

// // // //                 {submitResult && (
// // // //                   <span className="hidden-summary">
// // // //                     Hidden {hiddenPassed} / {hiddenTotal} · Failed {hiddenFailed}
// // // //                   </span>
// // // //                 )}
// // // //               </div>
// // // //             </div>

// // // //             <div className="test-result-body">
// // // //               {execution && (
// // // //                 <div className="execution-overview">
// // // //                   <div className="execution-overview-main">
// // // //                     <strong>
// // // //                       {visiblePassed} / {visibleTotal} cases passed
// // // //                     </strong>

// // // //                     {execution.execution_time_ms != null && (
// // // //                       <span>
// // // //                         {Number(execution.execution_time_ms).toFixed(0)} ms
// // // //                       </span>
// // // //                     )}
// // // //                   </div>

// // // //                   {submitResult && (
// // // //                     <div className="execution-hidden-summary">
// // // //                       <span>Hidden {hiddenPassed} / {hiddenTotal}</span>
// // // //                       <span>Hidden failed {hiddenFailed}</span>
// // // //                     </div>
// // // //                   )}
// // // //                 </div>
// // // //               )}

// // // //               {execution?.error && (
// // // //                 <div className="execution-error-card">
// // // //                   <div className="execution-error-title">
// // // //                     {executionStatus === "tle"
// // // //                       ? "Time Limit Exceeded"
// // // //                       : executionStatus === "compile_error"
// // // //                       ? "Compilation Error"
// // // //                       : executionStatus === "runtime_error"
// // // //                       ? "Runtime Error"
// // // //                       : "Execution Error"}
// // // //                   </div>
// // // //                   <pre className="execution-error">
// // // //                     {execution.error}
// // // //                   </pre>
// // // //                 </div>
// // // //               )}

// // // //               {(execution?.tests?.length
// // // //                 ? execution.tests
// // // //                 : visibleTestCases
// // // //               ).map((test, index) => {
// // // //                 const hasExecution = Boolean(execution?.tests?.length);
// // // //                 const passed = hasExecution ? test.passed === true : null;
// // // //                 const input = test.input ?? test.input_data ?? "";
// // // //                 const expected =
// // // //                   test.expected_output ?? test.expected ?? "";
// // // //                 const actual =
// // // //                   test.actual_output ?? test.stdout ?? "";

// // // //                 return (
// // // //                   <article
// // // //                     className={`test-case-card ${
// // // //                       passed === true
// // // //                         ? "pass"
// // // //                         : passed === false
// // // //                         ? "fail"
// // // //                         : "pending"
// // // //                     }`}
// // // //                     key={`${test.test_number ?? index + 1}-${index}`}
// // // //                   >
// // // //                     <div className="test-case-card-header">
// // // //                       <strong>Test Case {test.test_number ?? index + 1}</strong>

// // // //                       <span
// // // //                         className={`test-case-status-pill ${
// // // //                           passed === true
// // // //                             ? "pass"
// // // //                             : passed === false
// // // //                             ? "fail"
// // // //                             : "pending"
// // // //                         }`}
// // // //                       >
// // // //                         {passed === true
// // // //                           ? "✓ Passed"
// // // //                           : passed === false
// // // //                           ? "✕ Failed"
// // // //                           : "Not Run"}
// // // //                       </span>
// // // //                     </div>

// // // //                     <div className="test-case-values">
// // // //                       <div>
// // // //                         <span>Input</span>
// // // //                         <pre>{formatExampleInput(input)}</pre>
// // // //                       </div>

// // // //                       <div>
// // // //                         <span>Expected Output</span>
// // // //                         <pre>{formatExampleOutput(expected)}</pre>
// // // //                       </div>

// // // //                       {hasExecution && (
// // // //                         <div>
// // // //                           <span>Your Output</span>
// // // //                           <pre>
// // // //                             {formatExampleOutput(actual) || "(no output)"}
// // // //                           </pre>
// // // //                         </div>
// // // //                       )}
// // // //                     </div>

// // // //                     {test.error && (
// // // //                       <div className="test-case-error">
// // // //                         {test.error}
// // // //                       </div>
// // // //                     )}

// // // //                     {test.explanation && (
// // // //                       <div className="test-case-explanation">
// // // //                         {test.explanation}
// // // //                       </div>
// // // //                     )}
// // // //                   </article>
// // // //                 );
// // // //               })}

// // // //               {!visibleTestCases.length && !execution?.tests?.length && (
// // // //                 <div className="empty-tests">
// // // //                   You must run your code first.
// // // //                 </div>
// // // //               )}
// // // //             </div>
// // // //           </section>

// // // //           {submitResult && (
// // // //             <section className="submission-summary">
// // // //               <div className="submission-summary-title">
// // // //                 {accepted
// // // //                   ? "Solution Accepted"
// // // //                   : "Submission Evaluated"}
// // // //               </div>

// // // //               <div className="submission-grid">
// // // //                 <div>
// // // //                   <span>
// // // //                     Approach
// // // //                   </span>

// // // //                   <strong>
// // // //                     {judgement?.approach_name ||
// // // //                       judgement?.approach_level ||
// // // //                       "Evaluated"}
// // // //                   </strong>
// // // //                 </div>

// // // //                 <div>
// // // //                   <span>
// // // //                     Time Complexity
// // // //                   </span>

// // // //                   <strong>
// // // //                     {judgement?.time_complexity ||
// // // //                       "—"}
// // // //                   </strong>
// // // //                 </div>

// // // //                 <div>
// // // //                   <span>
// // // //                     Space Complexity
// // // //                   </span>

// // // //                   <strong>
// // // //                     {judgement?.space_complexity ||
// // // //                       "—"}
// // // //                   </strong>
// // // //                 </div>
// // // //               </div>

// // // //               {submitResult && hiddenFailed > 0 && (
// // // //                 <div className="failed-tests-summary">
// // // //                   <strong>Hidden tests failed: {hiddenFailed}</strong>
// // // //                   <span>Hidden test inputs and expected outputs remain private.</span>
// // // //                 </div>
// // // //               )}

// // // //               {execution?.tests?.some((test) => test?.passed === false) && (
// // // //                 <div className="failed-tests-summary visible-failed">
// // // //                   <strong>Failed visible test cases</strong>
// // // //                   <span>Open the test cases above to review the input, expected output, and your output.</span>
// // // //                 </div>
// // // //               )}
// // // //             </section>
// // // //           )}

// // // //           <section className="candidate-ask-section">
// // // //             <div className="candidate-ask-interviewer">
// // // //               <div className="candidate-ask-heading">
// // // //                 <div>
// // // //                   <strong>Ask the Interviewer</strong>
// // // //                   <span>
// // // //                     Ask a clarification or talk through an assumption without advancing the coding question.
// // // //                   </span>
// // // //                 </div>
// // // //               </div>

// // // //               <div className="candidate-ask-row">
// // // //                 <input
// // // //                   type="text"
// // // //                   value={candidateQuestion}
// // // //                   onChange={(event) =>
// // // //                     setCandidateQuestion(event.target.value)
// // // //                   }
// // // //                   onKeyDown={(event) => {
// // // //                     if (event.key === "Enter") {
// // // //                       askInterviewer();
// // // //                     }
// // // //                   }}
// // // //                   placeholder="e.g. Can we assume all numbers are positive?"
// // // //                   disabled={submitting || assessmentFinished}
// // // //                 />

// // // //                 <button
// // // //                   type="button"
// // // //                   className="ask-button"
// // // //                   onClick={askInterviewer}
// // // //                   disabled={!candidateQuestion.trim() || submitting}
// // // //                 >
// // // //                   Ask Interview
// // // //                 </button>

// // // //                 {voiceSupported && (
// // // //                   <button
// // // //                     type="button"
// // // //                     className="ask-voice-button"
// // // //                     onClick={() => {
// // // //                       setInterviewerQuestion(
// // // //                         "Sure. What would you like to ask me about this problem?"
// // // //                       );
// // // //                       setInterviewerReason(
// // // //                         "Candidate-initiated question."
// // // //                       );
// // // //                       setInterviewerOpen(true);
// // // //                       setInterviewerTranscript("");
// // // //                       setInterviewerResponse("");
// // // //                       // Do not start the microphone automatically.
// // // //                       // The candidate must explicitly click Start Recording.
// // // //                       setInterviewerState("idle");
// // // //                     }}
// // // //                     disabled={submitting || assessmentFinished}
// // // //                     title="Ask the interviewer by voice"
// // // //                   >
// // // //                     🎙 Speak to Interviewer
// // // //                   </button>
// // // //                 )}
// // // //               </div>
// // // //             </div>
// // // //           </section>

// // // //           {showInterviewerPrompt &&
// // // //             interviewerQuestion && (
// // // //               <div className="interviewer-popup">
// // // //                 <div className="popup-icon">
// // // //                   🎙
// // // //                 </div>

// // // //                 <div className="popup-content">
// // // //                   <div className="popup-title">
// // // //                     AI Interviewer
// // // //                   </div>

// // // //                   <div className="popup-text">
// // // //                     {interviewerReason ||
// // // //                       "I have a question about your approach. Would you like to discuss it?"}
// // // //                   </div>
// // // //                 </div>

// // // //                 <button
// // // //                   type="button"
// // // //                   className="ask-button"
// // // //                   onClick={
// // // //                     openInterviewer
// // // //                   }
// // // //                 >
// // // //                   Ask Me
// // // //                 </button>
// // // //               </div>
// // // //             )}

// // // //           {interviewerOpen && (
// // // //             <div className="voice-interview-panel">
// // // //               <div className="voice-panel-header">
// // // //                 <div>
// // // //                   <strong>
// // // //                     AI Interviewer
// // // //                   </strong>

// // // //                   <span>
// // // //                     Follow-up discussion
// // // //                   </span>
// // // //                 </div>

// // // //                 <button
// // // //                   className="voice-close"
// // // //                   onClick={
// // // //                     closeInterviewer
// // // //                   }
// // // //                 >
// // // //                   ×
// // // //                 </button>
// // // //               </div>

// // // //               <div className="voice-question">
// // // //                 <div className="voice-label">
// // // //                   AI
// // // //                 </div>

// // // //                 <p>
// // // //                   {interviewerQuestion}
// // // //                 </p>

// // // //                 {interviewerState ===
// // // //                   "speaking" && (
// // // //                   <div className="voice-state">
// // // //                     🔊 Speaking...
// // // //                   </div>
// // // //                 )}
// // // //               </div>

// // // //               <div className="voice-answer">
// // // //                 <div className="voice-label">You</div>

// // // //                 <textarea
// // // //                   className="interviewer-text-answer"
// // // //                   value={interviewerTranscript}
// // // //                   onChange={(event) =>
// // // //                     setInterviewerTranscript(event.target.value)
// // // //                   }
// // // //                   onKeyDown={(event) => {
// // // //                     // Enter is for normal text entry; microphone recording
// // // //                     // starts only when the candidate explicitly clicks
// // // //                     // Start Recording.
// // // //                     if (
// // // //                       event.key === "Enter" &&
// // // //                       !event.shiftKey &&
// // // //                       !event.ctrlKey &&
// // // //                       !event.metaKey
// // // //                     ) {
// // // //                       event.preventDefault();
// // // //                       if (
// // // //                         interviewerTranscript.trim() &&
// // // //                         interviewerState !== "processing" &&
// // // //                         interviewerState !== "speaking"
// // // //                       ) {
// // // //                         submitInterviewAnswer();
// // // //                       }
// // // //                     }
// // // //                   }}
// // // //                   placeholder="Type your answer, or click Start Recording to speak..."
// // // //                   disabled={interviewerState === "processing"}
// // // //                 />

// // // //                 {interviewerState === "listening" && (
// // // //                   <div className="listening-indicator">
// // // //                     <span className="pulse" />
// // // //                     🎙 Listening...
// // // //                   </div>
// // // //                 )}
// // // //               </div>

// // // //               {interviewerResponse && (
// // // //                 <div className="voice-feedback">
// // // //                   {interviewerResponse}
// // // //                 </div>
// // // //               )}

// // // //               <div className="voice-actions">
// // // //                 {voiceSupported ? (
// // // //                   <button
// // // //                     type="button"
// // // //                     className="record-button"
// // // //                     onClick={
// // // //                       interviewerState === "listening"
// // // //                         ? () => {
// // // //                             try { recognitionRef.current?.stop(); } catch {}
// // // //                           }
// // // //                         : startListening
// // // //                     }
// // // //                     disabled={interviewerState === "speaking" || interviewerState === "processing"}
// // // //                   >
// // // //                     🎙 {interviewerState === "listening" ? "End Recording" : "Start Recording"}
// // // //                   </button>
// // // //                 ) : (
// // // //                   <span className="voice-warning">Voice input is not supported in this browser.</span>
// // // //                 )}

// // // //                 <button
// // // //                   type="button"
// // // //                   className="answer-button"
// // // //                   onClick={submitInterviewAnswer}
// // // //                   disabled={!interviewerTranscript.trim() || interviewerState === "processing" || interviewerState === "speaking"}
// // // //                 >
// // // //                   Send Answer →
// // // //                 </button>
// // // //               </div>

// // // //               {/* <div className="interviewer-limit-note">
// // // //                 Follow-up limit: {MAX_INTERVIEWER_QUESTIONS} questions per coding problem.
// // // //                 Click <strong>Start Recording</strong> when you are ready to speak.
// // // //               </div> */}
// // // //             </div>
// // // //           )}

// // // //           {submitResult && !isCurrentCompleted && (
// // // //             <div className="question-navigation-footer">
// // // //               <div>
// // // //                 <strong>
// // // //                   Question{" "}
// // // //                   {currentIndex + 1}{" "}
// // // //                   completed
// // // //                 </strong>

// // // //                 <span>
// // // //                   {accepted
// // // //                     ? "Solution accepted."
// // // //                     : "Submission evaluated."}
// // // //                 </span>
// // // //               </div>

// // // //               {currentIndex <
// // // //               totalQuestions - 1 ? (
// // // //                 <button
// // // //                   className="next-button"
// // // //                   onClick={
// // // //                     completeAndGoNext
// // // //                   }
// // // //                 >
// // // //                   Next Question →
// // // //                 </button>
// // // //               ) : (
// // // //                 <button
// // // //                   className="next-button"
// // // //                   onClick={
// // // //                     completeAndGoNext
// // // //                   }
// // // //                 >
// // // //                   Finish Assessment ✓
// // // //                 </button>
// // // //               )}
// // // //             </div>
// // // //           )}

// // // //           {isCurrentCompleted && (
// // // //             <div className="review-banner">
// // // //               This question has already been completed.
// // // //               You are viewing it in review mode.
// // // //             </div>
// // // //           )}
// // // //         </main>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }



// // // import React, {
// // //   useCallback,
// // //   useEffect,
// // //   useMemo,
// // //   useRef,
// // //   useState,
// // // } from "react";
// // // import "./CodingAssessment.css";

// // // const API_BASE = "http://127.0.0.1:8000";

// // // const ASSESSMENT_ID_KEY = "coding_assessment_id";
// // // const ASSESSMENT_KEY = "coding_assessment";
// // // const HISTORY_KEY = "coding_assessment_history";

// // // function safeJsonParse(value, fallback = null) {
// // //   if (typeof value !== "string") {
// // //     return value ?? fallback;
// // //   }

// // //   try {
// // //     return JSON.parse(value);
// // //   } catch {
// // //     return fallback;
// // //   }
// // // }

// // // function normalizeArray(value) {
// // //   if (Array.isArray(value)) {
// // //     return value;
// // //   }

// // //   if (typeof value === "string") {
// // //     const parsed = safeJsonParse(value, null);

// // //     if (Array.isArray(parsed)) {
// // //       return parsed;
// // //     }

// // //     return value
// // //       .split("\n")
// // //       .map((item) => item.trim())
// // //       .filter(Boolean);
// // //   }

// // //   return [];
// // // }

// // // function normalizeExamples(value) {
// // //   if (!value) {
// // //     return [];
// // //   }

// // //   let examples = value;

// // //   if (typeof examples === "string") {
// // //     examples = safeJsonParse(examples, null);

// // //     if (!examples) {
// // //       return [];
// // //     }
// // //   }

// // //   if (!Array.isArray(examples)) {
// // //     examples = [examples];
// // //   }

// // //   return examples
// // //     .map((example) => {
// // //       if (typeof example === "string") {
// // //         const parsed = safeJsonParse(example, null);

// // //         if (parsed && typeof parsed === "object") {
// // //           return parsed;
// // //         }

// // //         return {
// // //           input: example,
// // //         };
// // //       }

// // //       if (example && typeof example === "object") {
// // //         if (
// // //           typeof example.text === "string" &&
// // //           !example.input &&
// // //           !example.output
// // //         ) {
// // //           const nested = safeJsonParse(example.text, null);

// // //           if (Array.isArray(nested)) {
// // //             return nested[0] || example;
// // //           }

// // //           if (nested && typeof nested === "object") {
// // //             return nested;
// // //           }

// // //           return {
// // //             explanation: example.text,
// // //           };
// // //         }

// // //         return example;
// // //       }

// // //       return null;
// // //     })
// // //     .filter(Boolean);
// // // }

// // // function formatExampleInput(value) {
// // //   if (value === undefined || value === null) {
// // //     return "";
// // //   }

// // //   if (typeof value === "string") {
// // //     return value;
// // //   }

// // //   return JSON.stringify(value, null, 2);
// // // }

// // // function formatConstraint(value) {
// // //   if (value === undefined || value === null) return "";

// // //   if (typeof value === "object") {
// // //     if (Array.isArray(value)) {
// // //       return value.map(formatConstraint).filter(Boolean).join(" ");
// // //     }
// // //     if (typeof value.text === "string") return formatConstraint(value.text);
// // //     if (typeof value.constraint === "string") return formatConstraint(value.constraint);
// // //     return Object.entries(value)
// // //       .map(([key, item]) => `${key}: ${formatConstraint(item)}`)
// // //       .join(" • ");
// // //   }

// // //   let text = String(value).trim();
// // //   if (!text) return "";

// // //   const parsed = safeJsonParse(text, null);
// // //   if (parsed !== null && parsed !== value) {
// // //     return formatConstraint(parsed);
// // //   }

// // //   // Clean common AI/JSON presentation artefacts without changing the
// // //   // constraint's meaning.
// // //   text = text
// // //     .replace(/\\n/g, "\n")
// // //     .replace(/\r/g, "")
// // //     .replace(/^[\s•*-]+/, "")
// // //     .trim();

// // //   return text;
// // // }

// // // function formatExampleOutput(value) {
// // //   if (value === undefined || value === null) {
// // //     return "";
// // //   }

// // //   if (typeof value === "string") {
// // //     return value;
// // //   }

// // //   return JSON.stringify(value, null, 2);
// // // }

// // // function formatTime(totalSeconds) {
// // //   const safeSeconds = Math.max(0, Number(totalSeconds) || 0);

// // //   const hours = Math.floor(safeSeconds / 3600);
// // //   const minutes = Math.floor((safeSeconds % 3600) / 60);
// // //   const seconds = safeSeconds % 60;

// // //   if (hours > 0) {
// // //     return `${String(hours).padStart(2, "0")}:${String(
// // //       minutes
// // //     ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
// // //   }

// // //   return `${String(minutes).padStart(2, "0")}:${String(
// // //     seconds
// // //   ).padStart(2, "0")}`;
// // // }

// // // function getAssessmentId() {
// // //   return (
// // //     localStorage.getItem(ASSESSMENT_ID_KEY) ||
// // //     safeJsonParse(localStorage.getItem(ASSESSMENT_KEY), {})?.assessment_id ||
// // //     null
// // //   );
// // // }

// // // function getStoredAssessment() {
// // //   return safeJsonParse(
// // //     localStorage.getItem(ASSESSMENT_KEY),
// // //     {}
// // //   );
// // // }

// // // function getAssessmentStartKey(assessmentId) {
// // //   return `coding_assessment_start_${assessmentId}`;
// // // }

// // // function getCodeKey(assessmentId, questionIndex) {
// // //   return `coding_assessment_code_${assessmentId}_${questionIndex}`;
// // // }

// // // function getSessionResultKey(assessmentId) {
// // //   return `coding_assessment_result_${assessmentId}`;
// // // }

// // // function extractAssessmentQuestion(payload) {
// // //   if (!payload) {
// // //     return null;
// // //   }

// // //   if (payload.question) {
// // //     return payload.question;
// // //   }

// // //   if (payload.current_question) {
// // //     return payload.current_question;
// // //   }

// // //   if (payload.next_question) {
// // //     return payload.next_question;
// // //   }

// // //   if (payload.assessment?.question) {
// // //     return payload.assessment.question;
// // //   }

// // //   return null;
// // // }

// // // function extractExecution(payload) {
// // //   if (!payload) {
// // //     return null;
// // //   }

// // //   return (
// // //     payload.execution ||
// // //     payload.result ||
// // //     payload.execution_result ||
// // //     null
// // //   );
// // // }

// // // function extractJudgement(payload) {
// // //   if (!payload) {
// // //     return null;
// // //   }

// // //   return (
// // //     payload.judgement ||
// // //     payload.solution_judgement ||
// // //     payload.evaluation ||
// // //     null
// // //   );
// // // }

// // // function extractInterviewer(payload) {
// // //   if (!payload) {
// // //     return null;
// // //   }

// // //   return (
// // //     payload.interviewer ||
// // //     payload.interviewer_event ||
// // //     payload.event ||
// // //     null
// // //   );
// // // }

// // // function getVisiblePassed(execution) {
// // //   if (!execution) {
// // //     return 0;
// // //   }

// // //   return Number(
// // //     execution.visible_passed_tests ??
// // //       execution.passed_tests ??
// // //       execution.passed ??
// // //       0
// // //   );
// // // }

// // // function getVisibleTotal(execution) {
// // //   if (!execution) {
// // //     return 0;
// // //   }

// // //   return Number(
// // //     execution.visible_total_tests ??
// // //       execution.total_tests ??
// // //       execution.tests?.length ??
// // //       0
// // //   );
// // // }

// // // function getHiddenPassed(execution) {
// // //   if (!execution) {
// // //     return 0;
// // //   }

// // //   return Number(
// // //     execution.hidden_passed_tests ??
// // //       execution.hidden_passed ??
// // //       0
// // //   );
// // // }

// // // function getHiddenTotal(execution) {
// // //   if (!execution) {
// // //     return 0;
// // //   }

// // //   return Number(
// // //     execution.hidden_total_tests ??
// // //       execution.hidden_total ??
// // //       0
// // //   );
// // // }

// // // function getHiddenFailed(execution) {
// // //   const passed = getHiddenPassed(execution);
// // //   const total = getHiddenTotal(execution);

// // //   if (!total) {
// // //     return Number(execution?.hidden_failed_tests ?? 0);
// // //   }

// // //   return Math.max(0, total - passed);
// // // }

// // // function isAccepted(judgement, execution) {
// // //   if (
// // //     judgement &&
// // //     typeof judgement.correct === "boolean"
// // //   ) {
// // //     return judgement.correct;
// // //   }

// // //   if (
// // //     execution &&
// // //     typeof execution.passed === "boolean"
// // //   ) {
// // //     return execution.passed;
// // //   }

// // //   return false;
// // // }

// // // function getStarterCode(question, assessmentId, questionIndex) {
// // //   const stored = localStorage.getItem(
// // //     getCodeKey(assessmentId, questionIndex)
// // //   );

// // //   // An empty saved editor value must NOT hide the default boilerplate.
// // //   if (typeof stored === "string" && stored.trim()) {
// // //     return stored;
// // //   }

// // //   const fallbackStarter = `#include <bits/stdc++.h>
// // // using namespace std;

// // // int main() {
// // //     // Enter the code here

// // //     return 0;
// // // }
// // // `;

// // //   // Prefer a real C++ starter only when it contains a main block.
// // //   // This keeps the assessment editor in stdin/stdout main()-based format.
// // //   const questionStarter =
// // //     typeof question?.starter_code === "string"
// // //       ? question.starter_code
// // //       : "";
// // //   const questionTemplate =
// // //     typeof question?.code_template === "string"
// // //       ? question.code_template
// // //       : "";

// // //   if (questionStarter.trim() && /\bint\s+main\s*\(/.test(questionStarter)) {
// // //     return questionStarter;
// // //   }

// // //   if (questionTemplate.trim() && /\bint\s+main\s*\(/.test(questionTemplate)) {
// // //     return questionTemplate;
// // //   }

// // //   return fallbackStarter;
// // // }

// // // function getSpeechRecognitionConstructor() {
// // //   return (
// // //     window.SpeechRecognition ||
// // //     window.webkitSpeechRecognition ||
// // //     null
// // //   );
// // // }

// // // function speakText(text, onEnd) {
// // //   if (!text) {
// // //     onEnd?.();
// // //     return;
// // //   }

// // //   if (!("speechSynthesis" in window)) {
// // //     onEnd?.();
// // //     return;
// // //   }

// // //   window.speechSynthesis.cancel();

// // //   const utterance = new SpeechSynthesisUtterance(text);

// // //   utterance.rate = 0.95;
// // //   utterance.pitch = 1;
// // //   utterance.volume = 1;

// // //   utterance.onend = () => {
// // //     onEnd?.();
// // //   };

// // //   utterance.onerror = () => {
// // //     onEnd?.();
// // //   };

// // //   window.speechSynthesis.speak(utterance);
// // // }


// // // const codingAssessmentFinalStyles = `
// // //   .topbar-action-button {
// // //     border: 1px solid rgba(255,255,255,.16);
// // //     background: rgba(255,255,255,.06);
// // //     color: inherit;
// // //     border-radius: 7px;
// // //     padding: 7px 10px;
// // //     font-size: 12px;
// // //     font-weight: 600;
// // //     cursor: pointer;
// // //     white-space: nowrap;
// // //   }
// // //   .topbar-action-button:hover { background: rgba(255,255,255,.12); }
// // //   .topbar-action-button.secondary { opacity: .9; }
// // //   .failed-tests-summary {
// // //     margin-top: 14px;
// // //     padding: 12px 14px;
// // //     border: 1px solid rgba(255,255,255,.10);
// // //     border-radius: 8px;
// // //     display: flex;
// // //     flex-direction: column;
// // //     gap: 4px;
// // //     font-size: 13px;
// // //   }
// // //   .failed-tests-summary span { opacity: .72; font-size: 12px; }
// // //   @media (max-width: 900px) {
// // //     .topbar-action-button { padding: 6px 8px; font-size: 11px; }
// // //   }
// // // `;

// // // if (typeof document !== "undefined" && !document.getElementById("coding-assessment-final-styles")) {
// // //   const style = document.createElement("style");
// // //   style.id = "coding-assessment-final-styles";
// // //   style.textContent = codingAssessmentFinalStyles;
// // //   document.head.appendChild(style);
// // // }

// // // export default function CodingAssessment() {

// // //   const [assessmentId, setAssessmentId] = useState(
// // //     getAssessmentId()
// // //   );

// // //   const [assessment, setAssessment] = useState(
// // //     getStoredAssessment()
// // //   );

// // //   const [question, setQuestion] = useState(null);

// // //   const [currentIndex, setCurrentIndex] = useState(0);

// // //   const [code, setCode] = useState("");

// // //   const [loading, setLoading] = useState(true);

// // //   const [running, setRunning] = useState(false);

// // //   const [submitting, setSubmitting] = useState(false);

// // //   const [error, setError] = useState("");

// // //   const [execution, setExecution] = useState(null);

// // //   const [visibleTestCases, setVisibleTestCases] = useState([]);

// // //   const [judgement, setJudgement] = useState(null);

// // //   const [submitResult, setSubmitResult] = useState(null);

// // //   const [canSubmit, setCanSubmit] = useState(false);

// // //   const [completedResults, setCompletedResults] =
// // //     useState([]);

// // //   const [secondsRemaining, setSecondsRemaining] =
// // //     useState(0);

// // //   const [assessmentFinished, setAssessmentFinished] =
// // //     useState(false);

// // //   const [timeExpired, setTimeExpired] =
// // //     useState(false);

// // //   const [interviewerQuestion, setInterviewerQuestion] =
// // //     useState("");

// // //   const [interviewerReason, setInterviewerReason] =
// // //     useState("");

// // //   const [showInterviewerPrompt, setShowInterviewerPrompt] =
// // //     useState(false);

// // //   const [interviewerOpen, setInterviewerOpen] =
// // //     useState(false);

// // //   const [interviewerState, setInterviewerState] =
// // //     useState("idle");

// // //   const [interviewerTranscript, setInterviewerTranscript] =
// // //     useState("");

// // //   const [interviewerResponse, setInterviewerResponse] =
// // //     useState("");

// // //   const [candidateQuestion, setCandidateQuestion] =
// // //     useState("");

// // //   const [voiceSupported, setVoiceSupported] =
// // //     useState(false);

// // //   const [liveObservation, setLiveObservation] =
// // //     useState(false);

// // //   const [jumpMessage, setJumpMessage] =
// // //     useState("");

// // //   const [showExamples, setShowExamples] =
// // //     useState(true);

// // //   const [showConstraints, setShowConstraints] =
// // //     useState(true);

// // //   const recognitionRef = useRef(null);

// // //   const liveTimerRef = useRef(null);

// // //   // Keep the interviewer discussion bounded so it cannot enter an
// // //   // endless follow-up loop on a single coding question.
// // //   const MAX_INTERVIEWER_QUESTIONS = 3;
// // //   const interviewerQuestionCountRef = useRef(0);

// // //   const mountedRef = useRef(true);
// // //   const interviewerGreetingShownRef = useRef(false);

// // //   const lastSubmittedCodeRef = useRef("");

// // //   const durationMinutes = Number(
// // //     assessment?.duration_minutes
// // //   );

// // //   const questions = Array.isArray(
// // //     assessment?.questions
// // //   )
// // //     ? assessment.questions
// // //     : [];

// // //   const totalQuestions =
// // //     Number(
// // //       assessment?.question_count ||
// // //         questions.length ||
// // //         1
// // //     );

// // //   useEffect(() => {
// // //     // Each coding question gets its own small interviewer discussion.
// // //     interviewerQuestionCountRef.current = 0;
// // //   }, [currentIndex]);

// // //   const examples = useMemo(
// // //     () => normalizeExamples(question?.examples),
// // //     [question?.examples]
// // //   );

// // //   const constraints = useMemo(
// // //     () => normalizeArray(question?.constraints),
// // //     [question?.constraints]
// // //   );

// // //   const visiblePassed = getVisiblePassed(execution);

// // //   const visibleTotal = getVisibleTotal(execution);

// // //   const hiddenPassed = getHiddenPassed(
// // //     submitResult?.execution || execution
// // //   );

// // //   const hiddenTotal = getHiddenTotal(
// // //     submitResult?.execution || execution
// // //   );

// // //   const hiddenFailed = getHiddenFailed(
// // //     submitResult?.execution || execution
// // //   );

// // //   const accepted = isAccepted(
// // //     judgement,
// // //     submitResult?.execution || execution
// // //   );

// // //   const executionStatus = useMemo(() => {
// // //     const message = String(execution?.error || "").toLowerCase();

// // //     if (!execution) {
// // //       return "idle";
// // //     }

// // //     if (
// // //       message.includes("timed out") ||
// // //       message.includes("time limit") ||
// // //       message.includes("timeout")
// // //     ) {
// // //       return "tle";
// // //     }

// // //     if (
// // //       message.includes("compilation") ||
// // //       message.includes("g++") ||
// // //       message.includes("error:") && !execution?.tests?.length
// // //     ) {
// // //       return "compile_error";
// // //     }

// // //     if (message || execution?.stderr) {
// // //       return "runtime_error";
// // //     }

// // //     if (execution?.passed) {
// // //       return "accepted";
// // //     }

// // //     return "wrong_answer";
// // //   }, [execution]);

// // //   const isCurrentCompleted =
// // //     completedResults.some(
// // //       (item) =>
// // //         Number(item?.question_number) ===
// // //         currentIndex + 1
// // //     );

// // //   const clearInterviewer = useCallback(() => {
// // //     if (recognitionRef.current) {
// // //       try {
// // //         recognitionRef.current.stop();
// // //       } catch {
// // //         // Ignore browser recognition stop errors.
// // //       }
// // //     }

// // //     recognitionRef.current = null;

// // //     if ("speechSynthesis" in window) {
// // //       window.speechSynthesis.cancel();
// // //     }

// // //     setInterviewerState("idle");
// // //   }, []);

// // //   const saveCode = useCallback(
// // //     (value) => {
// // //       setCode(value);

// // //       if (assessmentId !== null) {
// // //         localStorage.setItem(
// // //           getCodeKey(
// // //             assessmentId,
// // //             currentIndex
// // //           ),
// // //           value
// // //         );
// // //       }

// // //       setCanSubmit(false);

// // //       if (execution) {
// // //         setExecution(null);
// // //       }

// // //       if (submitResult) {
// // //         setSubmitResult(null);
// // //       }

// // //       if (judgement) {
// // //         setJudgement(null);
// // //       }
// // //     },
// // //     [
// // //       assessmentId,
// // //       currentIndex,
// // //       execution,
// // //       submitResult,
// // //       judgement,
// // //     ]
// // //   );

// // //   const loadQuestion = useCallback(
// // //     async (index = 0) => {
// // //       if (!assessmentId) {
// // //         setError(
// // //           "No active coding assessment was found."
// // //         );
// // //         setLoading(false);
// // //         return;
// // //       }

// // //       try {
// // //         setLoading(true);
// // //         setError("");

// // //         const assessmentResponse =
// // //           await fetch(
// // //             `${API_BASE}/api/coding/assessment/${assessmentId}`
// // //           );

// // //         if (assessmentResponse.ok) {
// // //           const assessmentData =
// // //             await assessmentResponse.json();

// // //           setAssessment(assessmentData);

// // //           localStorage.setItem(
// // //             ASSESSMENT_KEY,
// // //             JSON.stringify(assessmentData)
// // //           );

// // //           const storedSessionResult = safeJsonParse(
// // //             localStorage.getItem(
// // //               getSessionResultKey(assessmentId)
// // //             ),
// // //             null
// // //           );

// // //           if (
// // //             Array.isArray(storedSessionResult?.results)
// // //           ) {
// // //             setCompletedResults(
// // //               storedSessionResult.results
// // //             );
// // //           }

// // //           if (assessmentData.completed) {
// // //             setAssessmentFinished(true);
// // //             window.location.href = "/coding-result";
// // //             return;
// // //           }
// // //         }

// // //         const questionResponse =
// // //           await fetch(
// // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question?question_index=${index}`
// // //           );

// // //         if (!questionResponse.ok) {
// // //           const body =
// // //             await questionResponse.json().catch(
// // //               () => null
// // //             );

// // //           if (
// // //             body?.detail ===
// // //               "Assessment has already been completed." ||
// // //             body?.detail ===
// // //               "Assessment has no remaining questions."
// // //           ) {
// // //             setAssessmentFinished(true);
// // //             window.location.href = "/coding-result";
// // //             return;
// // //           }

// // //           throw new Error(
// // //             body?.detail ||
// // //               "Could not load assessment question."
// // //           );
// // //         }

// // //         const questionData =
// // //           await questionResponse.json();

// // //         const resolvedQuestion =
// // //           extractAssessmentQuestion(
// // //             questionData
// // //           ) || questionData;

// // //         setQuestion(resolvedQuestion);
// // //         setVisibleTestCases([]);

// // //         // Load the real candidate-visible test bank. If the endpoint is
// // //         // unavailable, keep the problem examples as a safe fallback.
// // //         const fallbackTests = normalizeExamples(
// // //           resolvedQuestion?.examples
// // //         ).map((item, itemIndex) => ({
// // //           test_number: itemIndex + 1,
// // //           input: item?.input ?? item?.stdin ?? "",
// // //           expected_output:
// // //             item?.expected_output ??
// // //             item?.output ??
// // //             item?.expected ??
// // //             "",
// // //           explanation: item?.explanation || "",
// // //         }));

// // //         try {
// // //           const testsResponse = await fetch(
// // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/tests?question_index=${index}`
// // //           );

// // //           if (testsResponse.ok) {
// // //             const testsData = await testsResponse.json();
// // //             const serverTests = Array.isArray(testsData?.tests)
// // //               ? testsData.tests
// // //               : [];
// // //             setVisibleTestCases(
// // //               serverTests.length ? serverTests : fallbackTests
// // //             );
// // //           } else {
// // //             setVisibleTestCases(fallbackTests);
// // //           }
// // //         } catch {
// // //           setVisibleTestCases(fallbackTests);
// // //         }

// // //         const resolvedIndex = Number(
// // //           resolvedQuestion?.question_number
// // //             ? resolvedQuestion.question_number - 1
// // //             : index
// // //         );

// // //         setCurrentIndex(
// // //           Math.max(0, resolvedIndex)
// // //         );

// // //         const savedCode =
// // //           localStorage.getItem(
// // //             getCodeKey(
// // //               assessmentId,
// // //               Math.max(0, resolvedIndex)
// // //             )
// // //           );

// // //         const starterCode =
// // //           getStarterCode(
// // //             resolvedQuestion,
// // //             assessmentId,
// // //             Math.max(0, resolvedIndex)
// // //           );

// // //         setCode(
// // //           typeof savedCode === "string" && savedCode.trim()
// // //             ? savedCode
// // //             : starterCode
// // //         );

// // //         setExecution(null);
// // //         setJudgement(null);
// // //         setSubmitResult(null);
// // //         setCanSubmit(false);

// // //         lastSubmittedCodeRef.current = "";

// // //         clearInterviewer();
// // //       } catch (err) {
// // //         if (mountedRef.current) {
// // //           setError(
// // //             err?.message ||
// // //               "Unable to load coding assessment."
// // //           );
// // //         }
// // //       } finally {
// // //         if (mountedRef.current) {
// // //           setLoading(false);
// // //         }
// // //       }
// // //     },
// // //     [
// // //       assessmentId,
// // //       clearInterviewer,
// // //     ]
// // //   );

// // //   useEffect(() => {
// // //     mountedRef.current = true;

// // //     const SpeechRecognition =
// // //       getSpeechRecognitionConstructor();

// // //     setVoiceSupported(
// // //       Boolean(SpeechRecognition)
// // //     );

// // //     return () => {
// // //       mountedRef.current = false;

// // //       if (liveTimerRef.current) {
// // //         clearTimeout(liveTimerRef.current);
// // //       }

// // //       clearInterviewer();
// // //     };
// // //   }, [clearInterviewer]);

// // //   useEffect(() => {
// // //     if (
// // //       !question ||
// // //       interviewerGreetingShownRef.current
// // //     ) {
// // //       return;
// // //     }

// // //     interviewerGreetingShownRef.current = true;

// // //     const greeting =
// // //       "Hi. Can you please solve this problem? Take a moment to understand it, then walk me through your approach. I will be here if you want to discuss any assumption or clarification.";

// // //     const timer = setTimeout(() => {
// // //       speakText(greeting);
// // //     }, 500);

// // //     return () => clearTimeout(timer);
// // //   }, [question]);

// // //   useEffect(() => {
// // //     if (
// // //       !question ||
// // //       interviewerGreetingShownRef.current
// // //     ) {
// // //       return;
// // //     }

// // //     interviewerGreetingShownRef.current = true;

// // //     const greeting =
// // //       "Hi. Can you please solve this problem? Take a moment to understand it, then walk me through your approach. I will be here if you want to discuss an assumption or ask me a question.";

// // //     const timer = setTimeout(() => {
// // //       speakText(greeting);
// // //     }, 600);

// // //     return () => clearTimeout(timer);
// // //   }, [question]);

// // //   useEffect(() => {
// // //     // The assessment planner/AI supplies the duration. Never fall back to a
// // //     // hard-coded 15-minute limit in the frontend.
// // //     if (
// // //       !assessmentId ||
// // //       !Number.isFinite(durationMinutes) ||
// // //       durationMinutes <= 0
// // //     ) {
// // //       return;
// // //     }

// // //     const startKey =
// // //       getAssessmentStartKey(assessmentId);

// // //     let startedAt =
// // //       Number(
// // //         localStorage.getItem(startKey)
// // //       ) || 0;

// // //     if (!startedAt) {
// // //       startedAt = Date.now();

// // //       localStorage.setItem(
// // //         startKey,
// // //         String(startedAt)
// // //       );
// // //     }

// // //     const totalSeconds =
// // //       durationMinutes * 60;

// // //     const updateTimer = () => {
// // //       const elapsed = Math.floor(
// // //         (Date.now() - startedAt) / 1000
// // //       );

// // //       const remaining = Math.max(
// // //         0,
// // //         totalSeconds - elapsed
// // //       );

// // //       setSecondsRemaining(remaining);

// // //       if (remaining <= 0) {
// // //         setError(
// // //           "Assessment time has expired."
// // //         );
// // //         setTimeExpired(true);
// // //         setAssessmentFinished(true);
// // //         clearInterviewer();
// // //       }
// // //     };

// // //     updateTimer();

// // //     const interval = setInterval(
// // //       updateTimer,
// // //       1000
// // //     );

// // //     return () => clearInterval(interval);
// // //   }, [
// // //     assessmentId,
// // //     durationMinutes,
// // //     clearInterviewer,
// // //   ]);

// // //   useEffect(() => {
// // //     if (!assessmentId) {
// // //       return;
// // //     }

// // //     let cancelled = false;

// // //     const initializeQuestion = async () => {
// // //       try {
// // //         await startQuestion();
// // //         if (!cancelled) {
// // //           await loadQuestion(currentIndex);
// // //         }
// // //       } catch {
// // //         // loadQuestion surfaces the useful API error.
// // //       }
// // //     };

// // //     initializeQuestion();

// // //     return () => {
// // //       cancelled = true;
// // //     };
// // //   }, [assessmentId]);

// // //   useEffect(() => {
// // //     if (!assessmentId) {
// // //       return;
// // //     }

// // //     localStorage.setItem(
// // //       getCodeKey(
// // //         assessmentId,
// // //         currentIndex
// // //       ),
// // //       code
// // //     );
// // //   }, [
// // //     assessmentId,
// // //     currentIndex,
// // //     code,
// // //   ]);

// // //   const requestLiveObservation =
// // //     useCallback(async () => {
// // //       if (
// // //         !assessmentId ||
// // //         !code.trim() ||
// // //         code.trim().length < 20 ||
// // //         submitResult ||
// // //         assessmentFinished
// // //       ) {
// // //         return;
// // //       }

// // //       try {
// // //         setLiveObservation(true);

// // //         const response =
// // //           await fetch(
// // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/live`,
// // //             {
// // //               method: "POST",
// // //               headers: {
// // //                 "Content-Type":
// // //                   "application/json",
// // //               },
// // //               body: JSON.stringify({
// // //                 code,
// // //                 question_index: currentIndex,
// // //                 language:
// // //                   assessment?.language ||
// // //                   "cpp",
// // //               }),
// // //             }
// // //           );

// // //         if (!response.ok) {
// // //           return;
// // //         }

// // //         const data =
// // //           await response.json();

// // //         const interviewer =
// // //           extractInterviewer(data);

// // //         const newQuestion =
// // //           interviewer?.question ||
// // //           data?.question ||
// // //           "";

// // //         if (
// // //           newQuestion &&
// // //           interviewerQuestionCountRef.current <
// // //             MAX_INTERVIEWER_QUESTIONS
// // //         ) {
// // //           interviewerQuestionCountRef.current += 1;

// // //           setInterviewerQuestion(
// // //             newQuestion
// // //           );

// // //           setInterviewerReason(
// // //             interviewer?.reason ||
// // //               "I have a question about your approach."
// // //           );

// // //           setShowInterviewerPrompt(
// // //             true
// // //           );

// // //           // The interviewer may interrupt with a meaningful question,
// // //           // but NEVER start the candidate microphone automatically.
// // //           setInterviewerOpen(true);
// // //           setInterviewerState("speaking");
// // //           speakText(newQuestion, () => {
// // //             if (mountedRef.current) {
// // //               setInterviewerState("idle");
// // //             }
// // //           });
// // //         }
// // //       } catch {
// // //         // Live observation is intentionally
// // //         // non-blocking for coding.
// // //       } finally {
// // //         if (mountedRef.current) {
// // //           setLiveObservation(false);
// // //         }
// // //       }
// // //     }, [
// // //       assessmentId,
// // //       code,
// // //       submitResult,
// // //       assessmentFinished,
// // //       currentIndex,
// // //       assessment?.language,
// // //     ]);

// // //   useEffect(() => {
// // //     if (!code.trim()) {
// // //       return;
// // //     }

// // //     if (liveTimerRef.current) {
// // //       clearTimeout(
// // //         liveTimerRef.current
// // //       );
// // //     }

// // //     liveTimerRef.current =
// // //       setTimeout(
// // //         requestLiveObservation,
// // //         4000
// // //       );

// // //     return () => {
// // //       if (liveTimerRef.current) {
// // //         clearTimeout(
// // //           liveTimerRef.current
// // //         );
// // //       }
// // //     };
// // //   }, [
// // //     code,
// // //     requestLiveObservation,
// // //   ]);

// // //   const startQuestion = useCallback(
// // //     async (index = currentIndex) => {
// // //       if (!assessmentId) {
// // //         return;
// // //       }

// // //       try {
// // //         const response =
// // //           await fetch(
// // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/start?question_index=${index}`,
// // //             {
// // //               method: "POST",
// // //               headers: {
// // //                 "Content-Type":
// // //                   "application/json",
// // //               },
// // //             }
// // //           );

// // //         if (!response.ok) {
// // //           const body =
// // //             await response.json().catch(
// // //               () => null
// // //             );

// // //           if (
// // //             body?.detail?.includes(
// // //               "already been completed"
// // //             )
// // //           ) {
// // //             window.location.href = "/coding-result";
// // //             return;
// // //           }

// // //           throw new Error(
// // //             body?.detail ||
// // //               "Could not start question."
// // //           );
// // //         }
// // //       } catch (err) {
// // //         setError(
// // //           err?.message ||
// // //             "Could not start coding question."
// // //         );
// // //       }
// // //     },
// // //     [assessmentId, currentIndex]
// // //   );

// // //   const handleRun = useCallback(
// // //     async () => {
// // //       if (
// // //         !assessmentId ||
// // //         !code.trim() ||
// // //         running ||
// // //         submitting ||
// // //         secondsRemaining <= 0
// // //       ) {
// // //         return;
// // //       }

// // //       try {
// // //         setRunning(true);
// // //         setError("");

// // //         setExecution(null);
// // //         setSubmitResult(null);
// // //         setJudgement(null);
// // //         setCanSubmit(false);

// // //         const response =
// // //           await fetch(
// // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/run`,
// // //             {
// // //               method: "POST",
// // //               headers: {
// // //                 "Content-Type":
// // //                   "application/json",
// // //               },
// // //               body: JSON.stringify({
// // //                 code,
// // //                 question_index: currentIndex,
// // //                 language:
// // //                   assessment?.language ||
// // //                   "cpp",
// // //               }),
// // //             }
// // //           );

// // //         const data =
// // //           await response.json().catch(
// // //             () => null
// // //           );

// // //         if (!response.ok) {
// // //           throw new Error(
// // //             data?.detail ||
// // //               "Code execution failed."
// // //           );
// // //         }

// // //         const result =
// // //           extractExecution(data) ||
// // //           data;

// // //         setExecution(result);

// // //         const passed =
// // //           data?.can_submit === true ||
// // //           result?.passed === true ||
// // //           (
// // //             getVisibleTotal(result) > 0 &&
// // //             getVisiblePassed(result) ===
// // //               getVisibleTotal(result)
// // //           );

// // //         setCanSubmit(passed);

// // //         if (!passed) {
// // //           setError(
// // //             "Fix the failing visible tests and Run again before submitting."
// // //           );
// // //         }
// // //       } catch (err) {
// // //         setError(
// // //           err?.message ||
// // //             "Could not execute your code."
// // //         );
// // //       } finally {
// // //         setRunning(false);
// // //       }
// // //     },
// // //     [
// // //       assessmentId,
// // //       code,
// // //       running,
// // //       submitting,
// // //       secondsRemaining,
// // //       assessment?.language,
// // //     ]
// // //   );

// // //   const buildQuestionResult = useCallback(
// // //     (
// // //       submitData,
// // //       resultExecution,
// // //       resultJudgement,
// // //       resultInterviewer
// // //     ) => {
// // //       const finalExecution =
// // //         resultExecution ||
// // //         extractExecution(
// // //           submitData
// // //         ) ||
// // //         {};

// // //       const finalJudgement =
// // //         resultJudgement ||
// // //         extractJudgement(
// // //           submitData
// // //         ) ||
// // //         {};

// // //       const finalInterviewer =
// // //         resultInterviewer ||
// // //         extractInterviewer(
// // //           submitData
// // //         ) ||
// // //         {};

// // //       return {
// // //         question_number:
// // //           question?.question_number ??
// // //           currentIndex + 1,

// // //         problem_id:
// // //           question?.problem_id,

// // //         title:
// // //           question?.title ||
// // //           "Coding Question",

// // //         category:
// // //           question?.category,

// // //         difficulty:
// // //           question?.difficulty,

// // //         code,

// // //         accepted:
// // //           isAccepted(
// // //             finalJudgement,
// // //             finalExecution
// // //           ),

// // //         // Normalized fields used by CodingResult/History. Keep the
// // //         // original execution/judgement fields below untouched.
// // //         passed:
// // //           isAccepted(
// // //             finalJudgement,
// // //             finalExecution
// // //           ),

// // //         submitted: true,

// // //         score:
// // //           Number.isFinite(Number(finalJudgement?.score))
// // //             ? Number(finalJudgement.score)
// // //             : Number.isFinite(Number(finalJudgement?.rating))
// // //             ? Number(finalJudgement.rating)
// // //             : isAccepted(finalJudgement, finalExecution)
// // //             ? 10
// // //             : 0,

// // //         passed_tests:
// // //           getVisiblePassed(finalExecution) +
// // //           getHiddenPassed(finalExecution),

// // //         total_tests:
// // //           getVisibleTotal(finalExecution) +
// // //           getHiddenTotal(finalExecution),

// // //         visible_passed_tests:
// // //           getVisiblePassed(
// // //             finalExecution
// // //           ),

// // //         visible_total_tests:
// // //           getVisibleTotal(
// // //             finalExecution
// // //           ),

// // //         hidden_passed_tests:
// // //           getHiddenPassed(
// // //             finalExecution
// // //           ),

// // //         hidden_total_tests:
// // //           getHiddenTotal(
// // //             finalExecution
// // //           ),

// // //         hidden_failed_tests:
// // //           getHiddenFailed(
// // //             finalExecution
// // //           ),

// // //         execution_time_ms:
// // //           finalExecution?.execution_time_ms ??
// // //           finalExecution?.execution_time ??
// // //           null,

// // //         feedback:
// // //           finalJudgement?.reasoning ||
// // //           finalJudgement?.feedback ||
// // //           "",

// // //         approach:
// // //           finalJudgement?.approach_name ||
// // //           finalJudgement?.approach_level ||
// // //           "",

// // //         time_complexity:
// // //           finalJudgement?.time_complexity ||
// // //           "",

// // //         space_complexity:
// // //           finalJudgement?.space_complexity ||
// // //           "",

// // //         optimal:
// // //           finalJudgement?.optimal,

// // //         strengths:
// // //           finalJudgement?.strengths || [],

// // //         weaknesses:
// // //           finalJudgement?.weaknesses || [],

// // //         interviewer_question:
// // //           finalInterviewer?.question ||
// // //           finalJudgement?.recommended_follow_up ||
// // //           "",

// // //         interviewer_reason:
// // //           finalInterviewer?.reason ||
// // //           "",

// // //         submitted_at:
// // //           new Date().toISOString(),
// // //       };
// // //     },
// // //     [
// // //       question,
// // //       currentIndex,
// // //       code,
// // //     ]
// // //   );

// // //   const saveSessionResult = useCallback(
// // //     (results) => {
// // //       if (!assessmentId) {
// // //         return;
// // //       }

// // //       const existingHistory =
// // //         safeJsonParse(
// // //           localStorage.getItem(
// // //             HISTORY_KEY
// // //           ),
// // //           []
// // //         );

// // //       const safeHistory =
// // //         Array.isArray(existingHistory)
// // //           ? existingHistory
// // //           : [];

// // //       const resultObject = {
// // //         assessment_id:
// // //           assessmentId,

// // //         mode:
// // //           assessment?.mode ||
// // //           "personalized",

// // //         company:
// // //           assessment?.company ||
// // //           null,

// // //         role:
// // //           assessment?.role ||
// // //           null,

// // //         topics:
// // //           assessment?.topics ||
// // //           [],

// // //         question_count:
// // //           totalQuestions,

// // //         duration_minutes:
// // //           durationMinutes,

// // //         completed: true,

// // //         completed_at:
// // //           new Date().toISOString(),

// // //         results,
// // //       };

// // //       const withoutCurrent =
// // //         safeHistory.filter(
// // //           (item) =>
// // //             item?.assessment_id !==
// // //             assessmentId
// // //         );

// // //       withoutCurrent.push(
// // //         resultObject
// // //       );

// // //       localStorage.setItem(
// // //         HISTORY_KEY,
// // //         JSON.stringify(
// // //           withoutCurrent
// // //         )
// // //       );

// // //       localStorage.setItem(
// // //         getSessionResultKey(
// // //           assessmentId
// // //         ),
// // //         JSON.stringify(
// // //           resultObject
// // //         )
// // //       );

// // //       localStorage.setItem(
// // //         "coding_assessment_result",
// // //         JSON.stringify(
// // //           resultObject
// // //         )
// // //       );
// // //     },
// // //     [
// // //       assessmentId,
// // //       assessment?.mode,
// // //       assessment?.company,
// // //       assessment?.role,
// // //       assessment?.topics,
// // //       totalQuestions,
// // //       durationMinutes,
// // //     ]
// // //   );

// // //   useEffect(() => {
// // //     if (!timeExpired || !assessmentId) {
// // //       return;
// // //     }

// // //     // Preserve whatever has already been completed so the feedback page
// // //     // remains useful even when the timer expires before the final question.
// // //     saveSessionResult(completedResults);
// // //   }, [
// // //     timeExpired,
// // //     assessmentId,
// // //     completedResults,
// // //     saveSessionResult,
// // //   ]);

// // //   const handleSubmit = useCallback(
// // //     async () => {
// // //       if (
// // //         !assessmentId ||
// // //         !code.trim() ||
// // //         submitting ||
// // //         running ||
// // //         !canSubmit ||
// // //         secondsRemaining <= 0
// // //       ) {
// // //         return;
// // //       }

// // //       if (
// // //         lastSubmittedCodeRef.current &&
// // //         lastSubmittedCodeRef.current !==
// // //           code
// // //       ) {
// // //         setError(
// // //           "Your code changed after the last Run. Run it again before submitting."
// // //         );
// // //         setCanSubmit(false);
// // //         return;
// // //       }

// // //       try {
// // //         setSubmitting(true);
// // //         setError("");

// // //         const response =
// // //           await fetch(
// // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/submit`,
// // //             {
// // //               method: "POST",
// // //               headers: {
// // //                 "Content-Type":
// // //                   "application/json",
// // //               },
// // //               body: JSON.stringify({
// // //                 code,
// // //                 question_index: currentIndex,
// // //                 language:
// // //                   assessment?.language ||
// // //                   "cpp",
// // //               }),
// // //             }
// // //           );

// // //         const data =
// // //           await response.json().catch(
// // //             () => null
// // //           );

// // //         if (!response.ok) {
// // //           throw new Error(
// // //             data?.detail ||
// // //               "Submission failed."
// // //           );
// // //         }

// // //         const finalExecution =
// // //           extractExecution(data) ||
// // //           {};

// // //         const finalJudgement =
// // //           extractJudgement(data) ||
// // //           {};

// // //         const finalInterviewer =
// // //           extractInterviewer(data) ||
// // //           {};

// // //         setSubmitResult(data);
// // //         setExecution(finalExecution);
// // //         setJudgement(finalJudgement);

// // //         lastSubmittedCodeRef.current =
// // //           code;

// // //         setCanSubmit(false);

// // //         const questionResult =
// // //           buildQuestionResult(
// // //             data,
// // //             finalExecution,
// // //             finalJudgement,
// // //             finalInterviewer
// // //           );

// // //         const updatedResults = [
// // //           ...completedResults,
// // //           questionResult,
// // //         ];

// // //         const uniqueResults =
// // //           updatedResults.filter(
// // //             (item, index, array) =>
// // //               array.findIndex(
// // //                 (candidate) =>
// // //                   candidate?.question_number ===
// // //                   item?.question_number
// // //               ) === index
// // //           );

// // //         setCompletedResults(
// // //           uniqueResults
// // //         );

// // //         localStorage.setItem(
// // //           getSessionResultKey(
// // //             assessmentId
// // //           ),
// // //           JSON.stringify({
// // //             ...safeJsonParse(
// // //               localStorage.getItem(
// // //                 getSessionResultKey(
// // //                   assessmentId
// // //                 )
// // //               ),
// // //               {}
// // //             ),
// // //             assessment_id:
// // //               assessmentId,
// // //             mode:
// // //               assessment?.mode ||
// // //               "personalized",
// // //             results:
// // //               uniqueResults,
// // //           })
// // //         );

// // //         const followUpQuestion =
// // //           finalInterviewer?.question ||
// // //           finalJudgement?.recommended_follow_up ||
// // //           (isAccepted(
// // //             finalJudgement,
// // //             finalExecution
// // //           )
// // //             ? "Walk me through your approach and explain its time and space complexity."
// // //             : "");

// // //         setInterviewerQuestion(
// // //           followUpQuestion
// // //         );

// // //         setInterviewerReason(
// // //           finalInterviewer?.reason ||
// // //             (followUpQuestion
// // //               ? "Let's discuss your solution and the reasoning behind it."
// // //               : "Let's discuss your solution.")
// // //         );

// // //         if (followUpQuestion) {
// // //           setShowInterviewerPrompt(true);
// // //         }
// // //       } catch (err) {
// // //         setError(
// // //           err?.message ||
// // //             "Could not submit solution."
// // //         );
// // //       } finally {
// // //         setSubmitting(false);
// // //       }
// // //     },
// // //     [
// // //       assessmentId,
// // //       code,
// // //       submitting,
// // //       running,
// // //       canSubmit,
// // //       secondsRemaining,
// // //       assessment?.language,
// // //       assessment?.mode,
// // //       completedResults,
// // //       buildQuestionResult,
// // //     ]
// // //   );

// // //   const openInterviewer =
// // //     useCallback(() => {
// // //       if (!interviewerQuestion) {
// // //         return;
// // //       }

// // //       setShowInterviewerPrompt(false);
// // //       setInterviewerOpen(true);
// // //       setInterviewerTranscript("");
// // //       setInterviewerResponse("");
// // //       setInterviewerState("speaking");

// // //       speakText(
// // //         interviewerQuestion,
// // //         () => {
// // //           if (
// // //             mountedRef.current
// // //           ) {
// // //             setInterviewerState(
// // //               "idle"
// // //             );
// // //           }
// // //         }
// // //       );
// // //     }, [interviewerQuestion]);

// // //   const startListening =
// // //     useCallback(() => {
// // //       const Recognition =
// // //         getSpeechRecognitionConstructor();

// // //       if (!Recognition) {
// // //         setError(
// // //           "Voice input is not supported by this browser."
// // //         );
// // //         return;
// // //       }

// // //       if (recognitionRef.current) {
// // //         try {
// // //           recognitionRef.current.stop();
// // //         } catch {
// // //           // Ignore.
// // //         }
// // //       }

// // //       const recognition =
// // //         new Recognition();

// // //       recognition.lang = "en-US";
// // //       recognition.interimResults = true;
// // //       recognition.continuous = false;

// // //       recognition.onstart = () => {
// // //         setInterviewerState(
// // //           "listening"
// // //         );
// // //       };

// // //       recognition.onresult = (
// // //         event
// // //       ) => {
// // //         let transcript = "";

// // //         for (
// // //           let i = event.resultIndex;
// // //           i < event.results.length;
// // //           i++
// // //         ) {
// // //           transcript +=
// // //             event.results[i][0]
// // //               .transcript;
// // //         }

// // //         setInterviewerTranscript(
// // //           transcript
// // //         );
// // //       };

// // //       recognition.onerror = (
// // //         event
// // //       ) => {
// // //         setInterviewerState(
// // //           "idle"
// // //         );

// // //         if (
// // //           event?.error ===
// // //           "not-allowed"
// // //         ) {
// // //           setError(
// // //             "Microphone permission was denied."
// // //           );
// // //         }
// // //       };

// // //       recognition.onend = () => {
// // //         setInterviewerState(
// // //           "idle"
// // //         );

// // //         setInterviewerTranscript(
// // //           (previous) =>
// // //             previous.trim()
// // //         );
// // //       };

// // //       recognitionRef.current =
// // //         recognition;

// // //       recognition.start();
// // //     }, []);

// // //   const submitInterviewAnswer =
// // //     useCallback(async () => {
// // //       const answer =
// // //         interviewerTranscript.trim();

// // //       if (!answer) {
// // //         return;
// // //       }

// // //       setInterviewerState(
// // //         "processing"
// // //       );

// // //       try {
// // //         const response =
// // //           await fetch(
// // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/interview-answer`,
// // //             {
// // //               method: "POST",
// // //               headers: {
// // //                 "Content-Type":
// // //                   "application/json",
// // //               },
// // //               body: JSON.stringify({
// // //                 answer,
// // //                 question:
// // //                   interviewerQuestion,
// // //                 code,
// // //                 question_index: currentIndex,
// // //                 language:
// // //                   assessment?.language ||
// // //                   "cpp",
// // //               }),
// // //             }
// // //           );

// // //         const data =
// // //           await response.json().catch(
// // //             () => null
// // //           );

// // //         if (!response.ok) {
// // //           throw new Error(
// // //             data?.detail ||
// // //               "Could not process interview answer."
// // //           );
// // //         }

// // //         const nextQuestion =
// // //           data?.question ||
// // //           data?.interviewer?.question ||
// // //           data?.next_question ||
// // //           "";

// // //         const responseText =
// // //           data?.response ||
// // //           data?.message ||
// // //           data?.feedback ||
// // //           "";

// // //         setInterviewerResponse(
// // //           responseText
// // //         );

// // //         if (
// // //           nextQuestion &&
// // //           interviewerQuestionCountRef.current <
// // //             MAX_INTERVIEWER_QUESTIONS
// // //         ) {
// // //           interviewerQuestionCountRef.current += 1;

// // //           setInterviewerQuestion(
// // //             nextQuestion
// // //           );

// // //           setInterviewerTranscript(
// // //             ""
// // //           );

// // //           setInterviewerState(
// // //             "speaking"
// // //           );

// // //           speakText(
// // //             nextQuestion,
// // //             () => {
// // //               if (
// // //                 mountedRef.current
// // //               ) {
// // //                 // Candidate must explicitly click Start Recording.
// // //                 setInterviewerState(
// // //                   "idle"
// // //                 );
// // //               }
// // //             }
// // //           );
// // //         } else {
// // //           // Questioning is finished (including the maximum follow-up limit).
// // //           // Close both the popup and the voice panel automatically.
// // //           const finishInterviewer = () => {
// // //             if (!mountedRef.current) return;
// // //             setInterviewerState("idle");
// // //             setInterviewerOpen(false);
// // //             setShowInterviewerPrompt(false);
// // //             setInterviewerQuestion("");
// // //             setInterviewerTranscript("");
// // //           };

// // //           if (responseText) {
// // //             speakText(responseText, finishInterviewer);
// // //           } else {
// // //             finishInterviewer();
// // //           }
// // //         }
// // //       } catch (err) {
// // //         setInterviewerState(
// // //           "idle"
// // //         );

// // //         setError(
// // //           err?.message ||
// // //             "Could not process your interview answer."
// // //         );
// // //       }
// // //     }, [
// // //       assessmentId,
// // //       interviewerTranscript,
// // //       interviewerQuestion,
// // //       code,
// // //       currentIndex,
// // //       assessment?.language,
// // //     ]);

// // //   const askInterviewer = useCallback(async () => {
// // //     const asked = candidateQuestion.trim();

// // //     if (!assessmentId || !asked) {
// // //       return;
// // //     }

// // //     try {
// // //       setError("");
// // //       setInterviewerResponse("");
// // //       setInterviewerState("thinking");

// // //       const response = await fetch(
// // //         `${API_BASE}/api/coding/assessment/${assessmentId}/question/interview-answer`,
// // //         {
// // //           method: "POST",
// // //           headers: {
// // //             "Content-Type": "application/json",
// // //           },
// // //           body: JSON.stringify({
// // //             answer: asked,
// // //             question: interviewerQuestion || "Candidate clarification",
// // //             code,
// // //             question_index: currentIndex,
// // //             action: "clarification",
// // //           }),
// // //         }
// // //       );

// // //       const data = await response.json().catch(() => null);

// // //       if (!response.ok) {
// // //         throw new Error(
// // //           data?.detail || "Could not contact the interviewer."
// // //         );
// // //       }

// // //       const reply =
// // //         data?.response ||
// // //         "I can clarify the assumptions without giving away the solution.";

// // //       const clarificationQuestion =
// // //         data?.question ||
// // //         data?.interviewer?.question ||
// // //         "";

// // //       setCandidateQuestion("");
// // //       setInterviewerResponse(reply);

// // //       if (
// // //         clarificationQuestion &&
// // //         interviewerQuestionCountRef.current <
// // //           MAX_INTERVIEWER_QUESTIONS
// // //       ) {
// // //         interviewerQuestionCountRef.current += 1;
// // //         setInterviewerQuestion(clarificationQuestion);
// // //       }

// // //       setInterviewerState("speaking");

// // //       speakText(
// // //         clarificationQuestion || reply,
// // //         () => {
// // //           if (mountedRef.current) {
// // //             // Never auto-start microphone after AI speaks.
// // //             setInterviewerState("idle");
// // //           }
// // //         }
// // //       );
// // //     } catch (err) {
// // //       setInterviewerState("idle");
// // //       setError(
// // //         err?.message ||
// // //           "Could not contact the interviewer."
// // //       );
// // //     }
// // //   }, [
// // //     assessmentId,
// // //     candidateQuestion,
// // //     interviewerQuestion,
// // //     code,
// // //     currentIndex,
// // //   ]);

// // //   const closeInterviewer =
// // //     useCallback(() => {
// // //       clearInterviewer();

// // //       setInterviewerOpen(false);
// // //       setShowInterviewerPrompt(false);
// // //     }, [clearInterviewer]);

// // //   const completeAndGoNext =
// // //     useCallback(async () => {
// // //       if (
// // //         !assessmentId ||
// // //         !submitResult
// // //       ) {
// // //         return;
// // //       }

// // //       try {
// // //         setError("");

// // //         const result =
// // //           buildQuestionResult(
// // //             submitResult,
// // //             execution,
// // //             judgement,
// // //             extractInterviewer(
// // //               submitResult
// // //             )
// // //           );

// // //         const mergedResults =
// // //           completedResults.some(
// // //             (item) =>
// // //               item?.question_number ===
// // //               result?.question_number
// // //           )
// // //             ? completedResults
// // //             : [
// // //                 ...completedResults,
// // //                 result,
// // //               ];

// // //         const response =
// // //           await fetch(
// // //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/complete`,
// // //             {
// // //               method: "POST",
// // //               headers: {
// // //                 "Content-Type":
// // //                   "application/json",
// // //               },
// // //               body: JSON.stringify({
// // //                 result,
// // //               }),
// // //             }
// // //           );

// // //         const data =
// // //           await response.json().catch(
// // //             () => null
// // //           );

// // //         if (!response.ok) {
// // //           throw new Error(
// // //             data?.detail ||
// // //               "Could not complete question."
// // //           );
// // //         }

// // //         if (
// // //           data?.completed === true
// // //         ) {
// // //           saveSessionResult(
// // //             mergedResults
// // //           );

// // //           setAssessmentFinished(
// // //             true
// // //           );

// // //           // Keep the candidate on the assessment page and show the
// // //           // completion actions. The feedback button performs the
// // //           // navigation after the candidate chooses it.
// // //           return;
// // //         }

// // //         setCompletedResults(
// // //           mergedResults
// // //         );

// // //         const nextIndex =
// // //           currentIndex + 1;

// // //         setCurrentIndex(
// // //           nextIndex
// // //         );

// // //         setQuestion(null);
// // //         setExecution(null);
// // //         setJudgement(null);
// // //         setSubmitResult(null);
// // //         setCanSubmit(false);
// // //         setInterviewerQuestion("");
// // //         setInterviewerTranscript("");
// // //         setInterviewerResponse("");

// // //         clearInterviewer();

// // //         await startQuestion();

// // //         await loadQuestion(
// // //           nextIndex
// // //         );
// // //       } catch (err) {
// // //         setError(
// // //           err?.message ||
// // //             "Could not move to the next question."
// // //         );
// // //       }
// // //     }, [
// // //       assessmentId,
// // //       submitResult,
// // //       buildQuestionResult,
// // //       execution,
// // //       judgement,
// // //       completedResults,
// // //       saveSessionResult,
// // //       currentIndex,
// // //       clearInterviewer,
// // //       startQuestion,
// // //       loadQuestion,
// // //     ]);

// // //   const jumpToQuestion =
// // //     useCallback(
// // //       async (index) => {
// // //         if (index < 0 || index >= totalQuestions) {
// // //           return;
// // //         }

// // //         if (index === currentIndex) {
// // //           return;
// // //         }

// // //         setJumpMessage("");
// // //         setCurrentIndex(index);
// // //         setQuestion(null);
// // //         setExecution(null);
// // //         setJudgement(null);
// // //         setSubmitResult(null);
// // //         setCanSubmit(false);
// // //         setInterviewerQuestion("");
// // //         setInterviewerTranscript("");
// // //         setInterviewerResponse("");
// // //         clearInterviewer();

// // //         // IMPORTANT: a question switch must update the backend coding
// // //         // session before loading tests. Otherwise Q2 can display Q1's
// // //         // test bank (the exact bug seen in the assessment UI).
// // //         await startQuestion(index);
// // //         await loadQuestion(index);
// // //       },
// // //       [
// // //         currentIndex,
// // //         totalQuestions,
// // //         clearInterviewer,
// // //         startQuestion,
// // //         loadQuestion,
// // //       ]
// // //     );

// // //   const goDashboard =
// // //     useCallback(() => {
// // //       window.location.href = "/";
// // //     }, []);

// // //   const goFeedback =
// // //     useCallback(() => {
// // //       window.location.href = "/coding-result";
// // //     }, []);

// // //   const handleExitAssessment = useCallback(() => {
// // //     if (assessmentId) {
// // //       saveSessionResult(completedResults);
// // //     }
// // //     window.location.href = "/coding-result";
// // //   }, [assessmentId, completedResults, saveSessionResult]);

// // //   const handleReturnDashboard = useCallback(() => {
// // //     if (assessmentId) {
// // //       saveSessionResult(completedResults);
// // //     }
// // //     window.location.href = "/";
// // //   }, [assessmentId, completedResults, saveSessionResult]);

// // //   const timerDanger =
// // //     secondsRemaining <= 300;

// // //   const timerText =
// // //     formatTime(
// // //       secondsRemaining
// // //     );

// // //   if (loading && !question) {
// // //     return (
// // //       <div className="coding-page">
// // //         <div className="coding-loading">
// // //           <div className="coding-spinner" />
// // //           <p>
// // //             Preparing your coding assessment...
// // //           </p>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   if (
// // //     assessmentFinished
// // //   ) {
// // //     return (
// // //       <div className="coding-page">
// // //         <div className="coding-complete">
// // //           <div className="complete-icon">
// // //             ✓
// // //           </div>

// // //           <h1>
// // //             {timeExpired
// // //               ? "Time's Up"
// // //               : "Assessment Complete"}
// // //           </h1>

// // //           <p>
// // //             {timeExpired
// // //               ? "Your assessment time has ended. Your completed work has been saved and is available in AI feedback."
// // //               : "Your coding assessment has been completed successfully."}
// // //           </p>

// // //           <div className="complete-actions">
// // //             <button
// // //               className="primary-button"
// // //               onClick={
// // //                 handleExitAssessment
// // //               }
// // //             >
// // //               View AI Feedback
// // //             </button>

// // //             <button
// // //               className="secondary-button"
// // //               onClick={
// // //                 handleReturnDashboard
// // //               }
// // //             >
// // //               Return to Dashboard
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="coding-page">
// // //       <header className="coding-topbar">
// // //         <div className="coding-brand">
// // //           <span>AI Coding Assessment</span>
// // //           <div className="top-interviewer">
// // //             <span className="top-interviewer-dot" />
// // //             <span className="top-interviewer-name">AI Interviewer</span>
// // //             <span className="top-interviewer-status">
// // //               {liveObservation ? "Observing" : "Available"}
// // //             </span>
// // //           </div>
// // //         </div>

// // //         <div className="coding-topbar-right">
// // //           <span>
// // //             {assessment?.mode ===
// // //             "company_oa"
// // //               ? "Company OA"
// // //               : assessment?.mode ===
// // //                 "contest"
// // //               ? "Contest"
// // //               : "Personalized"}
// // //           </span>

// // //           <span className="topbar-divider">
// // //             |
// // //           </span>

// // //           <span>
// // //             Question{" "}
// // //             {currentIndex + 1} /{" "}
// // //             {totalQuestions}
// // //           </span>

// // //           <span
// // //             className={
// // //               timerDanger
// // //                 ? "timer danger"
// // //                 : "timer"
// // //             }
// // //           >
// // //             ⏱ {timerText}
// // //           </span>

// // //           <button
// // //             type="button"
// // //             className="topbar-action-button"
// // //             onClick={handleExitAssessment}
// // //             title="Open AI feedback and assessment results"
// // //           >
// // //             AI Feedback
// // //           </button>

// // //           <button
// // //             type="button"
// // //             className="topbar-action-button secondary"
// // //             onClick={handleReturnDashboard}
// // //             title="Leave the assessment and return to dashboard"
// // //           >
// // //             Dashboard
// // //           </button>
// // //         </div>
// // //       </header>

// // //       <div className="coding-workspace">
// // //         <aside className="question-sidebar">
// // //           <div className="sidebar-title">
// // //             Questions
// // //           </div>

// // //           <div className="question-list">
// // //             {Array.from({
// // //               length: totalQuestions,
// // //             }).map(
// // //               (_, index) => {
// // //                 const result =
// // //                   completedResults.find(
// // //                     (item) =>
// // //                       Number(
// // //                         item?.question_number
// // //                       ) ===
// // //                       index + 1
// // //                   );

// // //                 const isCurrent =
// // //                   index ===
// // //                   currentIndex;

// // //                 const isCompleted =
// // //                   Boolean(result);

// // //                 return (
// // //                   <button
// // //                     type="button"
// // //                     key={index}
// // //                     className={[
// // //                       "question-pill",
// // //                       isCurrent
// // //                         ? "active"
// // //                         : "",
// // //                       isCompleted
// // //                         ? "completed"
// // //                         : "",
// // //                     ]
// // //                       .filter(Boolean)
// // //                       .join(" ")}
// // //                     onClick={() =>
// // //                       jumpToQuestion(index)
// // //                     }
// // //                     aria-current={
// // //                       isCurrent ? "step" : undefined
// // //                     }
// // //                   >
// // //                     <span className="question-pill-number">
// // //                       {isCompleted
// // //                         ? "✓"
// // //                         : index + 1}
// // //                     </span>

// // //                     <span>
// // //                       Question{" "}
// // //                       {index + 1}
// // //                     </span>
// // //                   </button>
// // //                 );
// // //               }
// // //             )}
// // //           </div>

// // //           <div className="sidebar-bottom">
// // //             <button
// // //               className="dashboard-link"
// // //               onClick={
// // //                 goDashboard
// // //               }
// // //             >
// // //               ← Dashboard
// // //             </button>
// // //           </div>
// // //         </aside>

// // //         <main className="coding-main">
// // //           {error && (
// // //             <div className="coding-alert">
// // //               <span>{error}</span>

// // //               <button
// // //                 onClick={() =>
// // //                   setError("")
// // //                 }
// // //               >
// // //                 ×
// // //               </button>
// // //             </div>
// // //           )}

// // //           {jumpMessage && (
// // //             <div className="jump-message">
// // //               {jumpMessage}
// // //             </div>
// // //           )}

// // //           <section className="problem-panel">
// // //             <div className="problem-header">
// // //               <div>
// // //                 <div className="problem-meta">
// // //                   <span>
// // //                     {question?.difficulty ||
// // //                       "Medium"}
// // //                   </span>

// // //                   <span>·</span>

// // //                   <span>
// // //                     {question?.category ||
// // //                       "Algorithms"}
// // //                   </span>
// // //                 </div>

// // //                 <h1>
// // //                   {question?.title ||
// // //                     "Coding Problem"}
// // //                 </h1>
// // //               </div>

// // //               <div className="problem-number">
// // //                 {currentIndex + 1}/
// // //                 {totalQuestions}
// // //               </div>
// // //             </div>

// // //             <div className="problem-statement">
// // //               {question?.statement ||
// // //                 question?.description ||
// // //                 "Solve the problem using an efficient algorithm."}
// // //             </div>

// // //             <div className="problem-section">
// // //               <button
// // //                 className="section-toggle"
// // //                 onClick={() =>
// // //                   setShowExamples(
// // //                     (value) =>
// // //                       !value
// // //                   )
// // //                 }
// // //               >
// // //                 <span>
// // //                   Examples
// // //                 </span>

// // //                 <span>
// // //                   {showExamples
// // //                     ? "⌃"
// // //                     : "⌄"}
// // //                 </span>
// // //               </button>

// // //               {showExamples &&
// // //                 examples.slice(0, 3).map(
// // //                   (
// // //                     example,
// // //                     index
// // //                   ) => (
// // //                     <div
// // //                       className="example-card"
// // //                       key={index}
// // //                     >
// // //                       <div className="example-title">
// // //                         Example{" "}
// // //                         {index + 1}
// // //                       </div>

// // //                       {example.input !==
// // //                         undefined && (
// // //                         <div className="example-row">
// // //                           <div className="example-label">
// // //                             Input
// // //                           </div>

// // //                           <pre>
// // //                             {formatExampleInput(
// // //                               example.input
// // //                             )}
// // //                           </pre>
// // //                         </div>
// // //                       )}

// // //                       {example.output !==
// // //                         undefined && (
// // //                         <div className="example-row">
// // //                           <div className="example-label">
// // //                             Output
// // //                           </div>

// // //                           <pre>
// // //                             {formatExampleOutput(
// // //                               example.output
// // //                             )}
// // //                           </pre>
// // //                         </div>
// // //                       )}

// // //                       {example.expected_output !==
// // //                         undefined && (
// // //                         <div className="example-row">
// // //                           <div className="example-label">
// // //                             Output
// // //                           </div>

// // //                           <pre>
// // //                             {formatExampleOutput(
// // //                               example.expected_output
// // //                             )}
// // //                           </pre>
// // //                         </div>
// // //                       )}

// // //                       {example.explanation && (
// // //                         <div className="example-explanation">
// // //                           {example.explanation}
// // //                         </div>
// // //                       )}
// // //                     </div>
// // //                   )
// // //                 )}

// // //               {showExamples && examples.length > 3 && (
// // //                 <div className="examples-more-note">
// // //                   Showing the first 3 examples. Review the problem statement for the remaining examples.
// // //                 </div>
// // //               )}
// // //             </div>

// // //             {constraints.length >
// // //               0 && (
// // //               <div className="problem-section">
// // //                 <button
// // //                   className="section-toggle"
// // //                   onClick={() =>
// // //                     setShowConstraints(
// // //                       (value) =>
// // //                         !value
// // //                     )
// // //                   }
// // //                 >
// // //                   <span>
// // //                     Constraints
// // //                   </span>

// // //                   <span>
// // //                     {showConstraints
// // //                       ? "⌃"
// // //                       : "⌄"}
// // //                   </span>
// // //                 </button>

// // //                 {showConstraints && (
// // //                   <ul className="constraints-list">
// // //                     {constraints.map(
// // //                       (
// // //                         constraint,
// // //                         index
// // //                       ) => (
// // //                         <li
// // //                           key={
// // //                             index
// // //                           }
// // //                         >
// // //                           {formatConstraint(constraint)}
// // //                         </li>
// // //                       )
// // //                     )}
// // //                   </ul>
// // //                 )}
// // //               </div>
// // //             )}
// // //           </section>

// // //           <section className="editor-panel">
// // //             <div className="editor-header">
// // //               <div className="editor-language">
// // //                 <span className="language-dot" />
// // //                 C++
// // //               </div>

// // //               <div className="editor-actions">
// // //                 <button
// // //                   type="button"
// // //                   className="run-button"
// // //                   disabled={
// // //                     running ||
// // //                     submitting ||
// // //                     secondsRemaining <= 0 ||
// // //                     isCurrentCompleted
// // //                   }
// // //                   onClick={
// // //                     handleRun
// // //                   }
// // //                 >
// // //                   {running
// // //                     ? "Running..."
// // //                     : "▶ Run"}
// // //                 </button>

// // //                 <button
// // //                   type="button"
// // //                   className={
// // //                     canSubmit
// // //                       ? "submit-button"
// // //                       : "submit-button disabled"
// // //                   }
// // //                   disabled={
// // //                     !canSubmit ||
// // //                     running ||
// // //                     submitting ||
// // //                     isCurrentCompleted
// // //                   }
// // //                   title={
// // //                     !canSubmit
// // //                       ? "Run your code successfully first"
// // //                       : ""
// // //                   }
// // //                   onClick={
// // //                     handleSubmit
// // //                   }
// // //                 >
// // //                   {submitting
// // //                     ? "Submitting..."
// // //                     : "Submit"}
// // //                 </button>
// // //               </div>
// // //             </div>

// // //             <textarea
// // //               className="code-editor"
// // //               spellCheck="false"
// // //               value={code}
// // //               onChange={(event) =>
// // //                 saveCode(
// // //                   event.target
// // //                     .value
// // //                 )
// // //               }
// // //               disabled={
// // //                 secondsRemaining <= 0 ||
// // //                 assessmentFinished ||
// // //                 (isCurrentCompleted &&
// // //                   !submitResult)
// // //               }
// // //             />
// // //           </section>

// // //           <section className="test-panel">
// // //             <div className="test-panel-header">
// // //               <div className="test-panel-heading">
// // //                 <strong>Test Cases</strong>

// // //                 {execution && (
// // //                   <span className="test-summary">
// // //                     {visiblePassed} / {visibleTotal} cases passed
// // //                   </span>
// // //                 )}
// // //               </div>

// // //               <div className="test-panel-statuses">
// // //                 {execution && executionStatus === "accepted" && (
// // //                   <span className="test-status-badge accepted">✓ Accepted</span>
// // //                 )}

// // //                 {execution && executionStatus === "wrong_answer" && (
// // //                   <span className="test-status-badge failed">Wrong Answer</span>
// // //                 )}

// // //                 {execution && executionStatus === "tle" && (
// // //                   <span className="test-status-badge tle">TLE</span>
// // //                 )}

// // //                 {execution && executionStatus === "compile_error" && (
// // //                   <span className="test-status-badge failed">Compile Error</span>
// // //                 )}

// // //                 {execution && executionStatus === "runtime_error" && (
// // //                   <span className="test-status-badge failed">Runtime Error</span>
// // //                 )}

// // //                 {submitResult && (
// // //                   <span className="hidden-summary">
// // //                     Hidden {hiddenPassed} / {hiddenTotal} · Failed {hiddenFailed}
// // //                   </span>
// // //                 )}
// // //               </div>
// // //             </div>

// // //             <div className="test-result-body">
// // //               {execution && (
// // //                 <div className="execution-overview">
// // //                   <div className="execution-overview-main">
// // //                     <strong>
// // //                       {visiblePassed} / {visibleTotal} cases passed
// // //                     </strong>

// // //                     {execution.execution_time_ms != null && (
// // //                       <span>
// // //                         {Number(execution.execution_time_ms).toFixed(0)} ms
// // //                       </span>
// // //                     )}
// // //                   </div>

// // //                   {submitResult && (
// // //                     <div className="execution-hidden-summary">
// // //                       <span>Hidden {hiddenPassed} / {hiddenTotal}</span>
// // //                       <span>Hidden failed {hiddenFailed}</span>
// // //                     </div>
// // //                   )}
// // //                 </div>
// // //               )}

// // //               {execution?.error && (
// // //                 <div className="execution-error-card">
// // //                   <div className="execution-error-title">
// // //                     {executionStatus === "tle"
// // //                       ? "Time Limit Exceeded"
// // //                       : executionStatus === "compile_error"
// // //                       ? "Compilation Error"
// // //                       : executionStatus === "runtime_error"
// // //                       ? "Runtime Error"
// // //                       : "Execution Error"}
// // //                   </div>
// // //                   <pre className="execution-error">
// // //                     {execution.error}
// // //                   </pre>
// // //                 </div>
// // //               )}

// // //               {(execution?.tests?.length
// // //                 ? execution.tests
// // //                 : visibleTestCases
// // //               ).map((test, index) => {
// // //                 const hasExecution = Boolean(execution?.tests?.length);
// // //                 const passed = hasExecution ? test.passed === true : null;
// // //                 const input = test.input ?? test.input_data ?? "";
// // //                 const expected =
// // //                   test.expected_output ?? test.expected ?? "";
// // //                 const actual =
// // //                   test.actual_output ?? test.stdout ?? "";

// // //                 return (
// // //                   <article
// // //                     className={`test-case-card ${
// // //                       passed === true
// // //                         ? "pass"
// // //                         : passed === false
// // //                         ? "fail"
// // //                         : "pending"
// // //                     }`}
// // //                     key={`${test.test_number ?? index + 1}-${index}`}
// // //                   >
// // //                     <div className="test-case-card-header">
// // //                       <strong>Test Case {test.test_number ?? index + 1}</strong>

// // //                       <span
// // //                         className={`test-case-status-pill ${
// // //                           passed === true
// // //                             ? "pass"
// // //                             : passed === false
// // //                             ? "fail"
// // //                             : "pending"
// // //                         }`}
// // //                       >
// // //                         {passed === true
// // //                           ? "✓ Passed"
// // //                           : passed === false
// // //                           ? "✕ Failed"
// // //                           : "Not Run"}
// // //                       </span>
// // //                     </div>

// // //                     <div className="test-case-values">
// // //                       <div>
// // //                         <span>Input</span>
// // //                         <pre>{formatExampleInput(input)}</pre>
// // //                       </div>

// // //                       <div>
// // //                         <span>Expected Output</span>
// // //                         <pre>{formatExampleOutput(expected)}</pre>
// // //                       </div>

// // //                       {hasExecution && (
// // //                         <div>
// // //                           <span>Your Output</span>
// // //                           <pre>
// // //                             {formatExampleOutput(actual) || "(no output)"}
// // //                           </pre>
// // //                         </div>
// // //                       )}
// // //                     </div>

// // //                     {test.error && (
// // //                       <div className="test-case-error">
// // //                         {test.error}
// // //                       </div>
// // //                     )}

// // //                     {test.explanation && (
// // //                       <div className="test-case-explanation">
// // //                         {test.explanation}
// // //                       </div>
// // //                     )}
// // //                   </article>
// // //                 );
// // //               })}

// // //               {!visibleTestCases.length && !execution?.tests?.length && (
// // //                 <div className="empty-tests">
// // //                   You must run your code first.
// // //                 </div>
// // //               )}
// // //             </div>
// // //           </section>

// // //           {submitResult && (
// // //             <section className="submission-summary">
// // //               <div className="submission-summary-title">
// // //                 {accepted
// // //                   ? "Solution Accepted"
// // //                   : "Submission Evaluated"}
// // //               </div>

// // //               <div className="submission-grid">
// // //                 <div>
// // //                   <span>
// // //                     Approach
// // //                   </span>

// // //                   <strong>
// // //                     {judgement?.approach_name ||
// // //                       judgement?.approach_level ||
// // //                       "Evaluated"}
// // //                   </strong>
// // //                 </div>

// // //                 <div>
// // //                   <span>
// // //                     Time Complexity
// // //                   </span>

// // //                   <strong>
// // //                     {judgement?.time_complexity ||
// // //                       "—"}
// // //                   </strong>
// // //                 </div>

// // //                 <div>
// // //                   <span>
// // //                     Space Complexity
// // //                   </span>

// // //                   <strong>
// // //                     {judgement?.space_complexity ||
// // //                       "—"}
// // //                   </strong>
// // //                 </div>
// // //               </div>

// // //               {submitResult && hiddenFailed > 0 && (
// // //                 <div className="failed-tests-summary">
// // //                   <strong>Hidden tests failed: {hiddenFailed}</strong>
// // //                   <span>Hidden test inputs and expected outputs remain private.</span>
// // //                 </div>
// // //               )}

// // //               {execution?.tests?.some((test) => test?.passed === false) && (
// // //                 <div className="failed-tests-summary visible-failed">
// // //                   <strong>Failed visible test cases</strong>
// // //                   <span>Open the test cases above to review the input, expected output, and your output.</span>
// // //                 </div>
// // //               )}
// // //             </section>
// // //           )}

// // //           <section className="candidate-ask-section">
// // //             <div className="candidate-ask-interviewer">
// // //               <div className="candidate-ask-heading">
// // //                 <div>
// // //                   <strong>Ask the Interviewer</strong>
// // //                   <span>
// // //                     Ask a clarification or talk through an assumption without advancing the coding question.
// // //                   </span>
// // //                 </div>
// // //               </div>

// // //               <div className="candidate-ask-row">
// // //                 <input
// // //                   type="text"
// // //                   value={candidateQuestion}
// // //                   onChange={(event) =>
// // //                     setCandidateQuestion(event.target.value)
// // //                   }
// // //                   onKeyDown={(event) => {
// // //                     if (event.key === "Enter") {
// // //                       askInterviewer();
// // //                     }
// // //                   }}
// // //                   placeholder="e.g. Can we assume all numbers are positive?"
// // //                   disabled={submitting || assessmentFinished}
// // //                 />

// // //                 <button
// // //                   type="button"
// // //                   className="ask-button"
// // //                   onClick={askInterviewer}
// // //                   disabled={!candidateQuestion.trim() || submitting}
// // //                 >
// // //                   Ask Interview
// // //                 </button>

// // //                 {voiceSupported && (
// // //                   <button
// // //                     type="button"
// // //                     className="ask-voice-button"
// // //                     onClick={() => {
// // //                       setInterviewerQuestion(
// // //                         "Sure. What would you like to ask me about this problem?"
// // //                       );
// // //                       setInterviewerReason(
// // //                         "Candidate-initiated question."
// // //                       );
// // //                       setInterviewerOpen(true);
// // //                       setInterviewerTranscript("");
// // //                       setInterviewerResponse("");
// // //                       // Do not start the microphone automatically.
// // //                       // The candidate must explicitly click Start Recording.
// // //                       setInterviewerState("idle");
// // //                     }}
// // //                     disabled={submitting || assessmentFinished}
// // //                     title="Ask the interviewer by voice"
// // //                   >
// // //                     🎙 Speak to Interviewer
// // //                   </button>
// // //                 )}
// // //               </div>
// // //             </div>
// // //           </section>

// // //           {showInterviewerPrompt &&
// // //             interviewerQuestion && (
// // //               <div className="interviewer-popup">
// // //                 <div className="popup-icon">
// // //                   🎙
// // //                 </div>

// // //                 <div className="popup-content">
// // //                   <div className="popup-title">
// // //                     AI Interviewer
// // //                   </div>

// // //                   <div className="popup-text">
// // //                     {interviewerReason ||
// // //                       "I have a question about your approach. Would you like to discuss it?"}
// // //                   </div>
// // //                 </div>

// // //                 <button
// // //                   type="button"
// // //                   className="ask-button"
// // //                   onClick={
// // //                     openInterviewer
// // //                   }
// // //                 >
// // //                   Ask Me
// // //                 </button>
// // //               </div>
// // //             )}

// // //           {interviewerOpen && (
// // //             <div className="voice-interview-panel">
// // //               <div className="voice-panel-header">
// // //                 <div>
// // //                   <strong>
// // //                     AI Interviewer
// // //                   </strong>

// // //                   <span>
// // //                     Follow-up discussion
// // //                   </span>
// // //                 </div>

// // //                 <button
// // //                   className="voice-close"
// // //                   onClick={
// // //                     closeInterviewer
// // //                   }
// // //                 >
// // //                   ×
// // //                 </button>
// // //               </div>

// // //               <div className="voice-question">
// // //                 <div className="voice-label">
// // //                   AI
// // //                 </div>

// // //                 <p>
// // //                   {interviewerQuestion}
// // //                 </p>

// // //                 {interviewerState ===
// // //                   "speaking" && (
// // //                   <div className="voice-state">
// // //                     🔊 Speaking...
// // //                   </div>
// // //                 )}
// // //               </div>

// // //               <div className="voice-answer">
// // //                 <div className="voice-label">You</div>

// // //                 <textarea
// // //                   className="interviewer-text-answer"
// // //                   value={interviewerTranscript}
// // //                   onChange={(event) =>
// // //                     setInterviewerTranscript(event.target.value)
// // //                   }
// // //                   onKeyDown={(event) => {
// // //                     // Enter is for normal text entry; microphone recording
// // //                     // starts only when the candidate explicitly clicks
// // //                     // Start Recording.
// // //                     if (
// // //                       event.key === "Enter" &&
// // //                       !event.shiftKey &&
// // //                       !event.ctrlKey &&
// // //                       !event.metaKey
// // //                     ) {
// // //                       event.preventDefault();
// // //                       if (
// // //                         interviewerTranscript.trim() &&
// // //                         interviewerState !== "processing" &&
// // //                         interviewerState !== "speaking"
// // //                       ) {
// // //                         submitInterviewAnswer();
// // //                       }
// // //                     }
// // //                   }}
// // //                   placeholder="Type your answer, or click Start Recording to speak..."
// // //                   disabled={interviewerState === "processing"}
// // //                 />

// // //                 {interviewerState === "listening" && (
// // //                   <div className="listening-indicator">
// // //                     <span className="pulse" />
// // //                     🎙 Listening...
// // //                   </div>
// // //                 )}
// // //               </div>

// // //               {interviewerResponse && (
// // //                 <div className="voice-feedback">
// // //                   {interviewerResponse}
// // //                 </div>
// // //               )}

// // //               <div className="voice-actions">
// // //                 {voiceSupported ? (
// // //                   <button
// // //                     type="button"
// // //                     className="record-button"
// // //                     onClick={
// // //                       interviewerState === "listening"
// // //                         ? () => {
// // //                             try { recognitionRef.current?.stop(); } catch {}
// // //                           }
// // //                         : startListening
// // //                     }
// // //                     disabled={interviewerState === "speaking" || interviewerState === "processing"}
// // //                   >
// // //                     🎙 {interviewerState === "listening" ? "End Recording" : "Start Recording"}
// // //                   </button>
// // //                 ) : (
// // //                   <span className="voice-warning">Voice input is not supported in this browser.</span>
// // //                 )}

// // //                 <button
// // //                   type="button"
// // //                   className="answer-button"
// // //                   onClick={submitInterviewAnswer}
// // //                   disabled={!interviewerTranscript.trim() || interviewerState === "processing" || interviewerState === "speaking"}
// // //                 >
// // //                   Send Answer →
// // //                 </button>
// // //               </div>

// // //               {/* <div className="interviewer-limit-note">
// // //                 Follow-up limit: {MAX_INTERVIEWER_QUESTIONS} questions per coding problem.
// // //                 Click <strong>Start Recording</strong> when you are ready to speak.
// // //               </div> */}
// // //             </div>
// // //           )}

// // //           {submitResult && !isCurrentCompleted && (
// // //             <div className="question-navigation-footer">
// // //               <div>
// // //                 <strong>
// // //                   Question{" "}
// // //                   {currentIndex + 1}{" "}
// // //                   completed
// // //                 </strong>

// // //                 <span>
// // //                   {accepted
// // //                     ? "Solution accepted."
// // //                     : "Submission evaluated."}
// // //                 </span>
// // //               </div>

// // //               {currentIndex <
// // //               totalQuestions - 1 ? (
// // //                 <button
// // //                   className="next-button"
// // //                   onClick={
// // //                     completeAndGoNext
// // //                   }
// // //                 >
// // //                   Next Question →
// // //                 </button>
// // //               ) : (
// // //                 <button
// // //                   className="next-button"
// // //                   onClick={
// // //                     completeAndGoNext
// // //                   }
// // //                 >
// // //                   Finish Assessment ✓
// // //                 </button>
// // //               )}
// // //             </div>
// // //           )}

// // //           {isCurrentCompleted && (
// // //             <div className="review-banner">
// // //               This question has already been completed.
// // //               You are viewing it in review mode.
// // //             </div>
// // //           )}
// // //         </main>
// // //       </div>
// // //     </div>
// // //   );
// // // }


// // import React, {
// //   useCallback,
// //   useEffect,
// //   useMemo,
// //   useRef,
// //   useState,
// // } from "react";
// // import "./CodingAssessment.css";

// // const API_BASE = "http://127.0.0.1:8000";

// // const ASSESSMENT_ID_KEY = "coding_assessment_id";
// // const ASSESSMENT_KEY = "coding_assessment";
// // const HISTORY_KEY = "coding_assessment_history";

// // function safeJsonParse(value, fallback = null) {
// //   if (typeof value !== "string") {
// //     return value ?? fallback;
// //   }

// //   try {
// //     return JSON.parse(value);
// //   } catch {
// //     return fallback;
// //   }
// // }

// // function normalizeArray(value) {
// //   if (Array.isArray(value)) {
// //     return value;
// //   }

// //   if (typeof value === "string") {
// //     const parsed = safeJsonParse(value, null);

// //     if (Array.isArray(parsed)) {
// //       return parsed;
// //     }

// //     return value
// //       .split("\n")
// //       .map((item) => item.trim())
// //       .filter(Boolean);
// //   }

// //   return [];
// // }

// // function normalizeExamples(value) {
// //   if (!value) {
// //     return [];
// //   }

// //   let examples = value;

// //   if (typeof examples === "string") {
// //     examples = safeJsonParse(examples, null);

// //     if (!examples) {
// //       return [];
// //     }
// //   }

// //   if (!Array.isArray(examples)) {
// //     examples = [examples];
// //   }

// //   return examples
// //     .map((example) => {
// //       if (typeof example === "string") {
// //         const parsed = safeJsonParse(example, null);

// //         if (parsed && typeof parsed === "object") {
// //           return parsed;
// //         }

// //         return {
// //           input: example,
// //         };
// //       }

// //       if (example && typeof example === "object") {
// //         if (
// //           typeof example.text === "string" &&
// //           !example.input &&
// //           !example.output
// //         ) {
// //           const nested = safeJsonParse(example.text, null);

// //           if (Array.isArray(nested)) {
// //             return nested[0] || example;
// //           }

// //           if (nested && typeof nested === "object") {
// //             return nested;
// //           }

// //           return {
// //             explanation: example.text,
// //           };
// //         }

// //         return example;
// //       }

// //       return null;
// //     })
// //     .filter(Boolean);
// // }

// // function formatExampleInput(value) {
// //   if (value === undefined || value === null) {
// //     return "";
// //   }

// //   if (typeof value === "string") {
// //     return value;
// //   }

// //   return JSON.stringify(value, null, 2);
// // }

// // function formatConstraint(value) {
// //   if (value === undefined || value === null) return "";

// //   if (typeof value === "object") {
// //     if (Array.isArray(value)) {
// //       return value.map(formatConstraint).filter(Boolean).join(" ");
// //     }
// //     if (typeof value.text === "string") return formatConstraint(value.text);
// //     if (typeof value.constraint === "string") return formatConstraint(value.constraint);
// //     return Object.entries(value)
// //       .map(([key, item]) => `${key}: ${formatConstraint(item)}`)
// //       .join(" • ");
// //   }

// //   let text = String(value).trim();
// //   if (!text) return "";

// //   const parsed = safeJsonParse(text, null);
// //   if (parsed !== null && parsed !== value) {
// //     return formatConstraint(parsed);
// //   }

// //   // Clean common AI/JSON presentation artefacts without changing the
// //   // constraint's meaning.
// //   text = text
// //     .replace(/\\n/g, "\n")
// //     .replace(/\r/g, "")
// //     .replace(/^[\s•*-]+/, "")
// //     .trim();

// //   return text;
// // }

// // function formatExampleOutput(value) {
// //   if (value === undefined || value === null) {
// //     return "";
// //   }

// //   if (typeof value === "string") {
// //     return value;
// //   }

// //   return JSON.stringify(value, null, 2);
// // }

// // function formatTime(totalSeconds) {
// //   const safeSeconds = Math.max(0, Number(totalSeconds) || 0);

// //   const hours = Math.floor(safeSeconds / 3600);
// //   const minutes = Math.floor((safeSeconds % 3600) / 60);
// //   const seconds = safeSeconds % 60;

// //   if (hours > 0) {
// //     return `${String(hours).padStart(2, "0")}:${String(
// //       minutes
// //     ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
// //   }

// //   return `${String(minutes).padStart(2, "0")}:${String(
// //     seconds
// //   ).padStart(2, "0")}`;
// // }

// // function getAssessmentId() {
// //   return (
// //     localStorage.getItem(ASSESSMENT_ID_KEY) ||
// //     safeJsonParse(localStorage.getItem(ASSESSMENT_KEY), {})?.assessment_id ||
// //     null
// //   );
// // }

// // function getStoredAssessment() {
// //   return safeJsonParse(
// //     localStorage.getItem(ASSESSMENT_KEY),
// //     {}
// //   );
// // }

// // function getAssessmentStartKey(assessmentId) {
// //   return `coding_assessment_start_${assessmentId}`;
// // }

// // function getCodeKey(assessmentId, questionIndex) {
// //   return `coding_assessment_code_${assessmentId}_${questionIndex}`;
// // }

// // function getSessionResultKey(assessmentId) {
// //   return `coding_assessment_result_${assessmentId}`;
// // }

// // function extractAssessmentQuestion(payload) {
// //   if (!payload) {
// //     return null;
// //   }

// //   if (payload.question) {
// //     return payload.question;
// //   }

// //   if (payload.current_question) {
// //     return payload.current_question;
// //   }

// //   if (payload.next_question) {
// //     return payload.next_question;
// //   }

// //   if (payload.assessment?.question) {
// //     return payload.assessment.question;
// //   }

// //   return null;
// // }

// // function extractExecution(payload) {
// //   if (!payload) {
// //     return null;
// //   }

// //   return (
// //     payload.execution ||
// //     payload.result ||
// //     payload.execution_result ||
// //     null
// //   );
// // }

// // function extractJudgement(payload) {
// //   if (!payload) {
// //     return null;
// //   }

// //   return (
// //     payload.judgement ||
// //     payload.solution_judgement ||
// //     payload.evaluation ||
// //     null
// //   );
// // }

// // function extractInterviewer(payload) {
// //   if (!payload) {
// //     return null;
// //   }

// //   return (
// //     payload.interviewer ||
// //     payload.interviewer_event ||
// //     payload.event ||
// //     null
// //   );
// // }

// // function getVisiblePassed(execution) {
// //   if (!execution) {
// //     return 0;
// //   }

// //   return Number(
// //     execution.visible_passed_tests ??
// //       execution.passed_tests ??
// //       execution.passed ??
// //       0
// //   );
// // }

// // function getVisibleTotal(execution) {
// //   if (!execution) {
// //     return 0;
// //   }

// //   return Number(
// //     execution.visible_total_tests ??
// //       execution.total_tests ??
// //       execution.tests?.length ??
// //       0
// //   );
// // }

// // function getHiddenPassed(execution) {
// //   if (!execution) {
// //     return 0;
// //   }

// //   return Number(
// //     execution.hidden_passed_tests ??
// //       execution.hidden_passed ??
// //       0
// //   );
// // }

// // function getHiddenTotal(execution) {
// //   if (!execution) {
// //     return 0;
// //   }

// //   return Number(
// //     execution.hidden_total_tests ??
// //       execution.hidden_total ??
// //       0
// //   );
// // }

// // function getHiddenFailed(execution) {
// //   const passed = getHiddenPassed(execution);
// //   const total = getHiddenTotal(execution);

// //   if (!total) {
// //     return Number(execution?.hidden_failed_tests ?? 0);
// //   }

// //   return Math.max(0, total - passed);
// // }

// // function isAccepted(judgement, execution) {
// //   if (
// //     judgement &&
// //     typeof judgement.correct === "boolean"
// //   ) {
// //     return judgement.correct;
// //   }

// //   if (
// //     execution &&
// //     typeof execution.passed === "boolean"
// //   ) {
// //     return execution.passed;
// //   }

// //   return false;
// // }

// // function getStarterCode(question, assessmentId, questionIndex) {
// //   const stored = localStorage.getItem(
// //     getCodeKey(assessmentId, questionIndex)
// //   );

// //   // An empty saved editor value must NOT hide the default boilerplate.
// //   if (typeof stored === "string" && stored.trim()) {
// //     return stored;
// //   }

// //   const fallbackStarter = `#include <bits/stdc++.h>
// // using namespace std;

// // int main() {
// //     // Enter the code here

// //     return 0;
// // }
// // `;

// //   // Prefer a real C++ starter only when it contains a main block.
// //   // This keeps the assessment editor in stdin/stdout main()-based format.
// //   const questionStarter =
// //     typeof question?.starter_code === "string"
// //       ? question.starter_code
// //       : "";
// //   const questionTemplate =
// //     typeof question?.code_template === "string"
// //       ? question.code_template
// //       : "";

// //   if (questionStarter.trim() && /\bint\s+main\s*\(/.test(questionStarter)) {
// //     return questionStarter;
// //   }

// //   if (questionTemplate.trim() && /\bint\s+main\s*\(/.test(questionTemplate)) {
// //     return questionTemplate;
// //   }

// //   return fallbackStarter;
// // }

// // function getSpeechRecognitionConstructor() {
// //   return (
// //     window.SpeechRecognition ||
// //     window.webkitSpeechRecognition ||
// //     null
// //   );
// // }

// // function speakText(text, onEnd) {
// //   if (!text) {
// //     onEnd?.();
// //     return;
// //   }

// //   if (!("speechSynthesis" in window)) {
// //     onEnd?.();
// //     return;
// //   }

// //   window.speechSynthesis.cancel();

// //   const utterance = new SpeechSynthesisUtterance(text);

// //   utterance.rate = 0.95;
// //   utterance.pitch = 1;
// //   utterance.volume = 1;

// //   utterance.onend = () => {
// //     onEnd?.();
// //   };

// //   utterance.onerror = () => {
// //     onEnd?.();
// //   };

// //   window.speechSynthesis.speak(utterance);
// // }


// // const codingAssessmentFinalStyles = `
// //   .topbar-action-button {
// //     border: 1px solid rgba(255,255,255,.16);
// //     background: rgba(255,255,255,.06);
// //     color: inherit;
// //     border-radius: 7px;
// //     padding: 7px 10px;
// //     font-size: 12px;
// //     font-weight: 600;
// //     cursor: pointer;
// //     white-space: nowrap;
// //   }
// //   .topbar-action-button:hover { background: rgba(255,255,255,.12); }
// //   .topbar-action-button.secondary { opacity: .9; }
// //   .failed-tests-summary {
// //     margin-top: 14px;
// //     padding: 12px 14px;
// //     border: 1px solid rgba(255,255,255,.10);
// //     border-radius: 8px;
// //     display: flex;
// //     flex-direction: column;
// //     gap: 4px;
// //     font-size: 13px;
// //   }
// //   .failed-tests-summary span { opacity: .72; font-size: 12px; }
// //   @media (max-width: 900px) {
// //     .topbar-action-button { padding: 6px 8px; font-size: 11px; }
// //   }
// // `;

// // if (typeof document !== "undefined" && !document.getElementById("coding-assessment-final-styles")) {
// //   const style = document.createElement("style");
// //   style.id = "coding-assessment-final-styles";
// //   style.textContent = codingAssessmentFinalStyles;
// //   document.head.appendChild(style);
// // }

// // export default function CodingAssessment() {

// //   const [assessmentId, setAssessmentId] = useState(
// //     getAssessmentId()
// //   );

// //   const [assessment, setAssessment] = useState(
// //     getStoredAssessment()
// //   );

// //   const [question, setQuestion] = useState(null);

// //   const [currentIndex, setCurrentIndex] = useState(0);

// //   const [code, setCode] = useState("");

// //   const [loading, setLoading] = useState(true);

// //   const [running, setRunning] = useState(false);

// //   const [submitting, setSubmitting] = useState(false);

// //   const [error, setError] = useState("");

// //   const [execution, setExecution] = useState(null);

// //   const [visibleTestCases, setVisibleTestCases] = useState([]);

// //   const [judgement, setJudgement] = useState(null);

// //   const [submitResult, setSubmitResult] = useState(null);

// //   const [canSubmit, setCanSubmit] = useState(false);

// //   const [completedResults, setCompletedResults] =
// //     useState([]);

// //   const [secondsRemaining, setSecondsRemaining] =
// //     useState(0);

// //   const [assessmentFinished, setAssessmentFinished] =
// //     useState(false);

// //   const [timeExpired, setTimeExpired] =
// //     useState(false);

// //   const [interviewerQuestion, setInterviewerQuestion] =
// //     useState("");

// //   const [interviewerReason, setInterviewerReason] =
// //     useState("");

// //   const [showInterviewerPrompt, setShowInterviewerPrompt] =
// //     useState(false);

// //   const [interviewerOpen, setInterviewerOpen] =
// //     useState(false);

// //   const [interviewerState, setInterviewerState] =
// //     useState("idle");

// //   const [interviewerTranscript, setInterviewerTranscript] =
// //     useState("");

// //   const [interviewerResponse, setInterviewerResponse] =
// //     useState("");

// //   const [interviewerHistory, setInterviewerHistory] =
// //     useState([]);

// //   const [candidateQuestion, setCandidateQuestion] =
// //     useState("");

// //   const [voiceSupported, setVoiceSupported] =
// //     useState(false);

// //   const [liveObservation, setLiveObservation] =
// //     useState(false);

// //   const [jumpMessage, setJumpMessage] =
// //     useState("");

// //   const [showExamples, setShowExamples] =
// //     useState(true);

// //   const [showConstraints, setShowConstraints] =
// //     useState(true);

// //   const recognitionRef = useRef(null);

// //   const liveTimerRef = useRef(null);

// //   // Keep the interviewer discussion bounded so it cannot enter an
// //   // endless follow-up loop on a single coding question.
// //   const MAX_INTERVIEWER_QUESTIONS = 3;
// //   const interviewerQuestionCountRef = useRef(0);

// //   const mountedRef = useRef(true);
// //   const interviewerGreetingShownRef = useRef(false);

// //   const lastSubmittedCodeRef = useRef("");

// //   const durationMinutes = Number(
// //     assessment?.duration_minutes
// //   );

// //   const questions = Array.isArray(
// //     assessment?.questions
// //   )
// //     ? assessment.questions
// //     : [];

// //   const totalQuestions =
// //     Number(
// //       assessment?.question_count ||
// //         questions.length ||
// //         1
// //     );

// //   useEffect(() => {
// //     // Each coding question gets its own small interviewer discussion.
// //     interviewerQuestionCountRef.current = 0;
// //   }, [currentIndex]);

// //   const examples = useMemo(
// //     () => normalizeExamples(question?.examples),
// //     [question?.examples]
// //   );

// //   const constraints = useMemo(
// //     () => normalizeArray(question?.constraints),
// //     [question?.constraints]
// //   );

// //   const visiblePassed = getVisiblePassed(execution);

// //   const visibleTotal = getVisibleTotal(execution);

// //   const hiddenPassed = getHiddenPassed(
// //     submitResult?.execution || execution
// //   );

// //   const hiddenTotal = getHiddenTotal(
// //     submitResult?.execution || execution
// //   );

// //   const hiddenFailed = getHiddenFailed(
// //     submitResult?.execution || execution
// //   );

// //   const accepted = isAccepted(
// //     judgement,
// //     submitResult?.execution || execution
// //   );

// //   const executionStatus = useMemo(() => {
// //     const message = String(execution?.error || "").toLowerCase();

// //     if (!execution) {
// //       return "idle";
// //     }

// //     if (
// //       message.includes("timed out") ||
// //       message.includes("time limit") ||
// //       message.includes("timeout")
// //     ) {
// //       return "tle";
// //     }

// //     if (
// //       message.includes("compilation") ||
// //       message.includes("g++") ||
// //       message.includes("error:") && !execution?.tests?.length
// //     ) {
// //       return "compile_error";
// //     }

// //     if (message || execution?.stderr) {
// //       return "runtime_error";
// //     }

// //     if (execution?.passed) {
// //       return "accepted";
// //     }

// //     return "wrong_answer";
// //   }, [execution]);

// //   const isCurrentCompleted =
// //     completedResults.some(
// //       (item) =>
// //         Number(item?.question_number) ===
// //         currentIndex + 1
// //     );

// //   const clearInterviewer = useCallback(() => {
// //     if (recognitionRef.current) {
// //       try {
// //         recognitionRef.current.stop();
// //       } catch {
// //         // Ignore browser recognition stop errors.
// //       }
// //     }

// //     recognitionRef.current = null;

// //     if ("speechSynthesis" in window) {
// //       window.speechSynthesis.cancel();
// //     }

// //     setInterviewerState("idle");
// //   }, []);

// //   const saveCode = useCallback(
// //     (value) => {
// //       setCode(value);

// //       if (assessmentId !== null) {
// //         localStorage.setItem(
// //           getCodeKey(
// //             assessmentId,
// //             currentIndex
// //           ),
// //           value
// //         );
// //       }

// //       setCanSubmit(false);

// //       if (execution) {
// //         setExecution(null);
// //       }

// //       if (submitResult) {
// //         setSubmitResult(null);
// //       }

// //       if (judgement) {
// //         setJudgement(null);
// //       }
// //     },
// //     [
// //       assessmentId,
// //       currentIndex,
// //       execution,
// //       submitResult,
// //       judgement,
// //     ]
// //   );

// //   const loadQuestion = useCallback(
// //     async (index = 0) => {
// //       if (!assessmentId) {
// //         setError(
// //           "No active coding assessment was found."
// //         );
// //         setLoading(false);
// //         return;
// //       }

// //       try {
// //         setLoading(true);
// //         setError("");

// //         const assessmentResponse =
// //           await fetch(
// //             `${API_BASE}/api/coding/assessment/${assessmentId}`
// //           );

// //         if (assessmentResponse.ok) {
// //           const assessmentData =
// //             await assessmentResponse.json();

// //           setAssessment(assessmentData);

// //           localStorage.setItem(
// //             ASSESSMENT_KEY,
// //             JSON.stringify(assessmentData)
// //           );

// //           const storedSessionResult = safeJsonParse(
// //             localStorage.getItem(
// //               getSessionResultKey(assessmentId)
// //             ),
// //             null
// //           );

// //           if (
// //             Array.isArray(storedSessionResult?.results)
// //           ) {
// //             setCompletedResults(
// //               storedSessionResult.results
// //             );
// //           }

// //           if (assessmentData.completed) {
// //             setAssessmentFinished(true);
// //             window.location.href = "/coding-result";
// //             return;
// //           }
// //         }

// //         const questionResponse =
// //           await fetch(
// //             `${API_BASE}/api/coding/assessment/${assessmentId}/question?question_index=${index}`
// //           );

// //         if (!questionResponse.ok) {
// //           const body =
// //             await questionResponse.json().catch(
// //               () => null
// //             );

// //           if (
// //             body?.detail ===
// //               "Assessment has already been completed." ||
// //             body?.detail ===
// //               "Assessment has no remaining questions."
// //           ) {
// //             setAssessmentFinished(true);
// //             window.location.href = "/coding-result";
// //             return;
// //           }

// //           throw new Error(
// //             body?.detail ||
// //               "Could not load assessment question."
// //           );
// //         }

// //         const questionData =
// //           await questionResponse.json();

// //         const resolvedQuestion =
// //           extractAssessmentQuestion(
// //             questionData
// //           ) || questionData;

// //         setQuestion(resolvedQuestion);
// //         setVisibleTestCases([]);

// //         // Load the real candidate-visible test bank. If the endpoint is
// //         // unavailable, keep the problem examples as a safe fallback.
// //         const fallbackTests = normalizeExamples(
// //           resolvedQuestion?.examples
// //         ).map((item, itemIndex) => ({
// //           test_number: itemIndex + 1,
// //           input: item?.input ?? item?.stdin ?? "",
// //           expected_output:
// //             item?.expected_output ??
// //             item?.output ??
// //             item?.expected ??
// //             "",
// //           explanation: item?.explanation || "",
// //         }));

// //         try {
// //           const testsResponse = await fetch(
// //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/tests?question_index=${index}`
// //           );

// //           if (testsResponse.ok) {
// //             const testsData = await testsResponse.json();
// //             const serverTests = Array.isArray(testsData?.tests)
// //               ? testsData.tests
// //               : [];
// //             setVisibleTestCases(
// //               serverTests.length ? serverTests : fallbackTests
// //             );
// //           } else {
// //             setVisibleTestCases(fallbackTests);
// //           }
// //         } catch {
// //           setVisibleTestCases(fallbackTests);
// //         }

// //         const resolvedIndex = Number(
// //           resolvedQuestion?.question_number
// //             ? resolvedQuestion.question_number - 1
// //             : index
// //         );

// //         setCurrentIndex(
// //           Math.max(0, resolvedIndex)
// //         );

// //         const savedCode =
// //           localStorage.getItem(
// //             getCodeKey(
// //               assessmentId,
// //               Math.max(0, resolvedIndex)
// //             )
// //           );

// //         const starterCode =
// //           getStarterCode(
// //             resolvedQuestion,
// //             assessmentId,
// //             Math.max(0, resolvedIndex)
// //           );

// //         setCode(
// //           typeof savedCode === "string" && savedCode.trim()
// //             ? savedCode
// //             : starterCode
// //         );

// //         setExecution(null);
// //         setJudgement(null);
// //         setSubmitResult(null);
// //         setCanSubmit(false);

// //         lastSubmittedCodeRef.current = "";

// //         clearInterviewer();
// //       } catch (err) {
// //         if (mountedRef.current) {
// //           setError(
// //             err?.message ||
// //               "Unable to load coding assessment."
// //           );
// //         }
// //       } finally {
// //         if (mountedRef.current) {
// //           setLoading(false);
// //         }
// //       }
// //     },
// //     [
// //       assessmentId,
// //       clearInterviewer,
// //     ]
// //   );

// //   useEffect(() => {
// //     mountedRef.current = true;

// //     const SpeechRecognition =
// //       getSpeechRecognitionConstructor();

// //     setVoiceSupported(
// //       Boolean(SpeechRecognition)
// //     );

// //     return () => {
// //       mountedRef.current = false;

// //       if (liveTimerRef.current) {
// //         clearTimeout(liveTimerRef.current);
// //       }

// //       clearInterviewer();
// //     };
// //   }, [clearInterviewer]);

// //   useEffect(() => {
// //     if (
// //       !question ||
// //       interviewerGreetingShownRef.current
// //     ) {
// //       return;
// //     }

// //     interviewerGreetingShownRef.current = true;

// //     // Show the interviewer prompt first. The candidate explicitly clicks
// //     // "Ask Me" before the AI speaks; never start the discussion automatically.
// //     setInterviewerQuestion(
// //       "Before you code, can you walk me through your approach to this problem?"
// //     );
// //     setInterviewerReason(
// //       "I would like to understand your approach before you begin coding."
// //     );
// //     interviewerQuestionCountRef.current = 1;
// //     setShowInterviewerPrompt(true);
// //     setInterviewerOpen(false);
// //     setInterviewerState("idle");
// //   }, [question]);

// //   useEffect(() => {
// //     // The assessment planner/AI supplies the duration. Never fall back to a
// //     // hard-coded 15-minute limit in the frontend.
// //     if (
// //       !assessmentId ||
// //       !Number.isFinite(durationMinutes) ||
// //       durationMinutes <= 0
// //     ) {
// //       return;
// //     }

// //     const startKey =
// //       getAssessmentStartKey(assessmentId);

// //     let startedAt =
// //       Number(
// //         localStorage.getItem(startKey)
// //       ) || 0;

// //     if (!startedAt) {
// //       startedAt = Date.now();

// //       localStorage.setItem(
// //         startKey,
// //         String(startedAt)
// //       );
// //     }

// //     const totalSeconds =
// //       durationMinutes * 60;

// //     const updateTimer = () => {
// //       const elapsed = Math.floor(
// //         (Date.now() - startedAt) / 1000
// //       );

// //       const remaining = Math.max(
// //         0,
// //         totalSeconds - elapsed
// //       );

// //       setSecondsRemaining(remaining);

// //       if (remaining <= 0) {
// //         setError(
// //           "Assessment time has expired."
// //         );
// //         setTimeExpired(true);
// //         setAssessmentFinished(true);
// //         clearInterviewer();
// //       }
// //     };

// //     updateTimer();

// //     const interval = setInterval(
// //       updateTimer,
// //       1000
// //     );

// //     return () => clearInterval(interval);
// //   }, [
// //     assessmentId,
// //     durationMinutes,
// //     clearInterviewer,
// //   ]);

// //   useEffect(() => {
// //     if (!assessmentId) {
// //       return;
// //     }

// //     let cancelled = false;

// //     const initializeQuestion = async () => {
// //       try {
// //         await startQuestion();
// //         if (!cancelled) {
// //           await loadQuestion(currentIndex);
// //         }
// //       } catch {
// //         // loadQuestion surfaces the useful API error.
// //       }
// //     };

// //     initializeQuestion();

// //     return () => {
// //       cancelled = true;
// //     };
// //   }, [assessmentId]);

// //   useEffect(() => {
// //     if (!assessmentId) {
// //       return;
// //     }

// //     localStorage.setItem(
// //       getCodeKey(
// //         assessmentId,
// //         currentIndex
// //       ),
// //       code
// //     );
// //   }, [
// //     assessmentId,
// //     currentIndex,
// //     code,
// //   ]);

// //   const requestLiveObservation =
// //     useCallback(async () => {
// //       if (
// //         !assessmentId ||
// //         !code.trim() ||
// //         code.trim().length < 20 ||
// //         submitResult ||
// //         assessmentFinished
// //       ) {
// //         return;
// //       }

// //       try {
// //         setLiveObservation(true);

// //         const response =
// //           await fetch(
// //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/live`,
// //             {
// //               method: "POST",
// //               headers: {
// //                 "Content-Type":
// //                   "application/json",
// //               },
// //               body: JSON.stringify({
// //                 code,
// //                 question_index: currentIndex,
// //                 language:
// //                   assessment?.language ||
// //                   "cpp",
// //               }),
// //             }
// //           );

// //         if (!response.ok) {
// //           return;
// //         }

// //         const data =
// //           await response.json();

// //         const interviewer =
// //           extractInterviewer(data);

// //         const newQuestion =
// //           interviewer?.question ||
// //           data?.question ||
// //           "";

// //         if (
// //           newQuestion &&
// //           interviewerQuestionCountRef.current <
// //             MAX_INTERVIEWER_QUESTIONS
// //         ) {
// //           interviewerQuestionCountRef.current += 1;

// //           setInterviewerQuestion(
// //             newQuestion
// //           );

// //           setInterviewerReason(
// //             interviewer?.reason ||
// //               "I have a question about your approach."
// //           );

// //           setShowInterviewerPrompt(
// //             true
// //           );

// //           // Show the prompt, but wait for the candidate to click "Ask Me"
// //           // before opening the discussion or speaking.
// //           setInterviewerOpen(false);
// //           setInterviewerState("idle");
// //         }
// //       } catch {
// //         // Live observation is intentionally
// //         // non-blocking for coding.
// //       } finally {
// //         if (mountedRef.current) {
// //           setLiveObservation(false);
// //         }
// //       }
// //     }, [
// //       assessmentId,
// //       code,
// //       submitResult,
// //       assessmentFinished,
// //       currentIndex,
// //       assessment?.language,
// //     ]);

// //   useEffect(() => {
// //     if (!code.trim()) {
// //       return;
// //     }

// //     if (liveTimerRef.current) {
// //       clearTimeout(
// //         liveTimerRef.current
// //       );
// //     }

// //     liveTimerRef.current =
// //       setTimeout(
// //         requestLiveObservation,
// //         4000
// //       );

// //     return () => {
// //       if (liveTimerRef.current) {
// //         clearTimeout(
// //           liveTimerRef.current
// //         );
// //       }
// //     };
// //   }, [
// //     code,
// //     requestLiveObservation,
// //   ]);

// //   const startQuestion = useCallback(
// //     async (index = currentIndex) => {
// //       if (!assessmentId) {
// //         return;
// //       }

// //       try {
// //         const response =
// //           await fetch(
// //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/start?question_index=${index}`,
// //             {
// //               method: "POST",
// //               headers: {
// //                 "Content-Type":
// //                   "application/json",
// //               },
// //             }
// //           );

// //         if (!response.ok) {
// //           const body =
// //             await response.json().catch(
// //               () => null
// //             );

// //           if (
// //             body?.detail?.includes(
// //               "already been completed"
// //             )
// //           ) {
// //             window.location.href = "/coding-result";
// //             return;
// //           }

// //           throw new Error(
// //             body?.detail ||
// //               "Could not start question."
// //           );
// //         }
// //       } catch (err) {
// //         setError(
// //           err?.message ||
// //             "Could not start coding question."
// //         );
// //       }
// //     },
// //     [assessmentId, currentIndex]
// //   );

// //   const handleRun = useCallback(
// //     async () => {
// //       if (
// //         !assessmentId ||
// //         !code.trim() ||
// //         running ||
// //         submitting ||
// //         secondsRemaining <= 0
// //       ) {
// //         return;
// //       }

// //       try {
// //         setRunning(true);
// //         setError("");

// //         setExecution(null);
// //         setSubmitResult(null);
// //         setJudgement(null);
// //         setCanSubmit(false);

// //         const response =
// //           await fetch(
// //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/run`,
// //             {
// //               method: "POST",
// //               headers: {
// //                 "Content-Type":
// //                   "application/json",
// //               },
// //               body: JSON.stringify({
// //                 code,
// //                 question_index: currentIndex,
// //                 language:
// //                   assessment?.language ||
// //                   "cpp",
// //               }),
// //             }
// //           );

// //         const data =
// //           await response.json().catch(
// //             () => null
// //           );

// //         if (!response.ok) {
// //           throw new Error(
// //             data?.detail ||
// //               "Code execution failed."
// //           );
// //         }

// //         const result =
// //           extractExecution(data) ||
// //           data;

// //         setExecution(result);

// //         const passed =
// //           data?.can_submit === true ||
// //           result?.passed === true ||
// //           (
// //             getVisibleTotal(result) > 0 &&
// //             getVisiblePassed(result) ===
// //               getVisibleTotal(result)
// //           );

// //         setCanSubmit(passed);

// //         if (!passed) {
// //           setError(
// //             "Fix the failing visible tests and Run again before submitting."
// //           );
// //         }
// //       } catch (err) {
// //         setError(
// //           err?.message ||
// //             "Could not execute your code."
// //         );
// //       } finally {
// //         setRunning(false);
// //       }
// //     },
// //     [
// //       assessmentId,
// //       code,
// //       running,
// //       submitting,
// //       secondsRemaining,
// //       assessment?.language,
// //     ]
// //   );

// //   const buildQuestionResult = useCallback(
// //     (
// //       submitData,
// //       resultExecution,
// //       resultJudgement,
// //       resultInterviewer
// //     ) => {
// //       const finalExecution =
// //         resultExecution ||
// //         extractExecution(
// //           submitData
// //         ) ||
// //         {};

// //       const finalJudgement =
// //         resultJudgement ||
// //         extractJudgement(
// //           submitData
// //         ) ||
// //         {};

// //       const finalInterviewer =
// //         resultInterviewer ||
// //         extractInterviewer(
// //           submitData
// //         ) ||
// //         {};

// //       return {
// //         question_number:
// //           question?.question_number ??
// //           currentIndex + 1,

// //         problem_id:
// //           question?.problem_id,

// //         title:
// //           question?.title ||
// //           "Coding Question",

// //         category:
// //           question?.category,

// //         difficulty:
// //           question?.difficulty,

// //         code,

// //         accepted:
// //           isAccepted(
// //             finalJudgement,
// //             finalExecution
// //           ),

// //         // Normalized fields used by CodingResult/History. Keep the
// //         // original execution/judgement fields below untouched.
// //         passed:
// //           isAccepted(
// //             finalJudgement,
// //             finalExecution
// //           ),

// //         submitted: true,

// //         score:
// //           Number.isFinite(Number(finalJudgement?.score))
// //             ? Number(finalJudgement.score)
// //             : Number.isFinite(Number(finalJudgement?.rating))
// //             ? Number(finalJudgement.rating)
// //             : isAccepted(finalJudgement, finalExecution)
// //             ? 10
// //             : 0,

// //         passed_tests:
// //           getVisiblePassed(finalExecution) +
// //           getHiddenPassed(finalExecution),

// //         total_tests:
// //           getVisibleTotal(finalExecution) +
// //           getHiddenTotal(finalExecution),

// //         visible_passed_tests:
// //           getVisiblePassed(
// //             finalExecution
// //           ),

// //         visible_total_tests:
// //           getVisibleTotal(
// //             finalExecution
// //           ),

// //         hidden_passed_tests:
// //           getHiddenPassed(
// //             finalExecution
// //           ),

// //         hidden_total_tests:
// //           getHiddenTotal(
// //             finalExecution
// //           ),

// //         hidden_failed_tests:
// //           getHiddenFailed(
// //             finalExecution
// //           ),

// //         execution_time_ms:
// //           finalExecution?.execution_time_ms ??
// //           finalExecution?.execution_time ??
// //           null,

// //         feedback:
// //           finalJudgement?.reasoning ||
// //           finalJudgement?.feedback ||
// //           "",

// //         approach:
// //           finalJudgement?.approach_name ||
// //           finalJudgement?.approach_level ||
// //           "",

// //         time_complexity:
// //           finalJudgement?.time_complexity ||
// //           "",

// //         space_complexity:
// //           finalJudgement?.space_complexity ||
// //           "",

// //         optimal:
// //           finalJudgement?.optimal,

// //         strengths:
// //           finalJudgement?.strengths || [],

// //         weaknesses:
// //           finalJudgement?.weaknesses || [],

// //         interviewer_question:
// //           finalInterviewer?.question ||
// //           finalJudgement?.recommended_follow_up ||
// //           "",

// //         interviewer_reason:
// //           finalInterviewer?.reason ||
// //           "",

// //         submitted_at:
// //           new Date().toISOString(),
// //       };
// //     },
// //     [
// //       question,
// //       currentIndex,
// //       code,
// //     ]
// //   );

// //   const saveSessionResult = useCallback(
// //     (results) => {
// //       if (!assessmentId) {
// //         return;
// //       }

// //       const existingHistory =
// //         safeJsonParse(
// //           localStorage.getItem(
// //             HISTORY_KEY
// //           ),
// //           []
// //         );

// //       const safeHistory =
// //         Array.isArray(existingHistory)
// //           ? existingHistory
// //           : [];

// //       const resultObject = {
// //         assessment_id:
// //           assessmentId,

// //         mode:
// //           assessment?.mode ||
// //           "personalized",

// //         company:
// //           assessment?.company ||
// //           null,

// //         role:
// //           assessment?.role ||
// //           null,

// //         topics:
// //           assessment?.topics ||
// //           [],

// //         question_count:
// //           totalQuestions,

// //         duration_minutes:
// //           durationMinutes,

// //         completed: true,

// //         completed_at:
// //           new Date().toISOString(),

// //         interviewer_question_count:
// //           interviewerHistory.length,

// //         interviewer_history:
// //           interviewerHistory,

// //         results,
// //       };

// //       const withoutCurrent =
// //         safeHistory.filter(
// //           (item) =>
// //             item?.assessment_id !==
// //             assessmentId
// //         );

// //       withoutCurrent.push(
// //         resultObject
// //       );

// //       localStorage.setItem(
// //         HISTORY_KEY,
// //         JSON.stringify(
// //           withoutCurrent
// //         )
// //       );

// //       localStorage.setItem(
// //         getSessionResultKey(
// //           assessmentId
// //         ),
// //         JSON.stringify(
// //           resultObject
// //         )
// //       );

// //       localStorage.setItem(
// //         "coding_assessment_result",
// //         JSON.stringify(
// //           resultObject
// //         )
// //       );
// //     },
// //     [
// //       assessmentId,
// //       assessment?.mode,
// //       assessment?.company,
// //       assessment?.role,
// //       assessment?.topics,
// //       totalQuestions,
// //       durationMinutes,
// //       interviewerHistory,
// //     ]
// //   );

// //   useEffect(() => {
// //     if (!timeExpired || !assessmentId) {
// //       return;
// //     }

// //     // Preserve whatever has already been completed so the feedback page
// //     // remains useful even when the timer expires before the final question.
// //     saveSessionResult(completedResults);
// //   }, [
// //     timeExpired,
// //     assessmentId,
// //     completedResults,
// //     saveSessionResult,
// //   ]);

// //   const handleSubmit = useCallback(
// //     async () => {
// //       if (
// //         !assessmentId ||
// //         !code.trim() ||
// //         submitting ||
// //         running ||
// //         !canSubmit ||
// //         secondsRemaining <= 0
// //       ) {
// //         return;
// //       }

// //       if (
// //         lastSubmittedCodeRef.current &&
// //         lastSubmittedCodeRef.current !==
// //           code
// //       ) {
// //         setError(
// //           "Your code changed after the last Run. Run it again before submitting."
// //         );
// //         setCanSubmit(false);
// //         return;
// //       }

// //       try {
// //         setSubmitting(true);
// //         setError("");

// //         const response =
// //           await fetch(
// //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/submit`,
// //             {
// //               method: "POST",
// //               headers: {
// //                 "Content-Type":
// //                   "application/json",
// //               },
// //               body: JSON.stringify({
// //                 code,
// //                 question_index: currentIndex,
// //                 language:
// //                   assessment?.language ||
// //                   "cpp",
// //               }),
// //             }
// //           );

// //         const data =
// //           await response.json().catch(
// //             () => null
// //           );

// //         if (!response.ok) {
// //           throw new Error(
// //             data?.detail ||
// //               "Submission failed."
// //           );
// //         }

// //         const finalExecution =
// //           extractExecution(data) ||
// //           {};

// //         const finalJudgement =
// //           extractJudgement(data) ||
// //           {};

// //         const finalInterviewer =
// //           extractInterviewer(data) ||
// //           {};

// //         setSubmitResult(data);
// //         setExecution(finalExecution);
// //         setJudgement(finalJudgement);

// //         lastSubmittedCodeRef.current =
// //           code;

// //         setCanSubmit(false);

// //         const questionResult =
// //           buildQuestionResult(
// //             data,
// //             finalExecution,
// //             finalJudgement,
// //             finalInterviewer
// //           );

// //         const updatedResults = [
// //           ...completedResults,
// //           questionResult,
// //         ];

// //         const uniqueResults =
// //           updatedResults.filter(
// //             (item, index, array) =>
// //               array.findIndex(
// //                 (candidate) =>
// //                   candidate?.question_number ===
// //                   item?.question_number
// //               ) === index
// //           );

// //         setCompletedResults(
// //           uniqueResults
// //         );

// //         localStorage.setItem(
// //           getSessionResultKey(
// //             assessmentId
// //           ),
// //           JSON.stringify({
// //             ...safeJsonParse(
// //               localStorage.getItem(
// //                 getSessionResultKey(
// //                   assessmentId
// //                 )
// //               ),
// //               {}
// //             ),
// //             assessment_id:
// //               assessmentId,
// //             mode:
// //               assessment?.mode ||
// //               "personalized",
// //             results:
// //               uniqueResults,
// //           })
// //         );

// //         const followUpQuestion =
// //           finalInterviewer?.question ||
// //           finalJudgement?.recommended_follow_up ||
// //           (isAccepted(
// //             finalJudgement,
// //             finalExecution
// //           )
// //             ? "Walk me through your approach and explain its time and space complexity."
// //             : "");

// //         setInterviewerQuestion(
// //           followUpQuestion
// //         );

// //         setInterviewerReason(
// //           finalInterviewer?.reason ||
// //             (followUpQuestion
// //               ? "Let's discuss your solution and the reasoning behind it."
// //               : "Let's discuss your solution.")
// //         );

// //         if (
// //           followUpQuestion &&
// //           interviewerQuestionCountRef.current < MAX_INTERVIEWER_QUESTIONS
// //         ) {
// //           interviewerQuestionCountRef.current += 1;
// //           setShowInterviewerPrompt(true);
// //           setInterviewerOpen(false);
// //           setInterviewerState("idle");
// //         }
// //       } catch (err) {
// //         setError(
// //           err?.message ||
// //             "Could not submit solution."
// //         );
// //       } finally {
// //         setSubmitting(false);
// //       }
// //     },
// //     [
// //       assessmentId,
// //       code,
// //       submitting,
// //       running,
// //       canSubmit,
// //       secondsRemaining,
// //       assessment?.language,
// //       assessment?.mode,
// //       completedResults,
// //       buildQuestionResult,
// //     ]
// //   );

// //   const openInterviewer =
// //     useCallback(() => {
// //       if (!interviewerQuestion) {
// //         return;
// //       }

// //       setShowInterviewerPrompt(false);
// //       setInterviewerOpen(true);
// //       setInterviewerTranscript("");
// //       setInterviewerResponse("");
// //       setInterviewerState("speaking");

// //       speakText(
// //         interviewerQuestion,
// //         () => {
// //           if (
// //             mountedRef.current
// //           ) {
// //             setInterviewerState(
// //               "idle"
// //             );
// //           }
// //         }
// //       );
// //     }, [interviewerQuestion]);

// //   const startListening =
// //     useCallback(() => {
// //       const Recognition =
// //         getSpeechRecognitionConstructor();

// //       if (!Recognition) {
// //         setError(
// //           "Voice input is not supported by this browser."
// //         );
// //         return;
// //       }

// //       if (recognitionRef.current) {
// //         try {
// //           recognitionRef.current.stop();
// //         } catch {
// //           // Ignore.
// //         }
// //       }

// //       const recognition =
// //         new Recognition();

// //       recognition.lang = "en-US";
// //       recognition.interimResults = true;
// //       recognition.continuous = false;

// //       recognition.onstart = () => {
// //         setInterviewerState(
// //           "listening"
// //         );
// //       };

// //       recognition.onresult = (
// //         event
// //       ) => {
// //         let transcript = "";

// //         for (
// //           let i = event.resultIndex;
// //           i < event.results.length;
// //           i++
// //         ) {
// //           transcript +=
// //             event.results[i][0]
// //               .transcript;
// //         }

// //         setInterviewerTranscript(
// //           transcript
// //         );
// //       };

// //       recognition.onerror = (
// //         event
// //       ) => {
// //         setInterviewerState(
// //           "idle"
// //         );

// //         if (
// //           event?.error ===
// //           "not-allowed"
// //         ) {
// //           setError(
// //             "Microphone permission was denied."
// //           );
// //         }
// //       };

// //       recognition.onend = () => {
// //         setInterviewerState(
// //           "idle"
// //         );

// //         setInterviewerTranscript(
// //           (previous) =>
// //             previous.trim()
// //         );
// //       };

// //       recognitionRef.current =
// //         recognition;

// //       recognition.start();
// //     }, []);

// //   const submitInterviewAnswer =
// //     useCallback(async () => {
// //       const answer =
// //         interviewerTranscript.trim();

// //       if (!answer) {
// //         return;
// //       }

// //       setInterviewerState(
// //         "processing"
// //       );

// //       setInterviewerHistory((previous) => [
// //         ...previous,
// //         {
// //           question: interviewerQuestion,
// //           answer,
// //           question_index: currentIndex,
// //           asked_at: new Date().toISOString(),
// //         },
// //       ]);

// //       try {
// //         const response =
// //           await fetch(
// //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/interview-answer`,
// //             {
// //               method: "POST",
// //               headers: {
// //                 "Content-Type":
// //                   "application/json",
// //               },
// //               body: JSON.stringify({
// //                 answer,
// //                 question:
// //                   interviewerQuestion,
// //                 code,
// //                 question_index: currentIndex,
// //                 language:
// //                   assessment?.language ||
// //                   "cpp",
// //               }),
// //             }
// //           );

// //         const data =
// //           await response.json().catch(
// //             () => null
// //           );

// //         if (!response.ok) {
// //           throw new Error(
// //             data?.detail ||
// //               "Could not process interview answer."
// //           );
// //         }

// //         const nextQuestion =
// //           data?.question ||
// //           data?.interviewer?.question ||
// //           data?.next_question ||
// //           "";

// //         const responseText =
// //           data?.response ||
// //           data?.message ||
// //           data?.feedback ||
// //           "";

// //         setInterviewerResponse(
// //           responseText
// //         );

// //         if (
// //           nextQuestion &&
// //           interviewerQuestionCountRef.current <
// //             MAX_INTERVIEWER_QUESTIONS
// //         ) {
// //           interviewerQuestionCountRef.current += 1;

// //           setInterviewerQuestion(
// //             nextQuestion
// //           );

// //           setInterviewerTranscript(
// //             ""
// //           );

// //           // Do not ask the next question immediately. Bring the popup back
// //           // so the candidate chooses when to continue the discussion.
// //           setInterviewerState("idle");
// //           setInterviewerOpen(false);
// //           setShowInterviewerPrompt(true);
// //         } else {
// //           // Questioning is finished (including the maximum follow-up limit).
// //           // Close both the popup and the voice panel automatically.
// //           const finishInterviewer = () => {
// //             if (!mountedRef.current) return;
// //             setInterviewerState("idle");
// //             setInterviewerOpen(false);
// //             setShowInterviewerPrompt(false);
// //             setInterviewerQuestion("");
// //             setInterviewerTranscript("");
// //           };

// //           if (responseText) {
// //             speakText(responseText, finishInterviewer);
// //           } else {
// //             finishInterviewer();
// //           }
// //         }
// //       } catch (err) {
// //         setInterviewerState(
// //           "idle"
// //         );

// //         setError(
// //           err?.message ||
// //             "Could not process your interview answer."
// //         );
// //       }
// //     }, [
// //       assessmentId,
// //       interviewerTranscript,
// //       interviewerQuestion,
// //       code,
// //       currentIndex,
// //       assessment?.language,
// //     ]);

// //   const askInterviewer = useCallback(async () => {
// //     const asked = candidateQuestion.trim();

// //     if (!assessmentId || !asked) {
// //       return;
// //     }

// //     try {
// //       setError("");
// //       setInterviewerResponse("");
// //       setInterviewerState("thinking");

// //       const response = await fetch(
// //         `${API_BASE}/api/coding/assessment/${assessmentId}/question/interview-answer`,
// //         {
// //           method: "POST",
// //           headers: {
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({
// //             answer: asked,
// //             question: interviewerQuestion || "Candidate clarification",
// //             code,
// //             question_index: currentIndex,
// //             action: "clarification",
// //           }),
// //         }
// //       );

// //       const data = await response.json().catch(() => null);

// //       if (!response.ok) {
// //         throw new Error(
// //           data?.detail || "Could not contact the interviewer."
// //         );
// //       }

// //       const reply =
// //         data?.response ||
// //         "I can clarify the assumptions without giving away the solution.";

// //       const clarificationQuestion =
// //         data?.question ||
// //         data?.interviewer?.question ||
// //         "";

// //       setCandidateQuestion("");
// //       setInterviewerResponse(reply);

// //       if (
// //         clarificationQuestion &&
// //         interviewerQuestionCountRef.current <
// //           MAX_INTERVIEWER_QUESTIONS
// //       ) {
// //         interviewerQuestionCountRef.current += 1;
// //         setInterviewerQuestion(clarificationQuestion);
// //         setInterviewerOpen(false);
// //         setShowInterviewerPrompt(true);
// //         setInterviewerState("idle");
// //       } else {
// //         setInterviewerState("speaking");
// //         speakText(reply, () => {
// //           if (mountedRef.current) {
// //             setInterviewerState("idle");
// //           }
// //         });
// //       }
// //     } catch (err) {
// //       setInterviewerState("idle");
// //       setError(
// //         err?.message ||
// //           "Could not contact the interviewer."
// //       );
// //     }
// //   }, [
// //     assessmentId,
// //     candidateQuestion,
// //     interviewerQuestion,
// //     code,
// //     currentIndex,
// //   ]);

// //   const closeInterviewer =
// //     useCallback(() => {
// //       clearInterviewer();

// //       setInterviewerOpen(false);
// //       setShowInterviewerPrompt(false);
// //     }, [clearInterviewer]);

// //   const completeAndGoNext =
// //     useCallback(async () => {
// //       if (
// //         !assessmentId ||
// //         !submitResult
// //       ) {
// //         return;
// //       }

// //       try {
// //         setError("");

// //         const result =
// //           buildQuestionResult(
// //             submitResult,
// //             execution,
// //             judgement,
// //             extractInterviewer(
// //               submitResult
// //             )
// //           );

// //         const mergedResults =
// //           completedResults.some(
// //             (item) =>
// //               item?.question_number ===
// //               result?.question_number
// //           )
// //             ? completedResults
// //             : [
// //                 ...completedResults,
// //                 result,
// //               ];

// //         const response =
// //           await fetch(
// //             `${API_BASE}/api/coding/assessment/${assessmentId}/question/complete`,
// //             {
// //               method: "POST",
// //               headers: {
// //                 "Content-Type":
// //                   "application/json",
// //               },
// //               body: JSON.stringify({
// //                 result,
// //               }),
// //             }
// //           );

// //         const data =
// //           await response.json().catch(
// //             () => null
// //           );

// //         if (!response.ok) {
// //           throw new Error(
// //             data?.detail ||
// //               "Could not complete question."
// //           );
// //         }

// //         if (
// //           data?.completed === true
// //         ) {
// //           saveSessionResult(
// //             mergedResults
// //           );

// //           setAssessmentFinished(
// //             true
// //           );

// //           // Keep the candidate on the assessment page and show the
// //           // completion actions. The feedback button performs the
// //           // navigation after the candidate chooses it.
// //           return;
// //         }

// //         setCompletedResults(
// //           mergedResults
// //         );

// //         const nextIndex =
// //           currentIndex + 1;

// //         setCurrentIndex(
// //           nextIndex
// //         );

// //         setQuestion(null);
// //         setExecution(null);
// //         setJudgement(null);
// //         setSubmitResult(null);
// //         setCanSubmit(false);
// //         setInterviewerQuestion("");
// //         setInterviewerTranscript("");
// //         setInterviewerResponse("");

// //         clearInterviewer();

// //         await startQuestion();

// //         await loadQuestion(
// //           nextIndex
// //         );
// //       } catch (err) {
// //         setError(
// //           err?.message ||
// //             "Could not move to the next question."
// //         );
// //       }
// //     }, [
// //       assessmentId,
// //       submitResult,
// //       buildQuestionResult,
// //       execution,
// //       judgement,
// //       completedResults,
// //       saveSessionResult,
// //       currentIndex,
// //       clearInterviewer,
// //       startQuestion,
// //       loadQuestion,
// //     ]);

// //   const jumpToQuestion =
// //     useCallback(
// //       async (index) => {
// //         if (index < 0 || index >= totalQuestions) {
// //           return;
// //         }

// //         if (index === currentIndex) {
// //           return;
// //         }

// //         setJumpMessage("");
// //         setCurrentIndex(index);
// //         setQuestion(null);
// //         setExecution(null);
// //         setJudgement(null);
// //         setSubmitResult(null);
// //         setCanSubmit(false);
// //         setInterviewerQuestion("");
// //         setInterviewerTranscript("");
// //         setInterviewerResponse("");
// //         clearInterviewer();

// //         // IMPORTANT: a question switch must update the backend coding
// //         // session before loading tests. Otherwise Q2 can display Q1's
// //         // test bank (the exact bug seen in the assessment UI).
// //         await startQuestion(index);
// //         await loadQuestion(index);
// //       },
// //       [
// //         currentIndex,
// //         totalQuestions,
// //         clearInterviewer,
// //         startQuestion,
// //         loadQuestion,
// //       ]
// //     );

// //   const goDashboard =
// //     useCallback(() => {
// //       window.location.href = "/";
// //     }, []);

// //   const goFeedback =
// //     useCallback(() => {
// //       window.location.href = "/coding-result";
// //     }, []);

// //   const handleExitAssessment = useCallback(() => {
// //     if (assessmentId) {
// //       saveSessionResult(completedResults);
// //     }
// //     window.location.href = "/coding-result";
// //   }, [assessmentId, completedResults, saveSessionResult]);

// //   const handleReturnDashboard = useCallback(() => {
// //     if (assessmentId) {
// //       saveSessionResult(completedResults);
// //     }
// //     window.location.href = "/";
// //   }, [assessmentId, completedResults, saveSessionResult]);

// //   if (loading && !question) {
// //     return (
// //       <div className="coding-page">
// //         <div className="coding-loading">
// //           <div className="coding-spinner" />
// //           <p>
// //             Preparing your coding assessment...
// //           </p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (
// //     assessmentFinished
// //   ) {
// //     return (
// //       <div className="coding-page">
// //         <div className="coding-complete">
// //           <div className="complete-icon">
// //             ✓
// //           </div>

// //           <h1>
// //             {timeExpired
// //               ? "Time's Up"
// //               : "Assessment Complete"}
// //           </h1>

// //           <p>
// //             {timeExpired
// //               ? "Your assessment time has ended. Your completed work has been saved and is available in AI feedback."
// //               : "Your coding assessment has been completed successfully."}
// //           </p>

// //           <div className="complete-actions">
// //             <button
// //               className="primary-button"
// //               onClick={
// //                 handleExitAssessment
// //               }
// //             >
// //               View AI Feedback
// //             </button>

// //             <button
// //               className="secondary-button"
// //               onClick={
// //                 handleReturnDashboard
// //               }
// //             >
// //               Return to Dashboard
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="coding-page">
// //       <header className="coding-topbar">
// //         <div className="coding-brand">
// //           <span>AI Coding Assessment</span>
// //           <div className="top-interviewer">
// //             <span className="top-interviewer-dot" />
// //             <span className="top-interviewer-name">AI Interviewer</span>
// //             <span className="top-interviewer-status">
// //               {liveObservation ? "Observing" : "Available"}
// //             </span>
// //           </div>
// //         </div>

// //         <div className="coding-topbar-right">
// //           <span>
// //             {assessment?.mode ===
// //             "company_oa"
// //               ? "Company OA"
// //               : assessment?.mode ===
// //                 "contest"
// //               ? "Contest"
// //               : "Personalized"}
// //           </span>

// //           <button
// //             type="button"
// //             className="topbar-action-button"
// //             onClick={handleExitAssessment}
// //             title="Open AI feedback and assessment results"
// //           >
// //             AI Feedback
// //           </button>

// //           <button
// //             type="button"
// //             className="topbar-action-button secondary"
// //             onClick={handleReturnDashboard}
// //             title="Leave the assessment and return to dashboard"
// //           >
// //             Dashboard
// //           </button>
// //         </div>
// //       </header>

// //       <div className="coding-workspace">
// //         <aside className="question-sidebar">
// //           <div className="sidebar-title">
// //             Questions
// //           </div>

// //           <div className="question-list">
// //             {Array.from({
// //               length: totalQuestions,
// //             }).map(
// //               (_, index) => {
// //                 const result =
// //                   completedResults.find(
// //                     (item) =>
// //                       Number(
// //                         item?.question_number
// //                       ) ===
// //                       index + 1
// //                   );

// //                 const isCurrent =
// //                   index ===
// //                   currentIndex;

// //                 const isCompleted =
// //                   Boolean(result);

// //                 return (
// //                   <button
// //                     type="button"
// //                     key={index}
// //                     className={[
// //                       "question-pill",
// //                       isCurrent
// //                         ? "active"
// //                         : "",
// //                       isCompleted
// //                         ? "completed"
// //                         : "",
// //                     ]
// //                       .filter(Boolean)
// //                       .join(" ")}
// //                     onClick={() =>
// //                       jumpToQuestion(index)
// //                     }
// //                     aria-current={
// //                       isCurrent ? "step" : undefined
// //                     }
// //                   >
// //                     <span className="question-pill-number">
// //                       {isCompleted
// //                         ? "✓"
// //                         : index + 1}
// //                     </span>

// //                     <span>
// //                       Question{" "}
// //                       {index + 1}
// //                     </span>
// //                   </button>
// //                 );
// //               }
// //             )}
// //           </div>

// //           <div className="sidebar-bottom">
// //             <button
// //               className="dashboard-link"
// //               onClick={
// //                 goDashboard
// //               }
// //             >
// //               ← Dashboard
// //             </button>
// //           </div>
// //         </aside>

// //         <main className="coding-main">
// //           {error && (
// //             <div className="coding-alert">
// //               <span>{error}</span>

// //               <button
// //                 onClick={() =>
// //                   setError("")
// //                 }
// //               >
// //                 ×
// //               </button>
// //             </div>
// //           )}

// //           {jumpMessage && (
// //             <div className="jump-message">
// //               {jumpMessage}
// //             </div>
// //           )}

// //           <section className="problem-panel">
// //             <div className="problem-header">
// //               <div>
// //                 <div className="problem-meta">
// //                   <span>
// //                     {question?.difficulty ||
// //                       "Medium"}
// //                   </span>

// //                   <span>·</span>

// //                   <span>
// //                     {question?.category ||
// //                       "Algorithms"}
// //                   </span>
// //                 </div>

// //                 <h1>
// //                   {question?.title ||
// //                     "Coding Problem"}
// //                 </h1>
// //               </div>

// //             </div>

// //             <div className="problem-statement">
// //               {question?.statement ||
// //                 question?.description ||
// //                 "Solve the problem using an efficient algorithm."}
// //             </div>

// //             <div className="problem-section">
// //               <button
// //                 className="section-toggle"
// //                 onClick={() =>
// //                   setShowExamples(
// //                     (value) =>
// //                       !value
// //                   )
// //                 }
// //               >
// //                 <span>
// //                   Examples
// //                 </span>

// //                 <span>
// //                   {showExamples
// //                     ? "⌃"
// //                     : "⌄"}
// //                 </span>
// //               </button>

// //               {showExamples &&
// //                 examples.slice(0, 3).map(
// //                   (
// //                     example,
// //                     index
// //                   ) => (
// //                     <div
// //                       className="example-card"
// //                       key={index}
// //                     >
// //                       <div className="example-title">
// //                         Example{" "}
// //                         {index + 1}
// //                       </div>

// //                       {example.input !==
// //                         undefined && (
// //                         <div className="example-row">
// //                           <div className="example-label">
// //                             Input
// //                           </div>

// //                           <pre>
// //                             {formatExampleInput(
// //                               example.input
// //                             )}
// //                           </pre>
// //                         </div>
// //                       )}

// //                       {example.output !==
// //                         undefined && (
// //                         <div className="example-row">
// //                           <div className="example-label">
// //                             Output
// //                           </div>

// //                           <pre>
// //                             {formatExampleOutput(
// //                               example.output
// //                             )}
// //                           </pre>
// //                         </div>
// //                       )}

// //                       {example.expected_output !==
// //                         undefined && (
// //                         <div className="example-row">
// //                           <div className="example-label">
// //                             Output
// //                           </div>

// //                           <pre>
// //                             {formatExampleOutput(
// //                               example.expected_output
// //                             )}
// //                           </pre>
// //                         </div>
// //                       )}

// //                       {example.explanation && (
// //                         <div className="example-explanation">
// //                           {example.explanation}
// //                         </div>
// //                       )}
// //                     </div>
// //                   )
// //                 )}

// //               {showExamples && examples.length > 3 && (
// //                 <div className="examples-more-note">
// //                   Showing the first 3 examples. Review the problem statement for the remaining examples.
// //                 </div>
// //               )}
// //             </div>

// //             {constraints.length >
// //               0 && (
// //               <div className="problem-section">
// //                 <button
// //                   className="section-toggle"
// //                   onClick={() =>
// //                     setShowConstraints(
// //                       (value) =>
// //                         !value
// //                     )
// //                   }
// //                 >
// //                   <span>
// //                     Constraints
// //                   </span>

// //                   <span>
// //                     {showConstraints
// //                       ? "⌃"
// //                       : "⌄"}
// //                   </span>
// //                 </button>

// //                 {showConstraints && (
// //                   <ul className="constraints-list">
// //                     {constraints.map(
// //                       (
// //                         constraint,
// //                         index
// //                       ) => (
// //                         <li
// //                           key={
// //                             index
// //                           }
// //                         >
// //                           {formatConstraint(constraint)}
// //                         </li>
// //                       )
// //                     )}
// //                   </ul>
// //                 )}
// //               </div>
// //             )}
// //           </section>

// //           <section className="editor-panel">
// //             <div className="editor-header">
// //               <div className="editor-language">
// //                 <span className="language-dot" />
// //                 C++
// //               </div>

// //               <div className="editor-actions">
// //                 <button
// //                   type="button"
// //                   className="run-button"
// //                   disabled={
// //                     running ||
// //                     submitting ||
// //                     secondsRemaining <= 0 ||
// //                     isCurrentCompleted
// //                   }
// //                   onClick={
// //                     handleRun
// //                   }
// //                 >
// //                   {running
// //                     ? "Running..."
// //                     : "▶ Run"}
// //                 </button>

// //                 <button
// //                   type="button"
// //                   className={
// //                     canSubmit
// //                       ? "submit-button"
// //                       : "submit-button disabled"
// //                   }
// //                   disabled={
// //                     !canSubmit ||
// //                     running ||
// //                     submitting ||
// //                     isCurrentCompleted
// //                   }
// //                   title={
// //                     !canSubmit
// //                       ? "Run your code successfully first"
// //                       : ""
// //                   }
// //                   onClick={
// //                     handleSubmit
// //                   }
// //                 >
// //                   {submitting
// //                     ? "Submitting..."
// //                     : "Submit"}
// //                 </button>
// //               </div>
// //             </div>

// //             <textarea
// //               className="code-editor"
// //               spellCheck="false"
// //               value={code}
// //               onChange={(event) =>
// //                 saveCode(
// //                   event.target
// //                     .value
// //                 )
// //               }
// //               disabled={
// //                 secondsRemaining <= 0 ||
// //                 assessmentFinished ||
// //                 (isCurrentCompleted &&
// //                   !submitResult)
// //               }
// //             />
// //           </section>

// //           <section className="test-panel">
// //             <div className="test-panel-header">
// //               <div className="test-panel-heading">
// //                 <strong>Test Cases</strong>

// //                 {execution && (
// //                   <span className="test-summary">
// //                     {visiblePassed} / {visibleTotal} cases passed
// //                   </span>
// //                 )}
// //               </div>

// //               <div className="test-panel-statuses">
// //                 {execution && executionStatus === "accepted" && (
// //                   <span className="test-status-badge accepted">✓ Accepted</span>
// //                 )}

// //                 {execution && executionStatus === "wrong_answer" && (
// //                   <span className="test-status-badge failed">Wrong Answer</span>
// //                 )}

// //                 {execution && executionStatus === "tle" && (
// //                   <span className="test-status-badge tle">TLE</span>
// //                 )}

// //                 {execution && executionStatus === "compile_error" && (
// //                   <span className="test-status-badge failed">Compile Error</span>
// //                 )}

// //                 {execution && executionStatus === "runtime_error" && (
// //                   <span className="test-status-badge failed">Runtime Error</span>
// //                 )}

// //                 {submitResult && (
// //                   <span className="hidden-summary">
// //                     Hidden {hiddenPassed} / {hiddenTotal} · Failed {hiddenFailed}
// //                   </span>
// //                 )}
// //               </div>
// //             </div>

// //             <div className="test-result-body">
// //               {execution && (
// //                 <div className="execution-overview">
// //                   <div className="execution-overview-main">
// //                     <strong>
// //                       {visiblePassed} / {visibleTotal} cases passed
// //                     </strong>

// //                     {execution.execution_time_ms != null && (
// //                       <span>
// //                         {Number(execution.execution_time_ms).toFixed(0)} ms
// //                       </span>
// //                     )}
// //                   </div>

// //                   {submitResult && (
// //                     <div className="execution-hidden-summary">
// //                       <span>Hidden {hiddenPassed} / {hiddenTotal}</span>
// //                       <span>Hidden failed {hiddenFailed}</span>
// //                     </div>
// //                   )}
// //                 </div>
// //               )}

// //               {execution?.error && (
// //                 <div className="execution-error-card">
// //                   <div className="execution-error-title">
// //                     {executionStatus === "tle"
// //                       ? "Time Limit Exceeded"
// //                       : executionStatus === "compile_error"
// //                       ? "Compilation Error"
// //                       : executionStatus === "runtime_error"
// //                       ? "Runtime Error"
// //                       : "Execution Error"}
// //                   </div>
// //                   <pre className="execution-error">
// //                     {execution.error}
// //                   </pre>
// //                 </div>
// //               )}

// //               {(execution?.tests?.length
// //                 ? execution.tests
// //                 : visibleTestCases
// //               ).map((test, index) => {
// //                 const hasExecution = Boolean(execution?.tests?.length);
// //                 const passed = hasExecution ? test.passed === true : null;
// //                 const input = test.input ?? test.input_data ?? "";
// //                 const expected =
// //                   test.expected_output ?? test.expected ?? "";
// //                 const actual =
// //                   test.actual_output ?? test.stdout ?? "";

// //                 return (
// //                   <article
// //                     className={`test-case-card ${
// //                       passed === true
// //                         ? "pass"
// //                         : passed === false
// //                         ? "fail"
// //                         : "pending"
// //                     }`}
// //                     key={`${test.test_number ?? index + 1}-${index}`}
// //                   >
// //                     <div className="test-case-card-header">
// //                       <strong>Test Case {test.test_number ?? index + 1}</strong>

// //                       <span
// //                         className={`test-case-status-pill ${
// //                           passed === true
// //                             ? "pass"
// //                             : passed === false
// //                             ? "fail"
// //                             : "pending"
// //                         }`}
// //                       >
// //                         {passed === true
// //                           ? "✓ Passed"
// //                           : passed === false
// //                           ? "✕ Failed"
// //                           : "Not Run"}
// //                       </span>
// //                     </div>

// //                     <div className="test-case-values">
// //                       <div>
// //                         <span>Input</span>
// //                         <pre>{formatExampleInput(input)}</pre>
// //                       </div>

// //                       <div>
// //                         <span>Expected Output</span>
// //                         <pre>{formatExampleOutput(expected)}</pre>
// //                       </div>

// //                       {hasExecution && (
// //                         <div>
// //                           <span>Your Output</span>
// //                           <pre>
// //                             {formatExampleOutput(actual) || "(no output)"}
// //                           </pre>
// //                         </div>
// //                       )}
// //                     </div>

// //                     {test.error && (
// //                       <div className="test-case-error">
// //                         {test.error}
// //                       </div>
// //                     )}

// //                     {test.explanation && (
// //                       <div className="test-case-explanation">
// //                         {test.explanation}
// //                       </div>
// //                     )}
// //                   </article>
// //                 );
// //               })}

// //               {!visibleTestCases.length && !execution?.tests?.length && (
// //                 <div className="empty-tests">
// //                   You must run your code first.
// //                 </div>
// //               )}
// //             </div>
// //           </section>

// //           {submitResult && (
// //             <section className="submission-summary">
// //               <div className="submission-summary-title">
// //                 {accepted
// //                   ? "Solution Accepted"
// //                   : "Submission Evaluated"}
// //               </div>

// //               <div className="submission-grid">
// //                 <div>
// //                   <span>
// //                     Approach
// //                   </span>

// //                   <strong>
// //                     {judgement?.approach_name ||
// //                       judgement?.approach_level ||
// //                       "Evaluated"}
// //                   </strong>
// //                 </div>

// //                 <div>
// //                   <span>
// //                     Time Complexity
// //                   </span>

// //                   <strong>
// //                     {judgement?.time_complexity ||
// //                       "—"}
// //                   </strong>
// //                 </div>

// //                 <div>
// //                   <span>
// //                     Space Complexity
// //                   </span>

// //                   <strong>
// //                     {judgement?.space_complexity ||
// //                       "—"}
// //                   </strong>
// //                 </div>
// //               </div>

// //               {submitResult && hiddenFailed > 0 && (
// //                 <div className="failed-tests-summary hidden-failed-details">
// //                   <strong>Hidden Test Cases — {hiddenFailed} failed</strong>
// //                   <div className="hidden-failed-case-row">
// //                     <span className="hidden-case-status">✕ Failed</span>
// //                     <span>Expected Output: hidden test expected value</span>
// //                     <span>Your Output: did not match expected output</span>
// //                   </div>
// //                   <small>Hidden inputs and exact expected values stay private to protect the assessment.</small>
// //                 </div>
// //               )}

// //               {execution?.tests?.some((test) => test?.passed === false) && (
// //                 <div className="failed-tests-summary visible-failed">
// //                   <strong>Failed visible test cases</strong>
// //                   <span>Open the test cases above to review the input, expected output, and your output.</span>
// //                 </div>
// //               )}
// //             </section>
// //           )}

// //           <section className="candidate-ask-section">
// //             <div className="candidate-ask-interviewer">
// //               <div className="candidate-ask-heading">
// //                 <div>
// //                   <strong>Ask the Interviewer</strong>
// //                   <span>
// //                     Ask a clarification or talk through an assumption without advancing the coding question.
// //                   </span>
// //                 </div>
// //               </div>

// //               <div className="candidate-ask-row">
// //                 <input
// //                   type="text"
// //                   value={candidateQuestion}
// //                   onChange={(event) =>
// //                     setCandidateQuestion(event.target.value)
// //                   }
// //                   onKeyDown={(event) => {
// //                     if (event.key === "Enter") {
// //                       askInterviewer();
// //                     }
// //                   }}
// //                   placeholder="e.g. Can we assume all numbers are positive?"
// //                   disabled={submitting || assessmentFinished}
// //                 />

// //                 <button
// //                   type="button"
// //                   className="ask-button"
// //                   onClick={askInterviewer}
// //                   disabled={!candidateQuestion.trim() || submitting}
// //                 >
// //                   Ask Interview
// //                 </button>

// //                 {voiceSupported && (
// //                   <button
// //                     type="button"
// //                     className="ask-voice-button"
// //                     onClick={() => {
// //                       setInterviewerQuestion(
// //                         "Sure. What would you like to ask me about this problem?"
// //                       );
// //                       setInterviewerReason(
// //                         "Candidate-initiated question."
// //                       );
// //                       setInterviewerOpen(true);
// //                       setInterviewerTranscript("");
// //                       setInterviewerResponse("");
// //                       // Do not start the microphone automatically.
// //                       // The candidate must explicitly click Start Recording.
// //                       setInterviewerState("idle");
// //                     }}
// //                     disabled={submitting || assessmentFinished}
// //                     title="Ask the interviewer by voice"
// //                   >
// //                     🎙 Speak to Interviewer
// //                   </button>
// //                 )}
// //               </div>
// //             </div>
// //           </section>

// //           {showInterviewerPrompt &&
// //             interviewerQuestion && (
// //               <div className="interviewer-popup">
// //                 <div className="popup-icon">
// //                   🎙
// //                 </div>

// //                 <div className="popup-content">
// //                   <div className="popup-title">
// //                     AI Interviewer
// //                   </div>

// //                   <div className="popup-text">
// //                     {interviewerReason ||
// //                       "I have a question about your approach. Would you like to discuss it?"}
// //                   </div>
// //                 </div>

// //                 <button
// //                   type="button"
// //                   className="ask-button"
// //                   onClick={
// //                     openInterviewer
// //                   }
// //                 >
// //                   Ask Me
// //                 </button>
// //               </div>
// //             )}

// //           {interviewerOpen && (
// //             <div className="voice-interview-panel">
// //               <div className="voice-panel-header">
// //                 <div>
// //                   <strong>
// //                     AI Interviewer
// //                   </strong>

// //                   <span>
// //                     Follow-up discussion
// //                   </span>
// //                 </div>

// //                 <button
// //                   className="voice-close"
// //                   onClick={
// //                     closeInterviewer
// //                   }
// //                 >
// //                   ×
// //                 </button>
// //               </div>

// //               <div className="voice-question">
// //                 <div className="voice-label">
// //                   AI
// //                 </div>

// //                 <p>
// //                   {interviewerQuestion}
// //                 </p>

// //                 {interviewerState ===
// //                   "speaking" && (
// //                   <div className="voice-state">
// //                     🔊 Speaking...
// //                   </div>
// //                 )}
// //               </div>

// //               <div className="voice-answer">
// //                 <div className="voice-label">You</div>

// //                 <textarea
// //                   className="interviewer-text-answer"
// //                   value={interviewerTranscript}
// //                   onChange={(event) =>
// //                     setInterviewerTranscript(event.target.value)
// //                   }
// //                   onKeyDown={(event) => {
// //                     // Enter is for normal text entry; microphone recording
// //                     // starts only when the candidate explicitly clicks
// //                     // Start Recording.
// //                     if (
// //                       event.key === "Enter" &&
// //                       !event.shiftKey &&
// //                       !event.ctrlKey &&
// //                       !event.metaKey
// //                     ) {
// //                       event.preventDefault();
// //                       if (
// //                         interviewerTranscript.trim() &&
// //                         interviewerState !== "processing" &&
// //                         interviewerState !== "speaking"
// //                       ) {
// //                         submitInterviewAnswer();
// //                       }
// //                     }
// //                   }}
// //                   placeholder="Type your answer, or click Start Recording to speak..."
// //                   disabled={interviewerState === "processing"}
// //                 />

// //                 {interviewerState === "listening" && (
// //                   <div className="listening-indicator">
// //                     <span className="pulse" />
// //                     🎙 Listening...
// //                   </div>
// //                 )}
// //               </div>

// //               {interviewerResponse && (
// //                 <div className="voice-feedback">
// //                   {interviewerResponse}
// //                 </div>
// //               )}

// //               <div className="voice-actions">
// //                 {voiceSupported ? (
// //                   <button
// //                     type="button"
// //                     className="record-button"
// //                     onClick={
// //                       interviewerState === "listening"
// //                         ? () => {
// //                             try { recognitionRef.current?.stop(); } catch {}
// //                           }
// //                         : startListening
// //                     }
// //                     disabled={interviewerState === "speaking" || interviewerState === "processing"}
// //                   >
// //                     🎙 {interviewerState === "listening" ? "End Recording" : "Start Recording"}
// //                   </button>
// //                 ) : (
// //                   <span className="voice-warning">Voice input is not supported in this browser.</span>
// //                 )}

// //                 <button
// //                   type="button"
// //                   className="answer-button"
// //                   onClick={submitInterviewAnswer}
// //                   disabled={!interviewerTranscript.trim() || interviewerState === "processing" || interviewerState === "speaking"}
// //                 >
// //                   Send Answer →
// //                 </button>
// //               </div>

// //             </div>
// //           )}

// //           {submitResult && !isCurrentCompleted && (
// //             <div className="question-navigation-footer">
// //               <div>
// //                 <strong>
// //                   Question{" "}
// //                   {currentIndex + 1}{" "}
// //                   completed
// //                 </strong>

// //                 <span>
// //                   {accepted
// //                     ? "Solution accepted."
// //                     : "Submission evaluated."}
// //                 </span>
// //               </div>

// //               {currentIndex <
// //               totalQuestions - 1 ? (
// //                 <button
// //                   className="next-button"
// //                   onClick={
// //                     completeAndGoNext
// //                   }
// //                 >
// //                   Next Question →
// //                 </button>
// //               ) : (
// //                 <button
// //                   className="next-button"
// //                   onClick={
// //                     completeAndGoNext
// //                   }
// //                 >
// //                   Finish Assessment ✓
// //                 </button>
// //               )}
// //             </div>
// //           )}

// //           {isCurrentCompleted && (
// //             <div className="review-banner">
// //               This question has already been completed.
// //               You are viewing it in review mode.
// //             </div>
// //           )}
// //         </main>
// //       </div>
// //     </div>
// //   );
// // }


// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import "./CodingAssessment.css";

// const API_BASE = "http://127.0.0.1:8000";

// const ASSESSMENT_ID_KEY = "coding_assessment_id";
// const ASSESSMENT_KEY = "coding_assessment";
// const HISTORY_KEY = "coding_assessment_history";

// function safeJsonParse(value, fallback = null) {
//   if (typeof value !== "string") {
//     return value ?? fallback;
//   }

//   try {
//     return JSON.parse(value);
//   } catch {
//     return fallback;
//   }
// }

// function normalizeArray(value) {
//   if (Array.isArray(value)) {
//     return value;
//   }

//   if (typeof value === "string") {
//     const parsed = safeJsonParse(value, null);

//     if (Array.isArray(parsed)) {
//       return parsed;
//     }

//     return value
//       .split("\n")
//       .map((item) => item.trim())
//       .filter(Boolean);
//   }

//   return [];
// }

// function normalizeExamples(value) {
//   if (!value) {
//     return [];
//   }

//   let examples = value;

//   if (typeof examples === "string") {
//     examples = safeJsonParse(examples, null);

//     if (!examples) {
//       return [];
//     }
//   }

//   if (!Array.isArray(examples)) {
//     examples = [examples];
//   }

//   return examples
//     .map((example) => {
//       if (typeof example === "string") {
//         const parsed = safeJsonParse(example, null);

//         if (parsed && typeof parsed === "object") {
//           return parsed;
//         }

//         return {
//           input: example,
//         };
//       }

//       if (example && typeof example === "object") {
//         if (
//           typeof example.text === "string" &&
//           !example.input &&
//           !example.output
//         ) {
//           const nested = safeJsonParse(example.text, null);

//           if (Array.isArray(nested)) {
//             return nested[0] || example;
//           }

//           if (nested && typeof nested === "object") {
//             return nested;
//           }

//           return {
//             explanation: example.text,
//           };
//         }

//         return example;
//       }

//       return null;
//     })
//     .filter(Boolean);
// }

// function formatExampleInput(value) {
//   if (value === undefined || value === null) {
//     return "";
//   }

//   if (typeof value === "string") {
//     return value;
//   }

//   return JSON.stringify(value, null, 2);
// }

// function formatConstraint(value) {
//   if (value === undefined || value === null) return "";

//   if (typeof value === "object") {
//     if (Array.isArray(value)) {
//       return value.map(formatConstraint).filter(Boolean).join(" ");
//     }
//     if (typeof value.text === "string") return formatConstraint(value.text);
//     if (typeof value.constraint === "string") return formatConstraint(value.constraint);
//     return Object.entries(value)
//       .map(([key, item]) => `${key}: ${formatConstraint(item)}`)
//       .join(" • ");
//   }

//   let text = String(value).trim();
//   if (!text) return "";

//   const parsed = safeJsonParse(text, null);
//   if (parsed !== null && parsed !== value) {
//     return formatConstraint(parsed);
//   }

//   // Clean common AI/JSON presentation artefacts without changing the
//   // constraint's meaning.
//   text = text
//     .replace(/\\n/g, "\n")
//     .replace(/\r/g, "")
//     .replace(/^[\s•*-]+/, "")
//     .trim();

//   return text;
// }

// function formatExampleOutput(value) {
//   if (value === undefined || value === null) {
//     return "";
//   }

//   if (typeof value === "string") {
//     return value;
//   }

//   return JSON.stringify(value, null, 2);
// }

// function formatTime(totalSeconds) {
//   const safeSeconds = Math.max(0, Number(totalSeconds) || 0);

//   const hours = Math.floor(safeSeconds / 3600);
//   const minutes = Math.floor((safeSeconds % 3600) / 60);
//   const seconds = safeSeconds % 60;

//   if (hours > 0) {
//     return `${String(hours).padStart(2, "0")}:${String(
//       minutes
//     ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
//   }

//   return `${String(minutes).padStart(2, "0")}:${String(
//     seconds
//   ).padStart(2, "0")}`;
// }

// function getAssessmentId() {
//   return (
//     localStorage.getItem(ASSESSMENT_ID_KEY) ||
//     safeJsonParse(localStorage.getItem(ASSESSMENT_KEY), {})?.assessment_id ||
//     null
//   );
// }

// function getStoredAssessment() {
//   return safeJsonParse(
//     localStorage.getItem(ASSESSMENT_KEY),
//     {}
//   );
// }

// function getAssessmentStartKey(assessmentId) {
//   return `coding_assessment_start_${assessmentId}`;
// }

// function getCodeKey(assessmentId, questionIndex) {
//   return `coding_assessment_code_${assessmentId}_${questionIndex}`;
// }

// function getSessionResultKey(assessmentId) {
//   return `coding_assessment_result_${assessmentId}`;
// }

// function extractAssessmentQuestion(payload) {
//   if (!payload) {
//     return null;
//   }

//   if (payload.question) {
//     return payload.question;
//   }

//   if (payload.current_question) {
//     return payload.current_question;
//   }

//   if (payload.next_question) {
//     return payload.next_question;
//   }

//   if (payload.assessment?.question) {
//     return payload.assessment.question;
//   }

//   return null;
// }

// function extractExecution(payload) {
//   if (!payload) {
//     return null;
//   }

//   return (
//     payload.execution ||
//     payload.result ||
//     payload.execution_result ||
//     null
//   );
// }

// function extractJudgement(payload) {
//   if (!payload) {
//     return null;
//   }

//   return (
//     payload.judgement ||
//     payload.solution_judgement ||
//     payload.evaluation ||
//     null
//   );
// }

// function extractInterviewer(payload) {
//   if (!payload) {
//     return null;
//   }

//   return (
//     payload.interviewer ||
//     payload.interviewer_event ||
//     payload.event ||
//     null
//   );
// }

// function getVisiblePassed(execution) {
//   if (!execution) {
//     return 0;
//   }

//   return Number(
//     execution.visible_passed_tests ??
//       execution.passed_tests ??
//       execution.passed ??
//       0
//   );
// }

// function getVisibleTotal(execution) {
//   if (!execution) {
//     return 0;
//   }

//   return Number(
//     execution.visible_total_tests ??
//       execution.total_tests ??
//       execution.tests?.length ??
//       0
//   );
// }

// function getHiddenPassed(execution) {
//   if (!execution) {
//     return 0;
//   }

//   return Number(
//     execution.hidden_passed_tests ??
//       execution.hidden_passed ??
//       0
//   );
// }

// function getHiddenTotal(execution) {
//   if (!execution) {
//     return 0;
//   }

//   return Number(
//     execution.hidden_total_tests ??
//       execution.hidden_total ??
//       0
//   );
// }

// function getHiddenFailed(execution) {
//   const passed = getHiddenPassed(execution);
//   const total = getHiddenTotal(execution);

//   if (!total) {
//     return Number(execution?.hidden_failed_tests ?? 0);
//   }

//   return Math.max(0, total - passed);
// }

// function isAccepted(judgement, execution) {
//   if (
//     judgement &&
//     typeof judgement.correct === "boolean"
//   ) {
//     return judgement.correct;
//   }

//   if (
//     execution &&
//     typeof execution.passed === "boolean"
//   ) {
//     return execution.passed;
//   }

//   return false;
// }

// function getStarterCode(question, assessmentId, questionIndex) {
//   const stored = localStorage.getItem(
//     getCodeKey(assessmentId, questionIndex)
//   );

//   // An empty saved editor value must NOT hide the default boilerplate.
//   if (typeof stored === "string" && stored.trim()) {
//     return stored;
//   }

//   const fallbackStarter = `#include <bits/stdc++.h>
// using namespace std;

// int main() {
//     // Enter the code here

//     return 0;
// }
// `;

//   // Prefer a real C++ starter only when it contains a main block.
//   // This keeps the assessment editor in stdin/stdout main()-based format.
//   const questionStarter =
//     typeof question?.starter_code === "string"
//       ? question.starter_code
//       : "";
//   const questionTemplate =
//     typeof question?.code_template === "string"
//       ? question.code_template
//       : "";

//   if (questionStarter.trim() && /\bint\s+main\s*\(/.test(questionStarter)) {
//     return questionStarter;
//   }

//   if (questionTemplate.trim() && /\bint\s+main\s*\(/.test(questionTemplate)) {
//     return questionTemplate;
//   }

//   return fallbackStarter;
// }

// function getSpeechRecognitionConstructor() {
//   return (
//     window.SpeechRecognition ||
//     window.webkitSpeechRecognition ||
//     null
//   );
// }

// function speakText(text, onEnd) {
//   if (!text) {
//     onEnd?.();
//     return;
//   }

//   if (!("speechSynthesis" in window)) {
//     onEnd?.();
//     return;
//   }

//   window.speechSynthesis.cancel();

//   const utterance = new SpeechSynthesisUtterance(text);

//   utterance.rate = 0.95;
//   utterance.pitch = 1;
//   utterance.volume = 1;

//   utterance.onend = () => {
//     onEnd?.();
//   };

//   utterance.onerror = () => {
//     onEnd?.();
//   };

//   window.speechSynthesis.speak(utterance);
// }


// const codingAssessmentFinalStyles = `
//   .topbar-action-button {
//     border: 1px solid rgba(255,255,255,.16);
//     background: rgba(255,255,255,.06);
//     color: inherit;
//     border-radius: 7px;
//     padding: 7px 10px;
//     font-size: 12px;
//     font-weight: 600;
//     cursor: pointer;
//     white-space: nowrap;
//   }
//   .topbar-action-button:hover { background: rgba(255,255,255,.12); }
//   .topbar-action-button.secondary { opacity: .9; }
//   .failed-tests-summary {
//     margin-top: 14px;
//     padding: 12px 14px;
//     border: 1px solid rgba(255,255,255,.10);
//     border-radius: 8px;
//     display: flex;
//     flex-direction: column;
//     gap: 4px;
//     font-size: 13px;
//   }
//   .failed-tests-summary span { opacity: .72; font-size: 12px; }
//   @media (max-width: 900px) {
//     .topbar-action-button { padding: 6px 8px; font-size: 11px; }
//   }
// `;

// if (typeof document !== "undefined" && !document.getElementById("coding-assessment-final-styles")) {
//   const style = document.createElement("style");
//   style.id = "coding-assessment-final-styles";
//   style.textContent = codingAssessmentFinalStyles;
//   document.head.appendChild(style);
// }

// export default function CodingAssessment() {

//   const [assessmentId, setAssessmentId] = useState(
//     getAssessmentId()
//   );

//   const [assessment, setAssessment] = useState(
//     getStoredAssessment()
//   );

//   const [question, setQuestion] = useState(null);

//   const [currentIndex, setCurrentIndex] = useState(0);

//   const [code, setCode] = useState("");

//   const [loading, setLoading] = useState(true);

//   const [running, setRunning] = useState(false);

//   const [submitting, setSubmitting] = useState(false);

//   const [error, setError] = useState("");

//   const [execution, setExecution] = useState(null);

//   const [visibleTestCases, setVisibleTestCases] = useState([]);

//   const [judgement, setJudgement] = useState(null);

//   const [submitResult, setSubmitResult] = useState(null);

//   const [canSubmit, setCanSubmit] = useState(false);

//   const [completedResults, setCompletedResults] =
//     useState([]);

//   const [secondsRemaining, setSecondsRemaining] =
//     useState(0);

//   const [assessmentFinished, setAssessmentFinished] =
//     useState(false);

//   const [timeExpired, setTimeExpired] =
//     useState(false);

//   const [interviewerQuestion, setInterviewerQuestion] =
//     useState("");

//   const [interviewerReason, setInterviewerReason] =
//     useState("");

//   const [showInterviewerPrompt, setShowInterviewerPrompt] =
//     useState(false);

//   const [interviewerOpen, setInterviewerOpen] =
//     useState(false);

//   const [interviewerState, setInterviewerState] =
//     useState("idle");

//   const [interviewerTranscript, setInterviewerTranscript] =
//     useState("");

//   const [interviewerResponse, setInterviewerResponse] =
//     useState("");

//   const [interviewerHistory, setInterviewerHistory] =
//     useState([]);

//   const [candidateQuestion, setCandidateQuestion] =
//     useState("");

//   const [voiceSupported, setVoiceSupported] =
//     useState(false);

//   const [liveObservation, setLiveObservation] =
//     useState(false);

//   const [jumpMessage, setJumpMessage] =
//     useState("");

//   const [showExamples, setShowExamples] =
//     useState(true);

//   const [showConstraints, setShowConstraints] =
//     useState(true);

//   const recognitionRef = useRef(null);

//   const liveTimerRef = useRef(null);

//   // Keep the interviewer discussion bounded so it cannot enter an
//   // endless follow-up loop on a single coding question.
//   const MAX_INTERVIEWER_QUESTIONS = 3;
//   const interviewerQuestionCountRef = useRef(0);
//   const interviewerDiscussionActiveRef = useRef(false);

//   const mountedRef = useRef(true);
//   const interviewerGreetingShownRef = useRef(false);

//   const lastSubmittedCodeRef = useRef("");

//   const durationMinutes = Number(
//     assessment?.duration_minutes
//   );

//   const questions = Array.isArray(
//     assessment?.questions
//   )
//     ? assessment.questions
//     : [];

//   const totalQuestions =
//     Number(
//       assessment?.question_count ||
//         questions.length ||
//         1
//     );

//   useEffect(() => {
//     // Each coding question gets its own small interviewer discussion.
//     interviewerQuestionCountRef.current = 0;
//     interviewerDiscussionActiveRef.current = false;
//   }, [currentIndex]);

//   const examples = useMemo(
//     () => normalizeExamples(question?.examples),
//     [question?.examples]
//   );

//   const constraints = useMemo(
//     () => normalizeArray(question?.constraints),
//     [question?.constraints]
//   );

//   const visiblePassed = getVisiblePassed(execution);

//   const visibleTotal = getVisibleTotal(execution);

//   const hiddenPassed = getHiddenPassed(
//     submitResult?.execution || execution
//   );

//   const hiddenTotal = getHiddenTotal(
//     submitResult?.execution || execution
//   );

//   const hiddenFailed = getHiddenFailed(
//     submitResult?.execution || execution
//   );

//   const accepted = isAccepted(
//     judgement,
//     submitResult?.execution || execution
//   );

//   const executionStatus = useMemo(() => {
//     const message = String(execution?.error || "").toLowerCase();

//     if (!execution) {
//       return "idle";
//     }

//     if (
//       message.includes("timed out") ||
//       message.includes("time limit") ||
//       message.includes("timeout")
//     ) {
//       return "tle";
//     }

//     if (
//       message.includes("compilation") ||
//       message.includes("g++") ||
//       message.includes("error:") && !execution?.tests?.length
//     ) {
//       return "compile_error";
//     }

//     if (message || execution?.stderr) {
//       return "runtime_error";
//     }

//     if (execution?.passed) {
//       return "accepted";
//     }

//     return "wrong_answer";
//   }, [execution]);

//   const isCurrentCompleted =
//     completedResults.some(
//       (item) =>
//         Number(item?.question_number) ===
//         currentIndex + 1
//     );

//   const clearInterviewer = useCallback(() => {
//     if (recognitionRef.current) {
//       try {
//         recognitionRef.current.stop();
//       } catch {
//         // Ignore browser recognition stop errors.
//       }
//     }

//     recognitionRef.current = null;

//     if ("speechSynthesis" in window) {
//       window.speechSynthesis.cancel();
//     }

//     setInterviewerState("idle");
//   }, []);

//   const saveCode = useCallback(
//     (value) => {
//       setCode(value);

//       if (assessmentId !== null) {
//         localStorage.setItem(
//           getCodeKey(
//             assessmentId,
//             currentIndex
//           ),
//           value
//         );
//       }

//       setCanSubmit(false);

//       if (execution) {
//         setExecution(null);
//       }

//       if (submitResult) {
//         setSubmitResult(null);
//       }

//       if (judgement) {
//         setJudgement(null);
//       }
//     },
//     [
//       assessmentId,
//       currentIndex,
//       execution,
//       submitResult,
//       judgement,
//     ]
//   );

//   const loadQuestion = useCallback(
//     async (index = 0) => {
//       if (!assessmentId) {
//         setError(
//           "No active coding assessment was found."
//         );
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError("");

//         const assessmentResponse =
//           await fetch(
//             `${API_BASE}/api/coding/assessment/${assessmentId}`
//           );

//         if (assessmentResponse.ok) {
//           const assessmentData =
//             await assessmentResponse.json();

//           setAssessment(assessmentData);

//           localStorage.setItem(
//             ASSESSMENT_KEY,
//             JSON.stringify(assessmentData)
//           );

//           const storedSessionResult = safeJsonParse(
//             localStorage.getItem(
//               getSessionResultKey(assessmentId)
//             ),
//             null
//           );

//           if (
//             Array.isArray(storedSessionResult?.results)
//           ) {
//             setCompletedResults(
//               storedSessionResult.results
//             );
//           }

//           if (assessmentData.completed) {
//             setAssessmentFinished(true);
//             window.location.href = "/coding-result";
//             return;
//           }
//         }

//         const questionResponse =
//           await fetch(
//             `${API_BASE}/api/coding/assessment/${assessmentId}/question?question_index=${index}`
//           );

//         if (!questionResponse.ok) {
//           const body =
//             await questionResponse.json().catch(
//               () => null
//             );

//           if (
//             body?.detail ===
//               "Assessment has already been completed." ||
//             body?.detail ===
//               "Assessment has no remaining questions."
//           ) {
//             setAssessmentFinished(true);
//             window.location.href = "/coding-result";
//             return;
//           }

//           throw new Error(
//             body?.detail ||
//               "Could not load assessment question."
//           );
//         }

//         const questionData =
//           await questionResponse.json();

//         const resolvedQuestion =
//           extractAssessmentQuestion(
//             questionData
//           ) || questionData;

//         setQuestion(resolvedQuestion);
//         setVisibleTestCases([]);

//         // Load the real candidate-visible test bank. If the endpoint is
//         // unavailable, keep the problem examples as a safe fallback.
//         const fallbackTests = normalizeExamples(
//           resolvedQuestion?.examples
//         ).map((item, itemIndex) => ({
//           test_number: itemIndex + 1,
//           input: item?.input ?? item?.stdin ?? "",
//           expected_output:
//             item?.expected_output ??
//             item?.output ??
//             item?.expected ??
//             "",
//           explanation: item?.explanation || "",
//         }));

//         try {
//           const testsResponse = await fetch(
//             `${API_BASE}/api/coding/assessment/${assessmentId}/question/tests?question_index=${index}`
//           );

//           if (testsResponse.ok) {
//             const testsData = await testsResponse.json();
//             const serverTests = Array.isArray(testsData?.tests)
//               ? testsData.tests
//               : [];
//             setVisibleTestCases(
//               serverTests.length ? serverTests : fallbackTests
//             );
//           } else {
//             setVisibleTestCases(fallbackTests);
//           }
//         } catch {
//           setVisibleTestCases(fallbackTests);
//         }

//         const resolvedIndex = Number(
//           resolvedQuestion?.question_number
//             ? resolvedQuestion.question_number - 1
//             : index
//         );

//         setCurrentIndex(
//           Math.max(0, resolvedIndex)
//         );

//         const savedCode =
//           localStorage.getItem(
//             getCodeKey(
//               assessmentId,
//               Math.max(0, resolvedIndex)
//             )
//           );

//         const starterCode =
//           getStarterCode(
//             resolvedQuestion,
//             assessmentId,
//             Math.max(0, resolvedIndex)
//           );

//         setCode(
//           typeof savedCode === "string" && savedCode.trim()
//             ? savedCode
//             : starterCode
//         );

//         setExecution(null);
//         setJudgement(null);
//         setSubmitResult(null);
//         setCanSubmit(false);

//         lastSubmittedCodeRef.current = "";

//         clearInterviewer();
//       } catch (err) {
//         if (mountedRef.current) {
//           setError(
//             err?.message ||
//               "Unable to load coding assessment."
//           );
//         }
//       } finally {
//         if (mountedRef.current) {
//           setLoading(false);
//         }
//       }
//     },
//     [
//       assessmentId,
//       clearInterviewer,
//     ]
//   );

//   useEffect(() => {
//     mountedRef.current = true;

//     const SpeechRecognition =
//       getSpeechRecognitionConstructor();

//     setVoiceSupported(
//       Boolean(SpeechRecognition)
//     );

//     return () => {
//       mountedRef.current = false;

//       if (liveTimerRef.current) {
//         clearTimeout(liveTimerRef.current);
//       }

//       clearInterviewer();
//     };
//   }, [clearInterviewer]);

//   useEffect(() => {
//     if (
//       !question ||
//       interviewerGreetingShownRef.current
//     ) {
//       return;
//     }

//     interviewerGreetingShownRef.current = true;

//     // The opening greeting is not a question requiring permission. Speak it
//     // automatically when the problem is first opened. Solution-related
//     // questions use the separate permission popup below.
//     const greeting =
//       "Hey, could you please solve this problem? Take your time and think through your approach. If you have any doubts or want to discuss an assumption, I’m here to help.";

//     interviewerQuestionCountRef.current = 0;
//     interviewerDiscussionActiveRef.current = false;
//     // The greeting is informational, not a solution-related interview
//     // question. It must be spoken automatically when the problem opens and
//     // must never consume an interviewer-question slot or require "Ask Me".
//     setInterviewerQuestion("");
//     setInterviewerReason("");
//     setShowInterviewerPrompt(false);
//     setInterviewerOpen(true);
//     setInterviewerState("speaking");

//     speakText(greeting, () => {
//       if (mountedRef.current) {
//         setInterviewerState("idle");
//         setInterviewerOpen(false);
//         setShowInterviewerPrompt(false);
//       }
//     });
//   }, [question]);

//   useEffect(() => {
//     // The assessment planner/AI supplies the duration. Never fall back to a
//     // hard-coded 15-minute limit in the frontend.
//     if (
//       !assessmentId ||
//       !Number.isFinite(durationMinutes) ||
//       durationMinutes <= 0
//     ) {
//       return;
//     }

//     const startKey =
//       getAssessmentStartKey(assessmentId);

//     let startedAt =
//       Number(
//         localStorage.getItem(startKey)
//       ) || 0;

//     if (!startedAt) {
//       startedAt = Date.now();

//       localStorage.setItem(
//         startKey,
//         String(startedAt)
//       );
//     }

//     const totalSeconds =
//       durationMinutes * 60;

//     const updateTimer = () => {
//       const elapsed = Math.floor(
//         (Date.now() - startedAt) / 1000
//       );

//       const remaining = Math.max(
//         0,
//         totalSeconds - elapsed
//       );

//       setSecondsRemaining(remaining);

//       if (remaining <= 0) {
//         setError(
//           "Assessment time has expired."
//         );
//         setTimeExpired(true);
//         setAssessmentFinished(true);
//         clearInterviewer();
//       }
//     };

//     updateTimer();

//     const interval = setInterval(
//       updateTimer,
//       1000
//     );

//     return () => clearInterval(interval);
//   }, [
//     assessmentId,
//     durationMinutes,
//     clearInterviewer,
//   ]);

//   useEffect(() => {
//     if (!assessmentId) {
//       return;
//     }

//     let cancelled = false;

//     const initializeQuestion = async () => {
//       try {
//         await startQuestion();
//         if (!cancelled) {
//           await loadQuestion(currentIndex);
//         }
//       } catch {
//         // loadQuestion surfaces the useful API error.
//       }
//     };

//     initializeQuestion();

//     return () => {
//       cancelled = true;
//     };
//   }, [assessmentId]);

//   useEffect(() => {
//     if (!assessmentId) {
//       return;
//     }

//     localStorage.setItem(
//       getCodeKey(
//         assessmentId,
//         currentIndex
//       ),
//       code
//     );
//   }, [
//     assessmentId,
//     currentIndex,
//     code,
//   ]);

//   const requestLiveObservation =
//     useCallback(async () => {
//       if (
//         !assessmentId ||
//         !code.trim() ||
//         code.trim().length < 20 ||
//         submitResult ||
//         assessmentFinished
//       ) {
//         return;
//       }

//       try {
//         setLiveObservation(true);

//         const response =
//           await fetch(
//             `${API_BASE}/api/coding/assessment/${assessmentId}/question/live`,
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type":
//                   "application/json",
//               },
//               body: JSON.stringify({
//                 code,
//                 question_index: currentIndex,
//                 language:
//                   assessment?.language ||
//                   "cpp",
//               }),
//             }
//           );

//         if (!response.ok) {
//           return;
//         }

//         const data =
//           await response.json();

//         const interviewer =
//           extractInterviewer(data);

//         const newQuestion =
//           interviewer?.question ||
//           data?.question ||
//           "";

//         if (
//           newQuestion &&
//           interviewerQuestionCountRef.current <
//             MAX_INTERVIEWER_QUESTIONS
//         ) {
//           interviewerQuestionCountRef.current += 1;

//           setInterviewerQuestion(
//             newQuestion
//           );

//           setInterviewerReason(
//             interviewer?.reason ||
//               "I have a question about your approach."
//           );

//           setShowInterviewerPrompt(
//             true
//           );

//           // Show the prompt, but wait for the candidate to click "Ask Me"
//           // before opening the discussion or speaking.
//           setInterviewerOpen(false);
//           setInterviewerState("idle");
//         } else if (newQuestion) {
//           // The discussion limit has been reached; do not leave a stale popup visible.
//           setInterviewerQuestion("");
//           setShowInterviewerPrompt(false);
//           setInterviewerOpen(false);
//           interviewerDiscussionActiveRef.current = false;
//         }
//       } catch {
//         // Live observation is intentionally
//         // non-blocking for coding.
//       } finally {
//         if (mountedRef.current) {
//           setLiveObservation(false);
//         }
//       }
//     }, [
//       assessmentId,
//       code,
//       submitResult,
//       assessmentFinished,
//       currentIndex,
//       assessment?.language,
//     ]);

//   useEffect(() => {
//     if (!code.trim()) {
//       return;
//     }

//     if (liveTimerRef.current) {
//       clearTimeout(
//         liveTimerRef.current
//       );
//     }

//     liveTimerRef.current =
//       setTimeout(
//         requestLiveObservation,
//         4000
//       );

//     return () => {
//       if (liveTimerRef.current) {
//         clearTimeout(
//           liveTimerRef.current
//         );
//       }
//     };
//   }, [
//     code,
//     requestLiveObservation,
//   ]);

//   const startQuestion = useCallback(
//     async (index = currentIndex) => {
//       if (!assessmentId) {
//         return;
//       }

//       try {
//         const response =
//           await fetch(
//             `${API_BASE}/api/coding/assessment/${assessmentId}/question/start?question_index=${index}`,
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type":
//                   "application/json",
//               },
//             }
//           );

//         if (!response.ok) {
//           const body =
//             await response.json().catch(
//               () => null
//             );

//           if (
//             body?.detail?.includes(
//               "already been completed"
//             )
//           ) {
//             window.location.href = "/coding-result";
//             return;
//           }

//           throw new Error(
//             body?.detail ||
//               "Could not start question."
//           );
//         }
//       } catch (err) {
//         setError(
//           err?.message ||
//             "Could not start coding question."
//         );
//       }
//     },
//     [assessmentId, currentIndex]
//   );

//   const handleRun = useCallback(
//     async () => {
//       if (
//         !assessmentId ||
//         !code.trim() ||
//         running ||
//         submitting ||
//         secondsRemaining <= 0
//       ) {
//         return;
//       }

//       try {
//         setRunning(true);
//         setError("");

//         setExecution(null);
//         setSubmitResult(null);
//         setJudgement(null);
//         setCanSubmit(false);

//         const response =
//           await fetch(
//             `${API_BASE}/api/coding/assessment/${assessmentId}/question/run`,
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type":
//                   "application/json",
//               },
//               body: JSON.stringify({
//                 code,
//                 question_index: currentIndex,
//                 language:
//                   assessment?.language ||
//                   "cpp",
//               }),
//             }
//           );

//         const data =
//           await response.json().catch(
//             () => null
//           );

//         if (!response.ok) {
//           throw new Error(
//             data?.detail ||
//               "Code execution failed."
//           );
//         }

//         const result =
//           extractExecution(data) ||
//           data;

//         setExecution(result);

//         const passed =
//           data?.can_submit === true ||
//           result?.passed === true ||
//           (
//             getVisibleTotal(result) > 0 &&
//             getVisiblePassed(result) ===
//               getVisibleTotal(result)
//           );

//         setCanSubmit(passed);

//         if (!passed) {
//           setError(
//             "Fix the failing visible tests and Run again before submitting."
//           );
//         }
//       } catch (err) {
//         setError(
//           err?.message ||
//             "Could not execute your code."
//         );
//       } finally {
//         setRunning(false);
//       }
//     },
//     [
//       assessmentId,
//       code,
//       running,
//       submitting,
//       secondsRemaining,
//       assessment?.language,
//     ]
//   );

//   const buildQuestionResult = useCallback(
//     (
//       submitData,
//       resultExecution,
//       resultJudgement,
//       resultInterviewer
//     ) => {
//       const finalExecution =
//         resultExecution ||
//         extractExecution(
//           submitData
//         ) ||
//         {};

//       const finalJudgement =
//         resultJudgement ||
//         extractJudgement(
//           submitData
//         ) ||
//         {};

//       const finalInterviewer =
//         resultInterviewer ||
//         extractInterviewer(
//           submitData
//         ) ||
//         {};

//       return {
//         question_number:
//           question?.question_number ??
//           currentIndex + 1,

//         problem_id:
//           question?.problem_id,

//         title:
//           question?.title ||
//           "Coding Question",

//         category:
//           question?.category,

//         difficulty:
//           question?.difficulty,

//         code,

//         accepted:
//           isAccepted(
//             finalJudgement,
//             finalExecution
//           ),

//         // Normalized fields used by CodingResult/History. Keep the
//         // original execution/judgement fields below untouched.
//         passed:
//           isAccepted(
//             finalJudgement,
//             finalExecution
//           ),

//         submitted: true,

//         score:
//           Number.isFinite(Number(finalJudgement?.score))
//             ? Number(finalJudgement.score)
//             : Number.isFinite(Number(finalJudgement?.rating))
//             ? Number(finalJudgement.rating)
//             : isAccepted(finalJudgement, finalExecution)
//             ? 10
//             : 0,

//         passed_tests:
//           getVisiblePassed(finalExecution) +
//           getHiddenPassed(finalExecution),

//         total_tests:
//           getVisibleTotal(finalExecution) +
//           getHiddenTotal(finalExecution),

//         visible_passed_tests:
//           getVisiblePassed(
//             finalExecution
//           ),

//         visible_total_tests:
//           getVisibleTotal(
//             finalExecution
//           ),

//         hidden_passed_tests:
//           getHiddenPassed(
//             finalExecution
//           ),

//         hidden_total_tests:
//           getHiddenTotal(
//             finalExecution
//           ),

//         hidden_failed_tests:
//           getHiddenFailed(
//             finalExecution
//           ),

//         execution_time_ms:
//           finalExecution?.execution_time_ms ??
//           finalExecution?.execution_time ??
//           null,

//         feedback:
//           finalJudgement?.reasoning ||
//           finalJudgement?.feedback ||
//           "",

//         approach:
//           finalJudgement?.approach_name ||
//           finalJudgement?.approach_level ||
//           "",

//         time_complexity:
//           finalJudgement?.time_complexity ||
//           "",

//         space_complexity:
//           finalJudgement?.space_complexity ||
//           "",

//         optimal:
//           finalJudgement?.optimal,

//         strengths:
//           finalJudgement?.strengths || [],

//         weaknesses:
//           finalJudgement?.weaknesses || [],

//         interviewer_question:
//           finalInterviewer?.question ||
//           finalJudgement?.recommended_follow_up ||
//           "",

//         interviewer_reason:
//           finalInterviewer?.reason ||
//           "",

//         submitted_at:
//           new Date().toISOString(),
//       };
//     },
//     [
//       question,
//       currentIndex,
//       code,
//     ]
//   );

//   const saveSessionResult = useCallback(
//     (results) => {
//       if (!assessmentId) {
//         return;
//       }

//       const existingHistory =
//         safeJsonParse(
//           localStorage.getItem(
//             HISTORY_KEY
//           ),
//           []
//         );

//       const safeHistory =
//         Array.isArray(existingHistory)
//           ? existingHistory
//           : [];

//       const resultObject = {
//         assessment_id:
//           assessmentId,

//         mode:
//           assessment?.mode ||
//           "personalized",

//         company:
//           assessment?.company ||
//           null,

//         role:
//           assessment?.role ||
//           null,

//         topics:
//           assessment?.topics ||
//           [],

//         question_count:
//           totalQuestions,

//         duration_minutes:
//           durationMinutes,

//         completed: true,

//         completed_at:
//           new Date().toISOString(),

//         interviewer_question_count:
//           interviewerHistory.length,

//         interviewer_history:
//           interviewerHistory,

//         results,
//       };

//       const withoutCurrent =
//         safeHistory.filter(
//           (item) =>
//             item?.assessment_id !==
//             assessmentId
//         );

//       withoutCurrent.push(
//         resultObject
//       );

//       localStorage.setItem(
//         HISTORY_KEY,
//         JSON.stringify(
//           withoutCurrent
//         )
//       );

//       localStorage.setItem(
//         getSessionResultKey(
//           assessmentId
//         ),
//         JSON.stringify(
//           resultObject
//         )
//       );

//       localStorage.setItem(
//         "coding_assessment_result",
//         JSON.stringify(
//           resultObject
//         )
//       );
//     },
//     [
//       assessmentId,
//       assessment?.mode,
//       assessment?.company,
//       assessment?.role,
//       assessment?.topics,
//       totalQuestions,
//       durationMinutes,
//       interviewerHistory,
//     ]
//   );

//   useEffect(() => {
//     if (!timeExpired || !assessmentId) {
//       return;
//     }

//     // Preserve whatever has already been completed so the feedback page
//     // remains useful even when the timer expires before the final question.
//     saveSessionResult(completedResults);
//   }, [
//     timeExpired,
//     assessmentId,
//     completedResults,
//     saveSessionResult,
//   ]);

//   const handleSubmit = useCallback(
//     async () => {
//       if (
//         !assessmentId ||
//         !code.trim() ||
//         submitting ||
//         running ||
//         !canSubmit ||
//         secondsRemaining <= 0
//       ) {
//         return;
//       }

//       if (
//         lastSubmittedCodeRef.current &&
//         lastSubmittedCodeRef.current !==
//           code
//       ) {
//         setError(
//           "Your code changed after the last Run. Run it again before submitting."
//         );
//         setCanSubmit(false);
//         return;
//       }

//       try {
//         setSubmitting(true);
//         setError("");

//         const response =
//           await fetch(
//             `${API_BASE}/api/coding/assessment/${assessmentId}/question/submit`,
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type":
//                   "application/json",
//               },
//               body: JSON.stringify({
//                 code,
//                 question_index: currentIndex,
//                 language:
//                   assessment?.language ||
//                   "cpp",
//               }),
//             }
//           );

//         const data =
//           await response.json().catch(
//             () => null
//           );

//         if (!response.ok) {
//           throw new Error(
//             data?.detail ||
//               "Submission failed."
//           );
//         }

//         const finalExecution =
//           extractExecution(data) ||
//           {};

//         const finalJudgement =
//           extractJudgement(data) ||
//           {};

//         const finalInterviewer =
//           extractInterviewer(data) ||
//           {};

//         setSubmitResult(data);
//         setExecution(finalExecution);
//         setJudgement(finalJudgement);

//         lastSubmittedCodeRef.current =
//           code;

//         setCanSubmit(false);

//         const questionResult =
//           buildQuestionResult(
//             data,
//             finalExecution,
//             finalJudgement,
//             finalInterviewer
//           );

//         const updatedResults = [
//           ...completedResults,
//           questionResult,
//         ];

//         const uniqueResults =
//           updatedResults.filter(
//             (item, index, array) =>
//               array.findIndex(
//                 (candidate) =>
//                   candidate?.question_number ===
//                   item?.question_number
//               ) === index
//           );

//         setCompletedResults(
//           uniqueResults
//         );

//         localStorage.setItem(
//           getSessionResultKey(
//             assessmentId
//           ),
//           JSON.stringify({
//             ...safeJsonParse(
//               localStorage.getItem(
//                 getSessionResultKey(
//                   assessmentId
//                 )
//               ),
//               {}
//             ),
//             assessment_id:
//               assessmentId,
//             mode:
//               assessment?.mode ||
//               "personalized",
//             results:
//               uniqueResults,
//           })
//         );

//         const followUpQuestion =
//           finalInterviewer?.question ||
//           finalJudgement?.recommended_follow_up ||
//           (isAccepted(
//             finalJudgement,
//             finalExecution
//           )
//             ? "Walk me through your approach and explain its time and space complexity."
//             : "");

//         setInterviewerQuestion(
//           followUpQuestion
//         );

//         setInterviewerReason(
//           finalInterviewer?.reason ||
//             (followUpQuestion
//               ? "Let's discuss your solution and the reasoning behind it."
//               : "Let's discuss your solution.")
//         );

//         if (
//           followUpQuestion &&
//           interviewerQuestionCountRef.current < MAX_INTERVIEWER_QUESTIONS
//         ) {
//           interviewerQuestionCountRef.current += 1;
//           setShowInterviewerPrompt(true);
//           setInterviewerOpen(false);
//           setInterviewerState("idle");
//         }
//       } catch (err) {
//         setError(
//           err?.message ||
//             "Could not submit solution."
//         );
//       } finally {
//         setSubmitting(false);
//       }
//     },
//     [
//       assessmentId,
//       code,
//       submitting,
//       running,
//       canSubmit,
//       secondsRemaining,
//       assessment?.language,
//       assessment?.mode,
//       completedResults,
//       buildQuestionResult,
//     ]
//   );

//   const openInterviewer =
//     useCallback(() => {
//       if (!interviewerQuestion) {
//         return;
//       }

//       setShowInterviewerPrompt(false);
//       setInterviewerOpen(true);
//       interviewerDiscussionActiveRef.current = true;
//       if (interviewerQuestionCountRef.current === 0) {
//         interviewerQuestionCountRef.current = 1;
//       }
//       setInterviewerTranscript("");
//       setInterviewerResponse("");
//       setInterviewerState("speaking");

//       speakText(
//         interviewerQuestion,
//         () => {
//           if (
//             mountedRef.current
//           ) {
//             setInterviewerState(
//               "idle"
//             );
//           }
//         }
//       );
//     }, [interviewerQuestion]);

//   const startListening =
//     useCallback(() => {
//       const Recognition =
//         getSpeechRecognitionConstructor();

//       if (!Recognition) {
//         setError(
//           "Voice input is not supported by this browser."
//         );
//         return;
//       }

//       if (recognitionRef.current) {
//         try {
//           recognitionRef.current.stop();
//         } catch {
//           // Ignore.
//         }
//       }

//       const recognition =
//         new Recognition();

//       recognition.lang = "en-US";
//       recognition.interimResults = true;
//       recognition.continuous = false;

//       recognition.onstart = () => {
//         setInterviewerState(
//           "listening"
//         );
//       };

//       recognition.onresult = (
//         event
//       ) => {
//         let transcript = "";

//         for (
//           let i = event.resultIndex;
//           i < event.results.length;
//           i++
//         ) {
//           transcript +=
//             event.results[i][0]
//               .transcript;
//         }

//         setInterviewerTranscript(
//           transcript
//         );
//       };

//       recognition.onerror = (
//         event
//       ) => {
//         setInterviewerState(
//           "idle"
//         );

//         if (
//           event?.error ===
//           "not-allowed"
//         ) {
//           setError(
//             "Microphone permission was denied."
//           );
//         }
//       };

//       recognition.onend = () => {
//         setInterviewerState(
//           "idle"
//         );

//         setInterviewerTranscript(
//           (previous) =>
//             previous.trim()
//         );
//       };

//       recognitionRef.current =
//         recognition;

//       recognition.start();
//     }, []);

//   const submitInterviewAnswer =
//     useCallback(async () => {
//       const answer =
//         interviewerTranscript.trim();

//       if (!answer) {
//         return;
//       }

//       setInterviewerState(
//         "processing"
//       );

//       setInterviewerHistory((previous) => [
//         ...previous,
//         {
//           question: interviewerQuestion,
//           answer,
//           question_index: currentIndex,
//           asked_at: new Date().toISOString(),
//         },
//       ]);

//       try {
//         const response =
//           await fetch(
//             `${API_BASE}/api/coding/assessment/${assessmentId}/question/interview-answer`,
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type":
//                   "application/json",
//               },
//               body: JSON.stringify({
//                 answer,
//                 question:
//                   interviewerQuestion,
//                 code,
//                 question_index: currentIndex,
//                 language:
//                   assessment?.language ||
//                   "cpp",
//               }),
//             }
//           );

//         const data =
//           await response.json().catch(
//             () => null
//           );

//         if (!response.ok) {
//           throw new Error(
//             data?.detail ||
//               "Could not process interview answer."
//           );
//         }

//         const nextQuestion =
//           data?.question ||
//           data?.interviewer?.question ||
//           data?.next_question ||
//           "";

//         const responseText =
//           data?.response ||
//           data?.message ||
//           data?.feedback ||
//           "";

//         setInterviewerResponse(
//           responseText
//         );

//         if (
//           nextQuestion &&
//           interviewerQuestionCountRef.current <
//             MAX_INTERVIEWER_QUESTIONS
//         ) {
//           interviewerQuestionCountRef.current += 1;

//           setInterviewerQuestion(
//             nextQuestion
//           );

//           setInterviewerTranscript(
//             ""
//           );

//           if (interviewerDiscussionActiveRef.current) {
//             // The candidate is already inside an active interviewer discussion,
//             // so keep the panel open and continue naturally with the next question.
//             setInterviewerState("speaking");
//             setInterviewerOpen(true);
//             setShowInterviewerPrompt(false);

//             speakText(
//               nextQuestion,
//               () => {
//                 if (mountedRef.current) {
//                   setInterviewerState("idle");
//                 }
//               }
//             );
//           } else {
//             // If the AI wants to start a discussion later, ask permission first.
//             setInterviewerState("idle");
//             setInterviewerOpen(false);
//             setShowInterviewerPrompt(true);
//           }
//         } else {
//           // Questioning is finished (including the maximum follow-up limit).
//           // Close both the popup and the voice panel automatically.
//           const finishInterviewer = () => {
//             if (!mountedRef.current) return;
//             interviewerDiscussionActiveRef.current = false;
//             setInterviewerState("idle");
//             setInterviewerOpen(false);
//             setShowInterviewerPrompt(false);
//             setInterviewerQuestion("");
//             setInterviewerTranscript("");
//           };

//           if (responseText) {
//             speakText(responseText, finishInterviewer);
//           } else {
//             finishInterviewer();
//           }
//         }
//       } catch (err) {
//         setInterviewerState(
//           "idle"
//         );

//         setError(
//           err?.message ||
//             "Could not process your interview answer."
//         );
//       }
//     }, [
//       assessmentId,
//       interviewerTranscript,
//       interviewerQuestion,
//       code,
//       currentIndex,
//       assessment?.language,
//     ]);

//   const askInterviewer = useCallback(async () => {
//     const asked = candidateQuestion.trim();

//     if (!assessmentId || !asked) {
//       return;
//     }

//     try {
//       setError("");
//       setInterviewerResponse("");
//       setInterviewerState("thinking");

//       const response = await fetch(
//         `${API_BASE}/api/coding/assessment/${assessmentId}/question/interview-answer`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             answer: asked,
//             question: interviewerQuestion || "Candidate clarification",
//             code,
//             question_index: currentIndex,
//             action: "clarification",
//           }),
//         }
//       );

//       const data = await response.json().catch(() => null);

//       if (!response.ok) {
//         throw new Error(
//           data?.detail || "Could not contact the interviewer."
//         );
//       }

//       const reply =
//         data?.response ||
//         "I can clarify the assumptions without giving away the solution.";

//       const clarificationQuestion =
//         data?.question ||
//         data?.interviewer?.question ||
//         "";

//       setCandidateQuestion("");
//       setInterviewerResponse(reply);

//       if (
//         clarificationQuestion &&
//         interviewerQuestionCountRef.current <
//           MAX_INTERVIEWER_QUESTIONS
//       ) {
//         interviewerQuestionCountRef.current += 1;
//         setInterviewerQuestion(clarificationQuestion);
//         setInterviewerOpen(false);
//         setShowInterviewerPrompt(true);
//         setInterviewerState("idle");
//       } else {
//         setInterviewerState("speaking");
//         speakText(reply, () => {
//           if (mountedRef.current) {
//             setInterviewerState("idle");
//           }
//         });
//       }
//     } catch (err) {
//       setInterviewerState("idle");
//       setError(
//         err?.message ||
//           "Could not contact the interviewer."
//       );
//     }
//   }, [
//     assessmentId,
//     candidateQuestion,
//     interviewerQuestion,
//     code,
//     currentIndex,
//   ]);

//   const closeInterviewer =
//     useCallback(() => {
//       clearInterviewer();
//       interviewerDiscussionActiveRef.current = false;

//       setInterviewerOpen(false);
//       setShowInterviewerPrompt(false);
//     }, [clearInterviewer]);

//   const completeAndGoNext =
//     useCallback(async () => {
//       if (
//         !assessmentId ||
//         !submitResult
//       ) {
//         return;
//       }

//       try {
//         setError("");

//         const result =
//           buildQuestionResult(
//             submitResult,
//             execution,
//             judgement,
//             extractInterviewer(
//               submitResult
//             )
//           );

//         const mergedResults =
//           completedResults.some(
//             (item) =>
//               item?.question_number ===
//               result?.question_number
//           )
//             ? completedResults
//             : [
//                 ...completedResults,
//                 result,
//               ];

//         const response =
//           await fetch(
//             `${API_BASE}/api/coding/assessment/${assessmentId}/question/complete`,
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type":
//                   "application/json",
//               },
//               body: JSON.stringify({
//                 result,
//               }),
//             }
//           );

//         const data =
//           await response.json().catch(
//             () => null
//           );

//         if (!response.ok) {
//           throw new Error(
//             data?.detail ||
//               "Could not complete question."
//           );
//         }

//         if (
//           data?.completed === true
//         ) {
//           saveSessionResult(
//             mergedResults
//           );

//           setAssessmentFinished(
//             true
//           );

//           // Keep the candidate on the assessment page and show the
//           // completion actions. The feedback button performs the
//           // navigation after the candidate chooses it.
//           return;
//         }

//         setCompletedResults(
//           mergedResults
//         );

//         const nextIndex =
//           currentIndex + 1;

//         setCurrentIndex(
//           nextIndex
//         );

//         setQuestion(null);
//         setExecution(null);
//         setJudgement(null);
//         setSubmitResult(null);
//         setCanSubmit(false);
//         setInterviewerQuestion("");
//         setInterviewerTranscript("");
//         setInterviewerResponse("");

//         clearInterviewer();

//         await startQuestion();

//         await loadQuestion(
//           nextIndex
//         );
//       } catch (err) {
//         setError(
//           err?.message ||
//             "Could not move to the next question."
//         );
//       }
//     }, [
//       assessmentId,
//       submitResult,
//       buildQuestionResult,
//       execution,
//       judgement,
//       completedResults,
//       saveSessionResult,
//       currentIndex,
//       clearInterviewer,
//       startQuestion,
//       loadQuestion,
//     ]);

//   const jumpToQuestion =
//     useCallback(
//       async (index) => {
//         if (index < 0 || index >= totalQuestions) {
//           return;
//         }

//         if (index === currentIndex) {
//           return;
//         }

//         setJumpMessage("");
//         setCurrentIndex(index);
//         setQuestion(null);
//         setExecution(null);
//         setJudgement(null);
//         setSubmitResult(null);
//         setCanSubmit(false);
//         setInterviewerQuestion("");
//         setInterviewerTranscript("");
//         setInterviewerResponse("");
//         clearInterviewer();

//         // IMPORTANT: a question switch must update the backend coding
//         // session before loading tests. Otherwise Q2 can display Q1's
//         // test bank (the exact bug seen in the assessment UI).
//         await startQuestion(index);
//         await loadQuestion(index);
//       },
//       [
//         currentIndex,
//         totalQuestions,
//         clearInterviewer,
//         startQuestion,
//         loadQuestion,
//       ]
//     );

//   const goDashboard =
//     useCallback(() => {
//       window.location.href = "/";
//     }, []);

//   const goFeedback =
//     useCallback(() => {
//       window.location.href = "/coding-result";
//     }, []);

//   const handleExitAssessment = useCallback(() => {
//     if (assessmentId) {
//       saveSessionResult(completedResults);
//     }
//     window.location.href = "/coding-result";
//   }, [assessmentId, completedResults, saveSessionResult]);

//   const handleReturnDashboard = useCallback(() => {
//     if (assessmentId) {
//       saveSessionResult(completedResults);
//     }
//     window.location.href = "/";
//   }, [assessmentId, completedResults, saveSessionResult]);

//   if (loading && !question) {
//     return (
//       <div className="coding-page">
//         <div className="coding-loading">
//           <div className="coding-spinner" />
//           <p>
//             Preparing your coding assessment...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (
//     assessmentFinished
//   ) {
//     return (
//       <div className="coding-page">
//         <div className="coding-complete">
//           <div className="complete-icon">
//             ✓
//           </div>

//           <h1>
//             {timeExpired
//               ? "Time's Up"
//               : "Assessment Complete"}
//           </h1>

//           <p>
//             {timeExpired
//               ? "Your assessment time has ended. Your completed work has been saved and is available in AI feedback."
//               : "Your coding assessment has been completed successfully."}
//           </p>

//           <div className="complete-actions">
//             <button
//               className="primary-button"
//               onClick={
//                 handleExitAssessment
//               }
//             >
//               View AI Feedback
//             </button>

//             <button
//               className="secondary-button"
//               onClick={
//                 handleReturnDashboard
//               }
//             >
//               Return to Dashboard
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="coding-page">
//       <header className="coding-topbar">
//         <div className="coding-brand">
//           <span>AI Coding Assessment</span>
//           <div className="top-interviewer">
//             <span className="top-interviewer-dot" />
//             <span className="top-interviewer-name">AI Interviewer</span>
//             <span className="top-interviewer-status">
//               {liveObservation ? "Observing" : "Available"}
//             </span>
//           </div>
//         </div>

//         <div className="coding-topbar-right">
//           <span>
//             {assessment?.mode ===
//             "company_oa"
//               ? "Company OA"
//               : assessment?.mode ===
//                 "contest"
//               ? "Contest"
//               : "Personalized"}
//           </span>

//           <button
//             type="button"
//             className="topbar-action-button"
//             onClick={handleExitAssessment}
//             title="Open AI feedback and assessment results"
//           >
//             AI Feedback
//           </button>

//           <button
//             type="button"
//             className="topbar-action-button secondary"
//             onClick={handleReturnDashboard}
//             title="Leave the assessment and return to dashboard"
//           >
//             Dashboard
//           </button>
//         </div>
//       </header>

//       <div className="coding-workspace">
//         <aside className="question-sidebar">
//           <div className="sidebar-title">
//             Questions
//           </div>

//           <div className="question-list">
//             {Array.from({
//               length: totalQuestions,
//             }).map(
//               (_, index) => {
//                 const result =
//                   completedResults.find(
//                     (item) =>
//                       Number(
//                         item?.question_number
//                       ) ===
//                       index + 1
//                   );

//                 const isCurrent =
//                   index ===
//                   currentIndex;

//                 const isCompleted =
//                   Boolean(result);

//                 return (
//                   <button
//                     type="button"
//                     key={index}
//                     className={[
//                       "question-pill",
//                       isCurrent
//                         ? "active"
//                         : "",
//                       isCompleted
//                         ? "completed"
//                         : "",
//                     ]
//                       .filter(Boolean)
//                       .join(" ")}
//                     onClick={() =>
//                       jumpToQuestion(index)
//                     }
//                     aria-current={
//                       isCurrent ? "step" : undefined
//                     }
//                   >
//                     <span className="question-pill-number">
//                       {isCompleted
//                         ? "✓"
//                         : index + 1}
//                     </span>

//                     <span>
//                       Question{" "}
//                       {index + 1}
//                     </span>
//                   </button>
//                 );
//               }
//             )}
//           </div>

//           <div className="sidebar-bottom">
//             <button
//               className="dashboard-link"
//               onClick={
//                 goDashboard
//               }
//             >
//               ← Dashboard
//             </button>
//           </div>
//         </aside>

//         <main className="coding-main">
//           {error && (
//             <div className="coding-alert">
//               <span>{error}</span>

//               <button
//                 onClick={() =>
//                   setError("")
//                 }
//               >
//                 ×
//               </button>
//             </div>
//           )}

//           {jumpMessage && (
//             <div className="jump-message">
//               {jumpMessage}
//             </div>
//           )}

//           <section className="problem-panel">
//             <div className="problem-header">
//               <div>
//                 <div className="problem-meta">
//                   <span>
//                     {question?.difficulty ||
//                       "Medium"}
//                   </span>

//                   <span>·</span>

//                   <span>
//                     {question?.category ||
//                       "Algorithms"}
//                   </span>
//                 </div>

//                 <h1>
//                   {question?.title ||
//                     "Coding Problem"}
//                 </h1>
//               </div>

//             </div>

//             <div className="problem-statement">
//               {question?.statement ||
//                 question?.description ||
//                 "Solve the problem using an efficient algorithm."}
//             </div>

//             <div className="problem-section">
//               <button
//                 className="section-toggle"
//                 onClick={() =>
//                   setShowExamples(
//                     (value) =>
//                       !value
//                   )
//                 }
//               >
//                 <span>
//                   Examples
//                 </span>

//                 <span>
//                   {showExamples
//                     ? "⌃"
//                     : "⌄"}
//                 </span>
//               </button>

//               {showExamples &&
//                 examples.slice(0, 3).map(
//                   (
//                     example,
//                     index
//                   ) => (
//                     <div
//                       className="example-card"
//                       key={index}
//                     >
//                       <div className="example-title">
//                         Example{" "}
//                         {index + 1}
//                       </div>

//                       {example.input !==
//                         undefined && (
//                         <div className="example-row">
//                           <div className="example-label">
//                             Input
//                           </div>

//                           <pre>
//                             {formatExampleInput(
//                               example.input
//                             )}
//                           </pre>
//                         </div>
//                       )}

//                       {example.output !==
//                         undefined && (
//                         <div className="example-row">
//                           <div className="example-label">
//                             Output
//                           </div>

//                           <pre>
//                             {formatExampleOutput(
//                               example.output
//                             )}
//                           </pre>
//                         </div>
//                       )}

//                       {example.expected_output !==
//                         undefined && (
//                         <div className="example-row">
//                           <div className="example-label">
//                             Output
//                           </div>

//                           <pre>
//                             {formatExampleOutput(
//                               example.expected_output
//                             )}
//                           </pre>
//                         </div>
//                       )}

//                       {example.explanation && (
//                         <div className="example-explanation">
//                           {example.explanation}
//                         </div>
//                       )}
//                     </div>
//                   )
//                 )}

//               {showExamples && examples.length > 3 && (
//                 <div className="examples-more-note">
//                   Showing the first 3 examples. Review the problem statement for the remaining examples.
//                 </div>
//               )}
//             </div>

//             {constraints.length >
//               0 && (
//               <div className="problem-section">
//                 <button
//                   className="section-toggle"
//                   onClick={() =>
//                     setShowConstraints(
//                       (value) =>
//                         !value
//                     )
//                   }
//                 >
//                   <span>
//                     Constraints
//                   </span>

//                   <span>
//                     {showConstraints
//                       ? "⌃"
//                       : "⌄"}
//                   </span>
//                 </button>

//                 {showConstraints && (
//                   <ul className="constraints-list">
//                     {constraints.map(
//                       (
//                         constraint,
//                         index
//                       ) => (
//                         <li
//                           key={
//                             index
//                           }
//                         >
//                           {formatConstraint(constraint)}
//                         </li>
//                       )
//                     )}
//                   </ul>
//                 )}
//               </div>
//             )}
//           </section>

//           <section className="editor-panel">
//             <div className="editor-header">
//               <div className="editor-language">
//                 <span className="language-dot" />
//                 C++
//               </div>

//               <div className="editor-actions">
//                 <button
//                   type="button"
//                   className="run-button"
//                   disabled={
//                     running ||
//                     submitting ||
//                     secondsRemaining <= 0 ||
//                     isCurrentCompleted
//                   }
//                   onClick={
//                     handleRun
//                   }
//                 >
//                   {running
//                     ? "Running..."
//                     : "▶ Run"}
//                 </button>

//                 <button
//                   type="button"
//                   className={
//                     canSubmit
//                       ? "submit-button"
//                       : "submit-button disabled"
//                   }
//                   disabled={
//                     !canSubmit ||
//                     running ||
//                     submitting ||
//                     isCurrentCompleted
//                   }
//                   title={
//                     !canSubmit
//                       ? "Run your code successfully first"
//                       : ""
//                   }
//                   onClick={
//                     handleSubmit
//                   }
//                 >
//                   {submitting
//                     ? "Submitting..."
//                     : "Submit"}
//                 </button>
//               </div>
//             </div>

//             <textarea
//               className="code-editor"
//               spellCheck="false"
//               value={code}
//               onChange={(event) =>
//                 saveCode(
//                   event.target
//                     .value
//                 )
//               }
//               disabled={
//                 secondsRemaining <= 0 ||
//                 assessmentFinished ||
//                 (isCurrentCompleted &&
//                   !submitResult)
//               }
//             />
//           </section>

//           <section className="test-panel">
//             <div className="test-panel-header">
//               <div className="test-panel-heading">
//                 <strong>Test Cases</strong>

//                 {execution && (
//                   <span className="test-summary">
//                     {visiblePassed} / {visibleTotal} cases passed
//                   </span>
//                 )}
//               </div>

//               <div className="test-panel-statuses">
//                 {execution && executionStatus === "accepted" && (
//                   <span className="test-status-badge accepted">✓ Accepted</span>
//                 )}

//                 {execution && executionStatus === "wrong_answer" && (
//                   <span className="test-status-badge failed">Wrong Answer</span>
//                 )}

//                 {execution && executionStatus === "tle" && (
//                   <span className="test-status-badge tle">TLE</span>
//                 )}

//                 {execution && executionStatus === "compile_error" && (
//                   <span className="test-status-badge failed">Compile Error</span>
//                 )}

//                 {execution && executionStatus === "runtime_error" && (
//                   <span className="test-status-badge failed">Runtime Error</span>
//                 )}

//                 {submitResult && (
//                   <span className="hidden-summary">
//                     Hidden {hiddenPassed} / {hiddenTotal} · Failed {hiddenFailed}
//                   </span>
//                 )}
//               </div>
//             </div>

//             <div className="test-result-body">
//               {execution && (
//                 <div className="execution-overview">
//                   <div className="execution-overview-main">
//                     <strong>
//                       {visiblePassed} / {visibleTotal} cases passed
//                     </strong>

//                     {execution.execution_time_ms != null && (
//                       <span>
//                         {Number(execution.execution_time_ms).toFixed(0)} ms
//                       </span>
//                     )}
//                   </div>

//                   {submitResult && (
//                     <div className="execution-hidden-summary">
//                       <span>Hidden {hiddenPassed} / {hiddenTotal}</span>
//                       <span>Hidden failed {hiddenFailed}</span>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {execution?.error && (
//                 <div className="execution-error-card">
//                   <div className="execution-error-title">
//                     {executionStatus === "tle"
//                       ? "Time Limit Exceeded"
//                       : executionStatus === "compile_error"
//                       ? "Compilation Error"
//                       : executionStatus === "runtime_error"
//                       ? "Runtime Error"
//                       : "Execution Error"}
//                   </div>
//                   <pre className="execution-error">
//                     {execution.error}
//                   </pre>
//                 </div>
//               )}

//               {(execution?.tests?.length
//                 ? execution.tests
//                 : visibleTestCases
//               ).map((test, index) => {
//                 const hasExecution = Boolean(execution?.tests?.length);
//                 const passed = hasExecution ? test.passed === true : null;
//                 const input = test.input ?? test.input_data ?? "";
//                 const expected =
//                   test.expected_output ?? test.expected ?? "";
//                 const actual =
//                   test.actual_output ?? test.stdout ?? "";

//                 return (
//                   <article
//                     className={`test-case-card ${
//                       passed === true
//                         ? "pass"
//                         : passed === false
//                         ? "fail"
//                         : "pending"
//                     }`}
//                     key={`${test.test_number ?? index + 1}-${index}`}
//                   >
//                     <div className="test-case-card-header">
//                       <strong>Test Case {test.test_number ?? index + 1}</strong>

//                       <span
//                         className={`test-case-status-pill ${
//                           passed === true
//                             ? "pass"
//                             : passed === false
//                             ? "fail"
//                             : "pending"
//                         }`}
//                       >
//                         {passed === true
//                           ? "✓ Passed"
//                           : passed === false
//                           ? "✕ Failed"
//                           : "Not Run"}
//                       </span>
//                     </div>

//                     <div className="test-case-values">
//                       <div>
//                         <span>Input</span>
//                         <pre>{formatExampleInput(input)}</pre>
//                       </div>

//                       <div>
//                         <span>Expected Output</span>
//                         <pre>{formatExampleOutput(expected)}</pre>
//                       </div>

//                       {hasExecution && (
//                         <div>
//                           <span>Your Output</span>
//                           <pre>
//                             {formatExampleOutput(actual) || "(no output)"}
//                           </pre>
//                         </div>
//                       )}
//                     </div>

//                     {test.error && (
//                       <div className="test-case-error">
//                         {test.error}
//                       </div>
//                     )}

//                     {test.explanation && (
//                       <div className="test-case-explanation">
//                         {test.explanation}
//                       </div>
//                     )}
//                   </article>
//                 );
//               })}

//               {!visibleTestCases.length && !execution?.tests?.length && (
//                 <div className="empty-tests">
//                   You must run your code first.
//                 </div>
//               )}
//             </div>
//           </section>

//           {submitResult && (
//             <section className="submission-summary">
//               <div className="submission-summary-title">
//                 {accepted
//                   ? "Solution Accepted"
//                   : "Submission Evaluated"}
//               </div>

//               <div className="submission-grid">
//                 <div>
//                   <span>
//                     Approach
//                   </span>

//                   <strong>
//                     {judgement?.approach_name ||
//                       judgement?.approach_level ||
//                       "Evaluated"}
//                   </strong>
//                 </div>

//                 <div>
//                   <span>
//                     Time Complexity
//                   </span>

//                   <strong>
//                     {judgement?.time_complexity ||
//                       "—"}
//                   </strong>
//                 </div>

//                 <div>
//                   <span>
//                     Space Complexity
//                   </span>

//                   <strong>
//                     {judgement?.space_complexity ||
//                       "—"}
//                   </strong>
//                 </div>
//               </div>

//               {submitResult && hiddenFailed > 0 && (
//                 <div className="failed-tests-summary hidden-failed-details">
//                   <strong>Hidden Test Cases — {hiddenFailed} failed</strong>
//                   <div className="hidden-failed-case-row">
//                     <span className="hidden-case-status">✕ Failed</span>
//                     <span>Expected Output: hidden test expected value</span>
//                     <span>Your Output: did not match expected output</span>
//                   </div>
//                   <small>Hidden inputs and exact expected values stay private to protect the assessment.</small>
//                 </div>
//               )}

//               {execution?.tests?.some((test) => test?.passed === false) && (
//                 <div className="failed-tests-summary visible-failed">
//                   <strong>Failed visible test cases</strong>
//                   <span>Open the test cases above to review the input, expected output, and your output.</span>
//                 </div>
//               )}
//             </section>
//           )}

//           <section className="candidate-ask-section">
//             <div className="candidate-ask-interviewer">
//               <div className="candidate-ask-heading">
//                 <div>
//                   <strong>Ask the Interviewer</strong>
//                   <span>
//                     Ask a clarification or talk through an assumption without advancing the coding question.
//                   </span>
//                 </div>
//               </div>

//               <div className="candidate-ask-row">
//                 <input
//                   type="text"
//                   value={candidateQuestion}
//                   onChange={(event) =>
//                     setCandidateQuestion(event.target.value)
//                   }
//                   onKeyDown={(event) => {
//                     if (event.key === "Enter") {
//                       askInterviewer();
//                     }
//                   }}
//                   placeholder="e.g. Can we assume all numbers are positive?"
//                   disabled={submitting || assessmentFinished}
//                 />

//                 <button
//                   type="button"
//                   className="ask-button"
//                   onClick={askInterviewer}
//                   disabled={!candidateQuestion.trim() || submitting}
//                 >
//                   Ask Interview
//                 </button>

//                 {voiceSupported && (
//                   <button
//                     type="button"
//                     className="ask-voice-button"
//                     onClick={() => {
//                       setInterviewerQuestion(
//                         "Sure. What would you like to ask me about this problem?"
//                       );
//                       setInterviewerReason(
//                         "Candidate-initiated question."
//                       );
//                       setInterviewerOpen(true);
//                       setInterviewerTranscript("");
//                       setInterviewerResponse("");
//                       // Do not start the microphone automatically.
//                       // The candidate must explicitly click Start Recording.
//                       setInterviewerState("idle");
//                     }}
//                     disabled={submitting || assessmentFinished}
//                     title="Ask the interviewer by voice"
//                   >
//                     🎙 Speak to Interviewer
//                   </button>
//                 )}
//               </div>
//             </div>
//           </section>

//           {showInterviewerPrompt &&
//             interviewerQuestion && (
//               <div className="interviewer-popup">
//                 <div className="popup-icon">
//                   🎙
//                 </div>

//                 <div className="popup-content">
//                   <div className="popup-title">
//                     AI Interviewer
//                   </div>

//                   <div className="popup-text">
//                     {interviewerReason ||
//                       "I have a question about your approach. Would you like to discuss it?"}
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   className="ask-button"
//                   onClick={
//                     openInterviewer
//                   }
//                 >
//                   Ask Me
//                 </button>
//               </div>
//             )}

//           {interviewerOpen && (
//             <div className="voice-interview-panel">
//               <div className="voice-panel-header">
//                 <div>
//                   <strong>
//                     AI Interviewer
//                   </strong>

//                   <span>
//                     Follow-up discussion
//                   </span>
//                 </div>

//                 <button
//                   className="voice-close"
//                   onClick={
//                     closeInterviewer
//                   }
//                 >
//                   ×
//                 </button>
//               </div>

//               <div className="voice-question">
//                 <div className="voice-label">
//                   AI
//                 </div>

//                 <p>
//                   {interviewerQuestion}
//                 </p>

//                 {interviewerState ===
//                   "speaking" && (
//                   <div className="voice-state">
//                     🔊 Speaking...
//                   </div>
//                 )}
//               </div>

//               <div className="voice-answer">
//                 <div className="voice-label">You</div>

//                 <textarea
//                   className="interviewer-text-answer"
//                   value={interviewerTranscript}
//                   onChange={(event) =>
//                     setInterviewerTranscript(event.target.value)
//                   }
//                   onKeyDown={(event) => {
//                     // Enter is for normal text entry; microphone recording
//                     // starts only when the candidate explicitly clicks
//                     // Start Recording.
//                     if (
//                       event.key === "Enter" &&
//                       !event.shiftKey &&
//                       !event.ctrlKey &&
//                       !event.metaKey
//                     ) {
//                       event.preventDefault();
//                       if (
//                         interviewerTranscript.trim() &&
//                         interviewerState !== "processing" &&
//                         interviewerState !== "speaking"
//                       ) {
//                         submitInterviewAnswer();
//                       }
//                     }
//                   }}
//                   placeholder="Type your answer, or click Start Recording to speak..."
//                   disabled={interviewerState === "processing"}
//                 />

//                 {interviewerState === "listening" && (
//                   <div className="listening-indicator">
//                     <span className="pulse" />
//                     🎙 Listening...
//                   </div>
//                 )}
//               </div>

//               {interviewerResponse && (
//                 <div className="voice-feedback">
//                   {interviewerResponse}
//                 </div>
//               )}

//               <div className="voice-actions">
//                 {voiceSupported ? (
//                   <button
//                     type="button"
//                     className="record-button"
//                     onClick={
//                       interviewerState === "listening"
//                         ? () => {
//                             try { recognitionRef.current?.stop(); } catch {}
//                           }
//                         : startListening
//                     }
//                     disabled={interviewerState === "speaking" || interviewerState === "processing"}
//                   >
//                     🎙 {interviewerState === "listening" ? "End Recording" : "Start Recording"}
//                   </button>
//                 ) : (
//                   <span className="voice-warning">Voice input is not supported in this browser.</span>
//                 )}

//                 <button
//                   type="button"
//                   className="answer-button"
//                   onClick={submitInterviewAnswer}
//                   disabled={!interviewerTranscript.trim() || interviewerState === "processing" || interviewerState === "speaking"}
//                 >
//                   Send Answer →
//                 </button>
//               </div>

//             </div>
//           )}

//           {submitResult && !isCurrentCompleted && (
//             <div className="question-navigation-footer">
//               <div>
//                 <strong>
//                   Question{" "}
//                   {currentIndex + 1}{" "}
//                   completed
//                 </strong>

//                 <span>
//                   {accepted
//                     ? "Solution accepted."
//                     : "Submission evaluated."}
//                 </span>
//               </div>

//               {currentIndex <
//               totalQuestions - 1 ? (
//                 <button
//                   className="next-button"
//                   onClick={
//                     completeAndGoNext
//                   }
//                 >
//                   Next Question →
//                 </button>
//               ) : (
//                 <button
//                   className="next-button"
//                   onClick={
//                     completeAndGoNext
//                   }
//                 >
//                   Finish Assessment ✓
//                 </button>
//               )}
//             </div>
//           )}

//           {isCurrentCompleted && (
//             <div className="review-banner">
//               This question has already been completed.
//               You are viewing it in review mode.
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }






import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./CodingAssessment.css";

const API_BASE = "http://127.0.0.1:8000";

const ASSESSMENT_ID_KEY = "coding_assessment_id";
const ASSESSMENT_KEY = "coding_assessment";
const HISTORY_KEY = "coding_assessment_history";

function safeJsonParse(value, fallback = null) {
  if (typeof value !== "string") {
    return value ?? fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = safeJsonParse(value, null);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeExamples(value) {
  if (!value) {
    return [];
  }

  let examples = value;

  if (typeof examples === "string") {
    examples = safeJsonParse(examples, null);

    if (!examples) {
      return [];
    }
  }

  if (!Array.isArray(examples)) {
    examples = [examples];
  }

  return examples
    .map((example) => {
      if (typeof example === "string") {
        const parsed = safeJsonParse(example, null);

        if (parsed && typeof parsed === "object") {
          return parsed;
        }

        return {
          input: example,
        };
      }

      if (example && typeof example === "object") {
        if (
          typeof example.text === "string" &&
          !example.input &&
          !example.output
        ) {
          const nested = safeJsonParse(example.text, null);

          if (Array.isArray(nested)) {
            return nested[0] || example;
          }

          if (nested && typeof nested === "object") {
            return nested;
          }

          return {
            explanation: example.text,
          };
        }

        return example;
      }

      return null;
    })
    .filter(Boolean);
}

function formatExampleInput(value) {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

function formatConstraint(value) {
  if (value === undefined || value === null) return "";

  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.map(formatConstraint).filter(Boolean).join(" ");
    }
    if (typeof value.text === "string") return formatConstraint(value.text);
    if (typeof value.constraint === "string") return formatConstraint(value.constraint);
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${formatConstraint(item)}`)
      .join(" • ");
  }

  let text = String(value).trim();
  if (!text) return "";

  const parsed = safeJsonParse(text, null);
  if (parsed !== null && parsed !== value) {
    return formatConstraint(parsed);
  }

  // Clean common AI/JSON presentation artefacts without changing the
  // constraint's meaning.
  text = text
    .replace(/\\n/g, "\n")
    .replace(/\r/g, "")
    .replace(/^[\s•*-]+/, "")
    .trim();

  return text;
}

function formatExampleOutput(value) {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

function getAssessmentId() {
  return (
    localStorage.getItem(ASSESSMENT_ID_KEY) ||
    safeJsonParse(localStorage.getItem(ASSESSMENT_KEY), {})?.assessment_id ||
    null
  );
}

function getStoredAssessment() {
  return safeJsonParse(
    localStorage.getItem(ASSESSMENT_KEY),
    {}
  );
}

function getAssessmentStartKey(assessmentId) {
  return `coding_assessment_start_${assessmentId}`;
}

function getCodeKey(assessmentId, questionIndex) {
  return `coding_assessment_code_${assessmentId}_${questionIndex}`;
}

function getSessionResultKey(assessmentId) {
  return `coding_assessment_result_${assessmentId}`;
}

function extractAssessmentQuestion(payload) {
  if (!payload) {
    return null;
  }

  if (payload.question) {
    return payload.question;
  }

  if (payload.current_question) {
    return payload.current_question;
  }

  if (payload.next_question) {
    return payload.next_question;
  }

  if (payload.assessment?.question) {
    return payload.assessment.question;
  }

  return null;
}

function extractExecution(payload) {
  if (!payload) {
    return null;
  }

  return (
    payload.execution ||
    payload.result ||
    payload.execution_result ||
    null
  );
}

function extractJudgement(payload) {
  if (!payload) {
    return null;
  }

  return (
    payload.judgement ||
    payload.solution_judgement ||
    payload.evaluation ||
    null
  );
}

function extractInterviewer(payload) {
  if (!payload) {
    return null;
  }

  return (
    payload.interviewer ||
    payload.interviewer_event ||
    payload.event ||
    null
  );
}

function getVisiblePassed(execution) {
  if (!execution) {
    return 0;
  }

  return Number(
    execution.visible_passed_tests ??
      execution.passed_tests ??
      execution.passed ??
      0
  );
}

function getVisibleTotal(execution) {
  if (!execution) {
    return 0;
  }

  return Number(
    execution.visible_total_tests ??
      execution.total_tests ??
      execution.tests?.length ??
      0
  );
}

function getHiddenPassed(execution) {
  if (!execution) {
    return 0;
  }

  return Number(
    execution.hidden_passed_tests ??
      execution.hidden_passed ??
      0
  );
}

function getHiddenTotal(execution) {
  if (!execution) {
    return 0;
  }

  return Number(
    execution.hidden_total_tests ??
      execution.hidden_total ??
      0
  );
}

function getHiddenFailed(execution) {
  const passed = getHiddenPassed(execution);
  const total = getHiddenTotal(execution);

  if (!total) {
    return Number(execution?.hidden_failed_tests ?? 0);
  }

  return Math.max(0, total - passed);
}

function isAccepted(judgement, execution) {
  if (
    judgement &&
    typeof judgement.correct === "boolean"
  ) {
    return judgement.correct;
  }

  if (
    execution &&
    typeof execution.passed === "boolean"
  ) {
    return execution.passed;
  }

  return false;
}

function getStarterCode(question, assessmentId, questionIndex) {
  const stored = localStorage.getItem(
    getCodeKey(assessmentId, questionIndex)
  );

  // An empty saved editor value must NOT hide the default boilerplate.
  if (typeof stored === "string" && stored.trim()) {
    return stored;
  }

  const fallbackStarter = `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Enter the code here

    return 0;
}
`;

  // Prefer a real C++ starter only when it contains a main block.
  // This keeps the assessment editor in stdin/stdout main()-based format.
  const questionStarter =
    typeof question?.starter_code === "string"
      ? question.starter_code
      : "";
  const questionTemplate =
    typeof question?.code_template === "string"
      ? question.code_template
      : "";

  if (questionStarter.trim() && /\bint\s+main\s*\(/.test(questionStarter)) {
    return questionStarter;
  }

  if (questionTemplate.trim() && /\bint\s+main\s*\(/.test(questionTemplate)) {
    return questionTemplate;
  }

  return fallbackStarter;
}

function getSpeechRecognitionConstructor() {
  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    null
  );
}

function speakText(text, onEnd) {
  if (!text) {
    onEnd?.();
    return;
  }

  if (!("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = () => {
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}


const codingAssessmentFinalStyles = `
  .topbar-action-button {
    border: 1px solid rgba(255,255,255,.16);
    background: rgba(255,255,255,.06);
    color: inherit;
    border-radius: 7px;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }
  .topbar-action-button:hover { background: rgba(255,255,255,.12); }
  .topbar-action-button.secondary { opacity: .9; }
  .failed-tests-summary {
    margin-top: 14px;
    padding: 12px 14px;
    border: 1px solid rgba(255,255,255,.10);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
  }
  .failed-tests-summary span { opacity: .72; font-size: 12px; }
  @media (max-width: 900px) {
    .topbar-action-button { padding: 6px 8px; font-size: 11px; }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("coding-assessment-final-styles")) {
  const style = document.createElement("style");
  style.id = "coding-assessment-final-styles";
  style.textContent = codingAssessmentFinalStyles;
  document.head.appendChild(style);
}

export default function CodingAssessment() {

  const [assessmentId, setAssessmentId] = useState(
    getAssessmentId()
  );

  const [assessment, setAssessment] = useState(
    getStoredAssessment()
  );

  const [question, setQuestion] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(true);

  const [running, setRunning] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [execution, setExecution] = useState(null);

  const [visibleTestCases, setVisibleTestCases] = useState([]);

  const [judgement, setJudgement] = useState(null);

  const [submitResult, setSubmitResult] = useState(null);

  const [canSubmit, setCanSubmit] = useState(false);

  const [completedResults, setCompletedResults] =
    useState([]);

  const [secondsRemaining, setSecondsRemaining] =
    useState(0);

  const [assessmentFinished, setAssessmentFinished] =
    useState(false);

  const [timeExpired, setTimeExpired] =
    useState(false);

  const [interviewerQuestion, setInterviewerQuestion] =
    useState("");

  const [interviewerReason, setInterviewerReason] =
    useState("");

  const [showInterviewerPrompt, setShowInterviewerPrompt] =
    useState(false);

  const [interviewerOpen, setInterviewerOpen] =
    useState(false);

  const [interviewerState, setInterviewerState] =
    useState("idle");

  const [interviewerTranscript, setInterviewerTranscript] =
    useState("");

  const [interviewerResponse, setInterviewerResponse] =
    useState("");

  const [interviewerHistory, setInterviewerHistory] =
    useState([]);

  const [candidateQuestion, setCandidateQuestion] =
    useState("");

  const [voiceSupported, setVoiceSupported] =
    useState(false);

  const [liveObservation, setLiveObservation] =
    useState(false);

  const [jumpMessage, setJumpMessage] =
    useState("");

  const [showExamples, setShowExamples] =
    useState(true);

  const [showConstraints, setShowConstraints] =
    useState(true);

  const recognitionRef = useRef(null);

  const liveTimerRef = useRef(null);

  // Keep the interviewer discussion bounded so it cannot enter an
  // endless follow-up loop on a single coding question.
  const MAX_INTERVIEWER_QUESTIONS = 3;
  const interviewerQuestionCountRef = useRef(0);
  const interviewerDiscussionActiveRef = useRef(false);

  const mountedRef = useRef(true);
  const interviewerGreetingShownRef = useRef(false);

  const lastSubmittedCodeRef = useRef("");

  const durationMinutes = Number(
    assessment?.duration_minutes
  );

  const questions = Array.isArray(
    assessment?.questions
  )
    ? assessment.questions
    : [];

  const totalQuestions =
    Number(
      assessment?.question_count ||
        questions.length ||
        1
    );

  useEffect(() => {
    // Each coding question gets its own small interviewer discussion.
    interviewerQuestionCountRef.current = 0;
    interviewerDiscussionActiveRef.current = false;
  }, [currentIndex]);

  const examples = useMemo(
    () => normalizeExamples(question?.examples),
    [question?.examples]
  );

  const constraints = useMemo(
    () => normalizeArray(question?.constraints),
    [question?.constraints]
  );

  const visiblePassed = getVisiblePassed(execution);

  const visibleTotal = getVisibleTotal(execution);

  const hiddenPassed = getHiddenPassed(
    submitResult?.execution || execution
  );

  const hiddenTotal = getHiddenTotal(
    submitResult?.execution || execution
  );

  const hiddenFailed = getHiddenFailed(
    submitResult?.execution || execution
  );

  const accepted = isAccepted(
    judgement,
    submitResult?.execution || execution
  );

  const executionStatus = useMemo(() => {
    const message = String(execution?.error || "").toLowerCase();

    if (!execution) {
      return "idle";
    }

    if (
      message.includes("timed out") ||
      message.includes("time limit") ||
      message.includes("timeout")
    ) {
      return "tle";
    }

    if (
      message.includes("compilation") ||
      message.includes("g++") ||
      message.includes("error:") && !execution?.tests?.length
    ) {
      return "compile_error";
    }

    if (message || execution?.stderr) {
      return "runtime_error";
    }

    if (execution?.passed) {
      return "accepted";
    }

    return "wrong_answer";
  }, [execution]);

  const isCurrentCompleted =
    completedResults.some(
      (item) =>
        Number(item?.question_number) ===
        currentIndex + 1
    );

  const clearInterviewer = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore browser recognition stop errors.
      }
    }

    recognitionRef.current = null;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setInterviewerState("idle");
  }, []);

  const saveCode = useCallback(
    (value) => {
      setCode(value);

      if (assessmentId !== null) {
        localStorage.setItem(
          getCodeKey(
            assessmentId,
            currentIndex
          ),
          value
        );
      }

      setCanSubmit(false);

      if (execution) {
        setExecution(null);
      }

      if (submitResult) {
        setSubmitResult(null);
      }

      if (judgement) {
        setJudgement(null);
      }
    },
    [
      assessmentId,
      currentIndex,
      execution,
      submitResult,
      judgement,
    ]
  );

  const loadQuestion = useCallback(
    async (index = 0) => {
      if (!assessmentId) {
        setError(
          "No active coding assessment was found."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const assessmentResponse =
          await fetch(
            `${API_BASE}/api/coding/assessment/${assessmentId}`
          );

        if (assessmentResponse.ok) {
          const assessmentData =
            await assessmentResponse.json();

          setAssessment(assessmentData);

          localStorage.setItem(
            ASSESSMENT_KEY,
            JSON.stringify(assessmentData)
          );

          const storedSessionResult = safeJsonParse(
            localStorage.getItem(
              getSessionResultKey(assessmentId)
            ),
            null
          );

          if (
            Array.isArray(storedSessionResult?.results)
          ) {
            setCompletedResults(
              storedSessionResult.results
            );
          }

          if (assessmentData.completed) {
            setAssessmentFinished(true);
            window.location.href = "/coding-result";
            return;
          }
        }

        const questionResponse =
          await fetch(
            `${API_BASE}/api/coding/assessment/${assessmentId}/question?question_index=${index}`
          );

        if (!questionResponse.ok) {
          const body =
            await questionResponse.json().catch(
              () => null
            );

          if (
            body?.detail ===
              "Assessment has already been completed." ||
            body?.detail ===
              "Assessment has no remaining questions."
          ) {
            setAssessmentFinished(true);
            window.location.href = "/coding-result";
            return;
          }

          throw new Error(
            body?.detail ||
              "Could not load assessment question."
          );
        }

        const questionData =
          await questionResponse.json();

        const resolvedQuestion =
          extractAssessmentQuestion(
            questionData
          ) || questionData;

        setQuestion(resolvedQuestion);
        setVisibleTestCases([]);

        // Load the real candidate-visible test bank. If the endpoint is
        // unavailable, keep the problem examples as a safe fallback.
        const fallbackTests = normalizeExamples(
          resolvedQuestion?.examples
        ).map((item, itemIndex) => ({
          test_number: itemIndex + 1,
          input: item?.input ?? item?.stdin ?? "",
          expected_output:
            item?.expected_output ??
            item?.output ??
            item?.expected ??
            "",
          explanation: item?.explanation || "",
        }));

        try {
          const testsResponse = await fetch(
            `${API_BASE}/api/coding/assessment/${assessmentId}/question/tests?question_index=${index}`
          );

          if (testsResponse.ok) {
            const testsData = await testsResponse.json();
            const serverTests = Array.isArray(testsData?.tests)
              ? testsData.tests
              : [];
            setVisibleTestCases(
              serverTests.length ? serverTests : fallbackTests
            );
          } else {
            setVisibleTestCases(fallbackTests);
          }
        } catch {
          setVisibleTestCases(fallbackTests);
        }

        const resolvedIndex = Number(
          resolvedQuestion?.question_number
            ? resolvedQuestion.question_number - 1
            : index
        );

        setCurrentIndex(
          Math.max(0, resolvedIndex)
        );

        const savedCode =
          localStorage.getItem(
            getCodeKey(
              assessmentId,
              Math.max(0, resolvedIndex)
            )
          );

        const starterCode =
          getStarterCode(
            resolvedQuestion,
            assessmentId,
            Math.max(0, resolvedIndex)
          );

        setCode(
          typeof savedCode === "string" && savedCode.trim()
            ? savedCode
            : starterCode
        );

        setExecution(null);
        setJudgement(null);
        setSubmitResult(null);
        setCanSubmit(false);

        lastSubmittedCodeRef.current = "";

        clearInterviewer();
      } catch (err) {
        if (mountedRef.current) {
          setError(
            err?.message ||
              "Unable to load coding assessment."
          );
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [
      assessmentId,
      clearInterviewer,
    ]
  );

  useEffect(() => {
    mountedRef.current = true;

    const SpeechRecognition =
      getSpeechRecognitionConstructor();

    setVoiceSupported(
      Boolean(SpeechRecognition)
    );

    return () => {
      mountedRef.current = false;

      if (liveTimerRef.current) {
        clearTimeout(liveTimerRef.current);
      }

      clearInterviewer();
    };
  }, [clearInterviewer]);

  useEffect(() => {
    if (
      !question ||
      interviewerGreetingShownRef.current
    ) {
      return;
    }

    interviewerGreetingShownRef.current = true;

    // The opening greeting is not a question requiring permission. Speak it
    // automatically when the problem is first opened. Solution-related
    // questions use the separate permission popup below.
    const greeting =
      "Hey, could you please solve this problem? Take your time and think through your approach. If you have any doubts or want to discuss an assumption, I’m here to help.";

    interviewerQuestionCountRef.current = 0;
    interviewerDiscussionActiveRef.current = false;
    // The greeting is informational, not a solution-related interview
    // question. It must be spoken automatically when the problem opens and
    // must never consume an interviewer-question slot or require "Ask Me".
    setInterviewerQuestion("");
    setInterviewerReason("");
    setShowInterviewerPrompt(false);
    setInterviewerOpen(true);
    setInterviewerState("speaking");

    speakText(greeting, () => {
      if (mountedRef.current) {
        setInterviewerState("idle");
        setInterviewerOpen(false);
        setShowInterviewerPrompt(false);
      }
    });
  }, [question]);

  useEffect(() => {
    // The assessment planner/AI supplies the duration. Never fall back to a
    // hard-coded 15-minute limit in the frontend.
    if (
      !assessmentId ||
      !Number.isFinite(durationMinutes) ||
      durationMinutes <= 0
    ) {
      return;
    }

    const startKey =
      getAssessmentStartKey(assessmentId);

    let startedAt =
      Number(
        localStorage.getItem(startKey)
      ) || 0;

    if (!startedAt) {
      startedAt = Date.now();

      localStorage.setItem(
        startKey,
        String(startedAt)
      );
    }

    const totalSeconds =
      durationMinutes * 60;

    const updateTimer = () => {
      const elapsed = Math.floor(
        (Date.now() - startedAt) / 1000
      );

      const remaining = Math.max(
        0,
        totalSeconds - elapsed
      );

      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        setError(
          "Assessment time has expired."
        );
        setTimeExpired(true);
        setAssessmentFinished(true);
        clearInterviewer();
      }
    };

    updateTimer();

    const interval = setInterval(
      updateTimer,
      1000
    );

    return () => clearInterval(interval);
  }, [
    assessmentId,
    durationMinutes,
    clearInterviewer,
  ]);

  useEffect(() => {
    if (!assessmentId) {
      return;
    }

    let cancelled = false;

    const initializeQuestion = async () => {
      try {
        await startQuestion();
        if (!cancelled) {
          await loadQuestion(currentIndex);
        }
      } catch {
        // loadQuestion surfaces the useful API error.
      }
    };

    initializeQuestion();

    return () => {
      cancelled = true;
    };
  }, [assessmentId]);

  useEffect(() => {
    if (!assessmentId) {
      return;
    }

    localStorage.setItem(
      getCodeKey(
        assessmentId,
        currentIndex
      ),
      code
    );
  }, [
    assessmentId,
    currentIndex,
    code,
  ]);

  const requestLiveObservation =
    useCallback(async () => {
      if (
        !assessmentId ||
        !code.trim() ||
        code.trim().length < 20 ||
        submitResult ||
        assessmentFinished
      ) {
        return;
      }

      try {
        setLiveObservation(true);

        const response =
          await fetch(
            `${API_BASE}/api/coding/assessment/${assessmentId}/question/live`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                code,
                question_index: currentIndex,
                language:
                  assessment?.language ||
                  "cpp",
              }),
            }
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        const interviewer =
          extractInterviewer(data);

        const newQuestion =
          interviewer?.question ||
          data?.question ||
          "";

        if (
          newQuestion &&
          interviewerQuestionCountRef.current <
            MAX_INTERVIEWER_QUESTIONS
        ) {
          interviewerQuestionCountRef.current += 1;

          setInterviewerQuestion(
            newQuestion
          );

          setInterviewerReason(
            interviewer?.reason ||
              "I have a question about your approach."
          );

          setShowInterviewerPrompt(
            true
          );

          // Show the prompt, but wait for the candidate to click "Ask Me"
          // before opening the discussion or speaking.
          setInterviewerOpen(false);
          setInterviewerState("idle");
        } else if (newQuestion) {
          // The discussion limit has been reached; do not leave a stale popup visible.
          setInterviewerQuestion("");
          setShowInterviewerPrompt(false);
          setInterviewerOpen(false);
          interviewerDiscussionActiveRef.current = false;
        }
      } catch {
        // Live observation is intentionally
        // non-blocking for coding.
      } finally {
        if (mountedRef.current) {
          setLiveObservation(false);
        }
      }
    }, [
      assessmentId,
      code,
      submitResult,
      assessmentFinished,
      currentIndex,
      assessment?.language,
    ]);

  useEffect(() => {
    if (!code.trim()) {
      return;
    }

    if (liveTimerRef.current) {
      clearTimeout(
        liveTimerRef.current
      );
    }

    liveTimerRef.current =
      setTimeout(
        requestLiveObservation,
        4000
      );

    return () => {
      if (liveTimerRef.current) {
        clearTimeout(
          liveTimerRef.current
        );
      }
    };
  }, [
    code,
    requestLiveObservation,
  ]);

  const startQuestion = useCallback(
    async (index = currentIndex) => {
      if (!assessmentId) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_BASE}/api/coding/assessment/${assessmentId}/question/start?question_index=${index}`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          const body =
            await response.json().catch(
              () => null
            );

          if (
            body?.detail?.includes(
              "already been completed"
            )
          ) {
            window.location.href = "/coding-result";
            return;
          }

          throw new Error(
            body?.detail ||
              "Could not start question."
          );
        }
      } catch (err) {
        setError(
          err?.message ||
            "Could not start coding question."
        );
      }
    },
    [assessmentId, currentIndex]
  );

  const handleRun = useCallback(
    async () => {
      if (
        !assessmentId ||
        !code.trim() ||
        running ||
        submitting ||
        secondsRemaining <= 0
      ) {
        return;
      }

      try {
        setRunning(true);
        setError("");

        setExecution(null);
        setSubmitResult(null);
        setJudgement(null);
        setCanSubmit(false);

        const response =
          await fetch(
            `${API_BASE}/api/coding/assessment/${assessmentId}/question/run`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                code,
                question_index: currentIndex,
                language:
                  assessment?.language ||
                  "cpp",
              }),
            }
          );

        const data =
          await response.json().catch(
            () => null
          );

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Code execution failed."
          );
        }

        const result =
          extractExecution(data) ||
          data;

        setExecution(result);

        const passed =
          data?.can_submit === true ||
          result?.passed === true ||
          (
            getVisibleTotal(result) > 0 &&
            getVisiblePassed(result) ===
              getVisibleTotal(result)
          );

        setCanSubmit(passed);

        if (!passed) {
          setError(
            "Fix the failing visible tests and Run again before submitting."
          );
        }
      } catch (err) {
        setError(
          err?.message ||
            "Could not execute your code."
        );
      } finally {
        setRunning(false);
      }
    },
    [
      assessmentId,
      code,
      running,
      submitting,
      secondsRemaining,
      assessment?.language,
    ]
  );

  const buildQuestionResult = useCallback(
    (
      submitData,
      resultExecution,
      resultJudgement,
      resultInterviewer
    ) => {
      const finalExecution =
        resultExecution ||
        extractExecution(
          submitData
        ) ||
        {};

      const finalJudgement =
        resultJudgement ||
        extractJudgement(
          submitData
        ) ||
        {};

      const finalInterviewer =
        resultInterviewer ||
        extractInterviewer(
          submitData
        ) ||
        {};

      return {
        question_number:
          question?.question_number ??
          currentIndex + 1,

        problem_id:
          question?.problem_id,

        title:
          question?.title ||
          "Coding Question",

        category:
          question?.category,

        difficulty:
          question?.difficulty,

        code,

        accepted:
          isAccepted(
            finalJudgement,
            finalExecution
          ),

        // Normalized fields used by CodingResult/History. Keep the
        // original execution/judgement fields below untouched.
        passed:
          isAccepted(
            finalJudgement,
            finalExecution
          ),

        submitted: true,

        score:
          Number.isFinite(Number(finalJudgement?.score))
            ? Number(finalJudgement.score)
            : Number.isFinite(Number(finalJudgement?.rating))
            ? Number(finalJudgement.rating)
            : isAccepted(finalJudgement, finalExecution)
            ? 10
            : 0,

        passed_tests:
          getVisiblePassed(finalExecution) +
          getHiddenPassed(finalExecution),

        total_tests:
          getVisibleTotal(finalExecution) +
          getHiddenTotal(finalExecution),

        visible_passed_tests:
          getVisiblePassed(
            finalExecution
          ),

        visible_total_tests:
          getVisibleTotal(
            finalExecution
          ),

        hidden_passed_tests:
          getHiddenPassed(
            finalExecution
          ),

        hidden_total_tests:
          getHiddenTotal(
            finalExecution
          ),

        hidden_failed_tests:
          getHiddenFailed(
            finalExecution
          ),

        execution_time_ms:
          finalExecution?.execution_time_ms ??
          finalExecution?.execution_time ??
          null,

        feedback:
          finalJudgement?.reasoning ||
          finalJudgement?.feedback ||
          "",

        approach:
          finalJudgement?.approach_name ||
          finalJudgement?.approach_level ||
          "",

        time_complexity:
          finalJudgement?.time_complexity ||
          "",

        space_complexity:
          finalJudgement?.space_complexity ||
          "",

        optimal:
          finalJudgement?.optimal,

        strengths:
          finalJudgement?.strengths || [],

        weaknesses:
          finalJudgement?.weaknesses || [],

        interviewer_question:
          finalInterviewer?.question ||
          finalJudgement?.recommended_follow_up ||
          "",

        interviewer_reason:
          finalInterviewer?.reason ||
          "",

        submitted_at:
          new Date().toISOString(),
      };
    },
    [
      question,
      currentIndex,
      code,
    ]
  );

  const saveSessionResult = useCallback(
    (results) => {
      if (!assessmentId) {
        return;
      }

      const existingHistory =
        safeJsonParse(
          localStorage.getItem(
            HISTORY_KEY
          ),
          []
        );

      const safeHistory =
        Array.isArray(existingHistory)
          ? existingHistory
          : [];

      const resultObject = {
        assessment_id:
          assessmentId,

        mode:
          assessment?.mode ||
          "personalized",

        company:
          assessment?.company ||
          null,

        role:
          assessment?.role ||
          null,

        topics:
          assessment?.topics ||
          [],

        question_count:
          totalQuestions,

        duration_minutes:
          durationMinutes,

        completed: true,

        completed_at:
          new Date().toISOString(),

        interviewer_question_count:
          interviewerHistory.length,

        interviewer_history:
          interviewerHistory,

        results,
      };

      const withoutCurrent =
        safeHistory.filter(
          (item) =>
            item?.assessment_id !==
            assessmentId
        );

      withoutCurrent.push(
        resultObject
      );

      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(
          withoutCurrent
        )
      );

      localStorage.setItem(
        getSessionResultKey(
          assessmentId
        ),
        JSON.stringify(
          resultObject
        )
      );

      localStorage.setItem(
        "coding_assessment_result",
        JSON.stringify(
          resultObject
        )
      );
    },
    [
      assessmentId,
      assessment?.mode,
      assessment?.company,
      assessment?.role,
      assessment?.topics,
      totalQuestions,
      durationMinutes,
      interviewerHistory,
    ]
  );

  useEffect(() => {
    if (!timeExpired || !assessmentId) {
      return;
    }

    // Preserve whatever has already been completed so the feedback page
    // remains useful even when the timer expires before the final question.
    saveSessionResult(completedResults);
  }, [
    timeExpired,
    assessmentId,
    completedResults,
    saveSessionResult,
  ]);

  const handleSubmit = useCallback(
    async () => {
      if (
        !assessmentId ||
        !code.trim() ||
        submitting ||
        running ||
        !canSubmit ||
        secondsRemaining <= 0
      ) {
        return;
      }

      if (
        lastSubmittedCodeRef.current &&
        lastSubmittedCodeRef.current !==
          code
      ) {
        setError(
          "Your code changed after the last Run. Run it again before submitting."
        );
        setCanSubmit(false);
        return;
      }

      try {
        setSubmitting(true);
        setError("");

        const response =
          await fetch(
            `${API_BASE}/api/coding/assessment/${assessmentId}/question/submit`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                code,
                question_index: currentIndex,
                language:
                  assessment?.language ||
                  "cpp",
              }),
            }
          );

        const data =
          await response.json().catch(
            () => null
          );

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Submission failed."
          );
        }

        const finalExecution =
          extractExecution(data) ||
          {};

        const finalJudgement =
          extractJudgement(data) ||
          {};

        const finalInterviewer =
          extractInterviewer(data) ||
          {};

        setSubmitResult(data);
        setExecution(finalExecution);
        setJudgement(finalJudgement);

        lastSubmittedCodeRef.current =
          code;

        setCanSubmit(false);

        const questionResult =
          buildQuestionResult(
            data,
            finalExecution,
            finalJudgement,
            finalInterviewer
          );

        const updatedResults = [
          ...completedResults,
          questionResult,
        ];

        const uniqueResults =
          updatedResults.filter(
            (item, index, array) =>
              array.findIndex(
                (candidate) =>
                  candidate?.question_number ===
                  item?.question_number
              ) === index
          );

        setCompletedResults(
          uniqueResults
        );

        localStorage.setItem(
          getSessionResultKey(
            assessmentId
          ),
          JSON.stringify({
            ...safeJsonParse(
              localStorage.getItem(
                getSessionResultKey(
                  assessmentId
                )
              ),
              {}
            ),
            assessment_id:
              assessmentId,
            mode:
              assessment?.mode ||
              "personalized",
            results:
              uniqueResults,
          })
        );

        const followUpQuestion =
          finalInterviewer?.question ||
          finalJudgement?.recommended_follow_up ||
          (isAccepted(
            finalJudgement,
            finalExecution
          )
            ? "Walk me through your approach and explain its time and space complexity."
            : "");

        setInterviewerQuestion(
          followUpQuestion
        );

        setInterviewerReason(
          finalInterviewer?.reason ||
            (followUpQuestion
              ? "Let's discuss your solution and the reasoning behind it."
              : "Let's discuss your solution.")
        );

        if (
          followUpQuestion &&
          interviewerQuestionCountRef.current < MAX_INTERVIEWER_QUESTIONS
        ) {
          interviewerQuestionCountRef.current += 1;
          setShowInterviewerPrompt(true);
          setInterviewerOpen(false);
          setInterviewerState("idle");
        }
      } catch (err) {
        setError(
          err?.message ||
            "Could not submit solution."
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      assessmentId,
      code,
      submitting,
      running,
      canSubmit,
      secondsRemaining,
      assessment?.language,
      assessment?.mode,
      completedResults,
      buildQuestionResult,
    ]
  );

  const openInterviewer =
    useCallback(() => {
      if (!interviewerQuestion) {
        return;
      }

      setShowInterviewerPrompt(false);
      setInterviewerOpen(true);
      interviewerDiscussionActiveRef.current = true;
      if (interviewerQuestionCountRef.current === 0) {
        interviewerQuestionCountRef.current = 1;
      }
      setInterviewerTranscript("");
      setInterviewerResponse("");
      setInterviewerState("speaking");

      speakText(
        interviewerQuestion,
        () => {
          if (
            mountedRef.current
          ) {
            setInterviewerState(
              "idle"
            );
          }
        }
      );
    }, [interviewerQuestion]);

  const startListening =
    useCallback(() => {
      const Recognition =
        getSpeechRecognitionConstructor();

      if (!Recognition) {
        setError(
          "Voice input is not supported by this browser."
        );
        return;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore.
        }
      }

      const recognition =
        new Recognition();

      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setInterviewerState(
          "listening"
        );
      };

      recognition.onresult = (
        event
      ) => {
        let transcript = "";

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          transcript +=
            event.results[i][0]
              .transcript;
        }

        setInterviewerTranscript(
          transcript
        );
      };

      recognition.onerror = (
        event
      ) => {
        setInterviewerState(
          "idle"
        );

        if (
          event?.error ===
          "not-allowed"
        ) {
          setError(
            "Microphone permission was denied."
          );
        }
      };

      recognition.onend = () => {
        setInterviewerState(
          "idle"
        );

        setInterviewerTranscript(
          (previous) =>
            previous.trim()
        );
      };

      recognitionRef.current =
        recognition;

      recognition.start();
    }, []);

  const submitInterviewAnswer =
    useCallback(async () => {
      const answer =
        interviewerTranscript.trim();

      if (!answer) {
        return;
      }

      setInterviewerState(
        "processing"
      );

      setInterviewerHistory((previous) => [
        ...previous,
        {
          question: interviewerQuestion,
          answer,
          question_index: currentIndex,
          asked_at: new Date().toISOString(),
        },
      ]);

      try {
        const response =
          await fetch(
            `${API_BASE}/api/coding/assessment/${assessmentId}/question/interview-answer`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                answer,
                question:
                  interviewerQuestion,
                code,
                question_index: currentIndex,
                language:
                  assessment?.language ||
                  "cpp",
              }),
            }
          );

        const data =
          await response.json().catch(
            () => null
          );

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Could not process interview answer."
          );
        }

        const nextQuestion =
          data?.question ||
          data?.interviewer?.question ||
          data?.next_question ||
          "";

        const responseText =
          data?.response ||
          data?.message ||
          data?.feedback ||
          "";

        setInterviewerResponse(
          responseText
        );

        if (
          nextQuestion &&
          interviewerQuestionCountRef.current <
            MAX_INTERVIEWER_QUESTIONS
        ) {
          interviewerQuestionCountRef.current += 1;

          setInterviewerQuestion(
            nextQuestion
          );

          setInterviewerTranscript(
            ""
          );

          if (interviewerDiscussionActiveRef.current) {
            // The candidate is already inside an active interviewer discussion,
            // so keep the panel open and continue naturally with the next question.
            setInterviewerState("speaking");
            setInterviewerOpen(true);
            setShowInterviewerPrompt(false);

            speakText(
              nextQuestion,
              () => {
                if (mountedRef.current) {
                  setInterviewerState("idle");
                }
              }
            );
          } else {
            // If the AI wants to start a discussion later, ask permission first.
            setInterviewerState("idle");
            setInterviewerOpen(false);
            setShowInterviewerPrompt(true);
          }
        } else {
          // Questioning is finished (including the maximum follow-up limit).
          // Close both the popup and the voice panel automatically.
          const finishInterviewer = () => {
            if (!mountedRef.current) return;
            interviewerDiscussionActiveRef.current = false;
            setInterviewerState("idle");
            setInterviewerOpen(false);
            setShowInterviewerPrompt(false);
            setInterviewerQuestion("");
            setInterviewerTranscript("");
          };

          if (responseText) {
            speakText(responseText, finishInterviewer);
          } else {
            finishInterviewer();
          }
        }
      } catch (err) {
        setInterviewerState(
          "idle"
        );

        setError(
          err?.message ||
            "Could not process your interview answer."
        );
      }
    }, [
      assessmentId,
      interviewerTranscript,
      interviewerQuestion,
      code,
      currentIndex,
      assessment?.language,
    ]);

  const askInterviewer = useCallback(async () => {
    const asked = candidateQuestion.trim();

    if (!assessmentId || !asked) {
      return;
    }

    try {
      setError("");
      setInterviewerResponse("");
      setInterviewerState("thinking");

      const response = await fetch(
        `${API_BASE}/api/coding/assessment/${assessmentId}/question/interview-answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answer: asked,
            question: interviewerQuestion || "Candidate clarification",
            code,
            question_index: currentIndex,
            action: "clarification",
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail || "Could not contact the interviewer."
        );
      }

      const reply =
        data?.response ||
        "I can clarify the assumptions without giving away the solution.";

      const clarificationQuestion =
        data?.question ||
        data?.interviewer?.question ||
        "";

      setCandidateQuestion("");
      setInterviewerResponse(reply);

      if (
        clarificationQuestion &&
        interviewerQuestionCountRef.current <
          MAX_INTERVIEWER_QUESTIONS
      ) {
        interviewerQuestionCountRef.current += 1;
        setInterviewerQuestion(clarificationQuestion);
        setInterviewerOpen(false);
        setShowInterviewerPrompt(true);
        setInterviewerState("idle");
      } else {
        setInterviewerState("speaking");
        speakText(reply, () => {
          if (mountedRef.current) {
            setInterviewerState("idle");
          }
        });
      }
    } catch (err) {
      setInterviewerState("idle");
      setError(
        err?.message ||
          "Could not contact the interviewer."
      );
    }
  }, [
    assessmentId,
    candidateQuestion,
    interviewerQuestion,
    code,
    currentIndex,
  ]);

  const closeInterviewer =
    useCallback(() => {
      clearInterviewer();
      interviewerDiscussionActiveRef.current = false;

      setInterviewerOpen(false);
      setShowInterviewerPrompt(false);
    }, [clearInterviewer]);

  const completeAndGoNext =
    useCallback(async () => {
      if (
        !assessmentId ||
        !submitResult
      ) {
        return;
      }

      try {
        setError("");

        const result =
          buildQuestionResult(
            submitResult,
            execution,
            judgement,
            extractInterviewer(
              submitResult
            )
          );

        const mergedResults =
          completedResults.some(
            (item) =>
              item?.question_number ===
              result?.question_number
          )
            ? completedResults
            : [
                ...completedResults,
                result,
              ];

        const response =
          await fetch(
            `${API_BASE}/api/coding/assessment/${assessmentId}/question/complete`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                result,
              }),
            }
          );

        const data =
          await response.json().catch(
            () => null
          );

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Could not complete question."
          );
        }

        if (
          data?.completed === true
        ) {
          saveSessionResult(
            mergedResults
          );

          setAssessmentFinished(
            true
          );

          // Keep the candidate on the assessment page and show the
          // completion actions. The feedback button performs the
          // navigation after the candidate chooses it.
          return;
        }

        setCompletedResults(
          mergedResults
        );

        const nextIndex =
          currentIndex + 1;

        setCurrentIndex(
          nextIndex
        );

        setQuestion(null);
        setExecution(null);
        setJudgement(null);
        setSubmitResult(null);
        setCanSubmit(false);
        setInterviewerQuestion("");
        setInterviewerTranscript("");
        setInterviewerResponse("");

        clearInterviewer();

        await startQuestion();

        await loadQuestion(
          nextIndex
        );
      } catch (err) {
        setError(
          err?.message ||
            "Could not move to the next question."
        );
      }
    }, [
      assessmentId,
      submitResult,
      buildQuestionResult,
      execution,
      judgement,
      completedResults,
      saveSessionResult,
      currentIndex,
      clearInterviewer,
      startQuestion,
      loadQuestion,
    ]);

  const jumpToQuestion =
    useCallback(
      async (index) => {
        if (index < 0 || index >= totalQuestions) {
          return;
        }

        if (index === currentIndex) {
          return;
        }

        setJumpMessage("");
        setCurrentIndex(index);
        setQuestion(null);
        setExecution(null);
        setJudgement(null);
        setSubmitResult(null);
        setCanSubmit(false);
        setInterviewerQuestion("");
        setInterviewerTranscript("");
        setInterviewerResponse("");
        clearInterviewer();

        // IMPORTANT: a question switch must update the backend coding
        // session before loading tests. Otherwise Q2 can display Q1's
        // test bank (the exact bug seen in the assessment UI).
        await startQuestion(index);
        await loadQuestion(index);
      },
      [
        currentIndex,
        totalQuestions,
        clearInterviewer,
        startQuestion,
        loadQuestion,
      ]
    );

  const goDashboard =
    useCallback(() => {
      window.location.href = "/";
    }, []);

  const goFeedback =
    useCallback(() => {
      window.location.href = "/coding-result";
    }, []);

  const handleExitAssessment = useCallback(() => {
    if (assessmentId) {
      saveSessionResult(completedResults);
    }
    window.location.href = "/coding-result";
  }, [assessmentId, completedResults, saveSessionResult]);

  const handleReturnDashboard = useCallback(() => {
    if (assessmentId) {
      saveSessionResult(completedResults);
    }
    window.location.href = "/";
  }, [assessmentId, completedResults, saveSessionResult]);

  if (loading && !question) {
    return (
      <div className="coding-page">
        <div className="coding-loading">
          <div className="coding-spinner" />
          <p>
            Preparing your coding assessment...
          </p>
        </div>
      </div>
    );
  }

  if (
    assessmentFinished
  ) {
    return (
      <div className="coding-page">
        <div className="coding-complete">
          <div className="complete-icon">
            ✓
          </div>

          <h1>
            {timeExpired
              ? "Time's Up"
              : "Assessment Complete"}
          </h1>

          <p>
            {timeExpired
              ? "Your assessment time has ended. Your completed work has been saved and is available in AI feedback."
              : "Your coding assessment has been completed successfully."}
          </p>

          <div className="complete-actions">
            <button
              className="primary-button"
              onClick={
                handleExitAssessment
              }
            >
              View AI Feedback
            </button>

            <button
              className="secondary-button"
              onClick={
                handleReturnDashboard
              }
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="coding-page">
      <header className="coding-topbar">
        <div className="coding-brand">
          <span>AI Coding Assessment</span>
          <div className="top-interviewer">
            <span className="top-interviewer-dot" />
            <span className="top-interviewer-name">AI Interviewer</span>
            <span className="top-interviewer-status">
              {liveObservation ? "Observing" : "Available"}
            </span>
          </div>
        </div>

        <div className="coding-topbar-right">
          <span>
            {assessment?.mode ===
            "company_oa"
              ? "Company OA"
              : assessment?.mode ===
                "contest"
              ? "Contest"
              : "Personalized"}
          </span>

          <button
            type="button"
            className="topbar-action-button"
            onClick={handleExitAssessment}
            title="Open AI feedback and assessment results"
          >
            AI Feedback
          </button>

          <button
            type="button"
            className="topbar-action-button secondary"
            onClick={handleReturnDashboard}
            title="Leave the assessment and return to dashboard"
          >
            Dashboard
          </button>
        </div>
      </header>

      <div className="coding-workspace">
        <aside className="question-sidebar">
          <div className="sidebar-title">
            Questions
          </div>

          <div className="question-list">
            {Array.from({
              length: totalQuestions,
            }).map(
              (_, index) => {
                const result =
                  completedResults.find(
                    (item) =>
                      Number(
                        item?.question_number
                      ) ===
                      index + 1
                  );

                const isCurrent =
                  index ===
                  currentIndex;

                const isCompleted =
                  Boolean(result);

                return (
                  <button
                    type="button"
                    key={index}
                    className={[
                      "question-pill",
                      isCurrent
                        ? "active"
                        : "",
                      isCompleted
                        ? "completed"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() =>
                      jumpToQuestion(index)
                    }
                    aria-current={
                      isCurrent ? "step" : undefined
                    }
                  >
                    <span className="question-pill-number">
                      {isCompleted
                        ? "✓"
                        : index + 1}
                    </span>

                    <span>
                      Question{" "}
                      {index + 1}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          <div className="sidebar-bottom">
            <button
              className="dashboard-link"
              onClick={
                goDashboard
              }
            >
              ← Dashboard
            </button>
          </div>
        </aside>

        <main className="coding-main">
          {error && (
            <div className="coding-alert">
              <span>{error}</span>

              <button
                onClick={() =>
                  setError("")
                }
              >
                ×
              </button>
            </div>
          )}

          {jumpMessage && (
            <div className="jump-message">
              {jumpMessage}
            </div>
          )}

          <section className="problem-panel">
            <div className="problem-header">
              <div>
                <div className="problem-meta">
                  <span>
                    {question?.difficulty ||
                      "Medium"}
                  </span>

                  <span>·</span>

                  <span>
                    {question?.category ||
                      "Algorithms"}
                  </span>
                </div>

                <h1>
                  {question?.title ||
                    "Coding Problem"}
                </h1>
              </div>

            </div>

            <div className="problem-statement">
              {question?.statement ||
                question?.description ||
                "Solve the problem using an efficient algorithm."}
            </div>

            <div className="problem-section">
              <button
                className="section-toggle"
                onClick={() =>
                  setShowExamples(
                    (value) =>
                      !value
                  )
                }
              >
                <span>
                  Examples
                </span>

                <span>
                  {showExamples
                    ? "⌃"
                    : "⌄"}
                </span>
              </button>

              {showExamples &&
                examples.slice(0, 3).map(
                  (
                    example,
                    index
                  ) => (
                    <div
                      className="example-card"
                      key={index}
                    >
                      <div className="example-title">
                        Example{" "}
                        {index + 1}
                      </div>

                      {example.input !==
                        undefined && (
                        <div className="example-row">
                          <div className="example-label">
                            Input
                          </div>

                          <pre>
                            {formatExampleInput(
                              example.input
                            )}
                          </pre>
                        </div>
                      )}

                      {example.output !==
                        undefined && (
                        <div className="example-row">
                          <div className="example-label">
                            Output
                          </div>

                          <pre>
                            {formatExampleOutput(
                              example.output
                            )}
                          </pre>
                        </div>
                      )}

                      {example.expected_output !==
                        undefined && (
                        <div className="example-row">
                          <div className="example-label">
                            Output
                          </div>

                          <pre>
                            {formatExampleOutput(
                              example.expected_output
                            )}
                          </pre>
                        </div>
                      )}

                      {example.explanation && (
                        <div className="example-explanation">
                          {example.explanation}
                        </div>
                      )}
                    </div>
                  )
                )}

              {showExamples && examples.length > 3 && (
                <div className="examples-more-note">
                  Showing the first 3 examples. Review the problem statement for the remaining examples.
                </div>
              )}
            </div>

            {constraints.length >
              0 && (
              <div className="problem-section">
                <button
                  className="section-toggle"
                  onClick={() =>
                    setShowConstraints(
                      (value) =>
                        !value
                    )
                  }
                >
                  <span>
                    Constraints
                  </span>

                  <span>
                    {showConstraints
                      ? "⌃"
                      : "⌄"}
                  </span>
                </button>

                {showConstraints && (
                  <ul className="constraints-list">
                    {constraints.map(
                      (
                        constraint,
                        index
                      ) => (
                        <li
                          key={
                            index
                          }
                        >
                          {formatConstraint(constraint)}
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>
            )}
          </section>

          <section className="editor-panel">
            <div className="editor-header">
              <div className="editor-language">
                <span className="language-dot" />
                C++
              </div>

              <div className="editor-actions">
                <button
                  type="button"
                  className="run-button"
                  disabled={
                    running ||
                    submitting ||
                    secondsRemaining <= 0 ||
                    isCurrentCompleted
                  }
                  onClick={
                    handleRun
                  }
                >
                  {running
                    ? "Running..."
                    : "▶ Run"}
                </button>

                <button
                  type="button"
                  className={
                    canSubmit
                      ? "submit-button"
                      : "submit-button disabled"
                  }
                  disabled={
                    !canSubmit ||
                    running ||
                    submitting ||
                    isCurrentCompleted
                  }
                  title={
                    !canSubmit
                      ? "Run your code successfully first"
                      : ""
                  }
                  onClick={
                    handleSubmit
                  }
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit"}
                </button>
              </div>
            </div>

            <textarea
              className="code-editor"
              spellCheck="false"
              value={code}
              onChange={(event) =>
                saveCode(
                  event.target
                    .value
                )
              }
              disabled={
                secondsRemaining <= 0 ||
                assessmentFinished ||
                (isCurrentCompleted &&
                  !submitResult)
              }
            />
          </section>

          <section className="test-panel">
            <div className="test-panel-header">
              <div className="test-panel-heading">
                <strong>Test Cases</strong>

                {execution && (
                  <span className="test-summary">
                    {visiblePassed} / {visibleTotal} cases passed
                  </span>
                )}
              </div>

              <div className="test-panel-statuses">
                {execution && executionStatus === "accepted" && (
                  <span className="test-status-badge accepted">✓ Accepted</span>
                )}

                {execution && executionStatus === "wrong_answer" && (
                  <span className="test-status-badge failed">Wrong Answer</span>
                )}

                {execution && executionStatus === "tle" && (
                  <span className="test-status-badge tle">TLE</span>
                )}

                {execution && executionStatus === "compile_error" && (
                  <span className="test-status-badge failed">Compile Error</span>
                )}

                {execution && executionStatus === "runtime_error" && (
                  <span className="test-status-badge failed">Runtime Error</span>
                )}

                {submitResult && (
                  <span className="hidden-summary">
                    Hidden {hiddenPassed} / {hiddenTotal} · Failed {hiddenFailed}
                  </span>
                )}
              </div>
            </div>

            <div className="test-result-body">
              {execution && (
                <div className="execution-overview">
                  <div className="execution-overview-main">
                    <strong>
                      {visiblePassed} / {visibleTotal} cases passed
                    </strong>

                    {execution.execution_time_ms != null && (
                      <span>
                        {Number(execution.execution_time_ms).toFixed(0)} ms
                      </span>
                    )}
                  </div>

                  {submitResult && (
                    <div className="execution-hidden-summary">
                      <span>Hidden {hiddenPassed} / {hiddenTotal}</span>
                      <span>Hidden failed {hiddenFailed}</span>
                    </div>
                  )}
                </div>
              )}

              {execution?.error && (
                <div className="execution-error-card">
                  <div className="execution-error-title">
                    {executionStatus === "tle"
                      ? "Time Limit Exceeded"
                      : executionStatus === "compile_error"
                      ? "Compilation Error"
                      : executionStatus === "runtime_error"
                      ? "Runtime Error"
                      : "Execution Error"}
                  </div>
                  <pre className="execution-error">
                    {execution.error}
                  </pre>
                </div>
              )}

              {(execution?.tests?.length
                ? execution.tests
                : visibleTestCases
              ).map((test, index) => {
                const hasExecution = Boolean(execution?.tests?.length);
                const passed = hasExecution ? test.passed === true : null;
                const input = test.input ?? test.input_data ?? "";
                const expected =
                  test.expected_output ?? test.expected ?? "";
                const actual =
                  test.actual_output ?? test.stdout ?? "";

                return (
                  <article
                    className={`test-case-card ${
                      passed === true
                        ? "pass"
                        : passed === false
                        ? "fail"
                        : "pending"
                    }`}
                    key={`${test.test_number ?? index + 1}-${index}`}
                  >
                    <div className="test-case-card-header">
                      <strong>Test Case {test.test_number ?? index + 1}</strong>

                      <span
                        className={`test-case-status-pill ${
                          passed === true
                            ? "pass"
                            : passed === false
                            ? "fail"
                            : "pending"
                        }`}
                      >
                        {passed === true
                          ? "✓ Passed"
                          : passed === false
                          ? "✕ Failed"
                          : "Not Run"}
                      </span>
                    </div>

                    <div className="test-case-values">
                      <div>
                        <span>Input</span>
                        <pre>{formatExampleInput(input)}</pre>
                      </div>

                      <div>
                        <span>Expected Output</span>
                        <pre>{formatExampleOutput(expected)}</pre>
                      </div>

                      {hasExecution && (
                        <div>
                          <span>Your Output</span>
                          <pre>
                            {formatExampleOutput(actual) || "(no output)"}
                          </pre>
                        </div>
                      )}
                    </div>

                    {test.error && (
                      <div className="test-case-error">
                        {test.error}
                      </div>
                    )}

                    {test.explanation && (
                      <div className="test-case-explanation">
                        {test.explanation}
                      </div>
                    )}
                  </article>
                );
              })}

              {!visibleTestCases.length && !execution?.tests?.length && (
                <div className="empty-tests">
                  You must run your code first.
                </div>
              )}
            </div>
          </section>

          {submitResult && (
            <section className="submission-summary">
              <div className="submission-summary-title">
                {accepted
                  ? "Solution Accepted"
                  : "Submission Evaluated"}
              </div>

              <div className="submission-grid">
                <div>
                  <span>
                    Approach
                  </span>

                  <strong>
                    {judgement?.approach_name ||
                      judgement?.approach_level ||
                      "Evaluated"}
                  </strong>
                </div>

                <div>
                  <span>
                    Time Complexity
                  </span>

                  <strong>
                    {judgement?.time_complexity ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Space Complexity
                  </span>

                  <strong>
                    {judgement?.space_complexity ||
                      "—"}
                  </strong>
                </div>
              </div>

              {submitResult && hiddenFailed > 0 && (
                <div className="failed-tests-summary hidden-failed-details">
                  <strong>Hidden Test Cases — {hiddenFailed} failed</strong>
                  <div className="hidden-failed-case-row">
                    <span className="hidden-case-status">✕ Failed</span>
                    <span>Expected Output: hidden test expected value</span>
                    <span>Your Output: did not match expected output</span>
                  </div>
                  <small>Hidden inputs and exact expected values stay private to protect the assessment.</small>
                </div>
              )}

              {execution?.tests?.some((test) => test?.passed === false) && (
                <div className="failed-tests-summary visible-failed">
                  <strong>Failed visible test cases</strong>
                  <span>Open the test cases above to review the input, expected output, and your output.</span>
                </div>
              )}
            </section>
          )}

          <section className="candidate-ask-section">
            <div className="candidate-ask-interviewer">
              <div className="candidate-ask-heading">
                <div>
                  <strong>Ask the Interviewer</strong>
                  <span>
                    Ask a clarification or talk through an assumption without advancing the coding question.
                  </span>
                </div>
              </div>

              <div className="candidate-ask-row">
                <input
                  type="text"
                  value={candidateQuestion}
                  onChange={(event) =>
                    setCandidateQuestion(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      askInterviewer();
                    }
                  }}
                  placeholder="e.g. Can we assume all numbers are positive?"
                  disabled={submitting || assessmentFinished}
                />

                <button
                  type="button"
                  className="ask-button"
                  onClick={askInterviewer}
                  disabled={!candidateQuestion.trim() || submitting}
                >
                  Ask Interview
                </button>

                {voiceSupported && (
                  <button
                    type="button"
                    className="ask-voice-button"
                    onClick={() => {
                      setInterviewerQuestion(
                        "Sure. What would you like to ask me about this problem?"
                      );
                      setInterviewerReason(
                        "Candidate-initiated question."
                      );
                      setInterviewerOpen(true);
                      setInterviewerTranscript("");
                      setInterviewerResponse("");
                      // Do not start the microphone automatically.
                      // The candidate must explicitly click Start Recording.
                      setInterviewerState("idle");
                    }}
                    disabled={submitting || assessmentFinished}
                    title="Ask the interviewer by voice"
                  >
                    🎙 Speak to Interviewer
                  </button>
                )}
              </div>
            </div>
          </section>

          {showInterviewerPrompt &&
            interviewerQuestion && (
              <div className="interviewer-popup">
                <div className="popup-icon">
                  🎙
                </div>

                <div className="popup-content">
                  <div className="popup-title">
                    AI Interviewer
                  </div>

                  <div className="popup-text">
                    {interviewerReason ||
                      "I have a question about your approach. Would you like to discuss it?"}
                  </div>
                </div>

                <button
                  type="button"
                  className="ask-button"
                  onClick={
                    openInterviewer
                  }
                >
                  Ask Me
                </button>
              </div>
            )}

          {interviewerOpen && (
            <div className="voice-interview-panel">
              <div className="voice-panel-header">
                <div>
                  <strong>
                    AI Interviewer
                  </strong>

                  <span>
                    Follow-up discussion
                  </span>
                </div>

                <button
                  className="voice-close"
                  onClick={
                    closeInterviewer
                  }
                >
                  ×
                </button>
              </div>

              <div className="voice-question">
                <div className="voice-label">
                  AI
                </div>

                <p>
                  {interviewerQuestion}
                </p>

                {interviewerState ===
                  "speaking" && (
                  <div className="voice-state">
                    🔊 Speaking...
                  </div>
                )}
              </div>

              <div className="voice-answer">
                <div className="voice-label">You</div>

                <textarea
                  className="interviewer-text-answer"
                  value={interviewerTranscript}
                  onChange={(event) =>
                    setInterviewerTranscript(event.target.value)
                  }
                  onKeyDown={(event) => {
                    // Enter is for normal text entry; microphone recording
                    // starts only when the candidate explicitly clicks
                    // Start Recording.
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.ctrlKey &&
                      !event.metaKey
                    ) {
                      event.preventDefault();
                      if (
                        interviewerTranscript.trim() &&
                        interviewerState !== "processing" &&
                        interviewerState !== "speaking"
                      ) {
                        submitInterviewAnswer();
                      }
                    }
                  }}
                  placeholder="Type your answer, or click Start Recording to speak..."
                  disabled={interviewerState === "processing"}
                />

                {interviewerState === "listening" && (
                  <div className="listening-indicator">
                    <span className="pulse" />
                    🎙 Listening...
                  </div>
                )}
              </div>

              {interviewerResponse && (
                <div className="voice-feedback">
                  {interviewerResponse}
                </div>
              )}

              <div className="voice-actions">
                {voiceSupported ? (
                  <button
                    type="button"
                    className="record-button"
                    onClick={
                      interviewerState === "listening"
                        ? () => {
                            try { recognitionRef.current?.stop(); } catch {}
                          }
                        : startListening
                    }
                    disabled={interviewerState === "speaking" || interviewerState === "processing"}
                  >
                    🎙 {interviewerState === "listening" ? "End Recording" : "Start Recording"}
                  </button>
                ) : (
                  <span className="voice-warning">Voice input is not supported in this browser.</span>
                )}

                <button
                  type="button"
                  className="answer-button"
                  onClick={submitInterviewAnswer}
                  disabled={!interviewerTranscript.trim() || interviewerState === "processing" || interviewerState === "speaking"}
                >
                  Send Answer →
                </button>
              </div>

            </div>
          )}

          {submitResult && !isCurrentCompleted && (
            <div className="question-navigation-footer">
              <div>
                <strong>
                  Question{" "}
                  {currentIndex + 1}{" "}
                  completed
                </strong>

                <span>
                  {accepted
                    ? "Solution accepted."
                    : "Submission evaluated."}
                </span>
              </div>

              {currentIndex <
              totalQuestions - 1 ? (
                <button
                  className="next-button"
                  onClick={
                    completeAndGoNext
                  }
                >
                  Next Question →
                </button>
              ) : (
                <button
                  className="next-button"
                  onClick={
                    completeAndGoNext
                  }
                >
                  Finish Assessment ✓
                </button>
              )}
            </div>
          )}

          {isCurrentCompleted && (
            <div className="review-banner">
              This question has already been completed.
              You are viewing it in review mode.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}