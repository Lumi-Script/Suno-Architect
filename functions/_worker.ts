export default {
  async fetch(request: any, env: any, ctx: any) {
    const url = new URL(request.url);

    // If it's not an API request, let Cloudflare Assets serve static files & SPA fallback
    if (!url.pathname.startsWith('/api')) {
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }
      return new Response("Not found", { status: 404 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    let pathname = url.pathname.substring(4);
    if (!pathname.startsWith('/')) { pathname = '/' + pathname; }
    
    const targetUrl = "https://studio-api.prod.suno.com/api" + pathname + url.search;
    const headers = new Headers(request.headers);
    headers.set("Origin", "https://suno.com");
    headers.set("Referer", "https://suno.com/");
    headers.delete("Host");

    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.body,
    });

    try {
      const response = await fetch(newRequest);
      const newResponse = new Response(response.body, response);
      
      newResponse.headers.set("Access-Control-Allow-Origin", "*");
      newResponse.headers.set("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");
      newResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

      return newResponse;
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
