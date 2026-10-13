import React, { useState, useEffect } from "react";
import { X, Check, Save } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settingTitle: string;
  settingDescription: string;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settingTitle,
  settingDescription,
}: SettingsModalProps) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [toggleState, setToggleState] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(false);
    if (settingTitle.includes("Profile") || settingTitle.includes("Name")) {
      setInputValue(user?.name || "");
    } else if (settingTitle.includes("Account") || settingTitle.includes("Email")) {
      setInputValue(user?.email || "");
    } else {
      setInputValue("");
    }
  }, [isOpen, settingTitle, user]);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const isToggleSetting =
    settingTitle.includes("Two-Factor") ||
    settingTitle.includes("Alerts") ||
    settingTitle.includes("Notifications") ||
    settingTitle.includes("Mode");

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
            <div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-text-main">
                {settingTitle}
              </h3>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                {settingDescription}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-main hover:bg-surface-muted rounded-[4px] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="py-5 space-y-4">
            {saved ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-[4px] text-emerald-500 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <Check size={18} />
                <span>Configuration updated successfully</span>
              </div>
            ) : isToggleSetting ? (
              <div className="p-4 bg-surface-muted border border-border rounded-[4px] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-text-main uppercase tracking-tight block">
                    Enable {settingTitle}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {toggleState ? "Active for current partition" : "Currently disabled"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setToggleState((prev) => !prev)}
                  className={`w-12 h-6 rounded-full border transition-colors relative ${
                    toggleState
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-all absolute top-1/2 -translate-y-1/2 ${
                      toggleState ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                  Update {settingTitle}
                </label>
                <input
                  type={settingTitle.includes("Password") ? "password" : "text"}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Enter new ${settingTitle.toLowerCase()}...`}
                  className="w-full px-4 py-3 bg-background border border-border rounded-[4px] text-sm font-bold text-text-main focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            )}

            <div className="pt-3 border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-surface-muted hover:bg-background border border-border rounded-[4px] text-[10px] font-bold uppercase tracking-widest text-text-main transition-colors"
              >
                Cancel
              </button>
              {!saved && (
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
