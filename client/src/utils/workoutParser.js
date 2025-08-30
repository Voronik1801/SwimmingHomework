// Улучшенный парсер тренировок по плаванию
export const parseWorkoutText = async (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Базовые регулярные выражения для распознавания
  const patterns = {
    // Номер тренировки
    workoutNumber: /^(\d+)[яя]\s*тренировка|домашка/i,
    
    // Объем тренировки
    volume: /(\d+)\s*м/i,
    
    // Интенсивность
    intensity: /[🟡🟢🔴]/g,
    
    // Инвентарь
    equipment: /(ласты|лопатки|колобашка|доска|трубка|пояс|резина|кистевые\s+лопатки)/gi,
    
    // Сложные упражнения с частями
    complexExercise: /(\d+)\*(\d+)\s*([^0-9]+)/i,
    
    // Простые упражнения
    simpleExercise: /(\d+)\s*([а-яё]+)/i,
    
    // Отдых
    rest: /(отдых|п)\s*(\d+)(?:-(\d+))?\s*(сек|мин)?/i,
    
    // Блоки тренировки
    block: /^(разминка|основная\s+часть|техническая\s+часть|заминка|свободное\s+плавание|основная|заминка)$/i,
    
    // Пульс
    pulse: /п\s*(\d+)-(\d+)/i,
    
    // Режим
    mode: /R\s*(\d+\.\d+)/i
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

  let currentBlock = { type: 'main', exercises: [] };
  const blocks = [];
  let equipment = new Set();
  let intensity = '🟡';
  let volume = 0;
  let workoutNumber = null;
  let workoutTitle = 'Тренировка';

  for (const line of lines) {
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
      continue;
    }

    // Проверяем на сложное упражнение (например, 4*200 с частями)
    const complexMatch = trimmedLine.match(patterns.complexExercise);
    if (complexMatch) {
      const [, repeats, distance, description] = complexMatch;
      
      // Парсим части упражнения
      const parts = parseExerciseParts(description);
      
      const exercise = {
        description: trimmedLine,
        repeats: parseInt(repeats),
        distance: parseInt(distance),
        totalDistance: parseInt(repeats) * parseInt(distance),
        parts: parts,
        rest: null,
        equipment: [],
        intensity: null,
        pulse: null,
        mode: null
      };

      // Ищем отдых в следующей строке
      const nextLine = lines[lines.indexOf(line) + 1];
      if (nextLine) {
        const restMatch = nextLine.match(patterns.rest);
        if (restMatch) {
          exercise.rest = nextLine.trim();
        }
      }

      currentBlock.exercises.push(exercise);
      volume += exercise.totalDistance;
      continue;
    }

    // Проверяем на простое упражнение
    const simpleMatch = trimmedLine.match(patterns.simpleExercise);
    if (simpleMatch) {
      const [, distance, style] = simpleMatch;
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
        equipment: [],
        intensity: null,
        pulse: null,
        mode: null
      };

      currentBlock.exercises.push(exercise);
      volume += exercise.totalDistance;
      continue;
    }

    // Ищем инвентарь
    const equipmentMatches = trimmedLine.match(patterns.equipment);
    if (equipmentMatches) {
      equipmentMatches.forEach(item => equipment.add(item.toLowerCase()));
    }

    // Ищем интенсивность
    const intensityMatch = trimmedLine.match(patterns.intensity);
    if (intensityMatch) {
      intensity = intensityMatch[0];
    }

    // Ищем пульс
    const pulseMatch = trimmedLine.match(patterns.pulse);
    if (pulseMatch) {
      // Добавляем пульс к последнему упражнению
      if (currentBlock.exercises.length > 0) {
        const lastExercise = currentBlock.exercises[currentBlock.exercises.length - 1];
        lastExercise.pulse = `П${pulseMatch[1]}-${pulseMatch[2]}`;
      }
    }

    // Ищем режим
    const modeMatch = trimmedLine.match(patterns.mode);
    if (modeMatch) {
      if (currentBlock.exercises.length > 0) {
        const lastExercise = currentBlock.exercises[currentBlock.exercises.length - 1];
        lastExercise.mode = `R ${modeMatch[1]}`;
      }
    }
  }

  // Добавляем последний блок
  if (currentBlock.exercises.length > 0) {
    blocks.push(currentBlock);
  }

  // Если нет блоков, создаем один основной
  if (blocks.length === 0) {
    blocks.push({ type: 'main', exercises: [] });
  }

  // Генерируем заголовок
  const title = workoutNumber ? `${workoutNumber}я тренировка (${volume}м)` : `Тренировка (${volume}м)`;

  return {
    title,
    volume,
    intensity,
    equipment: Array.from(equipment),
    blocks,
    workoutNumber
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

// Генерация заголовка тренировки
const generateTitle = (blocks, volume, workoutNumber) => {
  if (workoutNumber) {
    return `${workoutNumber}я тренировка (${volume}м)`;
  }
  
  const blockTypes = blocks.map(block => block.type);
  const hasWarmup = blockTypes.includes('warmup');
  const hasCooldown = blockTypes.includes('cooldown');
  
  let title = '';
  
  if (hasWarmup && hasCooldown) {
    title = 'Полная тренировка';
  } else if (hasWarmup) {
    title = 'Тренировка с разминкой';
  } else if (hasCooldown) {
    title = 'Тренировка с заминкой';
  } else {
    title = 'Основная тренировка';
  }
  
  return `${title} (${volume}м)`;
};

// Примеры тренировок для тестирования
export const sampleWorkouts = {
  basic: `1я тренировка (домашка)
2200м 🟡

Разминка
4×50 вст
Отдых 15 сек

Основная часть
8×400 кмпл
П 22-23

Заминка
2×100 вст`,

  complex: `3я тренировка (домашка)
3500м 🟡

Подготовь инвентарь: ласты, лопатки, колобашка

Разминка
4×50 вст
Отдых 15 сек

Основная часть (в кистевых лопатках)
4×200
50 карабас + 50 переменный батт + 50 на спине в стрелочке + 50 вст мягко
Отдых 30 сек

Техническая часть
3×100 комплекс в ластах
Отдых 20 сек

1000м в ластах и лопатках
Мягко, в своё удовольствие
Отдых 60 сек

1000м без экипировки
Держать одинаковый темп каждые 100м
Отдых 60 сек

1000м в ластах и лопатках
Мягко, кайфуя

Заминка
2×100 вст`,

  equipment: `Разминка
4×50 вст с ластами
4×50 брасс с лопатками

Основная часть
8×100 кмпл с колобашкой
П 22-23

Заминка
2×100 вст`
};
