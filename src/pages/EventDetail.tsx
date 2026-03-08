import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { PolymarketEvent } from "@/types/polymarket";
import { isMultiOutcome, getAllOutcomes } from "@/lib/market-utils";
import { formatVolume, formatPercent, deriveWinner, timeAgo } from "@/lib/format";
import { addIcon } from "@/lib/icons";
import { useTeamLogos } from "@/hooks/useTeamLogos";
import { cn } from "@/lib/utils";
import MultiOutcomeGrid from "@/components/newspaper/MultiOutcomeGrid";
import BetCalculator from "@/components/browser/BetCalculator";
import ResolvedPanel from "@/components/browser/ResolvedPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

const EventDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state?.event as PolymarketEvent | undefined;
  const [expandedMarket, setExpandedMarket] = useState<number>(0);

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-muted-foreground mb-4">No event data found.</p>
        <Button variant="outline" onClick={() => navigate("/")}>← Back to Chronicle</Button>
      </div>
    );
  }

  const multi = isMultiOutcome(event);
  const allOutcomes = getAllOutcomes(event);
  const tagLabels = event.tags?.filter(t => t.label !== "All").slice(0, 5).map(t => t.label) || [];
  const isClosed = event.closed;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        {event.image && (
          <img src={event.image} alt={event.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-border/50" />
        )}
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-foreground leading-tight">{event.title}</h1>
          <div className="flex gap-2 flex-wrap mt-2">
            <span className={cn(
              "px-2.5 py-1 rounded-full text-xs font-semibold",
              isClosed ? "bg-muted text-muted-foreground" : "bg-success/20 text-success-foreground"
            )}>
              {isClosed ? "⚫ Resolved" : "🟢 Live"}
            </span>
            {tagLabels.map(t => (
              <span key={t} className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/12 text-primary">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Volume", value: formatVolume(event.volume), icon: "💰" },
          { label: "24h Volume", value: formatVolume(event.volume24hr || 0), icon: "📊" },
          { label: "Liquidity", value: formatVolume(event.liquidity || 0), icon: "💧" },
          { label: "Markets", value: `${event.markets.length}`, icon: "🎯" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-card/50 border border-border/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{kpi.icon} {kpi.value}</p>
            <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Multi-outcome overview */}
      {multi && allOutcomes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
            📈 Outcome Overview ({allOutcomes.length} outcomes)
          </h2>
          <MultiOutcomeGrid outcomes={allOutcomes} limit={12} />
        </div>
      )}

      {/* Polymarket link */}
      {event.slug && (
        <a
          href={`https://polymarket.com/event/${event.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:text-primary/80 transition-colors mb-6"
        >
          <ExternalLink className="w-4 h-4" /> View on Polymarket
        </a>
      )}

      {/* Individual markets */}
      <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 mt-2">
        🏪 Markets
      </h2>
      <div className="space-y-3">
        {event.markets.filter((m) => m.volume > 0).map((mkt, i) => {
          const isExpanded = expandedMarket === i;
          const winner = mkt.closed ? deriveWinner(mkt.outcomes, mkt.outcomePrices) : null;

          return (
            <div key={mkt.id || i} className="border border-border/50 rounded-xl overflow-hidden">
              {/* Market header */}
              <button
                onClick={() => setExpandedMarket(isExpanded ? -1 : i)}
                className={cn(
                  "w-full text-left px-5 py-4 flex items-center justify-between gap-3 transition-colors",
                  isExpanded ? "bg-primary/5 border-b border-border/30" : "bg-card/30 hover:bg-card/50"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{mkt.question}</p>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span>Vol: {formatVolume(mkt.volume)}</span>
                    {mkt.endDate && <span>Ends: {new Date(mkt.endDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {mkt.closed ? (
                    <span className="text-xs font-medium text-muted-foreground">
                      {winner && winner !== "Unresolved" ? `🏆 ${winner}` : "⚫ Resolved"}
                    </span>
                  ) : (
                    <div className="flex gap-1.5">
                      {mkt.outcomes.map((o, j) => (
                        <span
                          key={o}
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-semibold",
                            mkt.outcomePrices[j] >= 0.6
                              ? "bg-success/15 text-success-foreground"
                              : mkt.outcomePrices[j] <= 0.2
                              ? "bg-destructive/10 text-destructive"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {o}: {formatPercent(mkt.outcomePrices[j] || 0)}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-muted-foreground text-xs">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="p-5 bg-background/30">
                  {!mkt.closed ? (
                    <BetCalculator
                      outcomes={mkt.outcomes}
                      prices={mkt.outcomePrices}
                      volume={mkt.volume}
                    />
                  ) : (
                    <ResolvedPanel market={mkt} winner={winner} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-border mt-10 pt-4 text-center">
        <p className="text-xs text-muted-foreground/40">
          The Polymarket Chronicle • Event Detail View
        </p>
      </div>
    </div>
  );
};

export default EventDetail;
