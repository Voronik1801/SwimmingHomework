import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrientation } from '../hooks/useOrientation';
import { useWorkoutStore } from '../stores/workoutStore';
import ProgressBar from '../components/ProgressBar';
import ExerciseDisplay from '../components/ExerciseDisplay';
import WorkoutControls from '../components/WorkoutControls';
import WorkoutTimer from '../components/WorkoutTimer';
import RestTimer from '../components/RestTimer';

const WorkoutSession = () => {
  const navigate = useNavigate();
  const orientation = useOrientation();
  const {
    currentWorkout,
    isWorkoutActive,
    isPaused,
    isRestActive,
    currentRestText,
    showCompleteModal,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    completeExercisePart,
    completeRest,
    skipExercise,
    getCurrentExercise,
    getCurrentBlock,
    getProgress,
    getWorkoutTime,
    finishWorkout,
    hideCompleteModal
  } = useWorkoutStore();

  // Автоматически начинаем тренировку при загрузке
  useEffect(() => {
    if (currentWorkout && !isWorkoutActive) {
      console.log('Starting workout...', { currentWorkout, isWorkoutActive });
      startWorkout();
    }
  }, [currentWorkout, isWorkoutActive, startWorkout]);

  // Автоматическое перенаправление при завершении тренировки
  useEffect(() => {
    if (showCompleteModal) {
      // Немедленное перенаправление без задержки
      hideCompleteModal();
      // Используем полный URL для надежности
      const fullUrl = window.location.origin + '/complete';
      window.location.href = fullUrl;
    }
  }, [showCompleteModal, hideCompleteModal]);

  // Если нет тренировки, перенаправляем на ввод
  if (!currentWorkout) {
    navigate('/input');
    return null;
  }

  const currentExercise = getCurrentExercise();
  const currentBlock = getCurrentBlock();
  const progress = getProgress();
  const workoutTime = getWorkoutTime();

  const getBlockName = (type) => {
    const blockNames = {
      'warmup': 'Разминка',
      'main': 'Основная часть',
      'technical': 'Техническая часть',
      'cooldown': 'Заминка',
      'freestyle': 'Свободное плавание'
    };
    return blockNames[type] || type;
  };

  const handleComplete = () => {
    completeExercisePart();
    // Воспроизводим звук или вибрацию
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  };

  const handleSkip = () => {
    skipExercise();
  };

  const handlePause = () => {
    if (isPaused) {
      resumeWorkout();
    } else {
      pauseWorkout();
    }
  };

  const handleFinish = () => {
    finishWorkout();
    navigate('/complete');
  };

  const handleRestComplete = () => {
    completeRest();
  };

  return (
    <div className={`min-h-screen flex flex-col ${orientation === 'landscape' ? 'landscape-layout' : 'portrait-layout'}`}>
      {/* Progress Bar */}
      <ProgressBar progress={progress} />

      {/* Main Content */}
      <div className={`flex-1 ${orientation === 'landscape' ? 'flex' : 'flex flex-col'}`}>
        {/* Left/Content Panel */}
        <div className={`${orientation === 'landscape' ? 'flex-1 landscape-content' : 'flex-1 portrait-exercise-container'}`}>
          {/* Timer and Stats */}
          <div className={`text-center mb-6 ${orientation === 'landscape' ? 'mb-4' : ''}`}>
            <WorkoutTimer 
              time={workoutTime} 
              isPaused={isPaused}
              orientation={orientation}
            />
            
            {/* Distance Counter */}
            <div className={`mt-2 ${orientation === 'landscape' ? 'text-lg' : 'text-xl'}`}>
              <span className="text-gray-600">Дистанция: </span>
              <span className="font-bold text-primary-500">
                {Math.round(progress * currentWorkout.volume / 100)}м / {currentWorkout.volume}м
              </span>
            </div>
          </div>

          {/* Current Block Info */}
          {currentBlock && !isRestActive && (
            <div className={`text-center mb-4 ${orientation === 'landscape' ? 'mb-3' : ''}`}>
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-3">
                <h3 className={`font-bold text-primary-700 ${
                  orientation === 'landscape' ? 'text-lg' : 'text-xl'
                }`}>
                  {getBlockName(currentBlock.type)}
                </h3>
                {currentExercise && currentExercise.equipment && currentExercise.equipment.length > 0 && (
                  <p className="text-sm text-primary-600 mt-1">
                    Инвентарь: {currentExercise.equipment.join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Rest Timer */}
          {isRestActive && (
            <RestTimer
              restText={currentRestText}
              onComplete={handleRestComplete}
              orientation={orientation}
            />
          )}

          {/* Exercise Display */}
          {!isRestActive && currentExercise && (
            <ExerciseDisplay 
              exercise={currentExercise}
              orientation={orientation}
            />
          )}
        </div>

        {/* Right/Controls Panel (Landscape) */}
        {orientation === 'landscape' && !isRestActive && (
          <div className="landscape-controls">
            <WorkoutControls
              onComplete={handleComplete}
              onSkip={handleSkip}
              onPause={handlePause}
              onFinish={handleFinish}
              isPaused={isPaused}
              orientation={orientation}
            />
          </div>
        )}
      </div>

      {/* Bottom Controls (Portrait) */}
      {orientation === 'portrait' && !isRestActive && (
        <div className="px-6 py-4">
          <WorkoutControls
            onComplete={handleComplete}
            onSkip={handleSkip}
            onPause={handlePause}
            onFinish={handleFinish}
            isPaused={isPaused}
            orientation={orientation}
          />
        </div>
      )}

      {/* Complete Modal - Removed, redirecting to /complete page instead */}
    </div>
  );
};

export default WorkoutSession;
