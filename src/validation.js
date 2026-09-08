const isValidUrl = (value) => {
  try {
    const url = new URL(value);

    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

export const validateUrl = async (
  url,
  existingUrls = [],
) => {
  if (!url || !isValidUrl(url)) {
    const error = new Error('validation.url');
    error.name = 'ValidationError';

    throw error;
  }

  if (existingUrls.includes(url)) {
    const error = new Error('validation.duplicate');
    error.name = 'ValidationError';

    throw error;
  }

  return true;
};