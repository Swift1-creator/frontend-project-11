// src/api.js

const REQUEST_TIMEOUT = 10000;

export async function fetchRss(rssUrl) {
  const proxyUrl = `/rss-proxy?url=${encodeURIComponent(rssUrl)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    console.log('Используется локальный прокси:', proxyUrl);

    const response = await fetch(proxyUrl, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Локальный RSS-прокси HTTP ${response.status}`);
    }

    const xml = await response.text();

    if (!xml.trim()) {
      throw new Error('Локальный RSS-прокси вернул пустой ответ');
    }

   console.log('RSS из прокси:', {
  type: typeof xml,
  length: xml.length,
  start: xml.slice(0, 200),
});
    return xml;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Превышено время ожидания RSS-прокси');
    }

    console.error('Ошибка загрузки RSS:', error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}