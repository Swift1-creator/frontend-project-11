const corsProxy = 'https://allorigins.hexlet.app';

const REQUEST_TIMEOUT = 4500;

export const fetchRss = async (url) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const params = new URLSearchParams();

    params.set('url', url);
    params.set('disableCache', 'true');

    const response = await fetch(`${corsProxy}/get?${params.toString()}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error('NETWORK_ERROR');
    }

    const responseText = await response.text();

    // Ответ AllOrigins обычно имеет вид:
    // {"contents":"<rss>...</rss>"}
    try {
      const data = JSON.parse(responseText);

      if (data && typeof data.contents === 'string') {
        return data.contents;
      }

      throw new Error('INVALID_RSS');
    } catch (error) {
      // Если это не JSON, возможно, mock вернул XML напрямую.
      if (
        responseText.includes('<rss') ||
        responseText.includes('<feed') ||
        responseText.includes('<?xml')
      ) {
        return responseText;
      }

      if (error instanceof Error && error.message === 'INVALID_RSS') {
        throw error;
      }

      throw new Error('INVALID_RSS');
    }
  } catch (error) {
    if (
      error instanceof Error &&
      (
        error.message === 'INVALID_RSS' ||
        error.message === 'NETWORK_ERROR'
      )
    ) {
      throw error;
    }

    throw new Error('NETWORK_ERROR');
  } finally {
    clearTimeout(timeoutId);
  }
};