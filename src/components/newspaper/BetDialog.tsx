import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatVolume, formatPercent } from "@/lib/format";
import type { PolymarketEvent } from "@/types/polymarket";

interface BetDialogProps {
  event: PolymarketEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BetDialog = ({ event, open, onOpenChange }: BetDialogProps) => {
  const [selectedMarketIdx, setSelectedMarketIdx] = useState(0);
  const [chosenOutcome, setChosenOutcome] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState(100);

  const mkt = event.markets[selectedMarketIdx];
  if (!mkt) return null;

  const paired = mkt.outcomes.map((o, i) => ({ outcome: o, price: mkt.outcomePrices[i] || 0 }));
  paired.sort((a, b) => b.price - a.price);

  const chosen = chosenOutcome || paired[0]?.outcome || "";
  const chosenPrice = paired.find((p) => p.outcome === chosen)?.price || 0;
  const shares = chosenPrice > 0 ? betAmount / chosenPrice : 0;
  const profit = shares - betAmount;
  const roi = betAmount > 0 ? (profit / betAmount) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {event.image && (
              <img src={event.image} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
            )}
            <div>
              <DialogTitle className="font-display text-lg leading-snug">{event.title}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Volume: {formatVolume(event.volume)} • {event.markets.length} market{event.markets.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Market selector if multiple markets */}
        {event.markets.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {event.markets.map((m, i) => (
              <button
                key={m.id}
                onClick={() => { setSelectedMarketIdx(i); setChosenOutcome(null); }}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition-colors",
                  i === selectedMarketIdx
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                {m.question.length > 50 ? m.question.slice(0, 50) + "…" : m.question}
              </button>
            ))}
          </div>
        )}

        {/* All outcomes as clickable cards */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Pick your outcome
          </p>
          <div className="grid grid-cols-2 gap-2">
            {paired.map((item) => (
              <button
                key={item.outcome}
                onClick={() => setChosenOutcome(item.outcome)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border text-left transition-all",
                  chosen === item.outcome
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                    : "border-border/50 bg-background/50 hover:border-primary/30"
                )}
              >
                <span className="text-sm font-medium text-foreground truncate mr-2">{item.outcome}</span>
                <span className={cn(
                  "text-sm font-bold shrink-0",
                  item.price >= 0.6 ? "text-success-foreground" : item.price <= 0.2 ? "text-destructive" : "text-primary"
                )}>
                  {formatPercent(item.price)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bet calculator */}
        <div className="border-t border-border pt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            💰 Bet Calculator — "{chosen}"
          </p>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-xs text-muted-foreground whitespace-nowrap">Your bet ($)</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              min={1}
              max={100000}
              className="w-28 bg-background border-border"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Payout", value: `$${shares.toFixed(2)}`, icon: "📈" },
              { label: "Profit", value: `$${profit.toFixed(2)}`, icon: "💵" },
              { label: "ROI", value: `${roi.toFixed(1)}%`, icon: "📊" },
              { label: "Odds", value: chosenPrice > 0 ? `${(1 / chosenPrice).toFixed(2)}x` : "—", icon: "🎲" },
            ].map((stat) => (
              <div key={stat.label} className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-foreground">{stat.icon} {stat.value}</p>
                <p className="text-[0.65rem] text-muted-foreground uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BetDialog;
