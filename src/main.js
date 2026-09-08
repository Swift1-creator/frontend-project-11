import './style.css';

import { state } from './state.js';
import { fetchRss } from './api.js';
import { parseRss } from './parser.js';
import { initView } from './view.js';

const INVALID_RSS_MESSAGE = 'Ресурс не содержит валидный RSS';
const DUPLICATE_RSS_MESSAGE = 'RSS уже загружен';
const INVALID_URL_MESSAGE = 'Ссылка должна быть валидным URL';
const NETWORK_ERROR_MESSAGE = 'Ошибка сети';
const SUCCESS_MESSAGE = 'RSS успешно загружен';

const generateId = () => (
  `${Date.now()}-${Math.random().toString(16).slice(2)}`
);

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
    state.form.error = INVALID_URL_MESSAGE;
    return;
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    state.form.error = INVALID_URL_MESSAGE;
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
      id: generateId(),
      url: normalizedUrl,
      title: parsed.feed.title,
      description: parsed.feed.description,
    };

    const posts = parsed.posts.map((post) => ({
      ...post,
      id: generateId(),
      feedId: feed.id,
      seen: false,
    }));

    state.feeds.push(feed);
    state.posts.unshift(...posts);

    input.value = '';
    state.form.status = SUCCESS_MESSAGE;
  } catch (error) {
    console.error('RSS loading error:', error);

    const errorMessage = error instanceof Error ? error.message : '';

    if (errorMessage === 'NETWORK_ERROR') {
      state.form.error = NETWORK_ERROR_MESSAGE;
    } else {
      state.form.error = INVALID_RSS_MESSAGE;
    }
  } finally {
    state.form.loading = false;
  }
});