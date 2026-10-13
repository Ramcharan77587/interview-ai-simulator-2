import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Video,
  Database,
  Settings as SettingsIcon,
  LogOut,
  Bot,
  Moon,
  Sun,
  Bell,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../lib/ThemeContext";

interface MobileNavProps {
  onOpenNotifications?: () => void;
  onOpenHelp?: () => void;
}

export default function MobileNav({ onOpenNotifications, onOpenHelp }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={18} /> },
    { name: "Start Interview", path: "/setup", icon: <Video size={18} /> },
    { name: "Question Bank", path: "/questions", icon: <Database size={18} /> },
    { name: "Settings", path: "/settings", icon: <SettingsIcon size={18} /> },
  ];

  return (
    <div className="md:hidden block fixed top-0 left-0 right-0 z-40 bg-surface border-b border-border transition-colors duration-200">
      {/* Mobile Topbar */}
      <div className="flex items-center justify-between px-4 h-16">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-[4px] flex items-center justify-center text-white shadow-sm">
            <Bot size={18} />
          </div>
          <span className="font-bold tracking-tight text-sm uppercase text-text-main">
            AI Simulator
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-text-muted hover:text-text-main hover:bg-surface-muted rounded-[4px]"
            title="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="p-2 text-text-muted hover:text-text-main hover:bg-surface-muted rounded-[4px]"
              title="Notifications"
            >
              <Bell size={18} />
            </button>
          )}

          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="p-2 text-text-muted hover:text-text-main hover:bg-surface-muted rounded-[4px]"
              title="Help"
            >
              <HelpCircle size={18} />
            </button>
          )}

          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-text-main hover:bg-surface-muted rounded-[4px] border border-border ml-1"
            title="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-72 max-w-[80vw] bg-surface border-r border-border h-full flex flex-col p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary rounded-[4px] flex items-center justify-center text-white">
                    <Bot size={18} />
                  </div>
                  <span className="font-bold tracking-tight text-sm uppercase text-text-main">
                    AI Simulator
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-text-muted hover:text-text-main hover:bg-surface-muted rounded-[4px]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Items */}
              <ul className="space-y-2 flex-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-[4px] text-xs font-bold uppercase tracking-wider transition-colors ${
                          isActive
                            ? "bg-primary text-white shadow-sm"
                            : "text-text-muted hover:text-text-main hover:bg-surface-muted"
                        }`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* User Profile & Logout */}
              <div className="pt-4 border-t border-border mt-auto flex flex-col gap-3">
                <div className="flex items-center gap-3 p-2 border border-border rounded-[4px] bg-background">
                  <div className="w-8 h-8 rounded-[4px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                    {user?.name ? user.name[0] : "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-text-main truncate uppercase">
                      {user?.name || "User"}
                    </p>
                    <p className="text-[10px] text-text-muted truncate font-medium">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-[4px] text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
