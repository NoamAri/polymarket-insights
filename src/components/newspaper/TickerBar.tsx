import type { PolymarketEvent } from "@/types/polymarket";
import { getTopOutcome } from "@/lib/format";

interface TickerBarProps {
  events: PolymarketEvent[];
}

const TickerBar = ({ events }: TickerBarProps) => {
  const items = events.slice(0, 8).map((ev) => {
    const mkt = ev.markets[0];
    if (!mkt) return null;
    const { outcome, prob } = getTopOutcome(mkt.outcomes, mkt.outcomePrices);
    if (!outcome || !prob) return null;
    return { title: ev.title.slice(0, 40), outcome, prob };
  }).filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="bg-primary/8 border border-primary/15 rounded-lg px-4 py-3 mb-6 overflow-hidden">
      <div className="flex gap-8 animate-ticker whitespace-nowrap font-mono text-sm">
        {[...items, ...items].map((item, i) => (
          <span key={i} className={item!.prob >= 0.6 ? "text-success-foreground" : item!.prob <= 0.4 ? "text-destructive" : "text-primary"}>
            {item!.title} • {item!.outcome} {(item!.prob * 100).toFixed(0)}%
          </span>
        ))}
      </div>
    </div>
  );
};

export default TickerBar;
