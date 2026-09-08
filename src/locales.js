import i18next from 'i18next';

const resources = {
  ru: {
    translation: {
      app: {
        title: 'RSS агрегатор',
        urlLabel: 'Ссылка RSS',
        urlPlaceholder: 'https://lenta.ru/rss/news',
        addButton: 'Добавить',
        feeds: 'Фиды',
        posts: 'Посты',
        loading: 'Загрузка...',
      },

      validation: {
        required: 'Не должно быть пустым',
        url: 'Ссылка должна быть валидным URL',
        duplicate: 'Такой RSS уже добавлен',
      },

      errors: {
        network: 'Ошибка сети',
        parseError: 'Ресурс не содержит валидный RSS',
      },

      status: {
        rssLoaded: 'RSS успешно загружен',
      },

      common: {
        close: 'Закрыть',
        readMore: 'Читать полностью',
        preview: 'Просмотр',
        noFeeds: 'Пока нет добавленных фидов',
        noPosts: 'Пока нет постов',
      },
    },
  },
};

await i18next.init({
  lng: 'ru',
  fallbackLng: 'ru',
  resources,
});

export default i18next;