import { Link } from "react-router-dom";
import { BookOpen, ClipboardList, Settings, HelpCircle } from "lucide-react";

const ICON_MAP = {
  Courses: BookOpen,
  Assignments: ClipboardList,
  Settings: Settings,
  Help: HelpCircle,
};

export default function AdminPlaceholder({ title = "Feature", description }) {
  const Icon = ICON_MAP[title] || BookOpen;

  return (
    <div className="flex-1 min-h-screen bg-[#F8F7FC]">
      <header className="sticky top-0 z-30 bg-white border-b border-[#EAECF0] px-6 lg:px-8 h-16 flex items-center">
        <h1 className="text-lg font-semibold text-[#182033]">{title}</h1>
      </header>

      <main className="px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-[#EAECF0] flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-[#F8F7FC] flex items-center justify-center">
            <Icon size={32} className="text-[#98A2B3]" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#182033]">{title} Management</h2>
            <p className="text-sm text-[#667085] mt-1 max-w-sm">
              {description || `${title} management feature is coming soon. Stay tuned for updates!`}
            </p>
          </div>
          <Link
            to="/admin/dashboard"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#6C3FF5] text-white text-sm font-medium rounded-lg hover:bg-[#5B2FE0] transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
