// Mostly taken from:
//https://github.com/adobe/react-spectrum/blob/1697a7fef3516f7a194f43b75edb858589ef6535/packages/%40react-aria/overlays/src/usePreventScroll.ts#L45
import * as React from 'react';
import { chain } from 'react-aria';

interface PreventScrollOptions {
  /** Whether the scroll lock is disabled. */
  isDisabled?: boolean;
}

// The number of active usePreventScroll calls. Used to determine whether to revert back to the original page style/scroll position
let preventScrollCount = 0;
let restore: () => void | undefined;

/**
 * Prevents scrolling on the document body on mount, and
 * restores it on unmount. Also ensures that content does not
 * shift due to the scrollbars disappearing.
 */
export const usePreventScroll = ({ isDisabled }: PreventScrollOptions = {}) => {
  React.useLayoutEffect(() => {
    if (isDisabled) {
      return;
    }

    preventScrollCount++;
    if (preventScrollCount === 1) {
      restore = preventScrollStandard();
    }

    return () => {
      preventScrollCount--;
      if (preventScrollCount === 0) {
        restore();
      }
    };
  }, [isDisabled]);
};

// For most browsers, all we need to do is set `overflow: hidden` on the root element, and
// add some padding to prevent the page from shifting when the scrollbar is hidden.
function preventScrollStandard() {
  return chain(
    setStyle(
      document.documentElement,
      'paddingRight',
      `${window.innerWidth - document.documentElement.clientWidth}px`
    ),
    setStyle(document.documentElement, 'overflow', 'hidden')
  );
}

// Sets a CSS property on an element, and returns a function to revert it to the previous value.
function setStyle<T extends keyof CSSStyleDeclaration>(
  element: HTMLElement,
  style: T,
  value: CSSStyleDeclaration[T]
) {
  const cur = element.style[style];
  element.style[style] = value;

  return () => {
    element.style[style] = cur;
  };
}
