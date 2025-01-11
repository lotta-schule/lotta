'use client';

import * as React from 'react';
import { usePopoverContext } from './Popover';
import { useMergeRefs } from '@floating-ui/react';
import { Button, ButtonProps } from '../button';

export type PopoverTriggerProps<T = ButtonProps> = React.PropsWithChildren<
  {
    asChild?: boolean;
  } & T
>;

export const PopoverTrigger = ({
  children,
  ref: refProp,
  asChild = false,
  ...props
}: PopoverTriggerProps) => {
  const context = usePopoverContext();
  const childrenRef = (children as any)?.ref;
  const ref = useMergeRefs([context.refs.setReference, refProp, childrenRef]);

  // `asChild` allows the user to pass any element as the anchor
  if (asChild && React.isValidElement<HTMLElement>(children)) {
    return React.cloneElement(
      children,
      context.getReferenceProps({
        ref,
        ...props,
        ...children.props,
        ...({
          'data-state': context.open ? 'open' : 'closed',
        } as any),
      })
    );
  }

  const endProps = context.getReferenceProps(props as any);

  return (
    <Button
      ref={ref}
      data-state={context.open ? 'open' : 'closed'}
      {...endProps}
    >
      {children}
    </Button>
  );
};
