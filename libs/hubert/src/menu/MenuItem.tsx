'use client';

import * as React from 'react';
import { mergeProps, useFocus, useMenuItem } from 'react-aria';
import { TreeState, Item as AriaItem } from 'react-stately';
import { Node } from '@react-types/shared';
import { ListItem } from '../list';

import styles from './MenuList.module.scss';

export const Item = AriaItem;

export interface MenuItemProps {
  item: Node<object>;
  state: TreeState<object>;
  isDisabled?: boolean;
  isDivider?: boolean;
  onAction?: (_key: React.Key) => void;
  onClose?: () => void;
}

export const MenuItem = React.forwardRef(
  (
    {
      item,
      state,
      isDisabled = false,
      isDivider = false,
      onAction,
      onClose,
    }: MenuItemProps,
    forwardedRef: React.Ref<HTMLLIElement | null>
  ) => {
    // Get props for the menu item element
    const ref = React.useRef<HTMLLIElement>(null);

    React.useImperativeHandle(forwardedRef, () => ref.current);

    const { menuItemProps } = useMenuItem(
      {
        key: item.key,
        isDisabled: isDisabled || isDivider,
        onAction,
        onClose,
      },
      state,
      ref
    );

    // Handle focus events so we can apply highlighted
    // style to the focused menu item
    const [isFocused, setFocused] = React.useState(false);
    const { focusProps } = useFocus({
      onFocusChange: setFocused,
      isDisabled: isDisabled || isDivider,
    });

    const leftSection = Array.isArray(item.rendered) ? item.rendered[0] : null;
    const content = Array.isArray(item.rendered)
      ? item.rendered[1]
      : item.rendered;

    return (
      <ListItem
        {...mergeProps(menuItemProps, focusProps)}
        ref={ref}
        isSelected={isFocused}
        leftSection={<div className={styles.leftSection}>{leftSection}</div>}
      >
        {content}
      </ListItem>
    );
  }
);
MenuItem.displayName = 'MenuItem';
