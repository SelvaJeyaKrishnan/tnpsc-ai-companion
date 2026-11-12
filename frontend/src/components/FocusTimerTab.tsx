"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCircle2,
  History,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { recordSession } from "@/lib/api";
import { sound } from "@/lib/sound";
import { ExamSyllabus, StudySession } from "@/types";
import { FocusModeOverlay } from "./FocusModeOverlay";

type TimerMode = "pomodoro" | "countdown" | "stopwatch";
type PomodoroPhase = "focus" | "short_break" | "long_break";

interface FocusTimerTabProps {
  syllabus: ExamSyllabus | null;
  onSessionLogged: () => void;
  recentSessions: StudySession[];
  todayMinutes: number;
  weeklyMinutes: number;
  dailyGoalMinutes: number;
  initialSubject?: string | null;
  initialTopic?: string | null;
}

export const FocusTimerTab: React.FC<FocusTimerTabProps> = ({
  syllabus,
  onSessionLogged,
  recentSessions,
  todayMinutes,
  weeklyMinutes,
  dailyGoalMinutes,
  initialSubject,
  initialTopic,
}) => {
  // Timer Mode
  const [mode, setMode] = useState<TimerMode>("pomodoro");

  // Subject and Topic
  const [selectedSubject, setSelectedSubject] = useState<string>(
    initialSubject || "General Tamil (பொதுத்தமிழ்)"
  );
  const [selectedTopic, setSelectedTopic] = useState<string>(
    initialTopic || "பகுதி-அ: இலக்கணம்"
  );
  const [notes, setNotes] = useState<string>("");

  // Durations (in minutes)
  const [pomoFocusMin, setPomoFocusMin] = useState<number>(25);
  const [pomoShortBreakMin, setPomoShortBreakMin] = useState<number>(5);
  const [pomoLongBreakMin, setPomoLongBreakMin] = useState<number>(15);
  const [countdownMin, setCountdownMin] = useState<number>(30);

  // Pomodoro state
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>("focus");
  const [cycleCount, setCycleCount] = useState<number>(1);
  const [autoTransition, setAutoTransition] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Timer execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(25 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);

  // Fullscreen Focus Mode
  const [isFocusModeOpen, setIsFocusModeOpen] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // High-precision epoch timestamps to eliminate tab backgrounding drift
  const targetEndTimeRef = useRef<number | null>(null);
  const stopwatchStartTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize subject & topic from props or syllabus
  useEffect(() => {
    if (initialSubject) {
      setSelectedSubject(initialSubject);
      if (initialTopic) {
        setSelectedTopic(initialTopic);
      }
    } else if (syllabus && syllabus.subjects.length > 0) {
      setSelectedSubject((prev) => {
        if (!prev) {
          const firstSubj = syllabus.subjects[0];
          if (firstSubj.topics.length > 0) {
            setSelectedTopic(firstSubj.topics[0].name);
          }
          return firstSubj.name;
        }
        return prev;
      });
    }
  }, [initialSubject, initialTopic, syllabus]);

  // Session Recovery from localStorage with wall-clock epoch accuracy
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tnpsc_focus_timer_state");
      if (saved) {
        const data = JSON.parse(saved);
        setMode(data.mode || "pomodoro");
        setSelectedSubject(data.selectedSubject || "General Tamil (பொதுத்தமிழ்)");
        setSelectedTopic(data.selectedTopic || "பகுதி-அ: இலக்கணம்");
        setPomodoroPhase(data.pomodoroPhase || "focus");
        setCycleCount(data.cycleCount || 1);
        setPomoFocusMin(data.pomoFocusMin || 25);
        setPomoShortBreakMin(data.pomoShortBreakMin || 5);
        setPomoLongBreakMin(data.pomoLongBreakMin || 15);
        setCountdownMin(data.countdownMin || 30);

        if (data.isRunning) {
          if (data.targetEndTime && data.mode !== "stopwatch") {
            const diff = Math.ceil((data.targetEndTime - Date.now()) / 1000);
            if (diff > 0) {
              setRemainingSeconds(diff);
              targetEndTimeRef.current = data.targetEndTime;
              setIsRunning(true);
            } else {
              setRemainingSeconds(0);
              setIsRunning(false);
            }
          } else if (data.stopwatchStartTime && data.mode === "stopwatch") {
            const elapsed = Math.floor((Date.now() - data.stopwatchStartTime) / 1000);
            setStopwatchSeconds(elapsed);
            stopwatchStartTimeRef.current = data.stopwatchStartTime;
            setIsRunning(true);
          }
        } else {
          setRemainingSeconds(data.remainingSeconds ?? 25 * 60);
          setStopwatchSeconds(data.stopwatchSeconds || 0);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save state to localStorage on changes
  useEffect(() => {
    try {
      const state = {
        mode,
        selectedSubject,
        selectedTopic,
        pomodoroPhase,
        cycleCount,
        remainingSeconds,
        stopwatchSeconds,
        pomoFocusMin,
        pomoShortBreakMin,
        pomoLongBreakMin,
        countdownMin,
        isRunning,
        targetEndTime: targetEndTimeRef.current,
        stopwatchStartTime: stopwatchStartTimeRef.current,
      };
      localStorage.setItem("tnpsc_focus_timer_state", JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [
    mode,
    selectedSubject,
    selectedTopic,
    pomodoroPhase,
    cycleCount,
    remainingSeconds,
    stopwatchSeconds,
    pomoFocusMin,
    pomoShortBreakMin,
    pomoLongBreakMin,
    countdownMin,
    isRunning,
  ]);

  // Notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Switch modes
  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === "pomodoro") {
      setPomodoroPhase("focus");
      setRemainingSeconds(pomoFocusMin * 60);
    } else if (newMode === "countdown") {
      setRemainingSeconds(countdownMin * 60);
    } else {
      setStopwatchSeconds(0);
    }
  };

  // Complete and save focus session
  const saveCompletedSession = async (durationSecs: number, sessionType: "pomodoro" | "countdown" | "stopwatch") => {
    if (durationSecs < 10) return; // Ignore accidental micro-sessions

    const now = new Date();
    const start = sessionStartTime ? new Date(sessionStartTime) : new Date(now.getTime() - durationSecs * 1000);

    try {
      await recordSession({
        session_type: sessionType,
        subject: selectedSubject,
        topic: selectedTopic,
        duration_seconds: durationSecs,
        started_at: start.toISOString(),
        ended_at: now.toISOString(),
        completed: true,
        notes: notes || undefined,
        pomodoro_cycles: sessionType === "pomodoro" ? cycleCount : undefined,
        focus_minutes: sessionType === "pomodoro" ? pomoFocusMin : undefined,
        short_break_minutes: pomoShortBreakMin,
        long_break_minutes: pomoLongBreakMin,
      });

      onSessionLogged();
      showToast(`Logged ${Math.round(durationSecs / 60)}m for ${selectedSubject}!`);
    } catch (err) {
      console.error("Failed to save session:", err);
    }
  };

  // Timer Tick Engine using epoch delta to prevent backgrounding throttling
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (!sessionStartTime) {
      setSessionStartTime(new Date().toISOString());
    }

    const tick = () => {
      if (mode === "stopwatch") {
        if (stopwatchStartTimeRef.current) {
          const elapsed = Math.floor((Date.now() - stopwatchStartTimeRef.current) / 1000);
          setStopwatchSeconds(elapsed);
        } else {
          setStopwatchSeconds((prev) => prev + 1);
        }
      } else {
        if (targetEndTimeRef.current) {
          const diff = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
          setRemainingSeconds(diff);
          if (diff <= 0) {
            handleTimerComplete();
          }
        } else {
          setRemainingSeconds((prev) => {
            if (prev <= 1) {
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        }
      }
    };

    timerRef.current = setInterval(tick, 1000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        tick();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, mode, pomodoroPhase, cycleCount, autoTransition, soundEnabled]);

  // Handle completion of countdown or pomodoro phase
  const handleTimerComplete = async () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    stopwatchStartTimeRef.current = null;

    if (mode === "countdown") {
      if (soundEnabled) sound.playCompletionChime();
      showToast("🎉 Countdown completed! Great study session.");
      await saveCompletedSession(countdownMin * 60, "countdown");
      setRemainingSeconds(countdownMin * 60);
      setSessionStartTime(null);
      return;
    }

    if (mode === "pomodoro") {
      if (pomodoroPhase === "focus") {
        if (soundEnabled) sound.playBreakChime();
        await saveCompletedSession(pomoFocusMin * 60, "pomodoro");
        setSessionStartTime(null);

        const isLong = cycleCount % 4 === 0;
        const nextPhase: PomodoroPhase = isLong ? "long_break" : "short_break";
        const breakSecs = (isLong ? pomoLongBreakMin : pomoShortBreakMin) * 60;

        setPomodoroPhase(nextPhase);
        setRemainingSeconds(breakSecs);
        showToast(isLong ? "🌟 4 Cycles Complete! Take a 15-minute Long Break." : "☕ Focus Complete! Take a 5-minute Short Break.");

        if (autoTransition) {
          targetEndTimeRef.current = Date.now() + breakSecs * 1000;
          setTimeout(() => setIsRunning(true), 1000);
        }
      } else {
        // Break phase completed -> transition to next focus
        if (soundEnabled) sound.playCompletionChime();
        setCycleCount((prev) => prev + 1);
        setPomodoroPhase("focus");
        const focusSecs = pomoFocusMin * 60;
        setRemainingSeconds(focusSecs);
        showToast("🔔 Break is over! Starting next focus cycle.");

        if (autoTransition) {
          targetEndTimeRef.current = Date.now() + focusSecs * 1000;
          setTimeout(() => setIsRunning(true), 1000);
        }
      }
    }
  };

  // Toggle start / pause with timestamp anchor
  const toggleTimer = () => {
    setIsRunning((prev) => {
      const next = !prev;
      if (next) {
        if (mode === "stopwatch") {
          stopwatchStartTimeRef.current = Date.now() - stopwatchSeconds * 1000;
        } else {
          targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
        }
      } else {
        targetEndTimeRef.current = null;
        stopwatchStartTimeRef.current = null;
      }
      return next;
    });
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    stopwatchStartTimeRef.current = null;
    setSessionStartTime(null);
    if (mode === "pomodoro") {
      setPomodoroPhase("focus");
      setRemainingSeconds(pomoFocusMin * 60);
    } else if (mode === "countdown") {
      setRemainingSeconds(countdownMin * 60);
    } else {
      setStopwatchSeconds(0);
    }
  };

  // Manually end session and record
  const endSessionEarly = async () => {
    setIsRunning(false);
    let duration = 0;
    if (mode === "stopwatch") {
      duration = stopwatchSeconds;
    } else if (mode === "countdown") {
      duration = countdownMin * 60 - remainingSeconds;
    } else {
      duration = pomoFocusMin * 60 - remainingSeconds;
    }

    if (duration >= 10) {
      await saveCompletedSession(duration, mode);
    }
    resetTimer();
    setIsFocusModeOpen(false);
  };

  // Calculations for display
  const currentTotalSeconds =
    mode === "stopwatch"
      ? 3600 // reference 1 hr
      : mode === "countdown"
      ? countdownMin * 60
      : pomodoroPhase === "focus"
      ? pomoFocusMin * 60
      : pomodoroPhase === "short_break"
      ? pomoShortBreakMin * 60
      : pomoLongBreakMin * 60;

  const displaySeconds = mode === "stopwatch" ? stopwatchSeconds : remainingSeconds;

  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Circular progress math (radius = 120)
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progressRatio =
    mode === "stopwatch"
      ? Math.min(1, stopwatchSeconds / 3600)
      : Math.max(0, Math.min(1, 1 - remainingSeconds / Math.max(1, currentTotalSeconds)));
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Focus</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{todayMinutes}m</div>
            <div className="text-xs text-slate-500 mt-0.5">Target: {dailyGoalMinutes}m</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Weekly Study</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{Math.round((weeklyMinutes / 60) * 10) / 10}h</div>
            <div className="text-xs text-slate-500 mt-0.5">Across 7 days</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
            <History className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pomodoro Cycles</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">#{cycleCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">Phase: {pomodoroPhase.replace("_", " ")}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold">
            <Bell className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Timer Display Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/70">
            {(["pomodoro", "countdown", "stopwatch"] as TimerMode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                  mode === m
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title={soundEnabled ? "Sound alerts enabled" : "Muted"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
            <button
              onClick={() => setIsFocusModeOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Focus Mode</span>
            </button>
          </div>
        </div>

        {/* Subject & Topic Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              TNPSC Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                const newSubj = e.target.value;
                setSelectedSubject(newSubj);
                const sObj = syllabus?.subjects.find((s) => s.name === newSubj);
                if (sObj && sObj.topics.length > 0) {
                  setSelectedTopic(sObj.topics[0].name);
                }
              }}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {syllabus ? (
                syllabus.subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="General Tamil (பொதுத்தமிழ்)">General Tamil (பொதுத்தமிழ்)</option>
                  <option value="Indian Polity & Constitution">Indian Polity & Constitution</option>
                  <option value="Aptitude & Mental Ability">Aptitude & Mental Ability</option>
                  <option value="History, Culture & INM">History, Culture & INM</option>
                  <option value="Unit 8 & 9 (TN Heritage & Development)">Unit 8 & 9 (TN Heritage)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Syllabus Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {syllabus?.subjects
                .find((s) => s.name === selectedSubject)
                ?.topics.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                )) || (
                <>
                  <option value="பகுதி-அ: இலக்கணம்">பகுதி-அ: இலக்கணம் (Grammar)</option>
                  <option value="பகுதி-ஆ: இலக்கியம்">பகுதி-ஆ: இலக்கியம் (Literature)</option>
                  <option value="பகுதி-இ: தமிழ் அறிஞர்கள்">பகுதி-இ: தமிழ் அறிஞர்கள்</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Circular Progress Ring & Digital Timer */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-60 h-60 sm:w-72 sm:h-72 -rotate-90 transform" viewBox="0 0 280 280">
              {/* Background Ring */}
              <circle
                cx="140"
                cy="140"
                r={radius}
                className="text-slate-100"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="140"
                cy="140"
                r={radius}
                className={`transition-all duration-1000 ease-linear ${
                  pomodoroPhase === "focus" || mode !== "pomodoro"
                    ? "text-blue-600"
                    : "text-emerald-500"
                }`}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Inner Clock Face */}
            <div className="absolute flex flex-col items-center text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {mode === "pomodoro"
                  ? pomodoroPhase === "focus"
                    ? `Focus • Cycle #${cycleCount}`
                    : `Break (${pomodoroPhase.replace("_", " ")})`
                  : mode.toUpperCase()}
              </span>
              <div className="font-mono text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mt-1 tabular-nums">
                {timeFormatted}
              </div>
              <span className="text-xs font-medium text-slate-500 mt-1 max-w-[140px] truncate">
                {selectedSubject}
              </span>
            </div>
          </div>

          {/* Timer Control Buttons */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={resetTimer}
              className="p-3.5 rounded-2xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTimer}
              className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all ${
                isRunning
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            <button
              onClick={endSessionEarly}
              className="px-4 py-3.5 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-600 text-xs font-bold transition-all"
              title="Complete & Save"
            >
              End & Save
            </button>
          </div>
        </div>
      </div>

      {/* Session History & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Notes for Session */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-2">
            Session Intent & Notes
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            What syllabus objectives are you targeting in this focus block?
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Reviewed 20 Thirukkural couplets and solved 15 compound interest problems..."
            rows={4}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Recent Focus Log */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <span>Recent Focus Sessions</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              {recentSessions.length} sessions logged
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
            {recentSessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No sessions completed yet. Start your first session above!
              </div>
            ) : (
              recentSessions.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate">
                      {s.subject}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {s.topic}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                      {Math.round(s.duration_seconds / 60)} mins
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(s.ended_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Custom Timer Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pomodoro Focus Duration (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={pomoFocusMin}
                  onChange={(e) => setPomoFocusMin(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Short Break (mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={pomoShortBreakMin}
                    onChange={(e) => setPomoShortBreakMin(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Long Break (mins)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={pomoLongBreakMin}
                    onChange={(e) => setPomoLongBreakMin(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Countdown Mode Duration (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={countdownMin}
                  onChange={(e) => setCountdownMin(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">Auto-transition to Break</span>
                <input
                  type="checkbox"
                  checked={autoTransition}
                  onChange={(e) => setAutoTransition(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  resetTimer();
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Focus Mode Overlay */}
      <FocusModeOverlay
        isOpen={isFocusModeOpen}
        onClose={() => setIsFocusModeOpen(false)}
        subject={selectedSubject}
        topic={selectedTopic}
        timeRemainingFormatted={timeFormatted}
        isRunning={isRunning}
        mode={mode}
        pomodoroPhase={pomodoroPhase}
        cycleCount={cycleCount}
        totalSeconds={currentTotalSeconds}
        remainingSeconds={displaySeconds}
        todayMinutes={todayMinutes}
        dailyGoalMinutes={dailyGoalMinutes}
        onToggleTimer={toggleTimer}
        onEndSession={endSessionEarly}
      />
    </div>
  );
};
