import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
});

export function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (error?.code === "ECONNABORTED") {
    return "The analysis took too long. Please try again.";
  }

  if (!error?.response) {
    return `Cannot reach the backend at ${API_URL}. Make sure it is running (uvicorn app:app --reload).`;
  }

  return `The backend returned an error (HTTP ${error.response.status}).`;
}

export default api;
