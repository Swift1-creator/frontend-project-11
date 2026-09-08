const UPDATE_INTERVAL = 5000;

const getPostId = (post) => post.link || post.title;

const addNewPosts = (state, feed, posts = []) => {
  const existingIds = new Set(
    state.posts
      .filter((post) => post.feedId === feed.id)
      .map(getPostId),
  );

  const addedIds = new Set();
  const newPosts = [];

  posts.forEach((post) => {
    const postId = getPostId(post);

    if (
      !postId ||
      existingIds.has(postId) ||
      addedIds.has(postId)
    ) {
      return;
    }

    addedIds.add(postId);

    newPosts.push({
      id: crypto.randomUUID(),
      feedId: feed.id,
      title: post.title || 'Без заголовка',
      description: post.description || '',
      link: post.link || '',
      pubDate: post.pubDate || '',
      author: post.author || '',
      category: post.category || '',
      seen: false,
    });
  });

  if (newPosts.length > 0) {
    state.posts.unshift(...newPosts);
  }
};

export const startUpdates = (state, fetchRss, parseRss) => {
  let checking = false;
  let stopped = false;
  let timeoutId = null;

  const scheduleNextCheck = () => {
    if (!stopped) {
      timeoutId = setTimeout(checkUpdates, UPDATE_INTERVAL);
    }
  };

  const checkUpdates = async () => {
    if (stopped || checking) {
      return;
    }

    checking = true;

    try {
      const feeds = [...state.feeds];

      await Promise.all(
        feeds.map(async (feed) => {
          try {
            const xml = await fetchRss(feed.url);
            const result = parseRss(xml);

            addNewPosts(state, feed, result?.posts || []);
          } catch (error) {
            console.error(
              `Ошибка обновления фида "${feed.title}":`,
              error,
            );
          }
        }),
      );
    } finally {
      checking = false;
      scheduleNextCheck();
    }
  };

  checkUpdates();

  return () => {
    stopped = true;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
};