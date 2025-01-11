'use client';

import * as React from 'react';
import { CollectionChildren } from '@react-types/shared';
import { useTreeState } from 'react-stately';
import { mergeProps, useMenu } from 'react-aria';
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
    ref?: React.Ref<HTMLElement>;
    closeOnAction?: boolean;
    onClose?: () => void;
    onAction?: (_key: React.Key) => void;
  };

export const Menu = ({
  title,
  onAction,
  onClose,
  closeOnAction,
  className,
  ref: propRef,
  ...props
}: MenuProps) => {
  const defaultRef = React.useRef<HTMLUListElement>(null);

  const ref = (propRef || defaultRef) as React.RefObject<HTMLUListElement>;

  const state = useTreeState({
    children: props.children,
    selectionMode: 'none',
    onAction,
  } as any);

  const { menuProps } = useMenu(
    {
      'aria-label': title,
      onAction,
      ...props,
    },
    state,
    ref
  );

  return (
    <List
      {...mergeProps(menuProps, props)}
      className={clsx(className, styles.root)}
      ref={ref}
    >
      {[...state.collection].map((item) => (
        <MenuItem
          key={item.key}
          item={item as any}
          closeOnSelect={closeOnAction}
          state={state}
          onClose={onClose}
        />
      ))}
      {props.children}
    </List>
  );
};
Menu.displayName = 'Menu';
