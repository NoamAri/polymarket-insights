import { cn } from "@/lib/utils";

interface OddsTagsProps {
  outcomes: string[];
  prices: number[];
  limit?: number;
  className?: string;
}

const OddsTags = ({ outcomes, prices, limit = 4, className }: OddsTagsProps) => {
  return (
    <div className={cn("flex gap-2 flex-wrap", className)}>
      {outcomes.slice(0, limit).map((o, i) => {
        const p = prices[i] || 0;
        return (
          <span
            key={o}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-semibold",
              p >= 0.5
                ? "bg-success/12 text-success-foreground"
                : "bg-destructive/12 text-destructive"
            )}
          >
            {o}: {(p * 100).toFixed(0)}%
          </span>
        );
      })}
    </div>
  );
};

export default OddsTags;
