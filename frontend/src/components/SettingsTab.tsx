"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Settings } from "lucide-react";
import { updateUser } from "@/lib/api";
import { UserProfile } from "@/types";

interface SettingsTabProps {
  user: UserProfile | null;
  onUserUpdated: (u: UserProfile) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ user, onUserUpdated }) => {
  const [fullName, setFullName] = useState(user?.full_name || "Karthik Raja");
  const [targetExam, setTargetExam] = useState(user?.target_exam || "Group 4");
  const [dailyGoal, setDailyGoal] = useState(user?.daily_goal_minutes || 120);
  const [timezone, setTimezone] = useState(user?.timezone || "Asia/Kolkata");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const updated = await updateUser({
        full_name: fullName,
        target_exam: targetExam,
        daily_goal_minutes: dailyGoal,
        timezone: timezone,
      });
      onUserUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Failed to update profile");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-600" />
          <span>Profile & Study Settings</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure your personal goals, timezone, and TNPSC targets.
        </p>

        {savedSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile and productivity preferences updated successfully!</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2 border border-rose-200">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 mt-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target TNPSC Examination
            </label>
            <select
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Group 4">TNPSC Group 4 (VAO / JA / Typist)</option>
              <option value="Group 2">TNPSC Group 2 & 2A (Combined Civil Services)</option>
              <option value="Group 1">TNPSC Group 1 (Deputy Collector / DSP)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Study Goal (Minutes)
            </label>
            <input
              type="number"
              min="30"
              max="600"
              step="15"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
              <option value="UTC">UTC</option>
              <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT +8:00)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
