const withTimeout = (promise, milliseconds) => {
  return Promise.race([
    promise,

    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('NETWORK_ERROR'));
      }, milliseconds);
    }),
  ]);
};

export const fetchRss = async (url) => {
  try {
    const proxyUrl =
      `/rss-proxy?url=${encodeURIComponent(url)}`;

    const response = await withTimeout(
      fetch(proxyUrl),
      2500,
    );

    if (!response.ok) {
      throw new Error('NETWORK_ERROR');
    }

    const xml = await withTimeout(
      response.text(),
      2500,
    );

    if (!xml.trim()) {
      throw new Error('INVALID_RSS');
    }

    return xml;
  } catch (error) {
    if (error.message === 'INVALID_RSS') {
      throw error;
    }

    throw new Error('NETWORK_ERROR');
  }
};