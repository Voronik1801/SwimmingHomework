import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useWorkoutStore } from '../stores/workoutStore';

const IntervalSelector = ({ orientation }) => {
  const { 
    completionInterval, 
    setCompletionInterval, 
    getAvailableIntervalsForCurrentExercise 
  } = useWorkoutStore();

  const availableIntervals = getAvailableIntervalsForCurrentExercise();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleIntervalChange = (interval) => {
    setCompletionInterval(interval);
    setIsOpen(false);
  };

  const formatInterval = (interval) => {
    return `${interval}м`;
  };

  return (
    <div className={`relative ${orientation === 'landscape' ? 'mb-4' : 'mb-6'}`}>
      <div className="text-center">
        <label className={`block text-gray-600 mb-2 ${
          orientation === 'landscape' ? 'text-sm' : 'text-base'
        }`}>
          Интервал выполнения:
        </label>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors ${
            orientation === 'landscape' ? 'text-sm' : 'text-base'
          }`}
        >
          <span className="font-semibold text-primary-700">
            {formatInterval(completionInterval)}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-primary-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-primary-600" />
          )}
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
          <div className="py-2">
            {availableIntervals.map((interval) => (
              <button
                key={interval}
                onClick={() => handleIntervalChange(interval)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                  interval === completionInterval 
                    ? 'bg-primary-50 text-primary-700 font-semibold' 
                    : 'text-gray-700'
                }`}
              >
                {formatInterval(interval)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay для закрытия */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default IntervalSelector;
