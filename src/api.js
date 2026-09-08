const corsProxy = 'https://allorigins.hexlet.app';

const REQUEST_TIMEOUT = 2000;

const isRssContent = (value) => (
  typeof value === 'string'
  && /<rss(?:\s|>)/i.test(value)
  && /<channel(?:\s|>)/i.test(value)
);

const createTimeout = (milliseconds) => (
  new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('INVALID_RSS'));
    }, milliseconds);
  })
);

export const fetchRss = async (url) => {
  const controller = new AbortController();

  const request = (async () => {
    const params = new URLSearchParams({
      url,
      disableCache: 'true',
    });

    const response = await fetch(
      `${corsProxy}/get?${params.toString()}`,
      {
        signal: controller.signal,
      },
    );

    if (!response.ok) {
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
  })();

  try {
    return await Promise.race([
      request,
      createTimeout(REQUEST_TIMEOUT),
    ]);
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_RSS') {
      throw error;
    }

    if (error instanceof Error && error.message === 'NETWORK_ERROR') {
      throw error;
    }

    throw new Error('NETWORK_ERROR');
  } finally {
    controller.abort();
  }
};