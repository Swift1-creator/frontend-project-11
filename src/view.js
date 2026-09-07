import { subscribe } from 'valtio';

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const getPostDescription = (post) => (
  post.description ||
  post.content ||
  post.summary ||
  'Описание отсутствует'
);

export const initView = (state) => {
  const app = document.querySelector('#app');

  app.innerHTML = `
    <main id="app-content">
      <h1>RSS агрегатор</h1>

      <form id="rss-form">
        <input
          id="rss-url"
          type="url"
          placeholder="https://lenta.ru/rss/news"
          value="https://lenta.ru/rss/news"
          required
        />
        <button id="submit-button" type="submit">
          Добавить
        </button>
      </form>

      <p id="form-error" class="error"></p>
      <p id="status"></p>

      <section>
        <h2>Фиды</h2>
        <div id="feeds"></div>
      </section>

      <section>
        <h2>Посты</h2>
        <ul id="posts"></ul>
      </section>
    </main>
  `;

  const form = document.querySelector('#rss-form');
  const input = document.querySelector('#rss-url');
  const submitButton = document.querySelector('#submit-button');
  const errorElement = document.querySelector('#form-error');
  const statusElement = document.querySelector('#status');
  const feedsElement = document.querySelector('#feeds');
  const postsElement = document.querySelector('#posts');

  const closeModal = () => {
    const modal = document.querySelector('#post-preview-modal');

    if (modal) {
      modal.close();
      modal.remove();
    }
  };

  const showPostPreview = (post) => {
    post.seen = true;
    closeModal();

    const modal = document.createElement('dialog');

    modal.id = 'post-preview-modal';
    modal.innerHTML = `
      <div data-test="modal-body">
        <h2 class="modal-title">
          ${escapeHtml(post.title)}
        </h2>

        <p class="modal-description">
          ${escapeHtml(getPostDescription(post))}
        </p>

        <div class="modal-actions">
          <a
            class="full-link"
            href="${escapeHtml(post.link)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Читать полностью
          </a>

          <button class="close-modal" type="button">
            Закрыть
          </button>
        </div>
      </div>
    `;

    document.body.append(modal);

    modal
      .querySelector('.close-modal')
      .addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    modal.addEventListener('cancel', closeModal);
    modal.showModal();
  };

  const render = () => {
    errorElement.textContent = state.form.error || '';
    statusElement.textContent = state.form.status || '';
    submitButton.disabled = state.form.loading;

    feedsElement.innerHTML = state.feeds.length === 0
      ? '<p>Пока нет добавленных фидов</p>'
      : state.feeds.map((feed) => `
          <article>
            <h3>${escapeHtml(feed.title)}</h3>
            <p>${escapeHtml(feed.description)}</p>
          </article>
        `).join('');

    if (state.posts.length === 0) {
      postsElement.innerHTML = '<li>Пока нет постов</li>';
      return;
    }

    postsElement.innerHTML = state.posts.map((post, index) => {
      const seen = post.seen === true;

      return `
        <li
          class="${seen ? 'post-seen' : 'post-new'}"
          data-seen="${seen}"
        >
          <div class="post-header">
            <a
              class="post-link"
              href="${escapeHtml(post.link)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${escapeHtml(post.title)}
            </a>

            <button
              class="preview-button"
              type="button"
              data-preview-index="${index}"
            >
              Просмотр
            </button>
          </div>

          ${
            post.pubDate
              ? `<span class="post-date">${escapeHtml(post.pubDate)}</span>`
              : ''
          }
        </li>
      `;
    }).join('');

    postsElement
      .querySelectorAll('[data-preview-index]')
      .forEach((button) => {
        button.addEventListener('click', () => {
          const post = state.posts[
            Number(button.dataset.previewIndex)
          ];

          if (post) {
            showPostPreview(post);
          }
        });
      });
  };

  subscribe(state, render);
  render();

  return { form, input };
};