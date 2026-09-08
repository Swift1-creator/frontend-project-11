import './style.css';

import { state } from './state.js';
import { fetchRss } from './api.js';
import { parseRss } from './parser.js';
import { initView } from './view.js';

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
    state.form.error = 'RSS уже существует';
    return;
  }

  state.form.loading = true;

  try {
    const xml = await fetchRss(normalizedUrl);
    const parsed = parseRss(xml);

    if (!parsed?.feed?.title) {
      const error = new Error('INVALID_RSS');
      error.code = 'INVALID_RSS';
      throw error;
    }

    const feed = {
      id: crypto.randomUUID(),
      url: normalizedUrl,
      title: parsed.feed.title,
      description: parsed.feed.description || '',
    };

    const posts = (parsed.posts || []).map((post) => ({
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
    console.error(error);

    const errorCode = error?.code || error?.message;

    if (['INVALID_RSS', 'invalid-rss'].includes(errorCode)) {
      state.form.error = 'Ресурс не содержит валидный RSS';
    } else {
      state.form.error = 'Ошибка сети';
    }
  } finally {
    state.form.loading = false;
  }
});