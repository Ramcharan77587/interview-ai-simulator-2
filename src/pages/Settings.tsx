import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { LogOut, Bell, Shield, User, Globe, ChevronRight, Moon, Sun, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../lib/ThemeContext";

export default function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    // In a real app, clear tokens/session
    navigate("/login");
  };

  const sections = [
    {
      title: "Appearance",
      icon: theme === "light" ? <Sun size={18} /> : <Moon size={18} />,
      custom: (
        <div 
          onClick={toggleTheme}
          className="flex items-center justify-between p-4 border border-border rounded-[4px] hover:border-primary transition-colors cursor-pointer group bg-background"
        >
          <div>
            <p className="text-sm font-semibold text-text-main">
              {theme === "light" ? "Light Mode" : "Dark Mode"}
            </p>
            <p className="text-[10px] text-text-muted font-medium uppercase tracking-tight">Toggle between system themes</p>
          </div>
          <div className="w-12 h-6 bg-surface-muted border border-border rounded-full relative transition-colors group-hover:border-primary">
            <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-300 ${theme === "light" ? "left-1 bg-primary" : "left-7 bg-primary-hover"}`} />
          </div>
        </div>
      )
    },
    {
      title: "Profile Settings",
      icon: <User size={18} />,
      items: [
        { name: "Public Profile", description: "Manage your display name and avatar" },
        { name: "Account Details", description: "Update your email and personal information" },
      ],
    },
    {
      title: "Preferences",
      icon: <Globe size={18} />,
      items: [
        { name: "Language & Region", description: "Select your preferred display language" },
        { name: "Simulation Mode", description: "Toggle high-precision analysis feedback" },
      ],
    },
    {
      title: "Security",
      icon: <Shield size={18} />,
      items: [
        { name: "Password", description: "Change your account password" },
        { name: "Two-Factor Authentication", description: "Add an extra layer of security" },
      ],
    },
    {
      title: "Notifications",
      icon: <Bell size={18} />,
      items: [
        { name: "Email Alerts", description: "Configure when we send you session reports" },
        { name: "Desktop Notifications", description: "Toggle browser-based interview prompts" },
      ],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 min-h-screen overflow-hidden">
        <Topbar title="Settings & Account" />
        
        <main className="flex-1 overflow-y-auto mt-16 p-8">
          <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex justify-start pt-4">
              <Link 
                to="/dashboard"
                className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-primary transition-colors uppercase tracking-wider"
              >
                <ArrowLeft size={14} />
                Back to Dashboard
              </Link>
            </div>
            <div className="border border-border rounded-[4px] bg-surface overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-tight text-text-main">Account Overview</h2>
                  <p className="text-[11px] text-text-muted uppercase tracking-wider font-bold">Manage your professional identity and session data</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-2.5 border border-red-200 bg-red-50 text-[11px] font-bold text-red-700 hover:bg-red-100 transition-colors uppercase tracking-widest rounded-[4px] shadow-sm active:scale-95"
                >
                  <LogOut size={16} />
                  Terminate Session
                </button>
              </div>

              <div className="divide-y divide-border">
                {sections.map((section, sidx) => (
                  <div key={sidx} className="p-8">
                    <div className="flex items-center gap-2 mb-6 text-primary">
                      {section.icon}
                      <h3 className="text-xs font-bold uppercase tracking-widest text-text-main">{section.title}</h3>
                    </div>
                    <div className="space-y-4">
                      {"items" in section ? section.items.map((item, iidx) => (
                        <div 
                          key={iidx} 
                          className="flex items-center justify-between p-4 border border-border rounded-[4px] hover:border-primary transition-colors cursor-pointer group bg-background"
                        >
                          <div>
                            <p className="text-sm font-semibold text-text-main">{item.name}</p>
                            <p className="text-[10px] text-text-muted font-medium uppercase tracking-tight">{item.description}</p>
                          </div>
                          <ChevronRight size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                        </div>
                      )) : section.custom}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border border-border rounded-[4px] bg-surface-muted flex flex-col items-center justify-center gap-2">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Enterprise Partition: #US-EAST-492</p>
              <p className="text-[9px] font-mono text-text-muted/60">System Version: v4.0.2-stable</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
