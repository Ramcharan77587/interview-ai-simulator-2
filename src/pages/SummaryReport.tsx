import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import MobileNav from "../components/MobileNav";
import { Search, Download, Share2, ChevronRight, Award, Terminal, MessageSquare, Lightbulb, AlertTriangle, Loader2, ArrowLeft, RotateCcw, Check } from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SummaryReport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [shareToast, setShareToast] = useState("");
  const [hasLoadedMore, setHasLoadedMore] = useState(false);

  // Configuration Settings (read from localStorage)
  const [difficultySetting] = useState(() => localStorage.getItem("interview_difficulty") || "senior");
  const [focusSetting] = useState(() => localStorage.getItem("interview_focus") || "technical");

  const handleShareData = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareToast("Diagnostic report link copied to clipboard!");
      setTimeout(() => setShareToast(""), 3500);
    } catch {
      setShareToast("Report link ready: " + window.location.href);
      setTimeout(() => setShareToast(""), 3500);
    }
  };

  const getDifficultyLabel = (d: string) => {
    switch (d) {
      case "junior": return "Junior";
      case "mid": return "Mid-Level";
      case "senior": return "Senior";
      case "staff": return "Staff / Principal";
      default: return d || "Senior";
    }
  };

  const getFocusLabel = (f: string) => {
    switch (f) {
      case "technical": return "Technical Depth";
      case "behavioral": return "Behavioral & Culture";
      case "system_design": return "System Design";
      case "general": return "Comprehensive";
      default: return f || "Technical Depth";
    }
  };

  const [latestEval] = useState(() => {
    try {
      const stored = localStorage.getItem("interview_latest_evaluation");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const techScore = latestEval?.technical_score ? Math.round(latestEval.technical_score) : 88;
  const clarityScore = latestEval?.clarity_score ? Math.round(latestEval.clarity_score) : 75;
  const overallScore = Math.round((techScore + clarityScore) / 2);

  const metrics = [
    { title: "Overall Score", value: String(overallScore), total: "/100", icon: <Award className="text-on-primary-container" size={20} />, color: "bg-primary-container" },
    { title: "Technical Accuracy", value: `${techScore}%`, badge: techScore >= 70 ? "Passed" : "Needs Review", icon: <Terminal className="text-on-secondary-container" size={20} />, color: "bg-secondary-container" },
    { title: "Communication Style", value: `${clarityScore}%`, label: clarityScore >= 75 ? "Clear, Structural" : "Developing", icon: <MessageSquare className="text-on-surface" size={20} />, color: "bg-surface-variant" },
  ];

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-0 md:ml-64 min-h-screen overflow-hidden">
        <MobileNav />
        <div className="hidden md:block">
          <Topbar title="Interview Report" />
        </div>

        <main className="flex-1 overflow-y-auto pt-20 md:pt-24 px-4 sm:px-6 md:px-8 pb-12">
          <div className="max-w-[1440px] mx-auto w-full flex flex-col gap-6">
            {/* Back Navigation */}
            <div className="flex justify-start">
              <Link 
                to="/dashboard"
                className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-primary transition-colors uppercase tracking-wider"
              >
                <ArrowLeft size={14} />
                Back to Dashboard
              </Link>
            </div>

            {/* Share Toast Notification */}
            {shareToast && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-[4px] flex items-center gap-2">
                <Check size={16} />
                <span>{shareToast}</span>
              </div>
            )}

             {/* Header / Actions Row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-text-main tracking-tight uppercase">
                  Performance Summary: {getDifficultyLabel(difficultySetting)} {getFocusLabel(focusSetting)}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-[2px] font-bold uppercase tracking-widest">SESSION #88210A</span>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                    Candidate: {user?.name || "Verified Candidate"} • {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate("/room")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-[11px] font-bold hover:bg-primary-hover transition-all uppercase tracking-widest shadow-md rounded-[4px] active:scale-95 border border-blue-700"
                >
                  <RotateCcw size={15} />
                  <span>Retry</span>
                </button>
                <button
                  disabled={isExporting}
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-[4px] bg-surface text-[11px] font-bold text-text-main hover:border-primary transition-colors uppercase tracking-widest shadow-sm active:scale-95 disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-primary" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download size={15} />
                      <span>Export PDF</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={handleShareData}
                  className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-[4px] bg-surface text-[11px] font-bold text-text-main hover:border-primary transition-colors uppercase tracking-widest shadow-sm active:scale-95"
                >
                  <Share2 size={15} />
                  <span>Share Data</span>
                </button>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {metrics.map((m, i) => (
                <div key={i} className="p-6 border border-border rounded-[4px] bg-surface shadow-sm flex flex-col justify-between h-32 hover:border-primary transition-colors">
                  <div className="flex justify-between items-start">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{m.title}</h3>
                    <div className="text-primary opacity-50">
                      {m.icon}
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                     <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-text-main">{m.value}</span>
                        {m.total && <span className="text-sm font-bold text-text-muted">{m.total}</span>}
                     </div>
                     {m.badge ? (
                        <div className="text-green-500 bg-green-500/10 px-2 py-1 rounded-[2px] text-[10px] font-bold uppercase tracking-tighter border border-green-500/20">
                          {m.badge}
                        </div>
                     ) : (
                       <div className="text-text-muted text-[10px] font-bold uppercase tracking-tighter italic">
                         {m.label || "Analysis Ready"}
                       </div>
                     )}
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content: Charts & Detailed Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
              {/* Left Column: Visual Analytics */}
              <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-8">
                <div className="p-8 border border-border rounded-[4px] bg-surface shadow-sm flex flex-col hover:border-primary transition-colors">
                  <div className="mb-8 flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-tight text-text-main">Vocal Clarity & Performance Assertion</h3>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold mt-1">Timeline analysis across 45:00 session</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-text-muted">
                        <div className="w-2 h-2 bg-primary rounded-full"></div> Score
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-text-muted">
                        <div className="w-2 h-2 bg-border rounded-full"></div> Baseline
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-64 flex items-end gap-2 px-2 border-b border-border mb-4">
                    {[60, 45, 85, 75, 90, 65, 80, 85, 70, 88].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, duration: 0.8 }}
                        className="flex-1 bg-surface-muted border-t-2 border-primary hover:bg-primary/5 transition-colors cursor-help"
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-text-muted font-mono uppercase">
                     <span>00:00</span>
                     {[10, 20, 30, 40].map(m => <span key={m}>{m}:00</span>)}
                  </div>
                </div>

                <div className="p-8 border border-border rounded-[4px] bg-surface shadow-sm flex flex-col hover:border-primary transition-colors">
                   <h3 className="text-sm font-bold uppercase tracking-tight text-text-main mb-6">Technical Entity Coverage</h3>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-text-main">
                      {(latestEval?.matched_concepts && latestEval.matched_concepts.length > 0
                        ? latestEval.matched_concepts
                        : ["Distributed Systems", "ACID", "CAP Theorem", "Consensus", "Rate Limiting", "Caching", "Sharding", "API Design"]
                      ).map((tech: string, i: number) => (
                         <div key={i} className="p-3 border border-border rounded-[2px] bg-surface-muted flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Entity</span>
                            <span className="text-xs font-bold text-text-main uppercase">{tech}</span>
                         </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Right Column: Detailed Feedback Feed */}
              <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary"></div>
                  <h3 className="text-sm font-bold uppercase tracking-tight text-text-main">Critical Observations</h3>
                </div>

                <div className="space-y-4">
                  {/* Observation 1 */}
                  <div className="p-6 border border-border rounded-[4px] bg-surface shadow-sm flex flex-col hover:border-primary transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                         <span className="bg-text-main text-background text-[9px] font-bold px-2 py-0.5 rounded-[2px] uppercase tracking-wider">Algorithm Design</span>
                         <span className="font-mono text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">12:45</span>
                      </div>
                      <div className="text-green-500 font-bold text-[10px] uppercase tracking-wider font-bold">PERFECT</div>
                    </div>
                    <p className="text-sm font-semibold text-text-main leading-relaxed mb-4">
                      Excellent transition from recursive approach to dynamic programming after identifying overlapping subproblems. 
                    </p>
                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-[4px] flex gap-3">
                      <Lightbulb className="text-primary shrink-0" size={16} />
                      <p className="text-[11px] text-text-main font-bold leading-relaxed uppercase tracking-tight">
                        <span className="font-bold">AI Observation:</span> Maturity in planning phase ahead of implementation was highly noted.
                      </p>
                    </div>
                  </div>

                  {/* Observation 2 */}
                  <div className="p-6 border border-border rounded-[4px] bg-surface shadow-sm flex flex-col hover:border-primary transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                         <span className="bg-surface-muted border border-border text-text-main text-[9px] font-bold px-2 py-0.5 rounded-[2px] uppercase tracking-wider">Database Theory</span>
                         <span className="font-mono text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">28:10</span>
                      </div>
                      <div className="text-amber-500 font-bold text-[10px] uppercase tracking-wider font-bold">NEEDS REVIEW</div>
                    </div>
                    <p className="text-sm font-semibold text-text-main leading-relaxed mb-4">
                      Failed to articulately explain when to prefer eventual consistency over strong consistency for global scale.
                    </p>
                    <div className="bg-surface-muted border border-border p-4 rounded-[4px] flex gap-3 italic text-text-muted font-mono text-[10px]">
                      &gt; "I'd just use a NoSQL database because it's faster for everything in this case."
                    </div>
                    <div className="mt-4 p-4 border-l-2 border-primary bg-surface-muted rounded-r-[4px]">
                       <p className="text-[11px] font-bold text-text-main uppercase tracking-tight">Suggested Training:</p>
                       <p className="text-[11px] text-text-muted font-bold mt-1">Review Distributed Transactions and 2PC patterns.</p>
                    </div>
                  </div>
                {hasLoadedMore && (
                  <div className="p-6 border border-border rounded-[4px] bg-surface shadow-sm flex flex-col hover:border-primary transition-colors animate-fadeIn">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                         <span className="bg-text-main text-background text-[9px] font-bold px-2 py-0.5 rounded-[2px] uppercase tracking-wider">Concurrency Architecture</span>
                         <span className="font-mono text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">34:20</span>
                      </div>
                      <div className="text-green-500 font-bold text-[10px] uppercase tracking-wider font-bold">SOLID</div>
                    </div>
                    <p className="text-sm font-semibold text-text-main leading-relaxed mb-4">
                      Accurate formulation of non-blocking I/O event loops and worker pools during asynchronous spikes.
                    </p>
                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-[4px] flex gap-3">
                      <Lightbulb className="text-primary shrink-0" size={16} />
                      <p className="text-[11px] text-text-main font-bold leading-relaxed uppercase tracking-tight">
                        <span className="font-bold">AI Observation:</span> Strong conceptual clarity articulating the trade-offs between multithreading and single-threaded async runtimes.
                      </p>
                    </div>
                  </div>
                )}

                <button 
                  type="button"
                  onClick={() => setHasLoadedMore(prev => !prev)}
                  className="w-full py-4 border border-border rounded-[4px] bg-surface-muted text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-text-main hover:bg-surface transition-colors flex items-center justify-center active:scale-[0.99]"
                >
                  {hasLoadedMore ? "COLLAPSE ADDITIONAL FEEDBACK" : "LOAD MORE FEEDBACK (14 REMAINING)"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
);
}
