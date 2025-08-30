import React from 'react';
import { useWorkoutStore } from '../stores/workoutStore';
import EquipmentDisplay from './EquipmentDisplay';

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
    'комплекс': '🏊‍♂️'
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
    'комплекс': 'Комплекс'
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
