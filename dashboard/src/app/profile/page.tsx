"use client";

import { useEffect, useState } from "react";
import { 
  UserCheck, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  X,
  Sliders,
  GraduationCap,
  Briefcase,
  Shield,
  Key,
  Globe,
  FileText,
  Lock,
  Layers
} from "lucide-react";
import { fetchProfile, updateProfile } from "@/lib/api";
import { UserProfile } from "@/lib/types";

const DEFAULT_FALLBACK_PROFILE: UserProfile = {
  id: "default-profile",
  full_name: "Shlok Goyal",
  email: "24dcs024@nith.ac.in",
  phone: "+91 9876543210",
  date_of_birth: "2003-05-15",
  gender: "Male",
  address: "NIT Hamirpur, Himachal Pradesh",
  city: "Hamirpur",
  state: "Himachal Pradesh",
  country: "India",
  zip_code: "177005",
  university: "National Institute of Technology Hamirpur",
  degree: "Bachelor of Technology (B.Tech)",
  major: "Computer Science and Engineering",
  graduation_year: "2027",
  gpa_cgpa: "8.9 / 10.0",
  headline: "Full-Stack AI Agent & Systems Engineer",
  bio: "Computer Science undergraduate passionate about building autonomous agentic workflows and distributed systems.",
  github_url: "https://github.com/Shlok1729",
  linkedin_url: "https://linkedin.com/in/shlok1729",
  portfolio_url: "https://shlokgoyal.studio",
  skills: ["Python", "TypeScript", "Next.js", "AI Agents", "FastAPI", "React", "Rust"],
  projects_summary: "Built Scout — Self-Learning Autonomous Opportunity Radar; high-performance webcmd browser automation engine; full-stack applications with Next.js and FastAPI.",
  work_experience: "Software Engineering Intern at AI Labs (2025) — built headless browser pipelines and LLM evaluation architectures.",
  custom_vault: {
    "Student ID": "24dcs024",
    "Preferred Role": "AI Engineer / Full Stack Developer",
    "Hackathon Team": "Team Scout AI",
    "Available Dates": "Immediate / Summer 2025",
  },
  vertical_interests: [],
  attributes: {},
  include_tags: [],
  exclude_tags: [],
  constraints: {},
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_FALLBACK_PROFILE);
  const [activeTab, setActiveTab] = useState<"personal" | "academic" | "professional" | "vault" | "radar">("personal");
  const [newSkill, setNewSkill] = useState("");
  const [newVaultKey, setNewVaultKey] = useState("");
  const [newVaultValue, setNewVaultValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message?: string; error?: string } | null>(null);

  useEffect(() => {
    fetchProfile()
      .then((data) => {
        if (data && data.full_name) {
          setProfile(data);
        }
      })
      .catch((err) => {
        console.warn("Could not load live profile, using resilient cached profile:", err);
      });
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await updateProfile(profile);
      setFeedback({ message: "Identity Vault & Profile successfully saved!" });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ error: err.message || "Failed to save profile" });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim() || !profile) return;
    const current = profile.skills || [];
    if (!current.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...current, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      skills: (profile.skills || []).filter((s) => s !== skillToRemove),
    });
  };

  const addVaultEntry = () => {
    if (!newVaultKey.trim() || !newVaultValue.trim() || !profile) return;
    setProfile({
      ...profile,
      custom_vault: {
        ...(profile.custom_vault || {}),
        [newVaultKey.trim()]: newVaultValue.trim(),
      },
    });
    setNewVaultKey("");
    setNewVaultValue("");
  };

  const removeVaultEntry = (keyToRemove: string) => {
    if (!profile) return;
    const updated = { ...(profile.custom_vault || {}) };
    delete updated[keyToRemove];
    setProfile({
      ...profile,
      custom_vault: updated,
    });
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-6xl mx-auto w-full">
      {/* ── Top Header Bento ── */}
      <div className="bento-card p-6 sm:p-8 border border-slate-200/90 bg-gradient-to-r from-white via-indigo-50/50 to-purple-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200 font-mono">
              Identity Vault Active
            </span>
            <span className="text-xs text-slate-500 font-medium font-mono">
              Encrypted Local Storage
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 font-display">
            User Identity Vault & Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Your personal information source for Scout's AI Form Agent & opportunity matcher
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50 hover:scale-105 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Identity Vault"}</span>
          </button>
        </div>
      </div>

      {feedback?.message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {feedback?.error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{feedback.error}</span>
        </div>
      )}

      {/* ── Identity Vault Multi-Tab Segment Bar ── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200 shadow-inner">
        {[
          { id: "personal", label: "1. Personal Identity", icon: UserCheck },
          { id: "academic", label: "2. Academic & College", icon: GraduationCap },
          { id: "professional", label: "3. Projects & Skills", icon: Briefcase },
          { id: "vault", label: "4. Custom Key Vault", icon: Key },
          { id: "radar", label: "5. Radar Matching Rules", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab 1: Personal Identity ── */}
      {activeTab === "personal" && (
        <div className="bento-card p-6 sm:p-8 border border-slate-200 bg-white/95 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 font-display">Personal Information</h3>
            <p className="text-xs text-slate-600 font-medium">Used to automatically fill applicant name, contact, and address fields on forms.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Full Name</label>
              <input
                type="text"
                value={profile.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-xs text-slate-900 outline-none font-medium shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Email Address</label>
              <input
                type="email"
                value={profile.email || ""}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-xs text-slate-900 outline-none font-medium shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Phone / Mobile</label>
              <input
                type="text"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-xs text-slate-900 outline-none font-medium shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Date of Birth</label>
              <input
                type="date"
                value={profile.date_of_birth || ""}
                onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-xs text-slate-900 outline-none font-medium shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Gender</label>
              <select
                value={profile.gender || "Male"}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-xs text-slate-900 outline-none font-medium shadow-inner"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">City</label>
              <input
                type="text"
                value={profile.city || ""}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-xs text-slate-900 outline-none font-medium shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Full Street Address</label>
            <input
              type="text"
              value={profile.address || ""}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-xs text-slate-900 outline-none font-medium shadow-inner"
            />
          </div>
        </div>
      )}

      {/* ── Tab 2: Academic & College ── */}
      {activeTab === "academic" && (
        <div className="bento-card p-6 sm:p-8 border border-slate-200 bg-white/95 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 font-display">Academic Details</h3>
            <p className="text-xs text-slate-600 font-medium">Used for hackathon eligibility, student verification, and internship forms.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">University / College / Institute</label>
              <input
                type="text"
                value={profile.university || ""}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-xs text-slate-900 outline-none font-medium shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Degree Program</label>
              <input
                type="text"
                value={profile.degree || ""}
                onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                placeholder="e.g. Bachelor of Technology (B.Tech)"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-xs text-slate-900 outline-none font-medium shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Major / Branch</label>
              <input
                type="text"
                value={profile.major || ""}
                onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                placeholder="e.g. Computer Science and Engineering"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-xs text-slate-900 outline-none font-medium shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Graduation Year</label>
              <input
                type="text"
                value={profile.graduation_year || ""}
                onChange={(e) => setProfile({ ...profile, graduation_year: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-xs text-slate-900 outline-none font-medium shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">GPA / CGPA / Percentage</label>
              <input
                type="text"
                value={profile.gpa_cgpa || ""}
                onChange={(e) => setProfile({ ...profile, gpa_cgpa: e.target.value })}
                placeholder="e.g. 8.9 / 10.0"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-xs text-slate-900 outline-none font-medium shadow-inner"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Projects & Skills ── */}
      {activeTab === "professional" && (
        <div className="bento-card p-6 sm:p-8 border border-slate-200 bg-white/95 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 font-display">Professional Links & Synthesis Context</h3>
            <p className="text-xs text-slate-600 font-medium">Scout's AI uses this background to write tailored essay and project answers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">GitHub Profile URL</label>
              <input
                type="url"
                value={profile.github_url || ""}
                onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-xs text-slate-900 outline-none font-mono shadow-inner font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">LinkedIn Profile URL</label>
              <input
                type="url"
                value={profile.linkedin_url || ""}
                onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-xs text-slate-900 outline-none font-mono shadow-inner font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Portfolio / Website URL</label>
              <input
                type="url"
                value={profile.portfolio_url || ""}
                onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-xs text-slate-900 outline-none font-mono shadow-inner font-medium"
              />
            </div>
          </div>

          {/* Skills Management */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Technical Skills & Stacks</label>
            <div className="flex flex-wrap gap-2 pb-2">
              {(profile.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 flex items-center gap-1.5 shadow-sm"
                >
                  <span>{skill}</span>
                  <button onClick={() => removeSkill(skill)} className="hover:text-rose-600 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. PyTorch, Next.js, Solana)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white font-medium"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 shadow-sm cursor-pointer"
              >
                Add Skill
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Key Projects Summary</label>
            <textarea
              rows={3}
              value={profile.projects_summary || ""}
              onChange={(e) => setProfile({ ...profile, projects_summary: e.target.value })}
              placeholder="Describe your major projects..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl p-3 text-xs text-slate-900 outline-none font-medium shadow-inner"
            />
          </div>
        </div>
      )}

      {/* ── Tab 4: Custom Key Vault ── */}
      {activeTab === "vault" && (
        <div className="bento-card p-6 sm:p-8 border border-slate-200 bg-white/95 space-y-6 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-black text-slate-900 font-display">Custom Key-Value Identity Vault</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Add any custom fields or ID numbers (e.g. Student ID, Passport, Aadhaar, Team Name). Scout will match them automatically when questions appear!
            </p>
          </div>

          {/* Current Key Value Entries */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(profile.custom_vault || {}).map(([k, v]) => (
              <div key={k} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 font-mono text-xs shadow-sm">
                <div className="min-w-0">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block truncate">{k}</span>
                  <span className="text-emerald-700 font-semibold block truncate">{v}</span>
                </div>
                <button
                  onClick={() => removeVaultEntry(k)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Key Value Pair Form */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 block">Add Custom Identity Field:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Field Name (e.g. Student ID, Passport Number)"
                value={newVaultKey}
                onChange={(e) => setNewVaultKey(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 font-medium"
              />
              <input
                type="text"
                placeholder="Value (e.g. 2022CS104, X1234567)"
                value={newVaultValue}
                onChange={(e) => setNewVaultValue(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 font-medium"
              />
            </div>
            <button
              type="button"
              onClick={addVaultEntry}
              disabled={!newVaultKey || !newVaultValue}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Save to Identity Vault</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Tab 5: Radar Matching Rules ── */}
      {activeTab === "radar" && (
        <div className="bento-card p-6 sm:p-8 border border-slate-200 bg-white/95 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 font-display">Radar Scoring & Filtering Preferences</h3>
            <p className="text-xs text-slate-600 font-medium">Used by Scout's multi-factor matcher to score opportunities on your dashboard feed.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Include Tags / Interests</label>
              <div className="flex flex-wrap gap-2">
                {(profile.include_tags || []).map((t) => (
                  <span key={t} className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold shadow-sm">
                    +{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Exclude Tags / Penalties</label>
              <div className="flex flex-wrap gap-2">
                {(profile.exclude_tags || []).map((t) => (
                  <span key={t} className="px-3 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-mono font-bold shadow-sm">
                    -{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
