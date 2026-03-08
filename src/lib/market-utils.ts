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
 * Extract the key differentiator from a multi-market question.
 * Examples:
 *  "Will the price of Bitcoin be above $62,000 on March 8?" → "$62,000"
 *  "Will Arsenal win the 2025–26 English Premier League?" → "Arsenal"
 *  "Will there be no change in Fed interest rates..." → "No change"
 *  "Will Gavin Newsom win the 2028 Democratic..." → "Gavin Newsom"
 */
function extractShortLabel(question: string, eventTitle: string): string {
  // 1. Price thresholds: "$62,000", "$2.88", etc.
  const priceMatch = question.match(/\$[\d,]+(?:\.\d+)?/);
  if (priceMatch) {
    // Also try to grab a date context if present
    const dateMatch = question.match(/on\s+((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+)/i);
    if (dateMatch && !eventTitle.toLowerCase().includes(dateMatch[1].toLowerCase())) {
      return `${priceMatch[0]} (${dateMatch[1]})`;
    }
    return priceMatch[0];
  }

  // 2. Temperature thresholds
  const tempMatch = question.match(/(\d+°[CF])/);
  if (tempMatch) return tempMatch[1];

  // 3. "Will [ENTITY] win/be..." pattern — extract entity name
  const willMatch = question.match(/^Will\s+(.+?)\s+(?:win|be\s+the|become|get|receive|finish)/i);
  if (willMatch) {
    let entity = willMatch[1].trim();
    // Clean up "the price of X" patterns
    entity = entity.replace(/^the\s+price\s+of\s+/i, "");
    // Clean "there be no" → "No"
    if (/^there\s+be\s+no/i.test(entity)) {
      const noMatch = question.match(/^Will\s+there\s+be\s+no\s+(.+?)(?:\s+(?:in|after|on|by|from))/i);
      return noMatch ? `No ${noMatch[1]}` : entity;
    }
    // If too long, truncate
    if (entity.length > 30) entity = entity.slice(0, 28) + "…";
    return entity;
  }

  // 4. Date-based: extract date from question
  const dateOnly = question.match(/((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+(?:,?\s+\d{4})?)/i);
  if (dateOnly) return dateOnly[1];

  // 5. Time range: "5:15AM-5:30AM ET"
  const timeMatch = question.match(/(\d{1,2}:\d{2}[AP]M\s*-\s*\d{1,2}:\d{2}[AP]M)/i);
  if (timeMatch) return timeMatch[1];

  // 6. Fallback: use the question but trim common prefixes and truncate
  let label = question
    .replace(/^Will\s+/i, "")
    .replace(/\?$/, "")
    .trim();
  if (label.length > 35) label = label.slice(0, 33) + "…";
  return label;
}

/**
 * Get all outcomes with probabilities from an event.
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

  // Multi-market event: each sub-market is a candidate — extract short labels
  if (event.markets.length > 1) {
    const result: OutcomeEntry[] = [];
    for (const m of event.markets) {
      const yesIdx = m.outcomes.findIndex((o) => o.trim().toLowerCase() === "yes");
      const yesPrice = yesIdx >= 0 ? (m.outcomePrices[yesIdx] || 0) : 0;
      result.push({
        name: extractShortLabel(m.question, event.title),
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
