import React, { useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import MobileNav from "../components/MobileNav";
import { Search, Filter, Bookmark, Clock, BookmarkCheck, ArrowLeft, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";

export default function QuestionBank() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Any");
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);

  const initialQuestions = [
    {
      id: "q1",
      title: "Design a Distributed Rate Limiter",
      description: "Design a highly available rate limiting service that can handle millions of requests per second across a global infrastructure. Focus on algorithms like Token Bucket vs Leaky Bucket.",
      category: "System Design",
      difficulty: "Hard",
      duration: "45 Min",
      bookmarked: false,
    },
    {
      id: "q2",
      title: "Virtual DOM & Reconciliation",
      description: "Explain how React's Virtual DOM works and describe the reconciliation algorithm (Fiber). When does a component re-render, and how can you optimize it using useMemo and useCallback?",
      category: "Frontend React",
      difficulty: "Medium",
      duration: "20 Min",
      bookmarked: false,
    },
    {
      id: "q3",
      title: "Alien Dictionary (Topological Sort)",
      description: "Given a sorted dictionary of an alien language, find the order of characters in the language. You must build a directed graph and perform a topological sort to detect cycles.",
      category: "Algorithms",
      difficulty: "Hard",
      duration: "35 Min",
      bookmarked: false,
    },
    {
      id: "q4",
      title: "Conflict Resolution with Peer",
      description: "Describe a time when you strongly disagreed with a peer on a technical decision. How did you handle the situation, and what was the outcome? Use the STAR method.",
      category: "Behavioral",
      difficulty: "Easy",
      duration: "15 Min",
      bookmarked: true,
    },
    {
      id: "q5",
      title: "Database Sharding & Replication",
      description: "Describe how horizontal database sharding operates under high concurrency. Explain the distinction between sharding keys, range-based partitioning, and consistent hashing.",
      category: "System Design",
      difficulty: "Hard",
      duration: "40 Min",
      bookmarked: false,
    },
    {
      id: "q6",
      title: "Concurrency: Mutex vs Semaphore",
      description: "Explain how mutex locks and semaphores coordinate shared memory threads. How do you prevent deadlocks and resolve the classic dining philosophers problem?",
      category: "Algorithms",
      difficulty: "Medium",
      duration: "25 Min",
      bookmarked: false,
    },
  ];

  const [questions, setQuestions] = useState(initialQuestions);

  const toggleBookmark = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, bookmarked: !q.bookmarked } : q))
    );
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        selectedCategory === "All Categories" ||
        q.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesDifficulty =
        selectedDifficulty === "Any" ||
        selectedDifficulty === "Any Difficulty" ||
        q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      const matchesBookmark = !showOnlyBookmarked || q.bookmarked;

      return matchesSearch && matchesCategory && matchesDifficulty && matchesBookmark;
    });
  }, [questions, searchTerm, selectedCategory, selectedDifficulty, showOnlyBookmarked]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedDifficulty("Any");
    setShowOnlyBookmarked(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-0 md:ml-64 min-h-screen overflow-hidden">
        <MobileNav />
        <div className="hidden md:block">
          <Topbar title="Targeted Question Bank Arena" />
        </div>
        
        <main className="flex-1 overflow-y-auto mt-16 p-4 sm:p-6 md:p-8">
          <div className="max-w-[1440px] mx-auto w-full space-y-6 md:space-y-8">
            <div className="flex justify-start pt-2 md:pt-4">
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
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 p-4 sm:p-6 bg-surface border border-border rounded-[4px] shadow-sm">
                <div className="relative flex-grow max-w-md">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted h-5 w-5" />
                   <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-[4px] font-medium text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:outline-none transition-all" 
                    placeholder="Filter questions by keyword..." 
                   />
                   {searchTerm && (
                     <button
                       onClick={() => setSearchTerm("")}
                       className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted hover:text-text-main"
                     >
                       Clear
                     </button>
                   )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                   <div className="relative">
                      <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="appearance-none bg-background border border-border text-text-main text-[10px] font-bold uppercase tracking-wider py-3 pl-4 pr-10 rounded-[4px] hover:border-primary transition-colors cursor-pointer focus:outline-none"
                      >
                        <option value="All">All Categories</option>
                        <option value="System Design">System Design</option>
                        <option value="Algorithms">Algorithms</option>
                        <option value="Behavioral">Behavioral</option>
                        <option value="Frontend React">Frontend React</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                   </div>
                   <div className="relative">
                      <select 
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="appearance-none bg-background border border-border text-text-main text-[10px] font-bold uppercase tracking-wider py-3 pl-4 pr-10 rounded-[4px] hover:border-primary transition-colors cursor-pointer focus:outline-none"
                      >
                        <option value="Any">Any Difficulty</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                   </div>
                   <button 
                     onClick={() => setShowOnlyBookmarked((prev) => !prev)}
                     className={`flex items-center gap-2 px-4 py-3 border text-[10px] font-bold uppercase tracking-widest rounded-[4px] transition-colors shadow-sm ${
                       showOnlyBookmarked 
                         ? "bg-primary text-white border-blue-700" 
                         : "bg-background border-border text-text-main hover:bg-surface-muted"
                     }`}
                   >
                      <Filter size={14} />
                      <span>{showOnlyBookmarked ? "Bookmarked Only" : "All Items"}</span>
                   </button>
                   {(searchTerm || selectedCategory !== "All" || selectedDifficulty !== "Any" || showOnlyBookmarked) && (
                     <button
                       onClick={resetFilters}
                       className="flex items-center gap-1.5 px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-primary transition-colors"
                       title="Reset all filters"
                     >
                       <RotateCcw size={13} />
                       <span>Reset</span>
                     </button>
                   )}
                </div>
            </div>

            {/* Questions Grid */}
            {filteredQuestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredQuestions.map((q, i) => (
                  <motion.article 
                    key={q.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-surface border border-border rounded-[4px] p-6 sm:p-8 flex flex-col group hover:border-primary transition-all duration-300 relative shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-2 flex-wrap">
                         <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold border uppercase tracking-widest ${
                           q.difficulty === "Hard" ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                           q.difficulty === "Medium" ? "bg-primary/10 text-primary border-primary/20" :
                           "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                         }`}>
                           {q.difficulty}
                         </span>
                         <span className="px-2 py-0.5 rounded-[2px] bg-background text-text-main text-[10px] font-bold border border-border uppercase tracking-widest">
                           {q.category}
                         </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => toggleBookmark(q.id)}
                        className="text-text-muted hover:text-primary transition-colors p-1"
                        title={q.bookmarked ? "Remove bookmark" : "Bookmark question"}
                      >
                        {q.bookmarked ? <BookmarkCheck size={20} className="text-primary fill-current" /> : <Bookmark size={20} />}
                      </button>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-text-main mb-3 uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">{q.title}</h3>
                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-tight mb-8 line-clamp-3 leading-relaxed flex-grow">
                      {q.description}
                    </p>

                    <div className="pt-6 border-t border-border flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-text-main text-[10px] font-bold uppercase tracking-widest">
                         <Clock size={16} />
                         {q.duration}
                      </div>
                      <button 
                        onClick={() => {
                          localStorage.setItem("interview_difficulty", q.difficulty.toLowerCase());
                          localStorage.setItem("interview_focus", q.category.toLowerCase().replace(/\s+/g, '_'));
                          navigate("/setup");
                        }}
                        className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-[4px] transition-all hover:bg-primary-hover shadow-md border border-blue-700 active:scale-95"
                      >
                         Practice Session
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border border-border rounded-[4px] bg-surface space-y-4">
                <Search size={32} className="mx-auto text-text-muted opacity-50" />
                <h3 className="text-base font-bold uppercase tracking-tight text-text-main">
                  No Questions Found
                </h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  No questions matched your search query "{searchTerm}" or active category filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-[4px] hover:bg-primary-hover transition-colors shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            )}
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
