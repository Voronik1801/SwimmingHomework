import React, { useState, useEffect, useCallback } from 'react';

const WorkoutTimer = ({ time, isPaused, orientation }) => {
  const [displayTime, setDisplayTime] = useState(0);

  // Обновляем отображаемое время при изменении time
  useEffect(() => {
    setDisplayTime(time);
  }, [time]);

  // Локальный таймер для плавного обновления
  useEffect(() => {
    let interval = null;
    
    if (!isPaused) {
      interval = setInterval(() => {
        setDisplayTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPaused]);

  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div className={`text-center ${orientation === 'landscape' ? 'mb-2' : 'mb-4'}`}>
      <div className={`font-mono font-bold text-primary-600 ${
        orientation === 'landscape' ? 'text-2xl' : 'text-3xl'
      } ${isPaused ? 'opacity-50' : ''}`}>
        {formatTime(displayTime)}
      </div>
      {isPaused && (
        <div className={`text-sm text-gray-500 mt-1 ${
          orientation === 'landscape' ? 'text-xs' : 'text-sm'
        }`}>
          Пауза
        </div>
      )}
    </div>
  );
};

export default WorkoutTimer;
