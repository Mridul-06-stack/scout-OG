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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"personal" | "academic" | "professional" | "vault" | "radar">("personal");
  const [newSkill, setNewSkill] = useState("");
  const [newVaultKey, setNewVaultKey] = useState("");
  const [newVaultValue, setNewVaultValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message?: string; error?: string } | null>(null);

  useEffect(() => {
    fetchProfile().then(setProfile).catch(console.error);
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

  if (!profile) {
    return (
      <div className="p-10 text-center text-slate-400 font-mono text-xs">
        Loading Identity Vault...
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-6xl mx-auto w-full">
      {/* ── Top Header Bento ── */}
      <div className="bento-card p-6 sm:p-8 border border-white/[0.09] bg-gradient-to-r from-[#111326] via-[#141834] to-[#1e1438] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Identity Vault Active
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Encrypted Local Storage
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            User Identity Vault & Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Your personal information source for Scout's AI Form Agent & opportunity matcher
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50 hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Identity Vault"}</span>
          </button>
        </div>
      </div>

      {feedback?.message && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-2.5 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {feedback?.error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs font-bold text-rose-300 flex items-center gap-2.5 shadow-lg shadow-rose-500/10">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{feedback.error}</span>
        </div>
      )}

      {/* ── Identity Vault Multi-Tab Segment Bar ── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#090b1c] border border-white/[0.08] shadow-inner">
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
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
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
        <div className="bento-card p-6 sm:p-8 border border-white/[0.08] space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-black text-white">Personal Information</h3>
            <p className="text-xs text-slate-400 font-medium">Used to automatically fill applicant name, contact, and address fields on forms.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Full Name</label>
              <input
                type="text"
                value={profile.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white outline-none font-medium shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Email Address</label>
              <input
                type="email"
                value={profile.email || ""}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white outline-none font-medium shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Phone / Mobile</label>
              <input
                type="text"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white outline-none font-medium shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Date of Birth</label>
              <input
                type="date"
                value={profile.date_of_birth || ""}
                onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white outline-none font-medium shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Gender</label>
              <select
                value={profile.gender || "Male"}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white outline-none font-medium shadow-inner"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">City</label>
              <input
                type="text"
                value={profile.city || ""}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white outline-none font-medium shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Full Street Address</label>
            <input
              type="text"
              value={profile.address || ""}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white outline-none font-medium shadow-inner"
            />
          </div>
        </div>
      )}

      {/* ── Tab 2: Academic & College ── */}
      {activeTab === "academic" && (
        <div className="bento-card p-6 sm:p-8 border border-white/[0.08] space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-black text-white">Academic Details</h3>
            <p className="text-xs text-slate-400 font-medium">Used for hackathon eligibility, student verification, and internship forms.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">University / College / Institute</label>
              <input
                type="text"
                value={profile.university || ""}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white outline-none font-medium shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Degree Program</label>
              <input
                type="text"
                value={profile.degree || ""}
                onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                placeholder="e.g. Bachelor of Technology (B.Tech)"
                className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white outline-none font-medium shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Major / Branch</label>
              <input
                type="text"
                value={profile.major || ""}
                onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                placeholder="e.g. Computer Science and Engineering"
                className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white outline-none font-medium shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Graduation Year</label>
              <input
                type="text"
                value={profile.graduation_year || ""}
                onChange={(e) => setProfile({ ...profile, graduation_year: e.target.value })}
                className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white outline-none font-medium shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">GPA / CGPA / Percentage</label>
              <input
                type="text"
                value={profile.gpa_cgpa || ""}
                onChange={(e) => setProfile({ ...profile, gpa_cgpa: e.target.value })}
                placeholder="e.g. 8.9 / 10.0"
                className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white outline-none font-medium shadow-inner"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Projects & Skills ── */}
      {activeTab === "professional" && (
        <div className="bento-card p-6 sm:p-8 border border-white/[0.08] space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-black text-white">Professional Links & Synthesis Context</h3>
            <p className="text-xs text-slate-400 font-medium">Scout's AI uses this background to write tailored essay and project answers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">GitHub Profile URL</label>
              <input
                type="url"
                value={profile.github_url || ""}
                onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white outline-none font-mono shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">LinkedIn Profile URL</label>
              <input
                type="url"
                value={profile.linkedin_url || ""}
                onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white outline-none font-mono shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Portfolio / Website URL</label>
              <input
                type="url"
                value={profile.portfolio_url || ""}
                onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white outline-none font-mono shadow-inner"
              />
            </div>
          </div>

          {/* Skills Management */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Technical Skills & Stacks</label>
            <div className="flex flex-wrap gap-2 pb-2">
              {(profile.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-xs font-bold text-indigo-300 flex items-center gap-1.5"
                >
                  <span>{skill}</span>
                  <button onClick={() => removeSkill(skill)} className="hover:text-rose-400">
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
                className="bg-[#121528] border border-white/[0.08] rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl text-xs font-bold text-white border border-white/[0.08]"
              >
                Add Skill
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Key Projects Summary</label>
            <textarea
              rows={3}
              value={profile.projects_summary || ""}
              onChange={(e) => setProfile({ ...profile, projects_summary: e.target.value })}
              placeholder="Describe your major projects..."
              className="w-full bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl p-3 text-xs text-white outline-none font-medium shadow-inner"
            />
          </div>
        </div>
      )}

      {/* ── Tab 4: Custom Key Vault ── */}
      {activeTab === "vault" && (
        <div className="bento-card p-6 sm:p-8 border border-white/[0.08] space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-black text-white">Custom Key-Value Identity Vault</h3>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Add any custom fields or ID numbers (e.g. Student ID, Passport, Aadhaar, Team Name). Scout will match them automatically when questions appear!
            </p>
          </div>

          {/* Current Key Value Entries */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(profile.custom_vault || {}).map(([k, v]) => (
              <div key={k} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-3 font-mono text-xs">
                <div className="min-w-0">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block truncate">{k}</span>
                  <span className="text-emerald-300 font-semibold block truncate">{v}</span>
                </div>
                <button
                  onClick={() => removeVaultEntry(k)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Key Value Pair Form */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
            <span className="text-xs font-bold text-slate-300 block">Add Custom Identity Field:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Field Name (e.g. Student ID, Passport Number)"
                value={newVaultKey}
                onChange={(e) => setNewVaultKey(e.target.value)}
                className="bg-[#121528] border border-white/[0.08] rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-indigo-500 font-medium"
              />
              <input
                type="text"
                placeholder="Value (e.g. 2022CS104, X1234567)"
                value={newVaultValue}
                onChange={(e) => setNewVaultValue(e.target.value)}
                className="bg-[#121528] border border-white/[0.08] rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-indigo-500 font-medium"
              />
            </div>
            <button
              type="button"
              onClick={addVaultEntry}
              disabled={!newVaultKey || !newVaultValue}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              <span>Save to Identity Vault</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Tab 5: Radar Matching Rules ── */}
      {activeTab === "radar" && (
        <div className="bento-card p-6 sm:p-8 border border-white/[0.08] space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-black text-white">Radar Scoring & Filtering Preferences</h3>
            <p className="text-xs text-slate-400 font-medium">Used by Scout's multi-factor matcher to score opportunities on your dashboard feed.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Include Tags / Interests</label>
              <div className="flex flex-wrap gap-2">
                {(profile.include_tags || []).map((t) => (
                  <span key={t} className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                    +{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Exclude Tags / Penalties</label>
              <div className="flex flex-wrap gap-2">
                {(profile.exclude_tags || []).map((t) => (
                  <span key={t} className="px-3 py-1 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
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
