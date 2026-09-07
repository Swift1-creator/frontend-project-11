import i18next from 'i18next';

const resources = {
  ru: {
    translation: {
      app: {
        title: 'RSS агрегатор',
        urlLabel: 'Ссылка RSS',
        urlPlaceholder: 'Ссылка RSS',
        addButton: 'Добавить',
        feeds: 'Фиды',
        posts: 'Посты',
        loading: 'Загрузка...',
      },

      validation: {
        required: 'Не должно быть пустым',
        url: 'Ссылка должна быть валидным URL',
        duplicate: 'Ссылка должна быть валидным URL',
      },

      errors: {
        network: 'Ошибка сети',
        parseError: 'Ресурс не содержит корректный RSS',
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