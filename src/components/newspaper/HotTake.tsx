import type { PolymarketEvent } from "@/types/polymarket";
import OddsTags from "./OddsTags";

interface HotTakeProps {
  event: PolymarketEvent;
  article: string;
}

const HotTake = ({ event, article }: HotTakeProps) => {
  const mkt = event.markets[0];
  const tagStr = event.tags?.filter(t => t.label !== "All").slice(0, 3).map(t => t.label).join(" · ").toUpperCase() || "BREAKING";

  return (
    <div className="border-l-[3px] border-secondary pl-5 py-4 mb-4 bg-secondary/3">
      <p className="text-[0.65rem] font-bold text-secondary uppercase tracking-[0.15em] mb-1">
        HOT TAKE • {tagStr}
      </p>
      <div className="flex items-start gap-3 mb-2">
        {event.image && (
          <img src={event.image} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />
        )}
        <h4 className="font-display text-lg font-bold text-foreground">{event.title}</h4>
      </div>
      <p className="font-serif text-sm italic leading-relaxed text-muted-foreground line-clamp-3">
        {article || "Analysis pending..."}
      </p>
      {mkt && <OddsTags outcomes={mkt.outcomes} prices={mkt.outcomePrices} limit={4} className="mt-2" />}
    </div>
  );
};

export default HotTake;
