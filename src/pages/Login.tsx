import React, { useState } from "react";
import { Video, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 antialiased">
      <div className="w-full max-w-[1240px] flex flex-col md:flex-row border border-border rounded-[4px] overflow-hidden shadow-sm min-h-[700px]">
        {/* Left Panel */}
        <div className="hidden md:flex md:w-1/2 bg-primary p-12 flex-col justify-between text-white relative">
          <div className="flex items-center gap-2 border-b border-white/20 pb-6">
            <div className="w-8 h-8 bg-white text-primary rounded-[2px] flex items-center justify-center shadow-md">
              <Video size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight uppercase">AI Simulator</span>
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-6 tracking-tighter uppercase leading-[0.95] max-w-sm">Professional Interview Performance Platform</h1>
            <p className="text-sm font-medium text-white/80 leading-relaxed mb-10 max-w-xs uppercase tracking-tight">
              Scaffolding technical scenarios for mid-to-senior candidates. practice behavioral logic with enterprise precision.
            </p>

            {/* Performance Graphic Mockup */}
            <div className="p-5 border border-white/20 rounded-[4px] bg-white/5 backdrop-blur-sm shadow-inner">
               <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Live Analytics Engine</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                  </div>
               </div>
               <div className="flex items-end gap-[3px] h-24">
                  {[40, 65, 55, 85, 45, 95, 75, 88].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05 + 0.3 }}
                      className="flex-1 bg-white/20 border-t-2 border-white/40"
                    />
                  ))}
               </div>
            </div>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            © 2026 ENTERPRISE SUITE v4.0.2
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-20 bg-surface">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2 tracking-tight text-text-main">SIGN IN</h2>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Access your session recordings and metrics</p>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              <button className="flex items-center justify-center gap-3 w-full py-3.5 px-4 border border-border bg-background hover:bg-surface-muted transition-colors text-[11px] font-bold uppercase tracking-widest rounded-[4px] shadow-sm text-text-main">
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                Google SSO
              </button>
            </div>

            <div className="flex items-center mb-8">
              <div className="flex-grow border-t border-border"></div>
              <span className="mx-4 text-text-muted text-[10px] font-bold uppercase tracking-widest">Internal Auth</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-2 uppercase tracking-wider" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:border-primary text-sm rounded-[4px] font-bold text-text-main"
                  placeholder="name@enterprise.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider" htmlFor="password">Password</label>
                  <a href="#" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tight">Recover Access</a>
                </div>
                <input
                  id="password"
                  className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:border-primary text-sm rounded-[4px] font-bold text-text-main"
                  placeholder="••••••••"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="mt-4 w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-[4px] font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-[0.98] border border-blue-700 shadow-md"
              >
                AUTHORIZE LOGIN
                <ArrowRight size={16} />
              </button>
            </form>

            <p className="mt-8 text-center text-[11px] font-bold text-text-muted uppercase tracking-widest leading-loose">
              Restricted access. <a href="#" className="text-primary hover:underline" onClick={() => navigate("/onboarding")}>Request enterprise partition</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
