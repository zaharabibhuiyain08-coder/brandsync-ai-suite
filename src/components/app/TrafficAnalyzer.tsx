import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Calendar as CalendarIcon, Globe2, MousePointerClick, Users, Clock, TrendingUp, Search, Share2, Mail, Megaphone, ArrowUpRight, RefreshCw, MapPin } from "lucide-react";
import { GlassCard, Pill, StatCard } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

type RangeMode = "single" | "month" | "last2" | "last3" | "custom";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Deterministic pseudo-random based on domain + date for repeatable mock data
function seedHash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}
function rand(seed: number, min: number, max: number) {
  const x = Math.sin(seed) * 10000;
  const f = x - Math.floor(x);
  return min + f * (max - min);
}

function buildMonthlySeries(domain: string, months: { y: number; m: number }[]) {
  return months.map(({ y, m }) => {
    const seed = seedHash(`${domain}-${y}-${m}`);
    const visits = Math.round(rand(seed, 220_000, 1_400_000));
    return {
      label: `${MONTHS[m]} ${String(y).slice(2)}`,
      visits,
      unique: Math.round(visits * rand(seed + 1, 0.55, 0.78)),
      bounce: +rand(seed + 2, 38, 62).toFixed(1),
      duration: +rand(seed + 3, 90, 280).toFixed(0), // seconds
      pages: +rand(seed + 4, 1.8, 4.6).toFixed(2),
    };
  });
}

function trafficSplit(domain: string, key: string) {
  const seed = seedHash(domain + key);
  // Direct, Search, Social, Referral, Mail, Display
  const raw = [
    rand(seed, 25, 42),
    rand(seed + 1, 28, 45),
    rand(seed + 2, 8, 22),
    rand(seed + 3, 4, 12),
    rand(seed + 4, 2, 7),
    rand(seed + 5, 1, 6),
  ];
  const sum = raw.reduce((a, b) => a + b, 0);
  const norm = raw.map(v => +(v / sum * 100).toFixed(1));
  return [
    { name: "Direct", value: norm[0], icon: Globe2, color: "oklch(0.65 0.22 280)" },
    { name: "Search", value: norm[1], icon: Search, color: "oklch(0.72 0.18 155)" },
    { name: "Social", value: norm[2], icon: Share2, color: "oklch(0.68 0.2 320)" },
    { name: "Referral", value: norm[3], icon: ArrowUpRight, color: "oklch(0.78 0.17 75)" },
    { name: "Mail", value: norm[4], icon: Mail, color: "oklch(0.7 0.15 220)" },
    { name: "Display", value: norm[5], icon: Megaphone, color: "oklch(0.65 0.25 20)" },
  ];
}

function topCountries(domain: string, key: string) {
  const seed = seedHash(domain + key + "geo");
  const list = ["United States","India","Bangladesh","United Kingdom","Germany","Brazil","UAE","Indonesia"];
  return list.slice(0, 6).map((c, i) => ({
    country: c,
    share: +rand(seed + i, 4, 32).toFixed(1),
  })).sort((a, b) => b.share - a.share);
}

function topKeywords(domain: string, key: string) {
  const seed = seedHash(domain + key + "kw");
  const base = ["brand strategy","marketing OS","ai for marketers","content automation","brand guidelines","social listening","predictive analytics","competitor benchmark"];
  return base.slice(0, 6).map((k, i) => ({
    kw: k,
    volume: Math.round(rand(seed + i, 1200, 22000)),
    pos: Math.round(rand(seed + i + 30, 1, 18)),
  })).sort((a, b) => b.volume - a.volume);
}

export function TrafficAnalyzer({ domain = "example.com" }: { domain?: string }) {
  const today = new Date();
  const [mode, setMode] = useState<RangeMode>("month");
  const [pickedDate, setPickedDate] = useState<Date>(today);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [customStart, setCustomStart] = useState<Date | undefined>(startOfMonth(subMonths(today, 1)));
  const [customEnd, setCustomEnd] = useState<Date | undefined>(endOfMonth(today));
  const [refreshing, setRefreshing] = useState(false);

  const cleanDomain = useMemo(() => (domain || "example.com").replace(/^https?:\/\//, "").replace(/\/.*$/, ""), [domain]);

  const months = useMemo(() => {
    if (mode === "single") {
      const d = pickedDate;
      return [{ y: d.getFullYear(), m: d.getMonth() }];
    }
    if (mode === "month") return [{ y: year, m: month }];
    if (mode === "last2") {
      const a = subMonths(today, 1), b = today;
      return [{ y: a.getFullYear(), m: a.getMonth() }, { y: b.getFullYear(), m: b.getMonth() }];
    }
    if (mode === "last3") {
      return [2,1,0].map(i => {
        const d = subMonths(today, i);
        return { y: d.getFullYear(), m: d.getMonth() };
      });
    }
    // custom
    if (customStart && customEnd) {
      const arr: { y: number; m: number }[] = [];
      let cur = startOfMonth(customStart);
      const end = startOfMonth(customEnd);
      while (cur <= end) {
        arr.push({ y: cur.getFullYear(), m: cur.getMonth() });
        cur = startOfMonth(subMonths(cur, -1));
      }
      return arr;
    }
    return [{ y: year, m: month }];
  }, [mode, pickedDate, year, month, customStart, customEnd, today]);

  const cacheKey = months.map(x => `${x.y}-${x.m}`).join("|");

  const series = useMemo(() => buildMonthlySeries(cleanDomain, months), [cleanDomain, cacheKey]);
  const split = useMemo(() => trafficSplit(cleanDomain, cacheKey), [cleanDomain, cacheKey]);
  const geo = useMemo(() => topCountries(cleanDomain, cacheKey), [cleanDomain, cacheKey]);
  const kws = useMemo(() => topKeywords(cleanDomain, cacheKey), [cleanDomain, cacheKey]);

  const totals = useMemo(() => {
    const visits = series.reduce((a, b) => a + b.visits, 0);
    const unique = series.reduce((a, b) => a + b.unique, 0);
    const bounce = series.reduce((a, b) => a + b.bounce, 0) / series.length;
    const dur = series.reduce((a, b) => a + b.duration, 0) / series.length;
    const pages = series.reduce((a, b) => a + b.pages, 0) / series.length;
    const seed = seedHash(cleanDomain + cacheKey);
    return {
      visits, unique,
      bounce: bounce.toFixed(1) + "%",
      dur: `${Math.floor(dur / 60)}m ${Math.round(dur % 60)}s`,
      pages: pages.toFixed(2),
      globalRank: Math.round(rand(seed, 4_000, 280_000)),
      countryRank: Math.round(rand(seed + 1, 80, 12_000)),
      categoryRank: Math.round(rand(seed + 2, 4, 220)),
    };
  }, [series, cleanDomain, cacheKey]);

  function refresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }

  const fmt = (n: number) => n >= 1_000_000 ? (n / 1_000_000).toFixed(2) + "M" : n >= 1_000 ? (n / 1_000).toFixed(1) + "K" : String(n);

  const years = Array.from({ length: 6 }, (_, i) => today.getFullYear() - i);

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <GlassCard className="!p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-sm font-medium mr-2">
            <Globe2 className="h-4 w-4 text-indigo-300" />
            <span>{cleanDomain}</span>
            <Pill tone="emerald">Live mock</Pill>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {(["last3","last2","month","single","custom"] as RangeMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-md border border-white/10 px-3 py-1.5 text-xs transition",
                  mode === m ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent" : "bg-white/5 hover:bg-white/10 text-foreground/80"
                )}
              >
                {m === "last3" ? "Last 3 mo" : m === "last2" ? "Last 2 mo" : m === "month" ? "By month" : m === "single" ? "Specific day" : "Custom range"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {mode === "month" && (
            <>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>{MONTHS.map((mn, i) => <SelectItem key={i} value={String(i)}>{mn}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="w-[110px] bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </>
          )}

          {mode === "single" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-white/5 border-white/10 h-9">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(pickedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={pickedDate} onSelect={(d) => d && setPickedDate(d)} className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          )}

          {mode === "custom" && (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-white/5 border-white/10 h-9">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {customStart ? format(customStart, "MMM yyyy") : "Start"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customStart} onSelect={setCustomStart} className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground text-xs">to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-white/5 border-white/10 h-9">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {customEnd ? format(customEnd, "MMM yyyy") : "End"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customEnd} onSelect={setCustomEnd} className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </>
          )}

          <div className="ml-auto text-xs text-muted-foreground">
            Showing {months.length === 1 ? `${MONTHS[months[0].m]} ${months[0].y}` : `${MONTHS[months[0].m]} ${months[0].y} – ${MONTHS[months[months.length-1].m]} ${months[months.length-1].y}`}
          </div>
          <Button size="sm" variant="ghost" onClick={refresh} className="h-8">
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", refreshing && "animate-spin")} /> Refresh
          </Button>
        </div>
      </GlassCard>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Visits" value={fmt(totals.visits)} delta="+8.4%" accent="indigo" />
        <StatCard label="Unique Visitors" value={fmt(totals.unique)} delta="+6.1%" accent="emerald" />
        <StatCard label="Bounce Rate" value={totals.bounce} delta="-1.2%" accent="purple" />
        <StatCard label="Avg Visit Duration" value={totals.dur} delta="+12s" accent="indigo" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pages / Visit" value={totals.pages} delta="+0.18" accent="emerald" />
        <StatCard label="Global Rank" value={`#${totals.globalRank.toLocaleString()}`} delta="↑ 412" accent="purple" />
        <StatCard label="Country Rank" value={`#${totals.countryRank.toLocaleString()}`} delta="↑ 38" accent="indigo" />
        <StatCard label="Category Rank" value={`#${totals.categoryRank}`} delta="↑ 6" accent="emerald" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
        <GlassCard className="h-[340px]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4 text-indigo-300" /> Traffic Trend</div>
              <div className="text-xs text-muted-foreground">Visits vs Unique visitors</div>
            </div>
            <Pill tone="indigo">Monthly</Pill>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.65 0.22 280)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.65 0.22 280)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.72 0.18 155)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="oklch(0.72 0.18 155)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="oklch(0.7 0.02 260)" tick={{ fontSize: 11 }} />
              <YAxis stroke="oklch(0.7 0.02 260)" tick={{ fontSize: 11 }} tickFormatter={(v) => fmt(v as number)} />
              <Tooltip contentStyle={{ background: "oklch(0.18 0.02 260)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => fmt(v)} />
              <Area type="monotone" dataKey="visits" stroke="oklch(0.65 0.22 280)" fill="url(#gv)" strokeWidth={2} />
              <Area type="monotone" dataKey="unique" stroke="oklch(0.72 0.18 155)" fill="url(#gu)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="h-[340px]">
          <div className="text-sm font-medium mb-3 flex items-center gap-2"><MousePointerClick className="h-4 w-4 text-purple-300" /> Traffic Sources</div>
          <div className="space-y-2.5">
            {split.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-foreground/80"><s.icon className="h-3.5 w-3.5" /> {s.name}</span>
                  <span className="text-foreground/70">{s.value}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full" style={{ background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard>
          <div className="text-sm font-medium mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-300" /> Top Countries</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={geo} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke="oklch(1 0 0 / 0.06)" horizontal={false} />
              <XAxis type="number" stroke="oklch(0.7 0.02 260)" tick={{ fontSize: 11 }} unit="%" />
              <YAxis dataKey="country" type="category" stroke="oklch(0.7 0.02 260)" tick={{ fontSize: 11 }} width={100} />
              <Tooltip contentStyle={{ background: "oklch(0.18 0.02 260)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="share" fill="oklch(0.65 0.22 280)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium flex items-center gap-2"><Search className="h-4 w-4 text-indigo-300" /> Top Organic Keywords</div>
            <Pill tone="purple">SEO</Pill>
          </div>
          <div className="overflow-hidden rounded-lg border border-white/5">
            <table className="w-full text-xs">
              <thead className="bg-white/[0.03] text-muted-foreground">
                <tr><th className="text-left p-2 font-medium">Keyword</th><th className="text-right p-2 font-medium">Volume</th><th className="text-right p-2 font-medium">Position</th></tr>
              </thead>
              <tbody>
                {kws.map((k) => (
                  <tr key={k.kw} className="border-t border-white/5">
                    <td className="p-2">{k.kw}</td>
                    <td className="p-2 text-right">{k.volume.toLocaleString()}</td>
                    <td className="p-2 text-right"><span className={cn("inline-block min-w-7 text-center rounded px-1.5", k.pos <= 3 ? "bg-emerald-500/15 text-emerald-300" : k.pos <= 10 ? "bg-indigo-500/15 text-indigo-300" : "bg-white/5 text-foreground/70")}>{k.pos}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <div className="text-xs text-muted-foreground flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Audience Snapshot</div>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span>Desktop</span><span className="text-foreground/80">58.2%</span></div>
            <div className="flex justify-between"><span>Mobile</span><span className="text-foreground/80">39.4%</span></div>
            <div className="flex justify-between"><span>Tablet</span><span className="text-foreground/80">2.4%</span></div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs text-muted-foreground flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Engagement</div>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span>New visitors</span><span className="text-foreground/80">61%</span></div>
            <div className="flex justify-between"><span>Returning</span><span className="text-foreground/80">39%</span></div>
            <div className="flex justify-between"><span>Sessions / visitor</span><span className="text-foreground/80">2.3</span></div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs text-muted-foreground flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" /> Period summary</div>
          <p className="mt-2 text-xs text-foreground/80 leading-relaxed">
            Traffic to <span className="text-indigo-300 font-medium">{cleanDomain}</span> is trending upward in the selected window. Search and Direct dominate acquisition — consider doubling down on branded SEO and onsite conversion polish to capitalize.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
