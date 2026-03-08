import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTopCategories, useEventsByCategory } from "@/hooks/usePolymarket";
import type { PolymarketEvent } from "@/types/polymarket";
import { isMultiOutcome, getAllOutcomes } from "@/lib/market-utils";
import MultiOutcomeGrid from "@/components/newspaper/MultiOutcomeGrid";
import BetDialog from "@/components/newspaper/BetDialog";
import { formatVolume } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import CategoryBar from "@/components/browser/CategoryBar";
import KPIRow from "@/components/browser/KPIRow";
import EventCard from "@/components/browser/EventCard";
import AnalyticsView from "@/components/browser/AnalyticsView";

const EVENTS_PER_PAGE = 15;

const Browse = () => {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOpt, setSortOpt] = useState("vol-desc");
  const [showCount, setShowCount] = useState(EVENTS_PER_PAGE);

  const { data: categories, isLoading: catsLoading } = useTopCategories();
  const { data: events, isLoading: eventsLoading } = useEventsByCategory(selectedSlug);

  const handleCategoryChange = (slug: string | null) => {
    setSelectedSlug(slug);
    setShowCount(EVENTS_PER_PAGE);
    setSearch("");
    setStatusFilter("all");
  };

  // Filter and sort events
  let filtered = events || [];
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(s) ||
        e.markets.some((m) => m.question.toLowerCase().includes(s))
    );
  }
  if (statusFilter === "active") filtered = filtered.filter((e) => !e.closed);
  else if (statusFilter === "resolved") filtered = filtered.filter((e) => e.closed);

  if (sortOpt === "vol-desc") filtered = [...filtered].sort((a, b) => b.volume - a.volume);
  else if (sortOpt === "vol-asc") filtered = [...filtered].sort((a, b) => a.volume - b.volume);
  else if (sortOpt === "newest") filtered = [...filtered].sort((a, b) => new Date(b.startDate || "").getTime() - new Date(a.startDate || "").getTime());

  const totalVol = filtered.reduce((s, e) => s + e.volume, 0);
  const totalMarkets = filtered.reduce((s, e) => s + e.markets.length, 0);
  const nActive = filtered.filter((e) => !e.closed).length;
  const nResolved = filtered.filter((e) => e.closed).length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-1">🔮 Polymarket Research</h1>
      <p className="text-sm text-muted-foreground italic mb-6">
        Browse prediction markets by category — past outcomes and live bets.
      </p>

      <CategoryBar
        categories={categories || []}
        selected={selectedSlug}
        onSelect={handleCategoryChange}
        loading={catsLoading}
      />

      {selectedSlug === null ? (
        <AnalyticsView />
      ) : (
        <>
          {eventsLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              <KPIRow
                kpis={[
                  { value: `${filtered.length}`, label: "Events" },
                  { value: `${totalMarkets}`, label: "Markets" },
                  { value: formatVolume(totalVol), label: "Total Volume" },
                  { value: `${nActive}`, label: "🟢 Active" },
                  { value: `${nResolved}`, label: "⚫ Resolved" },
                ]}
              />

              <div className="flex gap-4 mb-6 flex-wrap">
                <Input
                  placeholder="🔍 Search events..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setShowCount(EVENTS_PER_PAGE); }}
                  className="max-w-xs bg-background border-border"
                />
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setShowCount(EVENTS_PER_PAGE); }}>
                  <SelectTrigger className="w-36 bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOpt} onValueChange={setSortOpt}>
                  <SelectTrigger className="w-36 bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vol-desc">Volume ↓</SelectItem>
                    <SelectItem value="vol-asc">Volume ↑</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Showing 1–{Math.min(showCount, filtered.length)} of {filtered.length}
              </p>

              <div className="space-y-4">
                {filtered.slice(0, showCount).map((ev) => (
                  <EventCard key={ev.id} event={ev} />
                ))}
              </div>

              {showCount < filtered.length && (
                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowCount((c) => c + EVENTS_PER_PAGE)}
                  >
                    ⬇️ Load More Events
                  </Button>
                </div>
              )}
            </>
          )}

          <div className="border-t border-border mt-8 pt-4 text-center">
            <p className="text-xs text-muted-foreground/40">
              Polymarket Research • Live data from Gamma Events API
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Browse;
