# kuro-exa-proxy

A tiny Cloudflare Worker that proxies requests to the [Exa](https://exa.ai) API
so Kuro's web search/fetch tools can call Exa from the browser without hitting
CORS restrictions.

It does **not** store your Exa API key — the key is sent by the client on every
request (`X-Exa-Api-Key` header) and just forwarded to Exa as `x-api-key`.

## Routes

- `POST /search` → forwards to `https://api.exa.ai/search`
- `POST /contents` → forwards to `https://api.exa.ai/contents`

Both simply relay the JSON body you send and return Exa's response as-is.

## Deploy

1. Install Wrangler if you don't have it:
   ```bash
   npm install -g wrangler
   ```
2. Log in:
   ```bash
   wrangler login
   ```
3. From this folder, deploy:
   ```bash
   wrangler deploy
   ```
4. Kuro's client is hardcoded to call the worker at
   `https://kuro.itsricky.dev/api/exa` (see `EXA_WORKER_BASE` in `src/App.jsx`
   of the Vite project). Add a route or custom domain in the Cloudflare
   dashboard so this worker answers at that address — e.g. a route like
   `kuro.itsricky.dev/api/exa*` pointed at this worker.
5. In Kuro, open **Settings** and paste your Exa API key into **Exa API Key**.
   Web search/fetch will start working — there's no separate Worker URL field
   to fill in anymore.

## Notes

- `compatibility_date` in `wrangler.toml` can be bumped to a newer date if you
  want, it isn't load-bearing for this simple proxy.
- If you want to lock this down to only your Kuro deployment's origin (instead
  of allowing any site to call it), replace the `Access-Control-Allow-Origin`
  logic in `worker.js` with a hardcoded origin string instead of echoing back
  the request's `Origin` header.
