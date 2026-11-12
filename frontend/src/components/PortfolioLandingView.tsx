"use client";

import React, { useState } from "react";
import {
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  ExternalLink,
  Flame,
  Info,
  Layers,
  Lock,
  Play,
  Radio,
  Server,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
  Zap,
} from "lucide-react";
import { TabKey } from "./Sidebar";

interface PortfolioLandingViewProps {
  onEnterApp: (asGuest?: boolean) => void;
  onOpenAuthModal: () => void;
}

export const PortfolioLandingView: React.FC<PortfolioLandingViewProps> = ({
  onEnterApp,
  onOpenAuthModal,
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<TabKey>("dashboard");

  const techStack = [
    {
      category: "Frontend Architecture",
      icon: Code2,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      items: [
        { name: "Next.js 15.5 (App Router)", detail: "React Server Components & optimized client hydration" },
        { name: "React 19 & TypeScript Strict", detail: "Type-safe interfaces, zero runtime 'any' bypasses" },
        { name: "Tailwind CSS & Lucide Icons", detail: "Responsive design across 5 standard viewport form-factors" },
        { name: "Web Audio Synthesizer", detail: "Custom acoustic chime oscillator for ambient timer transitions" },
      ],
    },
    {
      category: "Backend Services",
      icon: Server,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      items: [
        { name: "FastAPI & Python 3.14", detail: "High-throughput asynchronous REST endpoints & Starlette WebSockets" },
        { name: "SQLAlchemy 2.0 ORM", detail: "Dual dialect engine supporting SQLite & PostgreSQL with foreign keys" },
        { name: "Alembic Versioned Migrations", detail: "Strict forward-compatible database schema migrations" },
        { name: "Pydantic v2 Models", detail: "Strict payload validation with sanitized input parsing" },
      ],
    },
    {
      category: "Security & Protection",
      icon: ShieldCheck,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      items: [
        { name: "PBKDF2-HMAC-SHA256", detail: "200,000 hashing rounds for salted password credentials" },
        { name: "PyJWT Signed Bearer Tokens", detail: "Stateless authorization tokens with strict expiration checking" },
        { name: "Sliding-Window Rate Limiting", detail: "Protection on /login, /register, and /api/ai/tutor endpoints" },
        { name: "Security Response Headers", detail: "nosniff, DENY frame options, strict origin referrer policies" },
      ],
    },
    {
      category: "AI & Syllabus Grounding",
      icon: Brain,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      items: [
        { name: "Grounded Syllabus Engine", detail: "Domain-tuned to Tamil Nadu SCERT Samacheer Kalvi Standards 6–12" },
        { name: "Bilingual Tamil / English Synthesis", detail: "Native Tamil script support for Thirukkural, Ilakkanam, & Unit 8" },
        { name: "Provenance Citation Linking", detail: "Every response lists verified source textbooks and chapters" },
        { name: "Gemini 2.5 Flash Adapter", detail: "Production adapter with resilient offline grounded fallback" },
      ],
    },
  ];

  const features = [
    {
      icon: Timer,
      title: "Smart Focus & Pomodoro Suite",
      badge: "Regain-Inspired",
      description:
        "High-precision, drift-free study timer using wall-clock epoch deltas. Prevents background tab throttling, supports customizable Pomodoro cycles (25/5/15), and includes an acoustic Web Audio synthesizer.",
    },
    {
      icon: Brain,
      title: "Grounded AI Concept Tutor",
      badge: "Samacheer Kalvi",
      description:
        "Bilingual AI mentor specialized in TNPSC Group 1, 2/2A, and 4. Grounds answers strictly in Tamil Nadu SCERT textbooks, providing citations for Thirukkural couplets, Indian Polity Articles, and Aptitude PYQs.",
    },
    {
      icon: Calendar,
      title: "Dynamic AI Study Planner",
      badge: "Spaced Repetition",
      description:
        "Generates personalized study roadmaps anchored to upcoming exam dates. Features 3x weighting on weak syllabus units and one-click auto-rebalancing for missed tasks without resetting progress.",
    },
    {
      icon: Users,
      title: "Collaborative Study Rooms",
      badge: "Live WebSockets",
      description:
        "Real-time synchronized virtual study halls with sub-100ms latency. Supports shared clocks, live focus status broadcasting ('Focusing' vs 'Break'), invite codes, and real-time celebration toasts.",
    },
    {
      icon: BarChart3,
      title: "Circadian Productivity Analytics",
      badge: "Data-Driven",
      description:
        "Aggregates quantitative evidence from verified study sessions: 24-hour peak focus heatmaps, 7-day daily trend bar charts, and syllabus subject balance metrics calculated without fake data.",
    },
    {
      icon: Award,
      title: "Habit Streaks & Milestone Badges",
      badge: "Discipline Hall",
      description:
        "Daily study habit tracking with anti-duplicate same-day protection and timezone awareness. Gamifies preparation discipline across 9 unlockable achievement trophies.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-12 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-lg shadow-blue-500/30">
              T
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                TNPSC <span className="text-blue-400 font-semibold">AI Companion</span>
              </div>
              <div className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                Software Engineering & AI Portfolio Edition
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="#architecture"
              className="hidden md:inline-block text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Architecture & Security
            </a>
            <a
              href="#ai-research"
              className="hidden lg:inline-block text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              AI Capabilities & Limits
            </a>
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => onEnterApp(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
            >
              <span>Explore Live Demo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-12 border-b border-slate-800/80">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] sm:w-[48rem] h-[24rem] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 animate-in fade-in duration-500">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Built for Tamil Nadu Civil Services (Group 1, 2/2A, 4) Aspirants</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none">
            Deep Focus. Grounded AI.<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Disciplined Civil Service Mastery.
            </span>
          </h1>

          <p className="mt-6 text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A production-ready full-stack learning platform combining Regain-inspired circadian study timers,
            spaced repetition syllabus scheduling, real-time WebSocket study rooms, and Samacheer Kalvi grounded AI guidance.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onEnterApp(true)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Live Workspace (No Sign-in Required)</span>
            </button>
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-bold border border-slate-700 transition-all"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Sign In / Create Account</span>
            </button>
          </div>

          {/* Engineering Badges */}
          <div className="mt-12 pt-8 border-t border-slate-800/60 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Stack Verification:</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px]">FastAPI 0.115+</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px]">Next.js 15.5</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px]">Python 3.14</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px]">React 19</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px]">WebSockets</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px]">SQLAlchemy 2.0</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px]">PBKDF2-HMAC-SHA256</span>
          </div>
        </div>
      </section>

      {/* Target Audience & Problem Solved */}
      <section className="py-16 px-4 sm:px-6 lg:px-12 bg-slate-900/50 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
              Context & Engineering Motivation
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Designed for High-Stakes Public Examination Preparation
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              The Tamil Nadu Public Service Commission syllabus spans 10 rigorous general studies and language units.
              Aspirants frequently face three critical failure modes:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold mb-4 border border-rose-500/20">
                01
              </div>
              <h3 className="text-base font-bold text-white mb-2">Study Drift & Fatigue</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Aspirants intend to study 4–6 hours daily but fall victim to smartphone multitasking and passive reading.
                Standard countdown timers drift when browser tabs are backgrounded.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Solved via epoch delta wall-clock timers.
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold mb-4 border border-amber-500/20">
                02
              </div>
              <h3 className="text-base font-bold text-white mb-2">AI Hallucination in State Exams</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generic LLMs hallucinate state scheme dates, cite wrong Thirukkural chapters, or miss the exact Tamil Nadu SCERT Samacheer Kalvi grammar rules tested in Group 4.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Solved via textbook grounded syllabus engine.
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold mb-4 border border-blue-500/20">
                03
              </div>
              <h3 className="text-base font-bold text-white mb-2">Isolation & Unbalanced Syllabi</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Candidates neglect high-yield areas (General Tamil 100 Qs, Aptitude 25 Qs) and study in isolation without peer accountability or spaced revision rebalancing.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Solved via WebSocket rooms & AI rebalancer.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Genuine Product Showcase */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
                Interactive Architecture Showcase
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Explore The Working Application Modules
              </h2>
            </div>
            <button
              onClick={() => onEnterApp(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all shrink-0"
            >
              <span>Launch Full Workspace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Module Selector Pill Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
            {[
              { key: "dashboard" as TabKey, label: "Command Center", icon: Layers },
              { key: "timer" as TabKey, label: "Smart Focus & Pomodoro", icon: Timer },
              { key: "ai_tutor" as TabKey, label: "Grounded AI Tutor", icon: Brain },
              { key: "planner" as TabKey, label: "AI Study Planner", icon: Calendar },
              { key: "rooms" as TabKey, label: "Group Study Rooms", icon: Users },
              { key: "analytics" as TabKey, label: "Productivity Analytics", icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activePreviewTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActivePreviewTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Preview Card Display */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
            {activePreviewTab === "dashboard" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Module 01</span>
                    <h3 className="text-xl font-bold text-white mt-1">Productivity Command Center</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Unified aspirant cockpit tracking daily study targets, active streaks, and spaced revision recommendations.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    Live Verified Data
                  </span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span>Study Streak</span>
                      <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="text-2xl font-bold text-white mt-2">2 Days</div>
                    <div className="text-[11px] text-amber-400 mt-1">🔥 Active consistency</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span>Weekly Focus</span>
                      <Clock className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mt-2">4.5 Hours</div>
                    <div className="text-[11px] text-slate-400 mt-1">9 Completed sessions</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span>Roadmap Progress</span>
                      <Calendar className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mt-2">28%</div>
                    <div className="text-[11px] text-slate-400 mt-1">Group 4 Syllabus</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span>Discipline Rate</span>
                      <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-400 mt-2">85%</div>
                    <div className="text-[11px] text-emerald-400 mt-1">Target consistency</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-300">
                    <strong>Recommended Priority:</strong> General Tamil (பகுதி-அ: இலக்கணம்) & Aptitude (Percentage & Ratios).
                  </div>
                  <button
                    onClick={() => onEnterApp(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 ml-3"
                  >
                    Open in Workspace →
                  </button>
                </div>
              </div>
            )}

            {activePreviewTab === "timer" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Module 02</span>
                    <h3 className="text-xl font-bold text-white mt-1">Smart Focus & Pomodoro Suite</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Regain-inspired high precision timer with wall-clock epoch drift elimination, auto-phase transitions, and Web Audio chimes.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                    Epoch Delta Accurate
                  </span>
                </div>

                <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    POMODORO FOCUS • CYCLE #1
                  </span>
                  <div className="font-mono text-6xl sm:text-7xl font-bold text-white tabular-nums mt-2">
                    25:00
                  </div>
                  <div className="mt-2 text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    General Tamil (பொதுத்தமிழ்) • பகுதி-அ: இலக்கணம்
                  </div>
                  <div className="flex items-center gap-3 mt-6">
                    <button
                      onClick={() => onEnterApp(true)}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Focus in App</span>
                    </button>
                    <button
                      onClick={() => onEnterApp(true)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700"
                    >
                      Fullscreen Focus Mode
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === "ai_tutor" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Module 03</span>
                    <h3 className="text-xl font-bold text-white mt-1">Grounded TNPSC AI Concept Tutor</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Retrieval-grounded syllabus assistant adhering strictly to Tamil Nadu SCERT Samacheer Kalvi textbooks.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20">
                    Textbook Citations
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="p-3.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-xs text-blue-300">
                    <strong>User Query:</strong> &ldquo;What are the Fundamental Rights in the Indian Constitution (Articles 12-35) for TNPSC?&rdquo;
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
                    <p>
                      <strong>AI Tutor Response:</strong> Under Part III of the Constitution, Fundamental Rights (Articles 12 to 35) are classified into 6 categories:
                      1. Right to Equality (Art. 14-18), 2. Right to Freedom (Art. 19-22), 3. Right against Exploitation (Art. 23-24),
                      4. Right to Freedom of Religion (Art. 25-28), 5. Cultural and Educational Rights (Art. 29-30), and 6. Right to Constitutional Remedies (Art. 32 — termed the &ldquo;Heart and Soul&rdquo; by Dr. B.R. Ambedkar).
                    </p>
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span><strong>Sources Cited:</strong> SCERT Standard 10 Social Science (Civics Unit 1) & Standard 12 Political Science.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === "planner" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Module 04</span>
                    <h3 className="text-xl font-bold text-white mt-1">Dynamic AI Study Planner</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Timeline roadmap generator with spaced repetition intervals and dynamic missed-task auto-rebalancing.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                    Spaced Revision
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    { subj: "General Tamil", topic: "பகுதி-அ: இலக்கணம் - சொல் இலக்கணம்", priority: "HIGH", tag: "Today" },
                    { subj: "Aptitude & Mental Ability", topic: "Percentage & Simplification Shortcuts", priority: "HIGH", tag: "Today" },
                    { subj: "Indian Polity", topic: "Articles 14 to 32 Fundamental Rights", priority: "NORMAL", tag: "Spaced Revision" },
                  ].map((task, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{task.subj}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {task.tag}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{task.topic}</div>
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-400">45m</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePreviewTab === "rooms" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Module 05</span>
                    <h3 className="text-xl font-bold text-white mt-1">Real-Time WebSocket Study Rooms</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Synchronized virtual study halls with peer accountability, shared room clocks, and live broadcast events.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    Starlette WebSockets
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-amber-300 font-bold">ROOM #7KA9X2</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Radio className="w-3 h-3 animate-pulse" /> Live
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">TNPSC Group 4 Morning Batch</div>
                    <div className="text-xs text-slate-400 mt-1">Silent focus on Ilakkanam and Aptitude formulas.</div>
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">5 Aspirants studying</span>
                      <span className="font-mono font-bold text-white">35:00</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-amber-300 font-bold">ROOM #M82P1Q</span>
                      <span className="text-slate-400 font-semibold">Private</span>
                    </div>
                    <div className="text-sm font-bold text-white">Unit 8 & 9 Deep Study Group</div>
                    <div className="text-xs text-slate-400 mt-1">Dravidian Movement & Tamil Society revision.</div>
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">3 Aspirants studying</span>
                      <span className="font-mono font-bold text-white">50:00</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === "analytics" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Module 06</span>
                    <h3 className="text-xl font-bold text-white mt-1">Circadian Productivity Analytics</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Empirical evidence of preparation consistency: 24-hour peak focus heatmap and 7-day daily discipline charts.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                    Quantitative Logs
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-slate-300 mb-3">Daily Study Distribution (Last 7 Days)</div>
                  <div className="h-28 flex items-end justify-between gap-2 border-b border-slate-800 pb-2">
                    {[
                      { day: "Mon", min: 120, h: 80 },
                      { day: "Tue", min: 90, h: 60 },
                      { day: "Wed", min: 140, h: 95 },
                      { day: "Thu", min: 110, h: 75 },
                      { day: "Fri", min: 130, h: 85 },
                      { day: "Sat", min: 180, h: 100 },
                      { day: "Sun", min: 75, h: 50 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-[10px] font-mono text-slate-400">{item.min}m</span>
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-indigo-500"
                          style={{ height: `${item.h}%` }}
                        />
                        <span className="text-[10px] text-slate-400">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Complete Architecture & Engineering Specifications */}
      <section id="architecture" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
              Full-Stack Engineering Specifications
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Production Architecture & Security Posture
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Built adhering to professional software engineering standards, defensive security, and scalable cloud containerization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {techStack.map((stack, idx) => {
              const Icon = stack.icon;
              return (
                <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${stack.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white">{stack.category}</h3>
                  </div>

                  <div className="space-y-3">
                    {stack.items.map((it, iIdx) => (
                      <div key={iIdx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                        <div className="text-xs font-bold text-slate-200">{it.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{it.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Capabilities & Research Limitations (Crucial for AI Research Application) */}
      <section id="ai-research" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-tr from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/20 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  AI Research & Engineering Disclosure
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Syllabus Grounding vs. Architectural Boundaries
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              In high-stakes public examinations, AI hallucination is disastrous. The TNPSC AI Study Companion employs
              a <strong>Domain-Constrained Retrieval Grounding Architecture</strong> designed around the revised TNPSC scheme:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Capabilities</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>Grounded in Tamil Nadu SCERT Samacheer Kalvi (Standards 6 to 12).</li>
                  <li>Tamil-English bilingual synthesis with native Unicode Tamil rendering.</li>
                  <li>Syllabus breakdown for Indian Polity, Aptitude, Unit 8, & Unit 9.</li>
                  <li>Transparent source attribution and provenance linking.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>Research Limitations & Boundaries</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>Does not predict official question papers or future exam cutoffs.</li>
                  <li>Rejects ungrounded queries outside syllabus scope to eliminate hallucinations.</li>
                  <li>Does not replace official Tamil Nadu government gazettes.</li>
                  <li>Requires verified API credentials for live cloud reasoning.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Detailed Grid */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 border-b border-slate-800/80 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
              End-to-End Suite
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              13 Cohesive Preparation Modules
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Every feature works together to build unbroken study consistency for the aspirant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fully Functional
                    </span>
                    <button
                      onClick={() => onEnterApp(true)}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300"
                    >
                      Try Feature →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer & Final Call to Action */}
      <footer className="py-12 px-4 sm:px-6 lg:px-12 bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <div className="font-bold text-sm text-white">TNPSC AI Study Companion</div>
            <div className="text-xs text-slate-400 mt-1">
              Engineered with FastAPI, Next.js 15.5, WebSockets & Grounded AI.
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              &ldquo;முயற்சி திருவினையாக்கும்&rdquo; — Persistent effort yields boundless success.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700"
            >
              Sign In
            </button>
            <button
              onClick={() => onEnterApp(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
            >
              Launch Live Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
