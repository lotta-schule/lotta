import * as React from 'react';

export interface WindowSize {
  innerHeight: number;
  innerWidth: number;
  outerHeight: number;
  outerWidth: number;
}

const getSize = (): WindowSize => ({
  innerHeight: window.innerHeight,
  innerWidth: window.innerWidth,
  outerHeight: window.outerHeight,
  outerWidth: window.outerWidth,
});

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = React.useState(getSize());

  const handleResize = React.useCallback(() => {
    setWindowSize(getSize());
  }, []);

  React.useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return windowSize;
};
