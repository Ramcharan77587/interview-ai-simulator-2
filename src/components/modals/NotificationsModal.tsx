import React, { useState, useEffect } from "react";
import { X, Bell, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "AI Analysis Engine Online",
      desc: "Live audio telemetry pipeline is fully operational with Gemini 2.5 Flash.",
      time: "10m ago",
      read: false,
      type: "success",
    },
    {
      id: "2",
      title: "New System Design Scenarios",
      desc: "Distributed rate limiter and cache invalidation scenarios added to Question Bank.",
      time: "2h ago",
      read: false,
      type: "info",
    },
    {
      id: "3",
      title: "Session Readiness Reminder",
      desc: "Ensure camera and microphone permissions are granted before starting an interview.",
      time: "1d ago",
      read: true,
      type: "alert",
    },
  ]);

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

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-surface border border-border rounded-[4px] shadow-2xl p-6 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[4px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-tight text-text-main">
                  Notifications & Feed
                </h3>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                  System Updates & Alerts
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

          {/* List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 border rounded-[4px] transition-colors ${
                  n.read
                    ? "bg-surface-muted border-border opacity-75"
                    : "bg-background border-primary/30 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {n.type === "success" && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
                    {n.type === "info" && <Sparkles size={14} className="text-primary shrink-0" />}
                    {n.type === "alert" && <AlertCircle size={14} className="text-amber-500 shrink-0" />}
                    <h4 className="text-xs font-bold text-text-main uppercase tracking-tight">
                      {n.title}
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono text-text-muted">{n.time}</span>
                </div>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed pl-5 font-normal">
                  {n.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <button
              onClick={markAllRead}
              className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
            >
              Mark all as read
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-surface-muted hover:bg-background border border-border rounded-[4px] text-[10px] font-bold uppercase tracking-widest text-text-main transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
