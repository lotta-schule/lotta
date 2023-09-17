import * as React from 'react';
import { mergeProps, useButton, useOverlayTrigger } from 'react-aria';
import { usePopper } from 'react-popper';
import { useOverlayTriggerState } from 'react-stately';
import { PopoverOverlay } from './PopoverOverlay';

export const usePopover = (
  triggerRef: React.RefObject<HTMLElement>,
  content: React.ReactNode,
  options: {
    placement?: 'auto' | 'top' | 'bottom' | 'left' | 'right';
    strategy?: 'fixed' | 'absolute';
    className?: string;
    style?: React.CSSProperties;
  }
) => {
  const state = useOverlayTriggerState({});

  const overlayRef = React.useRef<HTMLDivElement>(null);

  const { styles: popperStyles, attributes: popperAttributes } = usePopper(
    triggerRef.current,
    overlayRef.current,
    { placement: 'auto', strategy: 'fixed' }
  );

  const { triggerProps, overlayProps } = useOverlayTrigger(
    { type: 'dialog' },
    state,
    triggerRef
  );

  const { buttonProps } = useButton(
    {
      onPress: () => state.open(),
    },
    triggerRef
  );

  const overlay = (
    <PopoverOverlay
      {...overlayProps}
      {...popperAttributes.popper}
      style={{ ...popperStyles.popper, ...options?.style }}
      className={options?.className}
      ref={overlayRef}
      isOpen={state.isOpen}
      onClose={state.close}
    >
      {content}
    </PopoverOverlay>
  );

  return {
    control: state,
    overlay,
    buttonProps: mergeProps(buttonProps, triggerProps),
  };
};
