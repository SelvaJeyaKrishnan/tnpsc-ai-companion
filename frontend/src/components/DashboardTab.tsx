"use client";

import React from "react";
import {
  ArrowRight,
  Calendar,
  Clock,
  Flame,
  Play,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import {
  AnalyticsSummary,
  StreakData,
  StudyPlan,
  UserProfile,
} from "@/types";
import { TabKey } from "./Sidebar";

interface DashboardTabProps {
  user: UserProfile | null;
  streak: StreakData | null;
  analytics: AnalyticsSummary | null;
  plan: StudyPlan | null;
  onNavigateTab: (tab: TabKey) => void;
  onStartSessionForTopic: (subject: string, topic: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  user,
  streak,
  analytics,
  plan,
  onNavigateTab,
  onStartSessionForTopic,
}) => {
  const todayMinutes = Math.round((streak?.today_seconds || 0) / 60);
  const dailyGoalMinutes = user?.daily_goal_minutes || 120;
  const goalPercent = Math.min(100, Math.round((todayMinutes / Math.max(1, dailyGoalMinutes)) * 100));

  // Determine weak / recommended topics
  const recommendedTopics = [
    {
      subject: "General Tamil (பொதுத்தமிழ்)",
      topic: "பகுதி-அ: இலக்கணம் & சந்திப்பிழை நீக்குதல்",
      reason: "High exam frequency in TNPSC Group 4 (approx. 35 questions).",
      urgency: "High",
    },
    {
      subject: "Aptitude & Mental Ability",
      topic: "Simple & Compound Interest Calculations",
      reason: "Prioritize for consistent 25/25 scoring in prelims.",
      urgency: "High",
    },
    {
      subject: "Indian Polity & Constitution",
      topic: "Articles 12-35 (Fundamental Rights & Writs)",
      reason: "Scheduled for spaced revision interval.",
      urgency: "Medium",
    },
  ];

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTasks = plan?.tasks.filter((t) => t.date_scheduled === todayStr) || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Welcome Hero Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TNPSC {user?.target_exam || "Group 4"} Aspirant Workspace</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Vanakkam, {user?.full_name || "Aspirant"}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-xl">
              &ldquo;முயற்சி திருவினையாக்கும்&rdquo; — Small, unbroken daily study habits guarantee mastery. Let&apos;s make today count!
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-5">
              <button
                onClick={() => onNavigateTab("timer")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold shadow-lg shadow-blue-500/30 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Focus Session</span>
              </button>
              <button
                onClick={() => onNavigateTab("rooms")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all"
              >
                <Users className="w-4 h-4" />
                <span>Join Study Room</span>
              </button>
            </div>
          </div>

          {/* Daily Goal Gauge Card */}
          <div className="flex items-center gap-5 bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl w-full md:w-auto">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-white/20"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-amber-400 transition-all duration-1000"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - goalPercent / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <span className="absolute font-mono text-sm font-bold text-white">
                {goalPercent}%
              </span>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Daily Study Goal
              </div>
              <div className="text-xl font-bold text-white mt-0.5">
                {todayMinutes}m <span className="text-xs text-slate-400">/ {dailyGoalMinutes}m</span>
              </div>
              <div className="text-[11px] text-amber-300 mt-1">
                {streak?.goal_completed ? "🎉 Goal Reached!" : `${Math.max(0, dailyGoalMinutes - todayMinutes)}m remaining`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div
          onClick={() => onNavigateTab("achievements")}
          className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Study Streak
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {streak?.current_streak || 0} Days
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 group-hover:text-blue-600">
            <span>Best: {streak?.longest_streak || 0} days</span>
            <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Weekly Duration */}
        <div
          onClick={() => onNavigateTab("analytics")}
          className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Weekly Focus
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {Math.round(((analytics?.weekly_seconds || 0) / 3600) * 10) / 10} Hours
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 group-hover:text-blue-600">
            <span>{analytics?.completed_pomodoros || 0} Pomodoros</span>
            <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* AI Plan Progress */}
        <div
          onClick={() => onNavigateTab("planner")}
          className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Roadmap Progress
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {plan?.progress_percentage || 0}%
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 group-hover:text-blue-600">
            <span>{plan?.completed_tasks || 0} of {plan?.total_tasks || 0} tasks</span>
            <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Consistency */}
        <div
          onClick={() => onNavigateTab("analytics")}
          className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Discipline Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            {analytics?.consistency_percentage || 0}%
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 group-hover:text-blue-600">
            <span>Weekly attendance</span>
            <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* Main Grid: Scheduled Tasks + AI Revision Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Today&apos;s Planned Topics ({todayTasks.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab("planner")}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View Full Plan
            </button>
          </div>

          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No tasks scheduled for today. Check your AI Study Planner to populate today&apos;s timetable.
              </div>
            ) : (
              todayTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {t.subject}
                      </span>
                      {t.is_revision && (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 text-amber-800">
                          Revision
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {t.topic}
                    </div>
                  </div>

                  <button
                    onClick={() => onStartSessionForTopic(t.subject, t.topic)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shrink-0"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Focus</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Recommended Revision Topics */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Recommended AI Revision Topics
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Exam Priority
            </span>
          </div>

          <div className="space-y-3">
            {recommendedTopics.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.subject}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-100 text-rose-700">
                      {item.urgency}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {item.topic}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {item.reason}
                  </div>
                </div>

                <button
                  onClick={() => onStartSessionForTopic(item.subject, item.topic)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs shrink-0"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
