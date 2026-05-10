import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Users, AlertCircle, Copy, Sparkles } from "lucide-react";
import { PageHeader, GlassCard, StatCard, Pill } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/audience")({
  component: Audience,
  head: () => ({ meta: [{ title: "Audience Intelligence — BrandSync AI" }] }),
});

const HOTSPOTS = [
  { name: "New York", x: 28, y: 36, intensity: 92 },
  { name: "London", x: 49, y: 30, intensity: 86 },
  { name: "Dubai", x: 60, y: 46, intensity: 78 },
  { name: "Dhaka", x: 70, y: 48, intensity: 88 },
  { name: "Singapore", x: 76, y: 56, intensity: 74 },
  { name: "Sydney", x: 84, y: 72, intensity: 65 },
  { name: "São Paulo", x: 33, y: 70, intensity: 70 },
];

const SEGMENTS = [
  { title: "High-Value Customers", count: "12,840", confidence: 92, accent: "emerald", desc: "Repeat buyers spending >$500 LTV. Buying Apr–Jun." },
  { title: "Churn Risk", count: "3,120", confidence: 87, accent: "rose", desc: "No engagement in 30d. Predicted to lapse within 21d." },
  { title: "Lookalike (TikTok)", count: "2.1M", confidence: 81, accent: "purple", desc: "Mirror audience modeled on top 5% spenders." },
  { title: "Intent: Compare Pricing", count: "8,640", confidence: 78, accent: "indigo", desc: "Recently visited /pricing 2+ times in last 7d." },
];

function Audience() {
  return (
    <div>
      <PageHeader eyebrow="Predictive Layer" title="Audience Intelligence"
        subtitle="Real-time behavioral segmentation and geo-intent — every cluster scored with AI confidence."
        actions={<Button onClick={() => toast.success("Lookalike audience export started · Meta + TikTok")} className="bg-gradient-to-r from-indigo-500 to-purple-600"><Copy className="h-4 w-4 mr-2" />Generate Lookalike</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Tracked Profiles" value="2.4M" delta="+184K" accent="indigo" />
        <StatCard label="Active Segments" value="42" accent="purple" />
        <StatCard label="Predicted Buyers (30d)" value="38,210" delta="+12.4%" accent="emerald" />
        <StatCard label="Avg AI Confidence" value="84%" accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
        <GlassCard className="relative overflow-hidden h-[420px]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-indigo-300" /> Geo-Intent Map</div>
              <div className="text-xs text-muted-foreground">Live pulses indicate high-intent activity in last 24h</div>
            </div>
            <Pill tone="emerald">live</Pill>
          </div>
          <div className="relative h-[340px] rounded-lg bg-[radial-gradient(ellipse_at_center,rgba(120,80,255,0.18),transparent_70%)] overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-30" />
            {/* Stylized world dots */}
            <svg viewBox="0 0 100 60" className="absolute inset-0 w-full h-full opacity-30">
              {Array.from({ length: 240 }).map((_, i) => {
                const x = (i * 17) % 100;
                const y = ((i * 7) % 60);
                return <circle key={i} cx={x} cy={y} r="0.4" fill="white" />;
              })}
            </svg>
            {HOTSPOTS.map((h) => (
              <div key={h.name} className="absolute" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                  <div className="pulse-ring text-indigo-400 absolute inset-0 h-3 w-3 rounded-full" />
                  <div className="h-3 w-3 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 glow-primary" />
                  <div className="absolute left-4 -top-1 whitespace-nowrap text-[10px] text-foreground/80">{h.name} <span className="text-emerald-300">{h.intensity}%</span></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-sm font-medium mb-3">Predictive Segments</div>
          <div className="space-y-3">
            {SEGMENTS.map((s) => (
              <motion.div key={s.title} whileHover={{ x: 2 }} className="rounded-lg border border-white/10 bg-white/[0.02] p-3 flex items-center gap-3">
                <Ring pct={s.confidence} accent={s.accent as "emerald"} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{s.count}</div>
                  <Pill tone={s.accent as "emerald"}>{s.confidence}%</Pill>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-5 p-0 overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <div className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4" /> Behavioral Cohort Explorer</div>
          <div className="flex gap-2"><Pill tone="indigo">Last 30d</Pill><Pill tone="purple">Web + App</Pill></div>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-white/[0.02]">
            <tr>{["Cohort","Size","Intent Score","Conv. Probability","Recommended Channel","Action"].map(h => <th key={h} className="text-left px-4 py-2">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[
              ["Pricing Page Re-visitors","8,640",92,"71%","WhatsApp"],
              ["High-LTV / Lapsed 30d","3,120",78,"54%","Email"],
              ["Cart Abandoners (24h)","2,940",95,"82%","Meta retargeting"],
              ["Demo Watchers (>50%)","1,850",88,"65%","Sales follow-up"],
              ["TikTok Engaged · 18-24","41,200",74,"22%","TikTok Spark"],
            ].map((r, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="px-4 py-2.5">{r[0]}</td>
                <td className="px-4 py-2.5">{r[1]}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2"><div className="h-1.5 w-24 rounded-full bg-white/5"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${r[2]}%` }} /></div><span className="text-xs">{r[2]}</span></div>
                </td>
                <td className="px-4 py-2.5 text-emerald-300">{r[3]}</td>
                <td className="px-4 py-2.5">{r[4]}</td>
                <td className="px-4 py-2.5"><Button size="sm" variant="ghost" className="text-indigo-300"><Sparkles className="h-3.5 w-3.5 mr-1" /> Activate</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      <div className="mt-5 flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm">
        <AlertCircle className="h-4 w-4 text-amber-300" />
        <span className="text-amber-100">Privacy-safe: all profiles inferred from first-party data. GDPR / CCPA compliant.</span>
      </div>
    </div>
  );
}

function Ring({ pct, accent }: { pct: number; accent: "emerald" | "indigo" | "rose" | "purple" }) {
  const map = { emerald: "oklch(0.72 0.18 155)", indigo: "oklch(0.65 0.22 280)", rose: "oklch(0.65 0.25 20)", purple: "oklch(0.6 0.24 295)" };
  const dash = (pct / 100) * 113;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0">
      <circle cx="22" cy="22" r="18" stroke="oklch(1 0 0 / 0.08)" strokeWidth="3" fill="none" />
      <circle cx="22" cy="22" r="18" stroke={map[accent]} strokeWidth="3" fill="none" strokeDasharray={`${dash} 113`} strokeLinecap="round" transform="rotate(-90 22 22)" />
      <text x="22" y="26" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">{pct}%</text>
    </svg>
  );
}
