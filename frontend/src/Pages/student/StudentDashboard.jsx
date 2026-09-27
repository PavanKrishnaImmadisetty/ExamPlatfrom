import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  AlertCircle,
  ClipboardList,
  Clock,
  Award,
  PlayCircle,
  Loader2,
  X,
  Calendar,
} from "lucide-react";

import { getPublishedExams, startExam } from "../../api/studentService";

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return "--";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#EAECF0] p-6 animate-pulse space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-[#EAECF0] rounded w-3/4" />
        <div className="h-3 bg-[#EAECF0] rounded w-1/2" />
      </div>
      <div className="flex gap-4">
        <div className="h-3 bg-[#EAECF0] rounded w-16" />
        <div className="h-3 bg-[#EAECF0] rounded w-16" />
      </div>
      <div className="h-9 bg-[#EAECF0] rounded-lg w-full" />
    </div>
  );
}

function ExamCard({ exam, onViewDetails }) {
  return (
    <div className="bg-white rounded-2xl border border-[#EAECF0] p-6 flex flex-col hover:shadow-sm transition-shadow duration-200">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-semibold text-[#182033] leading-snug">
            {exam.examTitle}
          </h3>
          <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#F1EDFF] flex items-center justify-center">
            <ClipboardList size={17} className="text-[#6C3FF5]" strokeWidth={1.8} />
          </span>
        </div>

        {exam.examDescription && (
          <p className="text-sm text-[#667085] leading-relaxed line-clamp-2 mb-4">
            {exam.examDescription}
          </p>
        )}

        {formatDate(exam.examDate) && (
          <p className="text-xs text-[#98A2B3] mb-4">
            Scheduled for {formatDate(exam.examDate)}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-[#667085] mb-5">
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-[#98A2B3]" strokeWidth={1.8} />
            {formatDuration(exam.examDuration)}
          </span>
          <span className="flex items-center gap-1.5">
            <Award size={14} className="text-[#98A2B3]" strokeWidth={1.8} />
            {exam.marks} marks
          </span>
        </div>
      </div>

      <button
        onClick={() => onViewDetails(exam)}
        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-[#6C3FF5] border border-[#6C3FF5] rounded-lg hover:bg-[#F1EDFF] transition-colors"
      >
        View Details
      </button>
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [exams, setExams]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [selectedExam, setSelectedExam] = useState(null);
  const [startingId, setStartingId] = useState(null);
  const [startError, setStartError] = useState(null);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublishedExams();
      setExams(Array.isArray(data) ? data : []);
    } catch {
      setError("Unable to load exams. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  async function handleStart() {
    if (!selectedExam) return;
    setStartError(null);

    const now = new Date();
    // Since the backend sends the full LocalDateTime string now, we parse it directly
    const examStart = selectedExam.examStartTime ? new Date(selectedExam.examStartTime) : null;
    const examEnd = selectedExam.examEndTime ? new Date(selectedExam.examEndTime) : null;

    // Frontend Time Checks
    if (examStart && now < examStart) {
      setStartError("The exam has not started yet. Please wait until the scheduled time.");
      return;
    }
    if (examEnd && now > examEnd) {
      setStartError("This exam has already ended and is no longer available.");
      return;
    }

    setStartingId(selectedExam.id);
    try {
      const attempt = await startExam(selectedExam.id);
      const attemptId = attempt?.id || attempt?.data?.id; // Safely handle different response structures

      if (!attemptId) {
        throw new Error("No attempt ID returned by the server.");
      }

      navigate(
        `/student/exams/${selectedExam.id}/take?attemptId=${attemptId}`,
        { state: { exam: selectedExam } }
      );
    } catch (err) {
      console.error(err);
      // Grab the exact error message from the Spring Boot backend
      const msg = 
        err?.response?.data?.message || 
        err?.response?.data || 
        `Unable to start "${selectedExam.examTitle}". Please try again.`;
        
      setStartError(typeof msg === "string" ? msg : "An error occurred");
      setStartingId(null);
    }
  }

  const closeModal = () => {
    setSelectedExam(null);
    setStartError(null);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#F8F7FC] relative">
      <header className="sticky top-0 z-30 bg-white border-b border-[#EAECF0] px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[#182033]">Dashboard</h1>
          <p className="text-xs text-[#98A2B3] hidden sm:block">
            Exams available for you to take.
          </p>
        </div>
        <button
          onClick={fetchExams}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#667085] border border-[#EAECF0] rounded-lg hover:bg-[#F8F7FC] hover:text-[#182033] transition-colors"
          aria-label="Refresh"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      <main className="px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#182033]">
            Available Exams
          </h2>
          <p className="text-sm text-[#667085] mt-1">
            {!loading && !error && (
              <>{exams.length} {exams.length === 1 ? "exam" : "exams"} available</>
            )}
          </p>
        </div>

        {error ? (
          <div className="bg-white rounded-2xl border border-[#EAECF0] flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle size={32} className="text-[#F04438]" strokeWidth={1.5} />
            <p className="text-sm font-medium text-[#182033]">{error}</p>
            <button
              onClick={fetchExams}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#6C3FF5] border border-[#6C3FF5] rounded-lg hover:bg-[#F1EDFF] transition-colors"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EAECF0] flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-[#F8F7FC] flex items-center justify-center">
              <ClipboardList size={22} className="text-[#98A2B3]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#667085]">
                No exams available right now
              </p>
              <p className="text-xs text-[#98A2B3] mt-1">
                Check back later - new exams will appear here once published.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {exams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onViewDetails={setSelectedExam}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-[#98A2B3] hover:text-[#182033] transition-colors"
            >
              <X size={20} />
            </button>

            <div>
              <h2 className="text-xl font-bold text-[#182033] pr-8">{selectedExam.examTitle}</h2>
              <p className="text-sm text-[#667085] mt-2 whitespace-pre-wrap">
                {selectedExam.examDescription || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F1EDFF] flex items-center justify-center text-[#6C3FF5]">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs text-[#98A2B3] font-medium uppercase">Date</p>
                  <p className="text-sm font-medium text-[#182033] mt-0.5">
                    {formatDate(selectedExam.examDate) || "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F1EDFF] flex items-center justify-center text-[#6C3FF5]">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs text-[#98A2B3] font-medium uppercase">Start Time</p>
                  <p className="text-sm font-medium text-[#182033] mt-0.5">
                    {formatTime(selectedExam.examStartTime) || "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F1EDFF] flex items-center justify-center text-[#6C3FF5]">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs text-[#98A2B3] font-medium uppercase">End Time</p>
                  <p className="text-sm font-medium text-[#182033] mt-0.5">
                    {formatTime(selectedExam.examEndTime) || "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F1EDFF] flex items-center justify-center text-[#6C3FF5]">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs text-[#98A2B3] font-medium uppercase">Duration</p>
                  <p className="text-sm font-medium text-[#182033] mt-0.5">
                    {formatDuration(selectedExam.examDuration)}
                  </p>
                </div>
              </div>
            </div>

            {startError && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] text-sm text-[#B42318]">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" strokeWidth={2} />
                {startError}
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={startingId === selectedExam.id}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-white bg-[#6C3FF5] rounded-lg hover:bg-[#5B2FE0] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {startingId === selectedExam.id ? (
                <>
                  <Loader2 size={15} className="animate-spin" strokeWidth={2} />
                  Starting...
                </>
              ) : (
                <>
                  <PlayCircle size={15} strokeWidth={2} />
                  Start Exam
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}