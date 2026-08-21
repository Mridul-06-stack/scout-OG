"use client";

import { useEffect, useState } from "react";
import { 
  UserCircle, 
  Tag, 
  Save, 
  CheckCircle2, 
  Sliders, 
  MapPin, 
  GraduationCap,
  Sparkles,
  Plus,
  X,
  DollarSign,
  Layers
} from "lucide-react";
import { fetchProfile, updateProfile } from "@/lib/api";
import { UserProfile } from "@/lib/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [includeTags, setIncludeTags] = useState<string[]>([]);
  const [excludeTags, setExcludeTags] = useState<string[]>([]);
  const [newIncludeTag, setNewIncludeTag] = useState("");
  const [newExcludeTag, setNewExcludeTag] = useState("");
  const [location, setLocation] = useState("India");
  const [university, setUniversity] = useState("NIT Hamirpur");
  const [maxPrice, setMaxPrice] = useState(3000);

  useEffect(() => {
    fetchProfile()
      .then((data) => {
        setProfile(data);
        setIncludeTags(data.include_tags || []);
        setExcludeTags(data.exclude_tags || []);
        setLocation(data.attributes?.location || "India");
        setUniversity(data.attributes?.university || "NIT Hamirpur");
        setMaxPrice(data.constraints?.max_price || 3000);
      })
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        include_tags: includeTags,
        exclude_tags: excludeTags,
        attributes: {
          ...profile?.attributes,
          location,
          university,
        },
        constraints: {
          ...profile?.constraints,
          max_price: Number(maxPrice),
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const addIncludeTag = () => {
    if (newIncludeTag.trim() && !includeTags.includes(newIncludeTag.trim())) {
      setIncludeTags([...includeTags, newIncludeTag.trim()]);
      setNewIncludeTag("");
    }
  };

  const removeIncludeTag = (tag: string) => {
    setIncludeTags(includeTags.filter((t) => t !== tag));
  };

  const addExcludeTag = () => {
    if (newExcludeTag.trim() && !excludeTags.includes(newExcludeTag.trim())) {
      setExcludeTags([...excludeTags, newExcludeTag.trim()]);
      setNewExcludeTag("");
    }
  };

  const removeExcludeTag = (tag: string) => {
    setExcludeTags(excludeTags.filter((t) => t !== tag));
  };

  if (loading) {
    return (
      <div className="p-12 max-w-4xl mx-auto text-center text-xs text-slate-400 font-medium">
        Loading personalized matcher profile...
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-5xl mx-auto w-full">
      {/* ── Top Header Bento ── */}
      <div className="bento-card p-6 sm:p-8 border border-white/[0.09] bg-gradient-to-r from-[#111326] via-[#161a34] to-[#121428] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Personalization Profile
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Multi-Factor Matcher Weights
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            User Preference Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Tunes ranking algorithms & OpenAI <code className="text-indigo-300 font-mono">gpt-4o-mini</code> semantic evaluations
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 hover:scale-[1.02] z-10 disabled:opacity-50"
        >
          {saving ? (
            <span>Saving...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-2.5 animate-in fade-in duration-200 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Profile saved! All subsequent radar runs will score opportunities against these personalized constraints.</span>
        </div>
      )}

      {/* ── Attributes Section Bento ── */}
      <div className="bento-card p-6 sm:p-8 border border-white/[0.08] space-y-6 shadow-xl">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          User Profile Attributes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Primary Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#121526] border border-white/[0.08] focus:border-indigo-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all shadow-inner font-sans font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              University / Institute
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full bg-[#121526] border border-white/[0.08] focus:border-indigo-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all shadow-inner font-sans font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Max Hotel Budget (₹ / Night)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full bg-[#121526] border border-white/[0.08] focus:border-indigo-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all shadow-inner font-mono font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Target Interest Tags Bento ── */}
      <div className="bento-card p-6 sm:p-8 border border-white/[0.08] space-y-5 shadow-xl">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Preferred Interest Tags (+ Score Boost)
        </h3>

        <div className="flex flex-wrap gap-2">
          {includeTags.map((tag) => (
            <span
              key={tag}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-2 shadow-sm"
            >
              <span>{tag}</span>
              <button
                onClick={() => removeIncludeTag(tag)}
                className="hover:text-white p-0.5 rounded-md hover:bg-emerald-500/20"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2.5 pt-2">
          <input
            type="text"
            placeholder="Add tag (e.g. rust, web3, remote, ai, python)..."
            value={newIncludeTag}
            onChange={(e) => setNewIncludeTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIncludeTag())}
            className="flex-1 bg-[#121526] border border-white/[0.08] focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
          />
          <button
            onClick={addIncludeTag}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-black transition-all flex items-center gap-1.5 hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* ── Exclude Penalty Tags Bento ── */}
      <div className="bento-card p-6 sm:p-8 border border-white/[0.08] space-y-5 shadow-xl">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Tag className="w-4 h-4 text-rose-400" />
          Excluded Penalty Tags (- Hard Filter)
        </h3>

        <div className="flex flex-wrap gap-2">
          {excludeTags.map((tag) => (
            <span
              key={tag}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-2 shadow-sm"
            >
              <span>{tag}</span>
              <button
                onClick={() => removeExcludeTag(tag)}
                className="hover:text-white p-0.5 rounded-md hover:bg-rose-500/20"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2.5 pt-2">
          <input
            type="text"
            placeholder="Add excluded tag (e.g. unpaid, non-tech, luxury)..."
            value={newExcludeTag}
            onChange={(e) => setNewExcludeTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExcludeTag())}
            className="flex-1 bg-[#121526] border border-white/[0.08] focus:border-rose-500 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
          />
          <button
            onClick={addExcludeTag}
            className="px-5 py-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-black transition-all flex items-center gap-1.5 hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
