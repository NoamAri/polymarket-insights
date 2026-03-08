import type { PolymarketEvent } from "@/types/polymarket";
import { readingTime } from "@/lib/format";
import OddsTags from "./OddsTags";

interface ArticleCardProps {
  event: PolymarketEvent;
  article: string;
}

const ArticleCard = ({ event, article }: ArticleCardProps) => {
  const mkt = event.markets[0];
  const tagStr = event.tags?.filter(t => t.label !== "All").slice(0, 3).map(t => t.label).join(" · ").toUpperCase() || "BREAKING";
  const rt = readingTime(article || "");

  return (
    <div className="bg-card/50 border border-border rounded-xl p-5 mb-4 hover:border-primary/20 transition-colors">
      <p className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-primary mb-1">{tagStr}</p>
      <div className="flex items-start gap-3 mb-1">
        {event.image && (
          <img
            src={event.image}
            alt={event.title}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-border/30"
          />
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
      {mkt && <OddsTags outcomes={mkt.outcomes} prices={mkt.outcomePrices} limit={6} className="mt-3" />}
    </div>
  );
};

export default ArticleCard;
