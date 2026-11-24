import { AppApiError } from "@/types/api";
import {
  AccountExportData,
  Achievement,
  ActivityTimelineResponse,
  AnalyticsSummary,
  ChangePasswordPayload,
  ContinueLearningItem,
  CreateGoalPayload,
  DeleteAccountPayload,
  ExamSyllabus,
  ForgotPasswordPayload,
  GenericMessageResponse,
  GoalsDashboardSummary,
  MCQEvaluationPayload,
  MCQEvaluationResponse,
  DescriptiveEvaluationPayload,
  DescriptiveEvaluationResponse,
  OnboardingPayload,
  QuestionGenerateResponse,
  RecommendationDismissResponse,
  RecommendationListResponse,
  ResendVerificationPayload,
  ResetPasswordPayload,
  StreakData,
  StudyGoal,
  StudyPlan,
  StudyRoom,
  StudySession,
  ActiveFocusSessionResponse,
  FocusSessionStartPayload,
  FocusSessionCompletePayload,
  FocusSessionSummaryResponse,
  StudyTask,
  StudyMaterialListResponse,
  StudyMaterialDetailItem,
  StudyBookmarkResponse,
  StudyProgressResponse,
  AptitudePracticeQuestionItem,
  DailySchedule,
  GroupStudySession,
  PlannerDashboardOverview,
  ReminderDueResponse,
  RevisionSuggestionsResponse,
  RoomJoinRequest,
  RoomTimerState,
  RoomTimerHistoryItem,
  RoomMessage,
  RoomParticipant,
  RoomReport,
  SpacedRevision,
  StudyReminder,
  SyllabusBatchUpdateRequest,
  SyllabusOverallProgress,
  SyllabusTopicProgressResponse,
  SyllabusTopicProgressUpdate,
  SyllabusTopicsFilterResponse,
  SyllabusTopicOption,
  WeeklySchedule,
  TestAttemptHistoryItem,
  TestAttemptStartResponse,
  TestPaperDetail,
  TestPaperSummary,
  TestResultResponse,
  TNPSCExamSchedule,
  TokenResponse,
  UpdateGoalPayload,
  UserLoginPayload,
  UserProfile,
  UserRegisterPayload,
  UserStudyAvailability,
  UserStudyAvailabilityUpdate,
  RescheduleTaskRequest,
  TaskCompletionSummary,
  RegeneratePlanRequest,
  TimetableGenerateRequest,
  TimetableRegenerateDaysRequest,
  TimetableResponse,
  MoveTimetableSessionRequest,
  VerifyEmailPayload,
  PersonalizedDashboardAnalyticsResponse,
  SubjectTopicPerformanceResponse,
  DetailedMockTestAnalyticsResponse,
  DetailedStudyTimeAnalyticsResponse,
  WeakAreasAndAchievementsResponse,
  LeaderboardResponse,
  LeaderboardOptInRequest,
  LeaderboardOptInResponse,
  NotificationListResponse,
  NotificationSummaryResponse,
  NotificationActionResponse,
  PersonalizedRecommendationsResponse,
  OfficialExamSummary,
  OfficialExamDetail,
  ExamScheme,
  OfficialSyllabusVersion,
  OfficialSyllabusTopic,
  OfficialPYQItem,
  OfficialGovtStudyMaterial,
  OfficialNotificationItem,
  TopicProgressResponse,
  ExamSyllabusProgressResponse,
} from "@/types";

export function getApiBaseUrl(): string {
  // If explicitly configured via NEXT_PUBLIC_API_BASE_URL, use it
  if (process.env.NEXT_PUBLIC_API_BASE_URL !== undefined && process.env.NEXT_PUBLIC_API_BASE_URL !== null) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  if (typeof window !== "undefined") {
    // Dynamic fallback for temporary staging tunnels
    if (window.location.hostname.endsWith(".loca.lt")) {
      return "https://fast-frogs-film.loca.lt";
    }
    // In browser production deployments (e.g. Vercel Multi-Service), use same-origin relative paths ("")
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return "";
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

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr: unknown) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new AppApiError(
        "You are currently offline. This action requires an active internet connection.",
        0,
        { is_offline: true }
      );
    }
    throw netErr;
  }

  if (!res.ok) {
    let errorDetail = "API request failed";
    let errorPayload: unknown = undefined;
    try {
      const err = await res.json();
      errorPayload = err;
      errorDetail = err.detail || err.message || errorDetail;
    } catch {
      // ignore JSON parse error on non-JSON response
    }
    throw new AppApiError(errorDetail, res.status, errorPayload);
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

export async function logoutUser(): Promise<{ status: string; message: string }> {
  try {
    const res = await fetchJson<{ status: string; message: string }>("/api/auth/logout", {
      method: "POST",
    });
    return res;
  } catch {
    return { status: "ok", message: "Signed out locally" };
  } finally {
    clearAuthToken();
  }
}

export async function requestPasswordReset(payload: ForgotPasswordPayload): Promise<GenericMessageResponse> {
  return fetchJson<GenericMessageResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function executePasswordReset(payload: ResetPasswordPayload): Promise<GenericMessageResponse> {
  return fetchJson<GenericMessageResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyEmail(payload: VerifyEmailPayload): Promise<GenericMessageResponse> {
  return fetchJson<GenericMessageResponse>("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resendVerification(payload: ResendVerificationPayload): Promise<GenericMessageResponse> {
  return fetchJson<GenericMessageResponse>("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function submitOnboarding(payload: OnboardingPayload): Promise<UserProfile> {
  return fetchJson<UserProfile>("/api/auth/onboarding", {
    method: "POST",
    body: JSON.stringify(payload),
  });
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

export async function changePassword(payload: ChangePasswordPayload): Promise<GenericMessageResponse> {
  return fetchJson<GenericMessageResponse>("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteAccount(payload: DeleteAccountPayload): Promise<GenericMessageResponse> {
  return fetchJson<GenericMessageResponse>("/api/auth/delete-account", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function exportAccountData(): Promise<AccountExportData> {
  return fetchJson<AccountExportData>("/api/auth/export-data");
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

export async function startFocusSession(payload: FocusSessionStartPayload): Promise<StudySession> {
  return fetchJson<StudySession>("/api/sessions/start", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getActiveFocusSession(): Promise<ActiveFocusSessionResponse | null> {
  try {
    return await fetchJson<ActiveFocusSessionResponse | null>("/api/sessions/active");
  } catch {
    return null;
  }
}

export async function pauseFocusSession(sessionId: number): Promise<StudySession> {
  return fetchJson<StudySession>(`/api/sessions/${sessionId}/pause`, {
    method: "POST",
  });
}

export async function resumeFocusSession(sessionId: number): Promise<StudySession> {
  return fetchJson<StudySession>(`/api/sessions/${sessionId}/resume`, {
    method: "POST",
  });
}

export async function completeFocusSession(
  sessionId: number,
  payload?: FocusSessionCompletePayload
): Promise<StudySession> {
  return fetchJson<StudySession>(`/api/sessions/${sessionId}/complete`, {
    method: "POST",
    body: payload ? JSON.stringify(payload) : undefined,
  });
}

export async function abandonFocusSession(sessionId: number): Promise<StudySession> {
  return fetchJson<StudySession>(`/api/sessions/${sessionId}/abandon`, {
    method: "POST",
  });
}

export async function getFocusSessionSummary(): Promise<FocusSessionSummaryResponse> {
  return fetchJson<FocusSessionSummaryResponse>("/api/sessions/summary");
}

// Streaks & Achievements
export async function getStreak(): Promise<StreakData> {
  return fetchJson<StreakData>("/api/streaks");
}

export async function getAchievements(): Promise<Achievement[]> {
  return fetchJson<Achievement[]>("/api/streaks/achievements");
}

// Analytics
export async function getPersonalizedDashboardAnalytics(
  period = "7d",
  startDate?: string,
  endDate?: string
): Promise<PersonalizedDashboardAnalyticsResponse> {
  let query = `/api/analytics/dashboard?period=${encodeURIComponent(period)}`;
  if (startDate && endDate) {
    query += `&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
  }
  return fetchJson<PersonalizedDashboardAnalyticsResponse>(query);
}

export async function getSubjectTopicPerformance(
  period = "all",
  startDate?: string,
  endDate?: string,
  subject?: string,
  targetExam?: string
): Promise<SubjectTopicPerformanceResponse> {
  let query = `/api/analytics/subject-topic-performance?period=${encodeURIComponent(period)}`;
  if (startDate && endDate) {
    query += `&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
  }
  if (subject) {
    query += `&subject=${encodeURIComponent(subject)}`;
  }
  if (targetExam) {
    query += `&target_exam=${encodeURIComponent(targetExam)}`;
  }
  return fetchJson<SubjectTopicPerformanceResponse>(query);
}

export async function getDetailedMockTestAnalytics(
  period = "all",
  startDate?: string,
  endDate?: string,
  subject?: string
): Promise<DetailedMockTestAnalyticsResponse> {
  let query = `/api/analytics/mock-tests-detailed?period=${encodeURIComponent(period)}`;
  if (startDate && endDate) {
    query += `&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
  }
  if (subject) {
    query += `&subject=${encodeURIComponent(subject)}`;
  }
  return fetchJson<DetailedMockTestAnalyticsResponse>(query);
}

export async function getDetailedStudyTimeAnalytics(
  period = "7d",
  startDate?: string,
  endDate?: string,
  limit = 50
): Promise<DetailedStudyTimeAnalyticsResponse> {
  let query = `/api/analytics/study-time-detailed?period=${encodeURIComponent(period)}&limit=${limit}`;
  if (startDate && endDate) {
    query += `&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
  }
  return fetchJson<DetailedStudyTimeAnalyticsResponse>(query);
}

export async function getWeakAreasAndAchievementsAnalytics(
  limit = 20
): Promise<WeakAreasAndAchievementsResponse> {
  const query = `/api/analytics/weak-areas-achievements?limit=${limit}`;
  return fetchJson<WeakAreasAndAchievementsResponse>(query);
}

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
export async function getRooms(params?: {
  subject?: string;
  target_exam?: string;
  search?: string;
  is_private?: boolean;
}): Promise<StudyRoom[]> {
  const query = new URLSearchParams();
  if (params?.subject && params.subject !== "All Subjects") query.set("subject", params.subject);
  if (params?.target_exam && params.target_exam !== "All Exams") query.set("target_exam", params.target_exam);
  if (params?.search) query.set("search", params.search);
  if (params?.is_private !== undefined) query.set("is_private", String(params.is_private));
  const qs = query.toString() ? `?${query.toString()}` : "";
  return fetchJson<StudyRoom[]>(`/api/rooms${qs}`);
}

export async function createRoom(data: {
  name: string;
  description?: string;
  subject_focus?: string;
  target_exam?: string;
  is_private: boolean;
  pass_code?: string;
  duration_minutes: number;
  max_participants?: number;
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

export async function leaveRoom(roomCode: string): Promise<{ success: boolean; message: string }> {
  return fetchJson<{ success: boolean; message: string }>(`/api/rooms/${roomCode}/leave`, {
    method: "POST",
  });
}

export async function getRoomMessages(
  roomCode: string,
  limit = 50,
  beforeId?: number,
  afterId?: number
): Promise<RoomMessage[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (beforeId) params.append("before_id", String(beforeId));
  if (afterId) params.append("after_id", String(afterId));
  return fetchJson<RoomMessage[]>(`/api/rooms/${roomCode}/messages?${params.toString()}`);
}

export async function sendRoomMessage(
  roomCode: string,
  message: string,
  messageType = "text"
): Promise<RoomMessage> {
  return fetchJson<RoomMessage>(`/api/rooms/${roomCode}/messages`, {
    method: "POST",
    body: JSON.stringify({ message, message_type: messageType }),
  });
}

export async function deleteRoomMessage(
  roomCode: string,
  messageId: number
): Promise<{ success: boolean; message: string; message_id: number }> {
  return fetchJson<{ success: boolean; message: string; message_id: number }>(
    `/api/rooms/${roomCode}/messages/${messageId}`,
    { method: "DELETE" }
  );
}

export async function getRoomReports(
  roomCode: string,
  status?: string,
  limit = 50
): Promise<RoomReport[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (status) params.append("status", status);
  return fetchJson<RoomReport[]>(`/api/rooms/${roomCode}/reports?${params.toString()}`);
}

export async function reviewRoomReport(
  roomCode: string,
  reportId: number,
  action: "dismiss" | "action",
  actionTaken?: "warn" | "mute" | "kick" | "ban" | "delete_message",
  reason?: string
): Promise<RoomReport> {
  return fetchJson<RoomReport>(`/api/rooms/${roomCode}/reports/${reportId}/review`, {
    method: "POST",
    body: JSON.stringify({ action, action_taken: actionTaken, reason }),
  });
}

export async function moderateRoomParticipant(
  roomCode: string,
  targetUserId: number,
  action: "warn" | "mute" | "unmute" | "kick" | "ban",
  reason?: string
): Promise<{ success: boolean; action: string; username: string }> {
  return fetchJson<{ success: boolean; action: string; username: string }>(`/api/rooms/${roomCode}/moderate`, {
    method: "POST",
    body: JSON.stringify({ target_user_id: targetUserId, action, reason }),
  });
}

export async function reportRoomUser(
  roomCode: string,
  reportedUserId: number,
  reason: string,
  messageId?: number
): Promise<{ id: number; status: string }> {
  return fetchJson<{ id: number; status: string }>(`/api/rooms/${roomCode}/report`, {
    method: "POST",
    body: JSON.stringify({ reported_user_id: reportedUserId, reason, message_id: messageId }),
  });
}

export async function startRoomGroupSession(
  roomCode: string,
  subject: string,
  topic: string,
  durationMinutes = 25
): Promise<GroupStudySession> {
  return fetchJson<GroupStudySession>(`/api/rooms/${roomCode}/session/start`, {
    method: "POST",
    body: JSON.stringify({ subject, topic, duration_minutes: durationMinutes }),
  });
}

export async function endRoomGroupSession(roomCode: string): Promise<{ success: boolean; session_id?: number }> {
  return fetchJson<{ success: boolean; session_id?: number }>(`/api/rooms/${roomCode}/session/end`, {
    method: "POST",
  });
}

export async function updateRoom(
  roomCode: string,
  data: Partial<{
    name: string;
    description: string;
    subject_focus: string;
    target_exam: string;
    is_private: boolean;
    pass_code: string;
    duration_minutes: number;
    max_participants: number;
  }>
): Promise<StudyRoom> {
  return fetchJson<StudyRoom>(`/api/rooms/${roomCode}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function closeRoom(roomCode: string): Promise<{ success: boolean; message: string }> {
  return fetchJson<{ success: boolean; message: string }>(`/api/rooms/${roomCode}/close`, {
    method: "POST",
  });
}

export async function transferRoomOwnership(
  roomCode: string,
  newOwnerId: number
): Promise<{ success: boolean; message: string; new_owner_id: number; new_owner_name: string }> {
  return fetchJson<{ success: boolean; message: string; new_owner_id: number; new_owner_name: string }>(
    `/api/rooms/${roomCode}/transfer-ownership`,
    {
      method: "POST",
      body: JSON.stringify({ new_owner_id: newOwnerId }),
    }
  );
}

export async function getRoomParticipants(roomCode: string): Promise<RoomParticipant[]> {
  return fetchJson<RoomParticipant[]>(`/api/rooms/${roomCode}/participants`);
}

export async function updateParticipantRole(
  roomCode: string,
  targetUserId: number,
  role: "moderator" | "member"
): Promise<{ success: boolean; target_user_id: number; role: string }> {
  return fetchJson<{ success: boolean; target_user_id: number; role: string }>(
    `/api/rooms/${roomCode}/participants/${targetUserId}/role`,
    {
      method: "POST",
      body: JSON.stringify({ role }),
    }
  );
}

export async function requestToJoinRoom(roomCode: string, message?: string): Promise<RoomJoinRequest> {
  return fetchJson<RoomJoinRequest>(`/api/rooms/${roomCode}/join-request`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export async function getPendingJoinRequests(roomCode: string): Promise<RoomJoinRequest[]> {
  return fetchJson<RoomJoinRequest[]>(`/api/rooms/${roomCode}/join-requests`);
}

export async function reviewJoinRequest(
  roomCode: string,
  requestId: number,
  action: "accept" | "reject"
): Promise<{ success: boolean; request_id: number; status: string }> {
  return fetchJson<{ success: boolean; request_id: number; status: string }>(
    `/api/rooms/${roomCode}/join-requests/${requestId}/review`,
    {
      method: "POST",
      body: JSON.stringify({ action }),
    }
  );
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
  updates:
    | ("pending" | "in_progress" | "completed" | "missed")
    | {
        title?: string;
        description?: string;
        due_date?: string;
        status?: "pending" | "in_progress" | "completed" | "missed";
        duration_minutes?: number;
        priority?: "high" | "medium" | "low";
        date_scheduled?: string;
        topic?: string;
        rationale?: string;
      }
): Promise<StudyTask> {
  const body = typeof updates === "string" ? { status: updates } : updates;
  return fetchJson<StudyTask>(`/api/scheduler/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function getStudyTasks(params?: {
  date_scheduled?: string;
  subject?: string;
  status?: string;
  priority?: string;
  is_overdue?: boolean;
  search?: string;
  plan_id?: number;
}): Promise<{ tasks: StudyTask[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.date_scheduled) searchParams.append("date_scheduled", params.date_scheduled);
  if (params?.subject) searchParams.append("subject", params.subject);
  if (params?.status) searchParams.append("status", params.status);
  if (params?.priority) searchParams.append("priority", params.priority);
  if (params?.is_overdue !== undefined) searchParams.append("is_overdue", String(params.is_overdue));
  if (params?.search) searchParams.append("search", params.search);
  if (params?.plan_id) searchParams.append("plan_id", String(params.plan_id));
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return fetchJson<{ tasks: StudyTask[]; total: number }>(`/api/scheduler/tasks${queryString}`);
}

export async function getStudyTask(taskId: number): Promise<StudyTask> {
  return fetchJson<StudyTask>(`/api/scheduler/tasks/${taskId}`);
}

export async function getTasksSummary(): Promise<TaskCompletionSummary> {
  return fetchJson<TaskCompletionSummary>("/api/scheduler/tasks/summary");
}

export async function rebalanceSchedule(planId?: number): Promise<{ message: string; reassigned_count: number; plan: StudyPlan }> {
  const query = planId ? `?plan_id=${planId}` : "";
  return fetchJson(`/api/scheduler/rebalance${query}`, {
    method: "POST",
  });
}

// Phase 64 Planner & Productivity API Endpoints
export async function getPlannerDashboard(): Promise<PlannerDashboardOverview> {
  return fetchJson<PlannerDashboardOverview>("/api/scheduler/dashboard");
}

export async function getDailySchedule(date?: string): Promise<DailySchedule> {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return fetchJson<DailySchedule>(`/api/scheduler/schedule/daily${query}`);
}

export async function getWeeklySchedule(startDate?: string): Promise<WeeklySchedule> {
  const query = startDate ? `?start_date=${encodeURIComponent(startDate)}` : "";
  return fetchJson<WeeklySchedule>(`/api/scheduler/schedule/weekly${query}`);
}

export async function createCustomStudyTask(data: {
  title?: string;
  description?: string;
  due_date?: string;
  subject: string;
  topic: string;
  date_scheduled: string;
  duration_minutes?: number;
  priority?: "high" | "medium" | "low";
  is_revision?: boolean;
  plan_id?: number;
}): Promise<StudyTask> {
  return fetchJson<StudyTask>("/api/scheduler/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteStudyTask(taskId: number): Promise<{ success: boolean; message: string }> {
  return fetchJson<{ success: boolean; message: string }>(`/api/scheduler/tasks/${taskId}`, {
    method: "DELETE",
  });
}

export async function getStudyReminders(): Promise<StudyReminder[]> {
  return fetchJson<StudyReminder[]>("/api/scheduler/reminders");
}

export async function getDueReminders(): Promise<ReminderDueResponse> {
  return fetchJson<ReminderDueResponse>("/api/scheduler/reminders/due");
}

export async function acknowledgeReminder(id: number): Promise<{ success: boolean; message: string }> {
  return fetchJson<{ success: boolean; message: string }>(`/api/scheduler/reminders/${id}/acknowledge`, {
    method: "POST",
  });
}

export async function createStudyReminder(data: {
  title: string;
  reminder_type?: "daily_study" | "task_due" | "revision_alert" | "mock_test";
  time_of_day: string;
  specific_date?: string;
  days_of_week?: string[];
  subject?: string;
}): Promise<StudyReminder> {
  return fetchJson<StudyReminder>("/api/scheduler/reminders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateStudyReminder(
  id: number,
  data: Partial<{
    title: string;
    reminder_type: string;
    time_of_day: string;
    specific_date?: string;
    days_of_week: string[];
    is_active: boolean;
    subject: string;
  }>
): Promise<StudyReminder> {
  return fetchJson<StudyReminder>(`/api/scheduler/reminders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteStudyReminder(id: number): Promise<{ success: boolean; message: string }> {
  return fetchJson<{ success: boolean; message: string }>(`/api/scheduler/reminders/${id}`, {
    method: "DELETE",
  });
}

export async function getSpacedRevisions(completed?: boolean): Promise<SpacedRevision[]> {
  const query = completed !== undefined ? `?completed=${completed}` : "";
  return fetchJson<SpacedRevision[]>(`/api/scheduler/revisions${query}`);
}

export async function getRevisionSuggestions(): Promise<RevisionSuggestionsResponse> {
  return fetchJson<RevisionSuggestionsResponse>("/api/scheduler/revisions/suggestions");
}

export async function createSpacedRevision(data: {
  subject: string;
  topic: string;
  interval_stage?: number;
  retention_score?: number;
  target_date?: string;
  is_suggested?: boolean;
  notes?: string;
}): Promise<SpacedRevision> {
  return fetchJson<SpacedRevision>("/api/scheduler/revisions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function rescheduleSpacedRevision(id: number, newDate: string, notes?: string): Promise<SpacedRevision> {
  return fetchJson<SpacedRevision>(`/api/scheduler/revisions/${id}/reschedule`, {
    method: "POST",
    body: JSON.stringify({ new_date: newDate, notes }),
  });
}

export async function reviewSpacedRevision(id: number, retentionScore: number, notes?: string): Promise<SpacedRevision> {
  return fetchJson<SpacedRevision>(`/api/scheduler/revisions/${id}/review`, {
    method: "PATCH",
    body: JSON.stringify({ retention_score: retentionScore, notes }),
  });
}

export async function getSyllabusProgress(examType: string = "Group 4"): Promise<SyllabusOverallProgress> {
  return fetchJson<SyllabusOverallProgress>(`/api/scheduler/syllabus-progress?exam_type=${encodeURIComponent(examType)}`);
}

export async function updateSyllabusTopicProgress(
  data: SyllabusTopicProgressUpdate
): Promise<SyllabusTopicProgressResponse> {
  return fetchJson<SyllabusTopicProgressResponse>("/api/scheduler/syllabus-progress", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function filterSyllabusTopics(
  examType: string = "Group 4",
  options?: { subject?: string; status?: string; search?: string }
): Promise<SyllabusTopicsFilterResponse> {
  const params = new URLSearchParams({ exam_type: examType });
  if (options?.subject) params.append("subject", options.subject);
  if (options?.status) params.append("status", options.status);
  if (options?.search) params.append("search", options.search);
  return fetchJson<SyllabusTopicsFilterResponse>(`/api/scheduler/syllabus/topics?${params.toString()}`);
}

export async function flagTopicRevision(
  examType: string = "Group 4",
  subject: string,
  topic: string,
  needsRevision: boolean = true,
  createPlannerTask: boolean = false
): Promise<SyllabusTopicProgressResponse> {
  const params = new URLSearchParams({
    exam_type: examType,
    subject,
    topic,
    needs_revision: String(needsRevision),
    create_planner_task: String(createPlannerTask),
  });
  return fetchJson<SyllabusTopicProgressResponse>(`/api/scheduler/syllabus-progress/flag-revision?${params.toString()}`, {
    method: "POST",
  });
}

export async function batchUpdateSyllabusProgress(
  examType: string = "Group 4",
  updates: SyllabusTopicProgressUpdate[]
): Promise<SyllabusOverallProgress> {
  const payload: SyllabusBatchUpdateRequest = { exam_type: examType, updates };
  return fetchJson<SyllabusOverallProgress>("/api/scheduler/syllabus-progress/batch", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Phase 65: Personalized Study Schedule & Availability APIs
export async function getUserAvailability(): Promise<UserStudyAvailability> {
  return fetchJson<UserStudyAvailability>("/api/scheduler/availability");
}

export async function updateUserAvailability(payload: UserStudyAvailabilityUpdate): Promise<UserStudyAvailability> {
  return fetchJson<UserStudyAvailability>("/api/scheduler/availability", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function generatePersonalizedPlan(payload: {
  exam_type: string;
  target_exam_date: string;
  daily_study_hours: number;
  weak_subjects?: string[];
  preferred_subjects?: string[];
}): Promise<StudyPlan> {
  return fetchJson<StudyPlan>("/api/scheduler/plan/personalized", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function regenerateStudyPlan(payload: RegeneratePlanRequest): Promise<StudyPlan> {
  return fetchJson<StudyPlan>("/api/scheduler/plan/regenerate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function togglePlanPause(pause?: boolean): Promise<{ success: boolean; is_paused: boolean; message: string }> {
  const query = pause !== undefined ? `?pause=${pause}` : "";
  return fetchJson<{ success: boolean; is_paused: boolean; message: string }>(`/api/scheduler/plan/pause${query}`, {
    method: "POST",
  });
}

export async function rescheduleStudyTask(payload: RescheduleTaskRequest): Promise<StudyTask> {
  return fetchJson<StudyTask>("/api/scheduler/schedule/reschedule-task", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Phase 67 Smart Timetable Generator API
export async function generateSmartTimetable(payload: TimetableGenerateRequest): Promise<TimetableResponse> {
  return fetchJson<TimetableResponse>("/api/scheduler/timetable/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getTimetableView(
  startDate: string,
  endDate: string,
  scope: "daily" | "weekly" | "custom" = "weekly"
): Promise<TimetableResponse> {
  const query = `?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}&scope=${encodeURIComponent(scope)}`;
  return fetchJson<TimetableResponse>(`/api/scheduler/timetable${query}`);
}

export async function regenerateTimetableDays(payload: TimetableRegenerateDaysRequest): Promise<TimetableResponse> {
  return fetchJson<TimetableResponse>("/api/scheduler/timetable/regenerate-days", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function moveTimetableSession(payload: MoveTimetableSessionRequest): Promise<StudyTask> {
  return fetchJson<StudyTask>("/api/scheduler/timetable/move-session", {
    method: "POST",
    body: JSON.stringify(payload),
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

// Phase 34: Modular AI Tutor APIs
import {
  TutorModeInfo,
  AIConversationSummary,
  AIConversationDetail,
  TutorQueryPayload,
  TutorQueryResponse,
  GSTutorResponse,
  AptitudeTutorResponse,
} from "@/types";

export async function queryAptitudeTutor(payload: TutorQueryPayload): Promise<AptitudeTutorResponse> {
  return fetchJson("/api/ai/tutors/aptitude", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function queryGeneralStudiesTutor(payload: TutorQueryPayload): Promise<GSTutorResponse> {
  return fetchJson("/api/ai/tutors/general-studies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getTutorModes(): Promise<TutorModeInfo[]> {
  return fetchJson("/api/ai/modes");
}

export async function queryAiTutorModular(payload: TutorQueryPayload): Promise<TutorQueryResponse> {
  return fetchJson("/api/ai/query", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAIConversations(params?: {
  includeArchived?: boolean;
  search?: string;
  tutorMode?: string;
  subject?: string;
  sortBy?: "updated_at" | "created_at";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}): Promise<AIConversationSummary[]> {
  const query = new URLSearchParams();
  if (params?.includeArchived) query.append("include_archived", "true");
  if (params?.search && params.search.trim()) query.append("search", params.search.trim());
  if (params?.tutorMode && params.tutorMode !== "all") query.append("tutor_mode", params.tutorMode);
  if (params?.subject && params.subject !== "all") query.append("subject", params.subject);
  if (params?.sortBy) query.append("sort_by", params.sortBy);
  if (params?.sortOrder) query.append("sort_order", params.sortOrder);
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.offset) query.append("offset", params.offset.toString());

  const qs = query.toString();
  return fetchJson(`/api/ai/conversations${qs ? `?${qs}` : ""}`);
}

export async function getAIConversationDetail(conversationId: number): Promise<AIConversationDetail> {
  return fetchJson(`/api/ai/conversations/${conversationId}`);
}

export async function createAIConversation(data: {
  title?: string;
  tutor_mode?: string;
  subject?: string;
  target_exam?: string;
  preferred_language?: string;
}): Promise<AIConversationDetail> {
  return fetchJson("/api/ai/conversations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAIConversation(
  conversationId: number,
  data: { title?: string; is_archived?: boolean }
): Promise<AIConversationDetail> {
  return fetchJson(`/api/ai/conversations/${conversationId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAIConversation(conversationId: number): Promise<void> {
  return fetchJson(`/api/ai/conversations/${conversationId}`, {
    method: "DELETE",
  });
}

// Mock Tests Engine APIs
export async function getTestPapers(examCategory?: string, subject?: string): Promise<TestPaperSummary[]> {
  const params = new URLSearchParams();
  if (examCategory && examCategory !== "All") params.append("exam_category", examCategory);
  if (subject && subject !== "All") params.append("subject", subject);
  const query = params.toString() ? `?${params.toString()}` : "";
  return fetchJson(`/api/tests${query}`);
}

export async function getTestPaperDetail(slug: string): Promise<TestPaperDetail> {
  return fetchJson(`/api/tests/${slug}`);
}

export async function startTestAttempt(slug: string): Promise<TestAttemptStartResponse> {
  return fetchJson(`/api/tests/${slug}/start`, {
    method: "POST",
  });
}

export async function getAttemptState(attemptId: number): Promise<TestAttemptStartResponse> {
  return fetchJson(`/api/tests/attempts/${attemptId}`);
}

export async function saveTestAnswer(
  attemptId: number,
  questionId: number,
  selectedOptionIndex: number | null,
  isMarkedForReview = false
): Promise<{ question_id: number; selected_option_index: number | null; is_marked_for_review: boolean; saved: boolean }> {
  return fetchJson(`/api/tests/attempts/${attemptId}/save-answer`, {
    method: "POST",
    body: JSON.stringify({
      question_id: questionId,
      selected_option_index: selectedOptionIndex,
      is_marked_for_review: isMarkedForReview,
    }),
  });
}

export async function submitTestAttempt(attemptId: number): Promise<TestResultResponse> {
  return fetchJson(`/api/tests/attempts/${attemptId}/submit`, {
    method: "POST",
  });
}

export async function getTestResult(attemptId: number): Promise<TestResultResponse> {
  return fetchJson(`/api/tests/attempts/${attemptId}/result`);
}

export async function getTestHistory(): Promise<TestAttemptHistoryItem[]> {
  return fetchJson("/api/tests/history");
}

// ==========================================
// Examination Engine v1 Strongly-Typed APIs
// ==========================================

export async function getExams(): Promise<OfficialExamSummary[]> {
  return fetchJson<OfficialExamSummary[]>("/api/official-resources/exams");
}

export async function getExamTests(examCategory?: string, subject?: string): Promise<TestPaperSummary[]> {
  return getTestPapers(examCategory, subject);
}

export async function getExamTestDetail(slug: string): Promise<TestPaperDetail> {
  return getTestPaperDetail(slug);
}

export async function startExamAttempt(slug: string): Promise<TestAttemptStartResponse> {
  return startTestAttempt(slug);
}

export async function getExamAttempt(attemptId: number): Promise<TestAttemptStartResponse> {
  return getAttemptState(attemptId);
}

export async function saveExamAnswer(
  attemptId: number,
  questionId: number,
  selectedOptionIndex: number | null,
  isMarkedForReview: boolean = false
): Promise<{ question_id: number; selected_option_index: number | null; is_marked_for_review: boolean; saved: boolean }> {
  return saveTestAnswer(attemptId, questionId, selectedOptionIndex, isMarkedForReview);
}

export async function submitExamAttempt(attemptId: number): Promise<TestResultResponse> {
  return submitTestAttempt(attemptId);
}

export async function getExamResult(attemptId: number): Promise<TestResultResponse> {
  return getTestResult(attemptId);
}

export async function getExamReview(attemptId: number): Promise<TestResultResponse> {
  return getTestResult(attemptId);
}

export async function getExamHistory(): Promise<TestAttemptHistoryItem[]> {
  return getTestHistory();
}

export async function getExamSchedules(): Promise<TNPSCExamSchedule[]> {
  return fetchJson("/api/scheduler/exam-schedules");
}

export async function getExamScheduleById(examId: string): Promise<TNPSCExamSchedule> {
  return fetchJson(`/api/scheduler/exam-schedules/${encodeURIComponent(examId)}`);
}

export async function getStudyGoals(status?: string): Promise<StudyGoal[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return fetchJson<StudyGoal[]>(`/api/goals${query}`);
}

export async function getGoalsSummary(): Promise<GoalsDashboardSummary> {
  return fetchJson<GoalsDashboardSummary>("/api/goals/summary");
}

export async function createStudyGoal(payload: CreateGoalPayload): Promise<StudyGoal> {
  return fetchJson<StudyGoal>("/api/goals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateStudyGoal(id: number, payload: UpdateGoalPayload): Promise<StudyGoal> {
  return fetchJson<StudyGoal>(`/api/goals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteStudyGoal(id: number): Promise<{ message: string; goal_id: number }> {
  return fetchJson<{ message: string; goal_id: number }>(`/api/goals/${id}`, {
    method: "DELETE",
  });
}

export async function getContinueLearning(): Promise<ContinueLearningItem[]> {
  return fetchJson<ContinueLearningItem[]>("/api/analytics/continue-learning");
}

export async function getActivityTimeline(
  category = "all",
  limit = 20,
  offset = 0
): Promise<ActivityTimelineResponse> {
  const params = new URLSearchParams({
    category,
    limit: String(limit),
    offset: String(offset),
  });
  return fetchJson<ActivityTimelineResponse>(`/api/analytics/activity-timeline?${params.toString()}`);
}

export async function generatePracticeQuestions(payload: {
  subject: string;
  topic?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  count?: number;
}): Promise<QuestionGenerateResponse> {
  return fetchJson("/api/ai/practice-questions/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function evaluateMCQAnswer(payload: MCQEvaluationPayload): Promise<MCQEvaluationResponse> {
  return fetchJson("/api/ai/evaluation/mcq", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function evaluateDescriptiveAnswer(
  payload: DescriptiveEvaluationPayload
): Promise<DescriptiveEvaluationResponse> {
  return fetchJson("/api/ai/evaluation/descriptive", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getLearningRecommendations(
  limit: number = 5,
  includeDismissed: boolean = false
): Promise<RecommendationListResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    include_dismissed: String(includeDismissed),
  });
  return fetchJson(`/api/recommendations?${params.toString()}`);
}

export async function dismissRecommendation(
  recId: string
): Promise<RecommendationDismissResponse> {
  return fetchJson(`/api/recommendations/${encodeURIComponent(recId)}/dismiss`, {
    method: "POST",
  });
}

export async function resetRecommendationDismissals(): Promise<RecommendationDismissResponse> {
  return fetchJson("/api/recommendations/reset-dismissals", {
    method: "POST",
  });
}

// ---------------------------------------------------------
// Study Materials Client Methods (Phase 54)
// ---------------------------------------------------------
export async function getStudyMaterials(params?: {
  category?: string;
  subject?: string;
  academic_class?: string;
  language?: string;
  exam_category?: string;
  search?: string;
  bookmarked_only?: boolean;
  page?: number;
  page_size?: number;
}): Promise<StudyMaterialListResponse> {
  const qp = new URLSearchParams();
  if (params?.category && params.category !== "All") qp.append("category", params.category);
  if (params?.subject && params.subject !== "All") qp.append("subject", params.subject);
  if (params?.academic_class && params.academic_class !== "All") qp.append("academic_class", params.academic_class);
  if (params?.language && params.language !== "All") qp.append("language", params.language);
  if (params?.exam_category && params.exam_category !== "All") qp.append("exam_category", params.exam_category);
  if (params?.search) qp.append("search", params.search);
  if (params?.bookmarked_only) qp.append("bookmarked_only", "true");
  if (params?.page) qp.append("page", String(params.page));
  if (params?.page_size) qp.append("page_size", String(params.page_size));

  return fetchJson(`/api/study-materials${qp.toString() ? `?${qp.toString()}` : ""}`);
}

export async function getStudyMaterialDetail(materialId: number): Promise<StudyMaterialDetailItem> {
  return fetchJson(`/api/study-materials/${materialId}`);
}

export async function toggleStudyMaterialBookmark(
  materialId: number,
  notes?: string
): Promise<StudyBookmarkResponse> {
  return fetchJson(`/api/study-materials/${materialId}/bookmark`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}

export async function updateStudyMaterialProgress(
  materialId: number,
  payload: { completed_chunks_count: number; total_chunks_count: number; is_completed?: boolean }
): Promise<StudyProgressResponse> {
  return fetchJson(`/api/study-materials/${materialId}/progress`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAptitudePracticeQuestions(
  topic?: string
): Promise<AptitudePracticeQuestionItem[]> {
  const qp = new URLSearchParams();
  if (topic && topic !== "All") qp.append("topic", topic);
  return fetchJson<AptitudePracticeQuestionItem[]>(
    `/api/study-materials/aptitude/practice-questions${qp.toString() ? `?${qp.toString()}` : ""}`
  );
}

// ---------------------------------------------------------
// Phase 77: Structured Collaborative Study Sessions
// ---------------------------------------------------------
export async function getVerifiedSyllabusTopics(): Promise<SyllabusTopicOption[]> {
  return fetchJson<SyllabusTopicOption[]>("/api/rooms/syllabus/topics");
}

export async function createStructuredGroupSession(
  roomCode: string,
  payload: {
    title: string;
    subject: string;
    topic: string;
    duration_minutes: number;
    planned_start_at?: string;
    start_now?: boolean;
  }
): Promise<GroupStudySession> {
  return fetchJson<GroupStudySession>(`/api/rooms/${roomCode}/sessions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listRoomGroupSessions(
  roomCode: string,
  status?: string
): Promise<GroupStudySession[]> {
  const qp = status ? `?status=${encodeURIComponent(status)}` : "";
  return fetchJson<GroupStudySession[]>(`/api/rooms/${roomCode}/sessions${qp}`);
}

export async function getRoomGroupSessionDetail(
  roomCode: string,
  sessionId: number
): Promise<GroupStudySession> {
  return fetchJson<GroupStudySession>(`/api/rooms/${roomCode}/sessions/${sessionId}`);
}

export async function joinRoomGroupSession(
  roomCode: string,
  sessionId: number
): Promise<GroupStudySession> {
  return fetchJson<GroupStudySession>(`/api/rooms/${roomCode}/sessions/${sessionId}/join`, {
    method: "POST",
  });
}

export async function leaveRoomGroupSession(
  roomCode: string,
  sessionId: number
): Promise<GroupStudySession> {
  return fetchJson<GroupStudySession>(`/api/rooms/${roomCode}/sessions/${sessionId}/leave`, {
    method: "POST",
  });
}

export async function startScheduledGroupSession(
  roomCode: string,
  sessionId: number
): Promise<GroupStudySession> {
  return fetchJson<GroupStudySession>(`/api/rooms/${roomCode}/sessions/${sessionId}/start`, {
    method: "POST",
  });
}

export async function endActiveRoomGroupSession(
  roomCode: string,
  sessionId: number
): Promise<GroupStudySession> {
  return fetchJson<GroupStudySession>(`/api/rooms/${roomCode}/sessions/${sessionId}/end`, {
    method: "POST",
  });
}

export async function cancelScheduledGroupSession(
  roomCode: string,
  sessionId: number
): Promise<GroupStudySession> {
  return fetchJson<GroupStudySession>(`/api/rooms/${roomCode}/sessions/${sessionId}/cancel`, {
    method: "POST",
  });
}

// ==============================================================================
// PHASE 78: SHARED GROUP FOCUS TIMER API
// ==============================================================================

export async function getRoomTimerState(roomCode: string): Promise<RoomTimerState> {
  return fetchJson<RoomTimerState>(`/api/rooms/${roomCode}/timer`);
}

export async function startRoomTimer(
  roomCode: string,
  payload?: { duration_minutes?: number; phase?: string; expected_version?: number }
): Promise<RoomTimerState> {
  return fetchJson<RoomTimerState>(`/api/rooms/${roomCode}/timer/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

export async function pauseRoomTimer(
  roomCode: string,
  expected_version?: number
): Promise<RoomTimerState> {
  return fetchJson<RoomTimerState>(`/api/rooms/${roomCode}/timer/pause`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expected_version ? { expected_version } : {}),
  });
}

export async function resumeRoomTimer(
  roomCode: string,
  expected_version?: number
): Promise<RoomTimerState> {
  return fetchJson<RoomTimerState>(`/api/rooms/${roomCode}/timer/resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expected_version ? { expected_version } : {}),
  });
}

export async function transitionRoomTimerPhase(
  roomCode: string,
  phase: "focus" | "short_break" | "long_break" | "completed",
  cycle_number?: number,
  expected_version?: number
): Promise<RoomTimerState> {
  return fetchJson<RoomTimerState>(`/api/rooms/${roomCode}/timer/phase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phase, cycle_number, expected_version }),
  });
}

export async function endRoomTimer(
  roomCode: string,
  expected_version?: number
): Promise<RoomTimerState> {
  return fetchJson<RoomTimerState>(`/api/rooms/${roomCode}/timer/end`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expected_version ? { expected_version } : {}),
  });
}

export async function resetRoomTimer(
  roomCode: string,
  expected_version?: number
): Promise<RoomTimerState> {
  return fetchJson<RoomTimerState>(`/api/rooms/${roomCode}/timer/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expected_version ? { expected_version } : {}),
  });
}

export async function configureRoomTimer(
  roomCode: string,
  payload: {
    focus_minutes?: number;
    short_break_minutes?: number;
    long_break_minutes?: number;
    target_cycles?: number;
    preset?: "pomodoro_classic" | "pomodoro_extended" | "custom";
    expected_version?: number;
  }
): Promise<RoomTimerState> {
  return fetchJson<RoomTimerState>(`/api/rooms/${roomCode}/timer/configure`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getRoomTimerHistory(
  roomCode: string,
  limit = 50
): Promise<RoomTimerHistoryItem[]> {
  return fetchJson<RoomTimerHistoryItem[]>(`/api/rooms/${roomCode}/timer/history?limit=${limit}`);
}

// ==============================================================================
// PHASE 90: LEADERBOARDS, NOTIFICATIONS & PERSONALIZED RECOMMENDATIONS API
// ==============================================================================

export async function getLeaderboard(
  metric = "study_time",
  period = "week",
  limit = 10
): Promise<LeaderboardResponse> {
  return fetchJson<LeaderboardResponse>(
    `/api/analytics/leaderboard?metric=${encodeURIComponent(metric)}&period=${encodeURIComponent(period)}&limit=${limit}`
  );
}

export async function updateLeaderboardOptIn(
  payload: LeaderboardOptInRequest
): Promise<LeaderboardOptInResponse> {
  return fetchJson<LeaderboardOptInResponse>("/api/analytics/leaderboard/opt-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getNotifications(params?: {
  unread_only?: boolean;
  category?: string;
  limit?: number;
}): Promise<NotificationListResponse> {
  const query = new URLSearchParams();
  if (params?.unread_only !== undefined) {
    query.set("unread_only", String(params.unread_only));
  }
  if (params?.category) {
    query.set("category", params.category);
  }
  if (params?.limit) {
    query.set("limit", String(params.limit));
  }
  const qs = query.toString() ? `?${query.toString()}` : "";
  return fetchJson<NotificationListResponse>(`/api/notifications${qs}`);
}

export async function getNotificationSummary(): Promise<NotificationSummaryResponse> {
  return fetchJson<NotificationSummaryResponse>("/api/notifications/summary");
}

export async function markNotificationRead(id: number): Promise<NotificationActionResponse> {
  return fetchJson<NotificationActionResponse>(`/api/notifications/${id}/read`, {
    method: "POST",
  });
}

export async function markAllNotificationsRead(): Promise<NotificationActionResponse> {
  return fetchJson<NotificationActionResponse>("/api/notifications/read-all", {
    method: "POST",
  });
}

export async function dismissNotification(id: number): Promise<NotificationActionResponse> {
  return fetchJson<NotificationActionResponse>(`/api/notifications/${id}`, {
    method: "DELETE",
  });
}

export async function getPersonalizedRecommendations(
  limit = 5
): Promise<PersonalizedRecommendationsResponse> {
  return fetchJson<PersonalizedRecommendationsResponse>(
    `/api/analytics/recommendations?limit=${limit}`
  );
}

export async function dismissAnalyticsRecommendation(
  recommendationId: string
): Promise<{ success: boolean; message: string; dismissed_id: string }> {
  return fetchJson<{ success: boolean; message: string; dismissed_id: string }>(
    `/api/analytics/recommendations/${encodeURIComponent(recommendationId)}/dismiss`,
    {
      method: "POST",
    }
  );
}

// ==============================================================================
// EXPANDED OFFICIAL STUDY RESOURCES API CLIENT
// ==============================================================================

export async function getOfficialExams(): Promise<OfficialExamSummary[]> {
  return fetchJson<OfficialExamSummary[]>("/api/official-resources/exams");
}

export async function getOfficialExamDetail(examId: string): Promise<OfficialExamDetail> {
  return fetchJson<OfficialExamDetail>(`/api/official-resources/exams/${encodeURIComponent(examId)}`);
}

export async function getOfficialExamScheme(examId: string): Promise<ExamScheme> {
  return fetchJson<ExamScheme>(`/api/official-resources/exams/${encodeURIComponent(examId)}/scheme`);
}

export async function getOfficialExamSyllabus(examId: string): Promise<OfficialSyllabusVersion> {
  return fetchJson<OfficialSyllabusVersion>(`/api/official-resources/exams/${encodeURIComponent(examId)}/syllabus`);
}

export async function getOfficialExamSyllabusVersions(examId: string): Promise<OfficialSyllabusVersion[]> {
  return fetchJson<OfficialSyllabusVersion[]>(`/api/official-resources/exams/${encodeURIComponent(examId)}/syllabus/versions`);
}

export async function getOfficialExamPyqs(
  examId: string,
  year?: number,
  statusFilter?: string
): Promise<OfficialPYQItem[]> {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (statusFilter) params.append("status_filter", statusFilter);
  const q = params.toString() ? `?${params.toString()}` : "";
  return fetchJson<OfficialPYQItem[]>(`/api/official-resources/exams/${encodeURIComponent(examId)}/pyqs${q}`);
}

export async function getOfficialExamGovtMaterials(
  examId: string,
  materialType?: string
): Promise<OfficialGovtStudyMaterial[]> {
  const params = new URLSearchParams();
  if (materialType) params.append("material_type", materialType);
  const q = params.toString() ? `?${params.toString()}` : "";
  return fetchJson<OfficialGovtStudyMaterial[]>(`/api/official-resources/exams/${encodeURIComponent(examId)}/materials${q}`);
}

export async function getOfficialExamNotifications(examId: string): Promise<OfficialNotificationItem[]> {
  return fetchJson<OfficialNotificationItem[]>(`/api/official-resources/exams/${encodeURIComponent(examId)}/notifications`);
}

export async function getOfficialTopicResources(topicId: string): Promise<{
  topic: OfficialSyllabusTopic;
  exam_id: string;
  exam_name: string;
  scert_references: string[];
  career_services_module?: string | null;
  related_materials: OfficialGovtStudyMaterial[];
  official_source: string;
}> {
  return fetchJson(`/api/official-resources/topics/${encodeURIComponent(topicId)}/resources`);
}

export async function updateOfficialTopicProgress(
  topicId: string,
  examId: string,
  payload: {
    status: "not_started" | "in_progress" | "completed";
    mastery_percentage?: number;
    is_revision_needed?: boolean;
    notes?: string;
  }
): Promise<TopicProgressResponse> {
  return fetchJson<TopicProgressResponse>(
    `/api/official-resources/topics/${encodeURIComponent(topicId)}/progress?exam_id=${encodeURIComponent(examId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
}

export async function getOfficialExamProgress(examId: string): Promise<ExamSyllabusProgressResponse> {
  return fetchJson<ExamSyllabusProgressResponse>(`/api/official-resources/exams/${encodeURIComponent(examId)}/progress`);
}








