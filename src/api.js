const REQUEST_TIMEOUT = 4000;

export const fetchRss = async (url) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const proxyUrl = `/rss-proxy?url=${encodeURIComponent(url)}`;

    const response = await fetch(proxyUrl, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error('NETWORK_ERROR');
    }

    const xml = await response.text();

    if (!xml.trim()) {
      throw new Error('INVALID_RSS');
    }

    return xml;
  } catch (error) {
    if (error?.message === 'INVALID_RSS') {
      throw error;
    }

    throw new Error('NETWORK_ERROR');
  } finally {
    clearTimeout(timeoutId);
  }
};