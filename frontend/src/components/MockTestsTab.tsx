"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  Play,
  RotateCcw,
  X,
  XCircle,
} from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface MockTest {
  id: string;
  title: string;
  subject: string;
  questionsCount: number;
  durationMinutes: number;
  difficulty: string;
  instructions: string[];
  questions: Question[];
}

export const MockTestsTab: React.FC = () => {
  // Test bank
  const tests: MockTest[] = [
    {
      id: "tamil_mock_1",
      title: "TNPSC Group 4 General Tamil Practice Mock",
      subject: "General Tamil",
      questionsCount: 5,
      durationMinutes: 10,
      difficulty: "Exam Standard",
      instructions: [
        "Questions are framed based on 6th to 10th Samacheer Kalvi textbooks.",
        "Each correct answer earns +1.5 marks. Negative marking penalty: -0.33 for wrong answers.",
        "Covers Ilakkanam, Ilakkiyam, and Tamil Scholars.",
      ],
      questions: [
        {
          id: 1,
          question: "‘அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு’ - இக்குறட்பாவில் அமைந்துள்ள பயின்று வந்துள்ள அணி எது?",
          options: [
            "A) உவமையணி",
            "B) எடுத்துக்காட்டு உவமையணி",
            "C) பொருள் வேற்றுமையணி",
            "D) இல்பொருள் உவமையணி",
          ],
          correctIndex: 1,
          explanation: "எடுத்துக்காட்டு உவமையணி: உவமையும் உவமேயமும் தனித்தனி வாக்கியங்களாக வந்து உவம உருபு மறைந்து வருவது. இக்குறளில் 'போல' என்ற உவம உருபு மறைந்து வந்துள்ளது.",
        },
        {
          id: 2,
          question: "‘செம்மொழி’ என்னும் சொல்லுக்கு இணையான சரியான ஆங்கிலச் சொல் எது?",
          options: [
            "A) Ancient Language",
            "B) National Language",
            "C) Classical Language",
            "D) Standard Language",
          ],
          correctIndex: 2,
          explanation: "Classical Language என்பது 'செம்மொழி' ஆகும். தமிழ் 2004-ஆம் ஆண்டு இந்தியாவின் முதல் செம்மொழியாக அறிவிக்கப்பட்டது.",
        },
        {
          id: 3,
          question: "‘கல்லாமை’ - இச்சொல்லின் சரியான இலக்கணக் குறிப்பு தருக:",
          options: [
            "A) தொழிற்பெயர்",
            "B) வினையெச்சம்",
            "C) எதிர்மறைத் தொழிற்பெயர்",
            "D) பண்புப்பெயர்",
          ],
          correctIndex: 2,
          explanation: "கல்வி கற்காத நிலையைக் குறிக்கும் எதிர்மறைப் பொருளில் வந்த தொழிற்பெயர் ஆகும்.",
        },
        {
          id: 4,
          question: "எட்டுத்தொகை நூல்களுள் முதலாவதாக வைத்து எண்ணப்படும் நூல் எது?",
          options: [
            "A) நற்றிணை",
            "B) குறுந்தொகை",
            "C) ஐங்குறுநூறு",
            "D) பதிற்றுப்பத்து",
          ],
          correctIndex: 0,
          explanation: "'நற்றிணை நல்ல குறுந்தொகை ஐங்குறுநூறு...' என்ற செய்யுள் தொடரின்படி நற்றிணை முதலாவதாக எண்ணப்படுகிறது.",
        },
        {
          id: 5,
          question: "சிலப்பதிகாரம் மற்றும் மணிமேகலை ஆகிய இரண்டு நூல்களும் இணைந்து எவ்வாறு அழைக்கப்படுகின்றன?",
          options: [
            "A) சங்க இலக்கியங்கள்",
            "B) இரட்டைக்காப்பியங்கள்",
            "C) அறநூல்கள்",
            "D) நீதி இலக்கியங்கள்",
          ],
          correctIndex: 1,
          explanation: "கதைத்தொடர்பாலும் காலத்தொடர்பாலும் சிலப்பதிகாரமும் மணிமேகலையும் 'இரட்டைக்காப்பியங்கள்' எனப்படுகின்றன.",
        },
      ],
    },
    {
      id: "aptitude_mock_1",
      title: "Aptitude & Mental Ability High-Speed Test",
      subject: "Aptitude",
      questionsCount: 5,
      durationMinutes: 8,
      difficulty: "High Speed",
      instructions: [
        "Time benchmark: under 90 seconds per question.",
        "Simplification, Percentage, LCM-HCF, and Time & Work.",
        "Formula accuracy and mental shortcut evaluation.",
      ],
      questions: [
        {
          id: 1,
          question: "If the simple interest on a principal for 2 years at 5% per annum is ₹200, what is the compound interest on the same sum for the same period?",
          options: [
            "A) ₹202.50",
            "B) ₹205.00",
            "C) ₹210.00",
            "D) ₹215.00",
          ],
          correctIndex: 1,
          explanation: "SI = (P*2*5)/100 = 200 => P = ₹2000. CI = 2000 * [(1 + 5/100)^2 - 1] = 2000 * (441/400 - 1) = ₹205.00.",
        },
        {
          id: 2,
          question: "The HCF of two numbers is 11 and their LCM is 7700. If one of the numbers is 275, find the other number:",
          options: [
            "A) 289",
            "B) 308",
            "C) 318",
            "D) 325",
          ],
          correctIndex: 1,
          explanation: "Product of two numbers = HCF * LCM => 275 * Y = 11 * 7700 => Y = (11 * 7700) / 275 = 308.",
        },
        {
          id: 3,
          question: "If A can complete a work in 10 days and B can complete it in 15 days, in how many days can both together complete the work?",
          options: [
            "A) 5 days",
            "B) 6 days",
            "C) 7.5 days",
            "D) 8 days",
          ],
          correctIndex: 1,
          explanation: "Together time = (A * B) / (A + B) = (10 * 15) / (10 + 15) = 150 / 25 = 6 days.",
        },
        {
          id: 4,
          question: "A sum of money doubles itself in 8 years at simple interest. Find the rate of interest per annum:",
          options: [
            "A) 10%",
            "B) 11.5%",
            "C) 12.5%",
            "D) 15%",
          ],
          correctIndex: 2,
          explanation: "For sum to double, SI = P. P = (P * 8 * R)/100 => 8R = 100 => R = 12.5%.",
        },
        {
          id: 5,
          question: "Find the missing number in the series: 2, 6, 12, 20, 30, ?",
          options: [
            "A) 40",
            "B) 42",
            "C) 44",
            "D) 48",
          ],
          correctIndex: 1,
          explanation: "Pattern: 1*2=2, 2*3=6, 3*4=12, 4*5=20, 5*6=30, next is 6*7 = 42.",
        },
      ],
    },
    {
      id: "polity_mock_1",
      title: "Indian Polity & Constitution Unit Test",
      subject: "Polity",
      questionsCount: 5,
      durationMinutes: 8,
      difficulty: "Moderate",
      instructions: [
        "Articles 12 to 35, Fundamental Rights, Writs, and Constitutional Amendments.",
        "Negative marking: -0.33 for wrong selections.",
        "Official TNPSC bilingual question formulation.",
      ],
      questions: [
        {
          id: 1,
          question: "Which Article of the Constitution was described by Dr. B.R. Ambedkar as the 'Heart and Soul' of the Constitution?",
          options: [
            "A) Article 14",
            "B) Article 19",
            "C) Article 21",
            "D) Article 32",
          ],
          correctIndex: 3,
          explanation: "Article 32 provides the Right to Constitutional Remedies and empowers the Supreme Court to issue writs.",
        },
        {
          id: 2,
          question: "The concept of 'Fundamental Duties' in the Indian Constitution was borrowed from which country?",
          options: [
            "A) USA",
            "B) USSR (Former Soviet Union)",
            "C) United Kingdom",
            "D) Ireland",
          ],
          correctIndex: 1,
          explanation: "Fundamental Duties (Part IVA, Article 51A) were incorporated by the 42nd Amendment (1976) following the Swaran Singh Committee recommendations, inspired by the USSR constitution.",
        },
        {
          id: 3,
          question: "By which Constitutional Amendment Act was the voting age reduced from 21 years to 18 years in India?",
          options: [
            "A) 42nd Amendment Act",
            "B) 44th Amendment Act",
            "C) 61st Amendment Act, 1988",
            "D) 73rd Amendment Act",
          ],
          correctIndex: 2,
          explanation: "The 61st Constitutional Amendment Act, 1988 amended Article 326 to reduce the voting age from 21 to 18 years.",
        },
        {
          id: 4,
          question: "Which Schedule of the Indian Constitution lists the official languages recognized by the Constitution?",
          options: [
            "A) Seventh Schedule",
            "B) Eighth Schedule",
            "C) Ninth Schedule",
            "D) Tenth Schedule",
          ],
          correctIndex: 1,
          explanation: "The Eighth Schedule contains 22 recognized languages. Tamil is one of the classical languages listed in the Eighth Schedule.",
        },
        {
          id: 5,
          question: "The Panchayati Raj system was granted constitutional status under which Constitutional Amendment Act?",
          options: [
            "A) 73rd Amendment Act, 1992",
            "B) 74th Amendment Act, 1992",
            "C) 86th Amendment Act",
            "D) 91st Amendment Act",
          ],
          correctIndex: 0,
          explanation: "The 73rd Constitutional Amendment Act, 1992 added Part IX and the Eleventh Schedule containing 29 functional items for Panchayats.",
        },
      ],
    },
    {
      id: "unit8_mock_1",
      title: "Unit 8 & 9 Tamil Society & TN Schemes Test",
      subject: "TN Specific",
      questionsCount: 5,
      durationMinutes: 8,
      difficulty: "Exam Standard",
      instructions: [
        "Archaeological excavations, Dravidian movement, and state welfare schemes.",
        "Official SCERT and Archeology Department references.",
      ],
      questions: [
        {
          id: 1,
          question: "In which district of Tamil Nadu is the celebrated Sangam Age archaeological site 'Keeladi' situated?",
          options: [
            "A) Madurai",
            "B) Sivagangai",
            "C) Thoothukudi",
            "D) Ramanathapuram",
          ],
          correctIndex: 1,
          explanation: "Keeladi is located in Tiruppuvanam taluk of Sivagangai district, situated along the Vaigai river basin.",
        },
        {
          id: 2,
          question: "Which political organisation issued the historic 'Non-Brahmin Manifesto' in December 1916?",
          options: [
            "A) Home Rule League",
            "B) South Indian Liberal Federation (Justice Party)",
            "C) Madras Mahajana Sabha",
            "D) Self-Respect Movement",
          ],
          correctIndex: 1,
          explanation: "The South Indian Liberal Federation (later known as the Justice Party), led by Dr. C. Natesa Mudaliar, Sir P. Theagaraya Chetty, and Dr. T.M. Nair, released the manifesto in December 1916.",
        },
        {
          id: 3,
          question: "In which year did Thanthai Periyar launch the Self-Respect Movement (சுயமரியாதை இயக்கம்)?",
          options: [
            "A) 1920",
            "B) 1925",
            "C) 1930",
            "D) 1937",
          ],
          correctIndex: 1,
          explanation: "Periyar E.V. Ramasamy started the Self-Respect Movement in 1925 after resigning from the Indian National Congress over communal representation.",
        },
        {
          id: 4,
          question: "Which flagship scheme of Tamil Nadu provides ₹1,000 monthly financial assistance to female college students who studied in government schools?",
          options: [
            "A) Moovalur Ramamirtham Ammaiyar Pudhumai Penn Scheme",
            "B) Thozhi Scheme",
            "C) Muthulakshmi Reddy Scheme",
            "D) Amma Magalir Scheme",
          ],
          correctIndex: 0,
          explanation: "The Pudhumai Penn Scheme provides ₹1,000/month directly to girl students pursuing undergraduate and diploma courses from government schools (Classes 6-12).",
        },
        {
          id: 5,
          question: "The ancient port city of 'Poompuhar' (Kaveripoompattinam) is situated at the mouth of which river?",
          options: [
            "A) Vaigai",
            "B) Thamirabarani",
            "C) Cauvery",
            "D) Palar",
          ],
          correctIndex: 2,
          explanation: "Poompuhar was the major ancient seaport of the early Cholas, situated where the Cauvery river drains into the Bay of Bengal.",
        },
      ],
    },
  ];

  // Completed scores stored in state/localStorage
  const [testResults, setTestResults] = useState<Record<string, { score: string; percentage: number }>>(() => {
    try {
      const saved = localStorage.getItem("tnpsc_mock_test_results");
      return saved ? JSON.parse(saved) : { aptitude_mock_1: { score: "7.5/7.5", percentage: 100 } };
    } catch {
      return { aptitude_mock_1: { score: "7.5/7.5", percentage: 100 } };
    }
  });

  // Active Test State
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isTestSubmitted, setIsTestSubmitted] = useState<boolean>(false);
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);

  // Countdown timer for active exam
  useEffect(() => {
    if (!isTestRunning || isTestSubmitted) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTestSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTestRunning, isTestSubmitted]);

  // Start test handler
  const handleStartTest = (test: MockTest) => {
    setActiveTest(test);
    setIsTestRunning(true);
    setIsTestSubmitted(false);
    setIsReviewMode(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSecondsRemaining(test.durationMinutes * 60);
  };

  // Submit test and calculate score
  const handleTestSubmit = () => {
    if (!activeTest) return;
    setIsTestRunning(false);
    setIsTestSubmitted(true);

    // Calculate score: +1.5 for correct, -0.33 for wrong
    let correctCount = 0;
    let wrongCount = 0;

    activeTest.questions.forEach((q, idx) => {
      const selected = userAnswers[idx];
      if (selected !== undefined) {
        if (selected === q.correctIndex) {
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    });

    const maxMarks = activeTest.questions.length * 1.5;
    const rawScore = Math.max(0, correctCount * 1.5 - wrongCount * 0.33);
    const scoreStr = `${Math.round(rawScore * 10) / 10}/${maxMarks}`;
    const pct = Math.round((rawScore / maxMarks) * 100);

    const updated = {
      ...testResults,
      [activeTest.id]: { score: scoreStr, percentage: pct },
    };
    setTestResults(updated);
    try {
      localStorage.setItem("tnpsc_mock_test_results", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="flex items-center justify-between p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>TNPSC Practice Quizzes & Mock Test Simulator</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Timed syllabus quizzes with negative marking (-0.33), question navigation, score analysis, and Samacheer Kalvi references.
          </p>
        </div>
      </div>

      {/* Mock Tests Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.map((test) => {
          const result = testResults[test.id];
          return (
            <div
              key={test.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    {test.subject}
                  </span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {test.durationMinutes} Mins
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug">
                  {test.title}
                </h3>
                <div className="text-xs text-slate-500 mt-1">
                  {test.questionsCount} Multiple Choice Questions • {test.difficulty}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                {result ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Score: {result.score} ({result.percentage}%)
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">Unattempted</span>
                )}

                <button
                  onClick={() => handleStartTest(test)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{result ? "Retake Test" : "Start Test"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Full Mock Test Environment Modal */}
      {activeTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs select-none">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header: Title & Timer / Score */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
              <div className="min-w-0 pr-3">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {activeTest.subject}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1 truncate">
                  {activeTest.title}
                </h3>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {!isTestSubmitted && isTestRunning && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{timeFormatted}</span>
                  </div>
                )}
                <button
                  onClick={() => setActiveTest(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  aria-label="Close test"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Test Body: Interactive Quiz Mode */}
            {!isTestSubmitted ? (
              <div className="flex-1 overflow-y-auto py-4 space-y-5">
                {/* Question Palette / Number Jump */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">
                    Question {currentQuestionIndex + 1} of {activeTest.questions.length}
                  </span>
                  <div className="flex items-center gap-1">
                    {activeTest.questions.map((_, qIdx) => {
                      const isAnswered = userAnswers[qIdx] !== undefined;
                      const isCurrent = currentQuestionIndex === qIdx;
                      return (
                        <button
                          key={qIdx}
                          onClick={() => setCurrentQuestionIndex(qIdx)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            isCurrent
                              ? "bg-blue-600 text-white shadow-xs ring-2 ring-blue-400"
                              : isAnswered
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {qIdx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question Details Card */}
                {(() => {
                  const currentQ = activeTest.questions[currentQuestionIndex];
                  return (
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-bold text-slate-700">Question #{currentQuestionIndex + 1}</span>
                        <span>Correct: +1.5 | Penalty: -0.33</span>
                      </div>

                      <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                        {currentQ.question}
                      </p>

                      {/* Options Radio List */}
                      <div className="space-y-2 pt-2">
                        {currentQ.options.map((opt, optIdx) => {
                          const isSelected = userAnswers[currentQuestionIndex] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() =>
                                setUserAnswers((prev) => ({
                                  ...prev,
                                  [currentQuestionIndex]: optIdx,
                                }))
                              }
                              className={`w-full p-3 rounded-xl text-left text-xs font-medium border transition-all flex items-center justify-between ${
                                isSelected
                                  ? "bg-blue-50 border-blue-500 text-blue-900 shadow-xs"
                                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span>{opt}</span>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-slate-300"
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Bottom Navigation Row */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {userAnswers[currentQuestionIndex] !== undefined && (
                      <button
                        onClick={() => {
                          const nextAns = { ...userAnswers };
                          delete nextAns[currentQuestionIndex];
                          setUserAnswers(nextAns);
                        }}
                        className="text-[11px] text-slate-400 hover:text-slate-600 underline mr-2"
                      >
                        Clear Selection
                      </button>
                    )}

                    {currentQuestionIndex < activeTest.questions.length - 1 ? (
                      <button
                        onClick={() =>
                          setCurrentQuestionIndex((prev) =>
                            Math.min(activeTest.questions.length - 1, prev + 1)
                          )
                        }
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleTestSubmit}
                        className="flex items-center gap-1 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit Examination</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Test Result & Review Mode */
              <div className="flex-1 overflow-y-auto py-4 space-y-5">
                {!isReviewMode ? (
                  <div className="space-y-5">
                    {/* Scorecard Hero */}
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white text-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto flex items-center justify-center text-amber-400">
                        <Award className="w-6 h-6" />
                      </div>
                      <h4 className="text-xl font-bold">Exam Simulation Complete</h4>
                      <p className="text-xs text-slate-300">
                        Calculated according to official TNPSC marking (+1.5 correct, -0.33 negative marking).
                      </p>
                      <div className="pt-2">
                        <span className="font-mono text-3xl font-bold text-amber-300">
                          {testResults[activeTest.id]?.score || "0/7.5"}
                        </span>
                        <span className="text-xs text-slate-300 ml-2">
                          ({testResults[activeTest.id]?.percentage || 0}%)
                        </span>
                      </div>
                    </div>

                    {/* Breakdown Metrics */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <div className="text-[10px] font-bold text-emerald-600 uppercase">Correct</div>
                        <div className="text-lg font-bold text-emerald-800 mt-0.5">
                          {
                            activeTest.questions.filter(
                              (q, i) => userAnswers[i] === q.correctIndex
                            ).length
                          }
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                        <div className="text-[10px] font-bold text-rose-600 uppercase">Wrong (-0.33)</div>
                        <div className="text-lg font-bold text-rose-800 mt-0.5">
                          {
                            activeTest.questions.filter(
                              (q, i) =>
                                userAnswers[i] !== undefined &&
                                userAnswers[i] !== q.correctIndex
                            ).length
                          }
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Unattempted</div>
                        <div className="text-lg font-bold text-slate-700 mt-0.5">
                          {
                            activeTest.questions.filter(
                              (_, i) => userAnswers[i] === undefined
                            ).length
                          }
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 flex items-center justify-between">
                      <button
                        onClick={() => handleStartTest(activeTest)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retake Test</span>
                      </button>

                      <button
                        onClick={() => setIsReviewMode(true)}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Review All Answers & Explanations</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Detailed Review Mode */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Comprehensive Answer Key & Explanations</span>
                      </h4>
                      <button
                        onClick={() => setIsReviewMode(false)}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        ← Back to Scorecard
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {activeTest.questions.map((q, idx) => {
                        const userAns = userAnswers[idx];
                        const isCorrect = userAns === q.correctIndex;
                        const isAttempted = userAns !== undefined;

                        return (
                          <div
                            key={q.id}
                            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                #{idx + 1}. {q.question}
                              </span>
                              {isCorrect ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                                  <CheckCircle2 className="w-3 h-3" /> Correct (+1.5)
                                </span>
                              ) : isAttempted ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 shrink-0">
                                  <XCircle className="w-3 h-3" /> Wrong (-0.33)
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                                  Unattempted
                                </span>
                              )}
                            </div>

                            <div className="space-y-1 text-xs">
                              {q.options.map((opt, oIdx) => {
                                const isThisCorrect = oIdx === q.correctIndex;
                                const isThisSelected = userAns === oIdx;

                                return (
                                  <div
                                    key={oIdx}
                                    className={`p-2 rounded-lg text-[11px] font-medium flex items-center justify-between ${
                                      isThisCorrect
                                        ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-300"
                                        : isThisSelected
                                        ? "bg-rose-50 text-rose-900 font-bold border border-rose-300"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {isThisCorrect && <span>✓ Correct Answer</span>}
                                    {isThisSelected && !isThisCorrect && <span>✗ Your Choice</span>}
                                  </div>
                                );
                              })}
                            </div>

                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
                              <strong>Samacheer Kalvi Reference:</strong> {q.explanation}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
