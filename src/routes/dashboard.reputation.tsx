import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Sparkles, Send, X, Flame, Reply, ShieldAlert, Ticket, Bell, CheckCircle2, Filter, Megaphone, Zap, MessageCircle, ArrowRight } from "lucide-react";
import { PageHeader, GlassCard, StatCard, Pill } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { sentimentBreakdown, mentions } from "@/lib/mock";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/reputation")({
  component: Reputation,
  head: () => ({ meta: [{ title: "Reputation & Listening — BrandSync AI" }] }),
});

function Reputation() {
  const [crisis, setCrisis] = useState(true);
  const [active, setActive] = useState<typeof mentions[0] | null>(null);
  return (
    <div>
      <AnimatePresence>
        {crisis && (
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 flex items-center gap-3 rounded-lg border border-rose-500/40 bg-rose-500/15 px-4 py-3 animate-pulse">
            <AlertTriangle className="h-5 w-5 text-rose-300" />
            <div className="flex-1 text-sm"><span className="text-rose-200 font-semibold">Crisis Alert · </span> Negative keyword "shipping delay" spiked +412% in 30 min · 84 mentions across X + IG</div>
            <Button size="sm" className="bg-rose-500 hover:bg-rose-600">Open War Room</Button>
            <button onClick={() => setCrisis(false)} className="text-rose-300"><X className="h-4 w-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader
        eyebrow="Listening"
        title="Brand Reputation Radar"
        subtitle="Real-time social mentions, sentiment scoring, and AI-drafted crisis responses."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-white/5 border-white/10"><Filter className="h-4 w-4 mr-1.5" /> Filters</Button>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 glow-primary" onClick={() => toast.success("Bulk reply queue opened · 12 drafts ready")}>
              <Zap className="h-4 w-4 mr-1.5" /> Bulk reply with AI
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Mentions (24h)" value="2,148" delta="+18%" accent="indigo" />
        <StatCard label="Net Sentiment" value="+0.71" delta="+0.04" accent="emerald" />
        <StatCard label="Negative Spikes" value="3" delta="+1 today" accent="rose" />
        <StatCard label="Auto-Responses Sent" value="84" accent="purple" />
      </div>

      <ActionCenter />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5">
        <GlassCard className="h-[420px]">
          <div className="text-sm font-medium mb-2">Sentiment Breakdown</div>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={sentimentBreakdown} dataKey="value" innerRadius={70} outerRadius={110} paddingAngle={3}>
                {sentimentBreakdown.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="h-[420px] p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 text-sm font-medium flex items-center justify-between">
            Live Mention Feed <Pill tone="emerald">streaming</Pill>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {mentions.map((m, i) => (
              <button key={i} onClick={() => m.sentiment === "negative" && setActive(m)} className="w-full text-left p-3 hover:bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{m.user}</span>
                  <span className="text-[10px] text-muted-foreground">· {m.time}</span>
                  <Pill tone={m.sentiment === "positive" ? "emerald" : m.sentiment === "negative" ? "rose" : "neutral"}>{m.sentiment}</Pill>
                </div>
                <div className="text-sm text-foreground/80">{m.text}</div>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="bg-[#0d1120] border-white/10 max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-400" /> AI Response Drafts</DialogTitle></DialogHeader>
          {active && (
            <>
              <div className="rounded-md bg-rose-500/10 border border-rose-500/30 p-3 text-sm">
                <div className="text-xs text-rose-300 mb-1">{active.user} · negative</div>
                {active.text}
              </div>
              <div className="text-xs text-muted-foreground mt-3">Empathetic responses pre-checked against brand voice:</div>
              {[
                "Hey — really sorry about that experience. We've escalated your refund to our priority queue and a human will reach out within 2 hours. DM coming. 🙏",
                "Thank you for flagging this — that's not the standard we hold ourselves to. Pinging support directly to make this right today.",
                "Apologies for the silence on your refund — that's on us. Our head of CX (Lina) is reaching out personally in the next hour."
              ].map((t, i) => (
                <button key={i} onClick={() => { toast.success("Response posted · monitoring sentiment"); setActive(null); }} className="w-full text-left mt-2 rounded-md bg-white/5 hover:bg-white/10 p-3 text-sm">
                  <div className="flex items-start gap-2"><Send className="h-4 w-4 text-indigo-300 mt-0.5" /><span>{t}</span></div>
                </button>
              ))}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type Priority = {
  id: string;
  title: string;
  channel: string;
  severity: "Critical" | "High" | "Medium";
  signal: string;
  recommendation: string;
  eta: string;
  tone: "rose" | "indigo" | "purple" | "emerald";
};

const PRIORITIES: Priority[] = [
  {
    id: "p1",
    title: "Shipping-delay narrative gaining traction",
    channel: "X · Instagram",
    severity: "Critical",
    signal: "84 mentions · sentiment -0.62 · velocity ×4.1",
    recommendation: "Post acknowledgement thread + DM top 12 amplifiers with refund status.",
    eta: "Act in < 30 min",
    tone: "rose",
  },
  {
    id: "p2",
    title: "Pricing pushback from solopreneur segment",
    channel: "Reddit · X",
    severity: "High",
    signal: "37 mentions · sentiment -0.31",
    recommendation: "Surface starter-tier value prop; pin a comparison reply on r/SaaS thread.",
    eta: "Act today",
    tone: "purple",
  },
  {
    id: "p3",
    title: "Power-user love for predictive simulation",
    channel: "LinkedIn · X",
    severity: "Medium",
    signal: "118 positive mentions · 4 quote-worthy",
    recommendation: "Convert top 3 quotes into social proof tiles + reply-thank-share.",
    eta: "This week",
    tone: "emerald",
  },
];

function ActionCenter() {
  const [filter, setFilter] = useState<"all" | "negative" | "positive">("all");
  const visible = PRIORITIES.filter(p => filter === "all" ? true : filter === "negative" ? p.tone === "rose" || p.tone === "purple" : p.tone === "emerald");

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-indigo-300"><Flame className="h-4 w-4" /> Action Center</div>
          <div className="text-xs text-muted-foreground">Prioritized issues with one-click responses — ranked by impact &amp; velocity.</div>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {(["all","negative","positive"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={cn("rounded-md px-2.5 py-1 border border-white/10", filter === f ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent" : "bg-white/5 hover:bg-white/10 text-foreground/70")}>
              {f === "all" ? "All" : f === "negative" ? "Risks" : "Opportunities"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visible.map(p => (
          <GlassCard key={p.id} className="relative overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {p.tone === "rose" ? <ShieldAlert className="h-4 w-4 text-rose-300" /> : p.tone === "emerald" ? <Megaphone className="h-4 w-4 text-emerald-300" /> : <AlertTriangle className="h-4 w-4 text-purple-300" />}
                <div className="text-sm font-semibold leading-tight">{p.title}</div>
              </div>
              <Pill tone={p.tone}>{p.severity}</Pill>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-2">
              <MessageCircle className="h-3 w-3" /> {p.channel} · <span className="text-foreground/70">{p.signal}</span>
            </div>
            <div className="mt-3 rounded-md bg-white/[0.03] border border-white/5 p-2.5 text-xs text-foreground/85 flex gap-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-300 mt-0.5 flex-none" />
              <span>{p.recommendation}</span>
            </div>
            <div className="mt-2 text-[11px] text-rose-300/90 flex items-center gap-1.5"><Bell className="h-3 w-3" /> {p.eta}</div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              <Button size="sm" className="h-7 text-xs bg-gradient-to-r from-indigo-500 to-purple-600" onClick={() => toast.success("AI reply queued for approval")}>
                <Reply className="h-3 w-3 mr-1" /> Reply with AI
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs bg-white/5 border-white/10" onClick={() => toast("Escalated to CX lead")}>
                <ArrowRight className="h-3 w-3 mr-1" /> Escalate
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs col-span-1" onClick={() => toast("Ticket created in CRM")}>
                <Ticket className="h-3 w-3 mr-1" /> Ticket
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs col-span-1" onClick={() => toast.success("Marked resolved")}>
                <CheckCircle2 className="h-3 w-3 mr-1" /> Resolve
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
