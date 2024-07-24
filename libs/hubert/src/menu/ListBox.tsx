'use client';

import * as React from 'react';
import { useListBox, AriaListBoxOptions } from 'react-aria';
import { ComboBoxState, SelectState } from 'react-stately';
import { MenuList } from '../menu';
import { ListBoxOption } from './ListBoxOption';
import { ListItemPreliminaryItem } from '../list/ListItemFactory';

export type ListBoxProps = AriaListBoxOptions<ListItemPreliminaryItem> & {
  className?: string;
  state:
    | ComboBoxState<ListItemPreliminaryItem>
    | SelectState<ListItemPreliminaryItem>;
};

export const ListBox = React.forwardRef(
  (
    { className, state, ...props }: ListBoxProps,
    forwardedRef: React.Ref<HTMLUListElement | null>
  ) => {
    const ref = React.useRef<HTMLUListElement>(null!);

    React.useImperativeHandle(forwardedRef, () => ref.current);

    const { listBoxProps, labelProps } = useListBox(props, state, ref);

    return (
      <div aria-label={(labelProps.children as any) ?? 'Vorschläge'}>
        <MenuList className={className} {...listBoxProps}>
          {Array.from(state.collection).map((item) => (
            <ListBoxOption key={item.key} item={item} state={state} />
          ))}
        </MenuList>
      </div>
    );
  }
);
ListBox.displayName = 'ListBox';
