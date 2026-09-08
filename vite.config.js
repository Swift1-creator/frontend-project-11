import { defineConfig } from 'vite';

function setupRssProxy(server) {
  server.middlewares.use('/rss-proxy', async (req, res) => {
    const requestUrl = new URL(req.url, 'http://localhost');
    const targetUrl = requestUrl.searchParams.get('url');

    if (!targetUrl) {
      res.statusCode = 400;
      res.end('Missing url');
      return;
    }

    let parsedTargetUrl;

    try {
      parsedTargetUrl = new URL(targetUrl);
    } catch {
      res.statusCode = 400;
      res.end('Invalid url');
      return;
    }

    if (!['http:', 'https:'].includes(parsedTargetUrl.protocol)) {
      res.statusCode = 400;
      res.end('Invalid url');
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(parsedTargetUrl, {
        signal: controller.signal,
        headers: {
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
      });

      if (!response.ok) {
        res.statusCode = response.status;
        res.end('RSS request failed');
        return;
      }

      const body = await response.text();

      res.statusCode = 200;
      res.setHeader(
        'Content-Type',
        response.headers.get('content-type') || 'application/xml',
      );
      res.end(body);
    } catch {
      res.statusCode = 502;
      res.end('RSS proxy error');
    } finally {
      clearTimeout(timeoutId);
    }
  });
}

const rssProxyPlugin = {
  name: 'rss-proxy',

  configureServer(server) {
    setupRssProxy(server);
  },

  configurePreviewServer(server) {
    setupRssProxy(server);
  },
};

export default defineConfig({
  plugins: [rssProxyPlugin],
});