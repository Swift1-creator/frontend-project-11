import { subscribe } from 'valtio';

const escapeHtml = (value = '') => (
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
);

const getSafeUrl = (value = '') => {
  try {
    const url = new URL(value, window.location.href);

    if (!['http:', 'https:'].includes(url.protocol)) {
      return '#';
    }

    return url.href;
  } catch {
    return '#';
  }
};

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

      <form id="rss-form" novalidate>
        <label for="rss-url">
          Ссылка на RSS
        </label>

        <input
          id="rss-url"
          name="url"
          type="text"
          placeholder="Введите ссылку"
          autocomplete="off"
        />

        <button
          id="submit-button"
          type="submit"
        >
          Добавить
        </button>
      </form>

      <p
        id="form-error"
        class="error"
        role="alert"
        data-test="feedback-error"
      ></p>

      <p
        id="status"
        class="status"
        role="status"
        data-test="feedback-status"
      ></p>

      <section id="feeds-section">
        <h2>Фиды</h2>
        <div id="feeds"></div>
      </section>

      <section id="posts-section">
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

    if (!modal) {
      return;
    }

    if (typeof modal.close === 'function') {
      modal.close();
    }

    modal.remove();
  };

  const showPostPreview = (post) => {
    post.seen = true;

    closeModal();

    const modal = document.createElement('dialog');

    modal.id = 'post-preview-modal';

    modal.innerHTML = `
      <div data-test="modal-body">
        <h2>
          ${escapeHtml(post.title)}
        </h2>

        <p>
          ${escapeHtml(getPostDescription(post))}
        </p>

        <div class="modal-actions">
          <button
            class="close-modal"
            type="button"
          >
            Закрыть
          </button>

          <a
            class="full-link"
            href="${escapeHtml(getSafeUrl(post.link))}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Читать полностью
          </a>
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

    if (typeof modal.showModal === 'function') {
      modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }
  };

  const renderFeeds = () => {
    feedsElement.innerHTML = state.feeds
      .map(
        (feed) => `
          <article
            class="feed"
            data-test="feed"
          >
            <h2
              data-test="feed-title"
            >
              ${escapeHtml(feed.title)}
            </h2>

            <p
              data-test="feed-description"
            >
              ${escapeHtml(feed.description || '')}
            </p>
          </article>
        `,
      )
      .join('');
  };

  const renderPosts = () => {
    postsElement.innerHTML = state.posts
      .map(
        (post, index) => `
          <li
            class="post"
            data-test="post"
          >
            <div class="post-header">
              <a
                class="post-link"
                href="${escapeHtml(getSafeUrl(post.link))}"
                target="_blank"
                rel="noopener noreferrer"
                data-test="post-link"
                data-seen="${post.seen === true ? 'true' : 'false'}"
              >
                ${escapeHtml(post.title)}
              </a>

              <button
                class="preview-button"
                type="button"
                data-test="preview-button"
                data-preview-index="${index}"
              >
                Просмотр
              </button>
            </div>

            ${
              post.pubDate
                ? `
                  <time class="post-date">
                    ${escapeHtml(post.pubDate)}
                  </time>
                `
                : ''
            }
          </li>
        `,
      )
      .join('');

    postsElement
      .querySelectorAll('[data-preview-index]')
      .forEach((button) => {
        button.addEventListener('click', () => {
          const index = Number(button.dataset.previewIndex);
          const post = state.posts[index];

          if (post) {
            showPostPreview(post);
          }
        });
      });
  };

  const render = () => {
    errorElement.textContent = state.form.error || '';
    statusElement.textContent = state.form.status || '';

    errorElement.hidden = !state.form.error;
    statusElement.hidden = !state.form.status;

    submitButton.disabled = state.form.loading;

    renderFeeds();
    renderPosts();
  };

  subscribe(state, render);

  render();

  return {
    form,
    input,
  };
};