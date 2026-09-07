const UPDATE_INTERVAL = 5000;

const getPostId = (post) => post.link || post.title;

const addNewPosts = (state, feed, posts) => {
  const existingPostIds = new Set(
    state.posts
      .filter((post) => post.feedId === feed.id)
      .map(getPostId),
  );

  const newPosts = posts
    .filter((post) => !existingPostIds.has(getPostId(post)))
    .map((post) => ({
      id: crypto.randomUUID(),
      feedId: feed.id,
      title: post.title,
      description: post.description,
      link: post.link,
      pubDate: post.pubDate,
    }));

  console.log(
    `Фид "${feed.title}": новых постов — ${newPosts.length}`,
  );

  if (newPosts.length > 0) {
    state.posts.unshift(...newPosts);
  }
};

export const startUpdates = (state, fetchRss, parseRss) => {
  let isChecking = false;

  const checkUpdates = async () => {
    console.log(
      'Автоматическая проверка RSS:',
      new Date().toLocaleTimeString(),
    );

    if (isChecking) {
      console.log(
        'Предыдущая проверка ещё выполняется',
      );

      setTimeout(checkUpdates, UPDATE_INTERVAL);
      return;
    }

    isChecking = true;

    try {
      const feeds = [...state.feeds];

      console.log(
        'Количество фидов:',
        feeds.length,
      );

      await Promise.all(
        feeds.map(async (feed) => {
          console.log(
            'Проверяется фид:',
            feed.title,
            new Date().toLocaleTimeString(),
          );

          try {
            const xmlText = await fetchRss(feed.url);
            const result = parseRss(xmlText);

            addNewPosts(state, feed, result.posts);
          } catch (error) {
            console.error(
              `Ошибка обновления фида "${feed.title}":`,
              error,
            );
          }
        }),
      );
    } finally {
      isChecking = false;

      console.log(
        'Проверка завершена. Следующая через 5 секунд.',
      );

      setTimeout(checkUpdates, UPDATE_INTERVAL);
    }
  };

  checkUpdates();
};