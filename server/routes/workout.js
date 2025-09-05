const express = require('express');
const router = express.Router();

// Импортируем исправленный парсер из клиента
const { parseWorkoutText } = require('../../client/src/utils/workoutParser.js');

// Парсинг тренировки
router.post('/parse', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Текст тренировки не предоставлен' 
      });
    }

    if (text.length < 10) {
      return res.status(400).json({ 
        error: 'Текст тренировки слишком короткий' 
      });
    }

    // Используем исправленный парсер
    const parsedWorkout = await parseWorkoutText(text);
    
    res.json({
      success: true,
      workout: parsedWorkout,
      message: 'Тренировка успешно распознана'
    });

  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ 
      error: 'Ошибка парсинга',
      message: 'Не удалось распознать тренировку'
    });
  }
});

module.exports = router;
