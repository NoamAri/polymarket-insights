import { useState } from "react";
import type { PolymarketEvent } from "@/types/polymarket";
import { formatVolume, formatPercent, readingTime } from "@/lib/format";
import { isMultiOutcome, getAllOutcomes } from "@/lib/market-utils";
import { addIcon } from "@/lib/icons";
import OddsTags from "./OddsTags";
import MultiOutcomeGrid from "./MultiOutcomeGrid";
import BetDialog from "./BetDialog";

interface LeadStoryProps {
  event: PolymarketEvent;
  article: string;
  onExplore?: (event: PolymarketEvent) => void;
}

const LeadStory = ({ event, article, onExplore }: LeadStoryProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const mkt = event.markets[0];
  const multi = isMultiOutcome(event);
  const allOutcomes = getAllOutcomes(event);
  const topOutcome = allOutcomes[0];

  const tagStr = event.tags?.filter(t => t.label !== "All").slice(0, 3).map(t => t.label).join(" · ").toUpperCase() || "BREAKING";
  const now = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const rt = readingTime(article || "");
  const marketTypeLabel = multi
    ? event.markets.length > 1
      ? `${event.markets.length} outcomes`
      : `${mkt?.outcomes.length || 0} outcomes`
    : "";

  return (
    <>
      <div className="py-6 mb-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-primary">{tagStr}</p>
          {marketTypeLabel && (
            <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-primary/12 text-primary">
              🎯 {marketTypeLabel}
            </span>
          )}
        </div>

        <div className="flex items-start gap-4 mb-2">
          {event.image && (
            <img src={event.image} alt={event.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-border/50" />
          )}
          <div>
            <h2 className="font-display text-4xl font-bold text-foreground leading-tight">{event.title}</h2>
            <p className="text-xs text-muted-foreground italic mt-1">
              By Chronicle Markets Desk • {now} • {rt} min read
              {event.markets.length > 1 && ` • ${event.markets.length} markets`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6 items-start mt-4">
          <div className="font-serif text-base leading-relaxed text-muted-foreground">
            {article || "Loading article..."}
          </div>

          <div className="text-center p-6 border-l-[3px] border-primary bg-primary/5 rounded-r-lg">
            <span className="block font-display text-4xl font-black text-primary">
              {topOutcome ? formatPercent(topOutcome.prob) : "—"}
            </span>
            <span className="block text-sm text-muted-foreground mt-1 uppercase tracking-wider">
              {topOutcome ? addIcon(topOutcome.name) : "Leading odds"}
            </span>
            {multi && (
              <span className="block text-[0.65rem] text-muted-foreground/50 mt-2">
                {allOutcomes.length} possible outcomes
              </span>
            )}
          </div>
        </div>

        {multi ? (
          <MultiOutcomeGrid outcomes={allOutcomes} limit={6} className="mt-4" />
        ) : (
          mkt && <OddsTags outcomes={mkt.outcomes} prices={mkt.outcomePrices} limit={8} className="mt-4" />
        )}

        <p className="text-xs text-muted-foreground/50 mt-4">
          Volume: {formatVolume(event.volume)} • 24h: {formatVolume(event.volume24hr || 0)} • Liquidity: {formatVolume(event.liquidity || 0)}
        </p>

        <div className="flex gap-3 mt-3">
          <button
            onClick={() => setDialogOpen(true)}
            className="text-xs text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            💰 Bet Calculator →
          </button>
          {onExplore && (
            <button
              onClick={() => onExplore(event)}
              className="text-xs text-primary font-semibold hover:text-primary/80 transition-colors"
            >
              📊 Explore odds →
            </button>
          )}
          {event.slug && (
            <a
              href={`https://polymarket.com/event/${event.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary/60 font-medium hover:text-primary transition-colors"
            >
              🔗 Polymarket ↗
            </a>
          )}
        </div>
      </div>
      <BetDialog event={event} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};

export default LeadStory;
