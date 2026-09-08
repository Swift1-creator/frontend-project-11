const corsProxy = 'https://allorigins.hexlet.app';

const REQUEST_TIMEOUT = 4500;

export const fetchRss = async (url) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const requestUrl =
      `${corsProxy}/get?url=${encodeURIComponent(url)}&disableCache=true`;

    const response = await fetch(requestUrl, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error('NETWORK_ERROR');
    }

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('INVALID_RSS');
    }

    if (!data || typeof data.contents !== 'string') {
      throw new Error('INVALID_RSS');
    }

    return data.contents;
  } catch (error) {
    if (
      error?.message === 'INVALID_RSS' ||
      error?.message === 'invalid-rss'
    ) {
      throw error;
    }

    throw new Error('NETWORK_ERROR');
  } finally {
    clearTimeout(timeoutId);
  }
};