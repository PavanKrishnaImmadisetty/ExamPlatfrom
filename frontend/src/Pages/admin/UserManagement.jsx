/**
 * UserManagement.jsx
 *
 * Features:
 *  - Fetches all users via getAllUsers()
 *  - Table: Name, Email, Role, Status, Actions
 *  - Actions: role <select> that calls updateUserRole() on change
 *  - Toast notification on success / error
 *  - Search filter (client-side on name/email)
 *  - Role filter
 *  - Status filter
 *  - Loading skeleton, empty state, error state
 *  - Responsive: table scrolls horizontally on small screens
 */

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getAllUsers, updateUserRole,toggleUserStatus } from "../../api/adminService";
import { useAuth } from "../../context/AuthContext";

// ---------------------------------------------------------------------------
// Toast — minimal notification
// ---------------------------------------------------------------------------
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white max-w-xs animate-fade-in",
            t.type === "success" ? "bg-[#12B76A]" : "bg-[#F04438]",
          ].join(" ")}
        >
          {t.type === "success" ? (
            <CheckCircle2 size={16} strokeWidth={2} />
          ) : (
            <XCircle size={16} strokeWidth={2} />
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
    ACTIVE:   "bg-[#ECFDF3] text-[#12B76A]",
    INACTIVE: "bg-[#FFF4ED] text-[#F79009]",
    PENDING:  "bg-[#EFF8FF] text-[#3B82F6]",
    BANNED:   "bg-[#FEF3F2] text-[#F04438]",
  };
  const cls = map[status?.toUpperCase()] ?? "bg-[#F2F4F7] text-[#667085]";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status ?? "Unknown"}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Skeleton rows
// ---------------------------------------------------------------------------
function TableSkeleton({ rows = 7 }) {
  const widths = ["w-32", "w-48", "w-20", "w-16", "w-28"];
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
// RoleSelect — dropdown that triggers update immediately
// ---------------------------------------------------------------------------
const ROLES = ["ADMIN", "INSTRUCTOR", "STUDENT"];

function RoleSelect({ userId, currentRole, onUpdate, disabled }) {
  return (
    <div className="relative inline-block">
      <select
        defaultValue={currentRole}
        disabled={disabled}
        onChange={(e) => onUpdate(userId, e.target.value)}
        className={[
          "appearance-none pl-3 pr-7 py-1.5 text-xs font-medium rounded-lg border border-[#EAECF0] bg-white text-[#182033]",
          "focus:outline-none focus:ring-2 focus:ring-[#6C3FF5]/40 focus:border-[#6C3FF5]",
          "hover:border-[#6C3FF5] transition-colors cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        ].join(" ")}
        aria-label="Change user role"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r.charAt(0) + r.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#98A2B3] pointer-events-none"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter select
// ---------------------------------------------------------------------------
function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-[#EAECF0] bg-white text-[#667085]",
          "focus:outline-none focus:ring-2 focus:ring-[#6C3FF5]/40 focus:border-[#6C3FF5]",
          "cursor-pointer transition-colors",
        ].join(" ")}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o.charAt(0) + o.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3] pointer-events-none"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function UserManagement() {
  const { user: currentAuthUser } = useAuth();
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Per-row updating states: { [userId]: boolean }
const [roleUpdating, setRoleUpdating] = useState({});
const [statusUpdating, setStatusUpdating] = useState({});

  // Filters
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Toasts
  const [toasts, setToasts]       = useState([]);
  const toastId = useRef(0);

  // ── Toast helpers ─────────────────────────────────────────────────────────
  function addToast(message, type = "success") {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }

  // ── Fetch users ───────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch {
      setError("Unable to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Role update ───────────────────────────────────────────────────────────
  async function handleRoleUpdate(userId, newRole) {
  setRoleUpdating((prev) => ({ ...prev, [userId]: true }));

  try {
    await updateUserRole(userId, newRole);

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, role: newRole } : u
      )
    );

    addToast(
      `Role updated to ${newRole.charAt(0) + newRole.slice(1).toLowerCase()}.`,
      "success"
    );
  } catch {
    addToast("Failed to update role. Please try again.", "error");
    await fetchUsers();
  } finally {
    setRoleUpdating((prev) => ({ ...prev, [userId]: false }));
  }
}

  // ── Status update handler ────────────────────────────────────────────
  async function handleStatusUpdate(userId, currentStatus) {
    // We optimistically calculate what the backend will toggle it to
    const expectedNewStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    
    setStatusUpdating((prev) => ({ ...prev, [userId]: true }));
    try {
      // Call the backend endpoint (no status parameter needed)
      await toggleUserStatus(userId);
      
      // Update local state to reflect the toggle
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: expectedNewStatus } : u))
      );
      addToast(`User marked as ${expectedNewStatus.toLowerCase()}.`, "success");
    } catch {
      addToast("Failed to update status. Please try again.", "error");
      // If the request fails, re-fetch users to ensure UI matches the database
      await fetchUsers();
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [userId]: false }));
    }
  }

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q);
    const matchesRole   = !roleFilter   || u.role   === roleFilter;
    const matchesStatus = !statusFilter || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="flex-1 min-h-screen bg-[#F8F7FC]">
      <Toast toasts={toasts} />

      {/* ── Topbar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#EAECF0] px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[#182033]">Users</h1>
          <p className="text-xs text-[#98A2B3] hidden sm:block">
            Manage students, instructors and admins.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#667085] border border-[#EAECF0] rounded-lg hover:bg-[#F8F7FC] hover:text-[#182033] transition-colors"
          aria-label="Refresh users"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      <main className="px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-6">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#182033]">User Management</h2>
            <p className="text-sm text-[#667085] mt-1">
              {!loading && !error && (
                <>
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "user" : "users"}
                  {(search || roleFilter || statusFilter) && " found"}
                </>
              )}
            </p>
          </div>
          {/* Future: Add User button */}
          {/* <button className="...">+ Add User</button> */}
        </div>

        {/* ── Search + Filters bar ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
            />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={[
                "w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[#EAECF0] bg-white text-[#182033]",
                "placeholder:text-[#98A2B3]",
                "focus:outline-none focus:ring-2 focus:ring-[#6C3FF5]/40 focus:border-[#6C3FF5]",
                "transition-colors",
              ].join(" ")}
            />
          </div>

          {/* Role filter */}
          <FilterSelect
            value={roleFilter}
            onChange={setRoleFilter}
            options={ROLES}
            placeholder="All roles"
          />

          {/* Status filter */}
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={["ACTIVE", "INACTIVE", "PENDING", "BANNED"]}
            placeholder="All statuses"
          />
        </div>

        {/* ── Table card ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#EAECF0] overflow-hidden">
          {error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <AlertCircle size={32} className="text-[#F04438]" strokeWidth={1.5} />
              <p className="text-sm font-medium text-[#182033]">{error}</p>
              <button
                onClick={fetchUsers}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#6C3FF5] border border-[#6C3FF5] rounded-lg hover:bg-[#F1EDFF] transition-colors"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-[#F8F7FC] border-b border-[#EAECF0]">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#98A2B3] uppercase tracking-wide">
                      Name
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#98A2B3] uppercase tracking-wide">
                      Email
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#98A2B3] uppercase tracking-wide">
                      Role
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#98A2B3] uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-[#98A2B3] uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EAECF0]">
                  {loading ? (
                    <TableSkeleton rows={7} />
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-xl bg-[#F8F7FC] flex items-center justify-center">
                            <Users size={22} className="text-[#98A2B3]" strokeWidth={1.5} />
                          </div>
                          <p className="text-sm font-medium text-[#667085]">
                            {search || roleFilter || statusFilter
                              ? "No users match your filters."
                              : "No users yet."}
                          </p>
                          {(search || roleFilter || statusFilter) && (
                            <button
                              onClick={() => {
                                setSearch("");
                                setRoleFilter("");
                                setStatusFilter("");
                              }}
                              className="text-xs text-[#6C3FF5] hover:underline mt-1"
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user) => {
                      const isSelf =
                        (currentAuthUser?.email && currentAuthUser.email === user.email) ||
                        (currentAuthUser?.username && currentAuthUser.username === user.email) ||
                        (currentAuthUser?.id && currentAuthUser.id === user.id);

                      return (
                      <tr
                        key={user.id}
                        className="hover:bg-[#F8F7FC] transition-colors"
                      >
                        {/* Name */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#F1EDFF] flex items-center justify-center text-xs font-semibold text-[#6C3FF5] flex-shrink-0">
                              {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                            <span className="font-medium text-[#182033]">
                              {user.name}
                              {isSelf && (
                                <span className="ml-2 text-xs font-normal text-[#6C3FF5] bg-[#F1EDFF] px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-4 text-[#667085]">
                          {user.email}
                        </td>

                        {/* Role badge */}
                        <td className="px-5 py-4">
                          <span
                            className={[
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              user.role === "ADMIN"
                                ? "bg-[#F1EDFF] text-[#6C3FF5]"
                                : user.role === "INSTRUCTOR"
                                ? "bg-[#EFF8FF] text-[#3B82F6]"
                                : "bg-[#ECFDF3] text-[#12B76A]",
                            ].join(" ")}
                          >
                            {user.role?.charAt(0) +
                              (user.role?.slice(1)?.toLowerCase() ?? "")}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusBadge status={user.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            
                            {/* Role Select */}
                            <div className="flex items-center gap-2" title={isSelf ? "Cannot change your own role" : undefined}>
                              <RoleSelect
                                userId={user.id}
                                currentRole={user.role}
                                onUpdate={handleRoleUpdate}
                                disabled={isSelf || !!roleUpdating[user.id] || !!statusUpdating[user.id]}
                              />
                              {roleUpdating[user.id] && (
                                <RefreshCw
                                  size={13}
                                  className="text-[#6C3FF5] animate-spin flex-shrink-0"
                                />
                              )}
                            </div>

                            {/* 4. NEW: Status Toggle Button */}
                            <div className="flex items-center gap-2 border-l border-[#EAECF0] pl-3" title={isSelf ? "Cannot deactivate your own account" : undefined}>
                              <button
                                onClick={() => handleStatusUpdate(user.id, user.status)}
                                disabled={isSelf || !!statusUpdating[user.id] || !!roleUpdating[user.id]}
                                className={[
                                  "px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                                  user.status === "ACTIVE" 
                                    ? "bg-white border-[#FCA5A5] text-[#EF4444] hover:bg-[#FEF2F2]" 
                                    : "bg-white border-[#86EFAC] text-[#10B981] hover:bg-[#F0FDF4]"
                                ].join(" ")}
                              >
                                {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                              </button>
                              
                              {statusUpdating[user.id] && (
                                <RefreshCw
                                  size={13}
                                  className="text-[#6C3FF5] animate-spin flex-shrink-0"
                                />
                              )}
                            </div>

                          </div>
                        </td>
                      </tr>
                    );
                  })
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