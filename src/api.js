export const fetchRss = async (url) => {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 4000);

  try {
    const response = await fetch(
      `/rss-proxy?url=${encodeURIComponent(url)}`,
      {
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error('NETWORK_ERROR');
    }

    const xml = await response.text();

    if (!xml.trim()) {
      throw new Error('INVALID_RSS');
    }

    return xml;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('NETWORK_ERROR');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};