import { supabase } from "@/integrations/supabase/client";
import type { PolymarketEvent, ArticleMap } from "@/types/polymarket";

export async function generateArticles(events: PolymarketEvent[]): Promise<ArticleMap> {
  try {
    const slimEvents = events.map((ev) => ({
      id: ev.id,
      title: ev.title,
      volume: ev.volume,
      volume24hr: ev.volume24hr,
      liquidity: ev.liquidity,
      tags: ev.tags,
      markets: ev.markets.slice(0, 1).map((m) => ({
        question: m.question,
        outcomes: m.outcomes,
        outcomePrices: m.outcomePrices,
        volume: m.volume,
      })),
    }));

    const { data, error } = await supabase.functions.invoke("generate-articles", {
      body: { events: slimEvents },
    });

    if (error) {
      console.error("Article generation error:", error);
      return {};
    }

    return data?.articles || {};
  } catch (err) {
    console.error("Failed to generate articles:", err);
    return {};
  }
}
