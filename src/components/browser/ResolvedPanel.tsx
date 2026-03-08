import { formatVolume } from "@/lib/format";
import PriceHistoryChart from "./PriceHistoryChart";

interface ResolvedPanelProps {
  market: {
    outcomes: string[];
    outcomePrices: number[];
    volume: number;
    lastTradePrice?: number;
    startDate?: string;
    endDate?: string;
    closedTime?: string;
    clobTokenIds?: string[];
  };
  winner: string | null;
}

const ResolvedPanel = ({ market, winner }: ResolvedPanelProps) => {
  const ltp = market.lastTradePrice;
  const vol = market.volume;

  // Duration
  let duration = "—";
  if (market.startDate && (market.endDate || market.closedTime)) {
    const sd = new Date(market.startDate);
    const ed = new Date(market.endDate || market.closedTime!);
    const days = Math.floor((ed.getTime() - sd.getTime()) / 86400000);
    duration = `${days} days`;
  }

  // P&L estimates
  let winProb: number | null = null;
  if (ltp && ltp > 0.05 && ltp < 0.95 && vol > 0 && winner && winner !== "Unresolved") {
    const isFirst = winner === market.outcomes[0];
    winProb = isFirst ? ltp : 1 - ltp;
  }

  // Efficiency label
  let effLabel = "";
  if (winProb !== null) {
    const eff = winProb * 100;
    if (eff >= 70) effLabel = "🟢 High confidence — crowd got it right";
    else if (eff >= 50) effLabel = "🟡 Divided — slim majority was correct";
    else effLabel = "🔴 Upset! — crowd got it wrong";
  }

  const tokenId = market.clobTokenIds?.[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">🏆 {winner || "Unknown"}</div>
          <div className="text-xs text-muted-foreground">Winner</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">{formatVolume(vol)}</div>
          <div className="text-xs text-muted-foreground">Total Volume</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">{duration}</div>
          <div className="text-xs text-muted-foreground">Duration</div>
        </div>
      </div>

      {winProb !== null && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-success-foreground">✅ Winners ~{formatVolume((1 - winProb) * vol)}</span>
            <span className="block text-xs text-muted-foreground">{(winProb * 100).toFixed(0)}% on winning side</span>
          </div>
          <div>
            <span className="text-destructive">❌ Losers ~{formatVolume((1 - winProb) * vol)}</span>
            <span className="block text-xs text-muted-foreground">{((1 - winProb) * 100).toFixed(0)}% on losing side</span>
          </div>
        </div>
      )}

      {effLabel && (
        <p className="text-sm font-medium">{effLabel}</p>
      )}

      {tokenId && (
        <PriceHistoryChart
          tokenId={tokenId}
          outcomeLabel={market.outcomes[0]}
          winner={winner}
        />
      )}
    </div>
  );
};

export default ResolvedPanel;
