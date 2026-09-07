import './style.css';
import { state } from './state.js';
import { validateUrl } from './validation.js';
import { initView } from './view.js';

document.querySelector('#app').innerHTML = `
  <main class="min-h-screen bg-gray-50">
    <section class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="rounded-lg bg-white p-6 shadow-sm sm:p-10">
        <h1 class="text-3xl font-bold text-gray-900">RSS агрегатор</h1>
        <form class="mt-8" id="rss-form" novalidate>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div class="min-w-0 flex-1">
              <label class="mb-1 block text-sm font-medium text-gray-700" for="rss-url">
                Ссылка RSS
              </label>
              <input
                class="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                id="rss-url"
                name="url"
                type="url"
                placeholder="Ссылка RSS"
                autocomplete="url"
              />
              <p class="mt-1 hidden text-sm text-red-600" id="rss-error"></p>
            </div>
            <button
              class="rounded-md bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              type="submit"
            >
              Добавить
            </button>
          </div>
        </form>
      </div>
    </section>
  </main>
`;

const { input } = initView();

document.querySelector('#rss-form').addEventListener('rss:submit', (event) => {
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
});