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

      <PageHeader eyebrow="Listening" title="Brand Reputation Radar" subtitle="Real-time social mentions, sentiment scoring, and AI-drafted crisis responses." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Mentions (24h)" value="2,148" delta="+18%" accent="indigo" />
        <StatCard label="Net Sentiment" value="+0.71" delta="+0.04" accent="emerald" />
        <StatCard label="Negative Spikes" value="3" delta="+1 today" accent="rose" />
        <StatCard label="Auto-Responses Sent" value="84" accent="purple" />
      </div>

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
