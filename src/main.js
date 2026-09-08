import './style.css';

import { state } from './state.js';
import { fetchRss } from './api.js';
import { parseRss } from './parser.js';
import { initView } from './view.js';

const INVALID_RSS_MESSAGE = 'Ресурс не содержит валидный RSS';
const DUPLICATE_RSS_MESSAGE = 'RSS уже загружен';

const { form, input } = initView(state);

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const url = input.value.trim();

  state.form.error = '';
  state.form.status = '';

  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch {
    state.form.error = 'Ссылка должна быть валидным URL';
    return;
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    state.form.error = 'Ссылка должна быть валидным URL';
    return;
  }

  const normalizedUrl = parsedUrl.href;

  if (state.feeds.some((feed) => feed.url === normalizedUrl)) {
    state.form.error = DUPLICATE_RSS_MESSAGE;
    return;
  }

  state.form.loading = true;

  try {
    const xml = await fetchRss(normalizedUrl);
    const parsed = parseRss(xml);

    const feed = {
      id: crypto.randomUUID(),
      url: normalizedUrl,
      title: parsed.feed.title,
      description: parsed.feed.description,
    };

    const posts = parsed.posts.map((post) => ({
      ...post,
      id: crypto.randomUUID(),
      feedId: feed.id,
      seen: false,
    }));

    state.feeds.push(feed);
    state.posts.unshift(...posts);

    input.value = '';
    state.form.status = 'RSS успешно загружен';
  } catch (error) {
    console.error('RSS loading error:', error);

    if (
      error?.message === 'INVALID_RSS' ||
      error?.message === 'invalid-rss' ||
      error?.message === INVALID_RSS_MESSAGE
    ) {
      state.form.error = INVALID_RSS_MESSAGE;
    } else {
      state.form.error = 'Ошибка сети';
    }
  } finally {
    state.form.loading = false;
  }
});