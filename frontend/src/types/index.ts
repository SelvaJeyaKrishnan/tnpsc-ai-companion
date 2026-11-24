export interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  target_exam: string;
  timezone: string;
  daily_goal_minutes: number;
  is_verified?: boolean;
  onboarding_completed?: boolean;
  preparation_level?: string;
  preferred_language?: string;
  preparation_goals_json?: string | null;
  avatar_url?: string | null;
  theme_preference?: "system" | "light" | "dark";
  time_format?: "12h" | "24h";
  notifications_enabled_json?: string | null;
  privacy_settings_json?: string | null;
  is_active?: boolean;
  created_at: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface DeleteAccountPayload {
  password: string;
  confirmation: string;
}

export interface AccountExportData {
  user: UserProfile;
  total_sessions: number;
  total_study_minutes: number;
  streak_data?: {
    current_streak: number;
    longest_streak: number;
    last_studied_date: string | null;
    total_sessions: number;
  } | null;
  achievements: Array<{
    badge_id: string;
    badge_name: string;
    category: string;
    unlocked_at: string | null;
  }>;
  mock_attempts_count: number;
  exported_at: string;
}

export interface OnboardingPayload {
  target_exam: string;
  preparation_level: "beginner" | "intermediate" | "advanced";
  preferred_language: string;
  daily_goal_minutes: number;
  preparation_goals: string[];
}

export interface UserLoginPayload {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface UserRegisterPayload {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  target_exam?: string;
  timezone?: string;
  daily_goal_minutes?: number;
  terms_accepted?: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface GenericMessageResponse {
  status: string;
  message: string;
}

export interface StudySession {
  id: number;
  user_id: number;
  task_id?: number | null;
  session_type: "countdown" | "stopwatch" | "pomodoro";
  subject: string;
  topic: string;
  status?: "active" | "paused" | "completed" | "abandoned";
  target_duration_seconds?: number;
  duration_seconds: number;
  started_at: string;
  ended_at?: string | null;
  paused_at?: string | null;
  total_paused_seconds?: number;
  completed: boolean;
  notes?: string;
  created_at: string;
}

export interface ActiveFocusSessionResponse {
  session: StudySession;
  elapsed_focus_seconds: number;
  remaining_seconds?: number | null;
  is_expired: boolean;
  target_end_timestamp?: number | null;
  pomodoro_phase?: "focus" | "short_break" | "long_break";
  cycle_count?: number;
}

export interface FocusSessionStartPayload {
  session_type: "countdown" | "stopwatch" | "pomodoro";
  subject: string;
  topic: string;
  task_id?: number | null;
  duration_seconds?: number;
  focus_minutes?: number;
  short_break_minutes?: number;
  long_break_minutes?: number;
  pomodoro_cycles?: number;
  notes?: string;
  force_restart?: boolean;
}

export interface FocusSessionCompletePayload {
  notes?: string;
  cycles_completed?: number;
  phase?: "focus" | "short_break" | "long_break";
  mark_task_completed?: boolean;
}

export interface FocusSessionSummarySubject {
  subject: string;
  total_minutes: number;
  percentage: number;
}

export interface FocusSessionSummaryResponse {
  today_minutes: number;
  today_sessions_count: number;
  weekly_minutes: number;
  weekly_sessions_count: number;
  today_pomodoro_cycles: number;
  weekly_pomodoro_cycles: number;
  subject_distribution: FocusSessionSummarySubject[];
  recent_sessions: StudySession[];
}

export interface WeeklyConsistencyDay {
  date: string;
  day: string;
  seconds: number;
  target_met: boolean;
  percentage: number;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_studied_date: string | null;
  total_sessions: number;
  total_seconds: number;
  today_seconds: number;
  daily_goal_minutes: number;
  goal_completed: boolean;
  weekly_consistency: WeeklyConsistencyDay[];
  calendar_dates: string[];
}

export interface Achievement {
  badge_key: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string | null;
}

export interface SubjectBreakdown {
  subject: string;
  seconds: number;
  percentage: number;
  sessions_count: number;
}

export interface HourlyProductivity {
  hour: number;
  label: string;
  seconds: number;
}

export interface DailyTrend {
  date: string;
  day_name: string;
  seconds: number;
  sessions_count: number;
  target_met: boolean;
}

export interface AnalyticsSummary {
  total_study_seconds: number;
  total_study_hours: number;
  today_seconds: number;
  weekly_seconds: number;
  monthly_seconds: number;
  completed_pomodoros: number;
  average_daily_minutes: number;
  consistency_percentage: number;
  subject_distribution: SubjectBreakdown[];
  most_productive_hours: HourlyProductivity[];
  weekly_trend: DailyTrend[];
  filter_period: string;
}

export interface RoomParticipant {
  user_id: number;
  username: string;
  display_name?: string;
  role?: "owner" | "moderator" | "member";
  status?: "active" | "pending" | "banned" | "left";
  presence_state?: "online" | "recently_active" | "offline";
  is_focusing: boolean;
  is_muted?: boolean;
  current_subject: string;
  current_topic: string;
  completed_sessions: number;
  total_minutes: number;
  joined_at?: string;
  last_seen?: string | null;
  avatar_url?: string | null;
  is_in_active_session?: boolean;
}

export interface GroupSessionAttendance {
  id: number;
  session_id: number;
  user_id: number;
  username: string;
  status: "active" | "completed" | "left";
  joined_at: string;
  left_at?: string | null;
  minutes_attended: number;
}

export interface GroupStudySession {
  id: number;
  room_id: number;
  title: string;
  subject: string;
  topic: string;
  duration_minutes: number;
  status: "scheduled" | "in_progress" | "active" | "completed" | "cancelled";
  planned_start_at?: string | null;
  started_at?: string;
  ended_at?: string | null;
  actual_duration_minutes?: number | null;
  created_by_user_id?: number | null;
  created_by_username?: string | null;
  participant_count?: number;
  is_joined?: boolean;
  remaining_seconds?: number | null;
  elapsed_seconds?: number | null;
  participants?: GroupSessionAttendance[];
}

export interface SyllabusTopicOption {
  exam: string;
  subject: string;
  topic: string;
  subtopics: string[];
}

export interface RoomMessage {
  id: number;
  room_id: number;
  user_id: number;
  username: string;
  display_name?: string;
  message: string;
  message_type: "text" | "system" | "celebration" | "timer_event";
  is_flagged?: boolean;
  created_at: string;
}

export interface RoomReport {
  id: number;
  room_id: number;
  reporter_id: number;
  reported_user_id: number;
  message_id?: number | null;
  reason: string;
  status: "pending" | "reviewed" | "dismissed";
  action_taken?: string | null;
  created_at: string;
  reporter_name?: string | null;
  reported_username?: string | null;
  message_snippet?: string | null;
}

export interface RoomJoinRequest {
  id: number;
  room_id: number;
  user_id: number;
  username?: string;
  status: "pending" | "accepted" | "rejected";
  requested_at: string;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
}

export interface StudyRoom {
  id: number;
  room_code: string;
  name: string;
  description?: string;
  subject_focus?: string;
  target_exam?: string;
  is_private: boolean;
  created_by: string;
  owner_id?: number | null;
  max_participants?: number;
  duration_minutes: number;
  remaining_seconds?: number;
  started_at: string;
  is_active: boolean;
  participants_count: number;
  participants: RoomParticipant[];
  current_session?: GroupStudySession | null;
  timer?: RoomTimerState;
}

export interface RoomTimerState {
  room_code: string;
  timer_status: "idle" | "running" | "paused" | "completed";
  timer_phase: "focus" | "short_break" | "long_break" | "completed";
  focus_minutes: number;
  short_break_minutes: number;
  long_break_minutes: number;
  target_cycles: number;
  current_cycle: number;
  duration_seconds: number;
  elapsed_seconds: number;
  remaining_seconds: number;
  started_at?: string | null;
  paused_at?: string | null;
  total_paused_seconds: number;
  timer_version: number;
  controller_user_id?: number | null;
  controller_username?: string | null;
  can_control: boolean;
  server_timestamp: string;
}

export interface RoomTimerHistoryItem {
  id: number;
  room_id: number;
  session_id?: number | null;
  user_id?: number | null;
  username?: string | null;
  event_type: string;
  phase: string;
  cycle_number: number;
  duration_seconds: number;
  elapsed_seconds: number;
  notes?: string | null;
  created_at: string;
}

export interface SyllabusTopic {
  id: string;
  name: string;
  subtopics: string[];
}

export interface SyllabusSubject {
  id: string;
  name: string;
  category: string;
  topics: SyllabusTopic[];
}

export interface ExamSyllabus {
  exam: string;
  title: string;
  version?: string;
  notification_ref?: string;
  source?: string;
  total_questions?: number;
  total_marks?: number;
  duration_hours?: number;
  subjects: SyllabusSubject[];
}

export interface StudyTask {
  id: number;
  plan_id?: number;
  title?: string | null;
  description?: string | null;
  subject: string;
  topic: string;
  date_scheduled: string;
  due_date?: string | null;
  duration_minutes: number;
  start_time?: string | null;
  end_time?: string | null;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed" | "missed";
  is_revision: boolean;
  is_overdue?: boolean;
  rationale?: string | null;
  completed_at?: string | null;
}

export interface TaskCompletionSummary {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  missed_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  total_estimated_minutes: number;
  completed_minutes: number;
  subject_breakdown: Record<string, { total: number; completed: number }>;
  priority_breakdown: Record<string, { total: number; completed: number }>;
}

export interface StudyPlan {
  id: number;
  title: string;
  exam_type: string;
  target_exam_date: string;
  daily_study_hours: number;
  priority_weak_subjects: string[];
  tasks: StudyTask[];
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
  is_paused?: boolean;
  scheduling_rationale?: string | null;
}

// Phase 65 Personalized Study Schedule Types
export interface TimeSlot {
  slot_name: string;
  start_time: string;
  end_time: string;
}

export interface UserStudyAvailability {
  id: number;
  user_id: number;
  available_days: string[];
  time_slots: TimeSlot[];
  break_duration_minutes: number;
  max_daily_hours: number;
  subject_targets: Record<string, number>;
  is_paused: boolean;
}

export interface UserStudyAvailabilityUpdate {
  available_days?: string[];
  time_slots?: TimeSlot[];
  break_duration_minutes?: number;
  max_daily_hours?: number;
  subject_targets?: Record<string, number>;
  is_paused?: boolean;
}

export interface RescheduleTaskRequest {
  task_id: number;
  new_date?: string;
  new_start_time?: string;
  new_end_time?: string;
  auto_next_slot?: boolean;
}

export interface RegeneratePlanRequest {
  plan_id: number;
  reason?: string;
}

// Phase 64 Planner & Productivity Module Types
export interface WeeklyScheduleDay {
  date: string;
  day_name: string;
  is_today: boolean;
  total_duration_minutes: number;
  tasks: StudyTask[];
}

export interface WeeklySchedule {
  week_start: string;
  week_end: string;
  total_planned_hours: number;
  completed_planned_hours: number;
  completion_rate: number;
  days: WeeklyScheduleDay[];
}

export interface DailySchedule {
  date: string;
  day_name: string;
  is_today: boolean;
  total_planned_minutes: number;
  completed_minutes: number;
  tasks: StudyTask[];
  sessions: StudySession[];
}

// Phase 67 Smart Timetable Generator Types
export interface TimetableBreakInfo {
  start_time: string;
  end_time: string;
  duration_minutes: number;
  break_type: "consolidation" | "anti_fatigue" | "rest";
}

export interface TimetableSessionItem {
  task_id?: number | null;
  title?: string | null;
  subject: string;
  topic: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed" | "missed";
  is_revision: boolean;
  is_overdue: boolean;
  rationale?: string | null;
}

export interface TimetableDayView {
  date: string;
  day_name: string;
  is_today: boolean;
  is_study_day: boolean;
  total_study_minutes: number;
  completed_study_minutes: number;
  unallocated_minutes: number;
  sessions: TimetableSessionItem[];
  breaks: TimetableBreakInfo[];
  has_conflicts: boolean;
  conflict_messages: string[];
}

export interface TimetableResponse {
  scope: "daily" | "weekly" | "custom";
  start_date: string;
  end_date: string;
  total_days: number;
  total_study_hours: number;
  completed_study_hours: number;
  subject_distribution: Record<string, number>;
  days: TimetableDayView[];
  scheduling_rationale: string;
  educational_disclaimer: string;
}

export interface TimetableGenerateRequest {
  scope?: "daily" | "weekly" | "custom";
  target_date?: string;
  start_date?: string;
  end_date?: string;
  session_duration_minutes?: number;
  break_duration_minutes?: number;
  max_daily_hours?: number;
  subject_allocations?: Record<string, number>;
  include_unfinished_tasks?: boolean;
  include_revisions?: boolean;
  preserve_completed?: boolean;
  exam_type?: string;
}

export interface TimetableRegenerateDaysRequest {
  target_dates: string[];
  session_duration_minutes?: number;
  break_duration_minutes?: number;
  subject_allocations?: Record<string, number>;
  preserve_completed?: boolean;
  include_unfinished_tasks?: boolean;
  exam_type?: string;
}

export interface MoveTimetableSessionRequest {
  task_id: number;
  target_date: string;
  target_start_time?: string;
  target_end_time?: string;
}

export interface StudyReminder {
  id: number;
  user_id: number;
  title: string;
  reminder_type: "daily_study" | "task_due" | "revision_alert" | "mock_test";
  time_of_day: string;
  specific_date?: string | null;
  days_of_week: string[];
  is_active: boolean;
  subject?: string | null;
  last_delivered_at?: string | null;
  is_due?: boolean;
  created_at: string;
}

export interface ReminderDueItem {
  id: number;
  title: string;
  time_of_day: string;
  reminder_type: string;
  subject?: string | null;
  message: string;
}

export interface ReminderDueResponse {
  due_reminders: ReminderDueItem[];
  checked_at_local: string;
  timezone: string;
}

export interface SpacedRevision {
  id: number;
  user_id: number;
  subject: string;
  topic: string;
  interval_stage: number;
  last_reviewed_at: string;
  next_revision_date: string;
  retention_score: number;
  is_suggested?: boolean;
  is_completed: boolean;
  completed_at?: string | null;
  notes?: string | null;
  is_overdue?: boolean;
  is_upcoming?: boolean;
  days_until?: number;
  created_at: string;
  updated_at: string;
}

export interface RevisionSuggestionItem {
  subject: string;
  topic: string;
  reason: string;
  suggested_date: string;
  last_studied_at?: string | null;
  is_revision_needed_flag: boolean;
}

export interface RevisionSuggestionsResponse {
  suggestions: RevisionSuggestionItem[];
  total: number;
}

export interface SyllabusTopicDetail {
  id: string;
  name: string;
  subtopics: string[];
  status: "not_started" | "in_progress" | "completed" | "mastered";
  is_revision_needed: boolean;
  mastery_percentage: number;
  notes?: string | null;
  completed_at?: string | null;
  last_studied_at?: string | null;
  actual_study_minutes: number;
  study_sessions_count: number;
  related_materials_count: number;
  has_practice_questions: boolean;
}

export interface SyllabusSubjectProgressSummary {
  subject_id?: string | null;
  subject: string;
  category?: string | null;
  total_topics: number;
  completed_topics: number;
  in_progress_topics: number;
  not_started_topics: number;
  revision_needed_topics: number;
  mastery_percentage: number;
  topics: SyllabusTopicDetail[];
}

export interface SyllabusOverallProgress {
  exam_type: string;
  syllabus_title?: string;
  syllabus_version?: string;
  notification_ref?: string;
  source?: string;
  total_topics: number;
  completed_topics: number;
  in_progress_topics: number;
  not_started_topics: number;
  revision_needed_topics: number;
  overall_mastery_percentage: number;
  subjects: SyllabusSubjectProgressSummary[];
  topic_statuses: Record<string, string>;
  last_activity_at?: string | null;
  calculation_rules?: Record<string, string>;
}

export interface SyllabusTopicProgressUpdate {
  exam_type?: string;
  subject: string;
  topic: string;
  topic_id?: string | null;
  status: "not_started" | "in_progress" | "completed" | "mastered";
  is_revision_needed?: boolean;
  mastery_percentage?: number;
  notes?: string;
}

export interface SyllabusTopicProgressResponse {
  id: number;
  user_id: number;
  exam_type: string;
  subject: string;
  topic: string;
  topic_id?: string | null;
  status: "not_started" | "in_progress" | "completed" | "mastered";
  is_revision_needed: boolean;
  mastery_percentage: number;
  notes?: string | null;
  completed_at?: string | null;
  last_studied_at?: string | null;
  updated_at: string;
}

export interface SyllabusTopicsFilterResponse {
  exam_type: string;
  filter_status?: string | null;
  total_filtered: number;
  topics: SyllabusTopicDetail[];
}

export interface SyllabusBatchUpdateRequest {
  exam_type: string;
  updates: SyllabusTopicProgressUpdate[];
}

export interface PlannerDashboardOverview {
  exam_type: string;
  target_exam_date: string;
  days_until_exam: number;
  active_plan?: StudyPlan | null;
  today_schedule: DailySchedule;
  weekly_completion_rate: number;
  active_reminders_count: number;
  pending_revisions_count: number;
  syllabus_mastery_percentage: number;
  streak_days: number;
}

// Mock Tests Engine Types
export interface TestPaperSummary {
  id: number;
  slug: string;
  title: string;
  exam_category: string;
  subject: string;
  difficulty: string;
  duration_minutes: number;
  total_questions: number;
  marks_per_question: number;
  negative_mark_penalty: number;
  user_best_score?: number | null;
  user_attempts_count: number;
}

export interface TestPaperDetail extends TestPaperSummary {
  instructions: string[];
}

export interface QuestionPublic {
  id: number;
  question_number: number;
  question_text: string;
  options: string[];
}

export interface SavedAnswerState {
  question_id: number;
  selected_option_index: number | null;
  is_marked_for_review: boolean;
}

export interface TestAttemptStartResponse {
  attempt_id: number;
  paper_slug: string;
  paper_title: string;
  duration_minutes: number;
  duration_seconds: number;
  started_at: string;
  deadline_at: string;
  questions: QuestionPublic[];
  saved_answers: SavedAnswerState[];
  status: string;
}

export interface AnswerSaveRequest {
  question_id: number;
  selected_option_index: number | null;
  is_marked_for_review?: boolean;
}

export interface AnswerSaveResponse {
  question_id: number;
  selected_option_index: number | null;
  is_marked_for_review: boolean;
  saved: boolean;
}

export interface QuestionEvaluation {
  id: number;
  question_number: number;
  question_text: string;
  options: string[];
  selected_option_index: number | null;
  correct_option_index: number;
  is_correct: boolean;
  marks_awarded: number;
  explanation?: string | null;
  reference_source?: string | null;
}

export interface TestResultResponse {
  attempt_id: number;
  paper_slug: string;
  paper_title: string;
  started_at: string;
  submitted_at?: string | null;
  time_taken_seconds: number;
  total_questions: number;
  attempted_count: number;
  correct_count: number;
  wrong_count: number;
  unattempted_count: number;
  total_marks_scored: number;
  max_possible_marks: number;
  accuracy_percentage: number;
  status: string;
  questions: QuestionEvaluation[];
}

// Examination Engine v1 Aliases & Specific Types
export type ExamTestSummary = TestPaperSummary;
export type ExamTestDetail = TestPaperDetail;
export type ExamQuestion = QuestionPublic;
export type ExamSavedAnswer = SavedAnswerState;
export type ExamAttempt = TestAttemptStartResponse;
export type ExamAnswerPayload = AnswerSaveRequest;
export type ExamAnswerResponse = AnswerSaveResponse;
export type ExamQuestionEvaluation = QuestionEvaluation;
export type ExamResult = TestResultResponse;
export type ExamReviewResponse = TestResultResponse;
export type ExamHistoryItem = TestAttemptHistoryItem;

export interface ExamOption {
  index: number;
  label: string;
  text: string;
}

export interface TestAttemptHistoryItem {
  attempt_id: number;
  paper_slug: string;
  paper_title: string;
  exam_category: string;
  subject: string;
  submitted_at?: string | null;
  time_taken_seconds: number;
  total_questions: number;
  attempted_count: number;
  correct_count: number;
  total_marks_scored: number;
  max_possible_marks: number;
  accuracy_percentage: number;
  status: string;
}

export type TNPSCExamStatus = "announced" | "unannounced" | "concluded" | "postponed";

export interface TNPSCExamSchedule {
  id: string;
  canonical_name: string;
  aliases: string[];
  full_name: string;
  tamil_name: string;
  notification_reference: string;
  official_date: string | null;
  status: TNPSCExamStatus;
  last_verified_date: string;
  verification_source: string;
  official_portal_url: string;
  unannounced_notice?: string | null;
  concluded_notice?: string | null;
  exam_timing?: string | null;
  total_marks?: number | null;
  question_count?: number | null;
  posts: string[];
  preparation_guidance: string;
}

export interface ExamCountdownDetails {
  exam: TNPSCExamSchedule;
  isAnnounced: boolean;
  isConcluded: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  totalHoursRemaining: number;
  weeksRemaining: number;
  remainderDays: number;
  formattedTargetDate: string;
  formattedTargetTime: string;
  phase: string;
  phaseDescription: string;
  phaseBadgeColor: string;
}

export type StudyGoalType =
  | "daily_study_time"
  | "weekly_study_time"
  | "subject_mastery"
  | "topics_completion"
  | "revisions_target"
  | "mock_tests_target";

export type StudyGoalStatus = "active" | "paused" | "completed" | "cancelled";

export interface StudyGoal {
  id: number;
  user_id: number;
  title: string;
  goal_type: StudyGoalType;
  target_value: number;
  current_value: number;
  progress_percentage: number;
  unit: string;
  subject?: string | null;
  status: StudyGoalStatus;
  start_date?: string | null;
  target_date?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  evidence_summary: string;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateGoalPayload {
  title: string;
  goal_type: StudyGoalType;
  target_value: number;
  unit?: string;
  subject?: string;
  target_date?: string;
  notes?: string;
}

export interface UpdateGoalPayload {
  title?: string;
  target_value?: number;
  unit?: string;
  subject?: string;
  status?: StudyGoalStatus;
  target_date?: string;
  notes?: string;
}

export interface GoalsDashboardSummary {
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  paused_goals: number;
  overall_completion_rate: number;
  daily_progress: {
    today_minutes: number;
    target_minutes: number;
    percentage: number;
    is_achieved: boolean;
  };
  weekly_progress: {
    weekly_hours: number;
    target_hours: number;
    percentage: number;
    is_achieved: boolean;
  };
  subject_progress: Array<{
    subject: string;
    sessions: number;
    minutes: number;
  }>;
  completed_targets: number;
  remaining_targets: number;
  recent_achievements: Array<{
    badge_key: string;
    title: string;
    description: string;
    icon: string;
    unlocked_at: string | null;
  }>;
}

export type ContinueLearningType =
  | "mock_test"
  | "planner_task"
  | "revision_task"
  | "recent_subject"
  | "study_material";

export interface ContinueLearningItem {
  id: string;
  activity_type: ContinueLearningType;
  title: string;
  subject: string;
  topic: string;
  progress_percent?: number | null;
  duration_minutes?: number | null;
  resumable_id?: string | null;
  action_label: string;
  action_tab: string;
  last_active_at?: string | null;
  meta?: Record<string, unknown>;
}

export type ActivityTimelineCategory =
  | "all"
  | "sessions"
  | "tests"
  | "tasks"
  | "goals"
  | "achievements";

export interface ActivityTimelineItem {
  id: string;
  category: "session" | "test" | "task" | "goal" | "achievement";
  title: string;
  subtitle?: string | null;
  timestamp: string;
  status: string;
  meta?: Record<string, unknown>;
}

export interface ActivityTimelineResponse {
  items: ActivityTimelineItem[];
  total_count: number;
  category: string;
}

// AI Tutor Architecture (Phase 34)
export type TutorModeId =
  | "general"
  | "tamil"
  | "general_studies"
  | "aptitude"
  | "revision"
  | "practice_question";

export interface TutorModeInfo {
  id: TutorModeId;
  name: string;
  tamil_name: string;
  description: string;
  is_operational: boolean;
  allowed_subjects: string[];
  default_prompt_template: string;
}

export interface AIMessageItem {
  id: number;
  conversation_id: number;
  role: "user" | "assistant" | "system";
  content: string;
  sources: string[];
  suggested_topics: string[];
  model_name?: string | null;
  created_at: string;
}

export interface AIConversationSummary {
  id: number;
  user_id: number;
  title: string;
  tutor_mode: string;
  subject: string;
  target_exam: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  message_count: number;
  last_message_preview?: string | null;
}

export interface AIConversationDetail {
  id: number;
  user_id: number;
  title: string;
  tutor_mode: string;
  subject: string;
  target_exam: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  messages: AIMessageItem[];
}

export interface TutorQueryPayload {
  message: string;
  conversation_id?: number | null;
  tutor_mode?: TutorModeId;
  subject?: string;
  target_exam?: string;
  preferred_language?: string;
}

export interface TutorQueryResponse {
  reply: string;
  sources: string[];
  suggested_topics: string[];
  model: string;
  conversation_id?: number | null;
  message_id?: number | null;
  tutor_mode: string;
  subject: string;
  disclaimer?: string | null;
}

export interface GSPracticeQuestionOption {
  key: string;
  text: string;
  is_correct: boolean;
  explanation: string;
}

export interface GSPracticeQuestion {
  id: string;
  subject_domain: string;
  topic: string;
  question_type: string;
  question_text: string;
  statements?: string[] | null;
  options: GSPracticeQuestionOption[];
  correct_option: string;
  detailed_explanation: string;
  statutory_or_scert_reference: string;
  exam_relevance: string;
  is_practice: boolean;
}

export interface GSTutorResponse {
  reply: string;
  subject_domain: string;
  topic: string;
  statutory_citations: string[];
  scert_textbook_references: string[];
  high_yield_revision_points: string[];
  suggested_topics: string[];
  practice_question?: GSPracticeQuestion | null;
  model: string;
  disclaimer: string;
}

export interface AptitudeStructuredSolution {
  given_info: string[];
  required_result: string;
  primary_formula: string;
  step_by_step_calculation: string[];
  final_answer: string;
  shortcut_technique?: string | null;
  when_to_use_shortcut?: string | null;
  common_pitfalls?: string | null;
}

export interface AptitudePracticeOption {
  key: string;
  text: string;
  is_correct: boolean;
  explanation: string;
}

export interface AptitudePracticeQuestion {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  question_text: string;
  options: AptitudePracticeOption[];
  correct_option: string;
  detailed_solution: string;
  shortcut_method?: string | null;
  scert_reference: string;
  is_practice: boolean;
}

export interface AptitudeTutorResponse {
  reply: string;
  topic: string;
  teaching_mode: string;
  solution?: AptitudeStructuredSolution | null;
  scert_references: string[];
  formula_cheat_sheet: string[];
  suggested_topics: string[];
  practice_question?: AptitudePracticeQuestion | null;
  similar_practice_tip?: string | null;
  model: string;
  disclaimer: string;
}

export interface GeneratedPracticeOption {
  key: string;
  text: string;
  is_correct: boolean;
  explanation: string;
}

export interface GeneratedPracticeQuestion {
  id: string;
  subject: string;
  topic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  question_text: string;
  statements?: string[] | null;
  options: GeneratedPracticeOption[];
  correct_option: string;
  detailed_explanation: string;
  source_reference: string;
  is_practice: boolean;
  disclaimer: string;
}

export interface QuestionGenerateResponse {
  subject: string;
  topic?: string | null;
  difficulty: string;
  total_generated: number;
  questions: GeneratedPracticeQuestion[];
  disclaimer: string;
}

// ---------------------------------------------------------
// AI Answer Evaluation Schemas (Phase 48)
// ---------------------------------------------------------
export interface MCQEvaluationPayload {
  subject: string;
  topic?: string | null;
  question_text: string;
  statements?: string[] | null;
  options: { key: string; text: string; explanation?: string | null }[];
  selected_option?: string | null;
  correct_option?: string | null;
  detailed_explanation?: string | null;
  source_reference?: string | null;
  language?: string;
  test_attempt_id?: number | null;
  mock_question_id?: number | null;
}

export interface MCQEvaluationResponse {
  status: "correct" | "incorrect" | "unanswered";
  is_correct: boolean;
  selected_option?: string | null;
  correct_option: string;
  marks_awarded: number;
  distractor_analysis: string;
  detailed_explanation: string;
  worked_solution_steps?: string[] | null;
  core_concepts: string[];
  syllabus_topic: string;
  source_reference: string;
  revision_recommendation: string;
  language: string;
  evaluation_type: string;
  disclaimer: string;
}

export interface RubricCriterionResult {
  criterion_name: string;
  max_marks: number;
  awarded_marks: number;
  weightage_percent: number;
  feedback: string;
}

export interface DescriptiveEvaluationPayload {
  question_text: string;
  subject: string;
  topic: string;
  user_answer: string;
  max_marks?: number;
  expected_keywords?: string[];
  model_points?: string[];
  language?: string;
}

export interface DescriptiveEvaluationResponse {
  evaluation_type: string;
  total_score: number;
  max_marks: number;
  percentage: number;
  rubric_breakdown: RubricCriterionResult[];
  strengths: string[];
  areas_for_improvement: string[];
  missing_key_concepts: string[];
  suggested_revision: string;
  language: string;
  disclaimer: string;
}

// ---------------------------------------------------------
// AI Learning Recommendations Schemas (Phase 49)
// ---------------------------------------------------------
export interface RecommendationAction {
  action_type: "practice_mcq" | "ai_tutor_consult" | "study_material" | "mock_test";
  action_tab: string;
  action_payload: Record<string, unknown>;
}

export interface LearningRecommendationItem {
  id: string;
  category:
    | "weakness_remedy"
    | "practice_question"
    | "spaced_revision"
    | "subject_balance"
    | "goal_alignment"
    | "starter_onboarding";
  title: string;
  subject: string;
  topic: string;
  explanation: string;
  priority: "high" | "medium" | "low";
  estimated_minutes: number;
  evidence: Record<string, unknown>;
  action: RecommendationAction;
  is_dismissed?: boolean;
  created_at?: string;
}

export interface RecommendationListResponse {
  total_recommendations: number;
  recommendations: LearningRecommendationItem[];
  active_filters: Record<string, unknown>;
  disclaimer: string;
}

export interface RecommendationDismissResponse {
  success: boolean;
  dismissed_id: string;
  message: string;
}

// ---------------------------------------------------------
// Study Materials Schemas (Phase 54)
// ---------------------------------------------------------
export interface StudyChunkItem {
  id: number;
  unit_number?: string;
  topic: string;
  subtopic?: string;
  content: string;
  language: string;
  chunk_index: number;
}

export interface StudyMaterialItem {
  id: number;
  slug: string;
  title: string;
  publisher: string;
  document_type: string;
  exam_category: string;
  subject: string;
  academic_class?: string;
  language: string;
  source_url?: string;
  file_reference?: string;
  verification_status: "scert_approved" | "official_verified" | "peer_reviewed";
  last_reviewed_date?: string;
  total_chunks: number;
  is_bookmarked: boolean;
  progress_percent: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudyMaterialDetailItem extends StudyMaterialItem {
  chunks: StudyChunkItem[];
}

export interface StudyMaterialListResponse {
  total_materials: number;
  page: number;
  page_size: number;
  categories: string[];
  subjects: string[];
  classes?: string[];
  languages?: string[];
  materials: StudyMaterialItem[];
}

export interface StudyBookmarkResponse {
  is_bookmarked: boolean;
  document_id: number;
  message: string;
}

export interface StudyProgressResponse {
  document_id: number;
  completed_chunks_count: number;
  total_chunks_count: number;
  progress_percent: number;
  is_completed: boolean;
  message: string;
}

export interface AptitudePracticeOptionItem {
  key: string;
  text: string;
  is_correct: boolean;
  explanation: string;
}

export interface AptitudePracticeQuestionItem {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: "easy" | "moderate" | "advanced";
  question_text: string;
  options: AptitudePracticeOptionItem[];
  correct_option: string;
  detailed_solution: string;
  shortcut_method?: string;
  scert_reference: string;
  is_practice: boolean;
}

// -------------------------------------------------------------
// Phase 84 & 85: Personalized Learning Analytics Dashboard
// -------------------------------------------------------------
export interface DateRangeInfo {
  start_date: string;
  end_date: string;
  period: string;
  period_label: string;
  is_rolling: boolean;
  days_count: number;
}

export interface RevisionActivitySummary {
  overdue_revisions_count: number;
  pending_revisions_count: number;
  topics_needing_revision: string[];
  retention_distribution: {
    high_retention: number;
    medium_retention: number;
    low_retention: number;
  };
}

export interface UpcomingGoalItem {
  id: number;
  title: string;
  goal_type: string;
  current_value: number;
  target_value: number;
  progress_percentage: number;
  unit: string;
  target_date?: string | null;
  status: string;
}

export interface LearningTrendPoint {
  date: string;
  day_label: string;
  study_minutes: number;
  test_score_average: number | null;
  sessions_count: number;
  tasks_completed_count: number;
}

export interface AnalyticsDataAvailability {
  has_study_time: boolean;
  has_syllabus_progress: boolean;
  has_mock_tests: boolean;
  has_tasks: boolean;
  has_goals: boolean;
  has_revisions: boolean;
  is_completely_new_user: boolean;
}

export interface RecentActivitySummaryItem {
  id: string;
  category: "session" | "test" | "task" | "goal" | "revision";
  title: string;
  subtitle?: string | null;
  timestamp: string;
  status: string;
}

export interface LearningOverviewResponse {
  total_study_minutes: number;
  today_study_minutes: number;
  weekly_study_minutes: number;
  monthly_study_minutes: number;
  solo_focus_sessions_count: number;
  pomodoro_sessions_count: number;
  group_study_sessions_count: number;
  total_syllabus_topics: number;
  completed_syllabus_topics: number;
  in_progress_syllabus_topics: number;
  needs_revision_topics: number;
  syllabus_completion_percentage: number;
  overall_mastery_percentage: number;
  total_test_attempts: number;
  average_test_score_percentage: number;
  total_test_questions_attempted: number;
  overall_test_accuracy_percentage: number;
  current_streak_days: number;
  longest_streak_days: number;
  total_study_days: number;
  consistency_percentage: number;
  tasks_planned_count: number;
  tasks_completed_count: number;
  task_completion_rate_percentage: number;
  filter_period: string;
}

export interface SubjectAnalyticsItem {
  subject: string;
  study_minutes: number;
  study_percentage: number;
  syllabus_total_topics: number;
  syllabus_completed_topics: number;
  syllabus_mastery_percentage: number;
  tests_taken_count: number;
  questions_attempted_count: number;
  correct_answers_count: number;
  accuracy_percentage: number;
  proficiency_tier: "advanced" | "intermediate" | "developing";
}

export interface TopicAnalyticsItem {
  subject: string;
  topic: string;
  status: string;
  mastery_percentage: number;
  time_spent_minutes: number;
  is_revision_needed: boolean;
  last_studied_at?: string | null;
  retention_score?: number | null;
}

export interface TestAttemptSummaryItem {
  id: number;
  paper_id: number;
  paper_title: string;
  subject: string;
  score: number;
  max_marks: number;
  score_percentage: number;
  accuracy_percentage: number;
  time_taken_seconds: number;
  submitted_at?: string | null;
}

export interface SubjectTestAccuracyItem {
  subject: string;
  questions_attempted: number;
  correct_count: number;
  accuracy_percentage: number;
}

export interface MockTestAnalyticsResponse {
  total_attempts: number;
  completed_attempts: number;
  average_score_percentage: number;
  highest_score_percentage: number;
  lowest_score_percentage: number;
  total_questions_attempted: number;
  total_correct_count: number;
  total_wrong_count: number;
  overall_accuracy_percentage: number;
  average_time_per_question_seconds: number;
  attempts_history: TestAttemptSummaryItem[];
  subject_accuracy: SubjectTestAccuracyItem[];
  filter_period: string;
}

export interface StudyTimeBreakdownItem {
  modality: string;
  seconds: number;
  percentage: number;
}

export interface StudyTimeAnalyticsResponse {
  total_seconds: number;
  solo_focus_seconds: number;
  pomodoro_seconds: number;
  group_study_seconds: number;
  modality_breakdown: StudyTimeBreakdownItem[];
  daily_trend: DailyTrend[];
  most_productive_hours: HourlyProductivity[];
  average_daily_minutes: number;
  consistency_percentage: number;
  filter_period: string;
}

export interface WeakAreaItem {
  subject: string;
  topic: string;
  severity: "critical" | "moderate" | "mild";
  reasons: string[];
  accuracy_percentage?: number | null;
  mastery_percentage?: number | null;
  recommended_action: string;
}

export interface PersonalizedDashboardAnalyticsResponse {
  period: string;
  date_range: DateRangeInfo;
  data_availability: AnalyticsDataAvailability;
  overview: LearningOverviewResponse;
  subjects: SubjectAnalyticsItem[];
  study_time: StudyTimeAnalyticsResponse;
  mock_tests: MockTestAnalyticsResponse;
  weak_areas: WeakAreaItem[];
  recent_activity: RecentActivitySummaryItem[];
  upcoming_goals: UpcomingGoalItem[];
  revision_activity: RevisionActivitySummary;
  learning_trends: LearningTrendPoint[];
}

// ==============================================================================
// PHASE 86: SUBJECT & TOPIC PERFORMANCE ANALYTICS TYPES
// ==============================================================================

export interface TopicResourceLink {
  document_id: number;
  title: string;
  document_type: string;
  resource_url: string;
}

export interface TopicPerformanceItem {
  topic_id: string;
  topic_name: string;
  tamil_name: string | null;
  subject: string;
  syllabus_status: string;
  syllabus_mastery_percentage: number;
  study_minutes: number;
  retention_score: number | null;
  total_questions: number;
  answered_questions: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  accuracy_percentage: number | null;
  sample_size_label: string;
  assessment_status: string;
  repeated_errors_count: number;
  is_weak_area: boolean;
  recommended_resources: TopicResourceLink[];
}

export interface SubjectPerformanceDetailItem {
  subject_id: string;
  subject_name: string;
  tamil_name: string | null;
  category: string;
  study_minutes: number;
  study_percentage: number;
  syllabus_total_topics: number;
  syllabus_completed_topics: number;
  syllabus_completion_percentage: number;
  syllabus_mastery_percentage: number;
  tests_taken_count: number;
  total_questions_presented: number;
  questions_answered: number;
  correct_answers_count: number;
  incorrect_answers_count: number;
  unanswered_count: number;
  accuracy_percentage: number | null;
  sample_size_label: string;
  proficiency_tier: string;
  topics_count: number;
  weak_topics_count: number;
  insufficient_data_topics_count: number;
  strong_topics_count: number;
  topics: TopicPerformanceItem[];
}

export interface UnmappedQuestionsSummary {
  total_questions: number;
  answered_questions: number;
  correct_count: number;
  incorrect_count: number;
  accuracy_percentage: number | null;
  note: string;
}

export interface PerformanceTrendPoint {
  date: string;
  questions_answered: number;
  correct_count: number;
  accuracy_percentage: number | null;
}

export interface SubjectTopicPerformanceResponse {
  period: string;
  date_range: DateRangeInfo;
  target_exam: string;
  total_questions_attempted: number;
  total_questions_answered: number;
  total_correct_count: number;
  total_incorrect_count: number;
  total_unanswered_count: number;
  overall_accuracy_percentage: number | null;
  accuracy_definition: string;
  min_sample_size_threshold: number;
  subjects: SubjectPerformanceDetailItem[];
  weak_topics_summary: TopicPerformanceItem[];
  insufficient_data_topics_summary: TopicPerformanceItem[];
  unmapped_questions_summary: UnmappedQuestionsSummary;
  performance_trends: PerformanceTrendPoint[];
}

// ==============================================================================
// PHASE 87: DETAILED MOCK TEST PERFORMANCE ANALYTICS TYPES
// ==============================================================================

export interface MockTestAttemptDetailItem {
  attempt_id: number;
  paper_id: number;
  paper_title: string;
  paper_slug: string;
  subject: string;
  exam_category: string;
  status: string;
  started_at: string;
  submitted_at: string | null;
  time_taken_seconds: number;
  average_seconds_per_question: number;
  total_questions: number;
  attempted_count: number;
  correct_count: number;
  wrong_count: number;
  unattempted_count: number;
  total_marks_scored: number;
  max_possible_marks: number;
  score_percentage: number;
  accuracy_percentage: number;
  marks_per_question: number;
  negative_mark_penalty: number;
  negative_marks_incurred: number;
  has_negative_marking: boolean;
  review_url: string;
}

export interface MockTestSubjectPerformance {
  subject: string;
  tests_count: number;
  total_questions: number;
  questions_answered: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  accuracy_percentage: number | null;
  average_score_percentage: number | null;
  total_time_seconds: number;
  average_seconds_per_question: number;
  negative_marks_incurred: number;
}

export interface MockTestTrendPoint {
  attempt_id: number;
  test_title: string;
  subject: string;
  date: string;
  attempt_number: number;
  score_percentage: number;
  accuracy_percentage: number;
  time_taken_seconds: number;
  seconds_per_question: number;
}

export interface MockTestRecentComparison {
  has_previous_comparison: boolean;
  latest_attempt_id: number | null;
  latest_test_title: string | null;
  latest_score_percentage: number | null;
  latest_accuracy_percentage: number | null;
  latest_seconds_per_question: number | null;
  previous_attempt_id: number | null;
  previous_test_title: string | null;
  previous_score_percentage: number | null;
  previous_accuracy_percentage: number | null;
  previous_seconds_per_question: number | null;
  score_difference_percentage: number | null;
  accuracy_difference_percentage: number | null;
  pace_difference_seconds: number | null;
  trend_direction: string;
}

export interface RecurringMistakeItem {
  question_id: number;
  question_text: string;
  subject: string;
  topic: string | null;
  times_encountered: number;
  times_incorrect: number;
  error_rate_percentage: number;
  explanation: string | null;
  reference_source: string | null;
  recommended_resources: TopicResourceLink[];
}

export interface DetailedMockTestAnalyticsResponse {
  period: string;
  date_range: DateRangeInfo;
  target_exam: string;
  total_attempts: number;
  completed_attempts_count: number;
  incomplete_attempts_count: number;
  completion_rate_percentage: number;
  average_score_percentage: number | null;
  highest_score_percentage: number | null;
  lowest_score_percentage: number | null;
  total_questions_presented: number;
  total_questions_answered: number;
  total_correct_count: number;
  total_incorrect_count: number;
  total_unanswered_count: number;
  overall_accuracy_percentage: number | null;
  accuracy_definition: string;
  normalization_note: string;
  total_time_spent_seconds: number;
  total_time_spent_formatted: string;
  average_seconds_per_question: number;
  pace_evaluation: string;
  total_negative_marks_incurred: number;
  tests_with_negative_marking_count: number;
  subject_performance: MockTestSubjectPerformance[];
  performance_trends: MockTestTrendPoint[];
  recent_comparison: MockTestRecentComparison;
  recurring_mistakes: RecurringMistakeItem[];
  attempts_history: MockTestAttemptDetailItem[];
}

// Phase 88: Study Time & Learning Activity Analytics Types
export interface StudyTimeDailyItem {
  date: string;
  day_name: string;
  personal_study_seconds: number;
  group_study_seconds: number;
  total_study_seconds: number;
  planned_study_seconds: number;
  sessions_completed_count: number;
  sessions_interrupted_count: number;
  target_met: boolean;
  total_paused_seconds: number;
}

export interface StudyTimeWeeklyTrendItem {
  week_label: string;
  start_date: string;
  end_date: string;
  total_study_hours: number;
  personal_study_hours: number;
  group_study_hours: number;
  planned_study_hours: number;
  active_days_count: number;
  average_daily_study_hours: number;
  adherence_percentage?: number | null;
}

export interface StudyTimeMonthlyTrendItem {
  month_key: string;
  month_name: string;
  total_study_hours: number;
  personal_study_hours: number;
  group_study_hours: number;
  active_days_count: number;
  average_daily_study_hours: number;
  total_sessions_count: number;
}

export interface StudyTimeSubjectDistributionItem {
  subject: string;
  subject_tamil?: string | null;
  total_study_seconds: number;
  total_study_hours: number;
  percentage_of_total: number;
  sessions_count: number;
  completed_sessions_count: number;
  has_explicit_subject: boolean;
}

export interface PlannedVsActualComparison {
  has_planned_tasks: boolean;
  total_planned_seconds: number;
  total_planned_hours: number;
  total_actual_seconds: number;
  total_actual_hours: number;
  adherence_percentage?: number | null;
  difference_seconds: number;
  difference_formatted: string;
  status: "on_track" | "overstudied" | "understudied" | "no_plan";
  paired_tasks_count: number;
}

export interface StudySessionCompletionSummary {
  total_sessions_started: number;
  completed_sessions_count: number;
  interrupted_sessions_count: number;
  completion_rate_percentage: number;
  average_completed_duration_seconds: number;
  average_interrupted_duration_seconds: number;
  total_paused_seconds: number;
  paused_overhead_percentage: number;
}

export interface LearningActivityDetailItem {
  id: string;
  session_id: number;
  activity_type: string;
  title: string;
  subject?: string | null;
  topic?: string | null;
  status: string;
  started_at: string;
  ended_at?: string | null;
  actual_duration_seconds: number;
  target_duration_seconds?: number | null;
  total_paused_seconds: number;
  planned_duration_seconds?: number | null;
  linked_task_id?: number | null;
  linked_task_title?: string | null;
  room_code?: string | null;
  notes?: string | null;
}

export interface DetailedStudyTimeAnalyticsResponse {
  period: string;
  date_range: DateRangeInfo;
  timezone: string;
  total_study_seconds: number;
  total_study_formatted: string;
  personal_study_seconds: number;
  personal_study_formatted: string;
  group_study_seconds: number;
  group_study_formatted: string;
  personal_percentage: number;
  group_percentage: number;
  raw_logged_seconds: number;
  overlapping_seconds: number;
  total_paused_seconds: number;
  deduplication_rule: string;
  estimates_used: boolean;
  estimates_note: string;
  daily_trends: StudyTimeDailyItem[];
  weekly_trends: StudyTimeWeeklyTrendItem[];
  monthly_trends: StudyTimeMonthlyTrendItem[];
  subject_distribution: StudyTimeSubjectDistributionItem[];
  planned_vs_actual: PlannedVsActualComparison;
  session_completion: StudySessionCompletionSummary;
  recent_activities: LearningActivityDetailItem[];
  total_activities_count: number;
}

// Phase 89 Weak Areas and Achievements Types
export interface RecommendedStudyMaterial {
  id: number;
  title: string;
  material_type: string;
  language: string;
  subject: string;
  topic?: string | null;
  file_path?: string | null;
}

export interface PracticePaperRecommendation {
  id: number;
  title: string;
  slug: string;
  subject: string;
  difficulty: string;
  total_questions: number;
}

export interface DetailedWeakAreaItem {
  topic: string;
  subject: string;
  incorrect_count: number;
  correct_count: number;
  total_attempts: number;
  sample_size: number;
  error_rate_percentage: number;
  accuracy_percentage: number;
  syllabus_status: string;
  severity: "critical" | "moderate" | "mild";
  evidence_note: string;
  recommended_materials: RecommendedStudyMaterial[];
  recommended_practice_papers: PracticePaperRecommendation[];
}

export interface InsufficientDataTopicItem {
  topic: string;
  subject: string;
  questions_attempted: number;
  minimum_threshold: number;
  status_note: string;
}

export interface AchievementDetailItem {
  badge_key: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  is_unlocked: boolean;
  unlocked_at?: string | null;
  current_progress: number;
  target_progress: number;
  progress_percentage: number;
  progress_unit: string;
}

export interface WeakAreasAndAchievementsResponse {
  evaluation_timestamp: string;
  sample_size_threshold: number;
  weak_areas: DetailedWeakAreaItem[];
  total_weak_areas_count: number;
  insufficient_data_topics: InsufficientDataTopicItem[];
  insufficient_data_count: number;
  achievements: AchievementDetailItem[];
  unlocked_achievements_count: number;
  total_achievements_count: number;
  overall_progress_percentage: number;
  newly_awarded_count: number;
}

// ==============================================================================
// PHASE 90: LEADERBOARDS, NOTIFICATIONS & RECOMMENDATIONS TYPES
// ==============================================================================

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  display_name: string;
  avatar_url?: string | null;
  target_exam: string;
  score_value: number;
  score_label: string;
  is_current_user: boolean;
  is_tied: boolean;
  is_anonymized: boolean;
}

export interface LeaderboardResponse {
  metric: "study_time" | "mock_tests" | "streak" | "accuracy";
  period: "today" | "1d" | "week" | "7d" | "month" | "30d" | "all";
  scoring_formula: string;
  rankings: LeaderboardEntry[];
  current_user_rank?: number | null;
  current_user_score_label?: string | null;
  current_user_opted_in: boolean;
  total_participants: number;
  has_sufficient_data: boolean;
  empty_state_reason?: string | null;
}

export interface LeaderboardOptInRequest {
  opt_in: boolean;
  anonymous: boolean;
}

export interface LeaderboardOptInResponse {
  user_id: number;
  opted_in: boolean;
  anonymous: boolean;
  message: string;
}

export interface InAppNotificationItem {
  id: number;
  user_id: number;
  category: "study_task" | "revision" | "daily_goal" | "milestone" | "community" | "general";
  event_type: string;
  title: string;
  message: string;
  action_url?: string | null;
  action_tab?: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  read_at?: string | null;
}

export interface NotificationListResponse {
  notifications: InAppNotificationItem[];
  unread_count: number;
  total_count: number;
  delivery_channels: Record<string, string>;
}

export interface NotificationSummaryResponse {
  unread_count: number;
  total_count: number;
  latest_notifications: InAppNotificationItem[];
  delivery_channels: Record<string, string>;
}

export interface NotificationActionResponse {
  success: boolean;
  id?: number | null;
  message: string;
}

export interface Phase90RecommendationItem {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  subject?: string | null;
  topic?: string | null;
  action_type: string;
  action_tab: string;
  action_url: string;
  evidence_rationale?: string | null;
  is_dismissed: boolean;
  is_starter: boolean;
}

export interface PersonalizedRecommendationsResponse {
  recommendations: Phase90RecommendationItem[];
  total_count: number;
  generated_at: string;
  pedagogical_disclaimer: string;
}

// ============================================================================
// EXPANDED OFFICIAL STUDY RESOURCES INTERFACES
// ============================================================================

export interface OfficialSourceMetadata {
  source_name: string;
  portal_name: string;
  source_url: string;
  publication_date?: string | null;
  retrieval_date: string;
  verification_status: "verified_official" | "verified_scert" | "official_gazette" | "unavailable";
  is_official: boolean;
}

export interface ExamSchemePaper {
  paper_number: string;
  paper_title: string;
  tamil_title: string;
  stage: "preliminary" | "mains" | "single_stage" | "interview";
  standard: string;
  duration_hours: number;
  question_count?: number | null;
  maximum_marks: number;
  minimum_qualifying_marks?: number | null;
  is_tamil_eligibility: boolean;
  is_scoring: boolean;
  mode: string;
  description: string;
}

export interface ExamScheme {
  exam_id: string;
  stages: string[];
  total_marks: number;
  has_tamil_eligibility_test: boolean;
  tamil_eligibility_notes: string;
  minimum_aggregate_qualifying_marks?: string | null;
  papers: ExamSchemePaper[];
  selection_procedure_summary: string;
}

export interface OfficialNotificationItem {
  id: string;
  notification_number: string;
  title: string;
  tamil_title: string;
  notification_date: string;
  exam_date?: string | null;
  total_vacancies?: number | null;
  revised_vacancies?: number | null;
  gazette_url: string;
  portal_url: string;
  status: "active" | "concluded" | "upcoming" | "amended";
  amendment_summary?: string | null;
  is_official: boolean;
  last_verified_date: string;
}

export interface OfficialAnswerKey {
  key_type: "tentative" | "final";
  release_date?: string | null;
  objection_window_close_date?: string | null;
  official_key_url?: string | null;
  status: "released" | "finalized" | "objection_closed" | "unavailable";
  availability_notice?: string | null;
}

export interface OfficialPYQItem {
  id: string;
  exam_id: string;
  year: number;
  exam_date: string;
  session_title: string;
  tamil_session_title: string;
  booklet_series: string;
  total_questions: number;
  subject: string;
  language: "ta" | "en" | "bilingual";
  question_paper_url?: string | null;
  status: "available" | "unavailable" | "archived";
  availability_notice?: string | null;
  tentative_key?: OfficialAnswerKey | null;
  final_key?: OfficialAnswerKey | null;
  source_metadata: OfficialSourceMetadata;
}

export interface OfficialSyllabusCorrigendum {
  id: string;
  corrigendum_number: string;
  issue_date: string;
  subject_affected: string;
  summary: string;
  tamil_summary: string;
  official_reference_url: string;
  status: string;
}

export interface OfficialSyllabusTopic {
  id: string;
  topic_number: string;
  title: string;
  tamil_title: string;
  subtopics: string[];
  scert_textbook_references: string[];
  career_services_module?: string | null;
  pyq_frequency: "high" | "medium" | "low";
  is_completed?: boolean;
  mastery_percentage?: number;
}

export interface OfficialSyllabusUnit {
  id: string;
  unit_number: number;
  unit_title: string;
  tamil_unit_title: string;
  subject: string;
  description: string;
  topics: OfficialSyllabusTopic[];
}

export interface OfficialSyllabusVersion {
  version_id: string;
  version_name: string;
  effective_from_year: number;
  is_current: boolean;
  status: "current" | "superseded" | "amended";
  gazette_reference: string;
  syllabus_pdf_url: string;
  corrigenda: OfficialSyllabusCorrigendum[];
  units: OfficialSyllabusUnit[];
}

export interface OfficialGovtStudyMaterial {
  id: string;
  title: string;
  tamil_title: string;
  material_type: "scert_textbook" | "career_services_handbook" | "model_question_bank";
  publisher: string;
  academic_class?: string | null;
  subject: string;
  language: string;
  portal_url: string;
  download_url?: string | null;
  status: string;
  verification_date: string;
  description: string;
}

export interface OfficialExamSummary {
  id: string;
  canonical_name: string;
  group_name: string;
  full_name: string;
  tamil_name: string;
  posts: string[];
  status: "announced" | "unannounced" | "concluded" | "postponed";
  official_portal_url: string;
  has_prelims: boolean;
  has_mains: boolean;
  has_interview: boolean;
  total_units: number;
  total_pyqs: number;
  total_materials: number;
  latest_notification_reference?: string | null;
  latest_exam_date?: string | null;
  latest_syllabus_version: string;
}

export interface OfficialExamDetail {
  id: string;
  canonical_name: string;
  group_name: string;
  full_name: string;
  tamil_name: string;
  posts: string[];
  status: string;
  official_portal_url: string;
  eligibility_criteria: string;
  tamil_eligibility_criteria: string;
  preparation_guidance: string;
  scheme: ExamScheme;
  latest_syllabus: OfficialSyllabusVersion;
  previous_syllabus_versions: OfficialSyllabusVersion[];
  notifications: OfficialNotificationItem[];
  pyqs: OfficialPYQItem[];
  govt_materials: OfficialGovtStudyMaterial[];
  latest_announcements: Array<{
    title: string;
    tamil_title: string;
    date: string;
    press_release_no?: string;
    portal_url: string;
  }>;
}

export interface TopicProgressResponse {
  topic_id: string;
  exam_id: string;
  subject: string;
  status: "not_started" | "in_progress" | "completed";
  mastery_percentage: number;
  is_revision_needed: boolean;
  completed_at?: string | null;
  last_studied_at?: string | null;
}

export interface ExamSyllabusProgressResponse {
  exam_id: string;
  total_topics: number;
  completed_topics: number;
  in_progress_topics: number;
  completion_percentage: number;
  revision_needed_topics: string[];
}



