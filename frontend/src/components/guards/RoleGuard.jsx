import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * RoleGuard
 * Restricts access to routes based on the user's decoded JWT role.
 * Must be nested inside ProtectedRoute (assumes user is already authenticated).
 *
 * Props:
 *   allowedRoles  string[]  Roles that may access this route, e.g. ["ADMIN"]
 *   redirectTo    string    Where to send unauthorised users (default: "/unauthorized")
 *
 * Usage in router:
 *   <Route element={<ProtectedRoute />}>
 *     <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
 *       <Route path="/admin/dashboard" element={<AdminDashboard />} />
 *     </Route>
 *   </Route>
 */
const RoleGuard = ({ allowedRoles = [], redirectTo = "/unauthorized" }) => {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const normalise = (r) => (r ? r.toUpperCase().replace(/^ROLE_/, "") : "");
  const userRole = normalise(role);
  const hasAccess = allowedRoles
    .map(normalise)
    .includes(userRole);

  return hasAccess ? <Outlet /> : <Navigate to={redirectTo} replace />;
};

export default RoleGuard;