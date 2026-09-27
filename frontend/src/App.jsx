/**
 * App.jsx
 *
 * Thin shell: providers + router only.
 * All route definitions now live in src/routes/AppRoutes.jsx —
 * see that file for the full route map and routing decisions.
 */

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}