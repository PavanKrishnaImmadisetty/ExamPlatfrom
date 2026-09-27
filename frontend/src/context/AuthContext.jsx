import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { login as apiLogin } from "../api/authService";

const AuthContext = createContext(null);

/**
 * Safely decode a JWT and extract { user, role }.
 * Adjust the field names below to match whatever your Spring Boot
 * JWT payload actually contains (e.g. "sub", "role", "roles", "authorities").
 */
const decodeToken = (token) => {
  try {
    const decoded = jwtDecode(token);

    // Spring Boot commonly puts the principal as "sub" and roles as
    // "role" | "roles" | "authorities" — handle the common variants:
    const role =
      decoded.role ||
      decoded.roles?.[0] ||
      decoded.authorities?.[0]?.authority ||
      decoded.authorities?.[0] ||
      null;

    return {
      user: {
        username: decoded.sub || decoded.username || decoded.email || "",
        name: decoded.name || decoded.sub || "",
        email: decoded.email || "",
        id: decoded.userId || decoded.id || null,
      },
      role: typeof role === "string" ? role.replace(/^ROLE_/, "") : role,
      exp: decoded.exp,
    };
  } catch {
    return null;
  }
};

const isTokenExpired = (exp) => {
  if (!exp) return true;
  return Date.now() >= exp * 1000;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate state from stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const decoded = decodeToken(storedToken);
      if (decoded && !isTokenExpired(decoded.exp)) {
        setToken(storedToken);
        setUser(decoded.user);
        setRole(decoded.role);
      } else {
        // Token is missing or expired — clear storage
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const rawToken = await apiLogin(credentials);
    const decoded = decodeToken(rawToken);

    if (!decoded) throw new Error("Failed to decode token");
    if (isTokenExpired(decoded.exp)) throw new Error("Token is already expired");

    localStorage.setItem("token", rawToken);
    setToken(rawToken);
    setUser(decoded.user);
    setRole(decoded.role);

    return decoded.role; // caller uses this to redirect
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setRole(null);
  }, []);

  const value = {
    token,
    user,
    role,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export default AuthContext;