import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Settings, Home } from 'lucide-react';
import { useOrientation } from '../hooks/useOrientation';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orientation = useOrientation();

  const isHomePage = location.pathname === '/';
  const isWorkoutPage = location.pathname === '/workout';

  const handleBack = () => {
    if (isWorkoutPage) {
      navigate('/input');
    } else {
      navigate('/');
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleSettings = () => {
    // TODO: Implement settings modal
    console.log('Settings clicked');
  };

  return (
    <header className={`bg-white border-b border-gray-200 safe-area ${orientation === 'landscape' ? 'h-16' : 'h-20'}`}>
      <div className={`flex items-center justify-between px-4 ${orientation === 'landscape' ? 'h-full' : 'h-full'}`}>
        {/* Left side */}
        <div className="flex items-center">
          {!isHomePage && (
            <button
              onClick={handleBack}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                orientation === 'landscape' ? 'w-10 h-10' : 'w-12 h-12'
              }`}
              aria-label="Назад"
            >
              <ArrowLeft className={`${orientation === 'landscape' ? 'w-5 h-5' : 'w-6 h-6'}`} />
            </button>
          )}
        </div>

        {/* Center - Logo/Title */}
        <div className="flex-1 flex justify-center">
          <h1 className={`font-bold text-primary-500 ${
            orientation === 'landscape' ? 'text-xl' : 'text-2xl'
          }`}>
            SwimHomework
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {!isHomePage && (
            <button
              onClick={handleHome}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                orientation === 'landscape' ? 'w-10 h-10' : 'w-12 h-12'
              }`}
              aria-label="Главная"
            >
              <Home className={`${orientation === 'landscape' ? 'w-5 h-5' : 'w-6 h-6'}`} />
            </button>
          )}
          
          <button
            onClick={handleSettings}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
              orientation === 'landscape' ? 'w-10 h-10' : 'w-12 h-12'
            }`}
            aria-label="Настройки"
          >
            <Settings className={`${orientation === 'landscape' ? 'w-5 h-5' : 'w-6 h-6'}`} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
