import { useLocation, Link } from "react-router-dom";
import { Trophy, ArrowRight, ClipboardList, PartyPopper } from "lucide-react";
 
// ---------------------------------------------------------------------------
// Score → qualitative label + color, purely presentational
// ---------------------------------------------------------------------------
function getScoreTone(percentage) {
  if (percentage >= 85) {
    return {
      label: "Excellent work!",
      ring: "#12B76A",
      bg: "#ECFDF3",
      text: "#12B76A",
    };
  }
  if (percentage >= 60) {
    return {
      label: "Good job!",
      ring: "#6C3FF5",
      bg: "#F1EDFF",
      text: "#6C3FF5",
    };
  }
  if (percentage >= 40) {
    return {
      label: "Keep practicing.",
      ring: "#F79009",
      bg: "#FFF4ED",
      text: "#F79009",
    };
  }
  return {
    label: "Room to improve.",
    ring: "#F04438",
    bg: "#FEF3F2",
    text: "#F04438",
  };
}
 
// ---------------------------------------------------------------------------
// Circular score ring — pure SVG, no dependency
// ---------------------------------------------------------------------------
function ScoreRing({ percentage, color }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
 
  return (
    <svg width={168} height={168} viewBox="0 0 168 168" className="-rotate-90">
      {/* Track */}
      <circle
        cx={84}
        cy={84}
        r={radius}
        fill="none"
        stroke="#EAECF0"
        strokeWidth={12}
      />
      {/* Progress */}
      <circle
        cx={84}
        cy={84}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={12}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
      />
    </svg>
  );
}
 
// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ExamResult() {
  const location = useLocation();
  const result = location.state?.result;
  const examTitle = location.state?.examTitle;
  const examId = location.state?.examId;
  // result.id is the attemptId returned by submitExam()
  const attemptId = result?.id;
  const resolvedExamId = examId || result?.examId;

  // ── Fallback: no result data available ──────────────────────────────────
  if (!result) {
    return (
      <div className="flex-1 min-h-screen bg-[#F8F7FC] flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl border border-[#EAECF0] p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F8F7FC] flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={26} className="text-[#98A2B3]" strokeWidth={1.5} />
          </div>
          <h1 className="text-lg font-semibold text-[#182033] mb-1.5">
            No result to show
          </h1>
          <p className="text-sm text-[#667085] leading-relaxed mb-6">
            We couldn't find a recent exam result to display. This can happen
            if you refreshed this page directly. Head back to your dashboard
            or check your previous results.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/student/results"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-[#6C3FF5] bg-[#F1EDFF] rounded-lg hover:bg-[#E8E0FF] transition-colors"
            >
              My Results
            </Link>
            <Link
              to="/student/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#6C3FF5] rounded-lg hover:bg-[#5B2FE0] transition-colors"
            >
              Back to Dashboard
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { totalMarks = 0, obtainedMarks = 0 } = result;
  const percentage =
    totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
  const tone = getScoreTone(percentage);

  return (
    <div className="flex-1 min-h-screen bg-[#F8F7FC] flex items-center justify-center px-6 py-12">
      <div className="bg-white rounded-3xl border border-[#EAECF0] max-w-lg w-full overflow-hidden">

        {/* ── Top banner ─────────────────────────────────────────────── */}
        <div className="bg-[#F1EDFF] px-8 pt-10 pb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
            <PartyPopper size={26} className="text-[#6C3FF5]" strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-bold text-[#182033] mb-1">
            Exam Completed!
          </h1>
          {examTitle && (
            <p className="text-sm text-[#667085]">{examTitle}</p>
          )}
        </div>

        {/* ── Score ──────────────────────────────────────────────────── */}
        <div className="px-8 py-10 flex flex-col items-center">
          <div className="relative">
            <ScoreRing percentage={percentage} color={tone.ring} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-[#182033] leading-none">
                {percentage}%
              </p>
              <p className="text-xs text-[#98A2B3] mt-1">Score</p>
            </div>
          </div>

          <span
            className="mt-5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: tone.bg, color: tone.text }}
          >
            <Trophy size={14} strokeWidth={2} />
            {tone.label}
          </span>

          {/* Marks breakdown */}
          <div className="w-full mt-8 grid grid-cols-2 gap-4">
            <div className="text-center px-4 py-4 rounded-xl bg-[#F8F7FC] border border-[#EAECF0]">
              <p className="text-xs text-[#98A2B3] mb-1">Obtained Marks</p>
              <p className="text-xl font-bold text-[#182033]">
                {obtainedMarks}
              </p>
            </div>
            <div className="text-center px-4 py-4 rounded-xl bg-[#F8F7FC] border border-[#EAECF0]">
              <p className="text-xs text-[#98A2B3] mb-1">Total Marks</p>
              <p className="text-xl font-bold text-[#182033]">
                {totalMarks}
              </p>
            </div>
          </div>
        </div>

        {/* ── Actions ────────────────────────────────────────────────── */}
        <div className="px-8 py-6 border-t border-[#EAECF0] bg-[#F8F7FC] space-y-3">
          {attemptId && (
            <Link
              to={resolvedExamId ? `/student/analysis/${attemptId}/${resolvedExamId}` : `/student/analysis/${attemptId}`}
              state={{ examTitle }}
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-medium text-white bg-[#6C3FF5] rounded-xl hover:bg-[#5B2FE0] transition-colors shadow-sm"
            >
              View Detailed Analysis
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/student/results"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-[#667085] bg-white border border-[#EAECF0] rounded-xl hover:bg-[#F8F7FC] hover:text-[#182033] transition-colors"
            >
              My Results
            </Link>
            <Link
              to="/student/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-[#667085] bg-white border border-[#EAECF0] rounded-xl hover:bg-[#F8F7FC] hover:text-[#182033] transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
 