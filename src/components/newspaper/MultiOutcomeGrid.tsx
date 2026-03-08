import { cn } from "@/lib/utils";
import { addIcon } from "@/lib/icons";
import type { OutcomeEntry } from "@/lib/market-utils";

interface MultiOutcomeGridProps {
  outcomes: OutcomeEntry[];
  limit?: number;
  className?: string;
}

/**
 * Visual grid of outcome cards for multi-outcome markets (sports, elections).
 * Ported from Python's _multi_outcomes_html
 */
const MultiOutcomeGrid = ({ outcomes, limit = 8, className }: MultiOutcomeGridProps) => {
  if (!outcomes.length) return null;

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2", className)}>
      {outcomes.slice(0, limit).map((item, i) => (
        <div
          key={item.name}
          className={cn(
            "rounded-lg p-3 text-center border transition-all hover:scale-[1.02]",
            i === 0 && item.prob > 0.1
              ? "border-success/35 bg-success/5 shadow-sm shadow-success/10"
              : "border-border/50 bg-card/30"
          )}
        >
          {item.image && (
            <img src={item.image} alt="" className="w-6 h-6 rounded-sm object-cover mx-auto mb-1" />
          )}
          <div className="text-xs text-muted-foreground font-medium truncate">
            {addIcon(item.name)}
          </div>
          <div className={cn(
            "text-lg font-bold mt-0.5",
            i === 0 && item.prob > 0.1
              ? "text-success-foreground"
              : "text-primary"
          )}>
            {(item.prob * 100).toFixed(0)}%
          </div>
        </div>
      ))}
      {outcomes.length > limit && (
        <div className="rounded-lg p-3 text-center border border-border/30 bg-card/20 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">+{outcomes.length - limit} more</span>
        </div>
      )}
    </div>
  );
};

export default MultiOutcomeGrid;
