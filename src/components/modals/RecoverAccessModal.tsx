import React, { useState, useEffect } from "react";
import { X, KeyRound, CheckCircle2, ArrowRight, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RecoverAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export default function RecoverAccessModal({
  isOpen,
  onClose,
  defaultEmail = "",
}: RecoverAccessModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setEmail(defaultEmail);
    setSubmitted(false);
    setError("");
  }, [isOpen, defaultEmail]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    // Simulate secure dispatch
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-surface border border-border rounded-[4px] shadow-2xl p-6 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[4px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <KeyRound size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-tight text-text-main">
                  Recover Access
                </h3>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                  Account Recovery Protocol
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

          {/* Content */}
          <div className="py-5">
            {submitted ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-base font-bold text-text-main uppercase tracking-tight">
                  Recovery Link Dispatched
                </h4>
                <p className="text-xs text-text-muted leading-relaxed max-w-xs mx-auto">
                  If an account exists for <span className="font-bold text-text-main">{email}</span>, password reset instructions have been sent. Please check your inbox and spam folder.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold uppercase tracking-widest rounded-[4px] transition-colors shadow-sm"
                  >
                    Return to Login
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-text-muted leading-relaxed">
                  Enter your registered work or institutional email. We will generate an authorization token to re-authenticate your partition.
                </p>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-xs font-bold rounded-[4px]">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="recovery-email"
                    className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      id="recovery-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="name@enterprise.com"
                      className="w-full pl-9 pr-4 py-3 bg-background border border-border rounded-[4px] text-sm font-bold text-text-main focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-bold text-[11px] uppercase tracking-widest rounded-[4px] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                  >
                    <span>{loading ? "DISPATCHING INSTRUCTIONS..." : "DISPATCH RECOVERY INSTRUCTIONS"}</span>
                    {!loading && <ArrowRight size={14} />}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
