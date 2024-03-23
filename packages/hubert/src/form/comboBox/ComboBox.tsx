'use client';

import * as React from 'react';
import { useComboBoxState } from 'react-stately';
import { useButton, useComboBox } from 'react-aria';
import { debounce } from 'lodash';
import {
  ListItemFactory,
  ListItemPreliminaryItem,
} from '../../list/ListItemFactory';
import { Input } from '../input';
import { Button } from '../../button';
import { Label } from '../../label';
import { ListBox } from '../../menu/ListBox';
import { Popover } from '../../popover/new/Popover';
import { CircularProgress } from '../../progress';
import { ExpandMore } from '../../icon';
import clsx from 'clsx';

import styles from './ComboBox.module.scss';

export type ComboBoxProps = {
  className?: string;

  style?: React.CSSProperties;

  fullWidth?: boolean;

  disabled?: boolean;

  placeholder?: string;

  autoFocus?: boolean;

  /*
   * The title of the comboBox.
   * Will be used as a fallback for the Label and the placeholder
   */
  title: string;

  /*
   * If set, the input field text (containing the search text) will not be reset
   * when a selection is made
   */
  noResetInputOnSelect?: boolean;

  /*
   * If set, the input text field will not be wrapped inside a <Label> component
   */
  hideLabel?: boolean;

  /*
   * Wether to allow values that are not part of the predefined or loaded item set
   */
  allowsCustomValue?: boolean;

  items?:
    | ListItemPreliminaryItem[]
    | ((_value: string) => Promise<ListItemPreliminaryItem[]>);

  onSelect?: (_value: React.Key | string) => void;
};

export const ComboBox = React.memo(
  ({
    className,
    style,
    fullWidth,
    disabled,
    autoFocus,
    placeholder,
    hideLabel,
    noResetInputOnSelect,
    items,
    title,
    allowsCustomValue,
    onSelect,
  }: ComboBoxProps) => {
    const isItemListCalculated = typeof items === 'function';

    const [calculatedItems, setCalculatedItems] = React.useState<
      ListItemPreliminaryItem[]
    >([]);
    const [ignoreNextInputChange, setIgnoreNextInputChange] =
      React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const allItems = React.useMemo(() => {
      if (isItemListCalculated) {
        return calculatedItems ?? [];
      }
      return items ?? [];
    }, [isItemListCalculated, calculatedItems, items]);

    const findItem = React.useCallback(
      (
        searchText: string,
        options?: {
          matchOnlyIfExclusive?: boolean;
          matchExact?: boolean;
        }
      ) => {
        const rightValue = searchText.toLocaleLowerCase();
        const results = allItems.filter((item) => {
          const leftValue = (item.textValue ?? item.label)
            ?.toString()
            .toLocaleLowerCase();

          if (!leftValue) {
            return false;
          } else if (options?.matchExact) {
            return leftValue === searchText.toLocaleLowerCase();
          } else {
            return leftValue.includes(rightValue);
          }
        });

        if (!options?.matchOnlyIfExclusive || results.length === 1) {
          return results[0];
        }
        return null;
      },
      [allItems]
    );

    const onInputChange = React.useCallback(
      async (valueObj: string | { value: string; valueType: 'string' }) => {
        const value = typeof valueObj === 'string' ? valueObj : valueObj.value;
        if (ignoreNextInputChange) {
          setIgnoreNextInputChange(false);
          return;
        }
        if (value) {
          if (isItemListCalculated) {
            try {
              setIsLoading(true);
              const newItems = await items(value);
              setCalculatedItems(newItems);
              if (newItems.length) {
                state.setOpen(true);
              }
            } finally {
              setIsLoading(false);
            }
          } else {
            const item = findItem(value);
            if (item) {
              state.selectionManager.setFocusedKey(item.key as string | number);
            }
          }
        }
      },
      // TODO: There is a potential problem here,
      // This is to be seen by an Alexis more awake than I am at the moment
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [items, isItemListCalculated, findItem]
    );

    const debouncedOnInputChange = debounce(onInputChange, 500, {
      trailing: true,
    });

    const state = useComboBoxState({
      children: ListItemFactory.createItem,
      items: allItems,
      isDisabled: disabled,
      autoFocus,
      label: title,
      onSelectionChange: (value) => {
        if (value) {
          onSelect?.(value);
        }
        if (!noResetInputOnSelect) {
          state.setInputValue('');
        }
        debouncedOnInputChange.cancel();
        if (value !== state.inputValue) {
          setIgnoreNextInputChange(true);
        }
        if (typeof items !== 'function') {
          state.close();
          if (document.activeElement instanceof HTMLInputElement) {
            document.activeElement.blur();
          }
        }
      },
      onInputChange: debouncedOnInputChange,
      allowsCustomValue,
    });

    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listBoxRef = React.useRef<HTMLUListElement>(null);
    const popoverRef = React.useRef<HTMLDivElement>(null);

    const {
      buttonProps: triggerProps,
      inputProps,
      listBoxProps,
      labelProps,
    } = useComboBox(
      {
        autoFocus,
        inputRef,
        buttonRef,
        listBoxRef,
        popoverRef,
        isDisabled: disabled,
        label: title,
        items: allItems,
        allowsCustomValue,
        placeholder: placeholder ?? title,
        onKeyDown: (event) => {
          if (
            event.code === 'Enter' &&
            !state.selectedKey &&
            state.inputValue !== ''
          ) {
            const select = (item: ListItemPreliminaryItem | string) => {
              const value = typeof item === 'string' ? item : item.key;
              if (value) {
                onSelect?.(value);
              }
              if (!noResetInputOnSelect) {
                state.setInputValue('');
              }
            };

            const item = findItem(state.inputValue, {
              matchOnlyIfExclusive: true,
              matchExact: true,
            });

            if (item && state.collection.getItem(item.key as string | number)) {
              select(item);
              return;
            } else if (!item && allowsCustomValue) {
              select(state.inputValue);
              return;
            }
          }

          event.continuePropagation();
        },
      },
      state
    );

    const { buttonProps } = useButton(
      { ...triggerProps, ['aria-label']: 'Vorschläge anzeigen' },
      buttonRef
    );

    const inputAriaLabelProps = hideLabel
      ? { 'aria-label': title, 'aria-labelledby': '' }
      : {};

    const labelContent = (
      <div
        className={clsx(styles.inputWrapper, {
          [styles.withoutButton]: typeof items === 'function',
        })}
      >
        <Input {...inputProps} {...inputAriaLabelProps} ref={inputRef} />
        {typeof items !== 'function' && (
          <Button
            {...buttonProps}
            ref={buttonRef}
            className={styles.triggerButton}
          >
            <ExpandMore />
          </Button>
        )}
        {isLoading && (
          <CircularProgress
            isIndeterminate
            className={styles.progress}
            style={{ width: '1em', height: '1em' }}
            label={'Vorschläge werden geladen'}
          />
        )}
        <Popover
          triggerRef={inputRef}
          ref={popoverRef}
          isOpen={state.isOpen}
          onClose={state.close}
          placement={'bottom'}
        >
          <ListBox {...listBoxProps} ref={listBoxRef} state={state} />
        </Popover>
      </div>
    );

    return (
      <div
        className={clsx(styles.root, className, {
          [styles.isFullWidth]: fullWidth,
        })}
        style={style}
      >
        {!hideLabel && (
          <Label {...labelProps} label={title}>
            {labelContent}
          </Label>
        )}
        {hideLabel && labelContent}
      </div>
    );
  }
);
ComboBox.displayName = 'ComboBox';
