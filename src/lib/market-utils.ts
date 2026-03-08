/**
 * Multi-outcome market detection and outcome extraction
 * Ported from the Python dashboard's _is_multi_outcome / _get_all_outcomes
 */
import type { PolymarketEvent, PolymarketMarket } from "@/types/polymarket";

function isBinaryYesNo(outcomes: string[]): boolean {
  if (outcomes.length !== 2) return false;
  const normed = new Set(outcomes.map((o) => o.trim().toLowerCase()));
  return normed.has("yes") && normed.has("no");
}

/**
 * Check if an event represents a multi-outcome market.
 * True when:
 * - A single market has named (non-Yes/No) outcomes, OR
 * - The event has multiple sub-markets (each = one candidate/team)
 */
export function isMultiOutcome(event: PolymarketEvent): boolean {
  if (!event.markets.length) return false;
  const mkt = event.markets[0];
  if (!isBinaryYesNo(mkt.outcomes)) return true;
  if (event.markets.length > 1) return true;
  return false;
}

export interface OutcomeEntry {
  name: string;
  prob: number;
  image?: string;
}

/**
 * Get all outcomes with probabilities from an event.
 * - For single-market with named outcomes: use those directly
 * - For multi-market events: extract "Yes" price from each sub-market's question
 * - For standard binary: return outcomes as-is
 */
export function getAllOutcomes(event: PolymarketEvent): OutcomeEntry[] {
  if (!event.markets.length) return [];

  const mkt = event.markets[0];

  // Single market with named outcomes (not Yes/No)
  if (!isBinaryYesNo(mkt.outcomes)) {
    const result: OutcomeEntry[] = mkt.outcomes.map((o, i) => ({
      name: o,
      prob: mkt.outcomePrices[i] || 0,
    }));
    return result.sort((a, b) => b.prob - a.prob);
  }

  // Multi-market event: each sub-market is a candidate
  if (event.markets.length > 1) {
    const result: OutcomeEntry[] = [];
    for (const m of event.markets) {
      const yesIdx = m.outcomes.findIndex((o) => o.trim().toLowerCase() === "yes");
      const yesPrice = yesIdx >= 0 ? (m.outcomePrices[yesIdx] || 0) : 0;
      result.push({
        name: m.question,
        prob: yesPrice,
        image: m.image,
      });
    }
    return result.sort((a, b) => b.prob - a.prob);
  }

  // Standard binary
  return mkt.outcomes.map((o, i) => ({
    name: o,
    prob: mkt.outcomePrices[i] || 0,
  }));
}

/**
 * Build market type annotation for LLM prompt
 */
export function getMarketType(event: PolymarketEvent): "binary" | "multi_outcome" | "multi_market" {
  if (!event.markets.length) return "binary";
  const mkt = event.markets[0];
  if (!isBinaryYesNo(mkt.outcomes)) return "multi_outcome";
  if (event.markets.length > 1) return "multi_market";
  return "binary";
}
