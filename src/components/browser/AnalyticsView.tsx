import { useMemo, useState } from "react";
import KPIRow from "./KPIRow";
import EventCard from "./EventCard";
import { formatVolume } from "@/lib/format";
import { useBulkEvents } from "@/hooks/usePolymarket";
import type { PolymarketEvent } from "@/types/polymarket";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const { data: events, isLoading } = useBulkEvents(5);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("vol-desc");

  const filtered = useMemo(() => {
    let arr = events || [];
    if (search) arr = arr.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === "vol-desc") arr = [...arr].sort((a, b) => b.volume - a.volume);
    else if (sortBy === "vol-asc") arr = [...arr].sort((a, b) => a.volume - b.volume);
    else if (sortBy === "newest") arr = [...arr].sort((a, b) => new Date(b.startDate || "").getTime() - new Date(a.startDate || "").getTime());
    return arr;
  }, [events, search, sortBy]);

  const totalVol = filtered.reduce((s, e) => s + e.volume, 0);
  const totalMarkets = filtered.reduce((s, e) => s + e.markets.length, 0);
  const nActive = filtered.filter((e) => !e.closed).length;
  const nResolved = filtered.filter((e) => e.closed).length;
  const largest = filtered.length > 0 ? filtered.reduce((a, b) => (a.volume > b.volume ? a : b)) : null;

  // Tag extraction for category volume
  const tagVolume = useMemo(() => {
    const map = new Map<string, number>();
    for (const ev of filtered) {
      const tag = ev.tags?.[0]?.label || "Other";
      map.set(tag, (map.get(tag) || 0) + ev.volume);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([cat, vol]) => ({ cat, vol }));
  }, [filtered]);

  const top15 = useMemo(() =>
    [...filtered].sort((a, b) => b.volume - a.volume).slice(0, 15).map((e) => ({
      name: e.title.slice(0, 45) + (e.title.length > 45 ? "…" : ""),
      volume: e.volume,
      active: !e.closed,
    })),
  [filtered]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-[350px] rounded-2xl" />
        <Skeleton className="h-[350px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <KPIRow
        kpis={[
          { value: `${filtered.length.toLocaleString()}`, label: "Events" },
          { value: `${totalMarkets.toLocaleString()}`, label: "Markets" },
          { value: formatVolume(totalVol), label: "Total Volume" },
          { value: `${nActive}`, label: "🟢 Active" },
          { value: `${nResolved}`, label: "⚫ Resolved", sub: largest ? largest.title.slice(0, 35) + "…" : "" },
        ]}
      />

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="🔍 Search events..."
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
        <div>
          <h4 className="text-sm font-bold text-muted-foreground mb-2">Top 15 Events by Volume</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top15} layout="vertical" margin={{ left: 120 }}>
                <XAxis type="number" tick={{ fill: "hsl(215,20%,55%)", fontSize: 10 }} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "hsl(215,20%,55%)", fontSize: 9 }} width={120} axisLine={false} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatVolume(v)} />
                <Bar dataKey="volume" radius={[0, 4, 4, 0]}>
                  {top15.map((entry, i) => (
                    <Cell key={i} fill={entry.active ? "hsl(217,91%,70%)" : "hsl(215,20%,55%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-muted-foreground mb-2">Volume by Category</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagVolume} layout="vertical" margin={{ left: 100 }}>
                <XAxis type="number" tick={{ fill: "hsl(215,20%,55%)", fontSize: 10 }} axisLine={false} />
                <YAxis type="category" dataKey="cat" tick={{ fill: "hsl(215,20%,55%)", fontSize: 10 }} width={100} axisLine={false} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => formatVolume(v)} />
                <Bar dataKey="vol" fill="hsl(263, 70%, 50%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">📋 Top Events</h3>
      <p className="text-xs text-muted-foreground mb-4">Showing {Math.min(filtered.length, 20)} of {filtered.length} events</p>
      <div className="space-y-3">
        {filtered.slice(0, 20).map((ev) => (
          <div key={ev.id} className="bg-[image:var(--gradient-card)] border border-border rounded-2xl p-4 hover:border-primary/20 transition-colors">
            <div className="flex items-start gap-3">
              {ev.image && <img src={ev.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground mb-1">{ev.title}</p>
                <div className="flex gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ev.closed ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"}`}>
                    {ev.closed ? "Resolved" : "🟢 Active"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-secondary/12 text-secondary">💰 {formatVolume(ev.volume)}</span>
                  {ev.markets.length > 1 && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-accent/12 text-accent-foreground">{ev.markets.length} markets</span>
                  )}
                  {ev.tags?.slice(0, 2).map((t) => (
                    <span key={t.slug} className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{t.label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsView;
