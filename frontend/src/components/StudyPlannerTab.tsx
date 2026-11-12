"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ListTodo,
  Play,
  RotateCw,
  Sparkles,
  Target,
} from "lucide-react";
import {
  generateStudyPlan,
  getStudyPlan,
  getSyllabus,
  rebalanceSchedule,
  updateStudyTask,
} from "@/lib/api";
import { ExamSyllabus, StudyPlan, StudyTask } from "@/types";

interface StudyPlannerTabProps {
  onStartSessionForTopic: (subject: string, topic: string) => void;
  targetExam: string;
}

export const StudyPlannerTab: React.FC<StudyPlannerTabProps> = ({
  onStartSessionForTopic,
  targetExam,
}) => {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [syllabus, setSyllabus] = useState<ExamSyllabus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [rebalancing, setRebalancing] = useState<boolean>(false);
  const [rebalanceMsg, setRebalanceMsg] = useState<string | null>(null);
  const [plannerError, setPlannerError] = useState<string | null>(null);

  // Generation parameters
  const [examType, setExamType] = useState<string>(targetExam || "Group 4");
  const [examDate, setExamDate] = useState<string>("2026-12-15");
  const [dailyHours, setDailyHours] = useState<number>(4.0);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([
    "General Tamil (பொதுத்தமிழ்)",
    "Aptitude & Mental Ability",
  ]);

  // Load plan and syllabus
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [planData, sylData] = await Promise.all([
        getStudyPlan(),
        getSyllabus(examType),
      ]);
      setPlan(planData);
      setSyllabus(sylData);
    } catch (err) {
      console.error("Failed to load planner data:", err);
    } finally {
      setLoading(false);
    }
  }, [examType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generate Plan Handler
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setPlannerError(null);
    try {
      const generated = await generateStudyPlan({
        exam_type: examType,
        target_exam_date: examDate,
        daily_study_hours: dailyHours,
        weak_subjects: weakSubjects,
      });
      setPlan(generated);
    } catch (err: unknown) {
      setPlannerError((err as Error).message || "Failed to generate study plan");
    } finally {
      setGenerating(false);
    }
  };

  // Toggle task completion
  const handleToggleTask = async (task: StudyTask) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      const updated = await updateStudyTask(task.id, newStatus);
      setPlan((prev) => {
        if (!prev) return prev;
        const newTasks = prev.tasks.map((t) => (t.id === task.id ? updated : t));
        const completed = newTasks.filter((t) => t.status === "completed").length;
        const pct = Math.round((completed / Math.max(1, newTasks.length)) * 100);
        return {
          ...prev,
          tasks: newTasks,
          completed_tasks: completed,
          progress_percentage: pct,
        };
      });
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  // Auto Rebalance Handler
  const handleRebalance = async () => {
    setRebalancing(true);
    setRebalanceMsg(null);
    setPlannerError(null);
    try {
      const res = await rebalanceSchedule(plan?.id);
      setPlan(res.plan);
      setRebalanceMsg(res.message);
      setTimeout(() => setRebalanceMsg(null), 6000);
    } catch (err: unknown) {
      setPlannerError((err as Error).message || "Failed to rebalance schedule");
    } finally {
      setRebalancing(false);
    }
  };

  // Toggle weak subject selection
  const toggleWeakSubject = (name: string) => {
    setWeakSubjects((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <Sparkles className="w-4 h-4" />
            <span>AI Curriculum Engine</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mt-1">
            {plan?.title || "TNPSC AI Precision Study Planner"}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Syllabus-aligned study timetable with spaced revision intervals, prioritizing weak topics and upcoming exam deadlines.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <span>Target: {plan?.exam_type || examType}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Exam: {plan?.target_exam_date || examDate}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{plan?.daily_study_hours || dailyHours} hrs/day</span>
            </span>
          </div>
        </div>

        {/* Rebalance Action */}
        <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
          <button
            onClick={handleRebalance}
            disabled={rebalancing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${rebalancing ? "animate-spin" : ""}`} />
            <span>Auto-Rebalance Missed Tasks</span>
          </button>
          {rebalanceMsg && (
            <span className="text-[11px] font-semibold text-emerald-300 animate-in fade-in">
              {rebalanceMsg}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar Card */}
      {plan && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Roadmap Completion Status
              </span>
            </div>
            <span className="text-xs font-bold text-blue-600">
              {plan.completed_tasks} / {plan.total_tasks} Tasks Completed ({plan.progress_percentage}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${plan.progress_percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Two Columns: Plan Generator & Task Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Plan Customization Controls */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Customize AI Schedule</span>
          </h3>

          {plannerError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{plannerError}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Target TNPSC Exam
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Group 4">TNPSC Group 4 (VAO / JA / Typist)</option>
                <option value="Group 2">TNPSC Group 2 & 2A (Sub-Registrar / ASO)</option>
                <option value="Group 1">TNPSC Group 1 (Deputy Collector / DSP)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Examination Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Available Daily Study Hours
                </label>
                <span className="text-xs font-bold text-blue-600">{dailyHours} hrs</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Priority Weak Subjects (3x Weight)
              </label>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {syllabus?.subjects.map((s) => {
                  const isChecked = weakSubjects.includes(s.name);
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => toggleWeakSubject(s.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all ${
                        isChecked
                          ? "bg-blue-50 border-blue-300 text-blue-800 font-semibold"
                          : "bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className="truncate">{s.name}</span>
                      <span className="text-[10px] font-bold shrink-0 ml-1">
                        {isChecked ? "PRIORITY" : "NORMAL"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {generating ? "Synthesizing Roadmap..." : "Regenerate AI Plan"}
            </button>
          </form>
        </div>

        {/* Right Column: Scheduled Daily Tasks */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Upcoming Scheduled Study Sessions</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Sorted chronologically
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading plan...</div>
          ) : !plan || plan.tasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No tasks scheduled. Click &quot;Regenerate AI Plan&quot; to build your timetable.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[32rem] overflow-y-auto pr-1">
              {plan.tasks.map((task) => {
                const isCompleted = task.status === "completed";
                const isToday = task.date_scheduled === todayStr;
                const isOverdue = !isCompleted && task.date_scheduled < todayStr;

                return (
                  <div
                    key={task.id}
                    className={`py-3.5 flex items-center justify-between gap-4 transition-colors ${
                      isCompleted ? "opacity-60 bg-slate-50/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task)}
                        className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                          isCompleted
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 hover:border-blue-500"
                        }`}
                        title={isCompleted ? "Mark pending" : "Mark completed"}
                      >
                        {isCompleted && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-bold ${
                              isCompleted ? "line-through text-slate-500" : "text-slate-900"
                            }`}
                          >
                            {task.subject}
                          </span>

                          {task.is_revision && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              Spaced Revision
                            </span>
                          )}

                          {task.priority === "high" && !task.is_revision && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                              High Priority
                            </span>
                          )}

                          {isToday && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              Today
                            </span>
                          )}

                          {isOverdue && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Missed
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {task.topic}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs font-mono font-semibold text-slate-500">
                        {task.date_scheduled} • {task.duration_minutes}m
                      </span>

                      {!isCompleted && (
                        <button
                          onClick={() => onStartSessionForTopic(task.subject, task.topic)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                          title="Launch timer for this task"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
