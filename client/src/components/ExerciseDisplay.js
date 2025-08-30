import React from 'react';
import { useWorkoutStore } from '../stores/workoutStore';
import EquipmentDisplay from './EquipmentDisplay';
import ExerciseHint from './ExerciseHint';

// Функция для получения эмодзи стиля
const getStyleEmoji = (style) => {
  const styleMap = {
    'freestyle': '🏊‍♂️',
    'breaststroke': '🐸',
    'backstroke': '🦋',
    'butterfly': '🦋',
    'IM': '🏊‍♂️',
    'вст': '🏊‍♂️',
    'брасс': '🐸',
    'спина': '🦋',
    'батт': '🦋',
    'кмпл': '🏊‍♂️',
    'комплекс': '🏊‍♂️',
    'карабас': '🏊‍♀️',
    'дирижёр': '🎼',
    'переменка': '🔄',
    'супермен': '🦸‍♂️'
  };
  return styleMap[style] || '🏊‍♂️';
};

// Функция для получения названия стиля
const getStyleName = (style) => {
  const styleMap = {
    'freestyle': 'Вольный',
    'breaststroke': 'Брасс',
    'backstroke': 'Спина',
    'butterfly': 'Баттерфляй',
    'IM': 'Комплекс',
    'вст': 'Вольный',
    'брасс': 'Брасс',
    'спина': 'Спина',
    'батт': 'Баттерфляй',
    'кмпл': 'Комплекс',
    'комплекс': 'Комплекс',
    'карабас': 'Карабас',
    'дирижёр': 'Дирижёр',
    'переменка': 'Переменка',
    'супермен': 'Супермен'
  };
  return styleMap[style] || style;
};

const ExerciseDisplay = ({ orientation }) => {
  const {
    getCurrentExercise,
    getCurrentExerciseProgress,
    getCurrentIntervalInfo
  } = useWorkoutStore();

  const currentExercise = getCurrentExercise();
  const currentProgress = getCurrentExerciseProgress();
  const intervalInfo = getCurrentIntervalInfo();

  if (!currentExercise) {
    return (
      <div className="text-center text-gray-500">
        <p>Нет активного упражнения</p>
      </div>
    );
  }

  const progressPercentage = (currentProgress / currentExercise.totalDistance) * 100;
  const currentStyle = currentExercise.parts[0]?.style || 'freestyle';
  const styleEmoji = getStyleEmoji(currentStyle);
  const styleName = getStyleName(currentStyle);

  return (
    <div className={`space-y-6 ${orientation === 'landscape' ? 'flex-1' : ''}`}>
      {/* Основной прогресс бар */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-primary-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Центральная область с эмодзи и информацией */}
      <div className="text-center space-y-4">
        {/* Большое эмодзи стиля */}
        <div className="text-6xl mb-4">
          {styleEmoji}
        </div>

        {/* Стиль и экипировка */}
        <EquipmentDisplay 
          equipment={currentExercise.equipment}
          styleName={styleName}
        />

        {/* Описание упражнения */}
        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {currentExercise.description}
          </h3>
          
          {/* Части сложного упражнения */}
          {currentExercise.parts && currentExercise.parts.length > 1 && (
            <div className="mt-3 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Части упражнения:</h4>
              {currentExercise.parts.map((part, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStyleEmoji(part.style)}</span>
                    <span className="text-sm font-medium">
                      {part.distance}м {getStyleName(part.style)}
                    </span>
                    {part.technique && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {part.technique}
                      </span>
                    )}
                    {part.intensity && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        {part.intensity}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {part.distance}м
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {/* Пульсовая зона */}
          {currentExercise.pulse && (
            <div className="mb-2">
              <span className="text-sm text-red-600 font-medium">
                {currentExercise.pulse}
              </span>
            </div>
          )}

          {/* Режим */}
          {currentExercise.mode && (
            <div className="mb-2">
              <span className="text-sm text-blue-600 font-medium">
                {currentExercise.mode}
              </span>
            </div>
          )}
        </div>

        {/* Подсказки по упражнению */}
        <ExerciseHint exercise={currentExercise} />

        {/* Прогресс текущего упражнения */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-primary-600 mb-2">
            {currentProgress}м / {currentExercise.totalDistance}м
          </div>

          {intervalInfo && (
            <div className="text-lg text-gray-600 mb-4">
              Следующий интервал: {intervalInfo.interval}м
            </div>
          )}
        </div>


      </div>


    </div>
  );
};

export default ExerciseDisplay;
