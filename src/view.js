import { subscribe } from 'valtio';

const escapeHtml = (value = '') => {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

export const initView = (state) => {
  const app = document.querySelector('#app');

  if (!app) {
    throw new Error('Элемент #app не найден');
  }

  app.innerHTML = `
    <main class="container">
      <div class="card">
        <h1 class="title">
          RSS агрегатор
        </h1>

        <form
          id="rss-form"
          class="form"
        >
          <div class="form-group">
            <label
              class="label"
              for="rss-url"
            >
              Ссылка RSS
            </label>

            <input
              id="rss-url"
              class="input"
              type="url"
              placeholder="https://lenta.ru/rss/news"
              value="https://lenta.ru/rss/news"
              required
            />

            <p
              id="form-error"
              class="error"
            ></p>
          </div>

          <button
            id="submit-button"
            class="button"
            type="submit"
          >
            Добавить
          </button>
        </form>

        <p
          id="status"
          class="status"
        ></p>

        <section class="section">
          <h2 class="section-title">
            Фиды
          </h2>

          <div id="feeds"></div>
        </section>

        <section class="section">
          <h2 class="section-title">
            Посты
          </h2>

          <ul
            id="posts"
            class="posts"
          ></ul>
        </section>
      </div>
    </main>
  `;

  const form = document.querySelector('#rss-form');
  const input = document.querySelector('#rss-url');
  const submitButton = document.querySelector('#submit-button');
  const errorElement = document.querySelector('#form-error');
  const statusElement = document.querySelector('#status');
  const feedsElement = document.querySelector('#feeds');
  const postsElement = document.querySelector('#posts');

  const renderData = () => {
    errorElement.textContent = state.form.error || '';
    statusElement.textContent = state.form.status || '';

    submitButton.disabled = state.form.loading;

    if (state.feeds.length === 0) {
      feedsElement.innerHTML = `
        <p class="empty">
          Пока нет добавленных фидов
        </p>
      `;
    } else {
      feedsElement.innerHTML = state.feeds
        .map(
          (feed) => `
            <article class="feed">
              <h3 class="feed-title">
                ${escapeHtml(feed.title)}
              </h3>

              <p class="feed-description">
                ${escapeHtml(feed.description)}
              </p>
            </article>
          `,
        )
        .join('');
    }

    if (state.posts.length === 0) {
      postsElement.innerHTML = `
        <li class="empty">
          Пока нет постов
        </li>
      `;
    } else {
      postsElement.innerHTML = state.posts
        .map(
          (post) => `
            <li class="post">
              <a
                class="post-link"
                href="${escapeHtml(post.link)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ${escapeHtml(post.title)}
              </a>

              ${
                post.pubDate
                  ? `
                    <div class="post-date">
                      ${escapeHtml(post.pubDate)}
                    </div>
                  `
                  : ''
              }
            </li>
          `,
        )
        .join('');
    }
  };

  subscribe(state, renderData);

  renderData();

  return {
    form,
    input,
  };
};