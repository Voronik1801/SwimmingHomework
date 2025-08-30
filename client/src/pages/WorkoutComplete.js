import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Trophy, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { useOrientation } from '../hooks/useOrientation';
import { useWorkoutStore } from '../stores/workoutStore';
import { formatTime } from '../utils/timeUtils';

const WorkoutComplete = () => {
  const navigate = useNavigate();
  const orientation = useOrientation();
  const { currentWorkout, getWorkoutTime, resetWorkout } = useWorkoutStore();

  const workoutTime = getWorkoutTime();

  const handleShare = async () => {
    const shareText = `🏊‍♂️ Завершил тренировку в SwimHomework!
    
📊 Результаты:
⏱️ Время: ${formatTime(workoutTime)}
📏 Дистанция: ${currentWorkout?.volume || 0}м
🎯 Тренировка: ${currentWorkout?.title || 'SwimHomework'}

#плавание #тренировка #swimhomework`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Результаты тренировки',
          text: shareText,
          url: window.location.origin
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Результаты скопированы в буфер обмена!');
      } catch (error) {
        console.error('Failed to copy to clipboard');
      }
    }
  };

  const handleNewWorkout = () => {
    resetWorkout();
    navigate('/input');
  };

  const handleGoHome = () => {
    resetWorkout();
    navigate('/');
  };

  if (!currentWorkout) {
    navigate('/');
    return null;
  }

  return (
    <div className={`min-h-screen flex flex-col ${orientation === 'landscape' ? 'landscape-layout' : 'portrait-layout'}`}>
      <div className={`flex-1 flex flex-col justify-center items-center px-6 ${
        orientation === 'landscape' ? 'py-8' : 'py-12'
      }`}>
        {/* Success Animation */}
        <div className={`text-center mb-8 ${orientation === 'landscape' ? 'mb-6' : ''}`}>
          <div className={`mb-6 ${orientation === 'landscape' ? 'text-8xl' : 'text-9xl'}`}>
            🎉
          </div>
          <h1 className={`font-bold text-success-600 mb-2 ${
            orientation === 'landscape' ? 'text-3xl' : 'text-4xl'
          }`}>
            Тренировка завершена!
          </h1>
          <p className={`text-gray-600 ${
            orientation === 'landscape' ? 'text-lg' : 'text-xl'
          }`}>
            Отличная работа! Вы выполнили все упражнения.
          </p>
        </div>

        {/* Results Card */}
        <div className={`bg-white rounded-2xl shadow-lg p-6 mb-8 ${
          orientation === 'landscape' ? 'w-full max-w-2xl' : 'w-full max-w-md'
        }`}>
          <h2 className={`font-bold text-gray-800 mb-6 text-center ${
            orientation === 'landscape' ? 'text-2xl' : 'text-3xl'
          }`}>
            Результаты тренировки
          </h2>

          <div className="space-y-4">
            {/* Workout Title */}
            <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl">
              <Trophy className="w-6 h-6 text-primary-500" />
              <div>
                <span className="text-gray-600">Тренировка:</span>
                <div className="font-semibold text-primary-700">{currentWorkout.title}</div>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Clock className="w-6 h-6 text-gray-600" />
              <div>
                <span className="text-gray-600">Общее время:</span>
                <div className="font-semibold text-gray-800">{formatTime(workoutTime)}</div>
              </div>
            </div>

            {/* Distance */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <MapPin className="w-6 h-6 text-gray-600" />
              <div>
                <span className="text-gray-600">Дистанция:</span>
                <div className="font-semibold text-gray-800">{currentWorkout.volume}м</div>
              </div>
            </div>

            {/* Intensity */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-6 h-6 text-2xl">{currentWorkout.intensity}</div>
              <div>
                <span className="text-gray-600">Интенсивность:</span>
                <div className="font-semibold text-gray-800">
                  {currentWorkout.intensity === '🟢' ? 'Низкая' :
                   currentWorkout.intensity === '🟡' ? 'Средняя' :
                   currentWorkout.intensity === '🔴' ? 'Высокая' : 'Не указана'}
                </div>
              </div>
            </div>

            {/* Equipment */}
            {currentWorkout.equipment && currentWorkout.equipment.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-6 h-6 text-2xl">🏊‍♂️</div>
                <div>
                  <span className="text-gray-600">Использованный инвентарь:</span>
                  <div className="font-semibold text-gray-800">
                    {currentWorkout.equipment.join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`space-y-4 w-full ${
          orientation === 'landscape' ? 'max-w-2xl' : 'max-w-md'
        }`}>
          <button
            onClick={handleShare}
            className="btn-primary w-full py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <span className="flex items-center justify-center gap-2">
              <Share2 className="w-6 h-6" />
              Поделиться результатами
            </span>
          </button>

          <div className={`grid gap-4 ${
            orientation === 'landscape' ? 'grid-cols-2' : 'grid-cols-1'
          }`}>
            <button
              onClick={handleNewWorkout}
              className="btn-success py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Новая тренировка
            </button>

            <button
              onClick={handleGoHome}
              className="btn-secondary py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                На главную
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutComplete;
