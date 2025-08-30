import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types for workout data
const createWorkoutStore = (set, get) => ({
  // Current workout state
  currentWorkout: null,
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  currentPartIndex: 0, // Индекс текущей части упражнения
  isWorkoutActive: false,
  isPaused: false,
  startTime: null,
  totalDistance: 0,
  completedDistance: 0,
  skippedExercises: [], // Массив пропущенных упражнений
  showCompleteModal: false, // Флаг для показа модального окна завершения

  // Rest timer state
  isRestActive: false,
  restTimeLeft: 0,
  currentRestText: '',

  // Адаптивные интервалы
  completionInterval: 50, // Интервал отметки "выполнено" в метрах
  availableIntervals: [25, 50, 100, 150, 200], // Доступные интервалы

  // User preferences
  preferences: {
    orientation: 'auto',
    buttonPosition: 'right',
    soundEnabled: true,
    vibrationEnabled: true,
    keepScreenOn: true,
    fontSize: 'large',
    defaultCompletionInterval: 50 // Интервал по умолчанию
  },

  // Actions
  setCurrentWorkout: (workout) => set({ currentWorkout: workout }),
  
  startWorkout: () => set({ 
    isWorkoutActive: true, 
    startTime: Date.now(),
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    currentPartIndex: 0,
    completedDistance: 0,
    skippedExercises: [],
    showCompleteModal: false
  }),

  pauseWorkout: () => set({ isPaused: true }),
  resumeWorkout: () => set({ isPaused: false }),

  // Установка интервала выполнения
  setCompletionInterval: (interval) => set({ completionInterval: interval }),

  // Завершение части упражнения
  completeExercisePart: () => {
    const { currentWorkout, completionInterval } = get();
    if (!currentWorkout) return;

    const currentExercise = get().getCurrentExercise();
    if (!currentExercise) return;

    // Вычисляем прогресс в рамках текущего упражнения
    const currentProgress = get().getCurrentExerciseProgress();
    const nextProgress = currentProgress + completionInterval;
    
    // Проверяем, завершено ли упражнение
    if (nextProgress >= currentExercise.totalDistance) {
      // Проверяем, есть ли отдых после завершения упражнения
      if (currentExercise.rest) {
        // Запускаем таймер отдыха
        set({
          isRestActive: true,
          currentRestText: currentExercise.rest,
          restTimeLeft: get().parseRestTime(currentExercise.rest)
        });
      } else {
        // Переходим к следующему упражнению
        get().moveToNextExercise();
      }
    } else {
      // Обновляем прогресс текущего упражнения
      set({
        completedDistance: get().completedDistance + completionInterval
      });
    }
  },

  // Переход к следующему упражнению
  moveToNextExercise: () => {
    const { currentWorkout } = get();
    const currentExerciseIndex = get().currentExerciseIndex;
    const currentSetIndex = get().currentSetIndex;
    
    const currentBlock = currentWorkout.blocks[currentExerciseIndex];
    const nextSetIndex = currentSetIndex + 1;
    
    if (nextSetIndex >= currentBlock.exercises.length) {
      // Переходим к следующему блоку
      const nextExerciseIndex = currentExerciseIndex + 1;
      
      if (nextExerciseIndex >= currentWorkout.blocks.length) {
        // Тренировка завершена - все блоки пройдены
        set({
          isWorkoutActive: false,
          isPaused: false,
          currentExerciseIndex: 0,
          currentSetIndex: 0,
          currentPartIndex: 0,
          showCompleteModal: true // Добавляем флаг для показа модального окна
        });
        return;
      } else {
        // Переходим к следующему блоку
        set({
          currentExerciseIndex: nextExerciseIndex,
          currentSetIndex: 0,
          currentPartIndex: 0
        });
      }
    } else {
      // Переходим к следующему упражнению в текущем блоке
      set({
        currentSetIndex: nextSetIndex,
        currentPartIndex: 0
      });
    }
  },

  // Парсинг времени отдыха
  parseRestTime: (text) => {
    const match = text.match(/(\d+)\s*(сек|мин)/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      return unit === 'мин' ? value * 60 : value;
    }
    return 0;
  },

  // Завершение отдыха
  completeRest: () => {
    set({
      isRestActive: false,
      restTimeLeft: 0,
      currentRestText: ''
    });
    get().moveToNextExercise();
  },

  // Старый метод для обратной совместимости
  completeExercise: () => {
    const { currentWorkout, currentExerciseIndex, currentSetIndex } = get();
    if (!currentWorkout) return;

    const currentExercise = currentWorkout.blocks[currentExerciseIndex];
    const nextSetIndex = currentSetIndex + 1;
    const nextExerciseIndex = nextSetIndex >= currentExercise.repeats 
      ? currentExerciseIndex + 1 
      : currentExerciseIndex;

    set({
      currentSetIndex: nextSetIndex >= currentExercise.repeats ? 0 : nextSetIndex,
      currentExerciseIndex: nextExerciseIndex,
      completedDistance: get().completedDistance + currentExercise.distance
    });
  },

  skipExercise: () => {
    const currentExerciseIndex = get().currentExerciseIndex;
    const currentSetIndex = get().currentSetIndex;
    
    // Добавляем пропущенное упражнение в список
    const currentExercise = get().getCurrentExercise();
    if (currentExercise) {
      set(state => ({
        skippedExercises: [...state.skippedExercises, {
          blockIndex: currentExerciseIndex,
          exerciseIndex: currentSetIndex,
          exercise: currentExercise
        }]
      }));
    }
    
    get().moveToNextExercise();
  },

  finishWorkout: () => set({ 
    isWorkoutActive: false,
    isPaused: false 
  }),

  resetWorkout: () => set({
    currentWorkout: null,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    currentPartIndex: 0,
    isWorkoutActive: false,
    isPaused: false,
    startTime: null,
    completedDistance: 0,
    skippedExercises: [],
    isRestActive: false,
    restTimeLeft: 0,
    currentRestText: '',
    showCompleteModal: false
  }),

  // Сброс флага модального окна
  hideCompleteModal: () => set({ showCompleteModal: false }),

  updatePreferences: (newPreferences) => set(state => ({
    preferences: { ...state.preferences, ...newPreferences }
  })),

  // Getters
  getCurrentExercise: () => {
    const { currentWorkout, currentExerciseIndex, currentSetIndex } = get();
    if (!currentWorkout || currentExerciseIndex >= currentWorkout.blocks.length) {
      return null;
    }
    const currentBlock = currentWorkout.blocks[currentExerciseIndex];
    if (!currentBlock.exercises || currentSetIndex >= currentBlock.exercises.length) {
      return null;
    }
    return currentBlock.exercises[currentSetIndex];
  },

  // Получение текущего блока
  getCurrentBlock: () => {
    const { currentWorkout, currentExerciseIndex } = get();
    if (!currentWorkout || currentExerciseIndex >= currentWorkout.blocks.length) {
      return null;
    }
    return currentWorkout.blocks[currentExerciseIndex];
  },

  // Получение прогресса текущего упражнения
  getCurrentExerciseProgress: () => {
    const { currentWorkout, completedDistance } = get();
    const currentExerciseIndex = get().currentExerciseIndex;
    const currentSetIndex = get().currentSetIndex;
    if (!currentWorkout || currentExerciseIndex >= currentWorkout.blocks.length) {
      return 0;
    }

    // Вычисляем общую дистанцию до текущего упражнения
    let totalCompletedBefore = 0;
    
    // Дистанция всех предыдущих блоков
    for (let i = 0; i < currentExerciseIndex; i++) {
      totalCompletedBefore += currentWorkout.blocks[i].exercises.reduce((sum, exercise) => {
        return sum + exercise.totalDistance;
      }, 0);
    }

    // Дистанция предыдущих упражнений в текущем блоке
    const currentBlock = currentWorkout.blocks[currentExerciseIndex];
    for (let i = 0; i < currentSetIndex; i++) {
      if (currentBlock.exercises[i]) {
        totalCompletedBefore += currentBlock.exercises[i].totalDistance;
      }
    }

    // Возвращаем прогресс только для текущего упражнения
    const currentProgress = completedDistance - totalCompletedBefore;
    return Math.max(0, currentProgress); // Не допускаем отрицательные значения
  },

  // Получение доступных интервалов для текущего упражнения
  getAvailableIntervalsForCurrentExercise: () => {
    const currentExercise = get().getCurrentExercise();
    if (!currentExercise) return [50];

    const totalDistance = currentExercise.totalDistance;
    const availableIntervals = get().availableIntervals;
    
    return availableIntervals.filter(interval => 
      interval <= totalDistance && totalDistance % interval === 0
    );
  },

  // Проверка, можно ли завершить упражнение
  canCompleteExercise: () => {
    const currentExercise = get().getCurrentExercise();
    if (!currentExercise) return false;

    const currentProgress = get().getCurrentExerciseProgress();
    const { completionInterval } = get();
    
    return currentProgress + completionInterval <= currentExercise.totalDistance;
  },

  // Общий прогресс тренировки (включая пропущенные упражнения)
  getProgress: () => {
    const { currentWorkout, completedDistance, skippedExercises } = get();
    if (!currentWorkout) return 0;

    let totalDistance = 0;
    let completedDistanceTotal = completedDistance;

    // Добавляем дистанцию пропущенных упражнений
    skippedExercises.forEach(skipped => {
      completedDistanceTotal += skipped.exercise.totalDistance;
    });

    currentWorkout.blocks.forEach((block) => {
      totalDistance += block.exercises.reduce((sum, exercise) => {
        return sum + exercise.totalDistance;
      }, 0);
    });

    return totalDistance > 0 ? (completedDistanceTotal / totalDistance) * 100 : 0;
  },

  getWorkoutTime: () => {
    const { startTime, isWorkoutActive } = get();
    if (!startTime || !isWorkoutActive) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  },



  // Получение информации о текущем интервале
  getCurrentIntervalInfo: () => {
    const currentExercise = get().getCurrentExercise();
    if (!currentExercise) return null;

    const currentProgress = get().getCurrentExerciseProgress();
    const { completionInterval } = get();
    
    return {
      currentProgress,
      nextProgress: currentProgress + completionInterval,
      totalDistance: currentExercise.totalDistance,
      interval: completionInterval,
      canComplete: currentProgress + completionInterval <= currentExercise.totalDistance
    };
  }
});

export const useWorkoutStore = create(
  persist(createWorkoutStore, {
    name: 'swim-homework-store',
    partialize: (state) => ({
      preferences: state.preferences,
      currentWorkout: state.currentWorkout,
      completionInterval: state.completionInterval
    })
  })
);
