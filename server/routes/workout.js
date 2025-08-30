const express = require('express');
const router = express.Router();

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

    // Используем улучшенный парсер
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

// Функция для извлечения инвентаря из описания упражнения
const extractEquipmentFromDescription = (description) => {
  const equipmentPattern = /(ласты|лопатки|колобашка|доска|трубка|пояс|резина|кистевые\s+лопатки)/gi;
  const matches = description.match(equipmentPattern);
  return matches ? matches.map(match => match.toLowerCase()) : [];
};

// Улучшенный парсер для демонстрации
const parseWorkoutText = async (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  
  const patterns = {
    // Номер тренировки
    workoutNumber: /^(\d+)[яя]\s*тренировка|домашка/i,
    
    // Объем тренировки
    volume: /(\d+)\s*м/i,
    
    // Интенсивность
    intensity: /[🟡🟢🔴]/g,
    
    // Инвентарь - исправленный паттерн
    equipment: /(ласты|лопатки|колобашка|доска|трубка|пояс|резина|кистевые\s+лопатки)/gi,
    
    // Сложные упражнения с частями
    complexExercise: /(\d+)\*(\d+)\s*([^0-9]+)/i,
    
    // Простые упражнения
    simpleExercise: /(\d+)\s*([а-яё]+)/i,
    
    // Отдых - исправленный паттерн (не путать с пульсом)
    rest: /^отдых\s*(\d+)(?:-(\d+))?\s*(сек|мин)?/i,
    
    // Блоки тренировки
    block: /^(разминка|основная\s+часть|техническая\s+часть|заминка|свободное\s+плавание|основная|заминка)$/i,
    
    // Пульс - исправленный паттерн
    pulse: /^п\s*(\d+)-(\d+)/i,
    
    // Режим
    mode: /R\s*(\d+\.\d+)/i,
    
    // Упражнение с повторами
    repeatExercise: /(\d+)[×x]\s*(\d+)\s+([а-яё]+(?:\s+с\s+[а-яё]+)?)/i
  };

  // Расширенный словарь стилей плавания
  const styleMap = {
    'вст': 'freestyle',
    'вольный': 'freestyle',
    'кроль': 'freestyle',
    'кмпл': 'IM',
    'кмпс': 'IM',
    'комплекс': 'IM',
    'батт': 'butterfly',
    'баттерфляй': 'butterfly',
    'брасс': 'breaststroke',
    'спина': 'backstroke',
    'на спине': 'backstroke',
    'дельфин': 'butterfly',
    'карабас': 'карабас' // специальная техника
  };

  // Словарь техник
  const techniqueMap = {
    'дирижёр': 'дирижёр',
    'супермен': 'супермен',
    'переменка': 'переменка',
    'переменный': 'переменный',
    'стрелочка': 'стрелочка',
    '2х уд': '2х уд',
    '3х уд': '3х уд',
    'двойки': 'двойки',
    'четверки': 'четверки',
    'шестерки': 'шестерки'
  };

  // Словарь типов блоков
  const blockTypeMap = {
    'разминка': 'warmup',
    'основная часть': 'main',
    'основная': 'main',
    'техническая часть': 'technical',
    'заминка': 'cooldown',
    'свободное плавание': 'freestyle'
  };

  let currentBlock = { type: 'warmup', exercises: [] };
  const blocks = [];
  let equipment = new Set();
  let intensity = '🟡';
  let volume = 0;
  let workoutNumber = null;
  let workoutTitle = 'Тренировка';
  let currentEquipment = []; // Инвентарь для текущего упражнения

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (!trimmedLine) continue;

    // Проверяем номер тренировки
    const workoutMatch = trimmedLine.match(patterns.workoutNumber);
    if (workoutMatch) {
      workoutNumber = parseInt(workoutMatch[1]);
      workoutTitle = `${workoutMatch[1]}я тренировка`;
      continue;
    }

    // Проверяем объем
    const volumeMatch = trimmedLine.match(patterns.volume);
    if (volumeMatch) {
      volume = parseInt(volumeMatch[1]);
      continue;
    }

    // Проверяем на блок
    const blockMatch = trimmedLine.match(patterns.block);
    if (blockMatch) {
      if (currentBlock.exercises.length > 0) {
        blocks.push(currentBlock);
      }
      currentBlock = {
        type: blockTypeMap[blockMatch[1].toLowerCase()] || 'main',
        exercises: []
      };
      currentEquipment = []; // Сбрасываем инвентарь для нового блока
      continue;
    }

    // Проверяем на пульс (должно быть ПЕРЕД упражнениями)
    const pulseMatch = trimmedLine.match(patterns.pulse);
    if (pulseMatch) {
      // Добавляем пульс к последнему упражнению
      if (currentBlock.exercises.length > 0) {
        const lastExercise = currentBlock.exercises[currentBlock.exercises.length - 1];
        lastExercise.pulse = `П${pulseMatch[1]}-${pulseMatch[2]}`;
      }
      continue;
    }

    // Проверяем на отдых
    const restMatch = trimmedLine.match(patterns.rest);
    if (restMatch) {
      // Если есть предыдущее упражнение, добавляем к нему отдых
      if (currentBlock.exercises.length > 0) {
        const lastExercise = currentBlock.exercises[currentBlock.exercises.length - 1];
        lastExercise.rest = trimmedLine;
      }
      continue;
    }

    // Проверяем на инвентарь
    const equipmentMatch = trimmedLine.match(patterns.equipment);
    if (equipmentMatch) {
      currentEquipment.push(trimmedLine.toLowerCase());
      equipment.add(trimmedLine.toLowerCase());
      continue;
    }

    // Проверяем на упражнение с повторами (например, 4×50 вст)
    const repeatMatch = trimmedLine.match(patterns.repeatExercise);
    if (repeatMatch) {
      const [, repeats, distance, styleText] = repeatMatch;
      
      // Извлекаем стиль и экипировку из текста
      let style = styleText;
      let exerciseEquipment = [];
      
      // Проверяем наличие экипировки
      if (styleText.includes('с ластами')) {
        exerciseEquipment.push('ласты');
        style = styleText.replace('с ластами', '').trim();
      }
      if (styleText.includes('с лопатками')) {
        exerciseEquipment.push('лопатки');
        style = styleText.replace('с лопатками', '').trim();
      }
      if (styleText.includes('с колобашкой')) {
        exerciseEquipment.push('колобашка');
        style = styleText.replace('с колобашкой', '').trim();
      }
      if (styleText.includes('с доской')) {
        exerciseEquipment.push('доска');
        style = styleText.replace('с доской', '').trim();
      }
      if (styleText.includes('с трубкой')) {
        exerciseEquipment.push('трубка');
        style = styleText.replace('с трубкой', '').trim();
      }
      if (styleText.includes('с поясом')) {
        exerciseEquipment.push('пояс');
        style = styleText.replace('с поясом', '').trim();
      }
      if (styleText.includes('с резиной')) {
        exerciseEquipment.push('резина');
        style = styleText.replace('с резиной', '').trim();
      }
      if (styleText.includes('с кистевыми лопатками')) {
        exerciseEquipment.push('кистевые лопатки');
        style = styleText.replace('с кистевыми лопатками', '').trim();
      }
      
      console.log('Processing exercise:', trimmedLine, 'Style:', style, 'Equipment:', exerciseEquipment);
      
      const exercise = {
        description: trimmedLine,
        repeats: parseInt(repeats),
        distance: parseInt(distance),
        totalDistance: parseInt(repeats) * parseInt(distance),
        parts: [{
          distance: parseInt(distance),
          style: styleMap[style.toLowerCase()] || style.toLowerCase(),
          technique: null,
          intensity: null,
          breathing: null
        }],
        rest: null,
        equipment: exerciseEquipment,
        intensity: null,
        pulse: null,
        mode: null
      };
      
      console.log('Created exercise with equipment:', exercise.equipment);

      currentBlock.exercises.push(exercise);
      volume += exercise.totalDistance;
      currentEquipment = []; // Сбрасываем инвентарь после упражнения
      continue;
    }

    // Проверяем на сложное упражнение (например, 4*200 с частями)
    const complexMatch = trimmedLine.match(patterns.complexExercise);
    if (complexMatch) {
      const [, repeats, distance, description] = complexMatch;
      
      // Парсим части упражнения
      const parts = parseExerciseParts(description);
      
      // Извлекаем инвентарь из описания упражнения
      const exerciseEquipment = extractEquipmentFromDescription(trimmedLine);
      
      const exercise = {
        description: trimmedLine,
        repeats: parseInt(repeats),
        distance: parseInt(distance),
        totalDistance: parseInt(repeats) * parseInt(distance),
        parts: parts,
        rest: null,
        equipment: exerciseEquipment, // Используем только найденный инвентарь
        intensity: null,
        pulse: null,
        mode: null
      };

      currentBlock.exercises.push(exercise);
      volume += exercise.totalDistance;
      currentEquipment = []; // Сбрасываем инвентарь после упражнения
      continue;
    }

    // Проверяем на простое упражнение
    const simpleMatch = trimmedLine.match(patterns.simpleExercise);
    if (simpleMatch) {
      const [, distance, style] = simpleMatch;
      
      // Извлекаем инвентарь из описания упражнения
      const exerciseEquipment = extractEquipmentFromDescription(trimmedLine);
      
      const exercise = {
        description: trimmedLine,
        repeats: 1,
        distance: parseInt(distance),
        totalDistance: parseInt(distance),
        parts: [{
          distance: parseInt(distance),
          style: styleMap[style.toLowerCase()] || style.toLowerCase(),
          technique: null,
          intensity: null,
          breathing: null
        }],
        rest: null,
        equipment: exerciseEquipment, // Используем только найденный инвентарь
        intensity: null,
        pulse: null,
        mode: null
      };

      currentBlock.exercises.push(exercise);
      volume += exercise.totalDistance;
      currentEquipment = []; // Сбрасываем инвентарь после упражнения
      continue;
    }

    // Проверяем на интенсивность
    const intensityMatch = trimmedLine.match(patterns.intensity);
    if (intensityMatch) {
      intensity = intensityMatch[0];
      continue;
    }

    // Проверяем на режим
    const modeMatch = trimmedLine.match(patterns.mode);
    if (modeMatch) {
      // Добавляем режим к последнему упражнению
      if (currentBlock.exercises.length > 0) {
        const lastExercise = currentBlock.exercises[currentBlock.exercises.length - 1];
        lastExercise.mode = `R ${modeMatch[1]}`;
      }
      continue;
    }
  }

  // Добавляем последний блок
  if (currentBlock.exercises.length > 0) {
    blocks.push(currentBlock);
  }

  // Если нет блоков, создаем один блок с типом main
  if (blocks.length === 0) {
    blocks.push({ type: 'main', exercises: [] });
  }

  // Вычисляем общий объем
  const totalVolume = blocks.reduce((sum, block) => {
    return sum + block.exercises.reduce((blockSum, exercise) => {
      return blockSum + exercise.totalDistance;
    }, 0);
  }, 0);

  return {
    title: workoutTitle,
    volume: totalVolume,
    intensity: intensity,
    equipment: Array.from(equipment),
    blocks: blocks
  };
};

// Парсинг частей сложного упражнения
const parseExerciseParts = (description) => {
  const parts = [];
  const segments = description.split('+').map(s => s.trim());
  
  segments.forEach(segment => {
    const part = {
      distance: 50, // по умолчанию
      style: null,
      technique: null,
      intensity: null,
      breathing: null
    };

    // Ищем дистанцию
    const distanceMatch = segment.match(/(\d+)/);
    if (distanceMatch) {
      part.distance = parseInt(distanceMatch[1]);
    }

    // Ищем стиль
    const styleMap = {
      'вст': 'freestyle',
      'батт': 'butterfly',
      'брасс': 'breaststroke',
      'спина': 'backstroke',
      'на спине': 'backstroke',
      'карабас': 'карабас'
    };

    for (const [key, value] of Object.entries(styleMap)) {
      if (segment.toLowerCase().includes(key)) {
        part.style = value;
        break;
      }
    }

    // Ищем технику
    const techniqueMap = {
      'переменный': 'переменный',
      'стрелочка': 'стрелочка',
      'мягко': 'мягко',
      'мощно': 'мощно',
      'кайфуя': 'кайфуя'
    };

    for (const [key, value] of Object.entries(techniqueMap)) {
      if (segment.toLowerCase().includes(key)) {
        if (key === 'мягко' || key === 'мощно' || key === 'кайфуя') {
          part.intensity = value;
        } else {
          part.technique = value;
        }
        break;
      }
    }

    parts.push(part);
  });

  return parts;
};

module.exports = router;
