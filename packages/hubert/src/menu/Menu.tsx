'use client';

import * as React from 'react';
import { useTreeState } from '@react-stately/tree';
import { CollectionChildren } from '@react-types/shared';
import { useMenu } from '@react-aria/menu';
import { mergeProps } from '@react-aria/utils';
import { MenuItem } from './MenuItem';
import { List, ListProps } from '../list';
import clsx from 'clsx';

import styles from './Menu.module.scss';

export type WithDescription =
  | {
      /**
       * Provide a short title describing the menu.
       * This is a shothand for the `aria-label` attribute.
       */
      title: string;
    }
  | { 'aria-label': string }
  | { 'aria-labelledby': string };

export type MenuProps = ListProps &
  WithDescription & {
    children: CollectionChildren<object>;
    onClose?: () => void;
    onAction?: (_key: React.Key) => void;
  };

export const Menu = React.forwardRef(
  (
    { className, title, onAction, onClose, ...props }: MenuProps,
    forwardedRef: React.Ref<HTMLUListElement | null>
  ) => {
    const ref = React.useRef<HTMLUListElement>(null);

    React.useImperativeHandle(forwardedRef, () => ref.current);

    const state = useTreeState({
      children: props.children,
      selectionMode: 'none',
    });

    const { menuProps } = useMenu(
      {
        'aria-label': title,
        ...props,
      },
      state,
      ref
    );

    return (
      <List
        className={clsx(styles.root, className)}
        {...mergeProps(menuProps, props)}
        ref={ref}
      >
        {[...state.collection].map((item) => (
          <MenuItem
            key={item.key}
            item={item as any}
            state={state}
            onAction={onAction}
            onClose={onClose}
          />
        ))}
        {props.children}
      </List>
    );
  }
);
Menu.displayName = 'Menu';
