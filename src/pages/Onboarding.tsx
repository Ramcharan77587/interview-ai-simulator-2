import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Building2,
  ArrowRight,
  Lock,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
    website_url_hp: "",
  });

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const [selectedStack, setSelectedStack] =
    useState<string[]>([
      "Python",
      "AI/ML",
    ]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const stacks = [
    "Python",
    "C / C++",
    "React",
    "AI/ML",
    "System Design",
  ];

  const toggleStack = (stack: string) => {
    if (selectedStack.includes(stack)) {
      setSelectedStack(
        selectedStack.filter(
          (s) => s !== stack
        )
      );
    } else {
      setSelectedStack([
        ...selectedStack,
        stack,
      ]);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError(
        "Passwords do not match"
      );
      return;
    }

    if (formData.password.length < 8) {
      setError(
        "Password must contain at least 8 characters"
      );
      return;
    }

    if (selectedStack.length === 0) {
      setError(
        "Please select at least one technical skill"
      );
      return;
    }

    setLoading(true);

    try {
      const fullName =
        `${formData.firstName.trim()} ${formData.lastName.trim()}`;

      const data = await authService.register({
        name: fullName,
        email: formData.email,
        password: formData.password,
        organization: formData.organization,
        techStack: selectedStack.join(","),
        website_url_hp: formData.website_url_hp,
      });

      login(data.token, data.user);

      // Direct navigation to dashboard without redirect loop
      navigate("/dashboard", {
        replace: true,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (err instanceof Error ? err.message : "Unable to create account");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-8 font-sans antialiased">

      <main className="w-full max-w-2xl bg-surface border border-border rounded-[4px] p-12 shadow-sm">

        {/* Header */}

        <div className="mb-10 text-center">

          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-[4px] border border-blue-700 mb-6 shadow-md">

            <UserPlus
              className="text-white"
              size={24}
            />

          </div>

          <h1 className="text-2xl font-bold text-text-main mb-2 uppercase tracking-tight">
            Create Your Account
          </h1>

          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
            Create your account and
            configure your AI interview
            environment.
          </p>

        </div>

        <form
          className="space-y-8"
          onSubmit={handleSubmit}
        >
          {/* Honeypot field for bot/spam prevention */}
          <input
            type="text"
            name="website_url_hp"
            value={formData.website_url_hp}
            onChange={(e) => setFormData({ ...formData, website_url_hp: e.target.value })}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {/* First Name / Last Name */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="space-y-3">

              <label
                className="block text-[10px] font-bold text-text-muted uppercase tracking-wider"
                htmlFor="firstName"
              >
                First Name
              </label>

              <input
                id="firstName"
                type="text"
                placeholder="Ram"
                required
                value={
                  formData.firstName
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    firstName:
                      e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-background border border-border rounded-[4px] text-sm text-text-main focus:outline-none focus:border-primary transition-colors font-bold"
              />

            </div>

            <div className="space-y-3">

              <label
                className="block text-[10px] font-bold text-text-muted uppercase tracking-wider"
                htmlFor="lastName"
              >
                Last Name
              </label>

              <input
                id="lastName"
                type="text"
                placeholder="Charan"
                required
                value={
                  formData.lastName
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lastName:
                      e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-background border border-border rounded-[4px] text-sm text-text-main focus:outline-none focus:border-primary transition-colors font-bold"
              />

            </div>

          </div>

          {/* Email */}

          <div className="space-y-3">

            <label
              className="block text-[10px] font-bold text-text-muted uppercase tracking-wider"
              htmlFor="email"
            >
              Email Address
            </label>

            <div className="relative">

              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                size={18}
              />

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email:
                      e.target.value,
                  })
                }
                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-[4px] text-sm text-text-main focus:outline-none focus:border-primary transition-colors font-bold"
              />

            </div>

          </div>

          {/* Password */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="space-y-3">

              <label
                className="block text-[10px] font-bold text-text-muted uppercase tracking-wider"
                htmlFor="password"
              >
                Password
              </label>

              <div className="relative">

                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                  size={18}
                />

                <input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  value={
                    formData.password
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password:
                        e.target.value,
                    })
                  }
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-[4px] text-sm text-text-main focus:outline-none focus:border-primary transition-colors font-bold"
                />

              </div>

            </div>

            <div className="space-y-3">

              <label
                className="block text-[10px] font-bold text-text-muted uppercase tracking-wider"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>

              <div className="relative">

                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                  size={18}
                />

                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  required
                  minLength={8}
                  value={
                    formData.confirmPassword
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword:
                        e.target.value,
                    })
                  }
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-[4px] text-sm text-text-main focus:outline-none focus:border-primary transition-colors font-bold"
                />

              </div>

            </div>

          </div>

          {/* Organization */}

          <div className="space-y-3">

            <label
              className="block text-[10px] font-bold text-text-muted uppercase tracking-wider"
              htmlFor="organization"
            >
              University / Organization
            </label>

            <div className="relative">

              <Building2
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                size={20}
              />

              <input
                id="organization"
                type="text"
                placeholder="e.g. National Institute of Engineering"
                required
                value={
                  formData.organization
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    organization:
                      e.target.value,
                  })
                }
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-[4px] text-sm text-text-main focus:outline-none focus:border-primary transition-colors font-bold"
              />

            </div>

          </div>

          <div className="h-px bg-border"></div>

          {/* Technical Stack */}

          <div className="space-y-6">

            <div>

              <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wider">
                Technical Stack Selection
              </label>

              <p className="text-[11px] font-bold text-text-muted uppercase tracking-tight">
                Select areas of expertise
                for the AI interviewer.
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              {stacks.map((stack) => {

                const isSelected =
                  selectedStack.includes(
                    stack
                  );

                return (
                  <button
                    key={stack}
                    type="button"
                    onClick={() =>
                      toggleStack(stack)
                    }
                    className={`px-5 py-2.5 border rounded-[4px] text-[11px] font-bold uppercase tracking-widest transition-all duration-200 ${
                      isSelected
                        ? "bg-primary text-white border-blue-700 shadow-sm"
                        : "bg-background text-text-muted border-border hover:border-primary"
                    }`}
                  >
                    {stack}
                  </button>
                );

              })}

            </div>

          </div>

          {/* Error */}

          {error && (
            <div className="p-3 border border-red-300 bg-red-50 text-red-600 text-xs font-bold rounded-[4px]">
              {error}
            </div>
          )}

          {/* Submit */}

          <div className="pt-2">

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-[4px] font-bold border border-blue-700 hover:bg-primary-hover transition-all active:scale-[0.98] shadow-md uppercase tracking-[0.2em] text-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >

              <span>
                {loading
                  ? "CREATING ACCOUNT..."
                  : "CREATE ACCOUNT"}
              </span>

              {!loading && (
                <ArrowRight
                  size={18}
                />
              )}

            </button>

          </div>

          {/* Login */}

          <p className="text-center text-[11px] font-bold text-text-muted uppercase tracking-wider">

            Already have an account?{" "}

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
              className="text-primary hover:underline"
            >
              Sign In
            </button>

          </p>

        </form>

      </main>

    </div>
  );
}