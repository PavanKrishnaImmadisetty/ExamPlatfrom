/**
 * AdminDashboard.jsx
 *
 * Sections:
 *   1. Page header
 *   2. Stat cards (Total Users / Admins / Instructors / Students)
 *   3. Recent Users table
 *   4. Recent Assignments placeholder (ready to wire up)
 *   5. Recent Activity feed
 *
 * States handled: loading, error, empty
 */

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  ShieldCheck,
  BookOpenCheck,
  GraduationCap,
  RefreshCw,
  ArrowRight,
  Clock,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getSystemStats, getAllUsers } from "../../api/adminService";
import StatCard from "../../components/common/StatCard";

// ---------------------------------------------------------------------------
// StatusBadge — reusable inline badge
// ---------------------------------------------------------------------------
function StatusBadge({ status }) {
  const map = {
    ACTIVE:   "bg-[#ECFDF3] text-[#12B76A]",
    INACTIVE: "bg-[#FFF4ED] text-[#F79009]",
    PENDING:  "bg-[#EFF8FF] text-[#3B82F6]",
    BANNED:   "bg-[#FEF3F2] text-[#F04438]",
  };
  const cls = map[status?.toUpperCase()] ?? "bg-[#F2F4F7] text-[#667085]";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {status ?? "Unknown"}
    </span>
  );
}

// ---------------------------------------------------------------------------
// RoleBadge
// ---------------------------------------------------------------------------
function RoleBadge({ role }) {
  const map = {
    ADMIN:      "bg-[#F1EDFF] text-[#6C3FF5]",
    INSTRUCTOR: "bg-[#EFF8FF] text-[#3B82F6]",
    STUDENT:    "bg-[#ECFDF3] text-[#12B76A]",
  };
  const cls = map[role?.toUpperCase()] ?? "bg-[#F2F4F7] text-[#667085]";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {role ?? "Unknown"}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Skeleton rows for table loading state
// ---------------------------------------------------------------------------
function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-5 py-3.5">
              <div
                className="h-3.5 bg-[#EAECF0] rounded"
                style={{ width: `${60 + (j * 15) % 30}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Recent activity — derived from users (newest first)
// In a real app this would come from a dedicated /api/activity endpoint.
// ---------------------------------------------------------------------------
function buildActivity(users) {
  return users.slice(0, 6).map((u) => ({
    id: u.id,
    text: `${u.name} joined as ${u.role.toLowerCase()}`,
    meta: u.email,
    icon: UserPlus,
  }));
}

// ---------------------------------------------------------------------------
// ErrorMessage
// ---------------------------------------------------------------------------
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <AlertCircle size={32} className="text-[#F04438]" strokeWidth={1.5} />
      <p className="text-sm font-medium text-[#182033]">{message}</p>
      <p className="text-xs text-[#98A2B3]">Please check your connection and try again.</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#6C3FF5] border border-[#6C3FF5] rounded-lg hover:bg-[#F1EDFF] transition-colors"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function AdminDashboard() {
  const [stats, setStats]           = useState(null);
  const [users, setUsers]           = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [statsError, setStatsError]   = useState(null);
  const [usersError, setUsersError]   = useState(null);

  // ── Fetch stats ──────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await getSystemStats();
      setStats(data);
    } catch (err) {
      setStatsError("Unable to load system stats.");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch users ──────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setUsersError("Unable to load users.");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchStats, fetchUsers]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const recentUsers    = users.slice(0, 5);
  const activityItems  = buildActivity(users);

  // ── Stat card configs ────────────────────────────────────────────────────
  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers,
      icon: Users,
      iconColor: "text-[#6C3FF5]",
      iconBg: "bg-[#F1EDFF]",
    },
    {
      title: "Admins",
      value: stats?.totalAdmins,
      icon: ShieldCheck,
      iconColor: "text-[#3B82F6]",
      iconBg: "bg-[#EFF8FF]",
    },
    {
      title: "Instructors",
      value: stats?.totalInstructors,
      icon: BookOpenCheck,
      iconColor: "text-[#F79009]",
      iconBg: "bg-[#FFF4ED]",
    },
    {
      title: "Students",
      value: stats?.totalStudents,
      icon: GraduationCap,
      iconColor: "text-[#12B76A]",
      iconBg: "bg-[#ECFDF3]",
    },
  ];

  return (
    <div className="flex-1 min-h-screen bg-[#F8F7FC]">

      {/* ── Topbar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#EAECF0] px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[#182033] leading-tight">
            Dashboard
          </h1>
          <p className="text-xs text-[#98A2B3] hidden sm:block">
            Welcome back — here's what's happening today.
          </p>
        </div>
        <button
          onClick={() => { fetchStats(); fetchUsers(); }}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#667085] border border-[#EAECF0] rounded-lg hover:bg-[#F8F7FC] hover:text-[#182033] transition-colors"
          aria-label="Refresh dashboard"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      {/* ── Page content ───────────────────────────────────────────────── */}
      <main className="px-6 lg:px-8 py-8 space-y-8 max-w-7xl mx-auto">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div>
          <h2 className="text-2xl font-bold text-[#182033]">Overview</h2>
          <p className="text-sm text-[#667085] mt-1">
            System summary and recent activity across your platform.
          </p>
        </div>

        {/* ── Stat cards ───────────────────────────────────────────────── */}
        {statsError ? (
          <ErrorMessage message={statsError} onRetry={fetchStats} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <StatCard key={card.title} {...card} loading={statsLoading} />
            ))}
          </div>
        )}

        {/* ── Bottom grid: Recent Users + Recent Activity ───────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── Recent Users table (spans 2 cols on xl) ───────────────── */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-[#EAECF0]">
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAECF0]">
              <div>
                <h3 className="text-sm font-semibold text-[#182033]">
                  Recent Users
                </h3>
                <p className="text-xs text-[#98A2B3] mt-0.5">
                  Latest accounts on the platform
                </p>
              </div>
              <Link
                to="/admin/users"
                className="flex items-center gap-1 text-xs font-medium text-[#6C3FF5] hover:underline"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8F7FC]">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#98A2B3] uppercase tracking-wide">
                      Name
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#98A2B3] uppercase tracking-wide hidden md:table-cell">
                      Email
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#98A2B3] uppercase tracking-wide">
                      Role
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#98A2B3] uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAECF0]">
                  {usersLoading ? (
                    <TableSkeleton rows={5} cols={4} />
                  ) : usersError ? (
                    <tr>
                      <td colSpan={4}>
                        <ErrorMessage message={usersError} onRetry={fetchUsers} />
                      </td>
                    </tr>
                  ) : recentUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center">
                        <p className="text-sm font-medium text-[#667085]">
                          No users yet
                        </p>
                        <p className="text-xs text-[#98A2B3] mt-1">
                          Users will appear here once they register.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    recentUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-[#F8F7FC] transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            {/* Avatar initials */}
                            <div className="w-7 h-7 rounded-full bg-[#F1EDFF] flex items-center justify-center text-xs font-semibold text-[#6C3FF5] flex-shrink-0">
                              {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                            <span className="font-medium text-[#182033] truncate max-w-[140px]">
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[#667085] hidden md:table-cell truncate max-w-[180px]">
                          {user.email}
                        </td>
                        <td className="px-5 py-3.5">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={user.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Recent Activity feed ──────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-[#EAECF0]">
            {/* Card header */}
            <div className="px-6 py-4 border-b border-[#EAECF0]">
              <h3 className="text-sm font-semibold text-[#182033]">
                Recent Activity
              </h3>
              <p className="text-xs text-[#98A2B3] mt-0.5">
                Latest platform events
              </p>
            </div>

            {/* Activity list */}
            <ul className="divide-y divide-[#EAECF0]">
              {usersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="px-5 py-4 flex gap-3 animate-pulse">
                    <div className="w-7 h-7 bg-[#EAECF0] rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-[#EAECF0] rounded w-4/5" />
                      <div className="h-2.5 bg-[#EAECF0] rounded w-3/5" />
                    </div>
                  </li>
                ))
              ) : usersError ? (
                <li className="px-5 py-8 text-center text-xs text-[#98A2B3]">
                  Unable to load activity.
                </li>
              ) : activityItems.length === 0 ? (
                <li className="px-5 py-12 text-center">
                  <Clock
                    size={28}
                    className="text-[#EAECF0] mx-auto mb-2"
                    strokeWidth={1.5}
                  />
                  <p className="text-sm text-[#667085]">No recent activity</p>
                </li>
              ) : (
                activityItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id} className="px-5 py-4 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#F1EDFF] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={13} className="text-[#6C3FF5]" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-[#182033] font-medium leading-snug truncate">
                          {item.text}
                        </p>
                        <p className="text-xs text-[#98A2B3] truncate mt-0.5">
                          {item.meta}
                        </p>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>

        {/* ── Recent Assignments placeholder ────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#EAECF0]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAECF0]">
            <div>
              <h3 className="text-sm font-semibold text-[#182033]">
                Recent Assignments
              </h3>
              <p className="text-xs text-[#98A2B3] mt-0.5">
                Latest assignments across all courses
              </p>
            </div>
            <Link
              to="/admin/assignments"
              className="flex items-center gap-1 text-xs font-medium text-[#6C3FF5] hover:underline"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {/* Empty state — assignments API not yet wired */}
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#F8F7FC] flex items-center justify-center mb-3">
              <BookOpenCheck
                size={22}
                className="text-[#98A2B3]"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-sm font-medium text-[#667085]">
              No assignments yet
            </p>
            <p className="text-xs text-[#98A2B3] mt-1 max-w-xs">
              Assignments will appear here once instructors create them.
            </p>
            <Link
              to="/admin/assignments"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#6C3FF5] rounded-lg hover:bg-[#5B2FE0] transition-colors"
            >
              Manage Assignments
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}