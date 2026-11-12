"use client";

import React from "react";
import {
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Timer,
  Users,
  X,
} from "lucide-react";

import { UserProfile } from "@/types";

export type TabKey =
  | "dashboard"
  | "timer"
  | "planner"
  | "rooms"
  | "analytics"
  | "achievements"
  | "ai_tutor"
  | "materials"
  | "mock_tests"
  | "settings";

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  user?: UserProfile | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  streakCount,
  user,
}) => {
  const navItems = [
    { key: "dashboard" as TabKey, label: "Dashboard", icon: LayoutDashboard },
    { key: "timer" as TabKey, label: "Focus & Pomodoro", icon: Timer, badge: "Live" },
    { key: "planner" as TabKey, label: "AI Study Planner", icon: Calendar },
    { key: "rooms" as TabKey, label: "Group Study Rooms", icon: Users, badge: "Sync" },
    { key: "analytics" as TabKey, label: "Productivity Analytics", icon: BarChart3 },
    { key: "achievements" as TabKey, label: "Streaks & Badges", icon: Award },
    { divider: true, label: "TNPSC Learning Modules" },
    { key: "ai_tutor" as TabKey, label: "AI Tutor & Notes", icon: Brain },
    { key: "materials" as TabKey, label: "Study Materials", icon: BookOpen },
    { key: "mock_tests" as TabKey, label: "Mock Tests & Quizzes", icon: GraduationCap },
    { divider: true, label: "Preferences" },
    { key: "settings" as TabKey, label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-slate-200 border-r border-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-lg shadow-lg shadow-blue-500/30">
              T
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                TNPSC <span className="text-blue-400 font-semibold">Companion</span>
              </div>
              <div className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">
                AI Productivity Platform
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Streak Ribbon */}
        <div className="mx-4 my-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <div>
              <div className="text-xs font-semibold text-amber-300">
                {streakCount} Day Streak
              </div>
              <div className="text-[10px] text-amber-200/70">Keep the momentum going!</div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
            ACTIVE
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-1.5 space-y-0.5 overflow-y-auto scrollbar-none">
          {navItems.map((item, idx) => {
            if ("divider" in item) {
              return (
                <div
                  key={`div-${idx}`}
                  className="px-3 pt-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {item.label}
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = currentTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelectTab(item.key);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-blue-500/20 text-blue-300 border border-blue-400/20"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs uppercase">
              {user ? user.username.slice(0, 2).toUpperCase() : "GA"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {user ? user.full_name || user.username : "Guest Aspirant"}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                Target: TNPSC {user?.target_exam || "Group 4"}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
