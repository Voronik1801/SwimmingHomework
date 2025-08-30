import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useOrientation } from '../hooks/useOrientation';
import { useWorkoutStore } from '../stores/workoutStore';
import { sampleWorkouts } from '../utils/workoutParser';

const WorkoutInput = () => {
  const navigate = useNavigate();
  const orientation = useOrientation();
  const { setCurrentWorkout } = useWorkoutStore();
  
  const [parsedWorkout, setParsedWorkout] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [workoutText, setWorkoutText] = useState('');

  const handleParse = async (text) => {
    console.log('handleParse вызван с текстом:', text);
    
    if (!text.trim()) {
      console.log('Текст тренировки пустой');
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      console.log('Отправка запроса на парсинг:', text.substring(0, 100) + '...');
      
      // Используем серверный API вместо клиентского парсера
      const response = await fetch('http://localhost:3001/api/workout/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      });

      console.log('Получен ответ от сервера:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Результат парсинга:', result);

      if (result.success) {
        setParsedWorkout(result.workout);
        console.log('Тренировка успешно распознана:', result.workout.title);
      } else {
        setParseError(result.error || 'Не удалось распознать тренировку');
        console.error('Ошибка парсинга:', result.error);
      }
    } catch (error) {
      console.error('Parse error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setParseError('Ошибка соединения с сервером. Проверьте, что сервер запущен на порту 3001.');
      } else if (error.message.includes('HTTP error')) {
        setParseError('Ошибка сервера. Попробуйте еще раз.');
      } else {
        setParseError('Неожиданная ошибка. Проверьте консоль браузера для деталей.');
      }
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with text:', workoutText);
    handleParse(workoutText);
  };

  const handleStartWorkout = () => {
    if (parsedWorkout) {
      setCurrentWorkout(parsedWorkout);
      navigate('/workout');
    }
  };

  const handleSampleWorkout = (sampleKey) => {
    const sampleText = sampleWorkouts[sampleKey];
    if (sampleText) {
      setWorkoutText(sampleText);
    }
  };

  const formatExercise = (exercise) => {
    if (exercise.parts && exercise.parts.length > 1) {
      // Сложное упражнение с частями
      const parts = exercise.parts.map(part => {
        let desc = `${part.distance}м ${getStyleName(part.style)}`;
        if (part.technique) desc += ` (${part.technique})`;
        if (part.intensity) desc += ` ${part.intensity}`;
        return desc;
      });
      return `${exercise.repeats}×${exercise.distance}м: ${parts.join(' + ')}`;
    } else {
      // Простое упражнение
      const part = exercise.parts[0];
      let desc = `${exercise.repeats}×${exercise.distance}м ${getStyleName(part.style)}`;
      if (part.technique) desc += ` (${part.technique})`;
      if (part.intensity) desc += ` ${part.intensity}`;
      return desc;
    }
  };

  const getStyleName = (style) => {
    const styleNames = {
      'freestyle': 'Вольный стиль',
      'butterfly': 'Баттерфляй',
      'breaststroke': 'Брасс',
      'backstroke': 'На спине',
      'IM': 'Комплекс',
      'карабас': 'Карабас'
    };
    return styleNames[style] || style;
  };

  return (
    <div className={`min-h-screen flex flex-col ${orientation === 'landscape' ? 'landscape-layout' : 'portrait-layout'}`}>
      <div className={`flex-1 px-6 py-6 ${
        orientation === 'landscape' ? 'flex gap-8' : 'flex flex-col'
      }`}>
        {/* Input Section */}
        <div className={`${orientation === 'landscape' ? 'flex-1' : 'mb-6'}`}>
          <h2 className={`font-bold text-gray-800 mb-4 ${
            orientation === 'landscape' ? 'text-2xl' : 'text-3xl'
          }`}>
            Введите тренировку
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Текст тренировки от тренера
              </label>
              <textarea
                value={workoutText}
                onChange={(e) => {
                  console.log('Textarea onChange:', e.target.value);
                  setWorkoutText(e.target.value);
                }}
                className={`w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  orientation === 'landscape' ? 'h-64' : 'h-48'
                }`}
                placeholder="Вставьте сюда текст тренировки от тренера..."
                required
                minLength={10}
              />
            </div>

            {/* Sample Workouts */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Примеры тренировок:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleSampleWorkout('basic')}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                >
                  Базовая
                </button>
                <button
                  type="button"
                  onClick={() => handleSampleWorkout('complex')}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                >
                  Сложная
                </button>
                <button
                  type="button"
                  onClick={() => handleSampleWorkout('equipment')}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                >
                  С инвентарем
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isParsing || !workoutText.trim()}
              className={`btn-primary w-full py-4 rounded-xl font-semibold transition-all duration-200 ${
                isParsing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
              }`}
              onClick={() => {
                console.log('Submit button clicked');
                console.log('Current workoutText:', workoutText);
              }}
            >
              {isParsing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Распознавание...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  Распознать тренировку
                </span>
              )}
            </button>
          </form>

          {parseError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Ошибка распознавания</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{parseError}</p>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className={`${orientation === 'landscape' ? 'flex-1' : 'mt-6'}`}>
          <h3 className={`font-bold text-gray-800 mb-4 ${
            orientation === 'landscape' ? 'text-xl' : 'text-2xl'
          }`}>
            Предварительный просмотр
          </h3>

          {parsedWorkout ? (
            <div className="space-y-4">
              {/* Workout Info */}
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-primary-500" />
                  <h4 className="font-semibold text-primary-700">{parsedWorkout.title}</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Объем:</span>
                    <span className="font-semibold ml-1">{parsedWorkout.volume}м</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Интенсивность:</span>
                    <span className="font-semibold ml-1">{parsedWorkout.intensity}</span>
                  </div>
                </div>
                {parsedWorkout.equipment && parsedWorkout.equipment.length > 0 && (
                  <div className="mt-2">
                    <span className="text-gray-600 text-sm">Инвентарь:</span>
                    <span className="text-sm font-medium ml-1">
                      {parsedWorkout.equipment.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Exercises List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {parsedWorkout.blocks.map((block, blockIndex) => (
                  <div key={blockIndex} className="bg-gray-50 rounded-xl p-4">
                    <h5 className="font-semibold text-gray-800 mb-2 capitalize">
                      {block.type === 'warmup' ? 'Разминка' : 
                       block.type === 'main' ? 'Основная часть' : 
                       block.type === 'technical' ? 'Техническая часть' :
                       block.type === 'cooldown' ? 'Заминка' : block.type}
                    </h5>
                    <div className="space-y-2">
                      {block.exercises.map((exercise, exerciseIndex) => (
                        <div key={exerciseIndex} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {formatExercise(exercise)}
                            </p>
                            {exercise.rest && (
                              <p className="text-sm text-gray-600">Отдых: {exercise.rest}</p>
                            )}
                            {exercise.pulse && (
                              <p className="text-sm text-red-600">Пульс: {exercise.pulse}</p>
                            )}
                            {exercise.mode && (
                              <p className="text-sm text-blue-600">Режим: {exercise.mode}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-primary-600">
                              {exercise.totalDistance}м
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartWorkout}
                className="btn-success w-full py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <span className="flex items-center justify-center gap-2">
                  Начать тренировку
                  <ArrowRight className="w-5 h-5" />
                </span>
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Введите текст тренировки и нажмите "Распознать тренировку" для предварительного просмотра
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutInput;
