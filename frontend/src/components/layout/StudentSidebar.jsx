/**
 * StudentSidebar.jsx
 *
 * NOTE ON NAMING:
 * The project already has a role-specific sidebar per area
 * (Sidebar.jsx = Admin, InstructorSidebar.jsx = Instructor).
 * Following that same convention, this is StudentSidebar.jsx rather than
 * overwriting the existing Sidebar.jsx (which is the Admin sidebar).
 *
 * Same design language and component structure as the other two sidebars.
 * Kept intentionally minimal — students only need two destinations.
 *
 * Props:
 *   isOpen  — boolean, controls mobile drawer
 *   onClose — function, closes the drawer
 */

import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Award,
  Settings,
  HelpCircle,
  LogOut,
  X,
  GraduationCap,
} from "lucide-react";
import {useAuth} from "../../context/AuthContext";

// ---------------------------------------------------------------------------
// Nav config
// ---------------------------------------------------------------------------
const primaryNav = [
  { label: "Dashboard", to: "/student/dashboard", icon: LayoutDashboard },
  { label: "My Results", to: "/student/results",  icon: Award           },
];

const secondaryNav = [
  { label: "Settings", to: "/student/settings", icon: Settings   },
  { label: "Help",     to: "/student/help",     icon: HelpCircle },
];

// ---------------------------------------------------------------------------
// SidebarLink — identical pattern to Admin/Instructor sidebars
// ---------------------------------------------------------------------------
function SidebarLink({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
          isActive
            ? "bg-[#F1EDFF] text-[#6C3FF5]"
            : "text-[#667085] hover:bg-[#F8F7FC] hover:text-[#182033]",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            className={isActive ? "text-[#6C3FF5]" : "text-[#98A2B3]"}
            strokeWidth={isActive ? 2.2 : 1.8}
          />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

// ---------------------------------------------------------------------------
// StudentSidebar
// ---------------------------------------------------------------------------
export default function StudentSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const {user,logout} = useAuth();

  function handleLogout() {
    // localStorage.removeItem("token");
    logout();
    navigate("/login");
  }

  const sidebarContent = (
    <aside className="flex flex-col h-full w-64 bg-white border-r border-[#EAECF0]">
      {/* ── Brand ── */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-[#EAECF0]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#6C3FF5] flex items-center justify-center flex-shrink-0">
            <GraduationCap size={16} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#182033] leading-tight">
              EduPlatform
            </p>
            <p className="text-xs text-[#98A2B3] leading-tight">
              Student Panel
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md text-[#98A2B3] hover:text-[#182033] hover:bg-[#F8F7FC]"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Primary nav ── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {primaryNav.map((item) => (
          <SidebarLink key={item.to} {...item} onClick={onClose} />
        ))}
      </nav>

      {/* ── Divider ── */}
      <div className="mx-3 border-t border-[#EAECF0]" />

      {/* ── Secondary nav ── */}
      <nav className="px-3 py-3 space-y-1">
        {secondaryNav.map((item) => (
          <SidebarLink key={item.to} {...item} onClick={onClose} />
        ))}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#667085] hover:bg-[#FFF1F0] hover:text-[#F04438] transition-colors duration-150 group"
        >
          <LogOut
            size={18}
            className="text-[#98A2B3] group-hover:text-[#F04438]"
            strokeWidth={1.8}
          />
          Logout
        </button>
      </nav>

      {/* ── User badge ── */}
      <div className="px-4 py-4 border-t border-[#EAECF0]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#F1EDFF] flex items-center justify-center text-xs font-semibold text-[#6C3FF5] flex-shrink-0">
            S
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#182033] truncate">
              Student
            </p>
            <p className="text-xs text-[#98A2B3] truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop — always visible */}
      <div className="hidden lg:flex flex-shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile backdrop */}
      <div
        className={[
          "lg:hidden fixed inset-0 bg-black/30 z-40 transition-opacity duration-200",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div
        className={[
          "lg:hidden fixed inset-y-0 left-0 z-50 flex transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {sidebarContent}
      </div>
    </>
  );
}