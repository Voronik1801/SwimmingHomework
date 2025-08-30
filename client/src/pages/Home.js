import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Trophy, Users } from 'lucide-react';
import { useOrientation } from '../hooks/useOrientation';

const Home = () => {
  const navigate = useNavigate();
  const orientation = useOrientation();

  const handleStartWorkout = () => {
    navigate('/input');
  };

  return (
    <div className={`min-h-screen flex flex-col ${orientation === 'landscape' ? 'landscape-layout' : 'portrait-layout'}`}>
      {/* Main content */}
      <div className={`flex-1 flex flex-col justify-center items-center px-6 ${
        orientation === 'landscape' ? 'py-8' : 'py-12'
      }`}>
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className={`mb-6 ${orientation === 'landscape' ? 'text-6xl' : 'text-8xl'}`}>
            🏊‍♂️
          </div>
          <h1 className={`font-bold text-primary-500 mb-4 ${
            orientation === 'landscape' ? 'text-3xl' : 'text-4xl'
          }`}>
            SwimHomework
          </h1>
          <p className={`text-gray-600 max-w-md ${
            orientation === 'landscape' ? 'text-lg' : 'text-xl'
          }`}>
            Выполняйте домашние задания по плаванию с удобным интерфейсом и подсказками
          </p>
        </div>

        {/* Features */}
        <div className={`grid gap-4 mb-8 ${
          orientation === 'landscape' ? 'grid-cols-3 w-full max-w-2xl' : 'grid-cols-1 w-full max-w-sm'
        }`}>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Play className="w-6 h-6 text-primary-500" />
            <div>
              <h3 className="font-semibold text-gray-800">Интерактивные тренировки</h3>
              <p className="text-sm text-gray-600">Пошаговое выполнение с таймерами</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Trophy className="w-6 h-6 text-accent-500" />
            <div>
              <h3 className="font-semibold text-gray-800">Адаптивный интерфейс</h3>
              <p className="text-sm text-gray-600">Оптимизировано для бассейна</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Users className="w-6 h-6 text-success-500" />
            <div>
              <h3 className="font-semibold text-gray-800">Умный парсер</h3>
              <p className="text-sm text-gray-600">Автоматическое распознавание планов</p>
            </div>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStartWorkout}
          className={`btn-primary rounded-2xl font-bold transition-all duration-200 hover:scale-105 active:scale-95 ${
            orientation === 'landscape' 
              ? 'px-12 py-4 text-xl' 
              : 'px-16 py-6 text-2xl w-full max-w-sm'
          }`}
        >
          Начать тренировку
        </button>

        {/* Instructions */}
        <div className={`mt-8 text-center text-gray-500 ${
          orientation === 'landscape' ? 'text-sm' : 'text-base'
        }`}>
          <p>1. Вставьте текст тренировки от тренера</p>
          <p>2. Проверьте распознанные упражнения</p>
          <p>3. Начните выполнение с подсказками</p>
        </div>
      </div>

      {/* Footer */}
      <footer className={`text-center py-4 text-gray-400 ${
        orientation === 'landscape' ? 'text-sm' : 'text-base'
      }`}>
        <p>© 2024 SwimHomework. Создано для пловцов</p>
      </footer>
    </div>
  );
};

export default Home;
