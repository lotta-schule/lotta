'use client';

import * as React from 'react';
import { mergeProps, useFocus, useMenuItem } from 'react-aria';
import { TreeState, Item as AriaItem } from 'react-stately';
import { Node } from '@react-types/shared';
import { ListItem } from '../list';

import styles from './Menu.module.scss';

export const Item = AriaItem;

export type MenuItemProps = {
  item: Node<object>;
  state: TreeState<object>;
  isDisabled?: boolean;
  isDivider?: boolean;
  closeOnSelect?: boolean;
  ref?: React.Ref<HTMLLIElement>;
  onAction?: (_key: React.Key) => void;
  onClose?: () => void;
};

export const MenuItem = React.memo(
  ({
    item,
    state,
    isDisabled = false,
    isDivider = false,
    closeOnSelect,
    onAction,
    onClose,
    ref: propRef,
  }: MenuItemProps) => {
    // Get props for the menu item element
    const defaultRef = React.useRef<HTMLLIElement>(null);

    const ref = (propRef || defaultRef) as React.RefObject<HTMLLIElement>;

    const { menuItemProps } = useMenuItem(
      {
        key: item.key,
        isDisabled: isDisabled || isDivider,
        closeOnSelect,
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

    const mergedProps = mergeProps(menuItemProps, focusProps);
    return (
      <ListItem
        {...mergedProps}
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
