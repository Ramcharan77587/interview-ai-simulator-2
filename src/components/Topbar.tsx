import React, { useState } from "react";
import {
  Bell,
  HelpCircle,
  Plus,
  Moon,
  Sun,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../lib/ThemeContext";
import { useAuth } from "../context/AuthContext";
import NotificationsModal from "./modals/NotificationsModal";
import HelpModal from "./modals/HelpModal";

interface TopbarProps {
  title: string;
  onOpenNotifications?: () => void;
  onOpenHelp?: () => void;
}

export default function Topbar({
  title,
  onOpenNotifications,
  onOpenHelp,
}: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleOpenNotifications = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      setIsNotificationsOpen(true);
    }
  };

  const handleOpenHelp = () => {
    if (onOpenHelp) {
      onOpenHelp();
    } else {
      setIsHelpOpen(true);
    }
  };

  return (
    <>
      <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] border-b border-border bg-background flex items-center justify-between h-16 px-4 md:px-8 z-10 transition-colors duration-200">
        <div className="hidden sm:block">
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-text-main">
            {title}
          </h2>

          <p className="text-[10px] md:text-[11px] text-text-muted uppercase tracking-wider font-bold">
            WELCOME BACK, {user?.name?.toUpperCase() || "USER"}
          </p>
        </div>

        <div className="flex items-center gap-3 md:gap-6 ml-auto sm:ml-0">
          <div className="flex items-center gap-1 md:gap-4">
            <button
              onClick={toggleTheme}
              className="text-text-muted hover:text-primary transition-colors p-2 hover:bg-surface-muted rounded-[4px]"
              title={
                theme === "light"
                  ? "Switch to Dark Mode"
                  : "Switch to Light Mode"
              }
            >
              {theme === "light" ? (
                <Moon size={18} />
              ) : (
                <Sun size={18} />
              )}
            </button>

            <button
              onClick={handleOpenNotifications}
              className="text-text-muted hover:text-primary transition-colors p-2 hover:bg-surface-muted rounded-[4px] relative"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="w-2 h-2 bg-primary rounded-full absolute top-1.5 right-1.5" />
            </button>

            <button
              onClick={handleOpenHelp}
              className="text-text-muted hover:text-primary transition-colors p-2 hover:bg-surface-muted rounded-[4px]"
              title="Help & Support"
            >
              <HelpCircle size={18} />
            </button>
          </div>

          <div className="h-6 md:h-8 w-px bg-border"></div>

          <Link
            to="/setup"
            className="bg-primary text-white px-3 md:px-5 py-2 md:py-2.5 rounded-[4px] text-xs font-bold flex items-center gap-1.5 md:gap-2 hover:bg-primary-hover transition-colors border border-blue-700 shadow-sm active:scale-95 uppercase tracking-widest text-[10px] md:text-[11px]"
          >
            <Plus size={14} />
            <span className="hidden xs:inline">NEW INTERVIEW</span>
            <span className="xs:hidden">NEW</span>
          </Link>
        </div>
      </header>

      {/* Internal Modals */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </>
  );
}