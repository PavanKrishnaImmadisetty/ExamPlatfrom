/**
 * StudentLayout.jsx
 *
 * Shell for student pages that DO show the sidebar
 * (Dashboard, My Results).
 *
 * NOTE: TakeExam.jsx is intentionally NOT rendered inside this layout —
 * see the routing comment in AppRoutes.jsx for why.
 */

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import StudentSidebar from "./StudentSidebar";

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8F7FC]">
      <StudentSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 h-14 bg-white border-b border-[#EAECF0]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-[#667085] hover:bg-[#F8F7FC] hover:text-[#182033]"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-[#182033]">
            EduPlatform
          </span>
        </div>

        <Outlet />
      </div>
    </div>
  );
}