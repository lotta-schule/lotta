import * as React from 'react';

export const useSetWindowHeight = (
    elementRef: React.MutableRefObject<HTMLElement | null>
) => {
    React.useEffect(() => {
        const setHeight = () => {
            if (elementRef.current) {
                elementRef.current.style.height = `${
                    window.innerHeight - elementRef.current.offsetTop
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
