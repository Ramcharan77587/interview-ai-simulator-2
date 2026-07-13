import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Upload, ChevronDown, Rocket, ArrowLeft, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Setup() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState(() => localStorage.getItem("interview_difficulty") || "senior");
  const [focus, setFocus] = useState(() => localStorage.getItem("interview_focus") || "technical");
  const [jobDescription, setJobDescription] = useState(() => localStorage.getItem("interview_job_description") || "");
  const [resumeName, setResumeName] = useState(() => localStorage.getItem("interview_resume_name") || "");

  const handleGenerate = () => {
    localStorage.setItem("interview_difficulty", difficulty);
    localStorage.setItem("interview_focus", focus);
    localStorage.setItem("interview_job_description", jobDescription);
    localStorage.setItem("interview_resume_name", resumeName);
    navigate("/room");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 min-h-screen overflow-hidden">
        <Topbar title="Main Dashboard" />
        
        <main className="flex-1 pt-24 pb-8 px-8 flex flex-col items-center justify-start overflow-y-auto bg-background">
          <div className="w-full max-w-[800px] mb-2 flex justify-start">
            <button 
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-primary transition-colors uppercase tracking-wider"
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </button>
          </div>
          <div className="w-full max-w-[800px] bg-surface border border-border p-10 rounded-[4px] shadow-sm">
            <div className="mb-8 border-b border-border pb-6">
              <h2 className="text-xl font-bold tracking-tight text-text-main uppercase">Configure Your Mock Interview</h2>
              <p className="text-[11px] text-text-muted mt-2 uppercase tracking-wider font-bold">Generate a tailored AI interview environment</p>
            </div>

            <form className="space-y-8">
              {/* Drag and Drop Zone */}
              <div className="group">
                <label className="block text-[10px] font-bold text-text-muted mb-3 uppercase tracking-wider">Candidate Resume</label>
                {resumeName ? (
                  <div className="border border-solid border-emerald-500/20 hover:border-emerald-500 bg-emerald-500/5 transition-all p-8 flex flex-col items-center justify-center text-center h-52 relative rounded-[4px]">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-[4px] flex items-center justify-center mb-3 text-emerald-500">
                      <CheckSquare size={20} />
                    </div>
                    <p className="text-sm font-bold text-text-main mb-1 uppercase tracking-tight">Resume Loaded Successfully</p>
                    <p className="text-xs font-semibold text-emerald-500 font-mono mb-4">{resumeName}</p>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeName("");
                        localStorage.removeItem("interview_resume_name");
                      }}
                      className="text-[9px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider border border-red-500/20 hover:border-red-500 bg-red-500/5 px-3 py-1.5 rounded-[2px] transition-colors"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-border hover:border-primary bg-background transition-all p-12 flex flex-col items-center justify-center text-center cursor-pointer h-52 relative rounded-[4px]">
                    <input 
                      accept=".pdf,.doc,.docx" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      type="file" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setResumeName(file.name);
                          localStorage.setItem("interview_resume_name", file.name);
                        }
                      }}
                    />
                    <Upload className="h-10 w-10 text-text-muted mb-4 group-hover:text-primary transition-colors" />
                    <p className="text-lg font-bold text-text-main mb-1 uppercase tracking-tight">Drag and drop resume here</p>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">or click to browse (PDF, DOCX up to 5MB)</p>
                  </div>
                )}
              </div>

              {/* Job Description Row */}
              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-3 flex justify-between uppercase tracking-wider" htmlFor="jd-input">
                  <span>Job Description</span>
                  <span className="font-mono text-[10px] text-text-muted font-normal uppercase tracking-widest">Plain text only</span>
                </label>
                <textarea 
                  id="jd-input"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full bg-background border border-border p-4 text-sm text-text-main focus:outline-none focus:border-primary transition-all resize-y min-h-[160px] rounded-[4px] placeholder:text-text-muted font-bold" 
                  placeholder="Paste the complete job description, requirements, and responsibilities here to train the AI interviewer..."
                ></textarea>
              </div>

              {/* Dropdowns Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-3 uppercase tracking-wider" htmlFor="difficulty-select">Difficulty Level</label>
                  <div className="relative">
                    <select 
                      id="difficulty-select"
                      className="w-full appearance-none bg-background border border-border p-3 pr-10 text-sm font-bold text-text-main focus:outline-none focus:border-primary transition-all cursor-pointer rounded-[4px] uppercase tracking-tight"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      <option value="" disabled>Select level...</option>
                      <option value="junior">Junior / Entry Level</option>
                      <option value="mid">Mid-Level</option>
                      <option value="senior">Senior</option>
                      <option value="staff">Staff / Principal</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-3 uppercase tracking-wider" htmlFor="focus-select">Primary Focus Area</label>
                  <div className="relative">
                    <select 
                      id="focus-select"
                      className="w-full appearance-none bg-background border border-border p-3 pr-10 text-sm font-bold text-text-main focus:outline-none focus:border-primary transition-all cursor-pointer rounded-[4px] uppercase tracking-tight"
                      value={focus}
                      onChange={(e) => setFocus(e.target.value)}
                    >
                      <option value="" disabled>Select focus...</option>
                      <option value="technical">Technical Depth</option>
                      <option value="behavioral">Behavioral / Culture Fit</option>
                      <option value="system_design">System Design</option>
                      <option value="general">Comprehensive (Balanced)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8 border-t border-border mt-8 flex justify-end">
                <button 
                  type="button" 
                  onClick={handleGenerate}
                  className="bg-primary text-white text-sm font-bold py-3.5 px-10 hover:bg-primary-hover transition-all focus:ring-4 focus:ring-primary/20 outline-none flex items-center gap-3 active:scale-95 rounded-[4px] shadow-md border border-blue-700 uppercase tracking-widest"
                >
                  <Rocket size={18} />
                  GENERATE INTERVIEW
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
