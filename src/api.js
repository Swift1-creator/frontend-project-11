const corsProxy = 'https://allorigins.hexlet.app';

const REQUEST_TIMEOUT = 4500;

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
      throw new Error('NETWORK_ERROR');
    }

    const responseText = await response.text();

    try {
      const data = JSON.parse(responseText);

      if (data && typeof data.contents === 'string') {
        if (isRssContent(data.contents)) {
          return data.contents;
        }

        throw new Error('INVALID_RSS');
      }

      throw new Error('INVALID_RSS');
    } catch (error) {
      if (isRssContent(responseText)) {
        return responseText;
      }

      if (
        error instanceof Error
        && error.message === 'INVALID_RSS'
      ) {
        throw error;
      }

      throw new Error('INVALID_RSS');
    }
  } catch (error) {
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