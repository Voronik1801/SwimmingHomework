import React from 'react';

// Функция для получения эмодзи экипировки
const getEquipmentEmoji = (equipment) => {
  const equipmentMap = {
    'ласты': '🦆',
    'лопатки': '🏐',
    'колобашка': '🟦',
    'доска': '🟨',
    'трубка': '🌊',
    'пояс': '🟧',
    'резина': '🟥',
    'кистевые лопатки': '🏐'
  };
  return equipmentMap[equipment] || '🏊‍♂️';
};

const EquipmentDisplay = ({ equipment, styleName }) => {
  if (!equipment || equipment.length === 0) {
    return (
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800">
          {styleName}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      {/* Стиль плавания */}
      <div className="text-2xl font-bold text-gray-800 mb-3">
        {styleName}
      </div>
      
      {/* Экипировка */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
        <div className="text-sm text-primary-600 mb-2 font-medium">
          Инвентарь:
        </div>
        <div className="flex justify-center gap-3 flex-wrap">
          {equipment.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className="text-2xl">
                {getEquipmentEmoji(item)}
              </div>
              <div className="text-xs text-primary-700 font-medium">
                {item}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EquipmentDisplay;
