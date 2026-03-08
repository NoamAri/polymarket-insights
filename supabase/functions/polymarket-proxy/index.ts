const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, params } = await req.json();

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: "endpoint is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only allow gamma-api and clob endpoints
    const allowedBases: Record<string, string> = {
      gamma: "https://gamma-api.polymarket.com",
      clob: "https://clob.polymarket.com",
    };

    const [base, ...pathParts] = endpoint.split("/");
    const baseUrl = allowedBases[base];
    if (!baseUrl) {
      return new Response(
        JSON.stringify({ error: "Invalid endpoint base. Use gamma/ or clob/" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const path = pathParts.join("/");
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";

    const url = `${baseUrl}/${path}${queryString}`;
    console.log("Proxying:", url);

    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Proxy error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Proxy error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
