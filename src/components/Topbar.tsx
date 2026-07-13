import React from "react";
import { Bell, HelpCircle, Plus, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../lib/ThemeContext";

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] border-b border-border bg-background flex items-center justify-between h-16 px-8 z-10 transition-colors duration-200">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-main">{title}</h2>
        <p className="text-[11px] text-text-muted uppercase tracking-wider font-bold">Welcome back, Jane</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="text-text-muted hover:text-primary transition-colors p-2 hover:bg-surface-muted rounded-[4px]"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="text-text-muted hover:text-primary transition-colors p-2 hover:bg-surface-muted rounded-[4px]">
            <Bell size={20} />
          </button>
          <button className="text-text-muted hover:text-primary transition-colors p-2 hover:bg-surface-muted rounded-[4px]">
            <HelpCircle size={20} />
          </button>
        </div>
        <div className="h-8 w-px bg-border"></div>
        <Link 
          to="/setup"
          className="bg-primary text-white px-5 py-2.5 rounded-[4px] text-sm font-bold flex items-center gap-2 hover:bg-primary-hover transition-colors border border-blue-700 shadow-sm active:scale-95 uppercase tracking-widest text-[11px]"
        >
          <Plus size={16} />
          START NEW INTERVIEW
        </Link>
      </div>
    </header>
  );
}
