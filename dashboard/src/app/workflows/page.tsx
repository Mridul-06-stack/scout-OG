"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Sparkles, 
  Globe, 
  ArrowDownCircle, 
  Brain, 
  Camera, 
  Layers, 
  Trash2, 
  Plus, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  MousePointer, 
  FileText, 
  ShieldCheck, 
  Clock, 
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Eye,
  Sliders,
  Share2,
  Maximize2,
  Copy,
  Check,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Zap,
  Gamepad2,
  Compass,
  Cpu
} from "lucide-react";
import { 
  fetchWorkflows, 
  synthesizeWorkflow, 
  runWorkflow, 
  saveWorkflow 
} from "@/lib/api";
import { 
  WorkflowDefinition, 
  WorkflowStep, 
  WorkflowExecutionResult 
} from "@/lib/types";

const BLOCK_TYPES = [
  { type: "navigate", label: "Navigate URL", icon: Globe, color: "text-blue-600 border-blue-200 bg-blue-50", defaultParams: { url: "https://news.ycombinator.com" } },
  { type: "scroll", label: "Smart Scroll", icon: ArrowDownCircle, color: "text-amber-600 border-amber-200 bg-amber-50", defaultParams: { scroll_times: 3, delay_ms: 1000, target: "" } },
  { type: "click", label: "Click Element", icon: MousePointer, color: "text-emerald-600 border-emerald-200 bg-emerald-50", defaultParams: { selector: "article.Box-row h2 a, h2 a, a" } },
  { type: "extract_text", label: "Extract Text", icon: FileText, color: "text-teal-600 border-teal-200 bg-teal-50", defaultParams: { target: "readme", label: "README Documentation" } },
  { type: "ai_filter", label: "AI Content Filter", icon: Brain, color: "text-purple-600 border-purple-200 bg-purple-50", defaultParams: { criteria: "Find top 3 highest quality articles", limit: 3 } },
  { type: "screenshot", label: "Capture Snapshot", icon: Camera, color: "text-pink-600 border-pink-200 bg-pink-50", defaultParams: { label: "page_snapshot" } },
  { type: "export", label: "Export Artifacts", icon: Save, color: "text-cyan-600 border-cyan-200 bg-cyan-50", defaultParams: { notify: true } },
];

const INITIAL_PRESETS: WorkflowDefinition[] = [
  {
    id: "template-bounty-hunter",
    name: "Autonomous Open-Source Bounty Hunter",
    description: "Visits GitHub Trending AI repositories, extracts README, scores with LLM, and captures visual proof.",
    category: "Developer & Open Source",
    steps: [
      {
        id: "step-1",
        type: "navigate",
        title: "Navigate to GitHub Trending",
        description: "Opens GitHub Trending repositories page in CloakBrowser",
        params: { url: "https://github.com/trending" },
        icon: "Globe",
      },
      {
        id: "step-2",
        type: "click",
        title: "Inspect Top AI Repository",
        description: "Clicks on the first trending repo to view code and docs",
        params: { selector: "article.Box-row h2 a, h2 a, a[href*='/'].text-bold" },
        icon: "MousePointer",
      },
      {
        id: "step-3",
        type: "scroll",
        title: "Dynamic Smart Scroll",
        description: "Scrolls through the repository to trigger full lazy load",
        params: { scroll_times: 3, delay_ms: 1000, target: "" },
        icon: "ArrowDownCircle",
      },
      {
        id: "step-4",
        type: "extract_text",
        title: "Extract README & Tech Stack",
        description: "Scrapes the complete README documentation text",
        params: { target: "readme", label: "Repository Documentation" },
        icon: "FileText",
      },
      {
        id: "step-5",
        type: "screenshot",
        title: "Capture Visual Telemetry Proof",
        description: "Takes high-resolution screenshot of repository state",
        params: { label: "repo_verification" },
        icon: "Camera",
      },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: "template-form-solver",
    name: "College Club & Hackathon Form Solver",
    description: "Navigates to application portal, matches questions with Identity Vault, fills blanks, and captures proof.",
    category: "Automation & Identity",
    steps: [
      {
        id: "step-1",
        type: "navigate",
        title: "Open Registration Portal",
        description: "Navigates to club or hackathon application form",
        params: { url: "https://unstop.com/hackathons" },
        icon: "Globe",
      },
      {
        id: "step-2",
        type: "ai_filter",
        title: "Harvester & Identity Matcher",
        description: "Matches question fields against user profile in Identity Vault",
        params: { criteria: "Extract all form blanks, requirements, and personal questions" },
        icon: "Brain",
      },
      {
        id: "step-3",
        type: "screenshot",
        title: "Capture Pre-Fill Verification",
        description: "Takes high-resolution screenshot of filled application",
        params: { label: "form_proof" },
        icon: "Camera",
      },
      {
        id: "step-4",
        type: "export",
        title: "Stage to Approval Gate",
        description: "Stages the filled application for 1-click human confirmation",
        params: { gate: true },
        icon: "ShieldCheck",
      },
    ],
    created_at: new Date().toISOString(),
  },
];

export default function WorkflowStudioPage() {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>(INITIAL_PRESETS);
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowDefinition | null>(INITIAL_PRESETS[0]);
  const [prompt, setPrompt] = useState("");
  const [synthesizing, setSynthesizing] = useState(false);
  const [running, setRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<WorkflowExecutionResult | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const loadAllWorkflows = async () => {
    try {
      const data = await fetchWorkflows();
      if (data?.workflows && data.workflows.length > 0) {
        setWorkflows(data.workflows);
        setActiveWorkflow((prev) => prev || data.workflows[0]);
      }
    } catch (err) {
      console.error("Failed to load workflows:", err);
    }
  };

  useEffect(() => {
    loadAllWorkflows();
  }, []);

  const handleSynthesize = async (promptText?: string) => {
    const textToUse = promptText || prompt;
    if (!textToUse.trim()) return;

    setSynthesizing(true);
    setExecutionResult(null);
    try {
      const res = await synthesizeWorkflow(textToUse.trim());
      if (res.workflow) {
        setActiveWorkflow(res.workflow);
        setWorkflows((prev) => [res.workflow, ...prev.filter((w) => w.id !== res.workflow.id)]);
        setFeedback(`✨ AI compiled: "${res.workflow.name}" with ${res.workflow.steps.length} action blocks!`);
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      setFeedback(`Failed to compile workflow: ${err.message}`);
    } finally {
      setSynthesizing(false);
    }
  };

  const handleRunWorkflow = async () => {
    if (!activeWorkflow) return;
    setRunning(true);
    setExecutionResult(null);
    setCopiedText(false);
    try {
      const res = await runWorkflow(activeWorkflow);
      setExecutionResult(res);
      if (res.screenshots && res.screenshots.length > 0) {
        setSelectedScreenshot(res.screenshots[0]);
      }
    } catch (err: any) {
      setFeedback(`Workflow run error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  const handleSaveWorkflow = async () => {
    if (!activeWorkflow) return;
    try {
      await saveWorkflow(activeWorkflow);
      setFeedback("✓ Workflow definition saved!");
      setTimeout(() => setFeedback(null), 3000);
      loadAllWorkflows();
    } catch (err: any) {
      setFeedback(`Failed to save: ${err.message}`);
    }
  };

  const addStep = (blockType: string) => {
    if (!activeWorkflow) return;
    const blockDef = BLOCK_TYPES.find((b) => b.type === blockType);
    if (!blockDef) return;

    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type: blockDef.type as any,
      title: `${activeWorkflow.steps.length + 1}. ${blockDef.label}`,
      description: `Execute ${blockDef.label} action`,
      params: { ...blockDef.defaultParams },
    };

    setActiveWorkflow({
      ...activeWorkflow,
      steps: [...activeWorkflow.steps, newStep],
    });
  };

  const removeStep = (stepId: string) => {
    if (!activeWorkflow) return;
    const filtered = activeWorkflow.steps.filter((s) => s.id !== stepId);
    setActiveWorkflow({
      ...activeWorkflow,
      steps: filtered,
    });
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    if (!activeWorkflow) return;
    const newSteps = [...activeWorkflow.steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;

    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;

    setActiveWorkflow({
      ...activeWorkflow,
      steps: newSteps,
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index || !activeWorkflow) return;
    const newSteps = [...activeWorkflow.steps];
    const item = newSteps.splice(draggedIndex, 1)[0];
    newSteps.splice(index, 0, item);
    setActiveWorkflow({
      ...activeWorkflow,
      steps: newSteps,
    });
    setDraggedIndex(null);
  };

  const updateStepParam = (stepIndex: number, key: string, value: any) => {
    if (!activeWorkflow) return;
    const updatedSteps = [...activeWorkflow.steps];
    updatedSteps[stepIndex].params[key] = value;
    setActiveWorkflow({
      ...activeWorkflow,
      steps: updatedSteps,
    });
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* ── Top Header Bento (Light Luxury) ── */}
      <div className="bento-card p-6 sm:p-8 border border-slate-200/90 bg-gradient-to-r from-white via-indigo-50/40 to-purple-50/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        {/* Subtle Game HUD Lines */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1.5 font-mono">
              <Gamepad2 className="w-3.5 h-3.5 text-indigo-600" />
              Node Quest Studio
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Interactive Game-Style Action Canvas
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            Visual Autonomous Workflow Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-3xl">
            Drag, configure & link autonomous action nodes · Connect with live flow curves · Injected with Identity Vault cookies · Zero code needed
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={handleRunWorkflow}
            disabled={running || !activeWorkflow || activeWorkflow.steps.length === 0}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2.5 disabled:opacity-50 hover:scale-105 active:scale-95 cursor-pointer"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Executing Nodes...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Launch Agent Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-900 flex items-center gap-2.5 shadow-sm animate-in fade-in">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ── AI Natural Language Prompt Compiler Bar (Light Glassmorphism) ── */}
      <div className="bento-card p-6 sm:p-7 border border-indigo-200/80 bg-white/90 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 font-mono">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            AI Natural Language Workflow Generator
          </span>
          <span className="text-[11px] text-slate-500 font-mono font-semibold">Powered by gpt-4o-mini</span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <input
            type="text"
            placeholder="Type any goal in plain English (e.g. 'Find good first issues on GitHub, scroll to README, copy its text, and take a screenshot')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSynthesize()}
            className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium shadow-inner transition-all"
          />
          <button
            onClick={() => handleSynthesize()}
            disabled={synthesizing || !prompt}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          >
            {synthesizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Compiling Graph...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Compile Action Graph</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Example Prompt Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Try ideas:</span>
          {[
            "Find GitHub trending repos, click first repo, and copy its README text",
            "Scroll tech blog page, find good AI articles and take screenshots",
            "Monitor trending stocks and capture chart snapshots",
            "Scan hackathon portal and pre-fill application questions",
            "Explore top AI tools on Product Hunt and extract launches",
          ].map((example, i) => (
            <button
              key={i}
              onClick={() => {
                setPrompt(example);
                handleSynthesize(example);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-300 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* ── Preset Workflows Selector Bar ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 font-mono">
            Workflows & Presets ({workflows.length})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {workflows.map((wf) => {
            const isSelected = activeWorkflow?.id === wf.id;
            return (
              <button
                key={wf.id}
                onClick={() => {
                  setActiveWorkflow(wf);
                  setExecutionResult(null);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2.5 cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02] border border-indigo-600"
                    : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{wf.name}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {wf.steps.length} Steps
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Workflow Video Game Action Canvas ── */}
      {activeWorkflow && (
        <div className="space-y-6">
          <div className="game-blueprint-grid rounded-3xl p-6 sm:p-8 border border-slate-300/80 shadow-md space-y-8 relative overflow-hidden">
            {/* Canvas Header HUD */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 bg-white/80 backdrop-blur-md p-4 rounded-2xl border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 font-display">
                    <span>{activeWorkflow.name}</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 font-mono">
                    {activeWorkflow.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">{activeWorkflow.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveWorkflow}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Save Workflow</span>
                </button>
              </div>
            </div>

            {/* ── Interactive Draggable Action Blocks Graph with Dashed Flow Arrows ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 font-mono flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  Action Pipeline Nodes (Drag & Reorder blocks):
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {activeWorkflow.steps.length} Linked Nodes
                </span>
              </div>

              {/* Node Chain Layout */}
              <div className="space-y-6">
                {activeWorkflow.steps.map((step, idx) => {
                  const blockDef = BLOCK_TYPES.find((b) => b.type === step.type) || BLOCK_TYPES[0];
                  const Icon = blockDef.icon;
                  const isLast = idx === activeWorkflow.steps.length - 1;

                  return (
                    <React.Fragment key={step.id}>
                      {/* Draggable Action Node Card */}
                      <div
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={() => handleDrop(idx)}
                        className={`game-node-card p-5 relative group ${
                          draggedIndex === idx ? "opacity-50 scale-95" : ""
                        }`}
                      >
                        {/* Node HUD Level Bar */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                          <div className="flex items-center gap-2">
                            {/* Drag Grip Handle */}
                            <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-slate-100">
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 font-mono border border-slate-200">
                              NODE #{String(idx + 1).padStart(2, "0")}
                            </span>

                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider font-mono border ${blockDef.color}`}>
                              {step.type}
                            </span>
                          </div>

                          {/* Reorder and Delete Controls */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveStep(idx, "up")}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 rounded hover:bg-slate-100"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moveStep(idx, "down")}
                              disabled={isLast}
                              className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 rounded hover:bg-slate-100"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeStep(step.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 ml-1 transition-colors"
                              title="Delete Block"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Node Content Body */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                          <div className="md:col-span-4 flex items-start gap-3">
                            <div className={`p-3 rounded-2xl border shadow-sm shrink-0 ${blockDef.color}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                                {step.title}
                              </h4>
                              <p className="text-xs text-slate-500 font-medium mt-1">
                                {step.description}
                              </p>
                            </div>
                          </div>

                          {/* Node Parameter Customizer Box */}
                          <div className="md:col-span-8 bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 shadow-inner">
                            {step.type === "navigate" && (
                              <div>
                                <label className="block text-[10px] text-slate-500 font-mono uppercase font-bold mb-1">Target URL</label>
                                <input
                                  type="text"
                                  value={step.params.url || ""}
                                  onChange={(e) => updateStepParam(idx, "url", e.target.value)}
                                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none shadow-sm"
                                  placeholder="https://..."
                                />
                              </div>
                            )}

                            {step.type === "click" && (
                              <div>
                                <label className="block text-[10px] text-slate-500 font-mono uppercase font-bold mb-1">Target Selector / Intent Text</label>
                                <input
                                  type="text"
                                  value={step.params.selector || ""}
                                  onChange={(e) => updateStepParam(idx, "selector", e.target.value)}
                                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none shadow-sm"
                                  placeholder="e.g. button:has-text('Download'), h2 a, a"
                                />
                              </div>
                            )}

                            {step.type === "extract_text" && (
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] text-slate-500 font-mono uppercase font-bold mb-1">Content Target</label>
                                  <input
                                    type="text"
                                    value={step.params.target || "readme"}
                                    onChange={(e) => updateStepParam(idx, "target", e.target.value)}
                                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none shadow-sm"
                                    placeholder="readme | article | auto"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-500 font-mono uppercase font-bold mb-1">Content Label</label>
                                  <input
                                    type="text"
                                    value={step.params.label || "README Content"}
                                    onChange={(e) => updateStepParam(idx, "label", e.target.value)}
                                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none shadow-sm"
                                  />
                                </div>
                              </div>
                            )}

                            {step.type === "scroll" && (
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] text-slate-500 font-mono uppercase font-bold mb-1">Scroll Times</label>
                                  <input
                                    type="number"
                                    value={step.params.scroll_times || 3}
                                    onChange={(e) => updateStepParam(idx, "scroll_times", Number(e.target.value))}
                                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none shadow-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-500 font-mono uppercase font-bold mb-1">Delay (ms)</label>
                                  <input
                                    type="number"
                                    value={step.params.delay_ms || 1000}
                                    onChange={(e) => updateStepParam(idx, "delay_ms", Number(e.target.value))}
                                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none shadow-sm"
                                  />
                                </div>
                              </div>
                            )}

                            {step.type === "ai_filter" && (
                              <div>
                                <label className="block text-[10px] text-slate-500 font-mono uppercase font-bold mb-1">AI Prompt Criteria</label>
                                <textarea
                                  rows={2}
                                  value={step.params.criteria || ""}
                                  onChange={(e) => updateStepParam(idx, "criteria", e.target.value)}
                                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-2 text-xs text-slate-900 outline-none shadow-sm"
                                />
                              </div>
                            )}

                            {step.type === "screenshot" && (
                              <div>
                                <label className="block text-[10px] text-slate-500 font-mono uppercase font-bold mb-1">Snapshot Label</label>
                                <input
                                  type="text"
                                  value={step.params.label || "snapshot"}
                                  onChange={(e) => updateStepParam(idx, "label", e.target.value)}
                                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none shadow-sm"
                                />
                              </div>
                            )}

                            {step.type === "export" && (
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 py-1">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>Export full structured proofs & screenshots to Scout Gallery</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ── Animated Dashed Curvy SVG Flow Wire between Nodes ── */}
                      {!isLast && (
                        <div className="flex justify-center items-center py-1 relative">
                          <svg width="120" height="50" viewBox="0 0 120 50" className="overflow-visible">
                            <defs>
                              <linearGradient id={`flow-grad-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="50%" stopColor="#a855f7" />
                                <stop offset="100%" stopColor="#3b82f6" />
                              </linearGradient>
                            </defs>
                            {/* Curvy S-Bezier connector arrow */}
                            <path
                              d="M 60,0 C 60,25 60,25 60,42"
                              fill="none"
                              stroke={`url(#flow-grad-${idx})`}
                              strokeWidth="3"
                              strokeDasharray="6 6"
                              className="animate-dash-flow"
                            />
                            {/* Flow Arrow Head */}
                            <polygon points="55,40 65,40 60,48" fill="#3b82f6" />
                            {/* Glowing Socket Pulse Dot */}
                            <circle cx="60" cy="0" r="4" fill="#6366f1" />
                          </svg>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* ── Add Action Block Inventory / Ability Bar ── */}
            <div className="pt-6 border-t border-slate-200 bg-white/80 backdrop-blur-md p-4 rounded-2xl border space-y-3">
              <span className="text-xs font-extrabold text-slate-700 block uppercase font-mono">
                + Add Action Ability to Pipeline:
              </span>
              <div className="flex flex-wrap gap-2">
                {BLOCK_TYPES.map((block) => {
                  const Icon = block.icon;
                  return (
                    <button
                      key={block.type}
                      onClick={() => addStep(block.type)}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-300 text-xs font-bold transition-all flex items-center gap-2 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-600" />
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{block.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Live Execution Deck & Visual Artifact Gallery (Light Luxury) ── */}
      {executionResult && (
        <div className="bento-card p-6 sm:p-8 border border-emerald-300 bg-emerald-50/40 space-y-6 shadow-md animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Autonomous Workflow Run Finished ({executionResult.completed_steps}/{executionResult.total_steps} Steps)
                </h3>
                <span className="text-[11px] font-mono text-emerald-700 font-bold">
                  Status: {executionResult.status.toUpperCase()} · Executed in Real CloakBrowser
                </span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Telemetry Cards */}
          <div className="space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 font-mono block">
              Step Execution Telemetry:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {executionResult.step_results.map((sr, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-900 font-bold text-xs">{sr.title}</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-extrabold">{sr.duration_ms}ms</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono">{sr.output_message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Extracted Live Text / README Box (if available) ── */}
          {executionResult.extracted_text && (
            <div className="space-y-3 pt-4 border-t border-emerald-200 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-wider text-teal-800 font-mono flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Extracted Live Content & Documentation ({executionResult.extracted_text.length} Characters):
                </span>
                <button
                  onClick={() => handleCopyText(executionResult.extracted_text!)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black transition-all flex items-center gap-2 shadow-sm hover:scale-105 cursor-pointer"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Full Output</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-teal-200 shadow-inner font-mono text-xs text-slate-800 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text selection:bg-teal-100">
                {executionResult.extracted_text}
              </div>
            </div>
          )}

          {/* Extracted Items / Articles Table */}
          {executionResult.extracted_items && executionResult.extracted_items.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-emerald-200">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 font-mono block">
                Extracted & AI-Filtered Items ({executionResult.extracted_items.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {executionResult.extracted_items.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-100 text-indigo-800 border border-indigo-200 font-mono">
                      Rank #{idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{item.title}</h4>
                    {item.reason && (
                      <p className="text-[10px] text-emerald-700 font-semibold italic">💡 {item.reason}</p>
                    )}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-mono flex items-center gap-1 mt-1 truncate"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.link}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Captured Screenshots Gallery */}
          {executionResult.screenshots && executionResult.screenshots.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-emerald-200">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 font-mono block flex items-center gap-2">
                <Camera className="w-4 h-4 text-pink-600" />
                Visual Screenshot Proofs ({executionResult.screenshots.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {executionResult.screenshots.map((snapUrl, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md group relative">
                    <img
                      src={`http://localhost:8000${snapUrl}`}
                      alt="Workflow Screenshot"
                      className="w-full h-auto object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                    <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-700 font-semibold">Proof Snapshot #{idx + 1}</span>
                      <a
                        href={`http://localhost:8000${snapUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
