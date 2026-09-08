const getText = (element, selector) => (
  element.querySelector(selector)?.textContent?.trim() || ''
);

const getTagText = (element, tagName) => {
  const tag = element.getElementsByTagName(tagName)[0];

  return tag?.textContent?.trim() || '';
};

const getDescription = (element) => (
  getText(element, 'description') ||
  getTagText(element, 'content:encoded') ||
  getTagText(element, 'summary') ||
  getTagText(element, 'content')
);

const getAuthor = (element) => (
  getTagText(element, 'author') ||
  getTagText(element, 'dc:creator')
);

const getCategories = (element) => (
  [...element.getElementsByTagName('category')]
    .map((tag) => tag.textContent?.trim())
    .filter(Boolean)
    .join(', ')
);

const getFallbackDescription = ({
  author,
  category,
  pubDate,
}) => {
  const details = [];

  if (author) {
    details.push(`Автор: ${author}`);
  }

  if (category) {
    details.push(`Категория: ${category}`);
  }

  if (pubDate) {
    details.push(`Дата публикации: ${pubDate}`);
  }

  if (details.length === 0) {
    return 'Описание поста отсутствует в RSS-фиде.';
  }

  return [
    'Описание поста отсутствует в RSS-фиде.',
    '',
    ...details,
  ].join('\n');
};

export const parseRss = (xmlText) => {
  if (!xmlText || typeof xmlText !== 'string') {
    throw new Error('Ресурс не содержит валидный RSS');
  }

  const document = new DOMParser().parseFromString(
    xmlText,
    'application/xml',
  );

  const hasParserError = [
    ...document.getElementsByTagName('parsererror'),
  ].some((element) => element.textContent?.trim());

  if (hasParserError) {
    throw new Error('Ресурс не содержит валидный RSS');
  }

  const channel = document.querySelector('channel');

  if (!channel) {
    throw new Error('Ресурс не содержит валидный RSS');
  }

  const title = getText(channel, 'title');

  if (!title) {
    throw new Error('Ресурс не содержит валидный RSS');
  }

  const posts = [...channel.querySelectorAll('item')]
    .map((item) => {
      const author = getAuthor(item);
      const category = getCategories(item);
      const pubDate = getText(item, 'pubDate');
      const description = getDescription(item);

      return {
        title: getText(item, 'title'),
        description: description || getFallbackDescription({
          author,
          category,
          pubDate,
        }),
        link: getText(item, 'link'),
        pubDate,
        author,
        category,
        seen: false,
      };
    })
    .filter((post) => post.title);

  return {
    feed: {
      title,
      description: getDescription(channel) || title,
    },
    posts,
  };
};