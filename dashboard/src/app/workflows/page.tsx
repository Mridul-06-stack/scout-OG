"use client";

import { useEffect, useState } from "react";
import { 
  Layers, 
  Sparkles, 
  Play, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowDownCircle, 
  Globe, 
  Brain, 
  Camera, 
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
  Maximize2
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
  { type: "navigate", label: "Navigate URL", icon: Globe, color: "text-blue-400 border-blue-500/30 bg-blue-500/10", defaultParams: { url: "https://news.ycombinator.com" } },
  { type: "scroll", label: "Smart Scroll", icon: ArrowDownCircle, color: "text-amber-400 border-amber-500/30 bg-amber-500/10", defaultParams: { scroll_times: 3, delay_ms: 1000 } },
  { type: "ai_filter", label: "AI Content Filter", icon: Brain, color: "text-purple-400 border-purple-500/30 bg-purple-500/10", defaultParams: { criteria: "Find top 3 highest quality articles", limit: 3 } },
  { type: "screenshot", label: "Capture Screenshot", icon: Camera, color: "text-pink-400 border-pink-500/30 bg-pink-500/10", defaultParams: { label: "page_snapshot" } },
  { type: "click", label: "Click Element", icon: MousePointer, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", defaultParams: { selector: "button" } },
  { type: "export", label: "Export Artifacts", icon: Save, color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10", defaultParams: { notify: true } },
];

export default function WorkflowStudioPage() {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowDefinition | null>(null);
  const [prompt, setPrompt] = useState("");
  const [synthesizing, setSynthesizing] = useState(false);
  const [running, setRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<WorkflowExecutionResult | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadAllWorkflows = async () => {
    try {
      const data = await fetchWorkflows();
      setWorkflows(data.workflows);
      if (data.workflows.length > 0 && !activeWorkflow) {
        setActiveWorkflow(data.workflows[0]);
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
      type: blockDef.type,
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

  const updateStepParam = (stepIndex: number, key: string, value: any) => {
    if (!activeWorkflow) return;
    const updatedSteps = [...activeWorkflow.steps];
    updatedSteps[stepIndex].params[key] = value;
    setActiveWorkflow({
      ...activeWorkflow,
      steps: updatedSteps,
    });
  };

  const getIconForType = (type: string) => {
    const found = BLOCK_TYPES.find((b) => b.type === type);
    return found ? found.icon : Globe;
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* ── Top Header Bento ── */}
      <div className="bento-card p-6 sm:p-8 border border-white/[0.09] bg-gradient-to-r from-[#120f26] via-[#1a1138] to-[#0f1429] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              No-Code Agent Studio
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Gamified Visual Workflow Builder
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Visual Autonomous Workflow Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Build custom browser agents visually · Scroll feeds · Filter with AI · Capture screenshots · Zero code needed
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={handleRunWorkflow}
            disabled={running || !activeWorkflow || activeWorkflow.steps.length === 0}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white text-xs font-black shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2 disabled:opacity-50 hover:scale-105"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Executing Agent...</span>
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
        <div className="p-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-xs font-bold text-indigo-300 flex items-center gap-2.5 shadow-lg animate-in fade-in">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ── AI Natural Language Prompt Compiler Bar ── */}
      <div className="bento-card p-6 sm:p-7 border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-[#10132b] to-[#0a0d1f] space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2 font-mono">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            AI Natural Language Workflow Generator
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Powered by gpt-4o-mini</span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <input
            type="text"
            placeholder="Type any goal in plain English (e.g. 'Scroll AI blog posts and take screenshots', 'Track stock market movers', 'Find good first issues on GitHub')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSynthesize()}
            className="flex-1 bg-[#121528] border border-white/[0.08] focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none font-medium shadow-inner"
          />
          <button
            onClick={() => handleSynthesize()}
            disabled={synthesizing || !prompt}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-105 shrink-0"
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
            "Scroll tech blog page, find good AI articles and take screenshots",
            "Monitor trending stocks and capture chart snapshots",
            "Find good-first-issue GitHub bounties and snapshot READMEs",
            "Scan hackathon portal and pre-fill application questions",
            "Explore top AI tools on Product Hunt and extract launches",
          ].map((example, i) => (
            <button
              key={i}
              onClick={() => {
                setPrompt(example);
                handleSynthesize(example);
              }}
              className="px-2.5 py-1 rounded-xl bg-white/[0.03] hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-200 border border-white/[0.06] text-[11px] font-medium transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* ── Template & Saved Workflows Bar ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">
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
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02] border border-indigo-400/50"
                    : "bg-[#0c0f24] hover:bg-white/[0.05] text-slate-300 border border-white/[0.08]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{wf.name}</span>
                <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-black/40 font-mono text-slate-300">
                  {wf.steps.length} Steps
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Workflow Visual Node Canvas ── */}
      {activeWorkflow && (
        <div className="space-y-6">
          <div className="bento-card p-6 sm:p-8 border border-white/[0.08] space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>{activeWorkflow.name}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                    {activeWorkflow.category}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">{activeWorkflow.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveWorkflow}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Workflow</span>
                </button>
              </div>
            </div>

            {/* Visual Action Blocks Connector Graph */}
            <div className="space-y-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono block">
                Visual Execution Graph (Step 1 ➔ {activeWorkflow.steps.length}):
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeWorkflow.steps.map((step, idx) => {
                  const blockDef = BLOCK_TYPES.find((b) => b.type === step.type) || BLOCK_TYPES[0];
                  const Icon = blockDef.icon;

                  return (
                    <div
                      key={step.id}
                      className="p-5 rounded-2xl bg-[#0b0e22] border border-white/[0.08] hover:border-indigo-500/50 space-y-3 transition-all relative group shadow-lg"
                    >
                      {/* Step Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`p-2 rounded-xl border ${blockDef.color}`}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="text-xs font-black text-white block">
                              {step.title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">
                              {step.type}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => removeStep(step.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/[0.05] transition-colors"
                          title="Remove Block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                        {step.description}
                      </p>

                      {/* Step Parameters Customizer */}
                      <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04] space-y-2 text-xs">
                        {step.type === "navigate" && (
                          <div>
                            <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Target URL</label>
                            <input
                              type="text"
                              value={step.params.url || ""}
                              onChange={(e) => updateStepParam(idx, "url", e.target.value)}
                              className="w-full bg-[#121528] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono outline-none"
                            />
                          </div>
                        )}

                        {step.type === "scroll" && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Scroll Times</label>
                              <input
                                type="number"
                                value={step.params.scroll_times || 3}
                                onChange={(e) => updateStepParam(idx, "scroll_times", Number(e.target.value))}
                                className="w-full bg-[#121528] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Delay (ms)</label>
                              <input
                                type="number"
                                value={step.params.delay_ms || 1000}
                                onChange={(e) => updateStepParam(idx, "delay_ms", Number(e.target.value))}
                                className="w-full bg-[#121528] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono outline-none"
                              />
                            </div>
                          </div>
                        )}

                        {step.type === "ai_filter" && (
                          <div>
                            <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">AI Prompt Criteria</label>
                            <textarea
                              rows={2}
                              value={step.params.criteria || ""}
                              onChange={(e) => updateStepParam(idx, "criteria", e.target.value)}
                              className="w-full bg-[#121528] border border-white/[0.08] rounded-lg p-2 text-[11px] text-white outline-none"
                            />
                          </div>
                        )}

                        {step.type === "screenshot" && (
                          <div>
                            <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Snapshot Label</label>
                            <input
                              type="text"
                              value={step.params.label || "snapshot"}
                              onChange={(e) => updateStepParam(idx, "label", e.target.value)}
                              className="w-full bg-[#121528] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Action Block Palette */}
            <div className="pt-4 border-t border-white/[0.06] space-y-3">
              <span className="text-xs font-bold text-slate-300 block">Add Action Block to Pipeline:</span>
              <div className="flex flex-wrap gap-2">
                {BLOCK_TYPES.map((block) => {
                  const Icon = block.icon;
                  return (
                    <button
                      key={block.type}
                      onClick={() => addStep(block.type)}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 border border-white/[0.06] hover:border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-2 hover:scale-105"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-400" />
                      <span>+ {block.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Live Execution Deck & Visual Artifact Gallery ── */}
      {executionResult && (
        <div className="bento-card p-6 sm:p-8 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-[#0d1226] to-[#090b1c] space-y-6 shadow-2xl animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-base font-black text-white">
                  Autonomous Workflow Run Finished ({executionResult.completed_steps}/{executionResult.total_steps} Steps)
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Status: {executionResult.status.toUpperCase()} · Finished in Real CloakBrowser
                </span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Telemetry Cards */}
          <div className="space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono block">
              Step Execution Telemetry:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {executionResult.step_results.map((sr, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white font-bold text-xs">{sr.title}</span>
                    <span className="text-[10px] font-mono text-emerald-300">{sr.duration_ms}ms</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono">{sr.output_message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Extracted Items / Articles Table */}
          {executionResult.extracted_items && executionResult.extracted_items.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono block">
                Extracted & AI-Filtered Items ({executionResult.extracted_items.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {executionResult.extracted_items.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                      Rank #{idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-white line-clamp-2">{item.title}</h4>
                    {item.reason && (
                      <p className="text-[10px] text-emerald-400 italic">💡 {item.reason}</p>
                    )}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 mt-1 truncate"
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
            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono block flex items-center gap-2">
                <Camera className="w-4 h-4 text-pink-400" />
                Visual Screenshot Proofs ({executionResult.screenshots.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {executionResult.screenshots.map((snapUrl, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden border border-white/[0.1] bg-black/60 shadow-xl group relative">
                    <img
                      src={`http://localhost:8000${snapUrl}`}
                      alt="Workflow Screenshot"
                      className="w-full h-auto object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                    <div className="p-3 bg-[#0a0d1f]/90 backdrop-blur-md flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-300">Proof Snapshot #{idx + 1}</span>
                      <a
                        href={`http://localhost:8000${snapUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white"
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
