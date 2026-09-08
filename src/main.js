import './style.css';

import { state } from './state.js';
import { validateUrl } from './validation.js';
import { fetchRss } from './api.js';
import { parseRss } from './parser.js';
import { initView } from './view.js';
import { startUpdates } from './application.js';

const { form, input } = initView(state);

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const url = input.value.trim();

  state.form.error = '';
  state.form.status = '';
  state.form.loading = true;

  try {
    await validateUrl(
      url,
      state.feeds.map((feed) => feed.url),
    );

    const xml = await fetchRss(url);
    const parsed = parseRss(xml);

    if (!parsed.feed || !parsed.feed.title) {
      throw new Error('invalid-rss');
    }

    const feed = {
      id: crypto.randomUUID(),
      url,
      title: parsed.feed.title,
      description: parsed.feed.description || '',
    };

    state.feeds.push(feed);

    const posts = parsed.posts.map((post) => ({
      ...post,
      id: crypto.randomUUID(),
      feedId: feed.id,
      seen: false,
    }));

    state.posts.unshift(...posts);

    input.value = '';
    state.form.status = 'RSS успешно загружен';
  } catch (error) {
    console.error(error);

    if (error.name === 'ValidationError') {
      if (error.message === 'validation.duplicate') {
        state.form.error = 'RSS уже существует';
      } else {
        state.form.error =
          'Ссылка должна быть валидным URL';
      }

      return;
    }

    if (
      error.message === 'invalid-rss' ||
      error.message.includes('RSS') ||
      error.message.includes('channel')
    ) {
      state.form.error =
        'Ресурс не содержит валидный RSS';

      return;
    }

    state.form.error = 'Ошибка сети';
  } finally {
    state.form.loading = false;
  }
});

startUpdates(state, fetchRss, parseRss);