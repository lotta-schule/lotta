import * as React from 'react';

export const useSetWindowHeight = (
    elementRef: React.MutableRefObject<HTMLElement | null>
) => {
    const mainElement = (typeof window !== 'undefined' &&
        document.querySelector('main')) as HTMLElement;
    React.useEffect(() => {
        const setHeight = () => {
            const mainElComputedStyle = getComputedStyle(mainElement);
            if (elementRef.current) {
                elementRef.current.style.height = `${
                    window.innerHeight -
                    elementRef.current.offsetTop -
                    parseInt(mainElComputedStyle.marginTop) -
                    parseInt(mainElComputedStyle.paddingBottom)
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
