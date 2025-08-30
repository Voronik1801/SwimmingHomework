const express = require('express');
const router = express.Router();

// Получение списка упражнений с GIF-анимациями
router.get('/', (req, res) => {
  const exercises = [
    {
      id: 'freestyle',
      name: 'Вольный стиль',
      emoji: '🏊‍♂️',
      description: 'Классический кроль на груди',
      gifUrl: '/gifs/freestyle.gif',
      tips: [
        'Держите голову в нейтральном положении',
        'Работайте ногами от бедра',
        'Дышите в сторону'
      ]
    },
    {
      id: 'butterfly',
      name: 'Баттерфляй',
      emoji: '🦋',
      description: 'Самый сложный стиль плавания',
      gifUrl: '/gifs/butterfly.gif',
      tips: [
        'Синхронная работа рук и ног',
        'Волнообразные движения тела',
        'Дыхание в момент выхода рук'
      ]
    },
    {
      id: 'breaststroke',
      name: 'Брасс',
      emoji: '🐸',
      description: 'Симметричный стиль с гребком лягушки',
      gifUrl: '/gifs/breaststroke.gif',
      tips: [
        'Симметричные движения рук и ног',
        'Скольжение после толчка ногами',
        'Дыхание в момент гребка'
      ]
    },
    {
      id: 'backstroke',
      name: 'На спине',
      emoji: '🛌',
      description: 'Кроль на спине',
      gifUrl: '/gifs/backstroke.gif',
      tips: [
        'Держите тело прямым',
        'Работайте ногами от бедра',
        'Смотрите вверх'
      ]
    },
    {
      id: 'medley',
      name: 'Комплекс',
      emoji: '🔄',
      description: 'Все четыре стиля по очереди',
      gifUrl: '/gifs/medley.gif',
      tips: [
        'Правильные переходы между стилями',
        'Экономия сил на каждом стиле',
        'Соблюдение правил поворотов'
      ]
    }
  ];

  res.json({
    success: true,
    exercises,
    message: 'Список упражнений получен'
  });
});

// Получение конкретного упражнения
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const exercise = exercises.find(ex => ex.id === id);
  
  if (!exercise) {
    return res.status(404).json({
      error: 'Упражнение не найдено'
    });
  }

  res.json({
    success: true,
    exercise,
    message: 'Упражнение найдено'
  });
});

module.exports = router;
