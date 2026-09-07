import * as yup from 'yup';
import { setLocale } from 'yup';

setLocale({
  mixed: {
    required: 'validation.required',
  },
  string: {
    url: 'validation.url',
  },
});

const urlSchema = yup
  .string()
  .required()
  .url()
  .test(
    'unique-url',
    'validation.duplicate',
    (value, context) => {
      const { feeds } = context.options.context;

      return !feeds.includes(value);
    },
  );

export const validateUrl = (url, feeds) => urlSchema.validate(url, {
  context: { feeds },
  abortEarly: true,
});
src/view.js
import { subscribe } from 'valtio/vanilla';
import i18next from './locales.js';
import { state } from './state.js';

const renderError = (input, errorElement, error) => {
  input.classList.toggle('border-red-500', Boolean(error));
  input.setAttribute('aria-invalid', String(Boolean(error)));

  errorElement.textContent = error
    ? i18next.t(error)
    : '';

  errorElement.classList.toggle('hidden', !error);
};

export const initView = () => {
  const form = document.querySelector('#rss-form');
  const input = document.querySelector('#rss-url');
  const errorElement = document.querySelector('#rss-error');

  const render = () => {
    input.value = state.form.value;
    renderError(input, errorElement, state.form.error);
  };

  subscribe(state.form, render);

  render();

  input.addEventListener('input', (event) => {
    state.form.value = event.target.value;
    state.form.error = null;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    form.dispatchEvent(new CustomEvent('rss:submit', {
      bubbles: true,
      detail: input.value,
    }));
  });

  return { input };
};
src/main.js
import './style.css';
import i18next from './locales.js';
import { state } from './state.js';
import { validateUrl } from './validation.js';
import { initView } from './view.js';

const t = i18next.t.bind(i18next);

document.querySelector('#app').innerHTML = `
  <main class="min-h-screen bg-gray-50">
    <section class="mx-auto max-w-4xl px-4 py-12">
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <h1 class="text-3xl font-bold text-gray-900">
          ${t('app.title')}
        </h1>

        <form class="mt-8" id="rss-form" novalidate>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div class="min-w-0 flex-1">
              <label
                class="mb-1 block text-sm font-medium text-gray-700"
                for="rss-url"
              >
                ${t('app.urlLabel')}
              </label>

              <input
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                id="rss-url"
                name="url"
                type="url"
                placeholder="${t('app.urlPlaceholder')}"
                autocomplete="url"
              />

              <p
                class="mt-1 hidden text-sm text-red-600"
                id="rss-error"
              ></p>
            </div>

            <button
              class="rounded-md bg-indigo-600 px-5 py-2 font-medium text-white"
              type="submit"
            >
              ${t('app.addButton')}
            </button>
          </div>
        </form>
      </div>
    </section>
  </main>
`;

const { input } = initView();

document.querySelector('#rss-form').addEventListener(
  'rss:submit',
  (event) => {
    validateUrl(event.detail, state.feeds)
      .then((url) => {
        state.feeds.push(url);
        state.form.value = '';
        state.form.error = null;
        input.focus();
      })
      .catch((error) => {
        state.form.error = error.message;
      });
  },
);
Установите библиотеку:

npm.cmd install i18next
После этого запустите:

npm.cmd run dev




