import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Brain, Upload, Globe, Sparkles, Check, Target, Heart, MessageSquare, Compass, TrendingUp, AlertTriangle, Wand2, RefreshCw, Copy, Image as ImageIcon, ShieldCheck, FileText, BarChart3 } from "lucide-react";
import { PageHeader, GlassCard, StatCard, Pill } from "@/components/app/ui";
import { TrafficAnalyzer } from "@/components/app/TrafficAnalyzer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from "recharts";
import { competitors } from "@/lib/mock";

export const Route = createFileRoute("/dashboard/intelligence")({
  component: Intelligence,
  head: () => ({ meta: [{ title: "Brand Intelligence — BrandSync AI" }] }),
});

type BrandProfile = {
  name: string;
  website: string;
  logo: string | null; // data URL or SVG string
  logoKind: "upload" | "ai" | "none";
  trainedAt: string | null;
  companyIndex: string; // unique copyright/patent index
};

const DEFAULT_BRAND: BrandProfile = {
  name: "Acme",
  website: "https://acme.io",
  logo: null,
  logoKind: "none",
  trainedAt: "2026-04-22",
  companyIndex: "BSX-AC-001928",
};

function Intelligence() {
  const [brand, setBrand] = useState<BrandProfile>(DEFAULT_BRAND);

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence Layer"
        title="Brand Intelligence"
        subtitle="The AI's permanent memory of your brand — voice, archetype, sentiment, vocabulary, and strategic positioning."
        actions={<SetupWizard brand={brand} onComplete={setBrand} />}
      />

      <BrandIdentityBanner brand={brand} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Brand Health Score" value="92 / 100" delta="+4 vs last mo" accent="emerald" />
        <StatCard label="Voice Consistency" value="96%" delta="+2%" accent="indigo" />
        <StatCard label="Sentiment Index" value="+0.71" delta="+0.08" accent="purple" />
        <StatCard label="Share of Voice" value="34.8%" delta="+5.2%" accent="emerald" />
      </div>

      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="traffic"><BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Traffic Analyzer</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="mt-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard>
              <div className="flex items-center gap-2 text-sm text-purple-300"><Compass className="h-4 w-4" /> Brand Archetype</div>
              <div className="mt-3 text-2xl font-semibold">The Visionary Magician</div>
              <p className="mt-2 text-sm text-muted-foreground">A transformative brand that turns invisible complexity into magical, simple outcomes — empowering marketers to feel limitless.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Pill tone="purple">Innovative</Pill><Pill tone="indigo">Empowering</Pill><Pill tone="emerald">Optimistic</Pill><Pill tone="purple">Mystical</Pill>
              </div>
            </GlassCard>

            <BrandVoiceStudio />


            <GlassCard>
              <div className="flex items-center gap-2 text-sm text-emerald-300"><Heart className="h-4 w-4" /> Emotional Positioning</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex justify-between"><span>Confidence</span><span className="text-emerald-300">High</span></li>
                <li className="flex justify-between"><span>Trust</span><span className="text-emerald-300">High</span></li>
                <li className="flex justify-between"><span>Excitement</span><span className="text-indigo-300">Medium-high</span></li>
                <li className="flex justify-between"><span>Nostalgia</span><span className="text-muted-foreground">Low</span></li>
              </ul>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-2 text-sm text-purple-300"><Target className="h-4 w-4" /> Vocabulary Preferences</div>
              <div className="mt-3">
                <div className="text-xs text-emerald-300 mb-1">Use these</div>
                <div className="flex flex-wrap gap-1.5">{["unify","orchestrate","intelligent","seamless","predict","transform"].map(w => <Pill key={w} tone="emerald">{w}</Pill>)}</div>
                <div className="text-xs text-rose-300 mt-3 mb-1">Avoid these</div>
                <div className="flex flex-wrap gap-1.5">{["cheap","basic","tool","manage","try"].map(w => <Pill key={w} tone="rose">{w}</Pill>)}</div>
              </div>
            </GlassCard>
          </div>

          <ImprovementAreas />
        </TabsContent>


        <TabsContent value="traffic" className="mt-5">
          <TrafficAnalyzer domain={brand.website} />
        </TabsContent>

        <TabsContent value="competitors" className="mt-5">
          <GlassCard className="h-[420px]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-medium">Brand Posture vs Competitors</div>
                <div className="text-xs text-muted-foreground">Sentiment-weighted multi-axis comparison</div>
              </div>
              <div className="flex gap-2"><Pill tone="indigo">You</Pill><Pill tone="neutral">Competitor A</Pill><Pill tone="neutral">B</Pill><Pill tone="neutral">C</Pill></div>
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <RadarChart data={competitors}>
                <PolarGrid stroke="oklch(1 0 0 / 0.1)" />
                <PolarAngleAxis dataKey="metric" stroke="oklch(0.7 0.02 260)" tick={{ fill: "oklch(0.7 0.02 260)", fontSize: 11 }} />
                <Radar dataKey="us" stroke="oklch(0.65 0.22 280)" fill="oklch(0.65 0.22 280)" fillOpacity={0.4} />
                <Radar dataKey="A" stroke="oklch(0.72 0.18 155)" fill="oklch(0.72 0.18 155)" fillOpacity={0.1} />
                <Radar dataKey="B" stroke="oklch(0.78 0.17 75)" fill="oklch(0.78 0.17 75)" fillOpacity={0.1} />
                <Radar dataKey="C" stroke="oklch(0.65 0.25 20)" fill="oklch(0.65 0.25 20)" fillOpacity={0.1} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>
        </TabsContent>

        <TabsContent value="strategy" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { phase: "Q4 · Now", title: "Cement category leadership", desc: "Publish 3 thought-leadership essays on 'unified MarTech' & seed via LinkedIn micro-influencers.", tone: "indigo" },
              { phase: "Q1 · Next", title: "Geo-expand to MEA & SEA", desc: "Localize creative for KSA, UAE, BD, ID; activate WhatsApp commerce funnels.", tone: "purple" },
              { phase: "Q2 · Soon", title: "Launch Agency Co-Pilot", desc: "White-label workspace + revenue-share program targeting top 200 agencies.", tone: "emerald" },
            ].map((s) => (
              <GlassCard key={s.title}>
                <Pill tone={s.tone as "indigo"}>{s.phase}</Pill>
                <div className="mt-3 text-lg font-semibold">{s.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-indigo-300"><Sparkles className="h-3.5 w-3.5" /> AI-suggested · 92% confidence</div>
              </GlassCard>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LogoMark({ brand, size = 40 }: { brand: BrandProfile; size?: number }) {
  if (brand.logo) {
    return (
      <img
        src={brand.logo}
        alt={`${brand.name} logo`}
        style={{ width: size, height: size }}
        className="rounded-xl object-cover bg-white/5 border border-white/10"
      />
    );
  }
  const initials = brand.name.split(/\s+/).map(w => w[0]).slice(0,2).join("").toUpperCase() || "B";
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-500 flex items-center justify-center font-semibold text-white shadow-lg"
    >
      {initials}
    </div>
  );
}

function BrandIdentityBanner({ brand }: { brand: BrandProfile }) {
  return (
    <GlassCard className="mb-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
      <div className="relative flex items-center gap-4">
        <LogoMark brand={brand} size={56} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-lg font-semibold truncate">{brand.name}</div>
            <Pill tone="indigo">Index · {brand.companyIndex}</Pill>
            {brand.trainedAt && <Pill tone="emerald">Trained {brand.trainedAt}</Pill>}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-3 w-3 flex-none" />
            <a
              href={/^https?:\/\//i.test(brand.website) ? brand.website : `https://${brand.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:text-indigo-300 hover:underline underline-offset-2 transition-colors"
              title={brand.website}
            >
              {brand.website}
            </a>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-emerald-300/80 max-w-[260px] text-right">
          <ShieldCheck className="h-3.5 w-3.5 flex-none" />
          <span>Generated insights, data &amp; creative © {brand.name}. Copyright &amp; patent rights retained by the company.</span>
        </div>
      </div>
    </GlassCard>
  );
}

function SetupWizard({ brand, onComplete }: { brand: BrandProfile; onComplete: (b: BrandProfile) => void }) {
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(brand.name);
  const [website, setWebsite] = useState(brand.website);
  const [logo, setLogo] = useState<string | null>(brand.logo);
  const [logoKind, setLogoKind] = useState<BrandProfile["logoKind"]>(brand.logoKind);
  const [generatingLogo, setGeneratingLogo] = useState(false);
  const [pdfUploaded, setPdfUploaded] = useState(false);

  const totalSteps = 4;

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result as string);
      setLogoKind("upload");
    };
    reader.readAsDataURL(file);
  }

  function aiGenerateLogo() {
    setGeneratingLogo(true);
    setTimeout(() => {
      const initials = (name || "B").split(/\s+/).map(w => w[0]).slice(0,2).join("").toUpperCase();
      const hueA = Math.floor(Math.random() * 360);
      const hueB = (hueA + 60) % 360;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hueA},85%,60%)"/><stop offset="1" stop-color="hsl(${hueB},85%,55%)"/></linearGradient></defs><rect width="128" height="128" rx="28" fill="url(#g)"/><circle cx="64" cy="64" r="34" fill="none" stroke="white" stroke-opacity="0.35" stroke-width="2"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Inter, system-ui, sans-serif" font-size="48" font-weight="700" fill="white">${initials}</text></svg>`;
      const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      setLogo(dataUrl);
      setLogoKind("ai");
      setGeneratingLogo(false);
    }, 1200);
  }

  function finish() {
    const idx = "BSX-" + (name || "BR").replace(/\s+/g, "").slice(0,2).toUpperCase() + "-" + Math.floor(100000 + Math.random()*899999);
    onComplete({
      name: name || "Untitled Brand",
      website: website || "https://example.com",
      logo,
      logoKind,
      trainedAt: new Date().toISOString().slice(0,10),
      companyIndex: idx,
    });
    setOpen(false);
    setStep(1);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setStep(1); }}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 glow-primary">
          <Brain className="h-4 w-4 mr-2" /> Re-train Brand AI
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0d1120] border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-400" /> Brand Setup Wizard</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
            <div key={n} className={`flex-1 h-1 rounded-full ${step >= n ? "bg-gradient-to-r from-indigo-500 to-purple-600" : "bg-white/10"}`} />
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          {step === 1 && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Step 1 · Connect your digital footprint</div>
              <Input placeholder="Brand / company name" value={name} onChange={(e) => setName(e.target.value)} className="bg-white/5 border-white/10" />
              <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="https://yourbrand.com" value={website} onChange={(e) => setWebsite(e.target.value)} className="pl-9 bg-white/5 border-white/10" /></div>
              <Input placeholder="Instagram handle" defaultValue="@acme.official" className="bg-white/5 border-white/10" />
              <Input placeholder="LinkedIn / X / TikTok" defaultValue="linkedin.com/company/acme" className="bg-white/5 border-white/10" />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Step 2 · Attach or generate your logo</div>
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <LogoMark brand={{ ...brand, name, logo, logoKind }} size={64} />
                <div className="flex-1 text-xs text-muted-foreground">
                  {logo ? (logoKind === "ai" ? "AI-generated logo ready. You can regenerate or replace." : "Custom logo attached.") : "No logo yet — upload your own or let AI generate one based on your brand name."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="cursor-pointer rounded-xl border-2 border-dashed border-white/15 p-4 text-center bg-white/[0.02] hover:border-indigo-400/50 transition">
                  <Upload className="h-5 w-5 mx-auto text-indigo-400" />
                  <div className="mt-1.5 text-xs font-medium">Upload logo</div>
                  <div className="text-[10px] text-muted-foreground">PNG, SVG, JPG</div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
                <button
                  type="button"
                  onClick={aiGenerateLogo}
                  disabled={generatingLogo}
                  className="rounded-xl border border-white/10 p-4 text-center bg-gradient-to-br from-indigo-500/10 to-purple-600/10 hover:from-indigo-500/20 hover:to-purple-600/20 transition disabled:opacity-60"
                >
                  {generatingLogo ? (
                    <RefreshCw className="h-5 w-5 mx-auto text-purple-300 animate-spin" />
                  ) : (
                    <Wand2 className="h-5 w-5 mx-auto text-purple-300" />
                  )}
                  <div className="mt-1.5 text-xs font-medium">{generatingLogo ? "Generating…" : "Generate with AI"}</div>
                  <div className="text-[10px] text-muted-foreground">From brand name & vibe</div>
                </button>
              </div>
              {logo && (
                <button type="button" onClick={() => { setLogo(null); setLogoKind("none"); }} className="text-[11px] text-muted-foreground hover:text-foreground underline">
                  Remove logo
                </button>
              )}
            </div>
          )}
          {step === 3 && (
            <div>
              <div className="text-sm text-muted-foreground mb-3">Step 3 · Upload brand PDF &amp; supporting assets</div>
              <label className="cursor-pointer block rounded-xl border-2 border-dashed border-white/15 p-8 text-center bg-white/[0.02] hover:border-indigo-400/50 transition">
                <Upload className="h-6 w-6 mx-auto text-indigo-400" />
                <div className="mt-2 text-sm">Drop brand guidelines PDF, ads, videos, decks</div>
                <div className="text-xs text-muted-foreground">PDF, MP4, PNG · up to 500MB</div>
                <input type="file" accept=".pdf,.mp4,.png,.jpg,.zip" className="hidden" onChange={() => setPdfUploaded(true)} />
              </label>
              <div className="mt-3 space-y-1.5 text-xs">
                {[
                  { f: `${(name || "brand").toLowerCase().replace(/\s+/g,"-")}-brand-guidelines.pdf`, icon: FileText },
                  { f: "spring-campaign-reel.mp4", icon: ImageIcon },
                  { f: "press-kit-2025.zip", icon: FileText },
                ].map(({f, icon: Icon}) => (
                  <div key={f} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
                    <span className="flex items-center gap-2"><Icon className="h-3.5 w-3.5 text-indigo-300" />{f}</span>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                ))}
                {pdfUploaded && (
                  <div className="flex items-center justify-between rounded-md bg-emerald-500/10 border border-emerald-500/30 px-3 py-2">
                    <span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-emerald-300" />your-uploaded-file.pdf</span>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                )}
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="rounded-xl bg-black/40 border border-white/10 p-4 font-mono text-xs text-emerald-300/90 space-y-1 h-56 overflow-hidden relative">
              <div className="shimmer absolute inset-0" />
              <div>$ brandsync.train --workspace {(name || "brand").toLowerCase().replace(/\s+/g,"-")}</div>
              <div>› Indexing logo &amp; visual identity… <span className="text-emerald-400">done</span></div>
              <div>› Crawling {website}…  <span className="text-emerald-400">412 pages</span></div>
              <div>› Parsing brand PDF &amp; assets…</div>
              <div>› Extracting palette: oklch(0.65 0.22 280) +6 …</div>
              <div>› Mapping vocabulary: 8,142 tokens</div>
              <div>› Modeling sentiment across 18 channels…</div>
              <div>› Detecting archetype: <span className="text-purple-300">Visionary Magician</span></div>
              <div>› Sealing company index &amp; copyright manifest…</div>
              <div className="text-indigo-300">› Brand AI ready ✨ Dashboard regenerating with your data.</div>
            </div>
          )}
        </motion.div>

        <div className="flex justify-between mt-5">
          <Button variant="ghost" onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1}>Back</Button>
          <Button onClick={() => step < totalSteps ? setStep(s => s+1) : finish()} className="bg-gradient-to-r from-indigo-500 to-purple-600">
            {step < totalSteps ? "Continue" : "Finish & generate dashboard"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ImprovementAreas() {
  const areas = [
    {
      title: "Lift Playfulness on Reels & TikTok",
      severity: "Medium",
      tone: "indigo" as const,
      impact: "+18% engagement projected",
      desc: "Your short-form content reads 24% more formal than top-quartile peers in your category. Inject witty hooks and meme-fluent language for Gen-Z audiences.",
      actions: ["Test 5 playful hook variants", "Adopt 'Magician' archetype voice on Reels"],
    },
    {
      title: "Tighten Visual Consistency",
      severity: "High",
      tone: "rose" as const,
      impact: "Recall +12pts",
      desc: "Across 412 audited assets, 31% deviate from your primary palette. Logo lockup safe-zones are violated on 14% of paid creatives.",
      actions: ["Lock palette tokens in Creative Studio", "Auto-reject off-brand exports"],
    },
    {
      title: "Expand Thought Leadership on LinkedIn",
      severity: "Opportunity",
      tone: "emerald" as const,
      impact: "SOV +6.4%",
      desc: "Competitor B publishes 3.2x more long-form essays. Your authority score is high but underutilized — a publishing cadence shift compounds quickly.",
      actions: ["Ship 3 essays / month", "Activate exec-led commenting"],
    },
    {
      title: "Reduce Jargon in Onboarding Copy",
      severity: "Medium",
      tone: "purple" as const,
      impact: "Activation +9%",
      desc: "Reading-level analysis flags onboarding at grade 14. Your audience persona reads best at grade 9-10. Simpler language improves trial-to-paid.",
      actions: ["Rewrite 7 onboarding screens", "A/B test simplified CTAs"],
    },
  ];

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-indigo-300"><TrendingUp className="h-4 w-4" /> AI-Recommended Improvement Areas</div>
          <div className="text-xs text-muted-foreground">Prioritized opportunities to strengthen your brand strategy — refreshed nightly.</div>
        </div>
        <Button variant="ghost" size="sm" className="text-xs"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Re-analyze</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {areas.map((a) => (
          <GlassCard key={a.title} className="relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${a.tone === "rose" ? "text-rose-300" : a.tone === "emerald" ? "text-emerald-300" : a.tone === "purple" ? "text-purple-300" : "text-indigo-300"}`} />
                <div className="text-sm font-semibold">{a.title}</div>
              </div>
              <Pill tone={a.tone}>{a.severity}</Pill>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{a.desc}</p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-300"><Sparkles className="h-3 w-3" /> {a.impact}</div>
            <div className="mt-3 space-y-1.5">
              {a.actions.map((act) => (
                <div key={act} className="flex items-center gap-2 text-xs">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span className="text-foreground/80">{act}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600 h-7 text-xs"><Wand2 className="h-3 w-3 mr-1.5" /> Apply suggestion</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs">Dismiss</Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

const VOICE_AXES = [
  { key: "Formality", value: 35, low: "Casual", high: "Formal" },
  { key: "Warmth", value: 78, low: "Detached", high: "Warm" },
  { key: "Authority", value: 82, low: "Humble", high: "Authoritative" },
  { key: "Playfulness", value: 54, low: "Serious", high: "Playful" },
];

const VOICE_SAMPLES: Record<string, string> = {
  base: "Meet BrandSync — the unified marketing OS that quietly orchestrates every campaign, asset, and audience signal so your team can focus on what matters.",
  playful: "Say hi to BrandSync ✨ the marketing OS that does the messy bits — campaigns, assets, audience signals — while you sip your coffee and look like a genius.",
  authoritative: "BrandSync is the definitive marketing operating system. It unifies campaigns, assets, and audience intelligence into a single command surface — engineered for teams that lead categories.",
  warm: "We built BrandSync for marketers who care deeply about their craft. It handles the heavy lifting — campaigns, assets, audience signals — so you have more room to do work you're proud of.",
};

function BrandVoiceStudio() {
  const [axes, setAxes] = useState(VOICE_AXES.map(a => a.value));
  const [prompt, setPrompt] = useState("Announce our Q1 product launch to enterprise marketers.");
  const [output, setOutput] = useState(VOICE_SAMPLES.base);
  const [loading, setLoading] = useState(false);

  function generate() {
    setLoading(true);
    setOutput("");
    setTimeout(() => {
      const [, , authority, playfulness] = axes;
      const key = playfulness > 70 ? "playful" : authority > 85 ? "authoritative" : axes[1] > 80 ? "warm" : "base";
      setOutput(VOICE_SAMPLES[key]);
      setLoading(false);
    }, 1100);
  }

  const insights = [
    { label: "Sounds 12% more confident than category average", tone: "emerald" as const },
    { label: "Reduce hedging words ('maybe', 'might') by ~30%", tone: "indigo" as const },
    { label: "Add 1 sensory verb per paragraph for vividness", tone: "purple" as const },
  ];

  return (
    <GlassCard className="lg:col-span-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-indigo-300"><MessageSquare className="h-4 w-4" /> Brand Voice Studio</div>
        <Pill tone="purple"><Sparkles className="h-3 w-3" /> AI-tuned</Pill>
      </div>

      <div className="mt-4 space-y-3">
        {VOICE_AXES.map((a, i) => (
          <div key={a.key}>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{a.key}</span>
              <span className="text-foreground/80">{axes[i]}% · {axes[i] > 50 ? a.high : a.low}</span>
            </div>
            <Slider
              value={[axes[i]]}
              onValueChange={(v) => setAxes(prev => prev.map((p, idx) => idx === i ? v[0] : p))}
              max={100}
              step={1}
              className="mt-1.5"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3">
        <div className="text-[11px] uppercase tracking-widest text-indigo-300/80 mb-2">Try your voice</div>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what to write…"
          className="bg-black/30 border-white/10 text-xs min-h-[60px]"
        />
        <Button onClick={generate} size="sm" className="mt-2 w-full bg-gradient-to-r from-indigo-500 to-purple-600 glow-primary">
          <Wand2 className="h-3.5 w-3.5 mr-1.5" /> Generate in this voice
        </Button>

        <div className="mt-3">
          {loading ? (
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-full bg-white/5" />
              <Skeleton className="h-3 w-[92%] bg-white/5" />
              <Skeleton className="h-3 w-[78%] bg-white/5" />
            </div>
          ) : (
            <div className="relative rounded-md bg-black/30 border border-white/10 p-3 text-xs text-foreground/90 leading-relaxed">
              {output}
              <button onClick={() => navigator.clipboard?.writeText(output)} className="absolute top-2 right-2 opacity-60 hover:opacity-100">
                <Copy className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[11px] uppercase tracking-widest text-indigo-300/80 mb-2">AI insights to refine</div>
        <div className="space-y-1.5">
          {insights.map((ins) => (
            <div key={ins.label} className="flex items-start gap-2 text-xs">
              <Sparkles className={`h-3 w-3 mt-0.5 ${ins.tone === "emerald" ? "text-emerald-300" : ins.tone === "purple" ? "text-purple-300" : "text-indigo-300"}`} />
              <span className="text-foreground/80">{ins.label}</span>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="mt-2 text-xs w-full justify-start"><RefreshCw className="h-3 w-3 mr-1.5" /> Apply AI refinements to voice profile</Button>
      </div>
    </GlassCard>
  );
}
