import { useMemo, useState } from "react";
import KPIRow from "./KPIRow";
import { formatVolume } from "@/lib/format";
import sampleMarketsRaw from "@/data/sample_markets.json";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ParsedMarket {
  id: string;
  question: string;
  outcomes: string[];
  outcomePrices: number[];
  volume: number;
  startDate: string;
  endDate: string;
  closedTime: string;
  lastTradePrice: number;
  resolvedWinner: string;
  durationDays: number;
  endMonth: string;
  primaryTag: string;
  impliedProb: number | null;
  crowdWasRight: boolean | null;
}

function parseMarkets(): ParsedMarket[] {
  return (sampleMarketsRaw as any[]).map((raw) => {
    let outcomes: string[] = [];
    let prices: number[] = [];
    try { outcomes = typeof raw.outcomes === "string" ? JSON.parse(raw.outcomes) : (raw.outcomes || []); } catch {}
    try { prices = (typeof raw.outcomePrices === "string" ? JSON.parse(raw.outcomePrices) : (raw.outcomePrices || [])).map(Number); } catch {}

    let winner = "Unresolved";
    for (let i = 0; i < outcomes.length; i++) {
      if (prices[i] >= 0.99) { winner = outcomes[i]; break; }
    }

    const start = new Date(raw.startDate);
    const end = new Date(raw.endDate || raw.closedTime);
    const dur = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000));
    const endMonth = end.toISOString().slice(0, 7);

    // Primary tag
    let tag = "Other";
    const cat = raw.category;
    if (cat) tag = cat;
    else if (raw.events?.[0]?.seriesSlug) tag = raw.events[0].seriesSlug;
    const q = (raw.question || "").toLowerCase();
    if (q.includes("bitcoin") || q.includes("btc")) tag = "Crypto";
    else if (q.includes("ethereum") || q.includes("eth")) tag = "Crypto";
    else if (q.includes("solana") || q.includes("sol")) tag = "Crypto";
    else if (q.includes("xrp")) tag = "Crypto";
    else if (q.includes("nfl") || q.includes("touchdown")) tag = "Sports";
    else if (q.includes("temperature") || q.includes("weather")) tag = "Weather";

    const ltp = Number(raw.lastTradePrice) || 0;
    const impliedProb = ltp > 0 && ltp < 1 ? ltp : null;

    let crowdWasRight: boolean | null = null;
    if (impliedProb && winner !== "Unresolved" && outcomes.length >= 2) {
      const winProb = winner === outcomes[0] ? impliedProb : 1 - impliedProb;
      crowdWasRight = winProb >= 0.5;
    }

    return {
      id: raw.id,
      question: raw.question,
      outcomes,
      outcomePrices: prices,
      volume: Number(raw.volumeNum || raw.volume || 0),
      startDate: raw.startDate,
      endDate: raw.endDate,
      closedTime: raw.closedTime,
      lastTradePrice: ltp,
      resolvedWinner: winner,
      durationDays: dur,
      endMonth,
      primaryTag: tag,
      impliedProb,
      crowdWasRight,
    };
  });
}

const chartTooltipStyle = {
  contentStyle: {
    background: "hsl(222, 47%, 8%)",
    border: "1px solid hsl(220, 20%, 15%)",
    borderRadius: "8px",
    fontSize: "12px",
    color: "hsl(213, 31%, 91%)",
  },
};

const AnalyticsView = () => {
  const allMarkets = useMemo(() => parseMarkets(), []);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("vol-desc");

  const filtered = useMemo(() => {
    let arr = allMarkets;
    if (search) arr = arr.filter((m) => m.question.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === "vol-desc") arr = [...arr].sort((a, b) => b.volume - a.volume);
    else if (sortBy === "vol-asc") arr = [...arr].sort((a, b) => a.volume - b.volume);
    else if (sortBy === "newest") arr = [...arr].sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
    return arr;
  }, [allMarkets, search, sortBy]);

  const totalVol = filtered.reduce((s, m) => s + m.volume, 0);
  const avgDur = filtered.length > 0 ? filtered.reduce((s, m) => s + m.durationDays, 0) / filtered.length : 0;
  const resolved = filtered.filter((m) => m.crowdWasRight !== null);
  const crowdAcc = resolved.length > 0 ? (resolved.filter((m) => m.crowdWasRight).length / resolved.length) * 100 : null;
  const largest = filtered.length > 0 ? filtered.reduce((a, b) => (a.volume > b.volume ? a : b)) : null;

  // Chart data
  const top15 = [...filtered].sort((a, b) => b.volume - a.volume).slice(0, 15).map((m) => ({
    name: m.question.slice(0, 45) + "…",
    volume: m.volume,
    winner: m.resolvedWinner,
  }));

  const catVol = Object.entries(
    filtered.reduce((acc, m) => {
      acc[m.primaryTag] = (acc[m.primaryTag] || 0) + m.volume;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([cat, vol]) => ({ cat, vol }));

  const monthlyData = Object.entries(
    filtered.reduce((acc, m) => {
      acc[m.endMonth] = (acc[m.endMonth] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({ month, count }));

  return (
    <div>
      <KPIRow
        kpis={[
          { value: `${filtered.length.toLocaleString()}`, label: "Markets" },
          { value: formatVolume(totalVol), label: "Total Volume" },
          { value: `${avgDur.toFixed(0)}d`, label: "Avg Duration", sub: "per market" },
          { value: crowdAcc ? `${crowdAcc.toFixed(1)}%` : "N/A", label: "Crowd Accuracy", sub: "majority right" },
          { value: largest ? formatVolume(largest.volume) : "N/A", label: "Largest Market", sub: largest ? largest.question.slice(0, 35) + "…" : "" },
        ]}
      />

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="🔍 Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs bg-background border-border"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44 bg-background border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vol-desc">Volume ↓</SelectItem>
            <SelectItem value="vol-asc">Volume ↑</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">📈 Overview</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top 15 */}
        <div>
          <h4 className="text-sm font-bold text-muted-foreground mb-2">Top 15 Markets by Volume</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top15} layout="vertical" margin={{ left: 120 }}>
                <XAxis type="number" tick={{ fill: "hsl(215,20%,55%)", fontSize: 10 }} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "hsl(215,20%,55%)", fontSize: 9 }} width={120} axisLine={false} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatVolume(v)} />
                <Bar dataKey="volume" radius={[0, 4, 4, 0]}>
                  {top15.map((entry, i) => (
                    <Cell key={i} fill={entry.winner === "Yes" ? "hsl(142,60%,75%)" : entry.winner === "No" ? "hsl(0,70%,70%)" : "hsl(217,91%,70%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume by Category */}
        <div>
          <h4 className="text-sm font-bold text-muted-foreground mb-2">Volume by Category</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catVol} layout="vertical" margin={{ left: 100 }}>
                <XAxis type="number" tick={{ fill: "hsl(215,20%,55%)", fontSize: 10 }} axisLine={false} />
                <YAxis type="category" dataKey="cat" tick={{ fill: "hsl(215,20%,55%)", fontSize: 10 }} width={100} axisLine={false} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatVolume(v)} />
                <Bar dataKey="vol" fill="hsl(263, 70%, 50%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly timeline */}
      {monthlyData.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-bold text-muted-foreground mb-2">Markets Closed per Month</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: "hsl(215,20%,55%)", fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: "hsl(215,20%,55%)", fontSize: 10 }} axisLine={false} />
                <Tooltip {...chartTooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="hsl(217, 91%, 60%)" strokeWidth={2} fill="url(#monthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Market cards */}
      <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">📋 Markets</h3>
      <p className="text-xs text-muted-foreground mb-4">Showing {Math.min(filtered.length, 20)} of {filtered.length} markets</p>
      <div className="space-y-3">
        {filtered.slice(0, 20).map((m) => (
          <div key={m.id} className="bg-[image:var(--gradient-card)] border border-border rounded-2xl p-4 hover:border-primary/20 transition-colors">
            <p className="text-sm font-semibold text-foreground mb-2">{m.question}</p>
            <div className="flex gap-2 flex-wrap mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.resolvedWinner === "Yes" ? "bg-success/15 text-success-foreground" : m.resolvedWinner === "No" ? "bg-destructive/15 text-destructive" : "bg-primary/12 text-primary"}`}>
                {m.resolvedWinner !== "Unresolved" ? `🏆 ${m.resolvedWinner}` : "❓ Unresolved"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-secondary/12 text-secondary">💰 {formatVolume(m.volume)}</span>
              {m.durationDays > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-warning/12 text-warning-foreground">⏱️ {m.durationDays}d</span>
              )}
            </div>
            {m.crowdWasRight !== null && (
              <div className="flex gap-4 text-xs mt-1">
                <span className="text-success-foreground">✅ {m.crowdWasRight ? "Crowd correct" : ""}</span>
                {!m.crowdWasRight && <span className="text-destructive">🔴 Upset</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsView;
