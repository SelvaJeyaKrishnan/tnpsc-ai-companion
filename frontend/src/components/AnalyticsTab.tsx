"use client";

import React, { useCallback, useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { getAnalytics } from "@/lib/api";
import { AnalyticsSummary } from "@/types";

interface AnalyticsTabProps {
  isGuestDemo?: boolean;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ isGuestDemo = false }) => {
  const [period, setPeriod] = useState<string>("week");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  const fetchStats = useCallback(async () => {
    if (isGuestDemo) {
      setAnalytics({
        total_study_seconds: 16200,
        total_study_hours: 4.5,
        today_seconds: 2400,
        weekly_seconds: 16200,
        monthly_seconds: 48600,
        completed_pomodoros: 6,
        average_daily_minutes: 38,
        consistency_percentage: 67,
        subject_distribution: [
          { subject: "General Tamil (பொதுத்தமிழ்)", seconds: 7200, percentage: 44.4, sessions_count: 4 },
          { subject: "Indian Polity & Constitution", seconds: 5400, percentage: 33.3, sessions_count: 3 },
          { subject: "Aptitude & Mental Ability", seconds: 3600, percentage: 22.3, sessions_count: 2 },
        ],
        most_productive_hours: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          label: `${String(i).padStart(2, "0")}:00`,
          seconds: i === 6 || i === 7 || i === 19 || i === 20 ? 3600 : 0,
        })),
        weekly_trend: [
          { date: "2026-11-06", day_name: "Thu", seconds: 2400, sessions_count: 1, target_met: true },
          { date: "2026-11-07", day_name: "Fri", seconds: 3600, sessions_count: 2, target_met: true },
          { date: "2026-11-08", day_name: "Sat", seconds: 4800, sessions_count: 2, target_met: true },
          { date: "2026-11-09", day_name: "Sun", seconds: 1800, sessions_count: 1, target_met: false },
          { date: "2026-11-10", day_name: "Mon", seconds: 3600, sessions_count: 2, target_met: true },
          { date: "2026-11-11", day_name: "Tue", seconds: 4200, sessions_count: 2, target_met: true },
          { date: "2026-11-12", day_name: "Wed", seconds: 2400, sessions_count: 1, target_met: true },
        ],
        filter_period: "week",
      });
      return;
    }

    try {
      const data = await getAnalytics(
        period,
        period === "custom" ? startDate : undefined,
        period === "custom" ? endDate : undefined
      );
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    }
  }, [period, startDate, endDate, isGuestDemo]);

  useEffect(() => {
    if (period !== "custom" || (startDate && endDate)) {
      fetchStats();
    }
  }, [period, startDate, endDate, fetchStats]);

  const maxWeeklySecs = analytics
    ? Math.max(1, ...analytics.weekly_trend.map((d) => d.seconds))
    : 3600;

  const maxHourlySecs = analytics
    ? Math.max(1, ...analytics.most_productive_hours.map((h) => h.seconds))
    : 3600;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Filter Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Productivity Analytics & Insights</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real data aggregated from your logged focus, countdown, and Pomodoro sessions.
          </p>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/70">
            {[
              { key: "today", label: "Today" },
              { key: "week", label: "Last 7 Days" },
              { key: "month", label: "Last 30 Days" },
              { key: "all", label: "All Time" },
              { key: "custom", label: "Custom Range" },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === p.key
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {period === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs p-1.5 rounded-lg border border-slate-300"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs p-1.5 rounded-lg border border-slate-300"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Hours</div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {analytics?.total_study_hours || 0} hrs
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Cumulative study</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Time</div>
          <div className="text-xl font-bold text-blue-600 mt-1">
            {Math.round((analytics?.today_seconds || 0) / 60)} mins
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Focus logged</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Weekly Time</div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {Math.round(((analytics?.weekly_seconds || 0) / 3600) * 10) / 10} hrs
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Past 7 days</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pomodoros</div>
          <div className="text-xl font-bold text-indigo-600 mt-1">
            {analytics?.completed_pomodoros || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Completed cycles</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Daily Avg</div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {analytics?.average_daily_minutes || 0} mins
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Per active day</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Consistency</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {analytics?.consistency_percentage || 0}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Weekly discipline</div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Bar Chart */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Daily Study Distribution (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-500">Duration in minutes per calendar day</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Discipline Track
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100">
            {analytics?.weekly_trend.map((d, i) => {
              const mins = Math.round(d.seconds / 60);
              const heightPct = Math.max(8, Math.min(100, Math.round((d.seconds / maxWeeklySecs) * 100)));

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                    {mins > 0 ? `${mins}m` : "-"}
                  </span>
                  <div
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      d.target_met
                        ? "bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300"
                        : mins > 0
                        ? "bg-gradient-to-t from-blue-600 to-indigo-400 group-hover:from-blue-500 group-hover:to-indigo-300"
                        : "bg-slate-100"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[11px] font-semibold text-slate-600 group-hover:text-slate-900">
                    {d.day_name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Target Met (120m+)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              <span>Study Logged</span>
            </div>
          </div>
        </div>

        {/* Subject-Wise Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Subject-Wise Study Distribution
              </h3>
              <p className="text-xs text-slate-500">Breakdown of hours across syllabus areas</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Syllabus Balance
            </span>
          </div>

          <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
            {(!analytics?.subject_distribution || analytics.subject_distribution.length === 0) ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No subject study data recorded for this time frame.
              </div>
            ) : (
              analytics.subject_distribution.map((subj, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 truncate max-w-xs">{subj.subject}</span>
                    <span className="text-slate-500 font-mono">
                      {Math.round((subj.seconds / 60))}m ({subj.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${subj.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Hourly Productivity Heat Breakdown (24 Hours) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Most Productive Study Hours
            </h3>
            <p className="text-xs text-slate-500">
              Identify your peak circadian focus windows during the 24-hour cycle.
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            Peak Focus Heatmap
          </span>
        </div>

        <div className="h-32 flex items-end justify-between gap-1 pt-6 pb-2 border-b border-slate-100">
          {analytics?.most_productive_hours.map((h, idx) => {
            const mins = Math.round(h.seconds / 60);
            const heightPct = Math.max(6, Math.min(100, Math.round((h.seconds / maxHourlySecs) * 100)));

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-1 group h-full justify-end"
                title={`${h.label}: ${mins} minutes studied`}
              >
                <div
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    mins > 0
                      ? "bg-blue-600 group-hover:bg-blue-500"
                      : "bg-slate-100 group-hover:bg-slate-200"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                {idx % 3 === 0 && (
                  <span className="text-[9px] font-mono text-slate-400 group-hover:text-slate-800">
                    {h.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
