/**
 * InstructorDashboard.jsx
 *
 * Displays the instructor's exams fetched via getMyExams().
 *
 * Table columns: Title | Date | Duration | Status | Actions
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  ClipboardList,
  AlertCircle,
  Settings2,
  CheckCircle2,
  XCircle,
  Eye
} from "lucide-react";

import { getMyExams } from "../../api/instructorService";

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
// StatusBadge
// ---------------------------------------------------------------------------
function StatusBadge({ status }) {
  const map = {
    PUBLISHED:   "bg-[#ECFDF3] text-[#12B76A]",
    CLOSED:      "bg-[#F2F4F7] text-[#667085]",
    DRAFT:       "bg-[#FFF4ED] text-[#F79009]",
    ACTIVE:      "bg-[#ECFDF3] text-[#12B76A]",
    INACTIVE:    "bg-[#F2F4F7] text-[#667085]",
  };
  const key = status?.toUpperCase();
  const cls = map[key] ?? "bg-[#F2F4F7] text-[#667085]";
  const label = status ? status.charAt(0) + status.slice(1).toLowerCase() : "Unknown";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Table skeleton
// ---------------------------------------------------------------------------
function TableSkeleton({ rows = 5 }) {
  const widths = ["w-40", "w-24", "w-20", "w-20", "w-32"];
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {widths.map((w, j) => (
            <td key={j} className="px-5 py-4">
              <div className={`h-3.5 bg-[#EAECF0] rounded ${w}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(dateStr) {
  if (!dateStr) return "—";
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

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return "—";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [exams, setExams]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState("ALL");

  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  function addToast(message, type = "success") {
    const id = ++toastId.current;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyExams();
      setExams(Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : []));
    } catch {
      setError("Unable to load your exams. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.examTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = filterState === "ALL" || exam.examState === filterState;
    return matchesSearch && matchesState;
  });

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 min-h-screen bg-[#F8F7FC]">
      <Toast toasts={toasts} />

      {/* ── Topbar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#EAECF0] px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[#182033]">Dashboard</h1>
          <p className="text-xs text-[#98A2B3] hidden sm:block">
            Manage your exams and questions.
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

      {/* ── Page content ────────────────────────────────────────────────── */}
      <main className="px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-6">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#182033]">My Exams</h2>
            <p className="text-sm text-[#667085] mt-1">
              {!loading && !error && (
                <>
                  {filteredExams.length}{" "}
                  {filteredExams.length === 1 ? "exam" : "exams"} total
                </>
              )}
            </p>
          </div>
          
          {/* Filters & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-[#EAECF0] rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:border-[#6C3FF5] bg-white text-[#182033]"
            />
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="px-3 py-2 border border-[#EAECF0] rounded-lg text-sm focus:outline-none focus:border-[#6C3FF5] bg-white text-[#182033]"
            >
              <option value="ALL">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CLOSED">Closed</option>
            </select>
            <Link
              to="/instructor/exams/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6C3FF5] text-white text-sm font-medium rounded-lg hover:bg-[#5B2FE0] transition-colors self-start sm:self-auto whitespace-nowrap"
            >
              <Plus size={16} strokeWidth={2.5} />
              Create New Exam
            </Link>
          </div>
        </div>

        {/* ── Table card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#EAECF0] overflow-hidden">
          {error ? (
            /* Error state */
            <div className="flex flex-col items-center justify-center py-16 gap-3">
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
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[680px]">
                <thead>
                  <tr className="bg-[#F8F7FC] border-b border-[#EAECF0]">
                    {["Title", "Date", "Duration", "Status", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-xs font-semibold text-[#98A2B3] uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EAECF0]">
                  {loading ? (
                    <TableSkeleton rows={5} />
                  ) : filteredExams.length === 0 ? (
                    /* Empty state */
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#F8F7FC] flex items-center justify-center">
                            <ClipboardList
                              size={22}
                              className="text-[#98A2B3]"
                              strokeWidth={1.5}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#667085]">
                              No exams found
                            </p>
                            <p className="text-xs text-[#98A2B3] mt-1">
                              Try adjusting your filters or create a new exam.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredExams.map((exam) => (
                      <tr
                        key={exam.examId || exam.id}
                        className="hover:bg-[#F8F7FC] transition-colors group"
                      >
                        {/* Title */}
                        <td className="px-5 py-4">
                          <p className="font-medium text-[#182033] leading-snug group-hover:text-[#6C3FF5] transition-colors">
                            {exam.examTitle}
                          </p>
                          {exam.examDescription && (
                            <p className="text-xs text-[#98A2B3] mt-0.5 truncate max-w-[220px]">
                              {exam.examDescription}
                            </p>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-[#667085] whitespace-nowrap">
                          {formatDate(exam.examDate)}
                        </td>

                        {/* Duration */}
                        <td className="px-5 py-4 text-[#667085] whitespace-nowrap">
                          {formatDuration(exam.examDuration)}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusBadge status={exam.examState} />
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link 
                              to={`/instructor/exams/${exam.examId || exam.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6C3FF5] bg-[#F1EDFF] rounded-lg hover:bg-[#E8E0FF] transition-colors whitespace-nowrap"
                            >
                              <Eye size={13} strokeWidth={2} />
                              View Details
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}