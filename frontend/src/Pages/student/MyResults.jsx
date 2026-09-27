import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Award,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
  BarChart3,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
} from "lucide-react";
import { getMyResults } from "../../api/studentService";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function getScoreTone(percentage) {
  if (percentage >= 85) return { bg: "#ECFDF3", text: "#12B76A", border: "#A6F4C5", label: "Excellent" };
  if (percentage >= 60) return { bg: "#F1EDFF", text: "#6C3FF5", border: "#D9D6FE", label: "Good" };
  if (percentage >= 40) return { bg: "#FFF4ED", text: "#F79009", border: "#FEDF89", label: "Average" };
  return { bg: "#FEF3F2", text: "#F04438", border: "#FECDCA", label: "Needs Improvement" };
}

export default function MyResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchResults() {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyResults();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load results:", err);
      setError("Failed to load your exam results. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResults();
  }, []);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return results;
    const query = searchQuery.toLowerCase();
    return results.filter(
      (r) =>
        (r.examTitle && r.examTitle.toLowerCase().includes(query)) ||
        String(r.examId).includes(query)
    );
  }, [results, searchQuery]);

  // Overall Statistics
  const stats = useMemo(() => {
    if (!results || results.length === 0) return null;
    const totalExams = results.length;
    let totalPct = 0;
    let bestPct = 0;

    results.forEach((r) => {
      const pct = r.totalMarks > 0 ? (r.obtainedMarks / r.totalMarks) * 100 : 0;
      totalPct += pct;
      if (pct > bestPct) bestPct = pct;
    });

    const avgScore = Math.round(totalPct / totalExams);
    return { totalExams, avgScore, bestScore: Math.round(bestPct) };
  }, [results]);

  return (
    <div className="flex-1 min-h-screen bg-[#F8F7FC] p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#182033]">My Results</h1>
            <p className="text-sm text-[#667085] mt-1">
              View your scores and click any exam to see detailed question-by-question analysis.
            </p>
          </div>
          <button
            onClick={fetchResults}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-[#667085] bg-white border border-[#EAECF0] rounded-xl hover:bg-[#F8F7FC] hover:text-[#182033] transition-colors self-start sm:self-auto"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Quick Stats Banner (when results exist) */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-[#EAECF0] p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#F1EDFF] flex items-center justify-center text-[#6C3FF5]">
                <FileText size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#98A2B3]">Exams Completed</p>
                <p className="text-2xl font-bold text-[#182033] mt-0.5">{stats.totalExams}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#EAECF0] p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#ECFDF3] flex items-center justify-center text-[#12B76A]">
                <Award size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#98A2B3]">Average Score</p>
                <p className="text-2xl font-bold text-[#182033] mt-0.5">{stats.avgScore}%</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#EAECF0] p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#FEF6EE] flex items-center justify-center text-[#F79009]">
                <Trophy size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#98A2B3]">Best Score</p>
                <p className="text-2xl font-bold text-[#182033] mt-0.5">{stats.bestScore}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        {results.length > 0 && (
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
            <input
              type="text"
              placeholder="Search by exam title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EAECF0] rounded-xl text-sm text-[#182033] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#6C3FF5] transition-colors"
            />
          </div>
        )}

        {/* Content States */}
        {error ? (
          <div className="bg-white rounded-2xl border border-[#EAECF0] flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <AlertCircle size={32} className="text-[#F04438]" strokeWidth={1.5} />
            <p className="text-sm font-medium text-[#182033]">{error}</p>
            <button
              onClick={fetchResults}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#6C3FF5] border border-[#6C3FF5] rounded-lg hover:bg-[#F1EDFF] transition-colors mt-2"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#EAECF0] p-6 animate-pulse space-y-4">
                <div className="h-5 bg-[#EAECF0] rounded w-3/4" />
                <div className="h-4 bg-[#EAECF0] rounded w-1/2" />
                <div className="h-10 bg-[#EAECF0] rounded-xl" />
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EAECF0] flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-[#F8F7FC] flex items-center justify-center">
              <FileText size={26} className="text-[#98A2B3]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-base font-semibold text-[#182033]">No exam results yet</p>
              <p className="text-sm text-[#667085] mt-1 max-w-sm">
                Once you finish and submit an exam, your score, answers, and in-depth performance analysis will show up here.
              </p>
            </div>
            <Link
              to="/student/dashboard"
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-[#6C3FF5] text-white rounded-xl text-sm font-medium hover:bg-[#5B2FE0] transition-colors shadow-sm"
            >
              Browse Available Exams
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EAECF0] py-12 text-center text-[#667085] text-sm">
            No exams match your search "{searchQuery}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredResults.map((r) => {
              const percentage =
                r.totalMarks > 0 ? Math.round((r.obtainedMarks / r.totalMarks) * 100) : 0;
              const tone = getScoreTone(percentage);
              const analysisUrl = r.examId
                ? `/student/analysis/${r.id}/${r.examId}`
                : `/student/analysis/${r.id}`;

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-[#EAECF0] hover:border-[#6C3FF5]/40 hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Title + Score Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <Link
                        to={analysisUrl}
                        state={{ examTitle: r.examTitle }}
                        className="font-bold text-[#182033] group-hover:text-[#6C3FF5] transition-colors text-base line-clamp-2"
                      >
                        {r.examTitle || `Exam #${r.examId}`}
                      </Link>
                      <span
                        className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                        style={{
                          backgroundColor: tone.bg,
                          color: tone.text,
                          borderColor: tone.border,
                        }}
                      >
                        <Trophy size={13} strokeWidth={2.2} />
                        {percentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#EAECF0] h-2 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(percentage, 5)}%`,
                          backgroundColor: tone.text,
                        }}
                      />
                    </div>

                    {/* Details Rows */}
                    <div className="grid grid-cols-2 gap-3 text-xs text-[#667085] py-2 border-t border-[#EAECF0]">
                      <div className="flex items-center gap-1.5">
                        <Award size={14} className="text-[#98A2B3]" />
                        <span>
                          Marks: <strong className="text-[#182033]">{r.obtainedMarks}</strong> / {r.totalMarks}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-[#98A2B3]" />
                        <span>Status: <strong className="text-[#182033]">{tone.label}</strong></span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5 text-[#98A2B3] pt-1">
                        <Clock size={13} />
                        <span>Submitted on {formatDate(r.endTime || r.attemptDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Link: View Analysis */}
                  <Link
                    to={analysisUrl}
                    state={{ examTitle: r.examTitle }}
                    className="mt-5 inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-[#6C3FF5] bg-[#F1EDFF] group-hover:bg-[#6C3FF5] group-hover:text-white rounded-xl transition-all duration-200"
                  >
                    <BarChart3 size={16} />
                    View Result Analysis
                    <ArrowRight size={15} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
