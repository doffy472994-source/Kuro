// Kuro Exa proxy — Cloudflare Worker
//
// Forwards /search and /contents requests to Exa's API (api.exa.ai) server-side,
// so the browser never talks to Exa directly and never hits CORS restrictions.
//
// The Exa API key is NOT stored on the worker — the client sends it on every
// request via the `X-Exa-Api-Key` header, and this worker just relays it to Exa
// as `x-api-key`. That matches how Kuro's App.jsx calls this worker (see
// buildExaTools / exaRequest in src/App.jsx).
//
// Routes:
//   POST /search    -> https://api.exa.ai/search
//   POST /contents   -> https://api.exa.ai/contents
//
// Deploy:
//   1. npm install -g wrangler   (if you don't have it)
//   2. wrangler login
//   3. wrangler deploy
//   4. Copy the resulting workers.dev URL into Kuro's Settings > Worker URL field.

const EXA_BASE = "https://api.exa.ai";

// Only these paths are allowed to be proxied.
const ALLOWED_PATHS = new Set(["/search", "/contents"]);

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Exa-Api-Key",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonError(message, status, origin) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "*";
    const url = new URL(request.url);

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return jsonError("Only POST is supported.", 405, origin);
    }

    if (!ALLOWED_PATHS.has(url.pathname)) {
      return jsonError("Unknown endpoint. Use /search or /contents.", 404, origin);
    }

    const apiKey = request.headers.get("X-Exa-Api-Key");
    if (!apiKey) {
      return jsonError("Missing X-Exa-Api-Key header.", 401, origin);
    }

    let body;
    try {
      body = await request.text();
    } catch (err) {
      return jsonError("Could not read request body.", 400, origin);
    }

    let upstreamRes;
    try {
      upstreamRes = await fetch(`${EXA_BASE}${url.pathname}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body,
      });
    } catch (err) {
      return jsonError(`Failed to reach Exa: ${err.message}`, 502, origin);
    }

    const responseBody = await upstreamRes.text();

    return new Response(responseBody, {
      status: upstreamRes.status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
      },
    });
  },
};
