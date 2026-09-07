import { proxy } from 'valtio';
import * as yup from 'yup';

import { startUpdates } from './application.js';
import { fetchRss } from './api.js';
import { parseRss } from './parser.js';
import { initView } from './view.js';
import './style.css';

const state = proxy({
  feeds: [],
  posts: [],
  form: {
    value: '',
    error: null,
    status: '',
    loading: false,
  },
});

const urlSchema = yup
  .string()
  .trim()
  .url('Введите корректную ссылку')
  .required('Введите ссылку на RSS-фид');

const { form, input } = initView(state);

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const url = input.value.trim();

  state.form.error = null;
  state.form.status = 'Проверка ссылки...';
  state.form.loading = true;

  try {
    await urlSchema.validate(url);

    if (state.feeds.some((feed) => feed.url === url)) {
      throw new Error('Этот RSS-фид уже добавлен');
    }

    state.form.status = 'Загрузка RSS...';

    const xml = await fetchRss(url);
    const result = parseRss(xml);
    const feedId = crypto.randomUUID();

    state.feeds.push({
      id: feedId,
      url,
      title: result.feed.title,
      description: result.feed.description,
    });

    result.posts.forEach((post) => {
      state.posts.push({
        id: crypto.randomUUID(),
        feedId,
        title: post.title,
        description: post.description,
        link: post.link,
        pubDate: post.pubDate,
        seen: false,
      });
    });

    state.form.status = `Загружено постов: ${result.posts.length}`;
    input.value = '';
  } catch (error) {
    console.error('Ошибка добавления RSS:', error);

    if (error.name === 'ValidationError') {
      state.form.error = error.message;
    } else if (error.message.includes('уже добавлен')) {
      state.form.error = error.message;
    } else if (
      error.message.includes('время ожидания') ||
      error.message.includes('Ошибка загрузки RSS')
    ) {
      state.form.error = 'Не удалось загрузить RSS-фид';
    } else if (error.message.includes('пустой ответ')) {
      state.form.error = 'Прокси вернул пустой ответ';
    } else if (
      error.message.includes('некорректный XML') ||
      error.message.includes('отсутствует channel') ||
      error.message.includes('отсутствует заголовок')
    ) {
      state.form.error = 'Ответ не является корректным RSS-фидом';
    } else {
      state.form.error = error.message || 'Неизвестная ошибка';
    }

    state.form.status = '';
  } finally {
    state.form.loading = false;
  }
});

startUpdates(state, fetchRss, parseRss);