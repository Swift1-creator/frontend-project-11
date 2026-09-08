const corsProxy = 'https://allorigins.hexlet.app';

export const fetchRss = async (url) => {
  try {
    const params = new URLSearchParams({
      url,
      disableCache: 'true',
    });

    const response = await fetch(`${corsProxy}/get?${params}`);

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
  }
};