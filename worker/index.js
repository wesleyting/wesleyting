const worker = {
  async fetch(request, env) {
    if (!env?.ASSETS?.fetch) {
      return new Response("Static asset binding unavailable.", { status: 503 });
    }

    const response = await env.ASSETS.fetch(request);

    if (response.status !== 404 || !["GET", "HEAD"].includes(request.method)) {
      return response;
    }

    const notFoundUrl = new URL("/404.html", request.url);
    const notFoundResponse = await env.ASSETS.fetch(
      new Request(notFoundUrl, request),
    );

    return new Response(request.method === "HEAD" ? null : notFoundResponse.body, {
      status: 404,
      headers: notFoundResponse.headers,
    });
  },
};

export default worker;
