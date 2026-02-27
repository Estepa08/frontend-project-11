import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import i18next from 'i18next';
import * as yup from 'yup';

import Model from './model/index.js';
import View from './view.js';
import Controller from './controller.js';
import resources from './locales/index.js';

// Инициализация i18next
await i18next.init({
  resources,
  lng: 'ru',
  interpolation: { escapeValue: false },
});

// Настройка локалей для Yup
yup.setLocale({
  mixed: {
    required: () => i18next.t('errors.urlRequired'),
  },
  string: {
    url: () => i18next.t('errors.urlInvalid'),
  },
});

// Здесь мы собираем всё вместе
document.addEventListener('DOMContentLoaded', () => {
  const model = new Model();
  const view = new View();
  const controller = new Controller(model, view);

  console.log('✅ RSS Aggregator запущен!');
});
