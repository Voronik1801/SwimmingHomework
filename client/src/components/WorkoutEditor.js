import React, { useState } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { useOrientation } from '../hooks/useOrientation';

const WorkoutEditor = ({ workout, onSave, onCancel }) => {
  const orientation = useOrientation();
  const [editedWorkout, setEditedWorkout] = useState(JSON.parse(JSON.stringify(workout)));

  // Список доступных стилей плавания
  const swimmingStyles = [
    { value: 'freestyle', label: 'Вольный стиль', emoji: '🏊‍♂️' },
    { value: 'butterfly', label: 'Баттерфляй', emoji: '🦋' },
    { value: 'breaststroke', label: 'Брасс', emoji: '🐸' },
    { value: 'backstroke', label: 'На спине', emoji: '🛌' },
    { value: 'IM', label: 'Комплекс', emoji: '🔄' },
    { value: 'карабас', label: 'Карабас', emoji: '🏊‍♀️' }
  ];

  // Список доступной экипировки
  const equipmentList = [
    { value: 'ласты', label: 'Ласты', emoji: '🦆' },
    { value: 'лопатки', label: 'Лопатки', emoji: '🏐' },
    { value: 'колобашка', label: 'Колобашка', emoji: '🟦' },
    { value: 'доска', label: 'Доска', emoji: '🟨' },
    { value: 'трубка', label: 'Трубка', emoji: '🌊' },
    { value: 'пояс', label: 'Пояс', emoji: '🟧' },
    { value: 'резина', label: 'Резина', emoji: '🟥' },
    { value: 'кистевые лопатки', label: 'Кистевые лопатки', emoji: '🏐' }
  ];

  const handleExerciseChange = (blockIndex, exerciseIndex, field, value) => {
    const newWorkout = { ...editedWorkout };
    const exercise = newWorkout.blocks[blockIndex].exercises[exerciseIndex];
    
    if (field === 'style') {
      // Обновляем стиль в первой части упражнения
      exercise.parts[0].style = value;
      // Пересчитываем общее расстояние
      exercise.totalDistance = exercise.repeats * exercise.parts[0].distance;
    } else if (field === 'equipment') {
      exercise.equipment = value;
    } else {
      exercise[field] = value;
    }
    
    setEditedWorkout(newWorkout);
  };

  const handlePartChange = (blockIndex, exerciseIndex, partIndex, field, value) => {
    const newWorkout = { ...editedWorkout };
    const part = newWorkout.blocks[blockIndex].exercises[exerciseIndex].parts[partIndex];
    part[field] = value;
    
    // Пересчитываем общее расстояние
    const exercise = newWorkout.blocks[blockIndex].exercises[exerciseIndex];
    exercise.totalDistance = exercise.parts.reduce((sum, part) => sum + part.distance, 0) * exercise.repeats;
    
    setEditedWorkout(newWorkout);
  };

  const handleSave = () => {
    onSave(editedWorkout);
  };

  const addExercise = (blockIndex) => {
    const newWorkout = { ...editedWorkout };
    const newExercise = {
      repeats: 1,
      distance: 50,
      parts: [{ style: 'freestyle', distance: 50 }],
      totalDistance: 50,
      equipment: [],
      rest: '',
      pulse: '',
      mode: '',
      description: '1×50м Вольный стиль'
    };
    
    newWorkout.blocks[blockIndex].exercises.push(newExercise);
    setEditedWorkout(newWorkout);
  };

  const removeExercise = (blockIndex, exerciseIndex) => {
    const newWorkout = { ...editedWorkout };
    newWorkout.blocks[blockIndex].exercises.splice(exerciseIndex, 1);
    setEditedWorkout(newWorkout);
  };

  const addBlock = () => {
    const newWorkout = { ...editedWorkout };
    const newBlock = {
      type: 'main',
      exercises: []
    };
    newWorkout.blocks.push(newBlock);
    setEditedWorkout(newWorkout);
  };

  const removeBlock = (blockIndex) => {
    const newWorkout = { ...editedWorkout };
    newWorkout.blocks.splice(blockIndex, 1);
    setEditedWorkout(newWorkout);
  };

  const changeBlockType = (blockIndex, newType) => {
    const newWorkout = { ...editedWorkout };
    newWorkout.blocks[blockIndex].type = newType;
    setEditedWorkout(newWorkout);
  };

  const getStyleName = (style) => {
    const styleObj = swimmingStyles.find(s => s.value === style);
    return styleObj ? styleObj.label : style;
  };

  const getStyleEmoji = (style) => {
    const styleObj = swimmingStyles.find(s => s.value === style);
    return styleObj ? styleObj.emoji : '🏊‍♂️';
  };

  return (
    <div className={`min-h-screen flex flex-col ${orientation === 'landscape' ? 'landscape-layout' : 'portrait-layout'}`}>
      <div className="flex-1 px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`font-bold text-gray-800 ${
            orientation === 'landscape' ? 'text-2xl' : 'text-3xl'
          }`}>
            Редактирование тренировки
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="btn-secondary px-4 py-2 rounded-lg font-medium"
            >
              <X className="w-4 h-4 mr-1" />
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="btn-primary px-4 py-2 rounded-lg font-medium"
            >
              <Save className="w-4 h-4 mr-1" />
              Сохранить
            </button>
          </div>
        </div>

        {/* Workout Info */}
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-primary-700 mb-2">Информация о тренировке</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название
              </label>
              <input
                type="text"
                value={editedWorkout.title}
                onChange={(e) => setEditedWorkout({ ...editedWorkout, title: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Интенсивность
              </label>
              <select
                value={editedWorkout.intensity}
                onChange={(e) => setEditedWorkout({ ...editedWorkout, intensity: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="🟢">Низкая</option>
                <option value="🟡">Средняя</option>
                <option value="🔴">Высокая</option>
              </select>
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {editedWorkout.blocks.map((block, blockIndex) => (
            <div key={blockIndex} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-gray-800 capitalize">
                    {block.type === 'warmup' ? 'Разминка' : 
                     block.type === 'main' ? 'Основная часть' : 
                     block.type === 'technical' ? 'Техническая часть' :
                     block.type === 'cooldown' ? 'Заминка' : block.type}
                  </h4>
                  <select
                    value={block.type}
                    onChange={(e) => changeBlockType(blockIndex, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="warmup">Разминка</option>
                    <option value="main">Основная часть</option>
                    <option value="technical">Техническая часть</option>
                    <option value="cooldown">Заминка</option>
                    <option value="freestyle">Свободное плавание</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => addExercise(blockIndex)}
                    className="btn-success px-3 py-1 rounded-lg text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Добавить упражнение
                  </button>
                  {editedWorkout.blocks.length > 1 && (
                    <button
                      onClick={() => removeBlock(blockIndex)}
                      className="btn-danger px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Удалить блок
                    </button>
                  )}
                </div>
              </div>
              
                              <div className="space-y-4">
                  {block.exercises.map((exercise, exerciseIndex) => (
                    <div key={exerciseIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium text-gray-700">Упражнение {exerciseIndex + 1}</h5>
                        <button
                          onClick={() => removeExercise(blockIndex, exerciseIndex)}
                          className="btn-danger px-2 py-1 rounded text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Основные параметры */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Повторения
                          </label>
                          <input
                            type="number"
                            value={exercise.repeats}
                            onChange={(e) => handleExerciseChange(blockIndex, exerciseIndex, 'repeats', parseInt(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            min="1"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Дистанция (м)
                          </label>
                          <input
                            type="number"
                            value={exercise.parts[0].distance}
                            onChange={(e) => handlePartChange(blockIndex, exerciseIndex, 0, 'distance', parseInt(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            min="25"
                            step="25"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Стиль плавания
                          </label>
                          <select
                            value={exercise.parts[0].style}
                            onChange={(e) => handleExerciseChange(blockIndex, exerciseIndex, 'style', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          >
                            {swimmingStyles.map((style) => (
                              <option key={style.value} value={style.value}>
                                {style.emoji} {style.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Дополнительные параметры */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Экипировка
                          </label>
                          <select
                            multiple
                            value={exercise.equipment || []}
                            onChange={(e) => {
                              const selected = Array.from(e.target.selectedOptions, option => option.value);
                              handleExerciseChange(blockIndex, exerciseIndex, 'equipment', selected);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            size="3"
                          >
                            {equipmentList.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.emoji} {item.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Отдых
                          </label>
                          <input
                            type="text"
                            value={exercise.rest || ''}
                            onChange={(e) => handleExerciseChange(blockIndex, exerciseIndex, 'rest', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="30 сек"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Пульсовая зона
                          </label>
                          <input
                            type="text"
                            value={exercise.pulse || ''}
                            onChange={(e) => handleExerciseChange(blockIndex, exerciseIndex, 'pulse', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="П 22-23"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Предварительный просмотр */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getStyleEmoji(exercise.parts[0].style)}</span>
                          <span className="font-medium">
                            {exercise.repeats}×{exercise.parts[0].distance}м {getStyleName(exercise.parts[0].style)}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-primary-600">
                          {exercise.totalDistance}м
                        </span>
                      </div>
                      {exercise.equipment && exercise.equipment.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          Инвентарь: {exercise.equipment.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Кнопка добавления нового блока */}
        <div className="mt-6">
          <button
            onClick={addBlock}
            className="btn-primary w-full py-3 rounded-xl font-medium"
          >
            <Plus className="w-5 h-5 mr-2 inline" />
            Добавить новый блок
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutEditor;
