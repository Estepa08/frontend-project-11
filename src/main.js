import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import Model from './model.js';
import View from './view.js';
import Controller from './controller.js';

// Здесь мы собираем всё вместе
document.addEventListener('DOMContentLoaded', () => {
  // 1. Создаем модель (данные)
  const model = new Model();
  
  // 2. Создаем представление (ссылки на элементы)
  const view = new View();
  
  // 3. Создаем контроллер и связываем всё
  const controller = new Controller(model, view);
  
   console.log('App started with controller:', controller);
  // Всё! Приложение запущено
});