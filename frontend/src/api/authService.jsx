import axiosInstance from "./axiosConfig";

/**
 * Login with username + password.
 * Backend returns a raw JWT string or { token: "..." }.
 * Normalise both shapes and always resolve with a plain token string.
 */
export const login = async (credentials) => {
  const response = await axiosInstance.post("/auth/login", credentials);
  const data = response.data;

  // Handle both: raw string token OR { token: "..." } / { data: "..." }
  if (typeof data === "string") return data;
  if (data?.token) return data.token;
  if (data?.data) return data.data;

  throw new Error("Unexpected login response format");
};

/**
 * Register a new user.
 * Backend returns { data: null, message: "User registered successfully", status: 201, ... }
 */
export const register = async (userData) => {
  const response = await axiosInstance.post("/auth/register", userData);
  return response.data; // { data, message, status, timestamp }
};