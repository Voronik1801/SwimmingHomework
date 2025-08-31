import { useState, useEffect } from 'react';

export const useOrientation = () => {
  const [orientation, setOrientation] = useState('portrait');
  // const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const determineOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      return isLandscape ? 'landscape' : 'portrait';
    };

    const handleOrientationChange = () => {
      // setIsChanging(true);
      
      // Small delay to let the orientation change complete
      setTimeout(() => {
        const newOrientation = determineOrientation();
        setOrientation(newOrientation);
        // setIsChanging(false);
      }, 100);
    };

    const handleResize = () => {
      const newOrientation = determineOrientation();
      if (newOrientation !== orientation) {
        setOrientation(newOrientation);
      }
    };

    // Set initial orientation
    setOrientation(determineOrientation());

    // Add event listeners
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [orientation]);

  return orientation;
};
