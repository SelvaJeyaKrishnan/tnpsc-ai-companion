"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Award,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  GraduationCap,
  History,
  Info,
  Play,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import {
  getAttemptState,
  getTestHistory,
  getTestPaperDetail,
  getTestPapers,
  getTestResult,
  saveTestAnswer,
  startTestAttempt,
  submitTestAttempt,
} from "@/lib/api";
import {
  TestAttemptHistoryItem,
  TestAttemptStartResponse,
  TestPaperDetail,
  TestPaperSummary,
  TestResultResponse,
} from "@/types";
import { Badge, Button } from "@/components/ui";

const ACTIVE_ATTEMPT_STORAGE_KEY = "tnpsc_active_exam_attempt_id";

interface MockTestsTabProps {
  isGuestDemo?: boolean;
  onOpenAuthModal?: () => void;
}

export const MockTestsTab: React.FC<MockTestsTabProps> = ({
  isGuestDemo = false,
  onOpenAuthModal,
}) => {
  // Navigation & View Mode: "list" | "instructions" | "exam" | "result" | "history"
  const [viewState, setViewState] = useState<"list" | "instructions" | "exam" | "result" | "history">("list");

  // Filters
  const [selectedExamCategory, setSelectedExamCategory] = useState<string>("All");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  // Server Data
  const [papers, setPapers] = useState<TestPaperSummary[]>([]);
  const [historyItems, setHistoryItems] = useState<TestAttemptHistoryItem[]>([]);
  const [loadingPapers, setLoadingPapers] = useState<boolean>(true);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected Paper for Instruction Modal
  const [selectedPaper, setSelectedPaper] = useState<TestPaperDetail | null>(null);
  const [loadingInstructions, setLoadingInstructions] = useState<boolean>(false);

  // In-Flight Exam State
  const [activeAttempt, setActiveAttempt] = useState<TestAttemptStartResponse | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answersMap, setAnswersMap] = useState<Record<number, { selectedIndex: number | null; isReview: boolean }>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);
  const [isPaletteOpenOnMobile, setIsPaletteOpenOnMobile] = useState<boolean>(false);

  // Evaluated Result State
  const [testResult, setTestResult] = useState<TestResultResponse | null>(null);
  const [loadingResult, setLoadingResult] = useState<boolean>(false);

  // Available filter options
  const examFilterCategories = ["All", "Group 4", "Group 2", "Group 1"];
  const subjectFilterOptions = [
    "All",
    "General Tamil",
    "Aptitude & Mental Ability",
    "Indian Polity",
    "Tamil Nadu Heritage & Schemes",
  ];

  // =========================================================================
  // 1. IN-PROGRESS ATTEMPT RECOVERY ACROSS REFRESH
  // =========================================================================
  useEffect(() => {
    let isMounted = true;

    const recoverActiveAttempt = async () => {
      if (typeof window === "undefined") return;
      const storedAttemptId = sessionStorage.getItem(ACTIVE_ATTEMPT_STORAGE_KEY);
      if (!storedAttemptId) return;

      const attemptId = parseInt(storedAttemptId, 10);
      if (isNaN(attemptId)) {
        sessionStorage.removeItem(ACTIVE_ATTEMPT_STORAGE_KEY);
        return;
      }

      try {
        const attempt = await getAttemptState(attemptId);
        if (!isMounted) return;

        if (attempt.status === "in_progress") {
          const deadlineEpoch = new Date(attempt.deadline_at).getTime();
          const nowEpoch = Date.now();
          const remainingSecs = Math.max(0, Math.floor((deadlineEpoch - nowEpoch) / 1000));

          if (remainingSecs > 0) {
            // Restore answer map from server saved state
            const restoredMap: Record<number, { selectedIndex: number | null; isReview: boolean }> = {};
            attempt.saved_answers.forEach((ans) => {
              restoredMap[ans.question_id] = {
                selectedIndex: ans.selected_option_index,
                isReview: ans.is_marked_for_review,
              };
            });

            setActiveAttempt(attempt);
            setAnswersMap(restoredMap);
            setSecondsRemaining(remainingSecs);
            setCurrentQuestionIndex(0);
            setViewState("exam");
          } else {
            // Attempt expired while away; submit to finalize
            sessionStorage.removeItem(ACTIVE_ATTEMPT_STORAGE_KEY);
            const result = await submitTestAttempt(attemptId);
            if (isMounted) {
              setTestResult(result);
              setViewState("result");
            }
          }
        } else if (attempt.status === "completed") {
          // Already submitted; show official scorecard
          sessionStorage.removeItem(ACTIVE_ATTEMPT_STORAGE_KEY);
          const result = await getTestResult(attemptId);
          if (isMounted) {
            setTestResult(result);
            setViewState("result");
          }
        }
      } catch (err) {
        console.warn("Attempt recovery failed, clearing stored session:", err);
        sessionStorage.removeItem(ACTIVE_ATTEMPT_STORAGE_KEY);
      }
    };

    recoverActiveAttempt();

    return () => {
      isMounted = false;
    };
  }, []);

  // =========================================================================
  // 2. FETCH PUBLISHED TESTS FROM BACKEND
  // =========================================================================
  const loadPapers = useCallback(async () => {
    setLoadingPapers(true);
    setErrorMsg(null);
    try {
      const data = await getTestPapers(
        selectedExamCategory === "All" ? undefined : selectedExamCategory,
        selectedSubject === "All" ? undefined : selectedSubject
      );
      setPapers(data || []);
    } catch (err: unknown) {
      console.error("Failed to load test papers:", err);
      const message = (err as Error)?.message || "Failed to load examination papers from server.";
      setErrorMsg(message);
      setPapers([]);
    } finally {
      setLoadingPapers(false);
    }
  }, [selectedExamCategory, selectedSubject]);

  useEffect(() => {
    loadPapers();
  }, [loadPapers]);

  // =========================================================================
  // 3. LOAD USER ATTEMPT HISTORY FROM BACKEND
  // =========================================================================
  const loadHistory = async () => {
    setLoadingHistory(true);
    setErrorMsg(null);
    try {
      const hist = await getTestHistory();
      setHistoryItems(hist || []);
    } catch (err: unknown) {
      console.warn("Could not load user test history:", err);
      setErrorMsg((err as Error)?.message || "Could not retrieve examination history.");
      setHistoryItems([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // =========================================================================
  // 4. OPEN INSTRUCTIONS MODAL (FETCH OFFICIAL DETAILS FROM BACKEND)
  // =========================================================================
  const handleOpenInstructions = async (paperSummary: TestPaperSummary) => {
    setLoadingInstructions(true);
    setErrorMsg(null);
    try {
      const detail = await getTestPaperDetail(paperSummary.slug);
      setSelectedPaper(detail);
      setViewState("instructions");
    } catch (err: unknown) {
      console.error("Failed to fetch paper instructions:", err);
      setErrorMsg((err as Error)?.message || "Failed to load examination instructions.");
    } finally {
      setLoadingInstructions(false);
    }
  };

  // =========================================================================
  // 5. START EXAMINATION ATTEMPT VIA BACKEND
  // =========================================================================
  const handleStartExam = async () => {
    if (!selectedPaper) return;
    setErrorMsg(null);

    // If candidate is not authenticated, prompt sign-in
    if (isGuestDemo) {
      if (onOpenAuthModal) {
        onOpenAuthModal();
      } else {
        setErrorMsg("Please sign in or register to begin an examination and record your score.");
      }
      return;
    }

    try {
      const attempt = await startTestAttempt(selectedPaper.slug);
      setActiveAttempt(attempt);

      // Save active attempt ID for refresh persistence
      if (typeof window !== "undefined") {
        sessionStorage.setItem(ACTIVE_ATTEMPT_STORAGE_KEY, String(attempt.attempt_id));
      }

      // Restore previously saved answers if resuming an existing active attempt
      const restored: Record<number, { selectedIndex: number | null; isReview: boolean }> = {};
      if (attempt.saved_answers && Array.isArray(attempt.saved_answers)) {
        attempt.saved_answers.forEach((ans) => {
          restored[ans.question_id] = {
            selectedIndex: ans.selected_option_index,
            isReview: ans.is_marked_for_review,
          };
        });
      }
      setAnswersMap(restored);

      // Compute remaining time from server deadline
      const deadlineEpoch = new Date(attempt.deadline_at).getTime();
      const nowEpoch = Date.now();
      const remaining = Math.max(0, Math.floor((deadlineEpoch - nowEpoch) / 1000));
      setSecondsRemaining(remaining);

      setCurrentQuestionIndex(0);
      setViewState("exam");
    } catch (err: unknown) {
      const msg = (err as Error)?.message || "Failed to start examination.";
      if (msg.includes("401") || msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("not authenticated")) {
        if (onOpenAuthModal) onOpenAuthModal();
      }
      setErrorMsg(msg);
    }
  };

  // =========================================================================
  // 6. LIVE COUNTDOWN TIMER
  // =========================================================================
  const handleAutoSubmitRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (viewState !== "exam" || !activeAttempt) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [viewState, activeAttempt]);

  // =========================================================================
  // 7. HANDLE OPTION SELECTION WITH BACKEND AUTOSAVE
  // =========================================================================
  const handleSelectOption = async (optionIdx: number) => {
    if (!activeAttempt) return;
    const currentQ = activeAttempt.questions[currentQuestionIndex];
    if (!currentQ) return;

    const existing = answersMap[currentQ.id] || { selectedIndex: null, isReview: false };
    const newAnswers = {
      ...answersMap,
      [currentQ.id]: { ...existing, selectedIndex: optionIdx },
    };
    setAnswersMap(newAnswers);

    setSaveStatus("saving");
    try {
      await saveTestAnswer(activeAttempt.attempt_id, currentQ.id, optionIdx, existing.isReview);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1200);
    } catch (err) {
      console.error("Autosave answer failed:", err);
      setSaveStatus("error");
    }
  };

  // =========================================================================
  // 8. CLEAR RESPONSE FOR CURRENT QUESTION
  // =========================================================================
  const handleClearResponse = async () => {
    if (!activeAttempt) return;
    const currentQ = activeAttempt.questions[currentQuestionIndex];
    if (!currentQ) return;

    const existing = answersMap[currentQ.id] || { selectedIndex: null, isReview: false };
    const newAnswers = {
      ...answersMap,
      [currentQ.id]: { ...existing, selectedIndex: null },
    };
    setAnswersMap(newAnswers);

    setSaveStatus("saving");
    try {
      await saveTestAnswer(activeAttempt.attempt_id, currentQ.id, null, existing.isReview);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1200);
    } catch (err) {
      console.error("Clear response failed on server:", err);
      setSaveStatus("error");
    }
  };

  // =========================================================================
  // 9. TOGGLE MARK FOR REVIEW
  // =========================================================================
  const handleToggleReview = async () => {
    if (!activeAttempt) return;
    const currentQ = activeAttempt.questions[currentQuestionIndex];
    if (!currentQ) return;

    const existing = answersMap[currentQ.id] || { selectedIndex: null, isReview: false };
    const newReview = !existing.isReview;
    const newAnswers = {
      ...answersMap,
      [currentQ.id]: { ...existing, isReview: newReview },
    };
    setAnswersMap(newAnswers);

    try {
      await saveTestAnswer(activeAttempt.attempt_id, currentQ.id, existing.selectedIndex, newReview);
    } catch (err) {
      console.error("Autosave review flag failed on server:", err);
    }
  };

  // =========================================================================
  // 10. SUBMIT EXAMINATION (OFFICIAL BACKEND EVALUATION)
  // =========================================================================
  const executeSubmission = async () => {
    if (!activeAttempt || isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmSubmit(false);
    setErrorMsg(null);

    try {
      const result = await submitTestAttempt(activeAttempt.attempt_id);
      setTestResult(result);

      // Clean active session storage on successful completion
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(ACTIVE_ATTEMPT_STORAGE_KEY);
      }

      loadPapers(); // Refresh attempt counts and best scores
      setViewState("result");
    } catch (err: unknown) {
      const msg = (err as Error)?.message || "Submission failed. Please check connection and try again.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  handleAutoSubmitRef.current = executeSubmission;

  // =========================================================================
  // 11. VIEW PAST RESULT SCORECARD FROM HISTORY
  // =========================================================================
  const handleViewPastResult = async (attemptId: number) => {
    setLoadingResult(true);
    setErrorMsg(null);
    try {
      const result = await getTestResult(attemptId);
      setTestResult(result);
      setViewState("result");
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || "Failed to load examination result.");
    } finally {
      setLoadingResult(false);
    }
  };

  // Format MM:SS for countdown
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Exam stats calculations
  const totalQuestions = activeAttempt?.questions.length || 0;
  const answeredCount = Object.values(answersMap).filter((a) => a.selectedIndex !== null && a.selectedIndex !== undefined).length;
  const reviewCount = Object.values(answersMap).filter((a) => a.isReview).length;
  const unvisitedCount = Math.max(0, totalQuestions - answeredCount);

  // =========================================================================
  // RENDER VIEW: 1. INSTRUCTION MODAL
  // =========================================================================
  if (viewState === "instructions" && selectedPaper) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
            <div>
              <Badge variant="primary" size="md" className="mb-2">
                <GraduationCap className="w-3.5 h-3.5 mr-1" />
                <span>{selectedPaper.exam_category} • {selectedPaper.subject}</span>
              </Badge>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {selectedPaper.title}
              </h2>
            </div>
            <button
              onClick={() => setViewState("list")}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">Duration</span>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{selectedPaper.duration_minutes} Mins</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">Total Questions</span>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{selectedPaper.total_questions} MCQs</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">Marking Rule</span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">+{selectedPaper.marks_per_question} Marks</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">Negative Penalty</span>
              <p className="text-base font-bold text-slate-700 dark:text-slate-300 mt-0.5">{selectedPaper.negative_mark_penalty} (Zero)</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Official Examination Instructions</span>
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedPaper.instructions && selectedPaper.instructions.length > 0 ? (
                selectedPaper.instructions.map((inst, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{i + 1}.</span>
                    <span>{inst}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500">Standard TNPSC timing and evaluation rules apply.</div>
              )}
              <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700">
                <span className="font-bold text-slate-400">•</span>
                <span>Unattempted questions award zero marks and incur zero penalty. Answers autosave directly to the server.</span>
              </div>
            </div>
          </div>

          {isGuestDemo && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>You are exploring in <strong>Guest Demo Mode</strong>. Sign in to initiate official exam attempts and record your score.</span>
              </div>
              {onOpenAuthModal && (
                <button
                  onClick={onOpenAuthModal}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors shrink-0 cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="font-bold underline cursor-pointer">Dismiss</button>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="md"
              onClick={() => setViewState("list")}
            >
              ← Back to Test Selection
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleStartExam}
            >
              <Play className="w-4 h-4 fill-current mr-1.5" />
              <span>I Understand, Begin Examination</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER VIEW: 2. ACTIVE EXAMINATION INTERFACE
  // =========================================================================
  if (viewState === "exam" && activeAttempt) {
    const currentQ = activeAttempt.questions[currentQuestionIndex];
    const currentAnswer = currentQ ? answersMap[currentQ.id] : undefined;

    return (
      <div className="max-w-6xl mx-auto space-y-4 pb-12">
        {/* Sticky Exam Top Bar */}
        <div className="p-4 md:px-6 md:py-4 rounded-3xl bg-slate-900 text-white shadow-xl flex items-center justify-between gap-4 border border-slate-800">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block truncate">
              {activeAttempt.paper_slug}
            </span>
            <h3 className="text-sm md:text-base font-bold truncate">
              {activeAttempt.paper_title}
            </h3>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Live Autosave Indicator */}
            <span className="hidden sm:inline-flex text-[11px] font-medium text-slate-400">
              {saveStatus === "saving" && "💾 Autosaving..."}
              {saveStatus === "saved" && "✓ Saved"}
              {saveStatus === "error" && "⚠️ Sync warning"}
            </span>

            {/* Countdown Badge */}
            <div
              role="timer"
              aria-live="off"
              aria-label={`Exam time remaining: ${Math.floor(secondsRemaining / 60)} minutes and ${secondsRemaining % 60} seconds`}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl font-mono text-xs md:text-sm font-bold border ${
                secondsRemaining < 120
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse"
                  : "bg-white/10 text-white border-white/10"
              }`}
            >
              <Clock className="w-4 h-4 text-blue-400" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            {/* Finish Exam Button */}
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Submit Exam
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="font-bold underline cursor-pointer">Dismiss</button>
          </div>
        )}

        {/* Examination Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          {/* Main Question Panel (3 Columns) */}
          <div className="lg:col-span-3 space-y-4">
            {currentQ ? (
              <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
                {/* Question Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                      #{currentQ.question_number}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                  </div>

                  <button
                    onClick={handleToggleReview}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      currentAnswer?.isReview
                        ? "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${currentAnswer?.isReview ? "fill-amber-500 text-amber-500" : ""}`} />
                    <span>{currentAnswer?.isReview ? "Marked for Review" : "Mark for Review"}</span>
                  </button>
                </div>

                {/* Question Text with Tamil Typography */}
                <div className="text-slate-900 dark:text-slate-100 text-sm md:text-base font-medium leading-relaxed select-none">
                  {currentQ.question_text}
                </div>

                {/* Selectable Options */}
                <div
                  role="radiogroup"
                  aria-label={`Options for Question ${currentQ.question_number}`}
                  className="space-y-3 pt-2"
                >
                  {currentQ.options.map((optText, optIdx) => {
                    const isSelected = currentAnswer?.selectedIndex === optIdx;
                    return (
                      <div
                        key={optIdx}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        aria-label={`Option ${String.fromCharCode(65 + optIdx)}: ${optText}`}
                        onClick={() => handleSelectOption(optIdx)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelectOption(optIdx);
                          }
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/50 border-blue-500 dark:border-blue-500 shadow-xs ring-1 ring-blue-500"
                            : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-3 text-xs md:text-sm font-medium text-slate-800 dark:text-slate-200">
                          <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center border transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600"
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{optText}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Question Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleClearResponse}
                    disabled={currentAnswer?.selectedIndex === null || currentAnswer?.selectedIndex === undefined}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    Clear Response
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                      disabled={currentQuestionIndex === totalQuestions - 1}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">No question data available.</div>
            )}
          </div>

          {/* Right Sidebar: Question Palette (1 Column) */}
          <div className="space-y-4">
            {/* Mobile Toggle Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsPaletteOpenOnMobile((prev) => !prev)}
                className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between"
              >
                <span>Question Palette ({answeredCount}/{totalQuestions} Answered)</span>
                <span>{isPaletteOpenOnMobile ? "Hide Palette ↑" : "Show Palette ↓"}</span>
              </button>
            </div>

            <div className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 ${
              isPaletteOpenOnMobile ? "block" : "hidden lg:block"
            }`}>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center justify-between">
                <span>Question Palette</span>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">{answeredCount} of {totalQuestions} Answered</span>
              </h4>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-amber-400 shrink-0" />
                  <span>Review ({reviewCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-slate-200 dark:bg-slate-700 shrink-0" />
                  <span>Unattempted ({unvisitedCount})</span>
                </div>
              </div>

              {/* Grid of Question Pills */}
              <div className="grid grid-cols-5 gap-2 pt-2 max-h-60 overflow-y-auto scrollbar-none">
                {activeAttempt.questions.map((q, idx) => {
                  const state = answersMap[q.id];
                  const isAnswered = state?.selectedIndex !== null && state?.selectedIndex !== undefined;
                  const isReview = state?.isReview;
                  const isCurrent = idx === currentQuestionIndex;

                  let badgeColor = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
                  if (isReview && isAnswered) {
                    badgeColor = "bg-purple-600 text-white border-purple-600 font-bold";
                  } else if (isReview) {
                    badgeColor = "bg-amber-400 text-white border-amber-400 font-bold";
                  } else if (isAnswered) {
                    badgeColor = "bg-emerald-500 text-white border-emerald-500 font-bold";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentQuestionIndex(idx);
                        setIsPaletteOpenOnMobile(false);
                      }}
                      aria-current={isCurrent ? "true" : undefined}
                      aria-label={`Question ${idx + 1}: ${
                        isReview && isAnswered
                          ? "Answered and marked for review"
                          : isReview
                          ? "Marked for review"
                          : isAnswered
                          ? "Answered"
                          : "Unattempted"
                      }${isCurrent ? ", current question" : ""}`}
                      className={`h-9 rounded-xl text-xs flex items-center justify-center transition-all border cursor-pointer ${badgeColor} ${
                        isCurrent ? "ring-2 ring-blue-600 ring-offset-1 font-black" : ""
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Quick Submit CTA */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Review & Submit Exam
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Confirm Exam Submission?</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Your score will be officially evaluated by the server.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">Answered</span>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{answeredCount}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">Review</span>
                  <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">{reviewCount}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">Unanswered</span>
                  <p className="text-base font-bold text-slate-600 dark:text-slate-300 mt-0.5">{unvisitedCount}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Continue Test
                </button>
                <button
                  onClick={executeSubmission}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Evaluating..." : "Submit Examination"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // RENDER VIEW: 3. RESULTS & EXPLANATIONS (BACKEND-OWNED SCORING)
  // =========================================================================
  if (viewState === "result" && testResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
        {/* Scorecard Hero Banner */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-6 border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Official Examination Scorecard
              </span>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mt-1">
                {testResult.paper_title}
              </h2>
            </div>
            <div className="px-3.5 py-1.5 rounded-2xl bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Time: {Math.floor(testResult.time_taken_seconds / 60)}m {testResult.time_taken_seconds % 60}s</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
              <span className="text-[10px] font-bold text-slate-300 block">Marks Scored</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {testResult.total_marks_scored} <span className="text-xs text-slate-300 font-normal">/ {testResult.max_possible_marks}</span>
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
              <span className="text-[10px] font-bold text-slate-300 block">Accuracy</span>
              <p className="text-2xl font-bold text-blue-400 mt-1">{testResult.accuracy_percentage}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
              <span className="text-[10px] font-bold text-slate-300 block">Correct Answers</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{testResult.correct_count} / {testResult.total_questions}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
              <span className="text-[10px] font-bold text-slate-300 block">Wrong / Skipped</span>
              <p className="text-2xl font-bold text-rose-400 mt-1">{testResult.wrong_count} / {testResult.unattempted_count}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                setTestResult(null);
                setActiveAttempt(null);
                setViewState("list");
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              ← Back to All Tests
            </button>
            <span className="text-xs text-slate-300">
              ✓ Server-evaluated and recorded in daily performance analytics.
            </span>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Question-by-Question Evaluation & Verified Explanations</span>
          </h3>

          <div className="space-y-4">
            {testResult.questions && testResult.questions.map((q, idx) => {
              const isAttempted = q.selected_option_index !== null && q.selected_option_index !== undefined;
              return (
                <div
                  key={q.id}
                  className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      #{idx + 1}. {q.question_text}
                    </span>
                    {isAttempted ? (
                      q.is_correct ? (
                        <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                          Correct (+{q.marks_awarded})
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="sm" icon={<XCircle className="w-3 h-3" />}>
                          Incorrect (0.0)
                        </Badge>
                      )
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Skipped (0.0)
                      </Badge>
                    )}
                  </div>

                  {/* Options with Answer Key Highlights */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isUserChoice = q.selected_option_index === optIdx;
                      const isCorrectAnswer = q.correct_option_index === optIdx;

                      let optStyle = "bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/70 text-slate-700 dark:text-slate-300";
                      if (isCorrectAnswer) {
                        optStyle = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-semibold";
                      } else if (isUserChoice && !q.is_correct) {
                        optStyle = "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200";
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold">{String.fromCharCode(65 + optIdx)})</span>
                            <span>{opt}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-bold">
                            {isCorrectAnswer && (
                              <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                                Correct Answer ✓
                              </span>
                            )}
                            {isUserChoice && !isCorrectAnswer && (
                              <span className="text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-full">
                                Your Choice ✗
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Official SCERT Explanation */}
                  {q.explanation && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 space-y-1 text-xs">
                      <span className="font-bold text-blue-800 dark:text-blue-300 block">Explanation / விளக்கம்:</span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed m-0">{q.explanation}</p>
                      {q.reference_source && (
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium block pt-1">
                          Source Reference: {q.reference_source}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER VIEW: 4. MAIN TEST LISTING & ATTEMPT HISTORY
  // =========================================================================
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Badge variant="primary" size="md" className="mb-2">
              <Trophy className="w-3.5 h-3.5 mr-1" />
              <span>TNPSC Mock Tests & Question Bank</span>
            </Badge>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Exam Simulation Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified Samacheer Kalvi question papers with standard +1.5 marking and zero negative penalty.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (viewState !== "history") {
                  loadHistory();
                  setViewState("history");
                } else {
                  setViewState("list");
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>{viewState === "history" ? "Show Test Papers" : "Past Attempts"}</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => loadPapers()} className="font-bold underline cursor-pointer">Retry</button>
              <button onClick={() => setErrorMsg(null)} className="font-bold underline cursor-pointer">Dismiss</button>
            </div>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Exam:
          </span>
          {examFilterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedExamCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedExamCategory === cat
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}

          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 ml-3 mr-1">Subject:</span>
          {subjectFilterOptions.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedSubject === subj
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* View: User History */}
      {viewState === "history" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Your Previous Examination Attempts</span>
          </h3>

          {loadingHistory ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">Loading attempt history...</div>
          ) : historyItems.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Trophy className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No test attempts logged yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Complete your first practice exam to build your performance history.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyItems.map((h) => (
                <div
                  key={h.attempt_id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      {h.exam_category} • {h.subject}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{h.paper_title}</h4>
                    <span className="text-xs text-slate-400">
                      {h.submitted_at ? new Date(h.submitted_at).toLocaleDateString() : "In Progress"} • {Math.floor(h.time_taken_seconds / 60)}m {h.time_taken_seconds % 60}s
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{h.total_marks_scored} / {h.max_possible_marks}</span>
                      <span className="text-xs text-slate-400 block">{h.accuracy_percentage}% Accuracy</span>
                    </div>
                    <button
                      onClick={() => handleViewPastResult(h.attempt_id)}
                      disabled={loadingResult}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {loadingResult ? "Loading..." : "View Review"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View: Test Papers Grid */}
      {viewState === "list" && (
        <div>
          {loadingPapers ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">Loading test papers from server...</div>
          ) : papers.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching test papers found</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try clearing your filters or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {papers.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="primary" size="sm">
                        {p.exam_category} • {p.subject}
                      </Badge>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                        {p.difficulty}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {p.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span>{p.total_questions} Questions</span>
                      <span>•</span>
                      <span>{p.duration_minutes} Mins</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+{p.marks_per_question} Marks</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      {p.user_best_score !== null && p.user_best_score !== undefined ? (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" /> Best: {p.user_best_score} pts
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">Not attempted yet</span>
                      )}
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenInstructions(p)}
                      disabled={loadingInstructions}
                    >
                      <span>Start Practice</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
