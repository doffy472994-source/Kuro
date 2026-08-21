# Kuro

A single-page AI chatbot, built with Vite/React and bundled into one
self-contained `index.html`, plus a Cloudflare Worker that proxies Exa web
search/fetch requests to avoid browser CORS issues.

## Layout

```
.
├── index.html        # Built single-file app — open directly or host as-is (git-ignored source, tracked output)
├── vite/              # Vite/React source project (git-ignored — not committed)
└── api/
    └── exa/            # Cloudflare Worker that proxies requests to Exa's API
```

- **`index.html`** is the production build output — a single HTML file with
  all JS/CSS inlined (via `vite-plugin-singlefile`). This is the file that's
  tracked in git and is what you'd deploy/host/open directly.
- **`vite/`** is the actual source project (React components, etc). It's
  git-ignored on purpose — `index.html` at the root is the build artifact
  that matters for distribution. Clone the source separately or keep a local
  copy if you need to make changes.
- **`api/exa/`** is a small Cloudflare Worker (`worker.js`) that forwards
  `/search` and `/contents` requests to `api.exa.ai` server-side, so the app
  can do web search/fetch without hitting CORS restrictions in the browser.
  The app is hardcoded to call it at `https://kuro.itsricky.dev/api/exa`.
  See `api/exa/README.md` for deploy instructions.

## Updating the build

If you have the `vite/` source populated locally:

```bash
cd vite
npm install
npm run build
cp dist/index.html ../index.html
```

Then commit the updated root `index.html`.

## Deploying the worker

```bash
cd api/exa
npm install -g wrangler   # if needed
wrangler login
wrangler deploy
```

The app expects the worker to be reachable at `https://kuro.itsricky.dev/api/exa`
(see `EXA_WORKER_BASE` in `src/App.jsx`). Route the worker to that domain/path
in your Cloudflare dashboard (or update `EXA_WORKER_BASE` and rebuild if you're
using a different domain). Only an Exa API key needs to be entered in Kuro's
Settings panel — the worker URL is no longer configurable there.
