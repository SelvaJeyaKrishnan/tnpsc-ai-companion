"use client";

import React, { useState } from "react";
import { BookOpen, CheckCircle2, ExternalLink, FileText, Layers, Search, X } from "lucide-react";

interface MaterialItem {
  title: string;
  category: string;
  pages: string;
  format: string;
  source: string;
  chapters: string[];
}

export const StudyMaterialsTab: React.FC = () => {
  const [activeMaterial, setActiveMaterial] = useState<MaterialItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const materials: MaterialItem[] = [
    {
      title: "Samacheer Kalvi 6th to 10th General Tamil Compilation",
      category: "General Tamil",
      pages: "340 Pages",
      format: "PDF Verified Reference",
      source: "SCERT Tamil Nadu",
      chapters: [
        "இயல் 1: தமிழ்மொழி மரபு, மொழித்திறன் மற்றும் சொல்வகை",
        "இயல் 2: இயற்கை மற்றும் சுற்றுச்சூழல் இலக்கியம்",
        "இயல் 3: அறிவியல் தொழில்நுட்பத் தமிழ் & திருக்குறள் சிந்தனைகள்",
        "இயல் 4: கல்வி, சமூகம், மற்றும் பெண் விடுதலைக் கவிதைகள்",
      ],
    },
    {
      title: "Indian Polity & Constitution Fast Revision Handbook",
      category: "Indian Polity",
      pages: "128 Pages",
      format: "Verified Summary",
      source: "TNPSC Reference Library",
      chapters: [
        "Part I & II: Union & Territory, Citizenship Guidelines",
        "Part III: Fundamental Rights (Articles 12-35) with Case Law",
        "Part IV & IVA: Directive Principles and Fundamental Duties",
        "Part IX & IXA: The Panchayats and The Municipalities",
      ],
    },
    {
      title: "Aptitude & Mental Ability Formula Sheets & 500 PYQs",
      category: "Aptitude",
      pages: "96 Pages",
      format: "Formulas & Solutions",
      source: "Previous Year Papers",
      chapters: [
        "Topic 1: Simplification, Square Roots, BODMAS Shortcuts",
        "Topic 2: Percentage, Profit & Loss, Discount Formulas",
        "Topic 3: Ratio, Proportion, Partnership, and Mixture Alligation",
        "Topic 4: Time, Speed, Distance, Trains & Work Rate Equalities",
      ],
    },
    {
      title: "Unit 8 & 9 Tamil Society, Archaeology & Development Schemes",
      category: "Tamil Nadu Heritage",
      pages: "210 Pages",
      format: "Comprehensive Notes",
      source: "TN Textbook Corporation",
      chapters: [
        "Chapter 1: History of Tamil Society & Keeladi Excavations",
        "Chapter 2: Socio-Religious Reform Movements & Justice Party",
        "Chapter 3: Self-Respect Movement (Periyar E.V.R. & Anna)",
        "Chapter 4: Tamil Nadu Human Development Index (HDI) & Welfare Schemes",
      ],
    },
  ];

  const categories = ["All", "General Tamil", "Indian Polity", "Aptitude", "Tamil Nadu Heritage"];

  const filteredMaterials = materials.filter((m) => {
    const matchesCategory = selectedCategory === "All" || m.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header and Search Filter */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Verified TNPSC Study Materials & SCERT Textbooks</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated, versioned reference texts from Samacheer Kalvi and official syllabus guidelines.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topics or books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Cards Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No matching materials found</h4>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or choosing another category.</p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="mt-3 text-xs text-blue-600 font-bold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.map((m, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {m.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug">
                  {m.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                  <span>{m.pages}</span>
                  <span>•</span>
                  <span>{m.format}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Source: {m.source}</div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Provenance Verified
                </span>
                <button
                  onClick={() => setActiveMaterial(m)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                >
                  <span>Read Notes</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reader Preview Modal */}
      {activeMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {activeMaterial.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                  {activeMaterial.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveMaterial(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="Close reader"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span><strong>Publisher:</strong> {activeMaterial.source}</span>
                <span><strong>Length:</strong> {activeMaterial.pages}</span>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Syllabus Chapter Breakdown</span>
                </div>
                <div className="space-y-2">
                  {activeMaterial.chapters.map((ch, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-blue-400 transition-colors flex items-center gap-2.5 text-xs text-slate-700"
                    >
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="truncate">{ch}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Textbook contents are indexed for grounded AI Tutor verification.</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveMaterial(null)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
