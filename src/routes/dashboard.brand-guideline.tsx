import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FileText, Presentation, Globe, PenSquare, Loader2, Check, Download, Share2, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, GlassCard } from "@/components/app/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateBrandGuideline, type Guideline } from "@/lib/brand-guideline.functions";
import { exportGuidelinePDF, exportGuidelinePPT } from "@/lib/brand-guideline-export";

export const Route = createFileRoute("/dashboard/brand-guideline")({
  head: () => ({
    meta: [
      { title: "Brand Guideline Generator — BrandSync AI" },
      { name: "description", content: "Generate professional brand guidelines as PDF or PPT in minutes with AI." },
    ],
  }),
  component: BrandGuidelinePage,
});

const INDUSTRIES = ["Technology", "E-commerce / D2C", "Retail", "Fashion & Beauty", "Food & Beverage", "Finance / Fintech", "Healthcare", "Education", "Real Estate", "Travel & Hospitality", "Media & Entertainment", "Manufacturing", "Agency", "Non-profit", "Other"];

const STEPS = [
  { n: 1, label: "Brand Information" },
  { n: 2, label: "AI Analysis" },
  { n: 3, label: "Generate Guidelines" },
  { n: 4, label: "Review & Export" },
];

function BrandGuidelinePage() {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [form, setForm] = useState({ brandName: "", industry: "", websiteUrl: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [guideline, setGuideline] = useState<Guideline | null>(null);
  const [exportFormat, setExportFormat] = useState<"pdf" | "ppt">("pdf");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useServerFn(generateBrandGuideline);

  const runAnalysis = async () => {
    if (!form.brandName.trim() || !form.industry) {
      toast.error("Brand name and industry are required");
      return;
    }
    setStep(2);
    setLoading(true);
    setError(null);
    try {
      const res = await generate({ data: { ...form, mode } });
      if (res.error || !res.guideline) {
        setError(res.error || "Generation failed");
        toast.error(res.error || "Generation failed");
        setStep(1);
      } else {
        setGuideline(res.guideline);
        setStep(4);
        toast.success("Brand guideline generated!");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!guideline) return;
    setExporting(true);
    try {
      if (exportFormat === "pdf") {
        await exportGuidelinePDF(form.brandName, guideline);
        toast.success("PDF downloaded");
      } else {
        await exportGuidelinePPT(form.brandName, guideline);
        toast.success("PPT downloaded");
      }
    } catch (e) {
      toast.error("Export failed: " + (e instanceof Error ? e.message : "unknown"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="AI Tools · New"
        title="Brand Guideline Generator"
        subtitle="Create professional brand guidelines in minutes with AI — exportable as PDF or PPT."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-8 px-2">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`h-9 w-9 rounded-full grid place-items-center text-xs font-semibold transition-all ${
                    step >= s.n
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                      : "bg-white/5 border border-white/10 text-muted-foreground"
                  }`}>
                    {step > s.n ? <Check className="h-4 w-4" /> : s.n}
                  </div>
                  <div className={`mt-2 text-[10px] uppercase tracking-wider text-center ${step >= s.n ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 -mt-5 ${step > s.n ? "bg-gradient-to-r from-indigo-500 to-purple-600" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h3 className="text-base font-semibold mb-4">Choose how you want to create your brand guidelines</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <ModeCard
                    icon={<Globe className="h-5 w-5 text-indigo-300" />}
                    title="From Existing Brand"
                    desc="Enter your website and let AI analyze your existing brand"
                    selected={mode === "existing"}
                    onClick={() => setMode("existing")}
                  />
                  <ModeCard
                    icon={<PenSquare className="h-5 w-5 text-purple-300" />}
                    title="Build New Brand"
                    desc="Answer a few questions and build your brand identity from scratch"
                    selected={mode === "new"}
                    onClick={() => setMode("new")}
                  />
                </div>

                <h3 className="text-base font-semibold mb-4">Your Brand Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Brand Name</Label>
                    <Input value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} placeholder="Acme Corporation" />
                  </div>
                  <div>
                    <Label>Industry</Label>
                    <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                      <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                      <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Website URL <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                    <Input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://www.acmecorp.com" />
                  </div>
                  <div>
                    <Label>Short Description</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value.slice(0, 500) })}
                      placeholder="What does your brand do? Who do you serve?"
                      rows={3}
                    />
                    <div className="text-[10px] text-right text-muted-foreground mt-1">{form.description.length}/500</div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground max-w-md">
                    AI will analyze your brand and generate comprehensive guidelines covering voice, color, typography, messaging and improvement areas.
                  </p>
                  <Button onClick={runAnalysis} className="bg-gradient-to-r from-indigo-500 to-purple-600 h-11 px-5">
                    Analyze Brand <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {error && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
                  </div>
                )}
              </motion.div>
            )}

            {(step === 2 || step === 3) && loading && (
              <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                  <Loader2 className="h-7 w-7 animate-spin text-indigo-300" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">AI is crafting your brand guideline…</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  Analyzing voice, palette, typography, positioning, and improvement areas. This usually takes 10–25 seconds.
                </p>
              </motion.div>
            )}

            {step === 4 && guideline && (
              <motion.div key="s4" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-emerald-300">Ready</div>
                    <h3 className="text-lg font-semibold mt-1">Your guideline is ready</h3>
                    <p className="text-sm text-muted-foreground">Review the preview on the right and choose your export format.</p>
                  </div>
                  <Button variant="ghost" onClick={() => { setGuideline(null); setStep(1); }} className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Start over
                  </Button>
                </div>

                <Section title="Current Position" tone="rose">{guideline.currentPosition}</Section>
                <Section title="Recommended Direction" tone="emerald">{guideline.recommendedDirection}</Section>
                <Section title="Improvement Roadmap" tone="indigo">
                  <ul className="space-y-1.5">
                    {guideline.improvements.map((it, i) => (
                      <li key={i} className="flex gap-2 text-sm"><span className="text-indigo-300">{i + 1}.</span> {it}</li>
                    ))}
                  </ul>
                </Section>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Right preview / export */}
        <GlassCard className="lg:sticky lg:top-6 self-start">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-indigo-300">AI Generated Preview</div>
              <h3 className="text-base font-semibold mt-1">{guideline ? form.brandName : "Live Preview"}</h3>
            </div>
            <div className="rounded-md bg-white/5 border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">Preview</div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">This is a preview of your brand guideline.</p>

          <div className="rounded-xl bg-white text-slate-900 p-5 min-h-[420px]">
            {guideline ? <BrandPreview brandName={form.brandName} g={guideline} /> : <PreviewSkeleton />}
          </div>

          {guideline && (
            <>
              <div className="mt-5">
                <div className="text-xs font-semibold mb-2">Export Format</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setExportFormat("pdf")}
                    className={`flex items-center justify-center gap-2 rounded-lg h-11 text-sm border transition ${exportFormat === "pdf" ? "bg-indigo-500/20 border-indigo-400/40 text-foreground" : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground"}`}
                  >
                    <FileText className="h-4 w-4 text-rose-300" /> PDF
                  </button>
                  <button
                    onClick={() => setExportFormat("ppt")}
                    className={`flex items-center justify-center gap-2 rounded-lg h-11 text-sm border transition ${exportFormat === "ppt" ? "bg-indigo-500/20 border-indigo-400/40 text-foreground" : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground"}`}
                  >
                    <Presentation className="h-4 w-4 text-amber-300" /> PPT
                  </button>
                </div>
              </div>
              <Button
                onClick={handleExport}
                disabled={exporting}
                className="w-full mt-3 h-11 bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                {exporting ? "Generating…" : `Download ${exportFormat.toUpperCase()}`}
              </Button>
              <button className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg h-10 text-sm bg-white/5 border border-white/10 hover:bg-white/10">
                <Share2 className="h-4 w-4" /> Share
              </button>
              <p className="mt-3 text-[10px] text-emerald-300/80 text-center">Your brand guidelines are securely saved in your workspace</p>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

function ModeCard({ icon, title, desc, selected, onClick }: { icon: React.ReactNode; title: string; desc: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-xl border p-4 transition ${selected ? "bg-indigo-500/15 border-indigo-400/40" : "bg-white/[0.02] border-white/10 hover:bg-white/5"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/5 grid place-items-center">{icon}</div>
          <div className="font-semibold text-sm">{title}</div>
        </div>
        <div className={`h-4 w-4 rounded-full border-2 ${selected ? "border-indigo-400 bg-indigo-400" : "border-white/30"}`}>
          {selected && <Check className="h-3 w-3 text-white m-px" />}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </button>
  );
}

function Section({ title, tone, children }: { title: string; tone: "rose" | "emerald" | "indigo"; children: React.ReactNode }) {
  const tones = {
    rose: "border-rose-400/30 bg-rose-500/10 text-rose-200",
    emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    indigo: "border-indigo-400/30 bg-indigo-500/10 text-indigo-200",
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="text-[10px] uppercase tracking-widest mb-1">{title}</div>
      <div className="text-sm text-foreground/90">{children}</div>
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-3/4 rounded bg-slate-200 animate-pulse" />
      <div className="h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
      <div className="grid grid-cols-5 gap-2 mt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="aspect-square rounded bg-slate-200 animate-pulse" />
        ))}
      </div>
      <div className="h-3 w-full rounded bg-slate-200 animate-pulse" />
      <div className="h-3 w-5/6 rounded bg-slate-200 animate-pulse" />
      <div className="text-center text-xs text-slate-400 pt-8">Fill in the details and click Analyze Brand to see your preview.</div>
    </div>
  );
}

function BrandPreview({ brandName, g }: { brandName: string; g: Guideline }) {
  return (
    <div className="text-slate-900">
      <div className="flex items-start justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center text-white font-bold text-sm">
            {brandName.slice(0, 1).toUpperCase()}
          </div>
          <div className="font-bold tracking-tight text-base">{brandName.toLowerCase()}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Brand Guidelines</div>
          <div className="text-[10px] text-slate-400">Version 1.0 · {new Date().toLocaleDateString(undefined, { month: "short", year: "numeric" })}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Color Palette</div>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {g.colorPalette.slice(0, 5).map((c) => (
            <div key={c.hex} className="space-y-1">
              <div className="aspect-square rounded-md" style={{ background: c.hex }} />
              <div className="text-[8px] text-center text-slate-500">{c.hex}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Typography</div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div>
            <div className="text-3xl font-bold leading-none" style={{ fontFamily: g.typography.headingFont }}>Aa</div>
            <div className="text-[10px] text-slate-500 mt-1 font-semibold">{g.typography.headingFont}</div>
            <div className="text-[8px] text-slate-400">Headings</div>
          </div>
          <div>
            <div className="text-3xl leading-none" style={{ fontFamily: g.typography.bodyFont }}>Aa</div>
            <div className="text-[10px] text-slate-500 mt-1 font-semibold">{g.typography.bodyFont}</div>
            <div className="text-[8px] text-slate-400">Body</div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Brand Voice</div>
        <div className="mt-2 flex flex-wrap gap-1">
          {g.brandPersonality.map((t) => (
            <span key={t} className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px] font-medium">{t}</span>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Messaging Pillars</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {g.messagingPillars.slice(0, 4).map((p) => (
            <div key={p.title} className="rounded border border-slate-200 p-2">
              <div className="text-[10px] font-bold text-slate-700">{p.title}</div>
              <div className="text-[9px] text-slate-500 line-clamp-3">{p.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
