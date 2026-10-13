import React, { useEffect } from "react";
import { X, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GoogleSsoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueWithDemo?: () => void;
}

export default function GoogleSsoModal({
  isOpen,
  onClose,
  onContinueWithDemo,
}: GoogleSsoModalProps) {
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
                <ShieldAlert size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-tight text-text-main">
                  Google Workspace SSO
                </h3>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                  Federated Identity Gateway
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
          <div className="py-5 space-y-4">
            <p className="text-xs text-text-muted leading-relaxed">
              Google Workspace Enterprise SSO is enabled for authorized organization domains (OAuth 2.0 / SAML 2.0).
            </p>

            <div className="p-4 bg-surface-muted border border-border rounded-[4px] space-y-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Deployment Mode
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-text-main">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>Internal Authentication is active and recommended for testing.</span>
              </div>
            </div>

            <p className="text-[11px] text-text-muted">
              You can log in directly using your registered account credentials or request an enterprise partition via onboarding.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-border flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-surface-muted hover:bg-background border border-border rounded-[4px] text-[10px] font-bold uppercase tracking-widest text-text-main transition-colors"
            >
              Use Email & Password
            </button>
            {onContinueWithDemo && (
              <button
                onClick={onContinueWithDemo}
                className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Demo Sign In</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
