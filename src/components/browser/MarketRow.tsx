import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatVolume, deriveWinner } from "@/lib/format";
import BetCalculator from "./BetCalculator";
import ResolvedPanel from "./ResolvedPanel";

interface MarketRowProps {
  market: {
    id: string;
    question: string;
    outcomes: string[];
    outcomePrices: number[];
    volume: number;
    closed: boolean;
    lastTradePrice?: number;
    startDate?: string;
    endDate?: string;
    closedTime?: string;
    clobTokenIds?: string[];
  };
  eventIndex: number;
  marketIndex: number;
}

const MarketRow = ({ market, eventIndex, marketIndex }: MarketRowProps) => {
  const [expanded, setExpanded] = useState(false);

  const winner = market.closed ? deriveWinner(market.outcomes, market.outcomePrices) : null;
  const priceStr = market.closed
    ? winner && winner !== "Unresolved"
      ? `🏆 ${winner}`
      : "⚫ Resolved"
    : market.outcomes
        .map((o, i) => `${o}: ${((market.outcomePrices[i] || 0) * 100).toFixed(0)}%`)
        .join(" · ");

  return (
    <div>
      <div
        className={cn(
          "bg-background/30 border border-border/40 rounded-xl px-4 py-3 cursor-pointer",
          "flex items-center justify-between flex-wrap gap-2",
          "hover:border-primary/20 transition-colors"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-sm font-medium text-foreground/80 flex-1 min-w-[200px]">
          {market.question}
        </span>
        <div className="flex gap-2 items-center text-xs">
          <span className="text-muted-foreground">💰 {formatVolume(market.volume)}</span>
          <span className={cn(
            "font-medium",
            market.closed ? "text-muted-foreground" : "text-success-foreground"
          )}>
            {market.closed ? "⚫" : "🟢"} {priceStr.slice(0, 60)}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="ml-4 mt-2 mb-2 p-4 bg-muted/30 rounded-xl border border-border/30">
          {!market.closed ? (
            <BetCalculator
              outcomes={market.outcomes}
              prices={market.outcomePrices}
              volume={market.volume}
            />
          ) : (
            <ResolvedPanel
              market={market}
              winner={winner}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MarketRow;
