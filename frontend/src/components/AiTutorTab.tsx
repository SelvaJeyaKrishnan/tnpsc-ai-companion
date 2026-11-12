"use client";

import React, { useState } from "react";
import {
  Brain,
  Send,
  Sparkles,
  BookOpen,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { askAiTutor } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  text: string;
  sources?: string[];
  suggested_topics?: string[];
  model?: string;
}

const QUICK_PROMPTS = [
  {
    label: "Fundamental Rights",
    subject: "Indian Polity",
    prompt: "What are the Fundamental Rights in the Indian Constitution (Articles 12-35) and landmark cases for TNPSC?",
  },
  {
    label: "திருக்குறள் - கல்வி",
    subject: "General Tamil",
    prompt: "திருக்குறள் கல்வி அதிகாரத்தில் இருந்து டி.என்.பி.எஸ்.சி தேர்வுக்கு முக்கியமான 3 குறள்கள் மற்றும் அதன் பொருள் விளக்குக.",
  },
  {
    label: "Time & Work Shortcuts",
    subject: "Aptitude & Mental Ability",
    prompt: "Explain key formulas and shortcuts for Time and Work problems asked in TNPSC Group 4 and Group 2.",
  },
  {
    label: "73rd Amendment (Panchayat)",
    subject: "Indian Polity",
    prompt: "Explain the salient features of the 73rd Constitutional Amendment Act, 1992 and Article 243 provisions.",
  },
  {
    label: "Self-Respect Movement",
    subject: "Tamil Nadu History & Culture",
    prompt: "Summarize the origins, leaders, and major achievements of the Self-Respect Movement (சுயமரியாதை இயக்கம்) for TNPSC Unit 8.",
  },
];

const SUBJECT_OPTIONS = [
  "General Tamil",
  "General English",
  "Indian Polity",
  "Aptitude & Mental Ability",
  "Tamil Nadu History & Culture",
  "Development Administration in TN",
  "Indian National Movement",
  "History & Culture of India",
  "Indian Economy",
  "Geography of India",
  "General Science",
  "Current Events",
];

export const AiTutorTab: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Vanakkam! I am your TNPSC AI Preparation Tutor. Ask me any conceptual question regarding General Tamil grammar & literature, Indian Polity articles, Aptitude shortcuts, or previous years' exam patterns.",
      sources: ["Tamil Nadu SCERT Samacheer Kalvi Standards 6 to 12", "TNPSC Syllabus Manual"],
      suggested_topics: ["Fundamental Rights", "திருக்குறள்", "Time & Work", "73rd Amendment"],
      model: "TNPSC Grounded Syllabus Engine",
    },
  ]);

  const [input, setInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Indian Polity");
  const [targetExam, setTargetExam] = useState("Group 4");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userText = textToSend.trim();
    setInput("");
    setError(null);

    // Append user message
    const updatedHistory: Message[] = [...messages, { role: "user", text: userText }];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      // Build lightweight conversation history for backend context
      const apiHistory = updatedHistory
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.text }));

      const res = await askAiTutor(userText, selectedSubject, targetExam, apiHistory);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.reply,
          sources: res.sources,
          suggested_topics: res.suggested_topics,
          model: res.model,
        },
      ]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to reach TNPSC AI Tutor. Please verify your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Configuration & Quick Prompts Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">Topic Focus:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {SUBJECT_OPTIONS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Target Exam:</span>
            <select
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Group 4">Group 4</option>
              <option value="Group 2">Group 2 / 2A</option>
              <option value="Group 1">Group 1</option>
            </select>
          </div>
        </div>

        {/* Quick Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Quick questions:
          </span>
          {QUICK_PROMPTS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedSubject(chip.subject);
                sendMessage(chip.prompt);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] font-medium border border-slate-200/80 transition-colors shrink-0"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col h-[34rem]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">TNPSC AI Concept Mentor</h3>
              <p className="text-[11px] text-slate-500">
                Grounded in Samacheer Kalvi textbooks & syllabus standards
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Ready
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white font-medium rounded-tr-xs shadow-xs"
                    : "bg-slate-50 text-slate-800 border border-slate-200/70 rounded-tl-xs shadow-xs"
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {/* Sources list if present */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
                      <BookOpen className="w-3 h-3 text-blue-600" />
                      <span>Verified Sources:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                      {m.sources.map((src, sIdx) => (
                        <li key={sIdx}>{src}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Topics Pills */}
                {m.suggested_topics && m.suggested_topics.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" /> Next:
                    </span>
                    {m.suggested_topics.map((t, tIdx) => (
                      <button
                        key={tIdx}
                        onClick={() => sendMessage(`Tell me more about ${t} for TNPSC preparation.`)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}

                {m.model && (
                  <div className="mt-2 text-[9px] text-slate-400 text-right">
                    Engine: {m.model}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="flex items-start">
              <div className="max-w-md p-4 rounded-2xl bg-slate-50 border border-slate-200 rounded-tl-xs space-y-2 animate-pulse">
                <div className="h-2.5 bg-slate-200 rounded-md w-48" />
                <div className="h-2.5 bg-slate-200 rounded-md w-64" />
                <div className="h-2.5 bg-slate-200 rounded-md w-36" />
                <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1.5 pt-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Thinking and retrieving Samacheer references...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-bold text-rose-800 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleFormSubmit} className="pt-3 border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={`Ask any TNPSC question in ${selectedSubject}...`}
            className="flex-1 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xs transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Syllabus Guidelines Note */}
      <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/60 flex items-start gap-3 text-xs text-blue-900">
        <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Tip for TNPSC Aspirants:</strong> All answers are tuned to the revised scheme
          of TNPSC (General Tamil/General English 100 questions, General Studies 75 questions,
          Aptitude 25 questions). For best results, ask specific questions about Articles,
          Constitutional Amendments, Thirukkural chapters, or Tamil literature lineages.
        </p>
      </div>
    </div>
  );
};
