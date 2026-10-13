import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import MobileNav from "../components/MobileNav";
import {
  CheckCircle2,
  BarChart3,
  Target,
  Play,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import interviewService from "../services/interviewService";
import { InterviewSession } from "../types";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const list = await interviewService.getInterviews();
        setInterviews(list);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const completedCount = interviews.filter(
    (i) => i.status === "COMPLETED" || i.status === "Reviewed"
  ).length;

  const validScores = interviews
    .map((i) => i.overallScore ?? i.technical_score)
    .filter((s): s is number => typeof s === "number" && !isNaN(s));

  const avgScore =
    validScores.length > 0
      ? Math.round(
          validScores.reduce((sum, s) => sum + s, 0) / validScores.length
        )
      : null;

  const metrics = [
    {
      title: "Completed Interviews",
      value: String(interviews.length),
      sub: interviews.length === 0 ? "No sessions recorded" : `${completedCount} finalized`,
      icon: <CheckCircle2 className="text-primary" size={16} />,
      trend: interviews.length > 0 ? "up" : "neutral",
    },
    {
      title: "Avg. Tech Score",
      value: avgScore !== null ? `${avgScore}/100` : "—",
      sub: avgScore !== null ? (avgScore >= 80 ? "Proficient" : "In Progress") : "Pending sessions",
      icon: <BarChart3 className="text-primary" size={16} />,
      trend: avgScore !== null ? "up" : "neutral",
    },
    {
      title: "Upcoming Goal",
      value: "System Design",
      sub: "Calibrated Practice",
      icon: <Target className="text-primary" size={16} />,
      progress: 65,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64 min-h-screen overflow-hidden">
        {/* Mobile Navigation Header & Drawer */}
        <MobileNav />

        {/* Desktop Topbar */}
        <div className="hidden md:block">
          <Topbar title="Main Dashboard" />
        </div>

        <main className="flex-1 overflow-y-auto mt-16 p-4 sm:p-6 md:p-8">
          <div className="max-w-[1440px] mx-auto space-y-6 pb-12">
            {/* Welcome Section */}
            <div className="mb-2">
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                Welcome back,{" "}
                <span className="text-primary">{user?.name || "User"}</span>
              </p>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metrics.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 border border-border rounded-[4px] bg-surface hover:border-primary transition-colors cursor-default shadow-sm"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      {m.title}
                    </h3>
                    <div className="text-primary opacity-50">{m.icon}</div>
                  </div>

                  <div className="mt-auto">
                    {m.progress !== undefined ? (
                      <div>
                        <p className="text-3xl font-bold text-text-main">
                          {m.value}
                        </p>
                        <div className="w-full bg-surface-muted h-1 rounded-full overflow-hidden mt-3 border border-border">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${m.progress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="bg-primary h-full"
                          />
                        </div>
                        <p className="text-[10px] font-bold text-primary mt-2 uppercase tracking-tight">
                          {m.sub}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="text-3xl font-bold text-text-main">
                          {m.value}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-tight ${
                            m.trend === "up"
                              ? "text-green-600"
                              : "text-primary"
                          }`}
                        >
                          {m.sub}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Recent Interviews */}
              <div className="lg:col-span-8 border border-border rounded-[4px] bg-surface overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-surface-muted flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-tight text-text-main">
                    Recent Interview Sessions
                  </h2>

                  <button
                    onClick={() => navigate("/questions")}
                    className="text-[11px] text-primary font-bold hover:underline uppercase flex items-center gap-1"
                  >
                    <span>View All History</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                <div className="overflow-x-auto text-text-main">
                  <table className="w-full text-left">
                    <thead className="bg-surface-muted border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-[11px] font-bold text-text-muted uppercase">
                          Target Role / Topic
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold text-text-muted uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold text-text-muted uppercase">
                          Tech Score
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold text-text-muted uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {interviews.length > 0 ? (
                        interviews.map((interview, index) => (
                          <tr
                            key={interview.id || index}
                            onClick={() => navigate("/report")}
                            className="hover:bg-surface-muted transition-colors group cursor-pointer"
                            title="Click to view full performance diagnostics"
                          >
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors">
                                {interview.role ||
                                  interview.title ||
                                  "Interview Session"}
                              </div>
                              <div className="text-[10px] text-text-muted font-bold uppercase tracking-tight">
                                {interview.topic ||
                                  interview.company ||
                                  "General System Depth"}
                              </div>
                            </td>

                            <td className="px-6 py-4 text-sm text-text-muted font-mono">
                              {interview.date || interview.startedAt
                                ? new Date(
                                    interview.date || interview.startedAt
                                  ).toLocaleDateString()
                                : "Today"}
                            </td>

                            <td className="px-6 py-4 font-mono text-sm font-bold text-text-main">
                              {typeof (interview.overallScore ?? interview.technical_score) === "number"
                                ? `${Math.round(interview.overallScore ?? interview.technical_score!)}/100`
                                : "Pending"}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 text-[10px] font-bold rounded-[4px] border uppercase tracking-tighter ${
                                  interview.status === "Reviewed" ||
                                  interview.status === "COMPLETED"
                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                    : "bg-primary/10 text-primary border-primary/20"
                                }`}
                              >
                                {interview.status || "Completed"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                              <Target className="text-text-muted mb-3" size={28} />
                              <p className="text-sm font-bold text-text-main uppercase tracking-tight mb-1">
                                No Recorded Interviews Yet
                              </p>
                              <p className="text-xs text-text-muted font-medium mb-4">
                                Complete your first mock interview simulation to populate real session diagnostics.
                              </p>
                              <button
                                onClick={() => navigate("/setup")}
                                className="px-4 py-2 bg-primary text-white text-[11px] font-bold uppercase tracking-wider rounded-[4px] hover:bg-primary-hover transition-colors shadow-sm"
                              >
                                Start First Interview
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Sidebar */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Primary CTA */}
                <div className="bg-primary text-white p-6 rounded-[4px] border border-blue-700 shadow-lg flex flex-col relative overflow-hidden group">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />

                  <h3 className="text-lg font-bold mb-2 uppercase tracking-tight">
                    System Design Practice
                  </h3>

                  <p className="text-[11px] text-white/80 mb-6 leading-relaxed font-bold uppercase tracking-tight">
                    Focus on scalability patterns to improve your backend architect readiness score.
                  </p>

                  <Link
                    to="/setup"
                    className="bg-white text-primary text-[11px] font-bold px-4 py-3 rounded-[4px] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 active:scale-95 border border-white"
                  >
                    <Play size={14} fill="currentColor" />
                    RESUME STUDY PLAN
                  </Link>
                </div>

                {/* Suggested Practice */}
                <div className="border border-border rounded-[4px] p-6 bg-surface shadow-sm flex flex-col flex-1">
                  <h3 className="text-xs font-bold uppercase mb-4 tracking-wider flex items-center gap-2 text-text-main">
                    <div className="w-1 h-3 bg-primary" />
                    Suggested Practice
                  </h3>

                  <ul className="space-y-3">
                    <li
                      onClick={() => navigate("/setup")}
                      className="p-3 bg-surface-muted border border-border rounded-[4px] flex flex-col gap-1 cursor-pointer hover:border-primary transition-colors group"
                      title="Click to start this scenario"
                    >
                      <p className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors uppercase tracking-tight">
                        Microservices Communication
                      </p>

                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-text-muted">
                          FAILED RECENTLY
                        </span>
                        <span className="text-[11px] font-bold text-primary px-2 py-0.5 border border-primary rounded-[2px] bg-background">
                          HARD
                        </span>
                      </div>
                    </li>

                    <li
                      onClick={() => navigate("/setup")}
                      className="p-3 bg-surface-muted border border-border rounded-[4px] flex flex-col gap-1 cursor-pointer hover:border-primary transition-colors group"
                      title="Click to start this scenario"
                    >
                      <p className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors uppercase tracking-tight">
                        Time Complexity Mastery
                      </p>

                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-text-muted">
                          NEEDS REVIEW
                        </span>
                        <span className="text-[11px] font-bold text-text-main px-2 py-0.5 border border-text-main rounded-[2px] bg-background">
                          EASY
                        </span>
                      </div>
                    </li>
                  </ul>

                  <div className="mt-auto pt-4 border-t border-border flex justify-end">
                    <Link
                      to="/report"
                      className="text-[11px] font-bold text-primary hover:underline uppercase tracking-wider"
                    >
                      View Detailed Feedback
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}