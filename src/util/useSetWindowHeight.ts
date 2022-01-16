import * as React from 'react';

export const useSetWindowHeight = (
    elementRef: React.MutableRefObject<HTMLElement | null>
) => {
    const mainElement =
        typeof window !== 'undefined' && document.querySelector('main');
    React.useEffect(() => {
        const setHeight = () => {
            const mainElComputedStyle =
                mainElement && getComputedStyle(mainElement);
            if (elementRef.current) {
                elementRef.current.style.height = `${
                    window.innerHeight -
                    elementRef.current.offsetTop -
                    (mainElComputedStyle
                        ? parseInt(mainElComputedStyle.marginTop)
                        : 0) -
                    (mainElComputedStyle
                        ? parseInt(mainElComputedStyle.paddingBottom)
                        : 0)
                }px`;
            }
        };
        window.addEventListener('resize', setHeight);
        setHeight();
        return () => {
            window.removeEventListener('resize', setHeight);
        };
    });
};
