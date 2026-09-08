import { defineConfig } from 'vite';

const fetchWithTimeout = async (
  url,
  options = {},
  timeout = 3000,
) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
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
    clearTimeout(timeoutId);
  }
};

const rssProxyMiddleware = async (req, res) => {
  try {
    const requestUrl = new URL(
      req.url || '',
      'http://localhost:8080',
    ).searchParams.get('url');

    if (!requestUrl) {
      res.statusCode = 400;
      res.setHeader(
        'Content-Type',
        'text/plain; charset=utf-8',
      );
      res.end('Не указан параметр url');
      return;
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(requestUrl);
    } catch {
      res.statusCode = 400;
      res.setHeader(
        'Content-Type',
        'text/plain; charset=utf-8',
      );
      res.end('Некорректный URL');
      return;
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
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
          'User-Agent': 'Mozilla/5.0 RSS Reader',
          Accept:
            'application/rss+xml, application/xml, text/xml, */*',
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
      res.end(
        `Ошибка удалённого RSS: ${response.status}\n${body}`,
      );
      return;
    }

    res.statusCode = 200;
    res.setHeader(
      'Content-Type',
      'application/xml; charset=utf-8',
    );
    res.end(body);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader(
      'Content-Type',
      'text/plain; charset=utf-8',
    );

    if (error.name === 'AbortError') {
      res.end('Ошибка RSS-прокси: превышено время ожидания');
      return;
    }

    res.end(`Ошибка RSS-прокси: ${error.message}`);
  }
};

const rssProxyPlugin = {
  name: 'rss-proxy',

  configureServer(server) {
    server.middlewares.use(
      '/rss-proxy',
      rssProxyMiddleware,
    );
  },

  configurePreviewServer(server) {
    server.middlewares.use(
      '/rss-proxy',
      rssProxyMiddleware,
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