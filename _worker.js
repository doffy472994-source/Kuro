import exaWorker from "./api/exa/worker.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/exa/")) {
      // Strip the /api/exa prefix so the worker's internal
      // ALLOWED_PATHS check (/search, /contents) still matches
      const strippedUrl = new URL(request.url);
      strippedUrl.pathname = url.pathname.replace("/api/exa", "");
      const strippedRequest = new Request(strippedUrl, request);
      return exaWorker.fetch(strippedRequest, env, ctx);
    }
    return env.ASSETS.fetch(request);
  }
};
