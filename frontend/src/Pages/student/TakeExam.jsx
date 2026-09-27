import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import {
  Clock,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Loader2,
  Send,
  X,
  ClipboardList,
} from "lucide-react";
 
import {
  getPublishedExams,
  getExamQuestions,
  saveResponse,
  submitExam,
} from "../../api/studentService";
 
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatTime(totalSeconds) {
  if (totalSeconds == null || totalSeconds < 0) return "--:--";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
 
// Shallow-compare two response drafts to know if a question's answer
// currently matches what was last saved to the server.
function answersEqual(a, b) {
  if (!a || !b) return false;
  return a.selectedOptionId === b.selectedOptionId && a.answerText === b.answerText;
}
 
// ---------------------------------------------------------------------------
// ConfirmSubmitModal
// ---------------------------------------------------------------------------
function ConfirmSubmitModal({ unsavedCount, onCancel, onConfirm, submitting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={submitting ? undefined : onCancel} />
      <div className="relative bg-white rounded-2xl border border-[#EAECF0] shadow-xl max-w-sm w-full p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold text-[#182033]">
            Submit Exam?
          </h3>
          {!submitting && (
            <button
              onClick={onCancel}
              className="text-[#98A2B3] hover:text-[#182033] p-1 -m-1"
              aria-label="Cancel"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <p className="text-sm text-[#667085] leading-relaxed">
          Once submitted, you will not be able to change any answers.
          {unsavedCount > 0 && (
            <span className="block mt-2 text-[#F79009] font-medium">
              You have {unsavedCount} unsaved {unsavedCount === 1 ? "answer" : "answers"}.
              These will not be counted unless you save them first.
            </span>
          )}
        </p>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2.5 text-sm font-medium text-[#667085] bg-white border border-[#EAECF0] rounded-lg hover:bg-[#F8F7FC] disabled:opacity-50 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#F04438] rounded-lg hover:bg-[#D92D20] disabled:opacity-60 transition-colors"
          >
            {submitting && <Loader2 size={14} className="animate-spin" strokeWidth={2} />}
            {submitting ? "Submitting…" : "Submit Exam"}
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ---------------------------------------------------------------------------
// QuestionCard — renders one question with its own local answer + save state
// ---------------------------------------------------------------------------
function QuestionCard({ index, question, draft, isSaved, saving, error, onChange, onSave }) {
  const isChoiceType =
    question.questionType === "MCQ" || question.questionType === "TRUE_FALSE";
 
  return (
    <div
      className={[
        "bg-white rounded-2xl border p-6 transition-colors duration-200",
        isSaved ? "border-[#12B76A]" : "border-[#EAECF0]",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#F1EDFF] text-[#6C3FF5] text-xs font-semibold flex items-center justify-center mt-0.5">
            {index + 1}
          </span>
          <p className="text-sm font-medium text-[#182033] leading-relaxed pt-1">
            {question.questionText}
          </p>
        </div>
        <span className="flex-shrink-0 text-xs text-[#98A2B3] bg-[#F8F7FC] border border-[#EAECF0] px-2.5 py-1 rounded-full whitespace-nowrap">
          {question.marks} {question.marks === 1 ? "mark" : "marks"}
        </span>
      </div>
 
      {/* Answer input */}
      <div className="pl-10 space-y-4">
        {isChoiceType ? (
          <div className="space-y-2">
            {(question.options || []).map((opt) => (
              <label
                key={opt.id}
                className={[
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg border cursor-pointer transition-colors",
                  draft.selectedOptionId === opt.id
                    ? "border-[#6C3FF5] bg-[#F8F6FF]"
                    : "border-[#EAECF0] hover:bg-[#F8F7FC]",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={draft.selectedOptionId === opt.id}
                  onChange={() =>
                    onChange(question.id, { selectedOptionId: opt.id, answerText: null })
                  }
                  className="w-4 h-4 text-[#6C3FF5] border-[#EAECF0] focus:ring-[#6C3FF5] cursor-pointer flex-shrink-0"
                />
                <span className="text-sm text-[#182033]">{opt.optionText}</span>
              </label>
            ))}
          </div>
        ) : (
          /* INTEGER */
          <input
            type="number"
            placeholder="Enter your answer"
            value={draft.answerText ?? ""}
            onChange={(e) =>
              onChange(question.id, { selectedOptionId: null, answerText: e.target.value })
            }
            className="w-full max-w-xs px-3.5 py-2.5 text-sm rounded-lg border border-[#EAECF0] bg-white text-[#182033] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#6C3FF5]/40 focus:border-[#6C3FF5] transition-colors"
          />
        )}
 
        {/* Per-question error */}
        {error && (
          <p className="text-xs text-[#F04438] flex items-center gap-1">
            <AlertCircle size={12} strokeWidth={2} />
            {error}
          </p>
        )}
 
        {/* Save Answer button */}
        <div>
          <button
            type="button"
            onClick={() => onSave(question)}
            disabled={saving || isAnswerEmpty(draft)}
            className={[
              "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              isSaved
                ? "text-[#12B76A] bg-[#ECFDF3] hover:bg-[#D1FAE5]"
                : "text-white bg-[#6C3FF5] hover:bg-[#5B2FE0]",
            ].join(" ")}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" strokeWidth={2} />
                Saving…
              </>
            ) : isSaved ? (
              <>
                <CheckCircle2 size={14} strokeWidth={2} />
                Saved
              </>
            ) : (
              "Save Answer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
 
function isAnswerEmpty(draft) {
  return (
    (draft.selectedOptionId === null || draft.selectedOptionId === undefined) &&
    (draft.answerText === null || draft.answerText === undefined || draft.answerText === "")
  );
}
 
// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function TakeExam() {
  const { examId } = useParams();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const location = useLocation();
  const navigate = useNavigate();
 
  // ── Exam metadata (title/duration) ────────────────────────────────────
  const [exam, setExam] = useState(location.state?.exam ?? null);
  const [examLoading, setExamLoading] = useState(!location.state?.exam);
  const [examError, setExamError] = useState(null);
 
  // ── Questions ──────────────────────────────────────────────────────────
  const [questions, setQuestions]     = useState([]);
  const [qLoading, setQLoading]       = useState(true);
  const [qError, setQError]           = useState(null);
 
  // ── Per-question answer state ─────────────────────────────────────────
  // draft answers (what the student currently has selected/typed)
  const [answers, setAnswers] = useState({});
  // last successfully saved payload per question
  const [savedAnswers, setSavedAnswers] = useState({});
  // per-question saving / error state
  const [savingId, setSavingId] = useState(null);
  const [saveErrors, setSaveErrors] = useState({});
 
  // ── Timer ──────────────────────────────────────────────────────────────
  const [secondsLeft, setSecondsLeft] = useState(null);
  const autoSubmittedRef = useRef(false);
 
  // ── Submit ─────────────────────────────────────────────────────────────
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState(null);
 
  // ── Guard: missing attemptId ───────────────────────────────────────────
  useEffect(() => {
    if (!attemptId) {
      setSubmitError(
        "Missing attempt information. Please restart the exam from your dashboard."
      );
    }
  }, [attemptId]);
 
  // ── Fetch exam metadata (fallback if not passed via router state) ─────
  const fetchExamMeta = useCallback(async () => {
    setExamLoading(true);
    setExamError(null);
    try {
      const all = await getPublishedExams();
      const found = (Array.isArray(all) ? all : []).find(
        (e) => String(e.id) === String(examId)
      );
      if (!found) {
        setExamError("This exam could not be found.");
      } else {
        setExam(found);
      }
    } catch {
      setExamError("Unable to load exam details.");
    } finally {
      setExamLoading(false);
    }
  }, [examId]);
 
  useEffect(() => {
    if (!exam) fetchExamMeta();
  }, [exam, fetchExamMeta]);
 
  // ── Fetch questions ─────────────────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    setQLoading(true);
    setQError(null);
    try {
      const data = await getExamQuestions(examId);
      setQuestions(Array.isArray(data) ? data : []);
    } catch {
      setQError("Unable to load questions. Please try again.");
    } finally {
      setQLoading(false);
    }
  }, [examId]);
 
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);
 
  // ── Initialize timer once exam duration is known ───────────────────────
  useEffect(() => {
    if (exam?.examDuration != null && secondsLeft === null) {
      setSecondsLeft(exam.examDuration * 60);
    }
  }, [exam, secondsLeft]);
 
  // ── Submit handler (defined before the timer effect that calls it) ────
  const handleSubmit = useCallback(
    async (auto = false) => {
      if (!attemptId || submitting) return;
      setSubmitting(true);
      setSubmitError(null);
      try {
        const result = await submitExam(attemptId);
        navigate("/student/result", {
          replace: true,
          // examId is included so ExamResult can link into
          // /student/analysis/:attemptId/:examId (the detailed review page).
          state: { result, examTitle: exam?.examTitle, examId },
        });
      } catch {
        setSubmitError(
          auto
            ? "Time's up, but we couldn't submit automatically. Please try submitting manually."
            : "Failed to submit exam. Please try again."
        );
        setSubmitting(false);
        setShowConfirm(false);
      }
    },
    [attemptId, submitting, exam, examId, navigate]
  );
 
  // ── Countdown tick ──────────────────────────────────────────────────────
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      if (!autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        handleSubmit(true); // auto-submit, skip confirmation
      }
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s !== null ? s - 1 : s));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, handleSubmit]);
 
  // ── Answer change (local only — no API call) ───────────────────────────
  function handleAnswerChange(questionId, partial) {
    setAnswers((prev) => ({ ...prev, [questionId]: partial }));
    if (saveErrors[questionId]) {
      setSaveErrors((prev) => ({ ...prev, [questionId]: undefined }));
    }
  }
 
  // ── Save a single question's answer ────────────────────────────────────
  async function handleSaveAnswer(question) {
    const draft = answers[question.id];
    if (!draft || isAnswerEmpty(draft)) return;
 
    setSavingId(question.id);
    setSaveErrors((prev) => ({ ...prev, [question.id]: undefined }));
 
    const payload = {
      questionId: question.id,
      selectedOptionId: draft.selectedOptionId ?? null,
      answerText:
        draft.answerText !== null && draft.answerText !== undefined && draft.answerText !== ""
          ? String(draft.answerText)
          : null,
    };
 
    try {
      await saveResponse(attemptId, payload);
      setSavedAnswers((prev) => ({ ...prev, [question.id]: payload }));
    } catch {
      setSaveErrors((prev) => ({
        ...prev,
        [question.id]: "Failed to save. Please try again.",
      }));
    } finally {
      setSavingId(null);
    }
  }
 
  // ── Derived: unsaved answer count for the confirm modal ─────────────────
  const unsavedCount = useMemo(() => {
    return Object.keys(answers).filter((qid) => {
      const draft = answers[qid];
      if (isAnswerEmpty(draft)) return false;
      return !answersEqual(draft, savedAnswers[qid]);
    }).length;
  }, [answers, savedAnswers]);
 
  // ── Timer visual state ───────────────────────────────────────────────────
  const timerTone =
    secondsLeft === null
      ? "text-[#182033]"
      : secondsLeft <= 60
      ? "text-[#F04438] animate-pulse"
      : secondsLeft <= 300
      ? "text-[#F79009]"
      : "text-[#182033]";
 
  // ── Loading / error gates ────────────────────────────────────────────────
  const initialLoading = examLoading || qLoading;
 
  return (
    <div className="min-h-screen bg-[#F8F7FC]">
 
      {/* ── Sticky header: title + timer ───────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#EAECF0] px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-[#182033] truncate">
            {exam?.examTitle ?? (examLoading ? "Loading exam…" : "Exam")}
          </h1>
          <p className="text-xs text-[#98A2B3] hidden sm:block">
            Answer each question, then click "Save Answer" before moving on.
          </p>
        </div>
 
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F8F7FC] border border-[#EAECF0] font-mono text-lg font-semibold tabular-nums ${timerTone}`}
        >
          <Clock size={18} strokeWidth={2} />
          {formatTime(secondsLeft)}
        </div>
      </header>
 
      <main className="px-6 lg:px-8 py-8 max-w-3xl mx-auto space-y-5">
 
        {/* ── Submit-level error ──────────────────────────────────────── */}
        {submitError && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] text-sm text-[#B42318]">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" strokeWidth={2} />
            {submitError}
          </div>
        )}
 
        {/* ── Exam meta error (fallback fetch failed) ────────────────────── */}
        {examError && (
          <div className="bg-white rounded-2xl border border-[#EAECF0] flex flex-col items-center justify-center py-10 gap-3">
            <AlertCircle size={28} className="text-[#F04438]" strokeWidth={1.5} />
            <p className="text-sm text-[#667085]">{examError}</p>
            <button
              onClick={fetchExamMeta}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#6C3FF5] border border-[#6C3FF5] rounded-lg hover:bg-[#F1EDFF] transition-colors"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}
 
        {/* ── Questions ──────────────────────────────────────────────── */}
        {qLoading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#EAECF0] p-6 animate-pulse space-y-4"
              >
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#EAECF0] flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-[#EAECF0] rounded w-4/5" />
                    <div className="h-3.5 bg-[#EAECF0] rounded w-3/5" />
                  </div>
                </div>
                <div className="pl-10 space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-9 bg-[#EAECF0] rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : qError ? (
          <div className="bg-white rounded-2xl border border-[#EAECF0] flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle size={32} className="text-[#F04438]" strokeWidth={1.5} />
            <p className="text-sm font-medium text-[#182033]">{qError}</p>
            <button
              onClick={fetchQuestions}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#6C3FF5] border border-[#6C3FF5] rounded-lg hover:bg-[#F1EDFF] transition-colors"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EAECF0] flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-[#F8F7FC] flex items-center justify-center">
              <ClipboardList size={22} className="text-[#98A2B3]" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-[#667085]">
              This exam has no questions yet.
            </p>
          </div>
        ) : (
          <>
            {questions.map((question, index) => {
              const draft = answers[question.id] ?? {
                selectedOptionId: null,
                answerText: "",
              };
              const saved = answersEqual(draft, savedAnswers[question.id]);
 
              return (
                <QuestionCard
                  key={question.id}
                  index={index}
                  question={question}
                  draft={draft}
                  isSaved={saved}
                  saving={savingId === question.id}
                  error={saveErrors[question.id]}
                  onChange={handleAnswerChange}
                  onSave={handleSaveAnswer}
                />
              );
            })}
 
            {/* ── Submit Exam ─────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-[#EAECF0] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#182033]">
                  Ready to finish?
                </p>
                <p className="text-xs text-[#98A2B3] mt-0.5">
                  Make sure you've saved every answer before submitting.
                </p>
              </div>
              <button
                onClick={() => setShowConfirm(true)}
                disabled={submitting || !attemptId}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#6C3FF5] rounded-xl hover:bg-[#5B2FE0] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} strokeWidth={2} />
                Submit Exam
              </button>
            </div>
          </>
        )}
      </main>
 
      {/* ── Confirmation modal ────────────────────────────────────────── */}
      {showConfirm && (
        <ConfirmSubmitModal
          unsavedCount={unsavedCount}
          submitting={submitting}
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => handleSubmit(false)}
        />
      )}
    </div>
  );
}
 