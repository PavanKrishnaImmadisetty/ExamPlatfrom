/**
 * CreateExam.jsx
 *
 * Step 1 — Create an exam shell via POST /api/exams.
 *
 * Fields (backend field names used exactly):
 *   examTitle, examDescription, examDate,
 *   examStartTime, examEndTime, examDuration, marks
 *
 * questions is always sent as [] — questions are added in ManageQuestions.
 *
 * On success: navigate to /instructor/dashboard
 * (backend returns a plain string, not the new exam's ID)
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { createExam } from "../../api/instructorService";

// ---------------------------------------------------------------------------
// Field components — keep styling consistent with design system
// ---------------------------------------------------------------------------
function Label({ htmlFor, children, required }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-[#344054] mb-1.5"
    >
      {children}
      {required && <span className="text-[#F04438] ml-0.5">*</span>}
    </label>
  );
}

function Input({ id, error, className = "", ...props }) {
  return (
    <input
      id={id}
      className={[
        "w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-[#182033]",
        "placeholder:text-[#98A2B3]",
        "focus:outline-none focus:ring-2 focus:ring-[#6C3FF5]/40 focus:border-[#6C3FF5]",
        "disabled:bg-[#F9FAFB] disabled:cursor-not-allowed",
        "transition-colors",
        error ? "border-[#F04438]" : "border-[#EAECF0]",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

function Textarea({ id, error, className = "", ...props }) {
  return (
    <textarea
      id={id}
      rows={3}
      className={[
        "w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-[#182033] resize-none",
        "placeholder:text-[#98A2B3]",
        "focus:outline-none focus:ring-2 focus:ring-[#6C3FF5]/40 focus:border-[#6C3FF5]",
        "transition-colors",
        error ? "border-[#F04438]" : "border-[#EAECF0]",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-[#F04438] flex items-center gap-1">
      <AlertCircle size={12} strokeWidth={2} />
      {message}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Initial form state — field names match backend exactly
// ---------------------------------------------------------------------------
const INITIAL = {
  examTitle:       "",
  examDescription: "",
  examDate:        "",
  examStartTime:   "",
  examEndTime:     "",
  examDuration:    "",
  marks:           "",
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
function validate(form) {
  const errors = {};
  if (!form.examTitle.trim())
    errors.examTitle = "Exam title is required.";
  if (!form.examDate)
    errors.examDate = "Exam date is required.";
  if (!form.examStartTime)
    errors.examStartTime = "Start time is required.";
  if (!form.examEndTime)
    errors.examEndTime = "End time is required.";
  if (form.examStartTime && form.examEndTime && form.examStartTime >= form.examEndTime)
    errors.examEndTime = "End time must be after start time.";
  if (!form.examDuration || Number(form.examDuration) <= 0)
    errors.examDuration = "Duration must be greater than 0.";
  if (!form.marks || Number(form.marks) <= 0)
    errors.marks = "Total marks must be greater than 0.";
  return errors;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function CreateExam() {
  const navigate = useNavigate();
  const [form, setForm]     = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((p) => ({ ...p, [name]: undefined }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);

    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await createExam({
        examTitle:       form.examTitle.trim(),
        examDescription: form.examDescription.trim(),
        examDate:        `${form.examDate}T00:00:00`,
        examStartTime:   `${form.examDate}T${form.examStartTime}:00`,
        examEndTime:     `${form.examDate}T${form.examEndTime}:00`,
        examDuration:    Number(form.examDuration),
        marks:           Number(form.marks),
        questions:       [],
      });
      // Backend returns a plain string — navigate back to dashboard.
      // The new exam will appear in the list; instructor can then click
      // "Manage Questions" on it.
      navigate("/instructor/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to create exam. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 min-h-screen bg-[#F8F7FC]">

      {/* ── Topbar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#EAECF0] px-6 lg:px-8 h-16 flex items-center gap-3">
        <Link
          to="/instructor/dashboard"
          className="p-1.5 rounded-lg text-[#667085] hover:bg-[#F8F7FC] hover:text-[#182033] transition-colors"
          aria-label="Back to dashboard"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-[#182033]">Create Exam</h1>
          <p className="text-xs text-[#98A2B3] hidden sm:block">
            Fill in the exam details below.
          </p>
        </div>
      </header>

      {/* ── Form ────────────────────────────────────────────────────────── */}
      <main className="px-6 lg:px-8 py-8 max-w-2xl mx-auto">

        {/* Page header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#182033]">New Exam</h2>
          <p className="text-sm text-[#667085] mt-1">
            You can add questions after creating the exam.
          </p>
        </div>

        {/* Submit-level error */}
        {submitError && (
          <div className="mb-6 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] text-sm text-[#B42318]">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" strokeWidth={2} />
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-white rounded-2xl border border-[#EAECF0] divide-y divide-[#EAECF0]">

            {/* ── Section: Basic Info ──────────────────────────────────── */}
            <div className="px-6 py-6 space-y-5">
              <h3 className="text-sm font-semibold text-[#182033]">
                Basic Information
              </h3>

              {/* Exam Title */}
              <div>
                <Label htmlFor="examTitle" required>
                  Exam Title
                </Label>
                <Input
                  id="examTitle"
                  name="examTitle"
                  type="text"
                  placeholder="e.g. Midterm Examination — Spring 2025"
                  value={form.examTitle}
                  onChange={handleChange}
                  error={errors.examTitle}
                  disabled={submitting}
                  maxLength={200}
                />
                <FieldError message={errors.examTitle} />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="examDescription">Description</Label>
                <Textarea
                  id="examDescription"
                  name="examDescription"
                  placeholder="Optional — brief description or instructions for students."
                  value={form.examDescription}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* ── Section: Schedule ───────────────────────────────────── */}
            <div className="px-6 py-6 space-y-5">
              <h3 className="text-sm font-semibold text-[#182033]">Schedule</h3>

              {/* Date */}
              <div>
                <Label htmlFor="examDate" required>
                  Exam Date
                </Label>
                <Input
                  id="examDate"
                  name="examDate"
                  type="date"
                  value={form.examDate}
                  onChange={handleChange}
                  error={errors.examDate}
                  disabled={submitting}
                  min={new Date().toLocaleDateString('en-CA')}
                />
                <FieldError message={errors.examDate} />
              </div>

              {/* Start / End time — side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="examStartTime" required>
                    Start Time
                  </Label>
                  <Input
                    id="examStartTime"
                    name="examStartTime"
                    type="time"
                    value={form.examStartTime}
                    onChange={handleChange}
                    error={errors.examStartTime}
                    disabled={submitting}
                  />
                  <FieldError message={errors.examStartTime} />
                </div>
                <div>
                  <Label htmlFor="examEndTime" required>
                    End Time
                  </Label>
                  <Input
                    id="examEndTime"
                    name="examEndTime"
                    type="time"
                    value={form.examEndTime}
                    onChange={handleChange}
                    error={errors.examEndTime}
                    disabled={submitting}
                  />
                  <FieldError message={errors.examEndTime} />
                </div>
              </div>
            </div>

            {/* ── Section: Exam Config ─────────────────────────────────── */}
            <div className="px-6 py-6 space-y-5">
              <h3 className="text-sm font-semibold text-[#182033]">
                Configuration
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Duration */}
                <div>
                  <Label htmlFor="examDuration" required>
                    Duration (minutes)
                  </Label>
                  <Input
                    id="examDuration"
                    name="examDuration"
                    type="number"
                    placeholder="e.g. 90"
                    min={1}
                    max={480}
                    value={form.examDuration}
                    onChange={handleChange}
                    error={errors.examDuration}
                    disabled={submitting}
                  />
                  <FieldError message={errors.examDuration} />
                </div>

                {/* Total Marks */}
                <div>
                  <Label htmlFor="marks" required>
                    Total Marks
                  </Label>
                  <Input
                    id="marks"
                    name="marks"
                    type="number"
                    placeholder="e.g. 100"
                    min={1}
                    value={form.marks}
                    onChange={handleChange}
                    error={errors.marks}
                    disabled={submitting}
                  />
                  <FieldError message={errors.marks} />
                </div>
              </div>
            </div>

            {/* ── Actions ─────────────────────────────────────────────── */}
            <div className="px-6 py-5 flex items-center justify-end gap-3 bg-[#F8F7FC] rounded-b-2xl">
              <Link
                to="/instructor/dashboard"
                className="px-4 py-2.5 text-sm font-medium text-[#667085] bg-white border border-[#EAECF0] rounded-lg hover:bg-[#F8F7FC] transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#6C3FF5] rounded-lg hover:bg-[#5B2FE0] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting && (
                  <Loader2 size={15} className="animate-spin" strokeWidth={2} />
                )}
                {submitting ? "Creating…" : "Create Exam"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}