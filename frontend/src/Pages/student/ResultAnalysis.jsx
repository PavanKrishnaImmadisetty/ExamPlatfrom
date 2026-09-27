import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Clock,
  Award,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart2,
  Filter,
  Check,
  X,
  Target,
} from "lucide-react";

import {
  getAttemptSummary,
  getAttemptResponses,
  getExamQuestionsWithAnswers,
} from "../../api/studentService";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDuration(startTime, endTime) {
  if (!startTime || !endTime) return "—";
  const ms = new Date(endTime) - new Date(startTime);
  if (Number.isNaN(ms) || ms < 0) return "—";

  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getScoreTone(percentage) {
  if (percentage >= 85) return { bg: "#ECFDF3", text: "#12B76A", border: "#A6F4C5", label: "Excellent!" };
  if (percentage >= 60) return { bg: "#F1EDFF", text: "#6C3FF5", border: "#D9D6FE", label: "Good Job!" };
  if (percentage >= 40) return { bg: "#FFF4ED", text: "#F79009", border: "#FEDF89", label: "Average" };
  return { bg: "#FEF3F2", text: "#F04438", border: "#FECDCA", label: "Needs Improvement" };
}

// Merge one question with its matching student response
function mergeQuestionWithResponse(question, responses) {
  const response = responses.find(
    (r) => Number(r.questionId) === Number(question.id)
  );

  const isChoiceType =
    question.questionType === "MCQ" || question.questionType === "TRUE_FALSE";

  let answered = false;
  let isCorrect = false;

  if (isChoiceType) {
    answered = response?.selectedOptionId != null;
    const selectedOpt = (question.options || []).find(
      (opt) => Number(opt.id) === Number(response?.selectedOptionId)
    );
    const isOptCorrect = Boolean(selectedOpt?.correct ?? selectedOpt?.isCorrect);
    isCorrect = isOptCorrect || (response?.obtainedMarks > 0);
  } else {
    // Numeric question
    answered =
      response?.answerText !== null &&
      response?.answerText !== undefined &&
      String(response.answerText).trim() !== "";
    const isNumCorrect =
      answered &&
      question.numericAnswer !== null &&
      question.numericAnswer !== undefined &&
      String(response.answerText).trim() === String(question.numericAnswer).trim();
    isCorrect = isNumCorrect || (response?.obtainedMarks > 0);
  }

  const obtainedForQuestion = isCorrect
    ? (response?.obtainedMarks || question.marks || 0)
    : 0;

  return { question, response, isCorrect, answered, obtainedForQuestion };
}

// ---------------------------------------------------------------------------
// Option Row for Choice Questions
// ---------------------------------------------------------------------------
function OptionRow({ option, response }) {
  const isCorrectOption = Boolean(option.correct ?? option.isCorrect);
  const isSelected =
    response?.selectedOptionId != null &&
    Number(response.selectedOptionId) === Number(option.id);
  const isWrongSelection = isSelected && !isCorrectOption;

  let containerClass = "border-[#EAECF0] bg-white text-[#667085]";
  if (isCorrectOption) {
    containerClass = "border-[#12B76A] bg-[#ECFDF3] text-[#027A48] font-medium";
  } else if (isWrongSelection) {
    containerClass = "border-[#F04438] bg-[#FEF3F2] text-[#B42318] font-medium";
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm transition-colors ${containerClass}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
            isCorrectOption
              ? "border-[#12B76A] bg-[#12B76A] text-white"
              : isWrongSelection
              ? "border-[#F04438] bg-[#F04438] text-white"
              : "border-[#D0D5DD] text-[#667085]"
          }`}
        >
          {isCorrectOption ? (
            <Check size={13} strokeWidth={3} />
          ) : isWrongSelection ? (
            <X size={13} strokeWidth={3} />
          ) : (
            ""
          )}
        </span>
        <span className={isWrongSelection ? "line-through decoration-[#F04438]" : ""}>
          {option.optionText}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {isSelected && (
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              isCorrectOption
                ? "bg-[#12B76A]/10 text-[#027A48]"
                : "bg-[#F04438]/10 text-[#B42318]"
            }`}
          >
            {isCorrectOption ? "Your Answer (Correct)" : "Your Answer"}
          </span>
        )}
        {!isSelected && isCorrectOption && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#12B76A]/10 text-[#027A48]">
            Correct Answer
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Integer Answer Review
// ---------------------------------------------------------------------------
function IntegerAnswer({ question, response, isCorrect, answered }) {
  const submitted = response?.answerText;

  return (
    <div className="space-y-3">
      <div
        className={`px-4 py-3 rounded-xl border text-sm flex items-center justify-between ${
          !answered
            ? "border-[#EAECF0] bg-[#F8F7FC] text-[#98A2B3] italic"
            : isCorrect
            ? "border-[#12B76A] bg-[#ECFDF3] text-[#027A48] font-medium"
            : "border-[#F04438] bg-[#FEF3F2] text-[#B42318] font-medium"
        }`}
      >
        <span>
          {answered ? `Your Answer: ${submitted}` : "You did not attempt this question."}
        </span>
        {answered && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/70">
            {isCorrect ? "Correct ✅" : "Incorrect ❌"}
          </span>
        )}
      </div>

      {!isCorrect && (
        <div className="px-4 py-3 rounded-xl border border-[#12B76A] bg-[#ECFDF3] text-sm font-medium text-[#027A48] flex items-center justify-between">
          <span>Correct Answer: {question.numericAnswer}</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#12B76A]/15">
            Key
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Question Review Card
// ---------------------------------------------------------------------------
function QuestionReviewCard({ index, merged }) {
  const { question, response, isCorrect, answered, obtainedForQuestion } = merged;
  const isChoiceType =
    question.questionType === "MCQ" || question.questionType === "TRUE_FALSE";

  return (
    <div
      id={`question-card-${question.id}`}
      className={`rounded-2xl border p-6 transition-all duration-200 ${
        !answered
          ? "border-[#EAECF0] bg-white shadow-sm"
          : isCorrect
          ? "border-[#12B76A]/40 bg-[#F6FEF9] shadow-sm"
          : "border-[#F04438]/30 bg-[#FFFBFA] shadow-sm"
      }`}
    >
      {/* Question Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-white border border-[#EAECF0] text-[#182033] text-sm font-bold flex items-center justify-center shadow-xs">
            {index + 1}
          </span>
          <div className="pt-0.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#98A2B3]">
                {question.questionType === "MCQ"
                  ? "Multiple Choice"
                  : question.questionType === "TRUE_FALSE"
                  ? "True / False"
                  : "Numerical"}
              </span>
            </div>
            <p className="text-base font-semibold text-[#182033] leading-relaxed">
              {question.questionText}
            </p>
          </div>
        </div>

        {/* Status + Marks Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!answered ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#F2F4F7] text-[#667085]">
              <HelpCircle size={13} />
              Skipped
            </span>
          ) : isCorrect ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF3] text-[#12B76A]">
              <CheckCircle2 size={13} />
              Correct
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3F2] text-[#F04438]">
              <XCircle size={13} />
              Incorrect
            </span>
          )}
          <span className="text-xs font-bold text-[#182033] bg-white border border-[#EAECF0] px-3 py-1 rounded-full shadow-xs">
            {obtainedForQuestion} / {question.marks} Marks
          </span>
        </div>
      </div>

      {/* Answer Body */}
      <div className="mt-4 pt-4 border-t border-[#EAECF0]/60 space-y-3">
        {isChoiceType ? (
          <div className="space-y-2.5">
            {(question.options || []).map((opt) => (
              <OptionRow key={opt.id} option={opt} response={response} />
            ))}
            {!answered && (
              <p className="text-xs text-[#98A2B3] italic mt-2">
                ⚠️ You did not select an answer for this question.
              </p>
            )}
          </div>
        ) : (
          <IntegerAnswer
            question={question}
            response={response}
            isCorrect={isCorrect}
            answered={answered}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ResultAnalysis Component
// ---------------------------------------------------------------------------
export default function ResultAnalysis() {
  const { attemptId, examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [summary, setSummary]     = useState(null);
  const [responses, setResponses] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL"); // ALL | CORRECT | INCORRECT | SKIPPED

  // Fetch summary, responses, and questions
  const fetchAll = useCallback(async () => {
    if (!attemptId) {
      setError("Missing attempt information.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Fetch attempt summary
      const summaryData = await getAttemptSummary(attemptId);
      const effectiveExamId = examId || summaryData?.examId;

      if (!effectiveExamId) {
        throw new Error("Exam ID could not be identified.");
      }

      // 2. Concurrently fetch questions with answer keys and the student's saved responses
      const [responsesData, questionsData] = await Promise.all([
        getAttemptResponses(attemptId),
        getExamQuestionsWithAnswers(effectiveExamId),
      ]);

      setSummary(summaryData);
      setResponses(Array.isArray(responsesData) ? responsesData : []);
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch (err) {
      console.error("Failed to load result analysis:", err);
      setError("Unable to load your result analysis. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [attemptId, examId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Merge questions with responses
  const merged = useMemo(() => {
    return questions
      .slice()
      .sort((a, b) => (a.questionOrder ?? 0) - (b.questionOrder ?? 0))
      .map((q) => mergeQuestionWithResponse(q, responses));
  }, [questions, responses]);

  // Analytics Calculation
  const totalQuestions = merged.length;
  const correctCount = merged.filter((m) => m.isCorrect).length;
  const incorrectCount = merged.filter((m) => m.answered && !m.isCorrect).length;
  const skippedCount = merged.filter((m) => !m.answered).length;

  const totalMarks = summary?.totalMarks ?? 0;
  const obtainedMarks = summary?.obtainedMarks ?? 0;
  const percentage =
    totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
  const tone = getScoreTone(percentage);

  const accuracy =
    correctCount + incorrectCount > 0
      ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
      : 0;

  // Filtered Questions
  const filteredMerged = useMemo(() => {
    if (activeFilter === "CORRECT") return merged.filter((m) => m.isCorrect);
    if (activeFilter === "INCORRECT") return merged.filter((m) => m.answered && !m.isCorrect);
    if (activeFilter === "SKIPPED") return merged.filter((m) => !m.answered);
    return merged;
  }, [merged, activeFilter]);

  const examTitle =
    location.state?.examTitle || summary?.examTitle || "Exam Analysis";

  // Scroll to a specific question
  const scrollToQuestion = (questionId) => {
    const el = document.getElementById(`question-card-${questionId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#F8F7FC] pb-16">

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#EAECF0] px-6 lg:px-8 h-16 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/student/results")}
            className="p-2 rounded-xl text-[#667085] hover:bg-[#F8F7FC] hover:text-[#182033] transition-colors border border-[#EAECF0]"
            aria-label="Back to results"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-[#182033] truncate">
              {examTitle}
            </h1>
            <p className="text-xs text-[#98A2B3] truncate">
              Detailed Performance & Answer Review
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/results"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#667085] bg-[#F8F7FC] hover:bg-[#EAECF0] rounded-lg transition-colors"
          >
            All Results
          </Link>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="p-2 rounded-xl text-[#667085] hover:bg-[#F8F7FC] hover:text-[#182033] transition-colors border border-[#EAECF0]"
            aria-label="Refresh analysis"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <main className="px-6 lg:px-8 py-8 max-w-4xl mx-auto space-y-6">

        {/* Error State */}
        {error ? (
          <div className="bg-white rounded-2xl border border-[#EAECF0] flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <AlertCircle size={36} className="text-[#F04438]" strokeWidth={1.5} />
            <h3 className="text-lg font-bold text-[#182033]">Failed to Load Analysis</h3>
            <p className="text-sm text-[#667085] max-w-md">{error}</p>
            <div className="flex gap-3 mt-3">
              <button
                onClick={fetchAll}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-[#6C3FF5] rounded-xl hover:bg-[#5B2FE0] transition-colors"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
              <Link
                to="/student/results"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-[#667085] bg-white border border-[#EAECF0] rounded-xl hover:bg-[#F8F7FC] transition-colors"
              >
                Back to My Results
              </Link>
            </div>
          </div>
        ) : loading ? (
          /* Loading Skeletons */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#EAECF0] p-6 animate-pulse space-y-4">
              <div className="h-5 bg-[#EAECF0] rounded w-1/3" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-[#EAECF0] rounded-xl" />
                ))}
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#EAECF0] p-6 animate-pulse space-y-3">
                <div className="h-4 bg-[#EAECF0] rounded w-3/4" />
                <div className="space-y-2 pt-2">
                  <div className="h-10 bg-[#EAECF0] rounded-lg" />
                  <div className="h-10 bg-[#EAECF0] rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* ── Summary Overview Banner ── */}
            <div className="bg-white rounded-3xl border border-[#EAECF0] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 pb-6 border-b border-[#EAECF0]">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-2"
                    style={{
                      backgroundColor: tone.bg,
                      color: tone.text,
                      borderColor: tone.border,
                    }}
                  >
                    
                    
                  </div>
                  <h2 className="text-2xl font-bold text-[#182033]">
                    Overall Score: {percentage}%
                  </h2>
                  <p className="text-sm text-[#667085] mt-1">
                    You earned <strong className="text-[#182033]">{obtainedMarks}</strong> out of{" "}
                    <strong>{totalMarks}</strong> total marks.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center px-5 py-3 rounded-2xl bg-[#F8F7FC] border border-[#EAECF0]">
                    <p className="text-xs text-[#98A2B3] uppercase tracking-wider font-semibold">Time Spent</p>
                    <p className="text-lg font-bold text-[#182033] mt-0.5 flex items-center justify-center gap-1.5">
                      <Clock size={16} className="text-[#6C3FF5]" />
                      {formatDuration(summary?.startTime, summary?.endTime)}
                    </p>
                  </div>
                  <div className="text-center px-5 py-3 rounded-2xl bg-[#F8F7FC] border border-[#EAECF0]">
                    <p className="text-xs text-[#98A2B3] uppercase tracking-wider font-semibold">Accuracy</p>
                    <p className="text-lg font-bold text-[#182033] mt-0.5 flex items-center justify-center gap-1.5">
                      <Target size={16} className="text-[#12B76A]" />
                      {accuracy}%
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#EAECF0]">
                  <p className="text-xs text-[#98A2B3] font-semibold uppercase">Total Questions</p>
                  <p className="text-2xl font-bold text-[#182033] mt-1">{totalQuestions}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#ECFDF3] border border-[#A6F4C5]">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#027A48] font-bold uppercase">Correct</p>
                    <CheckCircle2 size={16} className="text-[#12B76A]" />
                  </div>
                  <p className="text-2xl font-bold text-[#027A48] mt-1">{correctCount}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FEF3F2] border border-[#FECDCA]">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#B42318] font-bold uppercase">Incorrect</p>
                    <XCircle size={16} className="text-[#F04438]" />
                  </div>
                  <p className="text-2xl font-bold text-[#B42318] mt-1">{incorrectCount}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F2F4F7] border border-[#D0D5DD]">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#475467] font-bold uppercase">Skipped</p>
                    <HelpCircle size={16} className="text-[#667085]" />
                  </div>
                  <p className="text-2xl font-bold text-[#344054] mt-1">{skippedCount}</p>
                </div>
              </div>

              {/* Quick Question Navigation Palette */}
              {merged.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#98A2B3] mb-2.5">
                    Quick Question Navigator
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {merged.map((m, i) => {
                      let btnClass = "bg-[#F2F4F7] text-[#667085] hover:bg-[#E4E7EC]";
                      if (m.isCorrect) {
                        btnClass = "bg-[#ECFDF3] text-[#12B76A] border border-[#A6F4C5] hover:bg-[#D1FADF]";
                      } else if (m.answered && !m.isCorrect) {
                        btnClass = "bg-[#FEF3F2] text-[#F04438] border border-[#FECDCA] hover:bg-[#FEE4E2]";
                      }
                      return (
                        <button
                          key={m.question.id}
                          onClick={() => scrollToQuestion(m.question.id)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-transform hover:scale-105 active:scale-95 flex items-center justify-center ${btnClass}`}
                          title={`Question ${i + 1}: ${m.isCorrect ? "Correct" : m.answered ? "Incorrect" : "Skipped"}`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Filter Tabs ── */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 p-1 bg-white border border-[#EAECF0] rounded-xl shadow-2xs">
                <button
                  onClick={() => setActiveFilter("ALL")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeFilter === "ALL"
                      ? "bg-[#6C3FF5] text-white"
                      : "text-[#667085] hover:text-[#182033]"
                  }`}
                >
                  All ({totalQuestions})
                </button>
                <button
                  onClick={() => setActiveFilter("CORRECT")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeFilter === "CORRECT"
                      ? "bg-[#12B76A] text-white"
                      : "text-[#667085] hover:text-[#182033]"
                  }`}
                >
                  Correct ({correctCount})
                </button>
                <button
                  onClick={() => setActiveFilter("INCORRECT")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeFilter === "INCORRECT"
                      ? "bg-[#F04438] text-white"
                      : "text-[#667085] hover:text-[#182033]"
                  }`}
                >
                  Incorrect ({incorrectCount})
                </button>
                <button
                  onClick={() => setActiveFilter("SKIPPED")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeFilter === "SKIPPED"
                      ? "bg-[#475467] text-white"
                      : "text-[#667085] hover:text-[#182033]"
                  }`}
                >
                  Skipped ({skippedCount})
                </button>
              </div>

              <p className="text-xs text-[#98A2B3]">
                Showing {filteredMerged.length} of {totalQuestions} questions
              </p>
            </div>

            {/* ── Question Review Cards List ── */}
            {filteredMerged.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#EAECF0] py-16 text-center text-[#667085] space-y-2">
                <p className="text-sm font-semibold">No questions in this filter.</p>
                <button
                  onClick={() => setActiveFilter("ALL")}
                  className="text-xs font-bold text-[#6C3FF5] hover:underline"
                >
                  View All Questions
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMerged.map((m) => {
                  const originalIndex = merged.findIndex(
                    (item) => item.question.id === m.question.id
                  );
                  return (
                    <QuestionReviewCard
                      key={m.question.id}
                      index={originalIndex >= 0 ? originalIndex : 0}
                      merged={m}
                    />
                  );
                })}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="bg-white rounded-2xl border border-[#EAECF0] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                to="/student/results"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#667085] hover:text-[#182033] transition-colors"
              >
                <ChevronLeft size={16} />
                Back to My Results
              </Link>
              <Link
                to="/student/dashboard"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#6C3FF5] rounded-xl hover:bg-[#5B2FE0] transition-colors shadow-sm"
              >
                Back to Dashboard
                <ArrowRight size={15} />
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}