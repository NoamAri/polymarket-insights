import { useState } from "react";
import type { PolymarketEvent } from "@/types/polymarket";
import { isMultiOutcome, getAllOutcomes } from "@/lib/market-utils";
import OddsTags from "./OddsTags";
import MultiOutcomeGrid from "./MultiOutcomeGrid";
import BetDialog from "./BetDialog";

interface HotTakeProps {
  event: PolymarketEvent;
  article: string;
  onExplore?: (event: PolymarketEvent) => void;
}

const HotTake = ({ event, article, onExplore }: HotTakeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const mkt = event.markets[0];
  const multi = isMultiOutcome(event);
  const allOutcomes = getAllOutcomes(event);
  const tagStr = event.tags?.filter(t => t.label !== "All").slice(0, 3).map(t => t.label).join(" · ").toUpperCase() || "BREAKING";

  return (
    <>
      <div className="border-l-[3px] border-secondary pl-5 py-4 mb-4 bg-secondary/3 rounded-r-lg">
        <p className="text-[0.65rem] font-bold text-secondary uppercase tracking-[0.15em] mb-1">
          HOT TAKE • {tagStr}
        </p>
        <div className="flex items-start gap-3 mb-2">
          {event.image && (
            <img src={event.image} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />
          )}
          <h4 className="font-display text-lg font-bold text-foreground">{event.title}</h4>
        </div>
        <p className="font-serif text-sm italic leading-relaxed text-muted-foreground line-clamp-3">
          {article || "Analysis pending..."}
        </p>
        {multi ? (
          <MultiOutcomeGrid outcomes={allOutcomes} limit={4} className="mt-2" />
        ) : (
          mkt && <OddsTags outcomes={mkt.outcomes} prices={mkt.outcomePrices} limit={4} className="mt-2" />
        )}
        <div className="flex gap-3 mt-2">
          <button onClick={() => setDialogOpen(true)} className="text-xs text-primary font-semibold hover:text-primary/80">
            💰 Bet Calculator →
          </button>
          {onExplore && (
            <button onClick={() => onExplore(event)} className="text-xs text-primary font-semibold hover:text-primary/80">
              📊 Explore →
            </button>
          )}
          {event.slug && (
            <a href={`https://polymarket.com/event/${event.slug}`} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary/60 font-medium hover:text-primary transition-colors">
              🔗 Polymarket ↗
            </a>
          )}
        </div>
      </div>
      <BetDialog event={event} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};

export default HotTake;
