import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  MessageCircle, Target, Star, TrendingUp, AlertTriangle,
  Calendar, Filter, Info, Download, Bookmark, MoreVertical, ArrowUpRight, ArrowDownRight,
  Globe, Twitter, Instagram, Youtube, Newspaper, MessagesSquare,
} from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Cell,
  RadialBarChart, RadialBar, PolarAngleAxis,
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
  { tag: "Product Feedback",    mentions: 643, pct: 30, color: "#a78bfa", icon: "💬" },
  { tag: "Industry Impact",     mentions: 512, pct: 24, color: "#60a5fa", icon: "🏆" },
  { tag: "Customer Experience", mentions: 398, pct: 19, color: "#fbbf24", icon: "👤" },
  { tag: "Performance",         mentions: 287, pct: 13, color: "#22d3ee", icon: "📈" },
  { tag: "Partnerships",        mentions: 176, pct: 8,  color: "#34d399", icon: "🤝" },
  { tag: "Other",               mentions: 132, pct: 6,  color: "#94a3b8", icon: "•••" },
];

const distribution = [
  { band: "0-20",   pct: 8,  color: "#f43f5e" },
  { band: "21-40",  pct: 17, color: "#fb923c" },
  { band: "41-60",  pct: 28, color: "#facc15" },
  { band: "61-80",  pct: 31, color: "#84cc16" },
  { band: "81-100", pct: 16, color: "#22c55e" },
];

/* Channel breakdown — fills the gap below Score Trend */
const channels = [
  { name: "Twitter / X",  icon: Twitter,        mentions: 842, sentiment: 68, share: 39, color: "#60a5fa" },
  { name: "Instagram",    icon: Instagram,      mentions: 514, sentiment: 74, share: 24, color: "#f472b6" },
  { name: "News / Web",   icon: Newspaper,      mentions: 318, sentiment: 61, share: 15, color: "#a78bfa" },
  { name: "YouTube",      icon: Youtube,        mentions: 232, sentiment: 70, share: 11, color: "#f87171" },
  { name: "Reddit",       icon: MessagesSquare, mentions: 142, sentiment: 48, share: 7,  color: "#fb923c" },
  { name: "Other Web",    icon: Globe,          mentions: 100, sentiment: 55, share: 4,  color: "#22d3ee" },
];

const sentimentSplit = [
  { name: "Positive", value: 58, fill: "#22c55e" },
  { name: "Neutral",  value: 27, fill: "#94a3b8" },
  { name: "Negative", value: 15, fill: "#f43f5e" },
];

type Mention = {
  user: string; initials: string; time: string; text: string;
  score: number | null; tone: "neg" | "warn" | "ok" | "good"; tags: { label: string; color: string }[];
};
const FEED: Mention[] = [
  { user: "@upsetcustomer", initials: "UC", time: "33m",
    text: "Support never replied to my refund request. Disappointed.",
    score: 22, tone: "neg",
    tags: [{ label: "Customer Experience", color: "bg-orange-500/15 text-orange-300" }, { label: "Complaint", color: "bg-rose-500/15 text-rose-300" }] },
  { user: "@adopslead", initials: "AD", time: "9m",
    text: "Cut our paid spend by 38% in 6 weeks switching to BrandSync auto-pilot.",
    score: 75, tone: "warn",
    tags: [{ label: "Product Feedback", color: "bg-violet-500/15 text-violet-300" }, { label: "Performance", color: "bg-cyan-500/15 text-cyan-300" }] },
  { user: "@trendlens", initials: "TS", time: "2m",
    text: "Honestly @brandsync is the cleanest MarTech UI I've used in years. ✨",
    score: 82, tone: "good",
    tags: [{ label: "Industry Impact", color: "bg-blue-500/15 text-blue-300" }, { label: "Praise", color: "bg-emerald-500/15 text-emerald-300" }] },
  { user: "@growthnerd", initials: "GN", time: "21m",
    text: "Reporting feels okay, wish exports were faster.",
    score: 46, tone: "ok",
    tags: [{ label: "Product Feedback", color: "bg-violet-500/15 text-violet-300" }, { label: "Improvement", color: "bg-amber-500/15 text-amber-300" }] },
  { user: "@cmoworld", initials: "CM", time: "44m",
    text: "BrandSync's predictive simulation literally saved a $40k campaign.",
    score: 88, tone: "good",
    tags: [{ label: "Industry Impact", color: "bg-blue-500/15 text-blue-300" }, { label: "Success Story", color: "bg-emerald-500/15 text-emerald-300" }] },
];

/* -------- ui atoms -------- */
function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn(
      "rounded-2xl border border-border bg-card backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.25)]",
      className,
    )}>
      {children}
    </div>
  );
}

function KPI({ label, value, suffix, delta, deltaTone, icon, iconBg, iconColor }: {
  label: string; value: string; suffix?: string; delta?: string; deltaTone?: "up" | "down";
  icon: React.ReactNode; iconBg: string; iconColor: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground font-medium">{label}</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-semibold tracking-tight text-foreground">{value}</span>
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </div>
        </div>
        <div className={cn("h-10 w-10 rounded-xl grid place-items-center", iconBg, iconColor)}>{icon}</div>
      </div>
      {delta && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {deltaTone === "down"
            ? <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
            : <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />}
          <span className={cn("font-semibold", deltaTone === "down" ? "text-rose-400" : "text-emerald-400")}>{delta}</span>
          <span className="text-muted-foreground">vs. previous 24h</span>
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
            ? "border-rose-400/30 bg-rose-500/15 text-rose-300"
            : "border-violet-400/30 bg-violet-500/15 text-violet-200"
          : "border-border bg-white/5 text-muted-foreground hover:bg-white/10",
      )}>
      {children}
    </button>
  );
}

function ScoreBadge({ score, tone }: { score: number | null; tone: Mention["tone"] }) {
  const color =
    tone === "neg" ? "text-rose-400" :
    tone === "warn" ? "text-orange-300" :
    tone === "ok" ? "text-amber-300" : "text-emerald-400";
  return (
    <div className="flex items-center gap-1">
      <span className={cn("text-2xl font-semibold tabular-nums", color)}>{score ?? "—"}</span>
      {score !== null && (tone === "neg"
        ? <ArrowDownRight className={cn("h-4 w-4", color)} />
        : <ArrowUpRight className={cn("h-4 w-4", color)} />)}
    </div>
  );
}

const GRID = "rgba(148,163,184,0.12)";
const AXIS = "rgba(148,163,184,0.6)";
const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,0.2)",
  background: "rgba(15,18,30,0.95)",
  color: "#e2e8f0",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
};

/* -------- page -------- */
function Reputation() {
  const [chartMode, setChartMode] = useState<"score" | "volume">("score");
  const [feedFilter, setFeedFilter] = useState<"attention" | "high" | "rising" | "all">("attention");

  return (
    <div className="-m-6 p-6 min-h-[calc(100vh-4rem)]">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Brand Reputation Radar</h1>
          <p className="mt-1 text-sm text-muted-foreground">Real-time mentions, AI scoring and actionable insights.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-foreground/80 hover:bg-white/10">
            <Calendar className="h-4 w-4 text-muted-foreground" /> Last 24 Hours
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-foreground/80 hover:bg-white/10">
            <Filter className="h-4 w-4 text-muted-foreground" /> Filters
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KPI label="Total Mentions" value="2,148" delta="18%" deltaTone="up"
          icon={<MessageCircle className="h-5 w-5" />} iconBg="bg-violet-500/15" iconColor="text-violet-300" />
        <KPI label="Average AI Score" value="63" suffix="/100" delta="6 pts" deltaTone="up"
          icon={<Target className="h-5 w-5" />} iconBg="bg-emerald-500/15" iconColor="text-emerald-300" />
        <KPI label="High Impact Mentions" value="321" delta="23%" deltaTone="up"
          icon={<Star className="h-5 w-5" />} iconBg="bg-amber-500/15" iconColor="text-amber-300" />
        <KPI label="Rising Mentions" value="128" delta="29%" deltaTone="up"
          icon={<TrendingUp className="h-5 w-5" />} iconBg="bg-indigo-500/15" iconColor="text-indigo-300" />
        <KPI label="Needs Attention" value="412" delta="12%" deltaTone="down"
          icon={<AlertTriangle className="h-5 w-5" />} iconBg="bg-rose-500/15" iconColor="text-rose-300" />
      </div>

      {/* Score Trend (+ Channel Mix below) | Mention Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6 mb-6">
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">Score Trend</h3>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-violet-400 rounded" /> Average Score</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-white/20" /> Volume</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Pill active={chartMode === "score"} onClick={() => setChartMode("score")}>AI Score</Pill>
              <Pill active={chartMode === "volume"} onClick={() => setChartMode("volume")}>Volume</Pill>
              <button className="ml-1 inline-flex items-center gap-1 rounded-lg border border-border bg-white/5 px-3 py-1.5 text-xs text-muted-foreground">
                By: Hour <span className="text-muted-foreground/70">▾</span>
              </button>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis dataKey="hour" stroke={AXIS} fontSize={11} interval={2} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} domain={[0, 400]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#e2e8f0", fontWeight: 600 }} />
                  <Bar yAxisId="right" dataKey="volume" fill="rgba(148,163,184,0.25)" radius={[3,3,0,0]} barSize={14} />
                  <Line yAxisId="left" type="monotone" dataKey="score" stroke="#a78bfa" strokeWidth={2.5} dot={{ r: 3, fill: "#a78bfa" }} activeDot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-violet-500/10 border border-violet-400/20 px-3 py-2 text-xs text-violet-200">
              <Info className="h-3.5 w-3.5" />
              Your average score improved 6 points in the last 24 hours.
            </div>
          </Card>

          {/* Fills the previous gap: Channel Mix + Sentiment Split */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">Channel Performance Matrix</h3>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Live · last 24h</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
              {/* channel rows */}
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_auto_140px_auto] gap-x-4 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <span>Channel</span>
                  <span className="text-right">Mentions</span>
                  <span>Sentiment</span>
                  <span className="text-right">Share</span>
                </div>
                {channels.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div key={c.name} className="grid grid-cols-[1fr_auto_140px_auto] items-center gap-x-4">
                      <div className="flex items-center gap-2.5 text-sm text-foreground/90 min-w-0">
                        <span
                          className="h-7 w-7 shrink-0 rounded-lg grid place-items-center"
                          style={{ background: `${c.color}22`, color: c.color }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="truncate">{c.name}</span>
                      </div>
                      <div className="text-sm text-foreground/80 tabular-nums text-right">{c.mentions.toLocaleString()}</div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${c.sentiment}%`,
                              background: `linear-gradient(90deg, ${c.color}, ${c.color}cc)`,
                            }}
                          />
                        </div>
                        <span className="text-[11px] tabular-nums text-muted-foreground w-7 text-right">{c.sentiment}</span>
                      </div>
                      <div className="text-sm text-muted-foreground tabular-nums text-right">{c.share}%</div>
                    </div>
                  );
                })}
              </div>

              {/* sentiment radial */}
              <div className="rounded-xl border border-border bg-white/[0.03] p-3 flex flex-col">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Sentiment Split</div>
                <div className="flex-1 min-h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="40%"
                      outerRadius="100%"
                      barSize={10}
                      data={sentimentSplit}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar background={{ fill: "rgba(148,163,184,0.08)" }} dataKey="value" cornerRadius={6} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1 text-center">
                  {sentimentSplit.map((s) => (
                    <div key={s.name}>
                      <div className="flex items-center justify-center gap-1">
                        <span className="h-2 w-2 rounded-sm" style={{ background: s.fill }} />
                        <span className="text-[10px] text-muted-foreground">{s.name}</span>
                      </div>
                      <div className="text-sm font-semibold text-foreground tabular-nums">{s.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-base font-semibold text-foreground">Mention Feed</h3>
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Pill danger active={feedFilter === "attention"} onClick={() => setFeedFilter("attention")}>Needs Attention</Pill>
            <Pill active={feedFilter === "high"} onClick={() => setFeedFilter("high")}>High Impact</Pill>
            <Pill active={feedFilter === "rising"} onClick={() => setFeedFilter("rising")}>Rising</Pill>
            <Pill active={feedFilter === "all"} onClick={() => setFeedFilter("all")}>All Mentions</Pill>
          </div>
          <div className="space-y-3">
            {FEED.map((m, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-border p-3 hover:bg-white/[0.04] transition-colors">
                <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 grid place-items-center text-[11px] font-semibold text-white">{m.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">{m.user}</span>
                    <span className="text-[11px] text-muted-foreground">· {m.time}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-foreground/75 leading-snug">{m.text}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.tags.map(t => (
                      <span key={t.label} className={cn("rounded-md px-2 py-0.5 text-[10px] font-medium", t.color)}>{t.label}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-muted-foreground">Score</span>
                  <ScoreBadge score={m.score} tone={m.tone} />
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <button className="hover:text-foreground"><Bookmark className="h-3.5 w-3.5" /></button>
                    <button className="hover:text-foreground"><MoreVertical className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-300 hover:text-violet-200">
            View all mentions →
          </button>
        </Card>
      </div>

      {/* Tags + Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-base font-semibold text-foreground">Mentions by Tag</h3>
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-[1fr_auto_180px_auto] gap-x-4 text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
            <span>Tag</span><span className="text-right">Mentions</span><span /><span className="text-right">% of Total</span>
          </div>
          <div className="space-y-3">
            {tags.map(t => (
              <div key={t.tag} className="grid grid-cols-[1fr_auto_180px_auto] items-center gap-x-4">
                <div className="flex items-center gap-2 text-sm text-foreground/85">
                  <span className="text-base">{t.icon}</span> {t.tag}
                </div>
                <div className="text-sm text-foreground/85 tabular-nums text-right">{t.mentions}</div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${t.pct * 3.2}%`, background: t.color }} />
                </div>
                <div className="text-sm text-muted-foreground tabular-nums text-right">{t.pct}%</div>
              </div>
            ))}
          </div>
          <button className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-violet-300 hover:text-violet-200">
            View all tags →
          </button>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-base font-semibold text-foreground">Score Distribution</h3>
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="band" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis hide domain={[0, 40]} />
                <Tooltip cursor={{ fill: "rgba(148,163,184,0.08)" }} contentStyle={TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
                <Bar dataKey="pct" radius={[8,8,0,0]} barSize={56}
                  label={{ position: "top", fill: "#cbd5e1", fontSize: 12, fontWeight: 600, formatter: (v: number) => `${v}%` }}>
                  {distribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 h-1 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500" />
          <div className="mt-1 flex justify-end text-[11px] text-muted-foreground">Higher Score →</div>
          <button className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-violet-300 hover:text-violet-200">
            View full analytics →
          </button>
        </Card>
      </div>

      {/* Export Report */}
      <div className="mt-6 flex justify-start">
        <Button
          onClick={() => toast.success("Report exported · check your downloads")}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-white/5 px-4 py-2 text-sm font-medium text-foreground/90 hover:bg-white/10"
          variant="outline">
          <Download className="h-4 w-4" /> Export Report
        </Button>
      </div>
    </div>
  );
}
