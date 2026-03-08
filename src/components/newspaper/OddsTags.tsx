import { cn } from "@/lib/utils";
import { addIcon } from "@/lib/icons";

interface OddsTagsProps {
  outcomes: string[];
  prices: number[];
  limit?: number;
  className?: string;
}

const COLORS = [
  "bg-primary/15 text-primary",
  "bg-secondary/15 text-secondary",
  "bg-accent/15 text-accent-foreground",
  "bg-warning/15 text-warning-foreground",
  "bg-success/15 text-success-foreground",
  "bg-destructive/15 text-destructive",
];

const OddsTags = ({ outcomes, prices, limit = 6, className }: OddsTagsProps) => {
  const paired = outcomes.map((o, i) => ({ outcome: o, price: prices[i] || 0 }));
  paired.sort((a, b) => b.price - a.price);

  const isMulti = outcomes.length > 2 || !outcomes.every(o => ["yes", "no"].includes(o.toLowerCase()));

  return (
    <div className={cn("flex gap-2 flex-wrap", className)}>
      {paired.slice(0, limit).map((item, i) => (
        <span
          key={item.outcome}
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-semibold",
            i === 0 && item.price > 0.2 && isMulti
              ? "bg-success/15 text-success-foreground border border-success/25"
              : item.price >= 0.5
              ? "bg-success/12 text-success-foreground"
              : i < COLORS.length
              ? COLORS[i]
              : "bg-muted text-muted-foreground"
          )}
        >
          {isMulti ? addIcon(item.outcome) : item.outcome}: {(item.price * 100).toFixed(0)}%
        </span>
      ))}
      {paired.length > limit && (
        <span className="px-2 py-1 rounded-full text-xs text-muted-foreground bg-muted/50">
          +{paired.length - limit} more
        </span>
      )}
    </div>
  );
};

export default OddsTags;
