import React, { useState } from "react";
import { UserPlus, Building2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Onboarding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    email: "user@example.com", // Mocked for simplicity
  });
  const [selectedStack, setSelectedStack] = useState<string[]>(["Python", "AI/ML"]);

  const stacks = ["Python", "C / C++", "React", "AI/ML", "System Design"];

  const toggleStack = (stack: string) => {
    if (selectedStack.includes(stack)) {
      setSelectedStack(selectedStack.filter(s => s !== stack));
    } else {
      setSelectedStack([...selectedStack, stack]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/user", {
        ...formData,
        techStack: selectedStack.join(","),
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-8 font-sans antialiased">
      <main className="w-full max-w-2xl bg-surface border border-border rounded-[4px] p-12 shadow-sm">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-[4px] border border-blue-700 mb-6 shadow-md">
            <UserPlus className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-text-main mb-2 uppercase tracking-tight">Create Professional Profile</h1>
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Complete your technical profile to calibrate the simulation environment.</p>
        </div>

        <form className="space-y-10" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider" htmlFor="firstName">First Name</label>
              <input
                className="w-full px-4 py-3 bg-background border border-border rounded-[4px] text-sm text-text-main focus:outline-none focus:border-primary transition-colors font-bold"
                id="firstName"
                placeholder="Jane"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider" htmlFor="lastName">Last Name</label>
              <input
                className="w-full px-4 py-3 bg-background border border-border rounded-[4px] text-sm text-text-main focus:outline-none focus:border-primary transition-colors font-bold"
                id="lastName"
                placeholder="Doe"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider" htmlFor="organization">University / Organization</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted h-5 w-5" />
              <input
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-[4px] text-sm text-text-main focus:outline-none focus:border-primary transition-colors font-bold"
                id="organization"
                placeholder="e.g. Stanford University"
                required
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              />
            </div>
          </div>

          <div className="h-px bg-border"></div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wider">Technical Stack Selection</label>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-tight">Select areas of expertise for the AI interviewer to focus on.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {stacks.map((stack) => {
                const isSelected = selectedStack.includes(stack);
                return (
                  <button
                    key={stack}
                    type="button"
                    onClick={() => toggleStack(stack)}
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

          <div className="pt-6">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-[4px] font-bold border border-blue-700 hover:bg-primary-hover transition-all active:scale-[0.98] shadow-md uppercase tracking-[0.2em] text-xs"
            >
              <span>Initialize Environment</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
