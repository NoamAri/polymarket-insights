import type { PolymarketEvent } from "@/types/polymarket";
import { formatVolume, formatPercent, getTopOutcome, readingTime } from "@/lib/format";
import OddsTags from "./OddsTags";

interface LeadStoryProps {
  event: PolymarketEvent;
  article: string;
}

const LeadStory = ({ event, article }: LeadStoryProps) => {
  const mkt = event.markets[0];
  const { outcome: topOutcome, prob: topProb } = mkt
    ? getTopOutcome(mkt.outcomes, mkt.outcomePrices)
    : { outcome: "", prob: 0 };

  const tagStr = event.tags?.filter(t => t.label !== "All").slice(0, 3).map(t => t.label).join(" · ").toUpperCase() || "BREAKING";
  const now = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const rt = readingTime(article || "");

  return (
    <div className="py-6 mb-4 border-b border-border">
      <p className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-2">{tagStr}</p>
      <h2 className="font-display text-4xl font-bold text-foreground leading-tight mb-2">{event.title}</h2>
      <p className="text-xs text-muted-foreground italic mb-4">
        By Chronicle Markets Desk • {now} • {rt} min read
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-6 items-start">
        <div className="font-serif text-base leading-relaxed text-muted-foreground">
          {article || "Loading article..."}
        </div>

        <div className="text-center p-6 border-l-[3px] border-primary bg-primary/5 rounded-r-lg">
          <span className="block font-display text-4xl font-black text-primary">
            {topProb ? formatPercent(topProb) : "—"}
          </span>
          <span className="block text-sm text-muted-foreground mt-1 uppercase tracking-wider">
            {topOutcome || "Leading odds"}
          </span>
        </div>
      </div>

      {mkt && <OddsTags outcomes={mkt.outcomes} prices={mkt.outcomePrices} className="mt-4" />}

      <p className="text-xs text-muted-foreground/50 mt-4">
        Volume: {formatVolume(event.volume)} • 24h: {formatVolume(event.volume24hr || 0)} • Liquidity: {formatVolume(event.liquidity || 0)}
      </p>
    </div>
  );
};

export default LeadStory;
