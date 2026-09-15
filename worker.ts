const BACKEND_URL = 'https://class-management-system-v357.onrender.com';

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Proxy all backend API requests to Render
    if (url.pathname.startsWith('/api/')) {
      const backendUrl = new URL(url.pathname + url.search, BACKEND_URL);

      const headers = new Headers(request.headers);

      // Browser -> Cloudflare is same-origin.
      // Do not forward the browser's Origin header to the backend.
      headers.delete('Origin');

      const backendRequest = new Request(backendUrl.toString(), {
        method: request.method,
        headers,
        body:
          request.method === 'GET' || request.method === 'HEAD'
            ? undefined
            : request.body,
        redirect: 'manual'
      });

      return fetch(backendRequest);
    }

    // Everything else is served by Angular static assets
    return env.ASSETS.fetch(request);
  }
};