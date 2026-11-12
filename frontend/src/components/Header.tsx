"use client";

import React, { useState } from "react";
import { Flame, LogIn, LogOut, Menu, Play, Target, User } from "lucide-react";
import { TabKey } from "./Sidebar";
import { UserProfile } from "@/types";

interface HeaderProps {
  currentTab: TabKey;
  onOpenMobileSidebar: () => void;
  onStartFocusClick: () => void;
  streakCount: number;
  todayMinutes: number;
  dailyGoalMinutes: number;
  targetExam: string;
  onTargetExamChange: (exam: string) => void;
  user?: UserProfile | null;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onStartFocusClick,
  streakCount,
  todayMinutes,
  dailyGoalMinutes,
  targetExam,
  onTargetExamChange,
  user,
  onOpenAuthModal,
  onSignOut,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const titles: Record<TabKey, { title: string; subtitle: string }> = {
    dashboard: {
      title: "Productivity Command Center",
      subtitle: "Welcome back, Aspirant. Stay consistent and focused today.",
    },
    timer: {
      title: "Smart Study & Pomodoro Timer",
      subtitle: "Dedicated focus sessions with auto-transition and syllabus tracking.",
    },
    planner: {
      title: "AI Study Planner & Roadmap",
      subtitle: "Personalized syllabus schedules, priority weights and spaced revisions.",
    },
    rooms: {
      title: "Collaborative Study Rooms",
      subtitle: "Study with fellow TNPSC aspirants in real-time focus rooms.",
    },
    analytics: {
      title: "Productivity & Time Analytics",
      subtitle: "Evidence-based metrics calculated from your real study sessions.",
    },
    achievements: {
      title: "Streaks & Milestone Badges",
      subtitle: "Celebrate your discipline, daily consistency and study records.",
    },
    ai_tutor: {
      title: "AI TNPSC Tutor & Notes",
      subtitle: "Ask questions, explore concept notes and get syllabus clarifications.",
    },
    materials: {
      title: "Verified Study Materials",
      subtitle: "Tamil Nadu SCERT Samacheer Kalvi textbooks and curated references.",
    },
    mock_tests: {
      title: "Mock Tests & Topic Quizzes",
      subtitle: "Evaluate your readiness with timed syllabus questions and reviews.",
    },
    settings: {
      title: "Account & Study Preferences",
      subtitle: "Manage daily goals, timezones and target examination categories.",
    },
  };

  const currentMeta = titles[currentTab] || {
    title: "TNPSC AI Companion",
    subtitle: "Your personal study assistant.",
  };

  const goalPercent = Math.min(
    100,
    Math.round((todayMinutes / Math.max(1, dailyGoalMinutes)) * 100)
  );

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4 lg:px-8 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 mr-2">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">
            {currentMeta.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block truncate">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Target Exam Dropdown */}
        <select
          value={targetExam}
          onChange={(e) => onTargetExamChange(e.target.value)}
          className="text-[11px] sm:text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg px-2 sm:px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors max-w-[105px] sm:max-w-none truncate"
        >
          <option value="Group 4">Group 4</option>
          <option value="Group 2">Group 2 / 2A</option>
          <option value="Group 1">Group 1</option>
        </select>

        {/* Streak Flame Badge */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl shrink-0">
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-500" />
          <span className="text-[11px] sm:text-xs font-bold text-amber-800">{streakCount}d</span>
        </div>

        {/* Daily Goal Progress Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
          <Target className="w-4 h-4 text-blue-600" />
          <div className="text-xs">
            <span className="font-semibold text-slate-800">{todayMinutes}m</span>
            <span className="text-slate-400"> / {dailyGoalMinutes}m goal</span>
          </div>
          <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden ml-1">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Start Focus Button */}
        {currentTab !== "timer" && (
          <button
            onClick={onStartFocusClick}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all shrink-0"
          >
            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            <span className="hidden lg:inline">Focus Session</span>
          </button>
        )}

        {/* Auth / Profile Button */}
        <div className="relative">
          {user ? (
            <div>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all text-xs font-semibold"
                aria-label="User profile"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                  {user.username.charAt(0)}
                </div>
                <span className="hidden lg:inline text-xs">{user.username}</span>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user.full_name || user.username}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenAuthModal();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Switch Account</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onSignOut();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
