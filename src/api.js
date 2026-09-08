const corsProxy = 'https://allorigins.hexlet.app';

const REQUEST_TIMEOUT = 10000;

const isRssContent = (value) => (
  typeof value === 'string'
  && /<(rss|feed)(?:\s|>)/i.test(value)
);

export const fetchRss = async (url) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const params = new URLSearchParams({
      url,
      disableCache: 'true',
    });

    const response = await fetch(`${corsProxy}/get?${params.toString()}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('INVALID_RSS');
      }

      throw new Error('NETWORK_ERROR');
    }

    const responseText = await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      if (isRssContent(responseText)) {
        return responseText;
      }

      throw new Error('INVALID_RSS');
    }

    if (!data || typeof data.contents !== 'string') {
      throw new Error('INVALID_RSS');
    }

    if (!isRssContent(data.contents)) {
      throw new Error('INVALID_RSS');
    }

    return data.contents;
  } catch (error) {
    if (
      error instanceof Error
      && error.name === 'AbortError'
    ) {
      throw new Error('INVALID_RSS');
    }

    if (
      error instanceof Error
      && (
        error.message === 'INVALID_RSS'
        || error.message === 'NETWORK_ERROR'
      )
    ) {
      throw error;
    }

    throw new Error('NETWORK_ERROR');
  } finally {
    clearTimeout(timeoutId);
  }
};