import { useState } from "react";
import type { PolymarketEvent } from "@/types/polymarket";
import { formatVolume } from "@/lib/format";
import OddsTags from "./OddsTags";
import BetDialog from "./BetDialog";

interface CompactCardProps {
  event: PolymarketEvent;
}

const CompactCard = ({ event }: CompactCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const mkt = event.markets[0];

  return (
    <>
      <div
        className="bg-card/30 border border-border/50 rounded-lg p-4 mb-3 cursor-pointer hover:border-primary/30 transition-colors"
        onClick={() => setDialogOpen(true)}
      >
        <div className="flex items-start gap-2 mb-2">
          {event.image && (
            <img src={event.image} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />
          )}
          <h4 className="font-display text-sm font-bold text-foreground/80 leading-snug line-clamp-2">
            {event.title}
          </h4>
        </div>
        {mkt && <OddsTags outcomes={mkt.outcomes} prices={mkt.outcomePrices} limit={4} className="mb-1" />}
        <p className="text-[0.7rem] text-muted-foreground/40 mt-1">
          24h vol: {formatVolume(event.volume24hr || 0)}
          {event.markets.length > 1 && ` • ${event.markets.length} mkts`}
        </p>
      </div>
      <BetDialog event={event} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};

export default CompactCard;
