export interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  target_exam: string;
  timezone: string;
  daily_goal_minutes: number;
  created_at: string;
}

export interface UserLoginPayload {
  username: string;
  password: string;
}

export interface UserRegisterPayload {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  target_exam?: string;
  timezone?: string;
  daily_goal_minutes?: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface StudySession {
  id: number;
  user_id: number;
  session_type: "countdown" | "stopwatch" | "pomodoro";
  subject: string;
  topic: string;
  duration_seconds: number;
  started_at: string;
  ended_at: string;
  completed: boolean;
  notes?: string;
  created_at: string;
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
  is_focusing: boolean;
  current_subject: string;
  current_topic: string;
  completed_sessions: number;
  total_minutes: number;
  joined_at?: string;
}

export interface StudyRoom {
  id: number;
  room_code: string;
  name: string;
  description?: string;
  is_private: boolean;
  created_by: string;
  duration_minutes: number;
  remaining_seconds?: number;
  started_at: string;
  is_active: boolean;
  participants_count: number;
  participants: RoomParticipant[];
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
  subjects: SyllabusSubject[];
}

export interface StudyTask {
  id: number;
  plan_id?: number;
  subject: string;
  topic: string;
  date_scheduled: string;
  duration_minutes: number;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed" | "missed";
  is_revision: boolean;
  completed_at?: string | null;
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
}
