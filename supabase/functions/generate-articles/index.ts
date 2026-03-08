import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ARTICLE_STYLES = [
  { name: "breaking_news", tone: "urgent, newsworthy, AP-style wire reporting", structure: "inverted pyramid -- lead with the most important fact, then context" },
  { name: "analysis", tone: "measured, analytical, like a Financial Times column", structure: "set up the situation, analyze the numbers, draw a conclusion" },
  { name: "market_watch", tone: "concise, data-driven, Bloomberg terminal style", structure: "key numbers first, what they mean, what to watch for" },
  { name: "opinion", tone: "provocative, contrarian, editorial page voice", structure: "bold thesis statement, supporting evidence from the odds, challenge the consensus" },
  { name: "human_interest", tone: "narrative, storytelling, like a New Yorker piece", structure: "open with a vivid scene or question, weave in the market data as story beats" },
];

const SYSTEM_PROMPT = `You are the star columnist of The Polymarket Chronicle, a
punchy, premium prediction-market newsletter read by traders and curious minds.
Your voice is sharp, confident, and slightly irreverent — like Matt Levine meets
a Bloomberg terminal with personality.

WRITING PROTOCOL:
1. LENGTH: One tight paragraph, 3-5 sentences, 60-100 words. No filler.
2. OPENER: Lead with the single most interesting number, contrast, or
   provocative claim. Examples of GREAT openers:
   - "At 73%, traders are more confident in X than pollsters ever were."
   - "The spread just collapsed: what was 60-40 last week is now a coin flip."
   - "$2.4M in 24 hours — and the market still can't make up its mind."
   NEVER start with: "A new market...", "Traders are watching...",
   "In the latest development...", "The prediction market for..."
3. DATA WEAVING: Embed numbers naturally. Say "a commanding 81%" not just "81%".
   Say "$4.2M in volume signals deep conviction" not "the volume is $4.2M".
   Compare odds to real-world benchmarks when possible.
4. VOICE: Active voice only. Strong verbs (surges, collapses, defies, commands,
   narrows). No passive ("is being traded"). Authoritative but accessible.
5. CLOSER: End with a catalyst or tension — what could flip the odds. Make the
   reader want to check back tomorrow.
6. FORMAT: Plain prose only. No markdown, bullets, headers, or emojis.
7. MULTI-OUTCOME MARKETS (sports, elections, competitions): Frame as a
   horse-race narrative. Name the frontrunner, the dark horse, and the gap.
   Mention top 2-3 contenders with their odds. Use competitive language
   (leads, trails, closing in, surging, fading).
8. VARIETY: Each article must feel distinct. Vary sentence structure, rhythm,
   and opening strategy across the batch.`;

function hashToStyleIndex(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % ARTICLE_STYLES.length;
}

function formatVol(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function isBinaryYesNo(outcomes: string[]): boolean {
  if (outcomes.length !== 2) return false;
  const s = new Set(outcomes.map(o => o.trim().toLowerCase()));
  return s.has("yes") && s.has("no");
}

function buildEventSummary(ev: any): string {
  const mkt = ev.markets?.[0];
  const outcomes = mkt?.outcomes || [];
  const prices = mkt?.outcomePrices || [];
  const isBinary = isBinaryYesNo(outcomes);
  const style = ARTICLE_STYLES[hashToStyleIndex(ev.id)];

  let odds: Record<string, number> = {};
  let marketType = "binary";
  let typeNote = "";

  if (!isBinary && outcomes.length > 0) {
    marketType = "multi_outcome";
    outcomes.forEach((o: string, i: number) => { odds[o] = Math.round((prices[i] || 0) * 100 * 10) / 10; });
    typeNote = `\nMarket Type: MULTI-OUTCOME (${outcomes.length} named outcomes — not Yes/No)\n`;
  } else if (ev.markets?.length > 1 && isBinary) {
    marketType = "multi_market";
    for (const m of ev.markets) {
      const q = m.question || "";
      const mOutcomes = m.outcomes || [];
      const mPrices = m.outcomePrices || [];
      for (let j = 0; j < mOutcomes.length; j++) {
        if (mOutcomes[j].trim().toLowerCase() === "yes") {
          odds[q] = Math.round((mPrices[j] || 0) * 100 * 10) / 10;
          break;
        }
      }
    }
    typeNote = `\nMarket Type: MULTI-OUTCOME (${ev.markets.length} candidates/teams — treat as a race/competition)\n`;
  } else {
    outcomes.forEach((o: string, i: number) => { odds[o] = Math.round((prices[i] || 0) * 100 * 10) / 10; });
  }

  const tags = (ev.tags || []).filter((t: any) => t.label && t.label !== "All").slice(0, 4).map((t: any) => t.label);

  return (
    `--- Market ID: ${ev.id} ---\n` +
    `Title: ${ev.title}\n` +
    `Question: ${mkt?.question || ev.title}\n` +
    `Current Odds: ${JSON.stringify(odds)}\n` +
    `24h Volume: ${formatVol(ev.volume24hr || 0)}\n` +
    `Total Volume: ${formatVol(ev.volume || 0)}\n` +
    `Tags: ${tags.join(", ")}\n` +
    typeNote +
    `Style: ${style.name} -- ${style.tone}\n` +
    `Structure: ${style.structure}\n`
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { events } = await req.json();
    if (!events || !Array.isArray(events) || events.length === 0) {
      return new Response(
        JSON.stringify({ articles: {} }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const eventSummaries = events.map(buildEventSummary).join("\n");

    const batchPrompt = [
      "Write a unique editorial paragraph for each of the following prediction markets.",
      'Return your response as a JSON object mapping market_id to article text.',
      'Format: {"market_id_1": "article text...", "market_id_2": "article text..."}',
      "Each article must match the assigned style. Here are the markets:\n",
      eventSummaries,
    ].join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: batchPrompt },
        ],
        temperature: 0.85,
        max_tokens: 4000,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI gateway error", articles: {} }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    let articles: Record<string, string> = {};
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      articles = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse articles JSON:", parseErr, "Content:", content.slice(0, 500));
      articles = {};
    }

    return new Response(
      JSON.stringify({ articles }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-articles error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
        articles: {},
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
