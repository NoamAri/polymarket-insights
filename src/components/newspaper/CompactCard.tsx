import type { PolymarketEvent } from "@/types/polymarket";
import { formatVolume, getTopOutcome } from "@/lib/format";

interface CompactCardProps {
  event: PolymarketEvent;
}

const CompactCard = ({ event }: CompactCardProps) => {
  const mkt = event.markets[0];
  const odds = mkt
    ? mkt.outcomes.slice(0, 2).map((o, i) => `${o} ${((mkt.outcomePrices[i] || 0) * 100).toFixed(0)}%`).join(" · ")
    : "—";

  return (
    <div className="bg-card/30 border border-border/50 rounded-lg p-4 mb-3">
      <h4 className="font-display text-sm font-bold text-foreground/80 leading-snug mb-2 line-clamp-2">
        {event.title}
      </h4>
      <p className="font-mono text-xs text-primary">{odds}</p>
      <p className="text-[0.7rem] text-muted-foreground/40 mt-1">
        24h vol: {formatVolume(event.volume24hr || 0)}
      </p>
    </div>
  );
};

export default CompactCard;
