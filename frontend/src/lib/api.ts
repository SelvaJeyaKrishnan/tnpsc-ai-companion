import {
  Achievement,
  AnalyticsSummary,
  ExamSyllabus,
  StreakData,
  StudyPlan,
  StudyRoom,
  StudySession,
  StudyTask,
  TokenResponse,
  UserLoginPayload,
  UserProfile,
  UserRegisterPayload,
} from "@/types";

export function getApiBaseUrl(): string {
  // If explicitly configured via NEXT_PUBLIC_API_BASE_URL (production deployments), prioritize it
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  if (typeof window !== "undefined") {
    // Dynamic fallback for temporary staging tunnels
    if (window.location.hostname.endsWith(".loca.lt")) {
      return "https://eleven-carrots-do.loca.lt";
    }
  }
  return "http://localhost:8000";
}

const TOKEN_STORAGE_KEY = "tnpsc_auth_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "bypass-tunnel-reminder": "true",
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = "API request failed";
    try {
      const err = await res.json();
      errorDetail = err.detail || err.message || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

// Authentication
export async function registerUser(payload: UserRegisterPayload): Promise<TokenResponse> {
  const res = await fetchJson<TokenResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res.access_token) {
    setAuthToken(res.access_token);
  }
  return res;
}

export async function loginUser(payload: UserLoginPayload): Promise<TokenResponse> {
  const res = await fetchJson<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res.access_token) {
    setAuthToken(res.access_token);
  }
  return res;
}

export async function getUser(): Promise<UserProfile> {
  return fetchJson<UserProfile>("/api/auth/me");
}

export async function updateUser(data: Partial<UserProfile>): Promise<UserProfile> {
  return fetchJson<UserProfile>("/api/auth/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Study Sessions
export interface SessionCreatePayload {
  session_type: "countdown" | "stopwatch" | "pomodoro";
  subject: string;
  topic: string;
  duration_seconds: number;
  started_at: string;
  ended_at: string;
  completed?: boolean;
  notes?: string;
  pomodoro_cycles?: number;
  focus_minutes?: number;
  short_break_minutes?: number;
  long_break_minutes?: number;
}

export async function recordSession(payload: SessionCreatePayload): Promise<StudySession> {
  return fetchJson<StudySession>("/api/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getSessions(limit = 50, offset = 0): Promise<StudySession[]> {
  return fetchJson<StudySession[]>(`/api/sessions?limit=${limit}&offset=${offset}`);
}

export async function getRecentSessions(): Promise<StudySession[]> {
  return fetchJson<StudySession[]>("/api/sessions/recent");
}

// Streaks & Achievements
export async function getStreak(): Promise<StreakData> {
  return fetchJson<StreakData>("/api/streaks");
}

export async function getAchievements(): Promise<Achievement[]> {
  return fetchJson<Achievement[]>("/api/streaks/achievements");
}

// Analytics
export async function getAnalytics(
  period = "week",
  startDate?: string,
  endDate?: string
): Promise<AnalyticsSummary> {
  let query = `/api/analytics?period=${period}`;
  if (startDate && endDate) {
    query += `&start_date=${startDate}&end_date=${endDate}`;
  }
  return fetchJson<AnalyticsSummary>(query);
}

// Study Rooms
export async function getRooms(): Promise<StudyRoom[]> {
  return fetchJson<StudyRoom[]>("/api/rooms");
}

export async function createRoom(data: {
  name: string;
  description?: string;
  is_private: boolean;
  pass_code?: string;
  duration_minutes: number;
}): Promise<StudyRoom> {
  return fetchJson<StudyRoom>("/api/rooms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getRoomDetails(roomCode: string): Promise<StudyRoom> {
  return fetchJson<StudyRoom>(`/api/rooms/${roomCode}`);
}

export async function joinRoom(
  roomCode: string,
  passCode?: string,
  subject?: string,
  topic?: string
): Promise<StudyRoom> {
  return fetchJson<StudyRoom>(`/api/rooms/${roomCode}/join`, {
    method: "POST",
    body: JSON.stringify({ pass_code: passCode, subject, topic }),
  });
}

// Study Planner & Syllabus
export async function getSyllabus(exam = "Group 4"): Promise<ExamSyllabus> {
  return fetchJson<ExamSyllabus>(`/api/scheduler/syllabus?exam=${encodeURIComponent(exam)}`);
}

export async function getStudyPlan(): Promise<StudyPlan> {
  return fetchJson<StudyPlan>("/api/scheduler/plan");
}

export async function generateStudyPlan(data: {
  exam_type: string;
  target_exam_date: string;
  daily_study_hours: number;
  weak_subjects: string[];
  preferred_subjects?: string[];
}): Promise<StudyPlan> {
  return fetchJson<StudyPlan>("/api/scheduler/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateStudyTask(
  taskId: number,
  status: "pending" | "in_progress" | "completed" | "missed"
): Promise<StudyTask> {
  return fetchJson<StudyTask>(`/api/scheduler/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function rebalanceSchedule(planId?: number): Promise<{ message: string; reassigned_count: number; plan: StudyPlan }> {
  const query = planId ? `?plan_id=${planId}` : "";
  return fetchJson(`/api/scheduler/rebalance${query}`, {
    method: "POST",
  });
}

// AI Concept Tutor API
export async function askAiTutor(
  message: string,
  subject?: string,
  targetExam?: string,
  history?: Array<{ role: string; content: string }>
): Promise<{ reply: string; sources: string[]; suggested_topics: string[]; model: string }> {
  return fetchJson("/api/ai/tutor", {
    method: "POST",
    body: JSON.stringify({
      message,
      subject: subject || "General Studies",
      target_exam: targetExam || "Group 4",
      history: history || [],
    }),
  });
}
