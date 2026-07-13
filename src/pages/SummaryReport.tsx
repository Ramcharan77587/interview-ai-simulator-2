import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Search, Download, Share2, ChevronRight, Award, Terminal, MessageSquare, Lightbulb, AlertTriangle, Loader2, ArrowLeft, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { jsPDF } from "jspdf";
import { Link, useNavigate } from "react-router-dom";

export default function SummaryReport() {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);

  // Configuration Settings (read from localStorage)
  const [difficultySetting] = useState(() => localStorage.getItem("interview_difficulty") || "senior");
  const [focusSetting] = useState(() => localStorage.getItem("interview_focus") || "technical");

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

  const metrics = [
    { title: "Overall Score", value: "82", total: "/100", icon: <Award className="text-on-primary-container" size={20} />, color: "bg-primary-container" },
    { title: "Technical Accuracy", value: "88%", badge: "Top Quartile", icon: <Terminal className="text-on-secondary-container" size={20} />, color: "bg-secondary-container" },
    { title: "Communication Style", value: "75%", label: "Clear, Structural", icon: <MessageSquare className="text-on-surface" size={20} />, color: "bg-surface-variant" },
  ];

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // ==================== PAGE 1 ====================
      // Header Accent Blue
      doc.setFillColor(37, 99, 235);
      doc.rect(15, 15, 3, 14, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59); // Slate-800
      doc.text("INTERVIEW PERFORMANCE SUMMARY", 22, 21);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text("CANDIDATE PORTFOLIO & AI DIAGNOSTIC REPORT", 22, 27);

      // Divider
      doc.setDrawColor(226, 232, 240); // Slate-200
      doc.setLineWidth(0.3);
      doc.line(15, 31, 195, 31);

      // Metadata Block
      doc.setFillColor(248, 250, 252); // Slate-50
      doc.rect(15, 36, 180, 18, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 36, 180, 18, "D");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text("CANDIDATE ROLE", 19, 41);
      doc.text("SESSION ID", 72, 41);
      doc.text("ASSESSMENT DATE", 112, 41);
      doc.text("EVALUATION STATUS", 152, 41);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text("Senior Software Engineer", 19, 47);
      doc.text("#88210A", 72, 47);
      doc.text("Oct 24, 2023", 112, 47);
      doc.setTextColor(16, 185, 129); // Emerald-500
      doc.text("VERIFIED AI PASS", 152, 47);

      // Core Performance Metrics Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("CORE PERFORMANCE METRICS", 15, 61);

      // Metric Card 1: Overall Score
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 65, 56, 26, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 65, 56, 26, "D");
      doc.setFillColor(37, 99, 235);
      doc.rect(15, 65, 1.5, 26, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text("OVERALL SCORE", 20, 71);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text("82", 20, 81);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text("/ 100", 28, 81);

      // Metric Card 2: Technical Accuracy
      doc.setFillColor(248, 250, 252);
      doc.rect(77, 65, 56, 26, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(77, 65, 56, 26, "D");
      doc.setFillColor(16, 185, 129);
      doc.rect(77, 65, 1.5, 26, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text("TECHNICAL ACCURACY", 82, 71);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text("88%", 82, 81);

      doc.setFillColor(209, 250, 229);
      doc.rect(111, 75.5, 16, 4.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(6, 95, 70);
      doc.text("TOP 10%", 113.5, 79);

      // Metric Card 3: Communication Style
      doc.setFillColor(248, 250, 252);
      doc.rect(139, 65, 56, 26, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(139, 65, 56, 26, "D");
      doc.setFillColor(107, 114, 128);
      doc.rect(139, 65, 1.5, 26, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text("COMMUNICATION STYLE", 144, 71);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text("75%", 144, 81);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text("Clear, Structural", 144, 86);

      // Performance Timeline Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("VOCAL CLARITY & PERFORMANCE ASSERTION TIMELINE", 15, 100);

      doc.setFillColor(248, 250, 252);
      doc.rect(15, 104, 180, 52, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 104, 180, 52, "D");

      // Gridlines
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.1);
      doc.line(26, 110, 190, 110);
      doc.line(26, 126, 190, 126);
      doc.line(26, 142, 190, 142);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text("100%", 18, 111);
      doc.text("50%", 18, 127);
      doc.text("0%", 18, 143);

      // Recreate Timeline Chart
      const chartHeights = [60, 45, 85, 75, 90, 65, 80, 85, 70, 88];
      doc.setLineWidth(0.3);
      for (let i = 0; i < chartHeights.length; i++) {
        const h = chartHeights[i];
        const barWidth = 11;
        const barGap = 4.5;
        const barX = 28 + i * (barWidth + barGap);
        const barHeight = (h / 100) * 32;
        const barY = 142 - barHeight;

        // Draw helper background track
        doc.setFillColor(241, 245, 249);
        doc.rect(barX, 110, barWidth, 32, "F");

        // Draw primary bar
        doc.setFillColor(37, 99, 235);
        doc.rect(barX, barY, barWidth, barHeight, "F");

        // Top Border Accent
        doc.setFillColor(29, 78, 216);
        doc.rect(barX, barY, barWidth, 0.8, "F");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`M${(i + 1) * 4}`, barX + 1.5, 148);
      }

      // Executive Summary
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 166, 180, 36, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 166, 180, 36, "D");
      doc.setFillColor(37, 99, 235);
      doc.rect(15, 166, 1.5, 36, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text("AI DIAGNOSTIC EXECUTIVE SUMMARY", 21, 172);

      const summaryText = "The candidate demonstrated excellent domain mastery in system architecture and software engineering principles. Speech pacing remained stable and professional, suggesting strong confidence. He excelled at identifying key trade-offs in distributed systems, though database consensus theory was noted as a strong area for further technical refinement prior to final executive review.";
      const lines = doc.splitTextToSize(summaryText, 168);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(lines, 21, 178);

      // Footer Page 1
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.3);
      doc.line(15, 280, 195, 280);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("Page 1 of 2  |  Confidential Candidate Portfolio  |  Powered by AI Assessment Platform", 15, 285);

      // ==================== PAGE 2 ====================
      doc.addPage();

      doc.setFillColor(37, 99, 235);
      doc.rect(15, 15, 3, 14, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text("DETAILED DIAGNOSTIC FEEDBACK", 22, 21);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("TECHNICAL ENTITY COVERAGE & CRITICAL INTERVIEW OBSERVATIONS", 22, 27);

      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 31, 195, 31);

      // Technical Entities
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("TECHNICAL ENTITY COVERAGE", 15, 40);

      const entities = ["Distributed Systems", "ACID", "CAP Theorem", "Consensus", "Rate Limiting", "Caching", "Sharding", "API Design"];
      const colWidth = 41;
      const colGap = 5;
      const rowHeight = 12;

      for (let i = 0; i < entities.length; i++) {
        const colIndex = i % 4;
        const rowIndex = Math.floor(i / 4);
        const itemX = 15 + colIndex * (colWidth + colGap);
        const itemY = 44 + rowIndex * (rowHeight + colGap);

        doc.setFillColor(248, 250, 252);
        doc.rect(itemX, itemY, colWidth, rowHeight, "F");
        doc.setDrawColor(226, 232, 240);
        doc.rect(itemX, itemY, colWidth, rowHeight, "D");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.setTextColor(148, 163, 184);
        doc.text("ENTITY", itemX + 3.5, itemY + 4);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text(entities[i].toUpperCase(), itemX + 3.5, itemY + 9);
      }

      // Observations
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("CRITICAL OBSERVATIONS FEED", 15, 80);

      // Observation 1
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 84, 180, 42, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 84, 180, 42, "D");
      doc.setFillColor(16, 185, 129); // Emerald accent
      doc.rect(15, 84, 1.5, 42, "F");

      doc.setFillColor(15, 23, 42); // dark black bg
      doc.rect(21, 88.5, 26, 4.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(255, 255, 255);
      doc.text("ALGORITHM DESIGN", 22.5, 91.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("TIMESTAMP: 12:45", 51, 91.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(16, 185, 129);
      doc.text("PERFECT", 176, 91.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      const text1 = "Excellent transition from recursive approach to dynamic programming after identifying overlapping subproblems.";
      const lines1 = doc.splitTextToSize(text1, 168);
      doc.text(lines1, 21, 99);

      // AI Callout Ob 1
      doc.setFillColor(239, 246, 255);
      doc.rect(21, 107, 168, 13, "F");
      doc.setDrawColor(191, 219, 254);
      doc.rect(21, 107, 168, 13, "D");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(37, 99, 235);
      doc.text("AI OBSERVATION: Maturity in planning phase ahead of implementation was highly noted.", 24, 115);

      // Observation 2
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 132, 180, 56, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 132, 180, 56, "D");
      doc.setFillColor(245, 158, 11); // Amber Accent
      doc.rect(15, 132, 1.5, 56, "F");

      doc.setFillColor(15, 23, 42);
      doc.rect(21, 136.5, 26, 4.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(255, 255, 255);
      doc.text("DATABASE THEORY", 22.5, 139.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("TIMESTAMP: 28:10", 51, 139.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(245, 158, 11);
      doc.text("NEEDS REVIEW", 166, 139.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      const text2 = "Failed to articulately explain when to prefer eventual consistency over strong consistency for global scale.";
      const lines2 = doc.splitTextToSize(text2, 168);
      doc.text(lines2, 21, 147);

      // Quote snippet
      doc.setFillColor(241, 245, 249);
      doc.rect(21, 154, 168, 11, "F");
      doc.setFont("helvetica", "oblique");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("> \"I'd just use a NoSQL database because it's faster for everything in this case.\"", 24, 161);

      // Training Block
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.8);
      doc.line(21, 169, 21, 182);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text("SUGGESTED TRAINING:", 24, 174);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Review Distributed Transactions and Two-Phase Commit (2PC) patterns.", 24, 179);

      // Platform Sign-off Card
      doc.setFillColor(241, 245, 249);
      doc.rect(15, 196, 180, 32, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 196, 180, 32, "D");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text("CONFIDENTIAL PLATFORM SIGN-OFF", 21, 203);

      const signOffText = "This technical diagnostics profile compiles speech metrics, vocabulary entity mapping, and real-time conceptual feedback powered by the AI Interviewer model. Save this PDF for archival reference during your final stage onboarding preparation.";
      const linesSignOff = doc.splitTextToSize(signOffText, 168);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(linesSignOff, 21, 209);

      // Footer Page 2
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.3);
      doc.line(15, 280, 195, 280);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("Page 2 of 2  |  Confidential Candidate Portfolio  |  Powered by AI Assessment Platform", 15, 285);

      doc.save("Interview_Performance_Summary_88210A.pdf");
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 min-h-screen overflow-hidden">
        <Topbar title="Interview Report" />

        <main className="flex-1 overflow-y-auto pt-24 px-8 pb-12">
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

             {/* Header / Actions Row */}
            <div className="flex justify-between items-end border-b border-border pb-6">
              <div>
                <h1 className="text-2xl font-bold text-text-main tracking-tight uppercase">
                  Performance Summary: {getDifficultyLabel(difficultySetting)} {getFocusLabel(focusSetting)}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-[2px] font-bold uppercase tracking-widest">SESSION #88210A</span>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Completed: Oct 24, 2023</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/room")}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-[11px] font-bold hover:bg-primary-hover transition-all uppercase tracking-widest shadow-md rounded-[4px] active:scale-95 border border-blue-700"
                >
                  <RotateCcw size={16} />
                  Retry Interview
                </button>
                <button
                  disabled={isExporting}
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-6 py-2.5 border border-border rounded-[4px] bg-surface text-[11px] font-bold text-text-main hover:border-primary transition-colors uppercase tracking-widest shadow-sm active:scale-95 disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-primary" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Export PDF
                    </>
                  )}
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 border border-border rounded-[4px] bg-surface text-[11px] font-bold text-text-main hover:border-primary transition-colors uppercase tracking-widest shadow-sm active:scale-95">
                  <Share2 size={16} />
                  Share Data
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
                      {["Distributed Systems", "ACID", "CAP Theorem", "Consensus", "Rate Limiting", "Caching", "Sharding", "API Design"].map((tech, i) => (
                         <div key={i} className="p-3 border border-border rounded-[2px] bg-surface-muted flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Entity</span>
                            <span className="text-xs font-bold text-text-main font-bold uppercase">{tech}</span>
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
                </div>

                <button className="w-full py-4 border border-border rounded-[4px] bg-surface-muted text-[10px] font-bold uppercase tracking-widest text-text-muted hover:bg-surface transition-colors flex items-center justify-center">
                  LOAD MORE FEEDBACK (14 REMAINING)
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
