import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  MessageCircle, Target, Star, TrendingUp, AlertTriangle,
  Calendar, Filter, Info, Download, Bookmark, MoreVertical, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/reputation")({
  component: Reputation,
  head: () => ({ meta: [{ title: "Brand Reputation Radar — BrandSync AI" }] }),
});

/* -------- data -------- */
const HOURS = ["12 AM","1","2","3 AM","4","5","6 AM","7","8","9 AM","10","11","12 PM","1","2","3 PM","4","5","6 PM","7","8","9 PM","10","11"];
const trend = HOURS.map((h, i) => {
  const score = Math.round(50 + Math.sin(i / 2.4) * 14 + (i === 9 ? 10 : 0) + Math.random() * 6);
  const volume = Math.round(120 + Math.sin(i / 1.8) * 80 + (i === 9 ? 130 : 0) + Math.random() * 40);
  return { hour: h, score, volume };
});

const tags = [
  { tag: "Product Feedback",   mentions: 643, pct: 30, color: "#7c5cff", icon: "💬" },
  { tag: "Industry Impact",    mentions: 512, pct: 24, color: "#3b82f6", icon: "🏆" },
  { tag: "Customer Experience",mentions: 398, pct: 19, color: "#f59e0b", icon: "👤" },
  { tag: "Performance",        mentions: 287, pct: 13, color: "#06b6d4", icon: "📈" },
  { tag: "Partnerships",       mentions: 176, pct: 8,  color: "#10b981", icon: "🤝" },
  { tag: "Other",              mentions: 132, pct: 6,  color: "#94a3b8", icon: "•••" },
];

const distribution = [
  { band: "0-20",   pct: 8,  color: "#ef4444" },
  { band: "21-40",  pct: 17, color: "#f59e0b" },
  { band: "41-60",  pct: 28, color: "#facc15" },
  { band: "61-80",  pct: 31, color: "#84cc16" },
  { band: "81-100", pct: 16, color: "#22c55e" },
];

type Mention = {
  user: string; initials: string; time: string; text: string;
  score: number | null; tone: "neg" | "warn" | "ok" | "good"; tags: { label: string; color: string }[];
};
const FEED: Mention[] = [
  { user: "@upsetcustomer", initials: "UC", time: "33m",
    text: "Support never replied to my refund request. Disappointed.",
    score: 22, tone: "neg",
    tags: [{ label: "Customer Experience", color: "bg-orange-100 text-orange-700" }, { label: "Complaint", color: "bg-rose-100 text-rose-700" }] },
  { user: "@adopslead", initials: "AD", time: "9m",
    text: "Cut our paid spend by 38% in 6 weeks switching to BrandSync auto-pilot.",
    score: 75, tone: "warn",
    tags: [{ label: "Product Feedback", color: "bg-violet-100 text-violet-700" }, { label: "Performance", color: "bg-cyan-100 text-cyan-700" }] },
  { user: "@trendlens", initials: "TS", time: "2m",
    text: "Honestly @brandsync is the cleanest MarTech UI I've used in years. ✨",
    score: 82, tone: "good",
    tags: [{ label: "Industry Impact", color: "bg-blue-100 text-blue-700" }, { label: "Praise", color: "bg-emerald-100 text-emerald-700" }] },
  { user: "@growthnerd", initials: "GN", time: "21m",
    text: "Reporting feels okay, wish exports were faster.",
    score: 46, tone: "ok",
    tags: [{ label: "Product Feedback", color: "bg-violet-100 text-violet-700" }, { label: "Improvement", color: "bg-amber-100 text-amber-700" }] },
  { user: "@cmoworld", initials: "CM", time: "44m",
    text: "BrandSync's predictive simulation literally saved a $40k campaign.",
    score: 88, tone: "good",
    tags: [{ label: "Industry Impact", color: "bg-blue-100 text-blue-700" }, { label: "Success Story", color: "bg-emerald-100 text-emerald-700" }] },
];

/* -------- ui atoms -------- */
function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]", className)}>{children}</div>;
}

function KPI({ label, value, suffix, delta, deltaTone, icon, iconBg, iconColor }: {
  label: string; value: string; suffix?: string; delta?: string; deltaTone?: "up" | "down";
  icon: React.ReactNode; iconBg: string; iconColor: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500 font-medium">{label}</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-semibold tracking-tight text-slate-900">{value}</span>
            {suffix && <span className="text-sm text-slate-400">{suffix}</span>}
          </div>
        </div>
        <div className={cn("h-10 w-10 rounded-xl grid place-items-center", iconBg, iconColor)}>{icon}</div>
      </div>
      {delta && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {deltaTone === "down"
            ? <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
            : <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />}
          <span className={cn("font-semibold", deltaTone === "down" ? "text-rose-600" : "text-emerald-600")}>{delta}</span>
          <span className="text-slate-400">vs. previous 24h</span>
        </div>
      )}
    </Card>
  );
}

function Pill({ active, children, onClick, danger }: { active?: boolean; danger?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? danger
            ? "border-rose-200 bg-rose-50 text-rose-600"
            : "border-violet-200 bg-violet-50 text-violet-700"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
      )}>
      {children}
    </button>
  );
}

function ScoreBadge({ score, tone }: { score: number | null; tone: Mention["tone"] }) {
  const color =
    tone === "neg" ? "text-rose-600" :
    tone === "warn" ? "text-orange-500" :
    tone === "ok" ? "text-amber-500" : "text-emerald-600";
  return (
    <div className="flex items-center gap-1">
      <span className={cn("text-2xl font-semibold tabular-nums", color)}>{score ?? "—"}</span>
      {score !== null && (tone === "neg"
        ? <ArrowDownRight className={cn("h-4 w-4", color)} />
        : <ArrowUpRight className={cn("h-4 w-4", color)} />)}
    </div>
  );
}

/* -------- page -------- */
function Reputation() {
  const [chartMode, setChartMode] = useState<"score" | "volume">("score");
  const [feedFilter, setFeedFilter] = useState<"attention" | "high" | "rising" | "all">("attention");

  return (
    <div className="bg-slate-50 -m-6 p-6 min-h-[calc(100vh-4rem)]">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Brand Reputation Radar</h1>
          <p className="mt-1 text-sm text-slate-500">Real-time mentions, AI scoring and actionable insights.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <Calendar className="h-4 w-4 text-slate-500" /> Last 24 Hours
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <Filter className="h-4 w-4 text-slate-500" /> Filters
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KPI label="Total Mentions" value="2,148" delta="18%" deltaTone="up"
          icon={<MessageCircle className="h-5 w-5" />} iconBg="bg-violet-100" iconColor="text-violet-600" />
        <KPI label="Average AI Score" value="63" suffix="/100" delta="6 pts" deltaTone="up"
          icon={<Target className="h-5 w-5" />} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
        <KPI label="High Impact Mentions" value="321" delta="23%" deltaTone="up"
          icon={<Star className="h-5 w-5" />} iconBg="bg-amber-100" iconColor="text-amber-600" />
        <KPI label="Rising Mentions" value="128" delta="29%" deltaTone="up"
          icon={<TrendingUp className="h-5 w-5" />} iconBg="bg-indigo-100" iconColor="text-indigo-600" />
        <KPI label="Needs Attention" value="412" delta="12%" deltaTone="down"
          icon={<AlertTriangle className="h-5 w-5" />} iconBg="bg-rose-100" iconColor="text-rose-600" />
      </div>

      {/* Score Trend + Mention Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6 mb-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">Score Trend</h3>
              <Info className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-violet-500 rounded" /> Average Score</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-slate-200" /> Volume</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Pill active={chartMode === "score"} onClick={() => setChartMode("score")}>AI Score</Pill>
            <Pill active={chartMode === "volume"} onClick={() => setChartMode("volume")}>Volume</Pill>
            <button className="ml-1 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
              By: Hour <span className="text-slate-400">▾</span>
            </button>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} interval={2} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 400]} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }}
                  labelStyle={{ color: "#0f172a", fontWeight: 600 }} />
                <Bar yAxisId="right" dataKey="volume" fill="#e2e8f0" radius={[3,3,0,0]} barSize={14} />
                <Line yAxisId="left" type="monotone" dataKey="score" stroke="#7c5cff" strokeWidth={2.5} dot={{ r: 3, fill: "#7c5cff" }} activeDot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-xs text-violet-700">
            <Info className="h-3.5 w-3.5" />
            Your average score improved 6 points in the last 24 hours.
          </div>
        </Card>

        <Card className="p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-base font-semibold text-slate-900">Mention Feed</h3>
            <Info className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Pill danger active={feedFilter === "attention"} onClick={() => setFeedFilter("attention")}>Needs Attention</Pill>
            <Pill active={feedFilter === "high"} onClick={() => setFeedFilter("high")}>High Impact</Pill>
            <Pill active={feedFilter === "rising"} onClick={() => setFeedFilter("rising")}>Rising</Pill>
            <Pill active={feedFilter === "all"} onClick={() => setFeedFilter("all")}>All Mentions</Pill>
          </div>
          <div className="space-y-3">
            {FEED.map((m, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50/60 transition-colors">
                <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 grid place-items-center text-[11px] font-semibold text-white">{m.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 truncate">{m.user}</span>
                    <span className="text-[11px] text-slate-400">· {m.time}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600 leading-snug">{m.text}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.tags.map(t => (
                      <span key={t.label} className={cn("rounded-md px-2 py-0.5 text-[10px] font-medium", t.color)}>{t.label}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-slate-400">Score</span>
                  <ScoreBadge score={m.score} tone={m.tone} />
                  <div className="flex items-center gap-1 text-slate-400">
                    <button className="hover:text-slate-600"><Bookmark className="h-3.5 w-3.5" /></button>
                    <button className="hover:text-slate-600"><MoreVertical className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700">
            View all mentions →
          </button>
        </Card>
      </div>

      {/* Tags + Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-base font-semibold text-slate-900">Mentions by Tag</h3>
            <Info className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="grid grid-cols-[1fr_auto_180px_auto] gap-x-4 text-[11px] uppercase tracking-wide text-slate-400 mb-2">
            <span>Tag</span><span className="text-right">Mentions</span><span /><span className="text-right">% of Total</span>
          </div>
          <div className="space-y-3">
            {tags.map(t => (
              <div key={t.tag} className="grid grid-cols-[1fr_auto_180px_auto] items-center gap-x-4">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-base">{t.icon}</span> {t.tag}
                </div>
                <div className="text-sm text-slate-700 tabular-nums text-right">{t.mentions}</div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${t.pct * 3.2}%`, background: t.color }} />
                </div>
                <div className="text-sm text-slate-500 tabular-nums text-right">{t.pct}%</div>
              </div>
            ))}
          </div>
          <button className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700">
            View all tags →
          </button>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-base font-semibold text-slate-900">Score Distribution</h3>
            <Info className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="band" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis hide domain={[0, 40]} />
                <Tooltip cursor={{ fill: "rgba(148,163,184,0.08)" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} formatter={(v) => `${v}%`} />
                <Bar dataKey="pct" radius={[8,8,0,0]} barSize={56}
                  label={{ position: "top", fill: "#475569", fontSize: 12, fontWeight: 600, formatter: (v: number) => `${v}%` }}>
                  {distribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 h-1 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500" />
          <div className="mt-1 flex justify-end text-[11px] text-slate-400">Higher Score →</div>
          <button className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700">
            View full analytics →
          </button>
        </Card>
      </div>

      {/* Export Report */}
      <div className="mt-6 flex justify-start">
        <Button
          onClick={() => toast.success("Report exported · check your downloads")}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          variant="outline">
          <Download className="h-4 w-4" /> Export Report
        </Button>
      </div>
    </div>
  );
}
