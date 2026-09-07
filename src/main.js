import { proxy } from 'valtio';
import * as yup from 'yup';

import { startUpdates } from './application.js';
import './style.css';
import { fetchRss } from './api.js';
import { parseRss } from './parser.js';
import { initView } from './view.js';

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

startUpdates(state, fetchRss, parseRss);

const urlSchema = yup
  .string()
  .trim()
  .url('Введите корректную ссылку')
  .required('Введите ссылку на RSS-фид');

const { form, input } = initView(state);

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  console.log('Кнопка нажата');

  const url = input.value.trim();

  console.log('URL:', url);

  state.form.error = null;
  state.form.status = 'Проверка ссылки...';
  state.form.loading = true;

  try {
    await urlSchema.validate(url);

    console.log('Ссылка прошла проверку');

    state.form.status = 'Загрузка RSS...';

    const xmlText = await fetchRss(url);

    console.log('Ответ получен:', xmlText);

    const result = parseRss(xmlText);

    console.log('Результат парсинга:', result);

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
      });
    });

    console.log('Фиды:', state.feeds);
    console.log('Посты:', state.posts);

    state.form.status =
      `Загружено постов: ${result.posts.length}`;

    input.value = '';
  } catch (error) {
    console.error('Полная ошибка:', error);

    if (error.name === 'ValidationError') {
      state.form.error = error.message;
    } else if (error.message === 'networkError') {
      state.form.error =
        'Не удалось подключиться к прокси';
    } else if (error.message === 'emptyResponse') {
      state.form.error =
        'Прокси вернул пустой ответ';
    } else if (error.message === 'parseError') {
      state.form.error =
        'Ответ не является корректным RSS-фидом';
    } else {
      state.form.error =
        error.message || 'Неизвестная ошибка';
    }

    state.form.status = '';
  } finally {
    state.form.loading = false;
  }
});