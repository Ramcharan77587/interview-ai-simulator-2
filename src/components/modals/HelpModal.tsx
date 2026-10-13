import React, { useEffect } from "react";
import { X, HelpCircle, Mail, Mic, Camera, ShieldCheck, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const faqs = [
    {
      q: "Microphone or camera not working?",
      a: "Click the lock icon in your browser address bar. Ensure 'Camera' and 'Microphone' permissions are set to 'Allow', then refresh the interview room.",
    },
    {
      q: "Speech recognition not transcribing?",
      a: "Speech recognition runs via the Web Speech API on Chromium browsers (Chrome, Edge, Brave). If on Firefox, use our accessible manual text response mode in the interview room.",
    },
    {
      q: "How is telemetry scored?",
      a: "Our analysis engine compares spoken technical entities against standard architectural principles, measuring speech cadence (WPM) and topic accuracy.",
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-surface border border-border rounded-[4px] shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[4px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <HelpCircle size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-tight text-text-main">
                  Help & Candidate Support
                </h3>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                  Troubleshooting & System Verification
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-main hover:bg-surface-muted rounded-[4px] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto py-5 space-y-5 text-text-main text-xs">
            {/* Quick Diagnostic Checklist */}
            <div className="p-4 bg-surface-muted border border-border rounded-[4px] space-y-2.5">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                Hardware Pre-Flight Check
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-medium">
                <div className="flex items-center gap-2 p-2 bg-background border border-border rounded-[2px]">
                  <Mic size={14} className="text-emerald-500" />
                  <span>Microphone: Ready</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-background border border-border rounded-[2px]">
                  <Camera size={14} className="text-emerald-500" />
                  <span>Camera: Enabled</span>
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Frequently Encountered Issues
              </span>
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-3 border border-border rounded-[4px] bg-background">
                  <div className="flex items-center gap-2 font-bold text-text-main text-[11px] uppercase tracking-tight">
                    <ChevronRight size={14} className="text-primary" />
                    <span>{faq.q}</span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-1.5 pl-5 font-normal leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>

            {/* Support Desk Contact */}
            <div className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-[4px] flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-primary block">
                  Candidate Helpdesk
                </span>
                <p className="text-[11px] font-bold text-text-main mt-0.5">
                  support@ai-interview-simulator.com
                </p>
              </div>
              <a
                href="mailto:support@ai-interview-simulator.com?subject=Interview%20Simulator%20Assistance"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-[2px] hover:bg-primary-hover transition-colors shadow-sm"
              >
                <Mail size={12} />
                <span>Contact</span>
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-border flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-surface-muted hover:bg-background border border-border rounded-[4px] text-[10px] font-bold uppercase tracking-widest text-text-main transition-colors"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
