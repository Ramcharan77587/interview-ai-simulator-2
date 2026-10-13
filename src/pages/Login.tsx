import React, { useState, useEffect } from "react";
import { Video, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import RecoverAccessModal from "../components/modals/RecoverAccessModal";
import GoogleSsoModal from "../components/modals/GoogleSsoModal";

export default function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modals
  const [isRecoverModalOpen, setIsRecoverModalOpen] = useState(false);
  const [isGoogleSsoModalOpen, setIsGoogleSsoModalOpen] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await authService.login(email, password);

      // Save authentication information and update context
      login(data.token, data.user);

      // Redirect after successful login
      navigate("/dashboard");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (err instanceof Error ? err.message : "Unable to login");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6 antialiased">
      <div className="w-full max-w-[1240px] flex flex-col md:flex-row border border-border rounded-[4px] overflow-hidden shadow-sm min-h-[700px]">
        {/* Left Panel */}
        <div className="hidden md:flex md:w-1/2 bg-primary p-12 flex-col justify-between text-white relative">
          <div className="flex items-center gap-2 border-b border-white/20 pb-6">
            <div className="w-8 h-8 bg-white text-primary rounded-[2px] flex items-center justify-center shadow-md">
              <Video size={20} fill="currentColor" />
            </div>

            <span className="text-xl font-bold tracking-tight uppercase">
              AI Simulator
            </span>
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-6 tracking-tighter uppercase leading-[0.95] max-w-sm">
              Professional Interview Performance Platform
            </h1>

            <p className="text-sm font-medium text-white/80 leading-relaxed mb-10 max-w-xs uppercase tracking-tight">
              Scaffolding technical scenarios for mid-to-senior candidates.
              Practice behavioral logic with enterprise precision.
            </p>

            {/* Performance Graphic */}
            <div className="p-5 border border-white/20 rounded-[4px] bg-white/5 backdrop-blur-sm shadow-inner">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Live Analytics Engine
                </span>

                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
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
        <div className="w-full md:w-1/2 flex flex-col justify-center p-6 sm:p-10 md:p-16 lg:p-20 bg-surface">
          <div className="w-full max-w-md mx-auto">
            {/* Heading */}
            <div className="mb-8 md:mb-10 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight text-text-main">
                SIGN IN
              </h2>

              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                Access your session recordings and metrics
              </p>
            </div>

            {/* Google SSO Button */}
            <div className="flex flex-col gap-4 mb-6 md:mb-8">
              <button
                type="button"
                onClick={() => setIsGoogleSsoModalOpen(true)}
                className="flex items-center justify-center gap-3 w-full py-3.5 px-4 border border-border bg-background hover:bg-surface-muted transition-colors text-[11px] font-bold uppercase tracking-widest rounded-[4px] shadow-sm text-text-main active:scale-[0.99]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Google Workspace SSO
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center mb-6 md:mb-8">
              <div className="flex-grow border-t border-border" />

              <span className="mx-4 text-text-muted text-[10px] font-bold uppercase tracking-widest">
                Internal Auth
              </span>

              <div className="flex-grow border-t border-border" />
            </div>

            {/* Login Form */}
            <form className="flex flex-col gap-5" onSubmit={handleLogin}>
              {/* Error */}
              {error && (
                <div className="border border-red-300 bg-red-50 text-red-700 px-4 py-3 rounded-[4px] text-[11px] font-bold flex justify-between items-center">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="text-red-500 hover:text-red-800 ml-2"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  className="block text-[10px] font-bold text-text-muted mb-2 uppercase tracking-wider"
                  htmlFor="email"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:border-primary text-sm rounded-[4px] font-bold text-text-main transition-colors"
                  placeholder="name@enterprise.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    className="block text-[10px] font-bold text-text-muted uppercase tracking-wider"
                    htmlFor="password"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsRecoverModalOpen(true)}
                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tight"
                  >
                    Recover Access
                  </button>
                </div>

                <input
                  id="password"
                  className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:border-primary text-sm rounded-[4px] font-bold text-text-main transition-colors"
                  placeholder="••••••••"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={loading}
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-[4px] font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-[0.98] border border-blue-700 shadow-md"
              >
                {loading ? "AUTHORIZING..." : "AUTHORIZE LOGIN"}

                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            {/* Registration */}
            <p className="mt-8 text-center text-[11px] font-bold text-text-muted uppercase tracking-widest leading-loose">
              Restricted access.{" "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => navigate("/onboarding")}
              >
                Request enterprise partition
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Recover Access Modal */}
      <RecoverAccessModal
        isOpen={isRecoverModalOpen}
        onClose={() => setIsRecoverModalOpen(false)}
        defaultEmail={email}
      />

      {/* Google SSO Modal */}
      <GoogleSsoModal
        isOpen={isGoogleSsoModalOpen}
        onClose={() => setIsGoogleSsoModalOpen(false)}
      />
    </div>
  );
}