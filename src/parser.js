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
    throw new Error('RSS-ответ не является строкой');
  }

  const document = new DOMParser().parseFromString(
    xmlText,
    'application/xml',
  );

  if (document.querySelector('parsererror')) {
    throw new Error('RSS содержит некорректный XML');
  }

  const channel = document.querySelector('channel');

  if (!channel) {
    throw new Error('В RSS отсутствует channel');
  }

  const title = getText(channel, 'title');

  if (!title) {
    throw new Error('В RSS отсутствует заголовок channel');
  }

  const posts = [...channel.querySelectorAll('item')]
    .map((item) => {
      const author = getText(item, 'author');
      const category = getText(item, 'category');
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