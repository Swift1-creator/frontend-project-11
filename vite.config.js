import { defineConfig } from 'vite';

const createProxyMiddleware = () => {
  return async (req, res, next) => {
    if (!req.url) {
      next();
      return;
    }

    try {
      const requestUrl = new URL(
        req.url,
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

      let remoteUrl;

      try {
        remoteUrl = new URL(requestUrl);
      } catch {
        res.statusCode = 400;
        res.setHeader(
          'Content-Type',
          'text/plain; charset=utf-8',
        );
        res.end('Некорректный URL');
        return;
      }

      if (!['http:', 'https:'].includes(remoteUrl.protocol)) {
        res.statusCode = 400;
        res.setHeader(
          'Content-Type',
          'text/plain; charset=utf-8',
        );
        res.end('Некорректный протокол');
        return;
      }

      const controller = new AbortController();

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 3500);

      let response;

      try {
        response = await fetch(remoteUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 RSS Reader',
            Accept:
              'application/rss+xml, application/xml, text/xml, */*',
          },
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const body = await response.text();

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
};

const rssProxyPlugin = {
  name: 'rss-proxy',

  configureServer(server) {
    server.middlewares.use(
      '/rss-proxy',
      createProxyMiddleware(),
    );
  },

  configurePreviewServer(server) {
    server.middlewares.use(
      '/rss-proxy',
      createProxyMiddleware(),
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