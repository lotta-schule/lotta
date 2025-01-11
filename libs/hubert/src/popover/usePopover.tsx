'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';
import {
  useFloating,
  autoUpdate,
  offset,
  size,
  shift,
  flip,
  useClick,
  useDismiss,
  useRole,
  Placement,
  useInteractions,
  ReferenceType,
} from '@floating-ui/react';

export type PopoverProps = {
  initialOpen?: boolean;
  placement?: Placement;
  modal?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const usePopover = <RT extends ReferenceType = ReferenceType>({
  initialOpen = false,
  placement = 'bottom',
  modal,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: PopoverProps = {}): {
  open: boolean;
  setOpen: (open: boolean) => void;
  maxHeight: number;
  modal?: boolean;
  labelId: string | undefined;
  descriptionId: string | undefined;
  setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setDescriptionId: React.Dispatch<React.SetStateAction<string | undefined>>;
} & ReturnType<typeof useInteractions> &
  ReturnType<typeof useFloating<RT>> => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);
  const [labelId, setLabelId] = React.useState<string | undefined>();
  const [descriptionId, setDescriptionId] = React.useState<
    string | undefined
  >();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;
  const [maxHeight, setMaxHeight] = React.useState<number>(-1);

  const data = useFloating<RT>({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    strategy: 'fixed',
    middleware: [
      offset(5),
      flip({
        crossAxis: placement.includes('-'),
        fallbackAxisSideDirection: 'none',
        padding: 5,
      }),
      size({
        padding: 5,
        apply({ availableHeight }) {
          flushSync(() => setMaxHeight(availableHeight));
        },
      }),
      shift({ padding: 5 }),
    ],
  });

  const context = data.context;

  const click = useClick(context, {
    enabled: controlledOpen == null,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const interactions = useInteractions([click, dismiss, role]);

  return React.useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
      maxHeight,
      modal,
      labelId,
      descriptionId,
      setLabelId,
      setDescriptionId,
    }),
    [
      open,
      setOpen,
      interactions,
      data,
      maxHeight,
      modal,
      labelId,
      descriptionId,
    ]
  );
};
