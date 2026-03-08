import { useState } from "react";
import type { PolymarketEvent } from "@/types/polymarket";
import { formatVolume } from "@/lib/format";
import { isMultiOutcome, getAllOutcomes } from "@/lib/market-utils";
import { addIcon } from "@/lib/icons";
import OddsTags from "./OddsTags";
import BetDialog from "./BetDialog";

interface CompactCardProps {
  event: PolymarketEvent;
  onExplore?: (event: PolymarketEvent) => void;
}

const CompactCard = ({ event, onExplore }: CompactCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const mkt = event.markets[0];
  const multi = isMultiOutcome(event);
  const allOutcomes = getAllOutcomes(event);

  return (
    <>
      <div className="bg-card/30 border border-border/50 rounded-lg p-4 mb-3 hover:border-primary/30 transition-colors">
        <div className="flex items-start gap-2 mb-2">
          {event.image && (
            <img src={event.image} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />
          )}
          <h4 className="font-display text-sm font-bold text-foreground/80 leading-snug line-clamp-2">
            {event.title}
          </h4>
        </div>
        {multi ? (
          <div className="space-y-0.5 mb-1">
            {allOutcomes.slice(0, 3).map((o, i) => (
              <div key={o.name} className="flex items-center justify-between text-xs">
                <span className={i === 0 ? "text-success-foreground font-semibold" : "text-muted-foreground"}>
                  {addIcon(o.name.length > 25 ? o.name.slice(0, 25) + "…" : o.name)}
                </span>
                <span className={i === 0 ? "text-success-foreground font-bold" : "text-primary font-medium"}>
                  {(o.prob * 100).toFixed(0)}%
                </span>
              </div>
            ))}
            {allOutcomes.length > 3 && (
              <span className="text-[0.65rem] text-muted-foreground/40">+{allOutcomes.length - 3} more</span>
            )}
          </div>
        ) : (
          mkt && <OddsTags outcomes={mkt.outcomes} prices={mkt.outcomePrices} limit={3} className="mb-1" />
        )}
        <p className="text-[0.7rem] text-muted-foreground/40 mt-1">
          24h vol: {formatVolume(event.volume24hr || 0)}
          {event.markets.length > 1 && ` • ${event.markets.length} mkts`}
        </p>
        <div className="flex gap-2 mt-2">
          <button onClick={() => setDialogOpen(true)} className="text-[0.65rem] text-primary font-semibold hover:text-primary/80">
            💰 Calculator
          </button>
          {onExplore && (
            <button onClick={() => onExplore(event)} className="text-[0.65rem] text-primary font-semibold hover:text-primary/80">
              Details →
            </button>
          )}
        </div>
      </div>
      <BetDialog event={event} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};

export default CompactCard;
