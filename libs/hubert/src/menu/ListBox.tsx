'use client';

import * as React from 'react';
import { useListBox, AriaListBoxOptions } from 'react-aria';
import { ComboBoxState, SelectState } from 'react-stately';
import { List, ListProps } from '../list';
import { ListBoxOption, ListBoxOptionProps } from './ListBoxOption';
import { ListItemPreliminaryItem } from '../list/ListItemFactory';
import { useMergeRefs } from '@floating-ui/react';

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
  const internalRef = React.useRef<HTMLUListElement | null>(null);

  const ref = useMergeRefs([internalRef, propRef]);

  const { listBoxProps } = useListBox(
    props as AriaListBoxOptions<ListItemPreliminaryItem>,
    state,
    internalRef
  );

  return (
    <List
      className={className}
      aria-label={props.label ?? 'Vorschläge'}
      {...listBoxProps}
      ref={ref}
    >
      {Array.from(state.collection).map((item) => (
        <ListBoxOption
          key={item.key}
          item={item as ListBoxOptionProps['item']}
          state={state}
        />
      ))}
    </List>
  );
};
ListBox.displayName = 'ListBox';
