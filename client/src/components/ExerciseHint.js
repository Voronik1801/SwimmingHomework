import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { getStyleHint, getPulseHint, getModeHint, findHint } from '../utils/swimmingTerms';

const ExerciseHint = ({ exercise }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Получаем подсказки для текущего упражнения
  const getHints = () => {
    const hints = [];
    const foundTerms = new Set(); // Для избежания дублирования
    
    // Функция для добавления подсказки
    const addHint = (hintData, type, title, icon) => {
      if (hintData && !foundTerms.has(hintData.title)) {
        foundTerms.add(hintData.title);
        hints.push({
          type: type,
          title: title,
          data: hintData,
          icon: icon
        });
      }
    };

    // 1. Проверяем стили из частей упражнения
    if (exercise.parts && exercise.parts.length > 0) {
      exercise.parts.forEach(part => {
        if (part.style) {
          const styleHint = getStyleHint(part.style);
          addHint(styleHint, 'style', 'Стиль плавания', '🏊‍♂️');
        }
      });
    }

    // 2. Проверяем пульсовую зону
    if (exercise.pulse) {
      const pulseHint = getPulseHint(exercise.pulse);
      addHint(pulseHint, 'pulse', 'Пульсовая зона', '❤️');
    }

    // 3. Проверяем режим тренировки
    if (exercise.mode) {
      const modeHint = getModeHint(exercise.mode);
      addHint(modeHint, 'mode', 'Режим тренировки', '⏱️');
    }

    // 4. Анализируем описание упражнения на ключевые слова
    const description = exercise.description || '';
    const words = description.toLowerCase().split(/\s+/);
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^а-яё]/g, ''); // Убираем не-русские символы
      if (cleanWord.length > 2) { // Ищем слова длиннее 2 символов
        const hint = findHint(cleanWord);
        if (hint) {
          addHint(hint.data, hint.type, getHintTitle(hint.type), getHintIcon(hint.type));
        }
      }
    });

    // 5. Анализируем части упражнения на техники и интенсивность
    if (exercise.parts && exercise.parts.length > 0) {
      exercise.parts.forEach(part => {
        // Проверяем технику
        if (part.technique) {
          const techniqueHint = findHint(part.technique);
          if (techniqueHint) {
            addHint(techniqueHint.data, 'technical', 'Техника', '🎯');
          }
        }
        
        // Проверяем интенсивность
        if (part.intensity) {
          const intensityHint = findHint(part.intensity);
          if (intensityHint) {
            addHint(intensityHint.data, 'intensity', 'Интенсивность', '⚡');
          }
        }
      });
    }

    return hints;
  };

  // Функция для получения заголовка подсказки
  const getHintTitle = (type) => {
    const titles = {
      'style': 'Стиль плавания',
      'technical': 'Техника',
      'pulse': 'Пульсовая зона',
      'mode': 'Режим тренировки',
      'intensity': 'Интенсивность'
    };
    return titles[type] || 'Подсказка';
  };

  // Функция для получения иконки подсказки
  const getHintIcon = (type) => {
    const icons = {
      'style': '🏊‍♂️',
      'technical': '🎯',
      'pulse': '❤️',
      'mode': '⏱️',
      'intensity': '⚡'
    };
    return icons[type] || '💡';
  };

  const hints = getHints();

  if (hints.length === 0) {
    return null;
  }



  return (
    <div className="mb-4">
      {/* Кнопка для показа подсказок */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-700">
            Подсказки по упражнению ({hints.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-blue-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-blue-600" />
        )}
      </button>

      {/* Содержимое подсказок */}
      {isExpanded && (
        <div className="mt-3 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 space-y-4">
            {hints.map((hint, index) => (
              <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                {/* Заголовок подсказки */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{hint.icon}</span>
                  <h3 className="font-semibold text-gray-800">{hint.data.title}</h3>
                </div>

                {/* Описание */}
                <div className="mb-3">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {hint.data.description}
                  </p>
                </div>

                {/* Детали/Фазы */}
                {(hint.data.details || hint.data.phases) && (
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-700 mb-2 text-sm">
                      {hint.data.phases ? 'Фазы:' : 'Детали:'}
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {(hint.data.details || hint.data.phases).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1 flex-shrink-0">
                            {hint.data.phases ? `${idx + 1}.` : '•'}
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Советы */}
                {hint.data.tips && (
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-700 mb-2 text-sm">Советы:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {hint.data.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Дополнительная информация */}
                {hint.data.intensity && (
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-700 mb-1 text-sm">Интенсивность:</h4>
                    <p className="text-sm text-gray-600">{hint.data.intensity}</p>
                  </div>
                )}

                {hint.data.example && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1 text-sm">Пример:</h4>
                    <p className="text-sm text-gray-600">{hint.data.example}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseHint;
