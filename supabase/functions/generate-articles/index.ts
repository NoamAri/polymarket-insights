import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { events } = await req.json();
    if (!events || !Array.isArray(events) || events.length === 0) {
      return new Response(
        JSON.stringify({ articles: {} }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const eventSummaries = events
      .map((ev: any) => {
        const mkt = ev.markets?.[0];
        const odds = mkt?.outcomes
          ?.map((o: string, i: number) => `${o}: ${((mkt.outcomePrices?.[i] || 0) * 100).toFixed(0)}%`)
          .join(", ");
        return `Event ID: ${ev.id}\nTitle: ${ev.title}\nVolume: $${(ev.volume || 0).toLocaleString()}\n24h Volume: $${(ev.volume24hr || 0).toLocaleString()}\nOdds: ${odds || "N/A"}\nTags: ${ev.tags?.map((t: any) => t.label).join(", ") || "N/A"}`;
      })
      .join("\n---\n");

    const systemPrompt = `You are a brilliant financial journalist writing for "The Polymarket Chronicle", a newspaper covering prediction markets. Write engaging, informative articles about prediction market events.

For each event, write a 2-3 paragraph article in newspaper style. Be analytical, cite the odds, discuss what the market implies, and add context. Use varied writing styles — some investigative, some editorial, some data-driven.

CRITICAL: Return a valid JSON object mapping event IDs to article text. Format:
{"<event_id>": "<article text>", ...}

Only return the JSON, no markdown fences or extra text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Write newspaper articles for these ${events.length} prediction market events:\n\n${eventSummaries}`,
          },
        ],
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

    // Parse the JSON from the response, handling possible markdown fences
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
