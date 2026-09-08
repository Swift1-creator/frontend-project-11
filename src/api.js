const REQUEST_TIMEOUT = 10000;

const isValidUrl = (value) => {
  try {
    const url = new URL(value);

    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

export const fetchRss = async (rssUrl) => {
  if (!isValidUrl(rssUrl)) {
    throw new Error('Ссылка должна быть валидным URL');
  }

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
      throw new Error('Ошибка сети');
    }

    const xml = await response.text();

    if (!xml.trim()) {
      throw new Error('Ресурс не содержит валидный RSS');
    }

    return xml;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Ошибка сети');
    }

    if (error instanceof TypeError) {
      throw new Error('Ошибка сети');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};