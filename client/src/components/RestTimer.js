import React, { useState, useEffect, useCallback } from 'react';
import { Pause, Play, SkipForward } from 'lucide-react';

const RestTimer = ({ restText, onComplete, orientation }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  const parseRestTime = (text) => {
    const match = text.match(/(\d+)\s*(сек|мин)/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      return unit === 'мин' ? value * 60 : value;
    }
    return 0;
  };

  // Инициализация таймера
  useEffect(() => {
    if (restText) {
      const seconds = parseRestTime(restText);
      console.log('RestTimer: инициализация с', seconds, 'секунд');
      setTimeLeft(seconds);
      setIsActive(true);
      setIsPaused(false);
      setLastUpdateTime(Date.now());
    }
  }, [restText]);

  // Основной таймер
  useEffect(() => {
    let interval = null;
    
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        const now = Date.now();
        const timeDiff = Math.floor((now - lastUpdateTime) / 1000);
        
        if (timeDiff >= 1) {
          setTimeLeft(prevTime => {
            const newTime = prevTime - timeDiff;
            console.log('RestTimer: обновление времени', newTime, 'секунд');
            
            if (newTime <= 0) {
              setIsActive(false);
              onComplete();
              return 0;
            }
            return newTime;
          });
          setLastUpdateTime(now);
        }
      }, 100); // Проверяем каждые 100мс для более точного отсчета
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      onComplete();
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, isPaused, timeLeft, lastUpdateTime, onComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = useCallback(() => {
    console.log('RestTimer: пауза/продолжение');
    setIsPaused(!isPaused);
    setLastUpdateTime(Date.now());
  }, [isPaused]);

  const handleSkip = useCallback(() => {
    console.log('RestTimer: пропуск отдыха');
    setTimeLeft(0);
    setIsActive(false);
    onComplete();
  }, [onComplete]);

  // Если таймер не активен или время истекло, не показываем компонент
  if (!isActive || timeLeft === 0) {
    return null;
  }

  return (
    <div className={`bg-accent-50 border-2 border-accent-200 rounded-xl p-4 ${orientation === 'landscape' ? 'mb-4' : 'mb-6'}`}>
      <div className="text-center">
        <h3 className={`font-bold text-accent-700 mb-2 ${
          orientation === 'landscape' ? 'text-lg' : 'text-xl'
        }`}>
          Время отдыха
        </h3>
        
        <div className={`font-mono font-bold text-accent-600 mb-3 ${
          orientation === 'landscape' ? 'text-3xl' : 'text-4xl'
        }`}>
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex justify-center gap-3">
          <button
            onClick={handlePause}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isPaused 
                ? 'bg-accent-500 text-white hover:bg-accent-600' 
                : 'bg-accent-200 text-accent-700 hover:bg-accent-300'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {isPaused ? 'Продолжить' : 'Пауза'}
            </span>
          </button>
          
          <button
            onClick={handleSkip}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
            <span className="text-sm font-medium">Пропустить</span>
          </button>
        </div>
        
        <p className="text-sm text-accent-600 mt-2">
          {restText}
        </p>
      </div>
    </div>
  );
};

export default RestTimer;
