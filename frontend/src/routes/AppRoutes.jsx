import { Routes, Route, Navigate } from "react-router-dom";
 
import ProtectedRoute from "../components/guards/ProtectedRoute";
import RoleGuard       from "../components/guards/RoleGuard";
 
import Login  from "../Pages/auth/Login";
import Signup from "../Pages/auth/Signup";
 
// Admin
import AdminLayout    from "../components/layout/AdminLayout";
import AdminDashboard from "../Pages/admin/AdminDashboard";
import UserManagement from "../Pages/admin/UserManagement";
 
// Instructor
import InstructorLayout    from "../components/layout/InstructorLayout";
import InstructorDashboard from "../Pages/instructor/InstructorDashboard";
import CreateExam          from "../Pages/instructor/CreateExam";
import ExamDetails         from "../Pages/instructor/ExamDetails";
import ManageQuestions     from "../Pages/instructor/ManageQuestions";
import InstructorCourses   from "../Pages/instructor/InstructorCourses";
 
// Student
import StudentLayout    from "../components/layout/StudentLayout";
import StudentDashboard from "../Pages/student/StudentDashboard";
import TakeExam          from "../Pages/student/TakeExam";
import ExamResult        from "../Pages/student/ExamResult";
import MyResults         from "../Pages/student/MyResults";
import ResultAnalysis    from "../Pages/student/ResultAnalysis";
 
// ── Placeholder — replace with a real 403 page if you have one ───────────
const Unauthorized = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F8F7FC]">
    <p className="text-4xl font-bold text-[#182033]">403</p>
    <p className="text-[#667085]">You don't have permission to view this page.</p>
    <a href="/login" className="text-[#6C3FF5] hover:underline text-sm">
      Back to login
    </a>
  </div>
);
// ───────────────────────────────────────────────────────────────────────────
 
export default function AppRoutes() {
  return (
    <Routes>
 
      {/* ── Public ─────────────────────────────────────────────────────── */}
      <Route path="/login"        element={<Login />} />
      <Route path="/signup"       element={<Signup />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/"             element={<Navigate to="/login" replace />} />
 
      {/* ── Protected (authenticated) ──────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
 
        {/* ── ADMIN ── */}
        <Route
          element={<RoleGuard allowedRoles={["ADMIN"]} redirectTo="/unauthorized" />}
        >
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users"     element={<UserManagement />} />
          </Route>
        </Route>
 
        {/* ── INSTRUCTOR ── */}
        <Route
          element={
            <RoleGuard allowedRoles={["INSTRUCTOR"]} redirectTo="/unauthorized" />
          }
        >
          <Route path="/instructor" element={<InstructorLayout />}>
            <Route index element={<Navigate to="/instructor/dashboard" replace />} />
            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="exams"     element={<InstructorDashboard />} />
 
            {/*
             *  exams/new must come BEFORE exams/:id and exams/:id/questions
             *  so React Router doesn't treat the literal "new" as an :id param.
             */}
            <Route path="exams/new"           element={<CreateExam />} />
            <Route path="exams/:id"           element={<ExamDetails />} />
            <Route path="exams/:id/questions" element={<ManageQuestions />} />
 
            <Route path="courses" element={<InstructorCourses />} />
          </Route>
        </Route>
 
        {/* ── STUDENT ── */}
        <Route
          element={
            <RoleGuard allowedRoles={["STUDENT"]} redirectTo="/unauthorized" />
          }
        >
          {/* Pages with the sidebar shell */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index      element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="results"   element={<MyResults />} />
            <Route path="result"    element={<ExamResult />} />
            <Route path="analysis/:attemptId/:examId" element={<ResultAnalysis />} />
            <Route path="analysis/:attemptId" element={<ResultAnalysis />} />
          </Route>
 
          {/* Full-screen — no sidebar during an active attempt (see note above) */}
          <Route path="/student/exams/:examId/take" element={<TakeExam />} />
        </Route>
 
      </Route>
 
      {/* ── Catch-all — must be last ───────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/login" replace />} />
 
    </Routes>
  );
}
 