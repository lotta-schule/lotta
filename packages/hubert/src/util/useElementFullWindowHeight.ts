import * as React from 'react';

export const useElementFullWindowHeight = (
  elementRef: React.MutableRefObject<HTMLElement | null>
) => {
  const [height, setHeight] = React.useState<number | null>(null);

  const updateHeight = React.useCallback(() => {
    if (elementRef.current) {
      const mainElement =
        typeof window !== 'undefined' && document.querySelector('main');
      const mainElComputedStyle = mainElement && getComputedStyle(mainElement);
      const height =
        window.innerHeight -
        elementRef.current.offsetTop -
        (mainElComputedStyle ? parseInt(mainElComputedStyle.marginTop) : 0) -
        (mainElComputedStyle ? parseInt(mainElComputedStyle.paddingBottom) : 0);

      setHeight(height);
    }
  }, []);

  React.useEffect(() => {
    window.addEventListener('resize', updateHeight);
    updateHeight();
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, [updateHeight]);

  return height;
};
