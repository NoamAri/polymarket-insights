import { supabase } from "@/integrations/supabase/client";
import type { PolymarketEvent, PolymarketMarket, CategoryInfo, PricePoint } from "@/types/polymarket";

async function proxyFetch(endpoint: string, params?: Record<string, string>) {
  const { data, error } = await supabase.functions.invoke("polymarket-proxy", {
    body: { endpoint, params },
  });
  if (error) throw new Error(error.message || "Proxy fetch failed");
  return data;
}

function parseMarket(raw: any): PolymarketMarket {
  let outcomes: string[] = [];
  let prices: number[] = [];
  let clobTokenIds: string[] = [];

  try { outcomes = typeof raw.outcomes === "string" ? JSON.parse(raw.outcomes) : (raw.outcomes || []); } catch { outcomes = []; }
  try { prices = (typeof raw.outcomePrices === "string" ? JSON.parse(raw.outcomePrices) : (raw.outcomePrices || [])).map(Number); } catch { prices = []; }
  try { clobTokenIds = typeof raw.clobTokenIds === "string" ? JSON.parse(raw.clobTokenIds) : (raw.clobTokenIds || []); } catch { clobTokenIds = []; }

  return {
    id: raw.id || raw.conditionId || "",
    question: raw.question || "",
    outcomes,
    outcomePrices: prices,
    volume: Number(raw.volume || raw.volumeNum || 0),
    liquidity: Number(raw.liquidity || 0),
    active: raw.active ?? !raw.closed,
    closed: raw.closed ?? false,
    startDate: raw.startDate,
    endDate: raw.endDate,
    closedTime: raw.closedTime,
    lastTradePrice: raw.lastTradePrice != null ? Number(raw.lastTradePrice) : undefined,
    bestBid: raw.bestBid != null ? Number(raw.bestBid) : undefined,
    bestAsk: raw.bestAsk != null ? Number(raw.bestAsk) : undefined,
    clobTokenIds,
    conditionId: raw.conditionId,
    image: raw.image,
  };
}

function parseEvent(raw: any): PolymarketEvent {
  const markets = (raw.markets || []).map(parseMarket);
  return {
    id: raw.id || "",
    ticker: raw.ticker || "",
    slug: raw.slug || "",
    title: raw.title || "",
    description: raw.description,
    startDate: raw.startDate,
    endDate: raw.endDate,
    image: raw.image,
    icon: raw.icon,
    active: raw.active ?? true,
    closed: raw.closed ?? false,
    volume: Number(raw.volume || 0),
    volume24hr: raw.volume24hr != null ? Number(raw.volume24hr) : undefined,
    liquidity: raw.liquidity != null ? Number(raw.liquidity) : undefined,
    openInterest: raw.openInterest != null ? Number(raw.openInterest) : undefined,
    competitive: raw.competitive != null ? Number(raw.competitive) : undefined,
    commentCount: raw.commentCount,
    markets,
    tags: raw.tags,
    series: raw.series,
    negRisk: raw.negRisk,
  };
}

export async function fetchTopCategories(limit = 14): Promise<CategoryInfo[]> {
  const events = await proxyFetch("gamma/events", {
    limit: "100",
    active: "true",
    order: "volume24hr",
    ascending: "false",
  });

  if (!Array.isArray(events)) return [];

  const tagCount = new Map<string, { label: string; slug: string; count: number }>();
  for (const ev of events) {
    for (const tag of (ev.tags || [])) {
      if (!tag.label || tag.label === "All") continue;
      const key = tag.slug || tag.label.toLowerCase().replace(/\s+/g, "-");
      const existing = tagCount.get(key);
      if (existing) {
        existing.count++;
      } else {
        tagCount.set(key, { label: tag.label, slug: key, count: 1 });
      }
    }
  }

  return Array.from(tagCount.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function fetchEventsByCategory(tagSlug: string, maxPages = 5): Promise<PolymarketEvent[]> {
  const allEvents: PolymarketEvent[] = [];
  for (let page = 0; page < maxPages; page++) {
    const offset = page * 20;
    try {
      const data = await proxyFetch("gamma/events", {
        tag: tagSlug,
        limit: "20",
        offset: String(offset),
        order: "volume24hr",
        ascending: "false",
      });
      if (!Array.isArray(data) || data.length === 0) break;
      allEvents.push(...data.map(parseEvent));
    } catch {
      break;
    }
  }
  return allEvents;
}

export async function fetchNewspaperEvents(limit = 15): Promise<PolymarketEvent[]> {
  const data = await proxyFetch("gamma/events", {
    limit: String(limit),
    active: "true",
    order: "volume24hr",
    ascending: "false",
  });
  if (!Array.isArray(data)) return [];
  return data.map(parseEvent);
}

export async function fetchPriceHistory(tokenId: string, fidelity = 60): Promise<PricePoint[]> {
  try {
    const data = await proxyFetch("clob/prices-history", {
      market: tokenId,
      interval: "all",
      fidelity: String(fidelity),
    });
    return (data.history || []).map((h: any) => ({ t: h.t, p: Number(h.p) }));
  } catch {
    return [];
  }
}
