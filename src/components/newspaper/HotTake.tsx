import type { PolymarketEvent } from "@/types/polymarket";

interface HotTakeProps {
  event: PolymarketEvent;
  article: string;
}

const HotTake = ({ event, article }: HotTakeProps) => {
  const tagStr = event.tags?.filter(t => t.label !== "All").slice(0, 3).map(t => t.label).join(" · ").toUpperCase() || "BREAKING";

  return (
    <div className="border-l-[3px] border-secondary pl-5 py-4 mb-4 bg-secondary/3">
      <p className="text-[0.65rem] font-bold text-secondary uppercase tracking-[0.15em] mb-1">
        HOT TAKE • {tagStr}
      </p>
      <h4 className="font-display text-lg font-bold text-foreground mb-2">{event.title}</h4>
      <p className="font-serif text-sm italic leading-relaxed text-muted-foreground line-clamp-3">
        {article || "Analysis pending..."}
      </p>
    </div>
  );
};

export default HotTake;
