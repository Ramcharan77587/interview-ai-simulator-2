import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Search, Filter, Bookmark, Clock, Play, BookmarkCheck, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";

export default function QuestionBank() {
  const navigate = useNavigate();
  const questions = [
    {
      title: "Design a Distributed Rate Limiter",
      description: "Design a highly available rate limiting service that can handle millions of requests per second across a global infrastructure. Focus on algorithms like Token Bucket vs Leaky Bucket.",
      category: "System Design",
      difficulty: "Hard",
      duration: "45 Min",
      bookmarked: false,
    },
    {
      title: "Virtual DOM & Reconciliation",
      description: "Explain how React's Virtual DOM works and describe the reconciliation algorithm (Fiber). When does a component re-render, and how can you optimize it using useMemo and useCallback?",
      category: "Frontend React",
      difficulty: "Medium",
      duration: "20 Min",
      bookmarked: false,
    },
    {
      title: "Alien Dictionary (Topological Sort)",
      description: "Given a sorted dictionary of an alien language, find the order of characters in the language. You must build a directed graph and perform a topological sort to detect cycles.",
      category: "Algorithms",
      difficulty: "Hard",
      duration: "35 Min",
      bookmarked: false,
    },
    {
      title: "Conflict Resolution with Peer",
      description: "Describe a time when you strongly disagreed with a peer on a technical decision. How did you handle the situation, and what was the outcome? Use the STAR method.",
      category: "Behavioral",
      difficulty: "Easy",
      duration: "15 Min",
      bookmarked: true,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 min-h-screen overflow-hidden">
        <Topbar title="Targeted Question Bank Arena" />
        
        <main className="flex-1 overflow-y-auto mt-16 p-8">
          <div className="max-w-[1440px] mx-auto w-full space-y-8">
            <div className="flex justify-start pt-4">
              <Link 
                to="/dashboard"
                className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-primary transition-colors uppercase tracking-wider"
              >
                <ArrowLeft size={14} />
                Back to Dashboard
              </Link>
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-main mb-1 tracking-tight uppercase">Question Bank Arena</h2>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Filter and select highly specific technical scenarios to practice.</p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 p-6 bg-surface border border-border rounded-[4px] shadow-sm">
                <div className="relative flex-grow max-w-md">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted h-5 w-5" />
                   <input 
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-[4px] font-medium text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:outline-none transition-all" 
                    placeholder="Filter questions by keyword..." 
                   />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                   <div className="relative">
                      <select className="appearance-none bg-background border border-border text-text-main text-[10px] font-bold uppercase tracking-wider py-3 pl-4 pr-10 rounded-[4px] hover:border-primary transition-colors cursor-pointer focus:outline-none">
                        <option>All Categories</option>
                        <option>System Design</option>
                        <option>Algorithms</option>
                        <option>Behavioral</option>
                        <option>Frontend React</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                   </div>
                   <div className="relative">
                      <select className="appearance-none bg-background border border-border text-text-main text-[10px] font-bold uppercase tracking-wider py-3 pl-4 pr-10 rounded-[4px] hover:border-primary transition-colors cursor-pointer focus:outline-none">
                        <option>Any Difficulty</option>
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                   </div>
                   <button className="flex items-center gap-2 px-4 py-3 bg-background border border-border text-text-main text-[10px] font-bold uppercase tracking-widest rounded-[4px] hover:bg-surface-muted transition-colors shadow-sm">
                      <Filter size={14} />
                      More Filters
                   </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {questions.map((q, i) => (
                <motion.article 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-surface border border-border rounded-[4px] p-8 flex flex-col group hover:border-primary transition-all duration-300 relative shadow-sm"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-2 flex-wrap">
                       <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold border uppercase tracking-widest ${
                         q.difficulty === "Hard" ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                         q.difficulty === "Medium" ? "bg-primary/10 text-primary border-primary/20" :
                         "bg-surface-muted text-text-muted border-border"
                       }`}>
                         {q.difficulty}
                       </span>
                       <span className="px-2 py-0.5 rounded-[2px] bg-background text-text-main text-[10px] font-bold border border-border uppercase tracking-widest">
                         {q.category}
                       </span>
                    </div>
                    <button className="text-text-muted hover:text-primary transition-colors">
                      {q.bookmarked ? <BookmarkCheck size={20} className="text-primary fill-current" /> : <Bookmark size={20} />}
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-text-main mb-3 uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">{q.title}</h3>
                  <p className="text-[11px] text-text-muted font-bold uppercase tracking-tight mb-8 line-clamp-3 leading-relaxed flex-grow">
                    {q.description}
                  </p>

                  <div className="pt-6 border-t border-border flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-text-main text-[10px] font-bold uppercase tracking-widest">
                       <Clock size={16} />
                       {q.duration}
                    </div>
                    <button 
                      onClick={() => navigate("/setup")}
                      className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-[4px] transition-all hover:bg-primary-hover shadow-md border border-blue-700 active:scale-95"
                    >
                       Practice Session
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ChevronDown({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
