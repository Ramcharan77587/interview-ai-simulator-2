import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import MobileNav from "../components/MobileNav";
import { Upload, ChevronDown, Rocket, ArrowLeft, CheckSquare, AlertCircle, Loader2, FileText, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import mlService from "../services/mlService";
import interviewService from "../services/interviewService";

export default function Setup() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState(() => localStorage.getItem("interview_difficulty") || "senior");
  const [focus, setFocus] = useState(() => localStorage.getItem("interview_focus") || "technical");
  const [jobDescription, setJobDescription] = useState(() => localStorage.getItem("interview_job_description") || "");
  
  // Resume upload & parsed text states
  const [resumeName, setResumeName] = useState(() => localStorage.getItem("interview_resume_name") || "");
  const [resumeText, setResumeText] = useState(() => localStorage.getItem("interview_resume_text") || "");
  const [parsedSkills, setParsedSkills] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("interview_resume_skills");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isParsing, setIsParsing] = useState(false);
  const [fileError, setFileError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File exceeds 5MB limit. Please upload a smaller document.");
      return;
    }

    // Supported formats check: PDF, plain text, and Markdown
    const fileNameLower = file.name.toLowerCase();
    const isPdf = fileNameLower.endsWith(".pdf");
    const isText = fileNameLower.endsWith(".txt") || fileNameLower.endsWith(".md");

    if (!isPdf && !isText) {
      setFileError("Unsupported format. Currently supported: PDF (.pdf) and plain text (.txt, .md). Word (.docx) is not yet supported.");
      return;
    }

    setIsParsing(true);
    try {
      let extractedText = "";
      let detected: string[] = [];

      if (isText) {
        // Direct browser reading for plain text / Markdown
        extractedText = (await file.text()).trim();
        if (extractedText.length < 20) {
          throw new Error("Text file is too short or empty.");
        }
      } else if (isPdf) {
        // Server / ML PDF text extraction endpoint
        const parseResult = await mlService.parseResume(file);
        if (!parseResult.text || parseResult.text.trim().length < 20) {
          throw new Error("Could not extract readable text from PDF. Ensure it contains selectable text, not scanned images.");
        }
        extractedText = parseResult.text.trim();
        detected = parseResult.detected_skills || [];
      }

      setResumeName(file.name);
      setResumeText(extractedText);
      setParsedSkills(detected);

      localStorage.setItem("interview_resume_name", file.name);
      localStorage.setItem("interview_resume_text", extractedText);
      localStorage.setItem("interview_resume_skills", JSON.stringify(detected));
    } catch (err: any) {
      console.error("Resume parsing error:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to parse resume document.";
      setFileError(msg);
      // Reset text so we never pretend unparsed resumes are analyzed
      setResumeText("");
      setResumeName("");
      localStorage.removeItem("interview_resume_name");
      localStorage.removeItem("interview_resume_text");
      localStorage.removeItem("interview_resume_skills");
    } finally {
      setIsParsing(false);
    }
  };

  const handleClearResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResumeName("");
    setResumeText("");
    setParsedSkills([]);
    setFileError("");
    localStorage.removeItem("interview_resume_name");
    localStorage.removeItem("interview_resume_text");
    localStorage.removeItem("interview_resume_skills");
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

  const handleGenerate = async () => {
    setValidationError("");

    if (!jobDescription.trim()) {
      setValidationError("Please paste a target job description or requirements to calibrate the AI interviewer.");
      return;
    }

    setIsGenerating(true);
    let createdSessionId: string | null = null;

    try {
      // 1. Create real interview session in PostgreSQL via Prisma backend
      try {
        const session = await interviewService.createInterview({
          title: `${getFocusLabel(focus)} Simulation`,
          role: jobDescription.slice(0, 50).trim() || "Software Engineer",
          company: resumeName ? `Resume: ${resumeName}` : "Target Role",
          difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
        });

        if (session?.id) {
          createdSessionId = session.id;
          localStorage.setItem("current_session_id", session.id);
        }
      } catch (sessionErr) {
        console.warn("Could not create remote interview session (unauthenticated or offline):", sessionErr);
      }

      // 2. Call ML matching engine with REAL extracted resume text (if present)
      const matchData = await mlService.matchResume({
        resume_text: resumeText.trim() || "", // Empty if no resume was parsed
        job_description: jobDescription.trim(),
        difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      });

      if (matchData?.questions && matchData.questions.length > 0) {
        localStorage.setItem("interview_questions", JSON.stringify(matchData.questions));
      }
      localStorage.setItem(
        "interview_match_meta",
        JSON.stringify({
          match_score: matchData.match_score,
          matched_skills: matchData.matched_skills,
          missing_skills: matchData.missing_skills,
          is_fallback: Boolean(matchData.is_fallback),
          has_resume: Boolean(resumeText.trim()),
        })
      );
    } catch (err) {
      console.warn("ML matching error, continuing with defaults:", err);
    } finally {
      localStorage.setItem("interview_difficulty", difficulty);
      localStorage.setItem("interview_focus", focus);
      localStorage.setItem("interview_job_description", jobDescription);
      setIsGenerating(false);
      navigate("/room");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-0 md:ml-64 min-h-screen overflow-hidden">
        <MobileNav />
        <div className="hidden md:block">
          <Topbar title="Interview Configuration" />
        </div>
        
        <main className="flex-1 pt-20 md:pt-24 pb-8 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-start overflow-y-auto bg-background">
          <div className="w-full max-w-[800px] mb-3 flex justify-start">
            <button 
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-primary transition-colors uppercase tracking-wider"
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </button>
          </div>

          <div className="w-full max-w-[800px] bg-surface border border-border p-6 sm:p-8 md:p-10 rounded-[4px] shadow-sm">
            <div className="mb-8 border-b border-border pb-6">
              <h2 className="text-xl font-bold tracking-tight text-text-main uppercase">Configure Your Mock Interview</h2>
              <p className="text-[11px] text-text-muted mt-2 uppercase tracking-wider font-bold">Generate a calibrated AI interview environment</p>
            </div>

            {validationError && (
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-[4px] flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}>
              {/* Drag and Drop Zone */}
              <div className="group">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Candidate Resume (Optional)</label>
                  <span className="text-[10px] text-text-muted font-mono uppercase tracking-tight">Supported: .PDF, .TXT, .MD</span>
                </div>

                {isParsing ? (
                  <div className="border border-border bg-background p-8 flex flex-col items-center justify-center text-center h-52 rounded-[4px]">
                    <Loader2 size={32} className="animate-spin text-primary mb-3" />
                    <p className="text-sm font-bold text-text-main uppercase tracking-wider mb-1">Extracting Resume Text</p>
                    <p className="text-xs text-text-muted font-mono">Parsing document content via ML engine...</p>
                  </div>
                ) : resumeName && resumeText ? (
                  <div className="border border-solid border-emerald-500/20 bg-emerald-500/5 transition-all p-6 flex flex-col justify-between h-auto min-h-52 relative rounded-[4px]">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-[4px] flex items-center justify-center text-emerald-500 shrink-0">
                          <CheckSquare size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-main uppercase tracking-tight">Resume Text Extracted Successfully</p>
                          <p className="text-xs font-semibold text-emerald-500 font-mono">{resumeName}</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={handleClearResume}
                        className="text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-wider p-1.5 rounded-[2px] transition-colors flex items-center gap-1 border border-red-500/20 bg-red-500/5"
                        title="Remove resume"
                      >
                        <X size={14} />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="my-4 p-3 bg-background/60 border border-border rounded-[4px]">
                      <div className="flex justify-between text-[10px] font-mono text-text-muted uppercase mb-1">
                        <span>Extracted Content Preview</span>
                        <span>{resumeText.length.toLocaleString()} characters</span>
                      </div>
                      <p className="text-xs text-text-muted font-mono line-clamp-2 italic">"{resumeText.slice(0, 180)}..."</p>
                    </div>

                    {parsedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mr-1">Detected Skills:</span>
                        {parsedSkills.slice(0, 6).map((skill, i) => (
                          <span key={i} className="text-[10px] font-bold uppercase tracking-tight bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-[2px]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border border-dashed border-border hover:border-primary bg-background transition-all p-8 md:p-12 flex flex-col items-center justify-center text-center cursor-pointer h-52 relative rounded-[4px]">
                    <input 
                      accept=".pdf,.txt,.md" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      type="file" 
                      onChange={handleFileUpload}
                    />
                    <Upload className="h-10 w-10 text-text-muted mb-4 group-hover:text-primary transition-colors" />
                    <p className="text-base sm:text-lg font-bold text-text-main mb-1 uppercase tracking-tight">Upload Resume for Skill Gap Analysis</p>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Drag and drop or click to browse (.pdf, .txt, .md up to 5MB)</p>
                  </div>
                )}

                {fileError && (
                  <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />
                    <span>{fileError}</span>
                  </p>
                )}

                {!resumeText && !isParsing && (
                  <p className="mt-2 text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                    * If omitted, questions and calibration will be generated solely from the Job Description below.
                  </p>
                )}
              </div>

              {/* Job Description Row */}
              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-3 flex justify-between uppercase tracking-wider" htmlFor="jd-input">
                  <span>Target Job Description (Required)</span>
                  <span className="font-mono text-[10px] text-text-muted font-normal uppercase tracking-widest">Plain text</span>
                </label>
                <textarea 
                  id="jd-input"
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    if (validationError) setValidationError("");
                  }}
                  className="w-full bg-background border border-border p-4 text-sm text-text-main focus:outline-none focus:border-primary transition-all resize-y min-h-[160px] rounded-[4px] placeholder:text-text-muted font-bold" 
                  placeholder="Paste the target job description, required technical competencies, and responsibilities here to calibrate the AI interviewer..."
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
                  type="submit"
                  disabled={isGenerating || isParsing}
                  className="w-full sm:w-auto bg-primary text-white text-sm font-bold py-3.5 px-10 hover:bg-primary-hover transition-all focus:ring-4 focus:ring-primary/20 outline-none flex items-center justify-center gap-3 active:scale-95 rounded-[4px] shadow-md border border-blue-700 uppercase tracking-widest disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>CALIBRATING ENVIRONMENT...</span>
                    </>
                  ) : (
                    <>
                      <Rocket size={18} />
                      <span>GENERATE INTERVIEW</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
