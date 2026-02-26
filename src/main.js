import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import i18next from 'i18next';
import * as yup from 'yup';

import Model from './model.js';
import View from './view.js';
import Controller from './controller.js';
import resources from './locales/index.js';

// Инициализация i18next
await i18next.init({
  resources,
  lng: 'ru', // явно указываем русский язык
  interpolation: {
    escapeValue: false, // не экранировать HTML
  },
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
  // 1. Создаем модель (данные)
  const model = new Model();

  // 2. Создаем представление (ссылки на элементы)
  const view = new View();

  // 3. Создаем контроллер и связываем всё
  const controller = new Controller(model, view);
});
