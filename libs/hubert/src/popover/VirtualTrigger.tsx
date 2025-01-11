import * as React from 'react';
import { ClientRectObject } from '@floating-ui/react';
import { usePopoverContext } from './Popover';

export type VirtualTriggerProps = ClientRectObject;

export const VirtualTrigger = React.memo((props: VirtualTriggerProps) => {
  const {
    refs: { setReference },
  } = usePopoverContext();

  const virtualElement = React.useMemo(
    () => ({
      getBoundingClientRect: () => props,
    }),
    [props]
  );

  React.useEffect(() => {
    setReference(virtualElement);

    return () => {
      setReference(null);
    };
  }, [virtualElement, setReference]);

  return null;
});
VirtualTrigger.displayName = 'VirtualTrigger';
