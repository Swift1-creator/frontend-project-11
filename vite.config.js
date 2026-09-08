import { defineConfig } from 'vite';

const fetchWithTimeout = async (
  url,
  options = {},
  timeout = 3000,
) => {
  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    const body = await response.text();

    return {
      response,
      body,
    };
  } finally {
    clearTimeout(timer);
  }
};

const rssProxyHandler = async (req, res) => {
  try {
    const currentUrl = new URL(
      req.url || '',
      'http://localhost:8080',
    );

    const targetUrl = currentUrl.searchParams.get('url');

    if (!targetUrl) {
      res.statusCode = 400;
      res.setHeader(
        'Content-Type',
        'text/plain; charset=utf-8',
      );
      res.end('Некорректный URL');
      return;
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      res.statusCode = 400;
      res.setHeader(
        'Content-Type',
        'text/plain; charset=utf-8',
      );
      res.end('Некорректный URL');
      return;
    }

    if (
      parsedUrl.protocol !== 'http:' &&
      parsedUrl.protocol !== 'https:'
    ) {
      res.statusCode = 400;
      res.setHeader(
        'Content-Type',
        'text/plain; charset=utf-8',
      );
      res.end('Некорректный URL');
      return;
    }

    const { response, body } = await fetchWithTimeout(
      parsedUrl.href,
      {
        headers: {
          Accept:
            'application/rss+xml, application/xml, text/xml, */*',
          'User-Agent': 'Mozilla/5.0 RSS Reader',
        },
      },
      3000,
    );

    if (!response.ok) {
      res.statusCode = response.status;
      res.setHeader(
        'Content-Type',
        'text/plain; charset=utf-8',
      );
      res.end('Ошибка сети');
      return;
    }

    res.statusCode = 200;
    res.setHeader(
      'Content-Type',
      'application/xml; charset=utf-8',
    );
    res.end(body);
  } catch (error) {
    console.error('RSS proxy error:', error);

    res.statusCode = 500;
    res.setHeader(
      'Content-Type',
      'text/plain; charset=utf-8',
    );
    res.end('Ошибка сети');
  }
};

const rssProxyPlugin = {
  name: 'rss-proxy',

  configureServer(server) {
    server.middlewares.use(
      '/rss-proxy',
      rssProxyHandler,
    );
  },

  configurePreviewServer(server) {
    server.middlewares.use(
      '/rss-proxy',
      rssProxyHandler,
    );
  },
};

export default defineConfig({
  plugins: [rssProxyPlugin],

  server: {
    host: '0.0.0.0',
    port: 8080,
  },

  preview: {
    host: '0.0.0.0',
    port: 8080,
  },
});