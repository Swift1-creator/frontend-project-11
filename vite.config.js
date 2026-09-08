import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'rss-proxy',

      configureServer(server) {
        server.middlewares.use('/rss-proxy', async (req, res) => {
          try {
            const requestUrl = new URL(
              req.url,
              'http://localhost:5173',
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

            const response = await fetch(requestUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 RSS Reader',
                Accept: 'application/rss+xml, application/xml, text/xml, */*',
              },
            });

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
            res.end(`Ошибка RSS-прокси: ${error.message}`);
          }
        });
      },
    },
  ],
});