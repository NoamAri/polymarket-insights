import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BetCalculatorProps {
  outcomes: string[];
  prices: number[];
  volume: number;
}

const BetCalculator = ({ outcomes, prices, volume }: BetCalculatorProps) => {
  const [chosen, setChosen] = useState(outcomes[0] || "Yes");
  const [betAmount, setBetAmount] = useState(100);

  const chosenIdx = outcomes.indexOf(chosen);
  const chosenPrice = chosenIdx >= 0 ? prices[chosenIdx] : 0.5;

  const shares = chosenPrice > 0 ? betAmount / chosenPrice : 0;
  const payout = shares;
  const profit = payout - betAmount;
  const roi = betAmount > 0 ? (profit / betAmount) * 100 : 0;

  return (
    <div>
      <h4 className="text-sm font-bold text-foreground mb-3">💰 Bet Payout Calculator</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Pick outcome</label>
          <Select value={chosen} onValueChange={setChosen}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {outcomes.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Your bet ($)</label>
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
            min={1}
            max={100000}
            className="bg-background border-border"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">If "{chosen}" wins:</p>
          <p className="text-sm">📈 <strong>Payout:</strong> ${payout.toFixed(2)}</p>
          <p className="text-sm">💵 <strong>Profit:</strong> ${profit.toFixed(2)}</p>
          <p className="text-sm">📊 <strong>ROI:</strong> {roi.toFixed(1)}%</p>
          <p className="text-sm">🎯 <strong>Implied:</strong> {(chosenPrice * 100).toFixed(1)}%</p>
          <p className="text-sm">🎲 <strong>Odds:</strong> {chosenPrice > 0 ? (1 / chosenPrice).toFixed(2) : "—"}x</p>
        </div>
      </div>
    </div>
  );
};

export default BetCalculator;
