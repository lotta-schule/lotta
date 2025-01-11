'use client';

import * as React from 'react';
import { PopoverProps, usePopover } from './usePopover';
import { ReferenceElement } from '@floating-ui/react';

type ContextType =
  | (ReturnType<typeof usePopover> & {
      setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
      setDescriptionId: React.Dispatch<
        React.SetStateAction<string | undefined>
      >;
    })
  | null;

const PopoverContext = React.createContext<ContextType>(null);

export const usePopoverContext = () => {
  const context = React.useContext(PopoverContext);

  if (context == null) {
    throw new Error('Popover components must be wrapped in <Popover />');
  }

  return context as Exclude<ContextType, null>;
};

export const Popover = ({
  children,
  modal = false,
  reference,
  ...restOptions
}: {
  children: React.ReactNode;
} & PopoverProps & { reference?: ReferenceElement | null }) => {
  // This can accept any props as options, e.g. `placement`,
  // or other positioning options.
  const popover = usePopover({ modal, ...restOptions });

  React.useEffect(() => {
    if (reference) {
      popover.refs.setPositionReference(reference);
    }
  }, [popover.refs, reference]);

  return (
    <PopoverContext.Provider value={popover}>
      {children}
    </PopoverContext.Provider>
  );
};
