import { useState } from "react";
import type { PolymarketEvent } from "@/types/polymarket";
import { readingTime } from "@/lib/format";
import { isMultiOutcome, getAllOutcomes } from "@/lib/market-utils";
import OddsTags from "./OddsTags";
import MultiOutcomeGrid from "./MultiOutcomeGrid";
import BetDialog from "./BetDialog";

interface ArticleCardProps {
  event: PolymarketEvent;
  article: string;
  onExplore?: (event: PolymarketEvent) => void;
}

const ArticleCard = ({ event, article, onExplore }: ArticleCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const mkt = event.markets[0];
  const multi = isMultiOutcome(event);
  const allOutcomes = getAllOutcomes(event);
  const tagStr = event.tags?.filter(t => t.label !== "All").slice(0, 3).map(t => t.label).join(" · ").toUpperCase() || "BREAKING";
  const rt = readingTime(article || "");

  return (
    <>
      <div className="bg-card/50 border border-border rounded-xl p-5 mb-4 hover:border-primary/20 transition-colors">
        <p className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-primary mb-1">{tagStr}</p>
        <div className="flex items-start gap-3 mb-1">
          {event.image && (
            <img src={event.image} alt={event.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-border/30" />
          )}
          <div>
            <h3 className="font-display text-xl font-bold text-foreground leading-snug">{event.title}</h3>
            <p className="text-xs text-muted-foreground/50 italic">
              Chronicle Staff • {rt} min read
              {event.markets.length > 1 && ` • ${event.markets.length} markets`}
            </p>
          </div>
        </div>
        <p className="font-serif text-sm leading-relaxed text-muted-foreground line-clamp-4 mt-2">
          {article || "Loading article..."}
        </p>
        {multi ? (
          <MultiOutcomeGrid outcomes={allOutcomes} limit={4} className="mt-3" />
        ) : (
          mkt && <OddsTags outcomes={mkt.outcomes} prices={mkt.outcomePrices} limit={6} className="mt-3" />
        )}
        <div className="flex gap-3 mt-3">
          <button
            onClick={() => setDialogOpen(true)}
            className="text-xs text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            💰 Bet Calculator →
          </button>
          {onExplore && (
            <button
              onClick={() => onExplore(event)}
              className="text-xs text-primary font-semibold hover:text-primary/80 transition-colors"
            >
              📊 Explore →
            </button>
          )}
          {event.slug && (
            <a href={`https://polymarket.com/event/${event.slug}`} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary/60 font-medium hover:text-primary transition-colors">
              🔗 Polymarket ↗
            </a>
          )}
        </div>
      </div>
      <BetDialog event={event} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};

export default ArticleCard;
