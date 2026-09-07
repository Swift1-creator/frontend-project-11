const getText = (element, selector) => {
  return element.querySelector(selector)?.textContent?.trim() || '';
};

export const parseRss = (xmlText) => {
  console.log('Тип ответа:', typeof xmlText);
  console.log('Размер RSS:', xmlText?.length);
  console.log('Начало RSS:', xmlText?.slice(0, 300));

  if (!xmlText || typeof xmlText !== 'string') {
    throw new Error('RSS-ответ не является строкой');
  }

  const parser = new DOMParser();

  const xmlDocument = parser.parseFromString(
    xmlText,
    'application/xml',
  );

  console.log(
    'Корневой элемент:',
    xmlDocument.documentElement?.nodeName,
  );

  const parserError = xmlDocument.querySelector('parsererror');

  if (parserError) {
    console.error('Ошибка XML:', parserError.textContent);
    throw new Error('RSS содержит некорректный XML');
  }

  const channel = xmlDocument.querySelector('channel');

  if (!channel) {
    console.error(
      'Элемент channel не найден. Корень:',
      xmlDocument.documentElement?.outerHTML?.slice(0, 500),
    );

    throw new Error('В RSS отсутствует channel');
  }

  const title = getText(channel, 'title');

  if (!title) {
    throw new Error('В RSS отсутствует заголовок channel');
  }

  const description =
    getText(channel, 'description') || title;

  const posts = [...channel.querySelectorAll('item')]
    .map((item) => ({
      title: getText(item, 'title'),
      description: getText(item, 'description'),
      link: getText(item, 'link'),
      pubDate: getText(item, 'pubDate'),
    }))
    .filter((post) => post.title);

  console.log('RSS успешно разобран:', {
    feedTitle: title,
    postsCount: posts.length,
  });

  return {
    feed: {
      title,
      description,
    },
    posts,
  };
};