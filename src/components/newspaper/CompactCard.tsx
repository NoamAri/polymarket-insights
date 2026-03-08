import type { PolymarketEvent } from "@/types/polymarket";
import { formatVolume, getTopOutcome } from "@/lib/format";

interface CompactCardProps {
  event: PolymarketEvent;
}

const CompactCard = ({ event }: CompactCardProps) => {
  const mkt = event.markets[0];

  // Show top 3 outcomes for multi-outcome markets
  const oddsDisplay = mkt
    ? (() => {
        const paired = mkt.outcomes.map((o, i) => ({ o, p: mkt.outcomePrices[i] || 0 }));
        paired.sort((a, b) => b.p - a.p);
        const shown = paired.slice(0, 3);
        return shown.map(({ o, p }) => `${o} ${(p * 100).toFixed(0)}%`).join(" · ");
      })()
    : "—";

  return (
    <div className="bg-card/30 border border-border/50 rounded-lg p-4 mb-3">
      <div className="flex items-start gap-2 mb-2">
        {event.image && (
          <img src={event.image} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />
        )}
        <h4 className="font-display text-sm font-bold text-foreground/80 leading-snug line-clamp-2">
          {event.title}
        </h4>
      </div>
      <p className="font-mono text-xs text-primary">{oddsDisplay}</p>
      <p className="text-[0.7rem] text-muted-foreground/40 mt-1">
        24h vol: {formatVolume(event.volume24hr || 0)}
        {event.markets.length > 1 && ` • ${event.markets.length} mkts`}
      </p>
    </div>
  );
};

export default CompactCard;
