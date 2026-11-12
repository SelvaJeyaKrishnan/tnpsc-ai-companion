"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  Calendar,
  Clock,
  Crown,
  Flame,
  Lock,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { getAchievements, getStreak } from "@/lib/api";
import { Achievement, StreakData } from "@/types";

export const AchievementsTab: React.FC = () => {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [streakData, achData] = await Promise.all([
          getStreak(),
          getAchievements(),
        ]);
        setStreak(streakData);
        setAchievements(achData);
      } catch (err) {
        console.error("Failed to load achievements:", err);
      }
    }
    loadData();
  }, []);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "zap":
        return <Zap className="w-6 h-6" />;
      case "flame":
        return <Flame className="w-6 h-6" />;
      case "award":
        return <Award className="w-6 h-6" />;
      case "crown":
        return <Crown className="w-6 h-6" />;
      case "clock":
        return <Clock className="w-6 h-6" />;
      case "star":
        return <Star className="w-6 h-6" />;
      case "trophy":
        return <Trophy className="w-6 h-6" />;
      case "target":
        return <Target className="w-6 h-6" />;
      case "users":
        return <Users className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const progressPct = Math.round((unlockedCount / Math.max(1, achievements.length)) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Trophy className="w-4 h-4" />
            <span>Milestones & Discipline Hall</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mt-1">
            Streaks & Preparation Trophies
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Gamified consistency records celebrating your dedication to Tamil Nadu Civil Services preparation.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Current Streak: <b>{streak?.current_streak || 0} Days</b></span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span>Best Streak: <b>{streak?.longest_streak || 0} Days</b></span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Total Hours: <b>{Math.round(((streak?.total_seconds || 0) / 3600) * 10) / 10}h</b></span>
            </span>
          </div>
        </div>

        {/* Badge Progress Circle */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-4 rounded-2xl">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-lg border border-amber-500/30">
            {unlockedCount}/{achievements.length}
          </div>
          <div>
            <div className="text-xs font-bold text-white">Unlocked Badges</div>
            <div className="text-[11px] text-slate-400">{progressPct}% completed</div>
          </div>
        </div>
      </div>

      {/* Streak Calendar View */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Study Streak Calendar</span>
            </h3>
            <p className="text-xs text-slate-500">Days with recorded TNPSC study sessions</p>
          </div>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
            🔥 {streak?.current_streak || 0} Day Active Streak
          </span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-21 gap-2 pt-2">
          {Array.from({ length: 28 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (27 - i));
            const dateStr = date.toISOString().split("T")[0];
            const wasStudied = streak?.calendar_dates?.includes(dateStr);

            return (
              <div
                key={i}
                className={`p-2 rounded-xl text-center flex flex-col items-center justify-center border transition-all ${
                  wasStudied
                    ? "bg-amber-50 border-amber-300 text-amber-900 shadow-xs font-bold"
                    : "bg-slate-50/50 border-slate-200 text-slate-400"
                }`}
                title={dateStr}
              >
                <span className="text-[10px]">{date.toLocaleDateString([], { weekday: "narrow" })}</span>
                <span className="text-xs font-mono mt-0.5">{date.getDate()}</span>
                {wasStudied && <span className="text-[10px] mt-0.5">🔥</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Badges Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">
          All Achievement Trophies
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.badge_key}
              className={`p-5 rounded-3xl border transition-all flex items-start gap-4 ${
                ach.unlocked
                  ? "bg-white border-amber-300/80 shadow-xs hover:shadow-md"
                  : "bg-slate-50/70 border-slate-200 opacity-60"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  ach.unlocked
                    ? "bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {ach.unlocked ? getBadgeIcon(ach.icon) : <Lock className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{ach.title}</h4>
                  {ach.unlocked ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">LOCKED</span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ach.description}</p>

                {ach.unlocked && ach.unlocked_at && (
                  <div className="text-[10px] font-semibold text-amber-600 mt-2">
                    Unlocked on {new Date(ach.unlocked_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
