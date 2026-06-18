'use client';

import * as React from 'react';
import { useSelectState } from 'react-stately';
import { HiddenSelect, useButton, useSelect } from 'react-aria';
import {
  ListItemFactory,
  ListItemPreliminaryItem,
} from '../../list/ListItemFactory';
import { ExpandMore } from '../../icon';
import { Popover, PopoverContent, PopoverTrigger } from '../../popover';
import { ListBox } from '../../menu/ListBox';
import { Label } from '../../label/Label';
import clsx from 'clsx';

import styles from './select.module.scss';

export type SelectProps = React.AriaAttributes &
  Omit<React.HTMLProps<HTMLDivElement>, 'onChange' | 'ref'> & {
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

    children: React.ReactNode | React.ReactNode[];
  };

export type OptionProps = React.PropsWithRef<{
  children?: React.ReactNode | React.ReactNode[];

  value: string;

  label?: string;

  style?: React.CSSProperties;

  leftSection?: React.ReactNode;

  rightSection?: React.ReactNode;
}>;
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
  const inputWrapperRef = React.useRef<HTMLDivElement>(null);

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const { labelProps, triggerProps, valueProps, menuProps } = useSelect(
    {
      items,
      isRequired: required,
      isDisabled: disabled,
      label: title,
    },
    state,
    internalRef
  );

  const { buttonProps } = useButton(triggerProps, triggerRef);

  const minWidth = inputWrapperRef.current?.clientWidth || 0;

  return (
    <Popover
      open={state.isOpen}
      onOpenChange={state.setOpen}
      placement="bottom-end"
    >
      <Label
        {...labelProps}
        label={title || 'Bitte wählen ...'}
        className={clsx(className, styles.root, {
          [styles.isFullWidth]: fullWidth,
        })}
        {...props}
        ref={internalRef}
        onClick={() => state.toggle()}
      >
        <div className={styles.inputWrapper} ref={inputWrapperRef}>
          <HiddenSelect
            isDisabled={disabled}
            state={state}
            triggerRef={triggerRef}
            label={title}
            name={name}
          />
          <div {...valueProps} className={styles.value}>
            {state.selectedItem
              ? state.selectedItem.rendered
              : 'Bitte wählen ...'}
          </div>
          <PopoverTrigger {...buttonProps} className={styles.triggerButton}>
            <ExpandMore />
          </PopoverTrigger>
        </div>
      </Label>
      <PopoverContent style={{ minWidth }}>
        <ListBox
          className={styles.listbox}
          aria-label={title}
          {...(menuProps as any)}
          label={title}
          state={state}
        />
      </PopoverContent>
    </Popover>
  );
};
Select.displayName = 'Select';
