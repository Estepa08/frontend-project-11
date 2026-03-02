console.log('🚀 main.js загружен, начинаем выполнение...');
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import i18next from 'i18next';
import * as yup from 'yup';

import Model from './model/index.js';
import View from './view.js';
import Controller from './controller.js';
import resources from './locales/index.js';

console.log('🚀 main.js загружен');

// Инициализация i18next
await i18next.init({
  resources,
  lng: 'ru',
  interpolation: { escapeValue: false },
});

console.log('🌐 i18next инициализирован');

// Настройка локалей для Yup
yup.setLocale({
  mixed: {
    required: () => i18next.t('errors.urlRequired'),
  },
  string: {
    url: () => i18next.t('errors.urlInvalid'),
  },
});

console.log('🔧 Yup настроен');
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM загружен, создаем компоненты...');

  try {
    const model = new Model();
    console.log('📦 Model создана:', model);

    const view = new View();
    console.log('👁️ View создана:', view);

    const controller = new Controller(model, view);
    console.log('🎮 Controller создан:', controller);
    window.debugController = controller;
    console.log('✅ debugController установлен:', window.debugController);

    window.app = controller;
    console.log('✅ window.app установлен:', window.app); // ДОЛЖНО БЫТЬ ВИДНО!

    console.log('✅ RSS Aggregator запущен!');
  } catch (error) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА при инициализации:', error);
  }
});
// document.addEventListener('DOMContentLoaded', () => {
//   console.log('📄 DOM загружен, создаем компоненты...');

//   const model = new Model();
//   console.log('📦 Model создана:', model);

//   const view = new View();
//   console.log('👁️ View создана:', view);

//   const controller = new Controller(model, view);
//   console.log('🎮 Controller создан:', controller);

//   window.app = controller;
//   console.log('✅ window.app установлен:', window.app);

//   console.log('✅ RSS Aggregator запущен!');
// });
