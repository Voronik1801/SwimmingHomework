import React from 'react';

const ProgressBar = ({ progress }) => {
  return (
    <div className="progress-bar">
      <div 
        className="progress-fill"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
};

export default ProgressBar;
