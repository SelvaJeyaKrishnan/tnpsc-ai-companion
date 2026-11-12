"use client";

import React, { useEffect, useState } from "react";
import { Minimize2, Pause, Play, Square } from "lucide-react";

interface FocusModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  topic: string;
  timeRemainingFormatted: string;
  isRunning: boolean;
  mode: "pomodoro" | "countdown" | "stopwatch";
  pomodoroPhase?: "focus" | "short_break" | "long_break";
  cycleCount?: number;
  totalSeconds: number;
  remainingSeconds: number;
  todayMinutes: number;
  dailyGoalMinutes: number;
  onToggleTimer: () => void;
  onEndSession: () => void;
}

const MOTIVATIONAL_QUOTES = [
  { tamil: "வெற்றி நிச்சயம், இது வேத வாக்கு!", english: "Victory is certain through relentless preparation." },
  { tamil: "முயற்சி திருவினையாக்கும்.", english: "Persistent effort yields boundless success." },
  { tamil: "எண்ணிய எண்ணியாங்கு எய்துப எண்ணியார் திண்ணியர் ஆகப் பெறின்.", english: "Think with unwavering clarity, and your purpose will be attained." },
  { tamil: "ஒவ்வொரு மணிநேர உழைப்பும் உங்களை அரசுப் பணிக்கு அருகில் கொண்டு செல்லும்.", english: "Every focused hour brings you closer to your civil service dream." },
  { tamil: "கடின உழைப்பு ஒருபோதும் வீண்போகாது.", english: "Deep focus and dedication never go in vain." },
];

export const FocusModeOverlay: React.FC<FocusModeOverlayProps> = ({
  isOpen,
  onClose,
  subject,
  topic,
  timeRemainingFormatted,
  isRunning,
  mode,
  pomodoroPhase = "focus",
  cycleCount = 1,
  totalSeconds,
  remainingSeconds,
  todayMinutes,
  dailyGoalMinutes,
  onToggleTimer,
  onEndSession,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 15000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        onToggleTimer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, onToggleTimer]);

  if (!isOpen) return null;

  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex];
  const progressPercent = totalSeconds > 0
    ? Math.min(100, Math.max(0, ((totalSeconds - remainingSeconds) / totalSeconds) * 100))
    : 100;

  const goalPercent = Math.min(100, Math.round((todayMinutes / Math.max(1, dailyGoalMinutes)) * 100));

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950 text-slate-100 p-6 md:p-12 select-none animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isRunning ? "bg-emerald-400" : "bg-amber-400"} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isRunning ? "bg-emerald-500" : "bg-amber-500"}`} />
          </span>
          <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">
            {mode === "pomodoro"
              ? pomodoroPhase === "focus"
                ? `Pomodoro Focus • Cycle #${cycleCount}`
                : `Break Period (${pomodoroPhase.replace("_", " ")})`
              : `${mode.toUpperCase()} FOCUS`}
          </span>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-800 transition-all"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Exit Fullscreen</span>
        </button>
      </div>

      {/* Center Digital Timer */}
      <div className="flex flex-col items-center justify-center text-center my-auto">
        {/* Subject & Topic Badges */}
        <div className="mb-4 space-y-1">
          <div className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
            {subject}
          </div>
          <div className="text-sm font-medium text-slate-300 max-w-lg truncate">
            {topic}
          </div>
        </div>

        {/* Huge Digital Clock Display */}
        <div className="font-mono text-6xl sm:text-8xl md:text-9xl lg:text-[13rem] font-bold tracking-tighter text-white tabular-nums drop-shadow-2xl">
          {timeRemainingFormatted}
        </div>

        {/* Progress Bar */}
        {mode !== "stopwatch" && (
          <div className="w-full max-w-md h-1.5 bg-slate-900 rounded-full overflow-hidden mt-6">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Motivational Proverb */}
        <div className="mt-8 max-w-md text-center min-h-[4rem] transition-opacity duration-500">
          <p className="text-sm sm:text-base font-semibold text-amber-300">
            &ldquo;{currentQuote.tamil}&rdquo;
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {currentQuote.english}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={onToggleTimer}
            className={`flex items-center justify-center w-16 h-16 rounded-2xl ${
              isRunning
                ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30"
                : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30"
            } transition-all`}
            title={isRunning ? "Pause Session" : "Resume Session"}
          >
            {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1 fill-current" />}
          </button>

          <button
            onClick={onEndSession}
            className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
            title="Complete & Save Session"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-slate-900 pt-4 gap-2">
        <div>TNPSC AI Companion Distraction-Free Workspace</div>
        <div className="flex items-center gap-2">
          <span>Today&apos;s Progress:</span>
          <span className="font-semibold text-slate-300">{todayMinutes}m / {dailyGoalMinutes}m ({goalPercent}%)</span>
        </div>
      </div>
    </div>
  );
};
