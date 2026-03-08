import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { PolymarketEvent } from "@/types/polymarket";
import { formatVolume } from "@/lib/format";
import { cn } from "@/lib/utils";
import MarketRow from "./MarketRow";

interface EventCardProps {
  event: PolymarketEvent;
}

const EventCard = ({ event }: EventCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const isClosed = event.closed;
  const markets = event.markets;

  const tagLabels = event.tags?.filter((t) => t.label !== "All").slice(0, 5).map((t) => t.label) || [];

  return (
    <div className="bg-[image:var(--gradient-card)] border border-border rounded-2xl p-5 mb-4 hover:border-primary/20 transition-colors">
      <div
        className="cursor-pointer flex items-start justify-between gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-2">{event.title}</h3>
          <div className="flex gap-2 flex-wrap mb-2">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              isClosed ? "bg-muted text-muted-foreground" : "bg-success/20 text-success-foreground animate-pulse-live"
            )}>
              {isClosed ? "⚫ Resolved" : "🟢 Live"}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/12 text-secondary">
              💰 {formatVolume(event.volume)}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/12 text-primary">
              {markets.length} market{markets.length !== 1 ? "s" : ""}
            </span>
          </div>
          {tagLabels.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {tagLabels.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-primary/12 text-primary/80">{t}</span>
              ))}
            </div>
          )}
        </div>
        <div className="mt-1 text-muted-foreground">
          {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-2">
          {markets.slice(0, 15).map((mkt, i) => (
            <MarketRow key={mkt.id || i} market={mkt} eventIndex={0} marketIndex={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventCard;
