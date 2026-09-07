import './style.css';

document.querySelector('#app').innerHTML = `
  <main class="min-h-screen bg-gray-50">
    <section class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="rounded-lg bg-white p-6 shadow-sm sm:p-10">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">
          RSS агрегатор
        </h1>
        <p class="mt-3 text-gray-600">
          Начните читать RSS-ленты в одном месте
        </p>

        <form class="mt-8 flex flex-col gap-3 sm:flex-row" id="rss-form">
          <label class="sr-only" for="rss-url">Ссылка на RSS</label>
          <input
            class="min-w-0 flex-1 rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            id="rss-url"
            name="url"
            type="url"
            placeholder="Ссылка на RSS"
            required
          />
          <button
            class="rounded-md bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            type="submit"
          >
            Добавить
          </button>
        </form>
        <p class="mt-3 hidden text-sm text-red-600" id="form-message"></p>
      </div>
    </section>
  </main>
`;

document.querySelector('#rss-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const message = document.querySelector('#form-message');
  message.textContent = 'RSS-поток будет добавлен на следующем этапе.';
  message.classList.remove('hidden');
});