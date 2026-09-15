const BACKEND_URL = 'https://class-management-system-v357.onrender.com';

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/v1/health') {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/v1/health`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        const body = await response.text();

        return new Response(body, {
          status: response.status,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Worker could not reach backend',
            message: String(error)
          }),
          {
            status: 502,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    }

    if (url.pathname.startsWith('/api/')) {
      const backendUrl = new URL(
        url.pathname + url.search,
        BACKEND_URL
      );

      const headers = new Headers(request.headers);
      headers.delete('Origin');

      const backendRequest = new Request(
        backendUrl.toString(),
        {
          method: request.method,
          headers,
          body:
            request.method === 'GET' || request.method === 'HEAD'
              ? undefined
              : request.body,
          redirect: 'manual'
        }
      );

      return fetch(backendRequest);
    }

    return env.ASSETS.fetch(request);
  }
};