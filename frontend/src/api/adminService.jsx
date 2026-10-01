/**
 * adminService.js
 * All Admin-facing API calls.
 *
 * Backend responses are wrapped:
 *   { "data": <payload>, "message": "..." }
 * So we extract response.data.data to get the actual payload.
 *
 * Assumes an Axios instance (with JWT interceptor) is exported from
 * src/api/axiosInstance.js  — or swap for your own configured instance.
 */

import axios from "axios";

// ---------------------------------------------------------------------------
// Axios instance
// If you already have a configured instance (with baseURL + JWT interceptor)
// import it here instead:
//   import axiosInstance from "./axiosInstance";
// and replace every `axiosInstance` call below with your import name.
// ---------------------------------------------------------------------------
const axiosInstance = axios.create({
  baseURL: "https://examplatfrom.onrender.com",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT from localStorage on every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// GET /api/users/stats
// Response shape: { data: { totalUsers, totalAdmins, totalInstructors, totalStudents }, message }
// ---------------------------------------------------------------------------
export async function getSystemStats() {
  const response = await axiosInstance.get("/api/users/stats");
  return response.data.data; // { totalUsers, totalAdmins, totalInstructors, totalStudents }
}

// ---------------------------------------------------------------------------
// GET /api/users
// Response shape: { data: [ { id, name, email, role, status }, ... ], message }
// ---------------------------------------------------------------------------
export async function getAllUsers() {
  const response = await axiosInstance.get("/api/users");
  return response.data.data; // Array of user objects
}

// ---------------------------------------------------------------------------
// PUT /api/users/{userId}/role?newRole={role}
// newRole is a QUERY PARAMETER — no request body.
// Response shape: { status: 200, message: "Role updated", data: "string" }
// ---------------------------------------------------------------------------
export async function updateUserRole(userId, newRole) {
  const response = await axiosInstance.put(`/api/users/${userId}/role`, null, {
    params: { newRole },
  });
  return response.data; // { status, message, data }
}

// ---------------------------------------------------------------------------
// PATCH /api/users/{userId}/toggle-status
// Response shape: { status: 200, message: "User status updated to: ACTIVE", data: null }
// ---------------------------------------------------------------------------
export async function toggleUserStatus(userId) {
  const response = await axiosInstance.patch(`/api/users/${userId}/toggle-status`);
  return response.data; 
}