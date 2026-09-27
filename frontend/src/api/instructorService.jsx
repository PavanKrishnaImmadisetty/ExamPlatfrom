/**
 * instructorService.js
 * All Instructor-facing API calls.
 *
 * Field names match the backend spec exactly:
 *   examTitle, examDuration, correct (not isCorrect), etc.
 *
 * NOTE: createExam returns a plain string ("exam created success"), NOT a
 * wrapped object, so we return response.data directly for that one endpoint.
 * All other endpoints follow the standard { data: <payload>, message } wrapper,
 * so we extract response.data.data.
 *
 * Replace the axiosInstance block below with your own configured instance if
 * you already have one (e.g. import axiosInstance from "./axiosInstance").
 */

import axios from "axios";

// ---------------------------------------------------------------------------
// Axios instance — swap with your own if you have one already configured
// ---------------------------------------------------------------------------
const axiosInstance = axios.create({
  baseURL: "http://localhost:8081",
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// POST /api/exams
//
// Payload shape (all fields required by backend):
// {
//   examTitle: "",
//   examDescription: "",
//   examDate: "",          // "YYYY-MM-DD"
//   examStartTime: "",     // "HH:MM"
//   examEndTime: "",       // "HH:MM"
//   examDuration: 0,       // minutes
//   marks: 0,
//   questions: []          // always empty on creation
// }
//
// Response: plain string — "exam created success"
// The backend does NOT return the new exam's ID, so after creation we
// navigate to the dashboard where the new exam will appear in the list.
// ---------------------------------------------------------------------------
export async function createExam(examData) {
  const response = await axiosInstance.post("/api/exams", {
    ...examData,
    questions: [], // always empty at shell-creation time
  });
  return response.data; // plain string, not a wrapped object
}

// ---------------------------------------------------------------------------
// POST /api/questions/exam/{examId}
//
// Payload shape:
// {
//   questionText: "",
//   questionType: "MCQ",
//   marks: 1,
//   questionOrder: 1,
//   options: [
//     { optionText: "", isCorrect: true },
//     { optionText: "", isCorrect: false },
//     ...
//   ]
// }
//
// Response: wrapped { data: <question>, message }
// ---------------------------------------------------------------------------
export async function addQuestionToExam(examId, questionData) {
  const response = await axiosInstance.post(
    `/api/questions/exam/${examId}`,
    questionData
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// GET /api/questions/exam/{examId}
// Response: wrapped { data: [ ...questions ], message }
// ---------------------------------------------------------------------------
export async function getExamQuestions(examId) {
  const response = await axiosInstance.get(`/api/questions/exam/${examId}`);
  return response.data; // array of question objects
}

// ---------------------------------------------------------------------------
// PATCH /api/exams/{examId}/toggle-status
// Toggles between PUBLISHED / UNPUBLISHED (or DRAFT — whatever the backend uses)
// Response: wrapped { data: <exam>, message }
// ---------------------------------------------------------------------------
export async function toggleExamStatus(examId) {
  const response = await axiosInstance.patch(
    `/api/exams/${examId}/toggle-status`
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// GET /api/exams/my-exams
// Returns the authenticated instructor's own exams.
// Response: wrapped { data: [ ...exams ], message }
// ---------------------------------------------------------------------------
export async function getMyExams() {
  const response = await axiosInstance.get("/api/exams/my-exams");
  return response.data; // array of exam objects
}

export async function getExamById(id) {
  const response = await axiosInstance.get(`/api/exams/${id}`);
  return response.data;
}

export async function updateExam(id, data) {
  const response = await axiosInstance.put(`/api/exams/${id}`, data);
  return response.data;
}

export async function deleteExam(id) {
  const response = await axiosInstance.delete(`/api/exams/${id}`);
  return response.data;
}

export async function updateQuestion(id, data) {
  const response = await axiosInstance.put(`/api/questions/${id}`, data);
  return response.data;
}

export async function deleteQuestion(id) {
  const response = await axiosInstance.delete(`/api/questions/${id}`);
  return response.data;
}