import React, { useState, useEffect, useRef } from "react";
import { Terminal, Timer, PhoneOff, Wifi, Monitor, Mic, Bot, CheckSquare, Square, MicOff, Camera, CameraOff, Play, Pause, Keyboard, Volume2, VolumeX, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

export default function InterviewRoom() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const [isEnded, setIsEnded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isComputingAnalysis, setIsComputingAnalysis] = useState(false);

  // Configuration Settings (read from localStorage)
  const [difficultySetting] = useState(() => localStorage.getItem("interview_difficulty") || "senior");
  const [focusSetting] = useState(() => localStorage.getItem("interview_focus") || "technical");

  const getFocusLabel = (f: string) => {
    switch (f) {
      case "technical": return "Technical Depth";
      case "behavioral": return "Behavioral & Culture";
      case "system_design": return "System Design";
      case "general": return "Comprehensive";
      default: return f || "Technical Depth";
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

  const setupCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
      setIsMicOn(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera access denied or device not found. Please check permissions.");
    }
  };

  useEffect(() => {
    setupCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const [analysisFeedback, setAnalysisFeedback] = useState<{
    confidence: number;
    pacing: string;
    entities: string[];
    summary: string;
  } | null>(null);

  const interviewQuestions = [
    {
      num: "01",
      prompt: "How do you explain the process of memory allocation in physical RAM vs virtual memory systems?",
      concepts: ["Virtual Memory", "Paging"],
    },
    {
      num: "02",
      prompt: "What are the common thread synchronization mechanisms and how do they avoid race conditions?",
      concepts: ["Mutex", "Semaphores"],
    },
    {
      num: "03",
      prompt: "How does asynchronous programming achieve concurrency without spawning additional OS-level threads?",
      concepts: ["Event Loop", "Non-blocking I/O"],
    },
    {
      num: "04",
      prompt: "Can you explain the difference between multithreading and multiprocessing?",
      concepts: ["Core Concept", "Python GIL"],
    },
    {
      num: "05",
      prompt: "How do you handle Deadlocks in high-frequency concurrent architectures? What is mutual exclusion?",
      concepts: ["Deadlock Prevention", "Coffman Conditions"],
    },
    {
      num: "06",
      prompt: "Can you detail how a sliding window log algorithm works for a high-performance Rate Limiter?",
      concepts: ["Sliding Window", "Rate Limiting"],
    },
    {
      num: "07",
      prompt: "What are the engineering trade-offs of using key-value NoSQL stores like Redis versus relational databases?",
      concepts: ["In-Memory Speed", "Snapshotting vs AOF"],
    },
    {
      num: "08",
      prompt: "Describe how database sharding works and how it contrasts with horizontal database replication.",
      concepts: ["Sharding Key", "Cross-shard Joins"],
    },
    {
      num: "09",
      prompt: "What is the CAP Theorem and how does it apply to globally distributed database systems?",
      concepts: ["CAP Theorem", "Network Partition"],
    },
    {
      num: "10",
      prompt: "What are REST API best practices for handling versioning and idempotency keys?",
      concepts: ["Idempotency", "API Design"],
    },
    {
      num: "11",
      prompt: "Can you detail the token bucket rate limiter logic and how it handles traffic burstiness?",
      concepts: ["Token Bucket", "Leak Rate"],
    },
    {
      num: "12",
      prompt: "What are the common scaling bottlenecks of standard monolithic databases when experiencing 100k concurrent connections?",
      concepts: ["Monolith Scaling", "Connection Pools"],
    }
  ];

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(3); // Start at index 3 (Question 4)
  const totalSessionTime = 900; // 15:00 minutes total
  const [timeRemaining, setTimeRemaining] = useState(872); // 14:32 remaining
  const [timeElapsed, setTimeElapsed] = useState(28); // 28 seconds elapsed
  const [transcript, setTranscript] = useState([
    "\"Well, to start, multithreading refers to multiple threads executing concurrently within a single process, sharing the same memory space. Multiprocessing, on the other hand, involves completely separate processes...\""
  ]);

  const [questionEntities, setQuestionEntities] = useState<{ [key: number]: { name: string; checked: boolean }[] }>({
    0: [
      { name: "Virtual Address Space", checked: true },
      { name: "Page Tables", checked: true },
      { name: "Translation Lookaside Buffer (TLB)", checked: false }
    ],
    1: [
      { name: "Mutex Locks", checked: true },
      { name: "Semaphore limits", checked: false },
      { name: "Atomic compare-and-swap", checked: false }
    ],
    2: [
      { name: "Event Loop mechanism", checked: true },
      { name: "Async/Await yield", checked: true },
      { name: "Single-threaded event execution", checked: false }
    ],
    3: [
      { name: "Shared Memory Space", checked: true },
      { name: "Concurrency vs Parallelism", checked: true },
      { name: "Global Interpreter Lock", checked: false }
    ],
    4: [
      { name: "Mutual Exclusion condition", checked: false },
      { name: "Hold and Wait rules", checked: false },
      { name: "Circular Wait avoidance", checked: false }
    ],
    5: [
      { name: "Sliding Window Log", checked: false },
      { name: "Memory Footprint", checked: false },
      { name: "Sorted Sets / Redis ZADD", checked: false }
    ],
    6: [
      { name: "In-memory speed", checked: false },
      { name: "Snapshotting vs AOF", checked: false },
      { name: "Schema flexibility", checked: false }
    ],
    7: [
      { name: "Shard Key distribution", checked: false },
      { name: "Replication Lag", checked: false },
      { name: "Cross-shard joins", checked: false }
    ],
    8: [
      { name: "Network Partition", checked: false },
      { name: "PACELC Theorem", checked: false },
      { name: "Strict Consistency", checked: false }
    ],
    9: [
      { name: "Idempotency Keys", checked: false },
      { name: "HTTP Status Codes", checked: false },
      { name: "HATEOAS compliance", checked: false }
    ],
    10: [
      { name: "Token Leak Rate", checked: false },
      { name: "Atomic decrement", checked: false },
      { name: "Burst capacity", checked: false }
    ],
    11: [
      { name: "Stateless architecture", checked: false },
      { name: "Load balancer routing", checked: false },
      { name: "Sticky sessions", checked: false }
    ]
  });

  const toggleEntity = (idx: number) => {
    setQuestionEntities(prev => {
      const currentList = prev[currentQuestionIdx] || [];
      const updatedList = currentList.map((item, i) => i === idx ? { ...item, checked: !item.checked } : item);
      return { ...prev, [currentQuestionIdx]: updatedList };
    });
  };

  // Voice AI States & Refs
  const [isVoiceAgentEnabled, setIsVoiceAgentEnabled] = useState(true);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoReadQuestions, setAutoReadQuestions] = useState(true);
  const [aiFeedbackText, setAiFeedbackText] = useState("");

  const recognitionRef = useRef<any>(null);
  const currentQuestionIdxRef = useRef(currentQuestionIdx);
  const questionEntitiesRef = useRef(questionEntities);

  useEffect(() => {
    currentQuestionIdxRef.current = currentQuestionIdx;
  }, [currentQuestionIdx]);

  useEffect(() => {
    questionEntitiesRef.current = questionEntities;
  }, [questionEntities]);

  const speakInterviewerText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    
    // Stop recognition while speaking to prevent AI from hearing itself
    const wasListening = isListening;
    if (wasListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes("en-US") && v.name.includes("Google")) || 
                            voices.find(v => v.lang.includes("en-US")) || 
                            voices.find(v => v.lang.startsWith("en"));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (wasListening && isMicOn && !isPaused && !isEnded) {
        startListening();
      }
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (wasListening && isMicOn && !isPaused && !isEnded) {
        startListening();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.warn("Recognition start warning:", err);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.warn("Recognition stop warning:", err);
    }
  };

  const generateVoiceFeedback = () => {
    const qIdx = currentQuestionIdxRef.current;
    const currentList = questionEntities[qIdx] || [];
    const checked = currentList.filter(item => item.checked).map(item => item.name);
    const unchecked = currentList.filter(item => !item.checked).map(item => item.name);

    let feedback = "";
    if (checked.length === currentList.length && currentList.length > 0) {
      feedback = `Excellent performance! You successfully discussed all expected technical entities, including: ${checked.join(", ")}. Perfect answers!`;
    } else if (checked.length > 0) {
      feedback = `Great mention of ${checked.join(" and ")}. To elevate your explanation, you should also cover: ${unchecked.join(" or ")}.`;
    } else {
      feedback = `Good start. I encourage you to expand on key industry concepts such as: ${unchecked.join(", ")} to deliver a fully structured explanation.`;
    }

    setAiFeedbackText(feedback);
    speakInterviewerText(feedback);
  };

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
      };

      rec.onresult = (event: any) => {
        if (isPaused || isEnded) return;

        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => {
            const currentText = prev[0] || "";
            if (currentText.startsWith("\"Well, to start") || currentText === "") {
              return [finalTranscript.trim()];
            }
            return [currentText.trim() + " " + finalTranscript.trim()];
          });

          // Fuzzy search to check off expected entities in real-time
          const spokenLower = finalTranscript.toLowerCase();
          const qIdx = currentQuestionIdxRef.current;
          
          setQuestionEntities(prev => {
            const currentList = prev[qIdx] || [];
            let updated = false;
            const updatedList = currentList.map(item => {
              const nameLower = item.name.toLowerCase();
              const words = nameLower.split(/\s+/).filter(w => w.length > 3);
              const isMatch = words.some(word => spokenLower.includes(word)) || spokenLower.includes(nameLower);
              if (isMatch && !item.checked) {
                updated = true;
                return { ...item, checked: true };
              }
              return item;
            });

            if (updated) {
              return { ...prev, [qIdx]: updatedList };
            }
            return prev;
          });
        }
      };

      recognitionRef.current = rec;
    } else {
      setIsSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isPaused, isEnded]);

  // Synchronize SpeechRecognition with mic, pause, voice enabled states
  useEffect(() => {
    if (!isSpeechSupported || !recognitionRef.current) return;

    if (isMicOn && isVoiceAgentEnabled && !isPaused && !isEnded && !isSpeaking) {
      startListening();
    } else {
      stopListening();
    }
  }, [isMicOn, isVoiceAgentEnabled, isPaused, isEnded, isSpeaking, isSpeechSupported]);

  // Read questions aloud automatically on question shift
  useEffect(() => {
    if (autoReadQuestions && !isEnded && !isPaused) {
      const q = interviewQuestions[currentQuestionIdx];
      const readText = `Question ${q.num}. ${q.prompt}`;
      const timer = setTimeout(() => {
        speakInterviewerText(readText);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIdx]);

  // Reset/Clear feedback and text transcript on question shift
  useEffect(() => {
    if (currentQuestionIdx !== 3) {
      setTranscript([""]);
      setAiFeedbackText("");
    }
  }, [currentQuestionIdx]);

  useEffect(() => {
    if (isEnded) {
       if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
       }
       return;
    }
    if (isPaused) {
       return;
    }
    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
      setTimeElapsed(prev => (prev < totalSessionTime ? prev + 1 : totalSessionTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [isEnded, isPaused]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEnded) return;

      // Avoid intercepting if typing in inputs or editable elements
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" ||
         document.activeElement.tagName === "TEXTAREA" ||
         document.activeElement.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setIsPaused(prev => !prev);
      } else if (e.code === "Enter") {
        e.preventDefault();
        setCurrentQuestionIdx(prev => {
          if (prev < interviewQuestions.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        setCurrentQuestionIdx(prev => {
          if (prev < interviewQuestions.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        setCurrentQuestionIdx(prev => {
          if (prev > 0) {
            return prev - 1;
          }
          return prev;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEnded, interviewQuestions.length]);

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const handleEndSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsEnded(true);
  };

  const triggerAnalysis = async () => {
    setIsComputingAnalysis(true);
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcript[0] })
      });
      
      if (!response.ok) throw new Error("Analysis failed");
      
      const data = await response.json();
      
      // Artificial delay for UI feel
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAnalysisFeedback(data);
    } catch (err) {
      console.error(err);
      // Fallback
      setAnalysisFeedback({
         confidence: 0,
         pacing: "ERROR",
         entities: ["Analysis Interrupted"],
         summary: "Connection lost during telemetry processing."
      });
    } finally {
      setIsComputingAnalysis(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-background text-text-main font-sans h-screen flex flex-col overflow-hidden antialiased relative">
      <AnimatePresence>
        {showExitModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-surface border border-border p-8 rounded-[4px] shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-[4px] bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 text-red-500">
                <PhoneOff size={22} />
              </div>
              
              <h3 className="text-lg font-bold uppercase tracking-tight text-text-main mb-2">
                Exit Interview Room?
              </h3>
              
              <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-6 max-w-xs leading-relaxed">
                Are you sure you want to exit the session? Your unsaved response progress and active audio transcripts will be cleared.
              </p>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="py-3 bg-surface border border-border hover:border-text-muted text-text-muted hover:text-text-main text-[10px] font-bold uppercase tracking-wider rounded-[4px] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (streamRef.current) {
                      streamRef.current.getTracks().forEach(track => track.stop());
                    }
                    if ("speechSynthesis" in window) {
                      window.speechSynthesis.cancel();
                    }
                    navigate("/dashboard");
                  }}
                  className="py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-[4px] transition-all"
                >
                  Confirm Exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isEnded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-xl bg-surface border border-border p-10 rounded-[4px] shadow-2xl flex flex-col items-center text-center"
            >
              {!analysisFeedback ? (
                <>
                  <div className={`w-16 h-16 rounded-[4px] flex items-center justify-center mb-6 border border-blue-700 shadow-lg ${isComputingAnalysis ? 'bg-primary animate-pulse' : 'bg-primary'}`}>
                    <Bot size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold uppercase tracking-tight text-text-main mb-3">Session Completed</h2>
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-10 max-w-sm leading-relaxed">
                    Recording sequence finalized. Trigger AI analysis to process technical entities and speech telemetry.
                  </p>
                  <button 
                    onClick={triggerAnalysis}
                    disabled={isComputingAnalysis}
                    className="w-full py-4 bg-primary text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-[4px] hover:bg-primary-hover transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isComputingAnalysis ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                          <Bot size={16} />
                        </motion.div>
                        PROCESSING TELEMETRY...
                      </>
                    ) : (
                      <>
                        <Monitor size={16} />
                        RUN SYSTEM ANALYSIS
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="w-full text-left">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                    <h3 className="text-sm font-bold uppercase tracking-tight text-text-main">Preliminary AI Assessment</h3>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-green-500"></span>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Analysis Ready</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-surface-muted border border-border rounded-[2px]">
                       <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1">Confidence Score</span>
                       <span className="text-2xl font-bold text-text-main">{analysisFeedback.confidence}%</span>
                    </div>
                    <div className="p-4 bg-surface-muted border border-border rounded-[2px]">
                       <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1">Vocal Pacing</span>
                       <span className="text-sm font-bold text-primary uppercase tracking-tight">{analysisFeedback.pacing}</span>
                    </div>
                  </div>

                  <div className="mb-8">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-3">Key Concepts Detected</span>
                     <div className="flex flex-wrap gap-2">
                        {analysisFeedback.entities.map((e, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-tight rounded-[2px]">
                            {e}
                          </span>
                        ))}
                     </div>
                  </div>

                  <div className="p-4 bg-surface-muted border-l-2 border-primary mb-10">
                     <p className="text-[11px] text-text-main font-medium leading-relaxed uppercase tracking-tight italic">
                       "{analysisFeedback.summary}"
                     </p>
                  </div>

                  <button 
                    onClick={() => navigate("/report")}
                    className="w-full py-4 bg-primary text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-[4px] hover:bg-primary-hover transition-all shadow-md active:scale-[0.98]"
                  >
                    View Comprehensive Report
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Header */}
      <header className="flex justify-between items-center h-16 px-6 border-b border-border bg-background shrink-0 z-50 transition-colors duration-200">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-[4px] bg-primary flex items-center justify-center border border-blue-700 shadow-sm">
            <Terminal className="text-white h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-sm text-text-main uppercase tracking-tight leading-none">
              {getFocusLabel(focusSetting)} Interview
            </h1>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
              Difficulty: {getDifficultyLabel(difficultySetting)} • Session ID: #82910
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Pause / Play Button */}
          <button
            type="button"
            onClick={() => setIsPaused(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border transition-all text-[10px] font-bold font-mono uppercase tracking-widest ${
              isPaused 
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20 animate-pulse" 
                : "bg-surface border-border hover:border-primary text-text-muted hover:text-text-main"
            }`}
            title="Press Space to Pause/Resume"
          >
            {isPaused ? <Play size={12} className="fill-amber-500" /> : <Pause size={12} />}
            <span>{isPaused ? "RESUME" : "PAUSE"}</span>
          </button>

          {/* Shortcuts Legend */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface/50 rounded-[4px] border border-border text-[9px] font-bold text-text-muted font-mono uppercase tracking-wider">
            <Keyboard size={12} />
            <span>[Space] Pause • [Enter] Skip</span>
          </div>

          <div className="flex items-center gap-4 px-4 py-1.5 bg-surface rounded-[4px] border border-border">
            <Timer className={`${isPaused ? "text-amber-500 animate-pulse" : "text-text-muted"} h-5 w-5`} />
            <span className={`font-mono text-2xl font-bold tracking-tight tabular-nums ${isPaused ? "text-amber-500" : "text-text-main"}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            type="button"
            onClick={() => {
              setShowExitModal(true);
            }}
            className="border border-border bg-surface text-text-muted hover:text-text-main px-4 py-2 rounded-[4px] font-bold text-xs hover:border-primary transition-colors flex items-center gap-2 uppercase tracking-widest active:scale-95"
          >
            <span>Exit Room</span>
          </button>
          <button 
            onClick={handleEndSession}
            className="bg-text-main text-background px-4 py-2 rounded-[4px] font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-2 border border-text-main uppercase tracking-widest active:scale-95"
          >
            <PhoneOff size={16} />
            <span>END SESSION</span>
          </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 overflow-y-auto bg-surface-muted p-6 flex justify-center">
        <div className="w-full max-w-[1440px] grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-10">
          
          {/* Left Column: Webcam (8 cols) */}
          <div className="lg:col-span-8 flex flex-col h-full min-h-[500px]">
            <div className="relative flex-1 bg-gray-900 border border-primary rounded-[4px] overflow-hidden flex flex-col justify-end shadow-sm">
              {/* Candidate Feed */}
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 p-6 text-center z-10 transition-colors duration-200">
                  <CameraOff className="text-text-muted mb-4" size={48} />
                  <p className="text-xs font-bold text-white uppercase tracking-widest max-w-xs">{cameraError}</p>
                  <div className="flex gap-4 mt-6">
                    <button 
                      onClick={setupCamera}
                      className="px-6 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-[2px] hover:bg-primary-hover transition-colors shadow-lg active:scale-95"
                    >
                      RETRY CAMERA
                    </button>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-6 py-3 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-[2px] hover:bg-white/20 transition-colors border border-white/20"
                    >
                      RELOAD PAGE
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 scale-x-[-1] ${isCameraOn ? 'opacity-100' : 'opacity-0'} ${isPaused ? 'filter blur-[8px] opacity-40' : ''}`}
                  />
                  {!isCameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
                      <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border border-primary">
                        <Bot size={48} className="text-primary" />
                      </div>
                    </div>
                  )}
                  {isPaused && (
                    <div className="absolute inset-0 z-20 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 transition-all">
                      <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mb-4 text-amber-500 shadow-xl animate-pulse">
                        <Pause size={30} className="fill-amber-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-2">Interview Session Paused</h3>
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 border border-amber-500/20 rounded-[2px] mb-6 font-mono">
                        AUDIO FEED & DIAGNOSTICS SUSPENDED
                      </p>
                      <span className="text-[11px] text-text-muted font-bold uppercase tracking-widest font-mono flex items-center gap-1">
                        Press <span className="bg-surface-muted text-text-main border border-border px-2 py-0.5 rounded-[3px] text-xs font-mono font-bold shadow-sm">Space</span> or click Resume to continue
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Camera/Mic Controls Overlay */}
              <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-4 z-30">
                <button 
                  onClick={toggleMic}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20' : 'bg-red-600 border border-red-700 text-white'}`}
                >
                  {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                <button 
                  onClick={toggleCamera}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCameraOn ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20' : 'bg-red-600 border border-red-700 text-white'}`}
                >
                  {isCameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
                </button>
              </div>
              
              {/* Floating Pills */}
              <div className="absolute top-6 left-6 flex gap-3 z-20">
                <div className="bg-red-600 text-white px-3 py-1 rounded-[2px] flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-red-700 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> REC
                </div>
                <div className="bg-surface text-text-main px-3 py-1 rounded-[2px] flex items-center gap-2 text-[10px] font-bold border border-border uppercase tracking-widest shadow-sm">
                  <Wifi size={14} /> 98MS
                </div>
              </div>

              {/* Live Transcript Overlay */}
              <div className="relative z-10 bg-surface border-t border-border p-6 flex flex-col gap-4 shadow-lg transition-colors duration-200">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <span className="text-[10px] font-bold text-text-muted flex items-center gap-2 uppercase tracking-widest font-mono">
                    <Monitor size={14} /> Live Technical Transcript
                  </span>
                  {/* Waveform Mockup */}
                  <div className="flex items-center gap-[2px] h-3">
                    {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((i, idx) => (
                      <div 
                        key={idx}
                        className="w-[2px] bg-primary rounded-sm h-full"
                        style={{ height: `${i * 10}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="max-h-20 overflow-y-auto">
                  <p className="text-sm font-semibold text-text-main leading-relaxed italic">
                    {transcript}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Analytics (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full">
            {/* Session Progress Card */}
            <div className="bg-background border border-border rounded-[4px] p-6 flex flex-col gap-5 shadow-sm transition-colors duration-200">
               <div className="flex items-center justify-between border-b border-border pb-3">
                 <span className="text-[10px] font-bold text-text-main uppercase tracking-widest font-mono flex items-center gap-2">
                   <Timer className={isPaused ? "text-amber-500 animate-pulse" : "text-primary"} size={14} /> Active Session Diagnostics
                 </span>
                 <div className="flex items-center gap-1.5">
                   <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-amber-500 animate-ping" : "bg-emerald-500 animate-pulse"}`}></span>
                   <span className={`text-[9px] font-bold uppercase tracking-wider font-mono ${isPaused ? "text-amber-500" : "text-emerald-500"}`}>
                     {isPaused ? "SUSPENDED" : "LIVE EVALUATION"}
                   </span>
                 </div>
               </div>

               {/* Question Progress Bar */}
               <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-end">
                   <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest font-mono">Question Progress</span>
                   <span className="text-[10px] font-bold text-text-main font-mono">
                     {interviewQuestions.length - (currentQuestionIdx + 1)} REMAINING ({currentQuestionIdx + 1}/{interviewQuestions.length})
                   </span>
                 </div>
                 <div className="w-full bg-surface-muted h-2.5 border border-border rounded-full overflow-hidden p-[2px]">
                   <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestionIdx + 1) / interviewQuestions.length) * 100}%` }}
                      className="bg-primary h-full rounded-full border-r border-blue-700 shadow-[0_0_8px_rgba(37,99,235,0.4)] transition-all duration-300"
                   />
                 </div>
                 <div className="flex justify-between text-[8px] text-text-muted font-bold uppercase tracking-wider font-mono">
                   <span>START</span>
                   <span>COMPLETION: {Math.round(((currentQuestionIdx + 1) / interviewQuestions.length) * 100)}%</span>
                 </div>
               </div>

               {/* Time Elapsed Progress Bar */}
               <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-end">
                   <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest font-mono">Time Elapsed Tracker</span>
                   <span className="text-[10px] font-bold text-text-main font-mono">
                     {formatTime(timeElapsed)} ELAPSED / {formatTime(totalSessionTime)} TOTAL
                   </span>
                 </div>
                 <div className="w-full bg-surface-muted h-2.5 border border-border rounded-full overflow-hidden p-[2px]">
                   <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((timeElapsed / totalSessionTime) * 100, 100)}%` }}
                      className="bg-emerald-500 h-full rounded-full border-r border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all duration-300"
                   />
                 </div>
                 <div className="flex justify-between text-[8px] text-text-muted font-bold uppercase tracking-wider font-mono">
                   <span>TIME ELAPSED: {formatTime(timeElapsed)}</span>
                   <span>TIME REMAINING: {formatTime(timeRemaining)}</span>
                 </div>
               </div>
            </div>

            {/* AI Interviewer Card */}
            <div className="bg-background border border-border rounded-[4px] p-6 flex flex-col gap-6 shadow-sm overflow-hidden">
               <div className="flex items-center justify-between border-b border-border pb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-[4px] bg-primary text-white flex items-center justify-center border border-blue-700">
                     <Bot size={24} />
                   </div>
                   <div>
                     <div className="text-xs font-bold text-text-main uppercase tracking-tight">System Node Alpha</div>
                     <div className="text-[9px] font-mono text-primary flex items-center gap-1 font-bold uppercase tracking-widest">
                        ANALYZING INPUT...
                     </div>
                   </div>
                 </div>
                 <div className="px-2 py-1 bg-surface text-text-muted rounded-[2px] border border-border text-[9px] font-bold uppercase tracking-widest">
                   Q. {interviewQuestions[currentQuestionIdx].num} / {interviewQuestions.length.toString().padStart(2, '0')}
                 </div>
               </div>

               <div>
                 <div className="text-[9px] font-bold text-text-muted mb-2 uppercase tracking-widest font-mono">Current Prompt</div>

                  {/* Voice Agent Companion Controls */}
                  <div className="border-t border-b border-border py-4 my-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="text-primary" size={14} />
                        <span className="text-[10px] font-bold text-text-main uppercase tracking-widest font-mono">
                          AI Voice Agent Node
                        </span>
                      </div>
                      {!isSpeechSupported ? (
                        <span className="text-[8px] font-bold text-red-500 uppercase tracking-wider bg-red-500/10 px-1.5 py-0.5 rounded-[2px] border border-red-500/20">
                          Not Supported in Browser
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${isListening ? "bg-red-500 animate-pulse" : "bg-text-muted"}`} />
                          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider font-mono">
                            {isListening ? "Listening" : "Idle"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Toggle listening mode */}
                      <button
                        type="button"
                        onClick={() => setIsVoiceAgentEnabled(prev => !prev)}
                        disabled={!isSpeechSupported}
                        className={`py-1.5 px-3 rounded-[3px] border text-[9px] font-bold uppercase tracking-wider font-mono transition-all flex items-center justify-center gap-1.5 ${
                          isVoiceAgentEnabled 
                            ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20" 
                            : "bg-surface border-border text-text-muted hover:text-text-main"
                        }`}
                      >
                        <Mic size={11} className={isListening ? "animate-pulse" : ""} />
                        <span>{isVoiceAgentEnabled ? "Voice Listening: ON" : "Voice Listening: OFF"}</span>
                      </button>

                      {/* Toggle synthesized voice */}
                      <button
                        type="button"
                        onClick={() => setAutoReadQuestions(prev => !prev)}
                        className={`py-1.5 px-3 rounded-[3px] border text-[9px] font-bold uppercase tracking-wider font-mono transition-all flex items-center justify-center gap-1.5 ${
                          autoReadQuestions 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20" 
                            : "bg-surface border-border text-text-muted hover:text-text-main"
                        }`}
                      >
                        {autoReadQuestions ? <Volume2 size={11} /> : <VolumeX size={11} />}
                        <span>{autoReadQuestions ? "Auto-Read Prompts" : "Muted Prompts"}</span>
                      </button>
                    </div>

                    {/* Custom interactive speech buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => speakInterviewerText(`Question ${interviewQuestions[currentQuestionIdx].num}: ${interviewQuestions[currentQuestionIdx].prompt}`)}
                        className="py-1.5 px-2 bg-surface hover:bg-surface-muted text-text-main hover:border-primary border border-border text-[9px] font-bold uppercase tracking-wider font-mono rounded-[3px] transition-all flex items-center justify-center gap-1"
                      >
                        <Volume2 size={11} />
                        <span>Repeat Question</span>
                      </button>

                      <button
                        type="button"
                        onClick={generateVoiceFeedback}
                        disabled={isSpeaking}
                        className="py-1.5 px-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white border border-blue-700 text-[9px] font-bold uppercase tracking-wider font-mono rounded-[3px] transition-all flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                      >
                        <Sparkles size={11} />
                        <span>Get AI Feedback</span>
                      </button>
                    </div>

                    {/* Real-time AI Verbal Feedback display bubble */}
                    {aiFeedbackText && (
                      <div className="mt-1 p-3 bg-primary/5 border border-primary/10 rounded-[3px] flex flex-col gap-1.5 animate-fadeIn">
                        <span className="text-[8px] font-bold text-primary uppercase tracking-widest font-mono flex items-center gap-1">
                          <Bot size={11} /> AI Verbal Assessment
                        </span>
                        <p className="text-[10.5px] font-semibold text-text-main leading-relaxed italic">
                          "{aiFeedbackText}"
                        </p>
                      </div>
                    )}
                  </div>
                 <h2 className="text-xl font-bold text-text-main mb-6 leading-tight uppercase tracking-tight">
                    {interviewQuestions[currentQuestionIdx].prompt}
                 </h2>
                 <div className="flex gap-2 flex-wrap">
                   {interviewQuestions[currentQuestionIdx].concepts.map((concept, idx) => (
                     <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-primary/10 dark:text-primary rounded-[2px] border border-blue-200 dark:border-primary/20 text-[10px] font-bold uppercase tracking-widest">
                        {concept}
                     </span>
                   ))}
                 </div>
               </div>

               <div className="flex gap-3 mt-2 border-t border-border pt-4">
                 <button
                   type="button"
                   disabled={currentQuestionIdx === 0}
                   onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                   className="flex-1 py-2 bg-surface text-text-muted hover:text-text-main hover:border-primary border border-border text-[10px] font-bold uppercase tracking-widest rounded-[4px] transition-all disabled:opacity-40 disabled:cursor-not-allowed text-center active:scale-95"
                 >
                   Prev Question
                 </button>
                 <button
                   type="button"
                   disabled={currentQuestionIdx === interviewQuestions.length - 1}
                   onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                   className="flex-1 py-2 bg-primary text-white hover:bg-primary-hover text-[10px] font-bold uppercase tracking-widest rounded-[4px] transition-all border border-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-center shadow-sm active:scale-95"
                 >
                   Next Question
                 </button>
               </div>
            </div>

            {/* Telemetry Bento */}
            <div className="bg-background border border-border rounded-[4px] flex flex-col flex-1 shadow-sm overflow-hidden">
               <div className="p-4 border-b border-border bg-surface-muted">
                 <h3 className="text-[10px] font-bold text-text-main uppercase tracking-widest flex items-center gap-2">
                   Real-time Telemetry
                 </h3>
               </div>
               
               <div className="p-6 flex flex-col gap-8 flex-1">
                 {/* Confidence */}
                 <div className="flex flex-col gap-2">
                   <div className="flex justify-between items-end">
                     <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest font-mono">Response Confidence</span>
                     <span className="text-xs font-bold text-text-main font-mono">88%</span>
                   </div>
                   <div className="w-full bg-surface h-1.5 border border-border rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: "88%" }} 
                        className="bg-primary h-full border-r border-blue-700"
                      />
                   </div>
                 </div>

                 {/* Cadence */}
                 <div className="flex flex-col gap-2">
                   <div className="flex justify-between items-end">
                     <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest font-mono">Speech Cadence</span>
                     <span className="text-[9px] font-bold text-primary font-mono uppercase">OPTIMAL (124 WPM)</span>
                   </div>
                   <div className="flex items-end h-8 gap-[2px]">
                     {[0.4, 0.5, 0.7, 0.85, 0.8, 0.6, 0.5, 0.4, 0.6, 0.7, 0.9, 0.8, 0.5].map((h, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 border-t transition-all duration-300 ${i > 4 && i < 10 ? "bg-primary border-blue-700" : "bg-surface-muted border-border"}`} 
                          style={{ height: `${h * 100}%` }}
                        />
                     ))}
                   </div>
                 </div>

                 {/* Entities */}
                 <div className="flex flex-col gap-3 pt-4 border-t border-border mt-auto">
                   <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest font-mono">Expected Technical Entities</span>
                   <div className="flex flex-col gap-2">
                     {(questionEntities[currentQuestionIdx] || []).map((e, i) => (
                       <div 
                         key={i} 
                         onClick={() => toggleEntity(i)}
                         className={`flex items-center gap-3 p-2 rounded-[2px] border cursor-pointer select-none transition-all hover:bg-primary/5 ${e.checked ? "bg-primary/10 border-primary/20" : "border-border border-dashed bg-surface-muted"}`}
                       >
                         {e.checked ? <CheckSquare size={12} className="text-primary" /> : <Square size={12} className="text-text-muted" />}
                         <span className="text-[10px] font-bold uppercase tracking-tight text-text-main">{e.name}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
