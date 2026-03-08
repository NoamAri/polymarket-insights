import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { names } = await req.json();

    if (!Array.isArray(names) || names.length === 0) {
      return new Response(JSON.stringify({ logos: {} }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduplicate and limit to 20 per request
    const uniqueNames = [...new Set(names.map((n: string) => n.trim()))].slice(0, 20);

    const logos: Record<string, string | null> = {};

    // Fetch in parallel
    const results = await Promise.allSettled(
      uniqueNames.map(async (name: string) => {
        const url = `${SPORTSDB_BASE}/searchteams.php?t=${encodeURIComponent(name)}`;
        const res = await fetch(url);
        if (!res.ok) return { name, badge: null };
        const data = await res.json();
        const teams = data?.teams;
        if (!teams || !teams.length) return { name, badge: null };
        // Pick best match - first result is usually best
        const badge = teams[0]?.strBadge || teams[0]?.strTeamBadge || null;
        return { name, badge };
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        logos[r.value.name] = r.value.badge;
      }
    }

    return new Response(JSON.stringify({ logos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("team-logo error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
