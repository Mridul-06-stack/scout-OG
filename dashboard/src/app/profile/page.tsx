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
  X
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
      <div className="p-8 max-w-4xl mx-auto text-center text-xs text-slate-400">
        Loading user preferences...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Matcher Configuration
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            User Preference Profile
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Defines scoring weights for the Scout Matcher & Claude semantic ranker
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
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
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Preferences successfully updated! Subsequent pipeline runs will score against these new rules.</span>
        </div>
      )}

      {/* Attributes Section */}
      <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          User Profile Attributes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Primary Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#141624] border border-white/10 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              University / Institute
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full bg-[#141624] border border-white/10 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Hotel Max Budget / Night (₹)
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full bg-[#141624] border border-white/10 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all font-mono"
            />
          </div>
        </div>
      </div>

      {/* Target Interest Tags */}
      <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Preferred Interest Tags (+ Boost Score)
        </h3>

        <div className="flex flex-wrap gap-2">
          {includeTags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-xl text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5"
            >
              <span>{tag}</span>
              <button
                onClick={() => removeIncludeTag(tag)}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="Add tag (e.g. rust, web3, remote, hackathon)..."
            value={newIncludeTag}
            onChange={(e) => setNewIncludeTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIncludeTag())}
            className="flex-1 bg-[#141624] border border-white/10 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
          <button
            onClick={addIncludeTag}
            className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Exclude Tags */}
      <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Tag className="w-4 h-4 text-rose-400" />
          Excluded Tags (- Penalty Filter)
        </h3>

        <div className="flex flex-wrap gap-2">
          {excludeTags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-xl text-xs bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5"
            >
              <span>{tag}</span>
              <button
                onClick={() => removeExcludeTag(tag)}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="Add excluded tag (e.g. unpaid, luxury)..."
            value={newExcludeTag}
            onChange={(e) => setNewExcludeTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExcludeTag())}
            className="flex-1 bg-[#141624] border border-white/10 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
          <button
            onClick={addExcludeTag}
            className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
