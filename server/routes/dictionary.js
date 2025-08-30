const express = require('express');
const router = express.Router();

// Словарь терминов плавания
const swimmingDictionary = {
  // Стили плавания
  'вст': {
    term: 'Вольный стиль',
    description: 'Кроль на груди - самый быстрый стиль плавания',
    fullName: 'вольный стиль'
  },
  'вольный': {
    term: 'Вольный стиль',
    description: 'Кроль на груди - самый быстрый стиль плавания',
    fullName: 'вольный стиль'
  },
  'кроль': {
    term: 'Кроль',
    description: 'Техника плавания с попеременными гребками',
    fullName: 'кроль'
  },
  'кмпл': {
    term: 'Комплекс',
    description: 'Все четыре стиля по очереди: баттерфляй, спина, брасс, вольный',
    fullName: 'комплекс'
  },
  'батт': {
    term: 'Баттерфляй',
    description: 'Самый сложный стиль с синхронными движениями рук и ног',
    fullName: 'баттерфляй'
  },
  'брасс': {
    term: 'Брасс',
    description: 'Симметричный стиль с гребком лягушки',
    fullName: 'брасс'
  },
  'спина': {
    term: 'На спине',
    description: 'Кроль на спине',
    fullName: 'на спине'
  },

  // Интенсивность и пульс
  'п': {
    term: 'Пульс',
    description: 'Целевой пульс для данного отрезка',
    fullName: 'пульс'
  },
  'пульс': {
    term: 'Пульс',
    description: 'Целевой пульс для данного отрезка',
    fullName: 'пульс'
  },

  // Отдых
  'отдых': {
    term: 'Отдых',
    description: 'Время отдыха между подходами',
    fullName: 'отдых'
  },
  'сек': {
    term: 'Секунды',
    description: 'Единица времени в секундах',
    fullName: 'секунды'
  },
  'мин': {
    term: 'Минуты',
    description: 'Единица времени в минутах',
    fullName: 'минуты'
  },

  // Инвентарь
  'ласты': {
    term: 'Ласты',
    description: 'Резиновые ласты для тренировки ног',
    fullName: 'ласты'
  },
  'лопатки': {
    term: 'Лопатки',
    description: 'Пластиковые лопатки для тренировки рук',
    fullName: 'лопатки'
  },
  'колобашка': {
    term: 'Колобашка',
    description: 'Поплавок между ног для тренировки рук',
    fullName: 'колобашка'
  },
  'доска': {
    term: 'Доска',
    description: 'Плавательная доска для тренировки ног',
    fullName: 'доска'
  },
  'трубка': {
    term: 'Трубка',
    description: 'Трубка для дыхания при тренировке',
    fullName: 'трубка'
  },
  'пояс': {
    term: 'Пояс',
    description: 'Плавательный пояс для поддержки',
    fullName: 'пояс'
  },

  // Блоки тренировки
  'разминка': {
    term: 'Разминка',
    description: 'Начальная часть тренировки для разогрева',
    fullName: 'разминка'
  },
  'основная': {
    term: 'Основная часть',
    description: 'Основная тренировочная нагрузка',
    fullName: 'основная часть'
  },
  'заминка': {
    term: 'Заминка',
    description: 'Завершающая часть тренировки для восстановления',
    fullName: 'заминка'
  }
};

// Получение всего словаря
router.get('/', (req, res) => {
  res.json({
    success: true,
    dictionary: swimmingDictionary,
    message: 'Словарь терминов получен'
  });
});

// Поиск термина
router.get('/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({
      error: 'Поисковый запрос не предоставлен'
    });
  }

  const searchTerm = q.toLowerCase();
  const results = [];

  for (const [key, value] of Object.entries(swimmingDictionary)) {
    if (key.includes(searchTerm) || 
        value.term.toLowerCase().includes(searchTerm) ||
        value.description.toLowerCase().includes(searchTerm)) {
      results.push({
        key,
        ...value
      });
    }
  }

  res.json({
    success: true,
    results,
    query: searchTerm,
    message: `Найдено ${results.length} терминов`
  });
});

// Получение конкретного термина
router.get('/:term', (req, res) => {
  const { term } = req.params;
  const searchTerm = term.toLowerCase();
  
  const result = swimmingDictionary[searchTerm];
  
  if (!result) {
    return res.status(404).json({
      error: 'Термин не найден',
      term: searchTerm
    });
  }

  res.json({
    success: true,
    term: searchTerm,
    ...result,
    message: 'Термин найден'
  });
});

module.exports = router;
