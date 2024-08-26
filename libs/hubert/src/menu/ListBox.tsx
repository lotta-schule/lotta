'use client';

import * as React from 'react';
import { useListBox, AriaListBoxOptions } from 'react-aria';
import { ComboBoxState, SelectState } from 'react-stately';
import { List, ListProps } from '../list';
import { ListBoxOption } from './ListBoxOption';
import { ListItemPreliminaryItem } from '../list/ListItemFactory';
import { Overlay } from '../popover';

export type ListBoxProps = ListProps &
  (
    | SelectState<ListItemPreliminaryItem>
    | AriaListBoxOptions<ListItemPreliminaryItem>
  ) & {
    className?: string;
    state:
      | ComboBoxState<ListItemPreliminaryItem>
      | SelectState<ListItemPreliminaryItem>;
  };

export const ListBox = ({
  className,
  state,
  ref: propRef,
  ...props
}: ListBoxProps) => {
  const internalRef = React.useRef<HTMLUListElement>(null);

  const { listBoxProps, labelProps } = useListBox(
    props as any,
    state,
    internalRef
  );

  return (
    <Overlay aria-label={(labelProps.children as any) ?? 'Vorschläge'}>
      <List
        className={className}
        {...listBoxProps}
        ref={(node) => {
          internalRef.current = node;
          if (propRef) {
            if ('current' in propRef) {
              propRef.current = node;
            } else {
              propRef(node);
            }
          }
          return () => {
            internalRef.current = null;
            if (propRef) {
              if ('current' in propRef) {
                propRef.current = null;
              } else {
                propRef(null);
              }
            }
          };
        }}
      >
        {Array.from(state.collection).map((item) => (
          <ListBoxOption key={item.key} item={item} state={state} />
        ))}
      </List>
    </Overlay>
  );
};
ListBox.displayName = 'ListBox';
