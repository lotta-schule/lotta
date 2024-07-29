'use client';

import * as React from 'react';
import { useSelectState } from 'react-stately';
import { HiddenSelect, useSelect } from 'react-aria';
import {
  ListItemFactory,
  ListItemPreliminaryItem,
} from '../../list/ListItemFactory';
import { Button } from '../../button';
import { ExpandMore } from '../../icon';
import { Popover } from '../../popover/new/Popover';
import { ListBox } from '../../menu/ListBox';
import { Label } from '../../label/Label';
import clsx from 'clsx';

import styles from './select.module.scss';

export type SelectProps = React.AriaAttributes &
  Omit<React.HTMLProps<HTMLDivElement>, 'onChange'> & {
    className?: string;

    style?: React.CSSProperties;

    fullWidth?: boolean;

    disabled?: boolean;

    title: string;

    name?: string;

    id?: string;

    value?: string;

    required?: boolean;

    onChange?: (_value: string) => void;

    children?: any;
  };

export type OptionProps = {
  children?: React.ReactNode | React.ReactNode[];

  value: string;

  label?: string;

  style?: React.CSSProperties;

  leftSection?: React.ReactNode;

  rightSection?: React.ReactNode;
};
export const Option = (_props: OptionProps) => null;

export const Select = ({
  children,
  className,
  disabled,
  title,
  name,
  value,
  required,
  onChange,
  fullWidth,
  ...props
}: SelectProps) => {
  const items: ListItemPreliminaryItem[] = React.Children.toArray(children)
    .filter(({ type }: any) => type === Option)
    .map(({ props: { children, label, value, ...props } }: any) => ({
      key: value || label || children,
      label: label || children,
      ...props,
    }));

  const state = useSelectState({
    children: ListItemFactory.createItem,
    items,
    isRequired: required,
    isDisabled: disabled,
    label: title,
    selectedKey: value || (items.at(0)?.key as string),
    onSelectionChange: (value) => {
      onChange?.(String(value));
    },
  });

  const internalRef = React.useRef<HTMLDivElement>(null);

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  const {
    labelProps,
    triggerProps: {
      isDisabled,
      onPress: _onPress,
      onPressStart: _onPressStart,
      ...otherTriggerProps
    },
    valueProps,
    menuProps,
  } = useSelect(
    {
      items,
      isRequired: required,
      isDisabled: disabled,
      label: title,
    },
    state,
    internalRef
  );
  const triggerProps = { disabled: isDisabled, ...otherTriggerProps };

  return (
    <Label
      {...labelProps}
      label={title || 'Bitte wählen ...'}
      className={clsx(className, styles.root, {
        [styles.isFullWidth]: fullWidth,
      })}
      {...props}
      ref={(node) => {
        if (props.ref) {
          if ('current' in props.ref) {
            props.ref.current = node;
          } else {
            props.ref(node);
          }
        }
        internalRef.current = node;
        return () => {
          if (props.ref) {
            if ('current' in props.ref) {
              props.ref.current = null;
            } else {
              props.ref(null);
            }
          }
          internalRef.current = null;
        };
      }}
      onClick={() => state.toggle()}
    >
      <div>
        <HiddenSelect
          isDisabled={disabled}
          state={state}
          triggerRef={triggerRef}
          label={title}
          name={name}
        />
        <div className={styles.inputWrapper}>
          <div {...valueProps} className={styles.value}>
            {state.selectedItem
              ? state.selectedItem.rendered
              : 'Bitte wählen ...'}
          </div>
          <Button
            {...triggerProps}
            className={styles.triggerButton}
            ref={triggerRef}
          >
            <ExpandMore />
          </Button>
        </div>
        <Popover
          trigger={triggerRef.current}
          ref={popoverRef}
          isOpen={state.isOpen}
          onClose={state.close}
          placement={'bottom'}
        >
          <ListBox
            aria-label={title}
            {...(menuProps as any)}
            label={title}
            state={state}
          />
        </Popover>
      </div>
    </Label>
  );
};
Select.displayName = 'Select';
