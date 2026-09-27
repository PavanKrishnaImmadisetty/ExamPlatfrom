import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Settings2, 
  Edit3, 
  Trash2, 
  Clock, 
  Calendar, 
  Award,
  Save,
  X
} from "lucide-react";

import { getExamById, updateExam, deleteExam } from "../../api/instructorService";


const extractDate = (isoStr) => {
  if (!isoStr) return "";
  return isoStr.split("T")[0];
};

const extractTime = (isoStr) => {
  if (!isoStr) return "";
  if (isoStr.includes("T")) return isoStr.split("T")[1].substring(0, 5);
  return isoStr.substring(0, 5);
};

function StatusBadge({ status }) {
  const map = {
    PUBLISHED:   "bg-[#ECFDF3] text-[#12B76A]",
    CLOSED:      "bg-[#F2F4F7] text-[#667085]",
    DRAFT:       "bg-[#FFF4ED] text-[#F79009]",
  };
  const key = status?.toUpperCase();
  const cls = map[key] ?? "bg-[#F2F4F7] text-[#667085]";
  const label = status ? status.charAt(0) + status.slice(1).toLowerCase() : "Unknown";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

export default function ExamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchExam();
  }, [id]);

  async function fetchExam() {
    try {
      setLoading(true);
      const res = await getExamById(id);
      const data = res.data || res;
      setExam(data);
      setEditForm({
        examTitle: data.examTitle || "",
        examDescription: data.examDescription || "",
        examDate: extractDate(data.examDate) || "",
        examStartTime: extractTime(data.examStartTime) || "",
        examEndTime: extractTime(data.examEndTime) || "",
        examDuration: data.examDuration || 0,
        marks: data.marks || 0,
      });
    } catch (err) {
      setError("Failed to fetch exam details.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await deleteExam(id);
      navigate("/instructor/exams");
    } catch (err) {
      alert("Failed to delete exam.");
    }
  }

  async function handleStatusChange(e) {
    const newState = e.target.value;
    try {
      await updateExam(id, { ...exam, examState: newState });
      setExam(prev => ({ ...prev, examState: newState }));
    } catch (err) {
      alert("Failed to update status.");
    }
  }

async function handleSaveEdit() {
    try {
      const payload = { ...exam, ...editForm };

      // Reconstruct the full LocalDateTime strings for Spring Boot
      if (editForm.examDate) {
        // 1. Format the examDate itself as a full timestamp (Midnight)
        payload.examDate = `${editForm.examDate}T00:00:00`;
        
        // 2. Format the Start Time
        if (editForm.examStartTime) {
          // Check if the HTML input already included seconds (HH:MM vs HH:MM:SS)
          const startTime = editForm.examStartTime.length === 5 
            ? `${editForm.examStartTime}:00` 
            : editForm.examStartTime;
          payload.examStartTime = `${editForm.examDate}T${startTime}`;
        }
        
        // 3. Format the End Time
        if (editForm.examEndTime) {
          const endTime = editForm.examEndTime.length === 5 
            ? `${editForm.examEndTime}:00` 
            : editForm.examEndTime;
          payload.examEndTime = `${editForm.examDate}T${endTime}`;
        }
      }

      await updateExam(id, payload);
      
      // Refresh the page data directly from the backend to ensure perfect sync
      fetchExam(); 
      setIsEditing(false);
    } catch (err) {
      console.error("Update error:", err.response || err);
      alert("Failed to update exam. Check the console for details.");
    }
  }

  if (loading) return <div className="p-8 text-center text-[#667085]">Loading exam...</div>;
  if (error || !exam) return <div className="p-8 text-center text-[#F04438]">{error}</div>;

  return (
    <div className="flex-1 min-h-screen bg-[#F8F7FC] p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link 
          to="/instructor/exams" 
          className="inline-flex items-center gap-2 text-sm font-medium text-[#667085] hover:text-[#182033]"
        >
          <ArrowLeft size={16} /> Back to Exams
        </Link>

        {/* Details Card */}
        <div className="bg-white rounded-2xl border border-[#EAECF0] p-6 lg:p-8">
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.examTitle}
                    onChange={(e) => setEditForm(prev => ({ ...prev, examTitle: e.target.value }))}
                    className="w-full text-2xl font-bold border border-[#EAECF0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#6C3FF5]"
                  />
                  <textarea
                    value={editForm.examDescription}
                    onChange={(e) => setEditForm(prev => ({ ...prev, examDescription: e.target.value }))}
                    className="w-full text-[#667085] border border-[#EAECF0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#6C3FF5]"
                    rows={3}
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-[#182033]">{exam.examTitle}</h1>
                    <StatusBadge status={exam.examState} />
                  </div>
                  <p className="text-[#667085] mt-2">{exam.examDescription || "No description provided."}</p>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {!isEditing && (
                <>
                  <Link
                    to={`/instructor/exams/${id}/questions`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#6C3FF5] rounded-lg hover:bg-[#5B2FE0] transition-colors"
                  >
                    <Settings2 size={16} /> Manage Questions
                  </Link>

                  <select
                    value={exam.examState || "DRAFT"}
                    onChange={handleStatusChange}
                    className="px-3 py-2 text-sm font-medium border border-[#EAECF0] rounded-lg text-[#182033] bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <option value="DRAFT">Set Draft</option>
                    <option value="PUBLISHED">Set Published</option>
                    <option value="CLOSED">Set Closed</option>
                  </select>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#667085] border border-[#EAECF0] rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit3 size={16} /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#F04438] border border-[#EAECF0] rounded-lg hover:bg-[#FEF3F2] transition-colors"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </>
              )}
              
              {isEditing && (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#6C3FF5] rounded-lg hover:bg-[#5B2FE0] transition-colors"
                  >
                    <Save size={16} /> Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#667085] border border-[#EAECF0] rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X size={16} /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 pt-6 border-t border-[#EAECF0]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F1EDFF] flex items-center justify-center text-[#6C3FF5]">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs text-[#98A2B3] font-medium uppercase">Date</p>
                {isEditing ? (
                  <input
                    type="date"
                    value={editForm.examDate}
                    min={new Date().toLocaleDateString('en-CA')}
                    onChange={(e) => setEditForm(prev => ({ ...prev, examDate: e.target.value }))}
                    className="border border-[#EAECF0] rounded px-2 py-1 text-sm mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium text-[#182033] mt-0.5">
                    {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "Not set"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F1EDFF] flex items-center justify-center text-[#6C3FF5]">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-[#98A2B3] font-medium uppercase">Start Time</p>
                {isEditing ? (
                  <input
                    type="time"
                    value={editForm.examStartTime}
                    onChange={(e) => setEditForm(prev => ({ ...prev, examStartTime: e.target.value }))}
                    className="border border-[#EAECF0] rounded px-2 py-1 text-sm mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium text-[#182033] mt-0.5">
                    {exam.examStartTime || "Not set"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F1EDFF] flex items-center justify-center text-[#6C3FF5]">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-[#98A2B3] font-medium uppercase">End Time</p>
                {isEditing ? (
                  <input
                    type="time"
                    value={editForm.examEndTime}
                    onChange={(e) => setEditForm(prev => ({ ...prev, examEndTime: e.target.value }))}
                    className="border border-[#EAECF0] rounded px-2 py-1 text-sm mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium text-[#182033] mt-0.5">
                    {exam.examEndTime || "Not set"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F1EDFF] flex items-center justify-center text-[#6C3FF5]">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-[#98A2B3] font-medium uppercase">Duration</p>
                {isEditing ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="number"
                      value={editForm.examDuration}
                      onChange={(e) => setEditForm(prev => ({ ...prev, examDuration: Number(e.target.value) }))}
                      className="border border-[#EAECF0] rounded w-16 px-2 py-1 text-sm"
                    />
                    <span className="text-sm text-[#667085]">mins</span>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-[#182033] mt-0.5">
                    {exam.examDuration ? `${exam.examDuration} mins` : "Not set"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F1EDFF] flex items-center justify-center text-[#6C3FF5]">
                <Award size={20} />
              </div>
              <div>
                <p className="text-xs text-[#98A2B3] font-medium uppercase">Total Marks</p>
                {isEditing ? (
                  <input
                    type="number"
                    value={editForm.marks}
                    onChange={(e) => setEditForm(prev => ({ ...prev, marks: Number(e.target.value) }))}
                    className="border border-[#EAECF0] rounded w-20 px-2 py-1 text-sm mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium text-[#182033] mt-0.5">
                    {exam.marks || 0}
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
