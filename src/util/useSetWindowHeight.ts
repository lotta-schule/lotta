import { MutableRefObject, useEffect } from 'react';

export const useSetWindowHeight = (
    elementRef: MutableRefObject<HTMLElement | null>
) => {
    useEffect(() => {
        if (elementRef.current) {
            const mainEl = document.querySelector('main');
            const paddingBottom = mainEl
                ? parseInt(getComputedStyle(mainEl).paddingBottom)
                : 0;
            elementRef.current.style.height = `${
                window.innerHeight -
                elementRef.current.offsetTop -
                paddingBottom
            }px`;
        }
    });
};
