/**
 * AdminLayout.jsx
 *
 * Wraps all admin pages with the Sidebar.
 * Handles mobile sidebar drawer open/close state.
 *
 * Usage in your router:
 *
 *   <Route element={<AdminLayout />}>
 *     <Route path="/admin/dashboard" element={<AdminDashboard />} />
 *     <Route path="/admin/users"     element={<UserManagement />} />
 *   </Route>
 */

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./SideBar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8F7FC]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile hamburger — only shown on small screens */}
        <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 h-14 bg-white border-b border-[#EAECF0]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-[#667085] hover:bg-[#F8F7FC] hover:text-[#182033]"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-[#182033]">
            EduAdmin
          </span>
        </div>

        {/* Page content rendered here */}
        <Outlet />
      </div>
    </div>
  );
}