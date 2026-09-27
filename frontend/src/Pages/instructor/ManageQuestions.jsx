import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  ClipboardList,
  CheckCircle2,
  XCircle,
  CheckCheck,
  Edit2
} from "lucide-react";

import {
  getExamQuestions,
  addQuestionToExam,
  updateQuestion,
  deleteQuestion
} from "../../api/instructorService";

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white max-w-xs",
            t.type === "success" ? "bg-[#12B76A]" : "bg-[#F04438]",
          ].join(" ")}
        >
          {t.type === "success" ? (
            <CheckCircle2 size={15} strokeWidth={2} />
          ) : (
            <XCircle size={15} strokeWidth={2} />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Constants & Validation
// ---------------------------------------------------------------------------
const emptyOption = () => ({ optionText: "", correct: false });

const BLANK_FORM = {
  questionText:  "",
  questionType:  "MCQ",
  marks:         "",
  questionOrder: "",
  numericAnswer: "",
  options: [
    { optionText: "", correct: true  },
    { optionText: "", correct: false },
    { optionText: "", correct: false },
    { optionText: "", correct: false },
  ],
};

function validateForm(form) {
  const errors = {};
  if (!form.questionText.trim())
    errors.questionText = "Question text is required.";
  if (!form.marks || Number(form.marks) <= 0)
    errors.marks = "Marks must be greater than 0.";
  if (!form.questionOrder || Number(form.questionOrder) <= 0)
    errors.questionOrder = "Question order is required.";

  if (form.questionType === "NUMERIC") {
    if (form.numericAnswer === "" || form.numericAnswer === null || form.numericAnswer === undefined) {
      errors.numericAnswer = "Numeric answer is required.";
    }
  } else if (form.questionType === "MCQ") {
    const filled = form.options.filter((o) => o.optionText.trim());
    if (filled.length < 2)
      errors.options = "At least 2 options must have text.";
    const hasCorrect = form.options.some((o) => o.correct && o.optionText.trim());
    if (!hasCorrect)
      errors.options = "One option must be marked as correct.";
  }
  // For TRUE_FALSE, options are static so we assume valid.
  return errors;
}

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

// ---------------------------------------------------------------------------
// QuestionCard
// ---------------------------------------------------------------------------
function QuestionCard({ question, index, onEdit, onDelete }) {
  const qId = question.questionId || question.id;
  return (
    <div className="bg-white rounded-xl border border-[#EAECF0] p-4 space-y-3 relative group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F1EDFF] text-[#6C3FF5] text-xs font-semibold flex items-center justify-center">
            {question.questionOrder || index + 1}
          </span>
          <div>
            <p className="text-sm font-medium text-[#182033] leading-snug">
              {question.questionText}
            </p>
            <p className="text-xs text-gray-500 mt-1">Type: {question.questionType}</p>
          </div>
        </div>
        <span className="flex-shrink-0 text-xs text-[#98A2B3] bg-[#F8F7FC] border border-[#EAECF0] px-2 py-0.5 rounded-full">
          {question.marks} {question.marks === 1 ? "mark" : "marks"}
        </span>
      </div>

      {question.questionType === "NUMERIC" ? (
        <div className="pl-8 text-sm font-medium text-[#12B76A]">
          Answer: {question.numericAnswer}
        </div>
      ) : (
        Array.isArray(question.options) && question.options.length > 0 && (
          <ul className="space-y-1.5 pl-8">
            {question.options.map((opt, i) => (
              <li
                key={i}
                className={[
                  "flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5",
                  opt.correct || opt.isCorrect
                    ? "bg-[#ECFDF3] text-[#12B76A] font-medium"
                    : "text-[#667085]",
                ].join(" ")}
              >
                {(opt.correct || opt.isCorrect) && (
                  <CheckCheck size={12} strokeWidth={2.5} className="flex-shrink-0" />
                )}
                <span>
                  {OPTION_LABELS[i] ?? i + 1}. {opt.optionText}
                </span>
              </li>
            ))}
          </ul>
        )
      )}

      {/* Hover Actions */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white shadow-sm border border-gray-100 rounded-md p-1">
        <button onClick={() => onEdit(question)} className="p-1.5 text-gray-500 hover:text-[#6C3FF5] rounded" title="Edit">
          <Edit2 size={14} />
        </button>
        <button onClick={() => onDelete(qId)} className="p-1.5 text-gray-500 hover:text-[#F04438] rounded" title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function ManageQuestions() {
  const { id: examId } = useParams();

  const [questions, setQuestions]   = useState([]);
  const [qLoading, setQLoading]     = useState(true);
  const [qError, setQError]         = useState(null);

  const [form, setForm]             = useState(structuredClone(BLANK_FORM));
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState(null);
  const [isEditing, setIsEditing]   = useState(false);
  const [editingId, setEditingId]   = useState(null);

  const [toasts, setToasts]         = useState([]);
  const toastId                     = useRef(0);

  function addToast(message, type = "success") {
    const id = ++toastId.current;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }

  const fetchQuestions = useCallback(async () => {
    if (!examId) return;
    setQLoading(true);
    setQError(null);
    try {
      const data = await getExamQuestions(examId);
      // Some backends wrap in { data: [...] } others just return array
      const arr = Array.isArray(data) ? data : (data.data || []);
      setQuestions(arr);
    } catch {
      setQError("Unable to load questions. Please try again.");
    } finally {
      setQLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    if (!qLoading && questions.length >= 0 && !isEditing) {
      setForm((p) => ({
        ...p,
        questionOrder: String(questions.length + 1),
      }));
    }
  }, [questions.length, qLoading, isEditing]);

  // ── Form Handlers ────────────────────────────────────────────────────────
  function handleFieldChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: undefined }));
  }

  function handleTypeChange(e) {
    const newType = e.target.value;
    setForm(p => {
      let newOptions = p.options;
      if (newType === "TRUE_FALSE") {
        newOptions = [
          { optionText: "True", correct: true },
          { optionText: "False", correct: false }
        ];
      } else if (newType === "NUMERIC") {
        newOptions = [];
      } else if (newType === "MCQ") {
        newOptions = [
          { optionText: "", correct: true },
          { optionText: "", correct: false },
          { optionText: "", correct: false },
          { optionText: "", correct: false },
        ];
      }
      return { ...p, questionType: newType, options: newOptions, numericAnswer: "" };
    });
  }

  function handleOptionText(index, value) {
    setForm((p) => {
      const options = p.options.map((o, i) =>
        i === index ? { ...o, optionText: value } : o
      );
      return { ...p, options };
    });
    if (formErrors.options) setFormErrors((p) => ({ ...p, options: undefined }));
  }

  function handleCorrectChange(index) {
    setForm((p) => ({
      ...p,
      options: p.options.map((o, i) => ({ ...o, correct: i === index })),
    }));
    if (formErrors.options) setFormErrors((p) => ({ ...p, options: undefined }));
  }

  function addOption() {
    if (form.options.length >= 6) return;
    setForm((p) => ({ ...p, options: [...p.options, emptyOption()] }));
  }

  function removeOption(index) {
    if (form.options.length <= 2) return;
    setForm((p) => {
      const options = p.options.filter((_, i) => i !== index);
      const hasCorrect = options.some((o) => o.correct);
      if (!hasCorrect && options.length > 0) options[0].correct = true;
      return { ...p, options };
    });
  }

  function resetForm() {
    setIsEditing(false);
    setEditingId(null);
    setForm({
      ...structuredClone(BLANK_FORM),
      questionOrder: String(questions.length + 1),
    });
    setFormErrors({});
    setSaveError(null);
  }

  // ── Actions ──────────────────────────────────────────────────────────────
  function editQuestion(q) {
    setIsEditing(true);
    setEditingId(q.questionId || q.id);
    
    // Normalize options from backend (might use isCorrect instead of correct)
    const opts = (q.options || []).map(o => ({
      optionText: o.optionText,
      correct: o.isCorrect !== undefined ? o.isCorrect : o.correct
    }));

    setForm({
      questionText: q.questionText || "",
      questionType: q.questionType || "MCQ",
      marks: q.marks || "",
      questionOrder: q.questionOrder || "",
      numericAnswer: q.numericAnswer ?? "",
      options: opts
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(qId) {
    if (!window.confirm("Delete this question?")) return;
    try {
      await deleteQuestion(qId);
      addToast("Question deleted", "success");
      fetchQuestions();
      if (isEditing && editingId === qId) resetForm();
    } catch (err) {
      addToast("Failed to delete question", "error");
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveError(null);

    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        questionText:  form.questionText.trim(),
        questionType:  form.questionType,
        marks:         Number(form.marks),
        questionOrder: Number(form.questionOrder),
        numericAnswer: form.questionType === "NUMERIC" ? Number(form.numericAnswer) : null,
        options: form.questionType === "NUMERIC" ? [] : form.options
          .filter((o) => o.optionText.trim())
          .map((o) => ({
            optionText: o.optionText.trim(),
            isCorrect:  o.correct,
          })),
      };

      if (isEditing) {
        await updateQuestion(editingId, payload);
        addToast("Question updated successfully.", "success");
      } else {
        await addQuestionToExam(examId, payload);
        addToast("Question saved successfully.", "success");
      }
      
      await fetchQuestions();
      resetForm();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save question. Please try again.";
      setSaveError(msg);
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 min-h-screen bg-[#F8F7FC]">
      <Toast toasts={toasts} />

      <header className="sticky top-0 z-30 bg-white border-b border-[#EAECF0] px-6 lg:px-8 h-16 flex items-center gap-3">
        <Link
          to={`/instructor/exams/${examId}`}
          className="p-1.5 rounded-lg text-[#667085] hover:bg-[#F8F7FC] hover:text-[#182033] transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-[#182033] truncate">
            Manage Questions
          </h1>
          <p className="text-xs text-[#98A2B3] hidden sm:block">Exam ID: {examId}</p>
        </div>
        <button
          onClick={fetchQuestions}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#667085] border border-[#EAECF0] rounded-lg hover:bg-[#F8F7FC] transition-colors"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      <main className="px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col xl:flex-row gap-6 items-start">

          {/* LEFT / TOP — Question list */}
          <div className="w-full xl:w-[45%] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#182033]">Questions</h2>
                <p className="text-xs text-[#98A2B3] mt-0.5">
                  {qLoading ? "Loading…" : `${questions.length} questions added`}
                </p>
              </div>
            </div>

            {qLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-[#EAECF0] p-4 animate-pulse h-24" />
                ))}
              </div>
            ) : qError ? (
              <div className="bg-white rounded-xl border border-[#EAECF0] flex flex-col items-center py-10 gap-3">
                <AlertCircle size={28} className="text-[#F04438]" />
                <p className="text-sm text-[#667085]">{qError}</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#EAECF0] flex flex-col items-center py-14 gap-3 text-center px-6">
                <ClipboardList size={22} className="text-[#98A2B3]" />
                <div>
                  <p className="text-sm font-medium text-[#667085]">No questions yet</p>
                  <p className="text-xs text-[#98A2B3] mt-1">Use the form to add your first question.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <QuestionCard 
                    key={q.questionId || q.id || i} 
                    question={q} 
                    index={i} 
                    onEdit={editQuestion}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT / BOTTOM — Form */}
          <div className="w-full xl:flex-1 xl:sticky xl:top-24">
            <div className="bg-white rounded-2xl border border-[#EAECF0] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#EAECF0] bg-[#F8F7FC] flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#182033]">
                    {isEditing ? "Edit Question" : "Add New Question"}
                  </h2>
                </div>
                {isEditing && (
                  <button onClick={resetForm} className="text-xs text-[#6C3FF5] hover:underline">Cancel Edit</button>
                )}
              </div>

              <form onSubmit={handleSave} noValidate>
                <div className="px-6 py-5 space-y-5">
                  {saveError && (
                    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] text-sm text-[#B42318]">
                      <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                      {saveError}
                    </div>
                  )}

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-[#344054] mb-1.5">Question Type</label>
                    <select
                      name="questionType"
                      value={form.questionType}
                      onChange={handleTypeChange}
                      disabled={saving}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#EAECF0] bg-white focus:outline-none focus:border-[#6C3FF5]"
                    >
                      <option value="MCQ">Multiple Choice</option>
                      <option value="TRUE_FALSE">True / False</option>
                      <option value="NUMERIC">Numeric Answer</option>
                    </select>
                  </div>

                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-medium text-[#344054] mb-1.5">
                      Question Text <span className="text-[#F04438]">*</span>
                    </label>
                    <textarea
                      name="questionText"
                      rows={3}
                      value={form.questionText}
                      onChange={handleFieldChange}
                      disabled={saving}
                      className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white resize-none focus:outline-none focus:border-[#6C3FF5] ${formErrors.questionText ? "border-[#F04438]" : "border-[#EAECF0]"}`}
                    />
                    {formErrors.questionText && <p className="mt-1 text-xs text-[#F04438]">{formErrors.questionText}</p>}
                  </div>

                  {/* Marks + Order */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#344054] mb-1.5">
                        Marks <span className="text-[#F04438]">*</span>
                      </label>
                      <input
                        name="marks"
                        type="number"
                        min={1}
                        value={form.marks}
                        onChange={handleFieldChange}
                        disabled={saving}
                        className={`w-full px-3.5 py-2.5 text-sm rounded-lg border focus:outline-none focus:border-[#6C3FF5] ${formErrors.marks ? "border-[#F04438]" : "border-[#EAECF0]"}`}
                      />
                      {formErrors.marks && <p className="mt-1 text-xs text-[#F04438]">{formErrors.marks}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#344054] mb-1.5">
                        Order <span className="text-[#F04438]">*</span>
                      </label>
                      <input
                        name="questionOrder"
                        type="number"
                        min={1}
                        value={form.questionOrder}
                        onChange={handleFieldChange}
                        disabled={saving}
                        className={`w-full px-3.5 py-2.5 text-sm rounded-lg border focus:outline-none focus:border-[#6C3FF5] ${formErrors.questionOrder ? "border-[#F04438]" : "border-[#EAECF0]"}`}
                      />
                      {formErrors.questionOrder && <p className="mt-1 text-xs text-[#F04438]">{formErrors.questionOrder}</p>}
                    </div>
                  </div>

                  {/* Answers Section based on Type */}
                  {form.questionType === "NUMERIC" ? (
                    <div>
                      <label className="block text-sm font-medium text-[#344054] mb-1.5">
                        Correct Answer (Numeric) <span className="text-[#F04438]">*</span>
                      </label>
                      <input
                        name="numericAnswer"
                        type="number"
                        value={form.numericAnswer}
                        onChange={handleFieldChange}
                        disabled={saving}
                        className={`w-full px-3.5 py-2.5 text-sm rounded-lg border focus:outline-none focus:border-[#6C3FF5] ${formErrors.numericAnswer ? "border-[#F04438]" : "border-[#EAECF0]"}`}
                      />
                      {formErrors.numericAnswer && <p className="mt-1 text-xs text-[#F04438]">{formErrors.numericAnswer}</p>}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-[#344054]">
                          Answer Options <span className="text-[#F04438]">*</span>
                        </label>
                        <span className="text-xs text-[#98A2B3]">Select the correct answer</span>
                      </div>
                      
                      <div className="space-y-2">
                        {form.options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="correctOption"
                              checked={opt.correct}
                              onChange={() => handleCorrectChange(i)}
                              disabled={saving}
                              className="w-4 h-4 text-[#6C3FF5] focus:ring-[#6C3FF5] cursor-pointer"
                            />
                            
                            {form.questionType === "TRUE_FALSE" ? (
                              <div className={`flex-1 px-3 py-2 text-sm rounded-lg border ${opt.correct ? "border-[#6C3FF5] bg-[#F8F6FF]" : "border-[#EAECF0] bg-gray-50"}`}>
                                {opt.optionText}
                              </div>
                            ) : (
                              <>
                                <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center ${opt.correct ? "bg-[#6C3FF5] text-white" : "bg-[#F2F4F7] text-[#667085]"}`}>
                                  {OPTION_LABELS[i] ?? i + 1}
                                </span>
                                <input
                                  type="text"
                                  placeholder={`Option ${OPTION_LABELS[i] ?? i + 1}`}
                                  value={opt.optionText}
                                  onChange={(e) => handleOptionText(i, e.target.value)}
                                  disabled={saving}
                                  className={`flex-1 px-3 py-2 text-sm rounded-lg border focus:outline-none focus:border-[#6C3FF5] ${opt.correct ? "border-[#6C3FF5] bg-[#F8F6FF]" : "border-[#EAECF0]"}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeOption(i)}
                                  disabled={form.options.length <= 2 || saving}
                                  className="flex-shrink-0 p-1.5 rounded-lg text-[#98A2B3] hover:text-[#F04438] disabled:opacity-30"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      {formErrors.options && <p className="mt-2 text-xs text-[#F04438]">{formErrors.options}</p>}
                      
                      {form.questionType === "MCQ" && form.options.length < 6 && (
                        <button
                          type="button"
                          onClick={addOption}
                          disabled={saving}
                          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#6C3FF5] hover:text-[#5B2FE0] disabled:opacity-50"
                        >
                          <Plus size={13} /> Add Option
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 border-t border-[#EAECF0] bg-[#F8F7FC] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="px-4 py-2.5 text-sm font-medium text-[#667085] bg-white border border-[#EAECF0] rounded-lg hover:bg-gray-50"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#6C3FF5] rounded-lg hover:bg-[#5B2FE0] disabled:opacity-60"
                  >
                    {saving && <Loader2 size={15} className="animate-spin" />}
                    {saving ? "Saving…" : (isEditing ? "Update Question" : "Save Question")}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}