const REQUEST_TIMEOUT = 10000;

export const fetchRss = async (rssUrl) => {
  const proxyUrl = `/rss-proxy?url=${encodeURIComponent(rssUrl)}`;
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const response = await fetch(proxyUrl, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Локальный RSS-прокси HTTP ${response.status}`,
      );
    }

    const xml = await response.text();

    if (!xml.trim()) {
      throw new Error(
        'Локальный RSS-прокси вернул пустой ответ',
      );
    }

    return xml;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Превышено время ожидания RSS-прокси');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};