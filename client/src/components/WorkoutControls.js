import React from 'react';
import { Check, SkipForward, Pause, Play, X } from 'lucide-react';
import { useWorkoutStore } from '../stores/workoutStore';

const WorkoutControls = ({ 
  onComplete, 
  onSkip, 
  onPause, 
  onFinish, 
  isPaused, 
  orientation 
}) => {
  const { 
    canCompleteExercise, 
    getCurrentIntervalInfo, 
    getAvailableIntervalsForCurrentExercise,
    setCompletionInterval,
    completionInterval
  } = useWorkoutStore();
  const intervalInfo = getCurrentIntervalInfo();
  const canComplete = canCompleteExercise();

  if (orientation === 'landscape') {
    return (
      <div className="flex flex-col gap-4 h-full justify-center">
        {/* Complete Button - Large */}
        <button
          onClick={onComplete}
          disabled={!canComplete}
          className={`landscape-button touch-target transition-all duration-200 ${
            canComplete 
              ? 'btn-success hover:scale-105 active:scale-95' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <Check className="w-8 h-8" />
            <span>ВЫПОЛНЕНО</span>
            {intervalInfo && (
              <span className="text-sm opacity-75">
                +{intervalInfo.interval}м
              </span>
            )}
          </div>
        </button>

        {/* Pause/Resume Button */}
        <button
          onClick={onPause}
          className="btn-secondary landscape-button touch-target"
        >
          <div className="flex items-center justify-center gap-2">
            {isPaused ? (
              <>
                <Play className="w-6 h-6" />
                <span>Продолжить</span>
              </>
            ) : (
              <>
                <Pause className="w-6 h-6" />
                <span>Пауза</span>
              </>
            )}
          </div>
        </button>

        {/* Skip Button */}
        <button
          onClick={onSkip}
          className="btn-accent landscape-button touch-target"
        >
          <div className="flex items-center justify-center gap-2">
            <SkipForward className="w-6 h-6" />
            <span>Пропустить</span>
          </div>
        </button>

        {/* Finish Button */}
        <button
          onClick={onFinish}
          className="btn-secondary landscape-button touch-target"
        >
          <div className="flex items-center justify-center gap-2">
            <X className="w-6 h-6" />
            <span>Завершить</span>
          </div>
        </button>
      </div>
    );
  }

  // Portrait layout
  return (
    <div className="space-y-4">
      {/* Interval Selection */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Интервал выполнения:</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {getAvailableIntervalsForCurrentExercise().map((interval) => (
            <button
              key={interval}
              onClick={() => setCompletionInterval(interval)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                completionInterval === interval
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {interval}м
            </button>
          ))}
        </div>
      </div>

      {/* Complete Button - Full Width */}
      <button
        onClick={onComplete}
        disabled={!canComplete}
        className={`portrait-button touch-target transition-all duration-200 ${
          canComplete 
            ? 'btn-success hover:scale-105 active:scale-95' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center justify-center gap-3">
          <Check className="w-8 h-8" />
          <div className="text-center">
            <span className="text-2xl font-bold">ВЫПОЛНЕНО</span>
            {intervalInfo && (
              <div className="text-sm opacity-75">
                +{intervalInfo.interval}м
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Secondary Controls */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onPause}
          className="btn-secondary portrait-button touch-target"
        >
          <div className="flex items-center justify-center gap-2">
            {isPaused ? (
              <>
                <Play className="w-6 h-6" />
                <span>Продолжить</span>
              </>
            ) : (
              <>
                <Pause className="w-6 h-6" />
                <span>Пауза</span>
              </>
            )}
          </div>
        </button>

        <button
          onClick={onSkip}
          className="btn-accent portrait-button touch-target"
        >
          <div className="flex items-center justify-center gap-2">
            <SkipForward className="w-6 h-6" />
            <span>Пропустить</span>
          </div>
        </button>
      </div>

      {/* Finish Button */}
      <button
        onClick={onFinish}
        className="btn-secondary portrait-button touch-target"
      >
        <div className="flex items-center justify-center gap-2">
          <X className="w-6 h-6" />
          <span>Завершить тренировку</span>
        </div>
      </button>
    </div>
  );
};

export default WorkoutControls;
