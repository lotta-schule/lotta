'use client';

import * as React from 'react';
import { usePopoverContext } from './Popover';
import { useMergeRefs, FloatingFocusManager } from '@floating-ui/react';
import { Overlay } from './Overlay';

export const PopoverContent = ({
  style,
  ref: refProp,
  role = undefined,
  ...props
}: React.HTMLProps<HTMLDivElement>) => {
  const {
    context: floatingContext,
    maxHeight,
    open,
    ...context
  } = usePopoverContext();
  const ref = useMergeRefs([context.refs.setFloating, refProp]);

  React.useEffect(() => {
    if (open) {
      context.elements.floating?.showPopover();
    } else {
      context.elements.floating?.hidePopover();
    }
  }, [context.elements.floating, open]);

  const floatingProps = context.getFloatingProps({ ...props, role });

  return (
    <FloatingFocusManager
      context={floatingContext}
      modal={context.modal}
      disabled={!context.modal}
    >
      <Overlay
        ref={ref}
        popover="manual"
        style={{
          minWidth: 'max-content',
          ...context.floatingStyles,
          maxHeight: `min(${maxHeight}, 50vh)`,
          overflow: 'auto',
          color: 'inherit',
          ...style,
        }}
        hidden={!open}
        aria-labelledby={context.labelId}
        aria-describedby={context.descriptionId}
        {...floatingProps}
      >
        {props.children}
      </Overlay>
    </FloatingFocusManager>
  );
};
