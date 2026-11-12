"use client";

import React, { useEffect, useState } from "react";
import {
  clearAuthToken,
  getAnalytics,
  getAuthToken,
  getRecentSessions,
  getStreak,
  getStudyPlan,
  getSyllabus,
  getUser,
  updateUser,
} from "@/lib/api";
import {
  AnalyticsSummary,
  ExamSyllabus,
  StreakData,
  StudyPlan,
  StudySession,
  UserProfile,
} from "@/types";
import { AchievementsTab } from "@/components/AchievementsTab";
import { AiTutorTab } from "@/components/AiTutorTab";
import { AnalyticsTab } from "@/components/AnalyticsTab";
import { AuthModal } from "@/components/AuthModal";
import { DashboardTab } from "@/components/DashboardTab";
import { FocusTimerTab } from "@/components/FocusTimerTab";
import { GroupStudyTab } from "@/components/GroupStudyTab";
import { Header } from "@/components/Header";
import { MockTestsTab } from "@/components/MockTestsTab";
import { PortfolioLandingView } from "@/components/PortfolioLandingView";
import { Sidebar, TabKey } from "@/components/Sidebar";
import { SettingsTab } from "@/components/SettingsTab";
import { StudyMaterialsTab } from "@/components/StudyMaterialsTab";
import { StudyPlannerTab } from "@/components/StudyPlannerTab";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<TabKey>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"app" | "landing">("landing");
  const [isGuestDemo, setIsGuestDemo] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // App data state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [syllabus, setSyllabus] = useState<ExamSyllabus | null>(null);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);

  // Focus Timer preset selection when launched from task
  const [timerPresetSubject, setTimerPresetSubject] = useState<string | null>(null);
  const [timerPresetTopic, setTimerPresetTopic] = useState<string | null>(null);

  const refreshAllData = async () => {
    const token = getAuthToken();
    if (!token) {
      // Set safe guest demo profile without exposing private accounts
      setUser({
        id: 9999,
        username: "Guest Aspirant",
        email: "guest.demo@tnpsc.example",
        full_name: "Guest Aspirant",
        target_exam: "Group 4",
        timezone: "Asia/Kolkata",
        daily_goal_minutes: 120,
        created_at: new Date().toISOString(),
      });
      setStreak({
        current_streak: 2,
        longest_streak: 5,
        last_studied_date: new Date().toISOString().split("T")[0],
        total_sessions: 9,
        total_seconds: 16200,
        today_seconds: 2400,
        daily_goal_minutes: 120,
        goal_completed: false,
        weekly_consistency: [],
        calendar_dates: [new Date().toISOString().split("T")[0]],
      });
      setIsGuestDemo(true);
      try {
        const syl = await getSyllabus("Group 4");
        setSyllabus(syl);
      } catch {
        // syllabus fallback
      }
      return;
    }

    try {
      const [u, s, a, p, r] = await Promise.all([
        getUser(),
        getStreak(),
        getAnalytics("week"),
        getStudyPlan(),
        getRecentSessions(),
      ]);
      setUser(u);
      setStreak(s);
      setAnalytics(a);
      setPlan(p);
      setRecentSessions(r);
      setIsGuestDemo(false);
      setViewMode("app");

      const syl = await getSyllabus(u.target_exam || "Group 4");
      setSyllabus(syl);
    } catch (err) {
      console.warn("Authenticated fetch failed, falling back to guest demo:", err);
      setIsGuestDemo(true);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const handleTargetExamChange = async (exam: string) => {
    if (!user) return;
    try {
      if (!isGuestDemo) {
        const updated = await updateUser({ target_exam: exam });
        setUser(updated);
      } else {
        setUser({ ...user, target_exam: exam });
      }
      const syl = await getSyllabus(exam);
      setSyllabus(syl);
    } catch (err) {
      console.error("Failed to change target exam:", err);
    }
  };

  const handleStartSessionForTopic = (subject: string, topic: string) => {
    setTimerPresetSubject(subject);
    setTimerPresetTopic(topic);
    setCurrentTab("timer");
  };

  const handleSignOut = () => {
    clearAuthToken();
    setIsGuestDemo(true);
    setViewMode("landing");
    refreshAllData();
  };

  const todayMinutes = Math.round((streak?.today_seconds || 0) / 60);
  const weeklyMinutes = Math.round((analytics?.weekly_seconds || 0) / 60);
  const dailyGoal = user?.daily_goal_minutes || 120;

  // Render Portfolio Landing View
  if (viewMode === "landing") {
    return (
      <>
        <PortfolioLandingView
          onEnterApp={(asGuest) => {
            setViewMode("app");
            if (asGuest) setIsGuestDemo(true);
          }}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={() => {
            refreshAllData();
            setViewMode("app");
          }}
        />
      </>
    );
  }

  // Full Productivity Platform Workspace View
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(t) => setCurrentTab(t)}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        streakCount={streak?.current_streak || 0}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onStartFocusClick={() => setCurrentTab("timer")}
          streakCount={streak?.current_streak || 0}
          todayMinutes={todayMinutes}
          dailyGoalMinutes={dailyGoal}
          targetExam={user?.target_exam || "Group 4"}
          onTargetExamChange={handleTargetExamChange}
          user={user}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onSignOut={handleSignOut}
        />

        {/* Guest Demo Mode Notice Banner */}
        {isGuestDemo && (
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white px-4 lg:px-8 py-2 flex flex-wrap items-center justify-between text-xs border-b border-blue-800 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">
                <strong>Portfolio Demo Mode:</strong> Exploring as Guest Aspirant with sample syllabus data.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setViewMode("landing")}
                className="text-blue-300 hover:text-white underline font-semibold text-[11px]"
              >
                Portfolio Overview
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors"
              >
                Sign In / Register
              </button>
            </div>
          </div>
        )}

        {/* View Switcher Banner */}
        {!isGuestDemo && (
          <div className="bg-slate-100/60 border-b border-slate-200/60 px-4 lg:px-8 py-1.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>TNPSC Preparation & Focus Environment</span>
            <button
              onClick={() => setViewMode("landing")}
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
            >
              View Portfolio Overview →
            </button>
          </div>
        )}

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {currentTab === "dashboard" && (
            <DashboardTab
              user={user}
              streak={streak}
              analytics={analytics}
              plan={plan}
              onNavigateTab={(t) => setCurrentTab(t)}
              onStartSessionForTopic={handleStartSessionForTopic}
            />
          )}

          {currentTab === "timer" && (
            <FocusTimerTab
              syllabus={syllabus}
              onSessionLogged={refreshAllData}
              recentSessions={recentSessions}
              todayMinutes={todayMinutes}
              weeklyMinutes={weeklyMinutes}
              dailyGoalMinutes={dailyGoal}
              initialSubject={timerPresetSubject}
              initialTopic={timerPresetTopic}
            />
          )}

          {currentTab === "planner" && (
            <StudyPlannerTab
              onStartSessionForTopic={handleStartSessionForTopic}
              targetExam={user?.target_exam || "Group 4"}
            />
          )}

          {currentTab === "rooms" && (
            <GroupStudyTab
              currentUserId={user?.id || 9999}
            />
          )}

          {currentTab === "analytics" && <AnalyticsTab />}

          {currentTab === "achievements" && <AchievementsTab />}

          {currentTab === "ai_tutor" && <AiTutorTab />}

          {currentTab === "materials" && <StudyMaterialsTab />}

          {currentTab === "mock_tests" && <MockTestsTab />}

          {currentTab === "settings" && (
            <SettingsTab
              user={user}
              onUserUpdated={(u) => {
                setUser(u);
                refreshAllData();
              }}
            />
          )}
        </main>
      </div>

      {/* Auth Modal for Login / Registration */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={refreshAllData}
      />
    </div>
  );
}
