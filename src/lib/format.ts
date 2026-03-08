export function formatVolume(v: number): string {
  if (v >= 1_000_000_000_000) return `$${(v / 1_000_000_000_000).toFixed(1)}T`;
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

export function formatPercent(v: number): string {
  return `${(v * 100).toFixed(0)}%`;
}

export function readingTime(text: string): number {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}

export function parseOutcomesAndPrices(
  outcomesRaw: string | string[],
  pricesRaw: string | number[]
): { outcomes: string[]; prices: number[] } {
  let outcomes: string[];
  let prices: number[];

  if (typeof outcomesRaw === "string") {
    try { outcomes = JSON.parse(outcomesRaw); } catch { outcomes = []; }
  } else {
    outcomes = outcomesRaw || [];
  }

  if (typeof pricesRaw === "string") {
    try { prices = JSON.parse(pricesRaw).map(Number); } catch { prices = []; }
  } else if (Array.isArray(pricesRaw)) {
    prices = pricesRaw.map(Number);
  } else {
    prices = [];
  }

  return { outcomes, prices };
}

export function parseClobTokenIds(raw: string | string[]): string[] {
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return raw || [];
}

export function getTopOutcome(outcomes: string[], prices: number[]): { outcome: string; prob: number } {
  let topOutcome = "";
  let topProb = 0;
  for (let i = 0; i < outcomes.length; i++) {
    const p = prices[i] || 0;
    if (p > topProb) {
      topProb = p;
      topOutcome = outcomes[i];
    }
  }
  return { outcome: topOutcome, prob: topProb };
}

export function deriveWinner(outcomes: string[], prices: number[]): string {
  for (let i = 0; i < outcomes.length; i++) {
    if (prices[i] >= 0.99) return outcomes[i];
  }
  return "Unresolved";
}

export function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs}h ago`;
  return "just now";
}
