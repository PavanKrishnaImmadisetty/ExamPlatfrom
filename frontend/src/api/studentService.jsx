import axios from "axios";

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

export async function getPublishedExams() {
  const response = await axiosInstance.get("/api/exams/published");
  return response.data;
}

export async function startExam(examId) {
  const response = await axiosInstance.post(`/api/attempts/exam/${examId}`);
  return response.data;
}

function sanitizeOption(option) {
  const { correct, ...safeOption } = option;
  return safeOption;
}

function sanitizeQuestion(question) {
  const { correct, numericAnswer, options, ...safeQuestion } = question;
  return {
    ...safeQuestion,
    ...(Array.isArray(options)
      ? { options: options.map(sanitizeOption) }
      : {}),
  };
}

export async function getExamQuestions(examId) {
  const response = await axiosInstance.get(`/api/questions/exam/${examId}`);
  const questions = Array.isArray(response.data) ? response.data : [];
  return questions.map(sanitizeQuestion);
}

export async function saveResponse(attemptId, responsePayload) {
  const response = await axiosInstance.post(
    `/api/attempts/${attemptId}/responses`,
    responsePayload
  );
  return response.data;
}

export async function submitExam(attemptId) {
  const response = await axiosInstance.post(
    `/api/attempts/${attemptId}/submit`
  );
  return response.data;
}

export async function getMyResults() {
  const response = await axiosInstance.get("/api/attempts/my-results");
  return response.data;
}

// ---------------------------------------------------------------------------
// GET /api/attempts/{attemptId}
// Response: { id, examId, totalMarks, obtainedMarks, startTime, endTime } — direct
// Used on the post-submission Result Analysis page.
// ---------------------------------------------------------------------------
export async function getAttemptSummary(attemptId) {
  const response = await axiosInstance.get(`/api/attempts/${attemptId}`);
  return response.data;
}

// ---------------------------------------------------------------------------
// GET /api/attempts/{attemptId}/responses
// Response: array of
//   { questionId, selectedOptionId, selectedOptionText, answerText, obtainedMarks }
// returned directly. Used on the post-submission Result Analysis page.
// ---------------------------------------------------------------------------
export async function getAttemptResponses(attemptId) {
  const response = await axiosInstance.get(
    `/api/attempts/${attemptId}/responses`
  );
  return Array.isArray(response.data) ? response.data : [];
}

// ---------------------------------------------------------------------------
// GET /api/questions/exam/{examId}  — UNSANITIZED, ANSWER-KEY VERSION
//
// ⚠️ DO NOT use this during a live exam attempt. This hits the exact same
// endpoint as getExamQuestions() above, but deliberately KEEPS `correct`
// (on options) and `numericAnswer` (on the question), because the Result
// Analysis page needs them to show the student what the right answer was.
//
// getExamQuestions()            → live attempt        → strips correct/numericAnswer
// getExamQuestionsWithAnswers() → post-submission only → keeps them
//
// Only call this after an attempt has been submitted, never while a
// student is actively answering questions.
// ---------------------------------------------------------------------------
export async function getExamQuestionsWithAnswers(examId) {
  const response = await axiosInstance.get(`/api/questions/exam/${examId}`);
  return Array.isArray(response.data) ? response.data : [];
}