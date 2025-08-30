export const formatTime = (seconds) => {
  if (seconds < 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${seconds} сек`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes} мин`;
  }
  
  return `${minutes} мин ${remainingSeconds} сек`;
};

export const parseTimeString = (timeString) => {
  // Парсинг строк типа "22-23", "15 сек", "2 мин"
  const patterns = {
    // 22-23 (пульс)
    pulse: /^(\d+)-(\d+)$/,
    // 15 сек, 30 сек
    seconds: /^(\d+)\s*сек/,
    // 2 мин, 5 мин
    minutes: /^(\d+)\s*мин/,
    // 1:30, 2:45 (время)
    time: /^(\d+):(\d+)$/
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    const match = timeString.match(pattern);
    if (match) {
      switch (type) {
        case 'pulse':
          return { type: 'pulse', min: parseInt(match[1]), max: parseInt(match[2]) };
        case 'seconds':
          return { type: 'duration', seconds: parseInt(match[1]) };
        case 'minutes':
          return { type: 'duration', seconds: parseInt(match[1]) * 60 };
        case 'time':
          return { type: 'time', minutes: parseInt(match[1]), seconds: parseInt(match[2]) };
      }
    }
  }

  return { type: 'unknown', value: timeString };
};
