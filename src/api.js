const corsProxy = 'https://allorigins.hexlet.app';

const REQUEST_TIMEOUT = 4000;

export const fetchRss = async (url) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const proxyUrl = new URL(`${corsProxy}/get`);

    proxyUrl.searchParams.set('url', url);
    proxyUrl.searchParams.set('disableCache', 'true');

    const response = await fetch(proxyUrl, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error('NETWORK_ERROR');
    }

    const data = await response.json();

    if (!data || typeof data.contents !== 'string') {
      throw new Error('INVALID_RSS');
    }

    return data.contents;
  } catch (error) {
    if (error?.message === 'INVALID_RSS') {
      throw error;
    }

    throw new Error('NETWORK_ERROR');
  } finally {
    clearTimeout(timeoutId);
  }
};