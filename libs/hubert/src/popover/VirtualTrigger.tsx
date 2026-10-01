import * as React from 'react';
import { ClientRectObject } from '@floating-ui/react';
import { usePopoverContext } from './Popover';

export type VirtualTriggerProps = ClientRectObject;

export const VirtualTrigger = React.memo((props: VirtualTriggerProps) => {
  const { refs } = usePopoverContext();

  const virtualElement = React.useMemo(
    () => ({
      getBoundingClientRect: () => props,
    }),
    [props]
  );

  React.useEffect(() => {
    refs.setReference(virtualElement);

    return () => {
      refs.setReference(null);
    };
  }, [virtualElement, refs]);

  return null;
});
VirtualTrigger.displayName = 'VirtualTrigger';
