/* eslint-disable react-compiler/react-compiler */
'use client';

import * as React from 'react';
import { useComboBoxState } from 'react-stately';
import { useButton, useComboBox } from 'react-aria';
import { useDebounce } from 'react-use';
import {
  ListItemFactory,
  ListItemPreliminaryItem,
} from '../../list/ListItemFactory';
import { Input } from '../input';
import { Label } from '../../label';
import { ListBox } from '../../menu/ListBox';
import { Popover, PopoverContent, PopoverTrigger } from '../../popover';
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
   * If set, the input text field will not be wrapped inside a <Label> component
   */
  hideLabel?: boolean;

  /*
   * Wether to allow values that are not part of the predefined or loaded item set
   */
  allowsCustomValue?: boolean;

  /**
   * Additional keyboard keys to be interprated as "confirmation" character.
   * The default is just Enter.
   **/
  additionalConfirmChars?: string[];

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
    items,
    title,
    allowsCustomValue,
    additionalConfirmChars = [],
    onSelect,
  }: ComboBoxProps) => {
    const inputWrapperRef = React.useRef<HTMLDivElement>(null);

    const [calculatedItems, setCalculatedItems] = React.useState<
      ListItemPreliminaryItem[]
    >([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const allItems = React.useMemo(
      () => (typeof items === 'function' ? calculatedItems : items) ?? [],
      [calculatedItems, items]
    );

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

        if (
          results.length === 1 ||
          (results.length > 0 && !options?.matchOnlyIfExclusive)
        ) {
          return results[0];
        }
        return null;
      },
      [allItems]
    );

    const state = useComboBoxState({
      children: ListItemFactory.createItem,
      items: allItems,
      isDisabled: disabled,
      autoFocus,
      label: title,
      onOpenChange: (isOpen) => {
        if (!isOpen && !state.isFocused) {
          state.setInputValue('');
          cancelDebounce();
        }
      },
      onSelectionChange: (value) => {
        if (value) {
          onSelect?.(value);
        }
        state.setInputValue('');
        cancelDebounce();
      },
      allowsCustomValue,
    });

    const [, cancelDebounce] = useDebounce(
      () => {
        if (state.inputValue?.length < 1) {
          return;
        }

        if (typeof items !== 'function') {
          return;
        }

        setIsLoading(true);
        items(state.inputValue)
          .then((newItems) => {
            setCalculatedItems(newItems);
            if (newItems.length) {
              state.setOpen(true);
            }
          })
          .finally(() => {
            setIsLoading(false);
          });
      },
      500,
      [state.inputValue, state.isFocused]
    );

    React.useEffect(() => {
      const item = findItem(state.inputValue);
      if (item) {
        state.selectionManager.setFocusedKey(item.key as string | number);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.inputValue]);

    const inputRef = React.useRef<HTMLInputElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const listBoxRef = React.useRef<HTMLUListElement>(null);
    const popoverRef = React.useRef<HTMLDivElement>(null);

    const { labelProps, buttonProps, inputProps, listBoxProps } = useComboBox(
      {
        autoFocus,
        inputRef,
        listBoxRef,
        popoverRef,
        isDisabled: disabled,
        label: title,
        items: allItems,
        allowsCustomValue,
        placeholder: placeholder ?? title,
        onKeyDown: (event) => {
          if ([...additionalConfirmChars, 'Enter'].includes(event.key)) {
            event.preventDefault();
            if (!state.selectedKey && state.inputValue !== '') {
              const select = (item: ListItemPreliminaryItem | string) => {
                const value = typeof item === 'string' ? item : item.key;

                state.selectionManager.replaceSelection(value as string);

                onSelect?.(value);
              };

              const item = findItem(state.inputValue, {
                matchOnlyIfExclusive: true,
                matchExact: true,
              });

              if (
                item &&
                state.collection.getItem(item.key as string | number)
              ) {
                select(item);
                return;
              } else if (!item && allowsCustomValue) {
                select(state.inputValue);
                return;
              }
            }
          }

          event.continuePropagation();
        },
        onOpenChange: (isOpen) => {
          if (!isOpen) {
            state.setInputValue('');
          }
        },
        onFocusChange: (isFocused) => {
          if (!isFocused) {
            state.setInputValue('');
          }
        },
      },
      state
    );

    const { buttonProps: buttonElProps } = useButton(buttonProps, buttonRef);

    const inputAriaLabelProps = hideLabel
      ? { 'aria-label': title, 'aria-labelledby': '' }
      : {};

    // eslint-dsable-next-line react-compiler/react-compiler
    const minWidth = inputWrapperRef.current?.clientWidth || 0;

    return (
      <Popover
        open={state.isOpen}
        onOpenChange={state.setOpen}
        placement={'bottom-end'}
      >
        <Label
          {...labelProps}
          className={clsx(styles.root, className, {
            [styles.isFullWidth]: fullWidth,
          })}
          style={style}
          label={title}
          hide={!!hideLabel}
        >
          <div
            ref={inputWrapperRef}
            className={clsx(styles.inputWrapper, {
              [styles.withoutButton]: typeof items === 'function',
            })}
          >
            <Input {...inputProps} {...inputAriaLabelProps} ref={inputRef} />
            {typeof items !== 'function' ? (
              <PopoverTrigger
                className={styles.triggerButton}
                ref={buttonRef}
                {...buttonElProps}
              >
                <ExpandMore />
              </PopoverTrigger>
            ) : (
              <PopoverTrigger asChild>
                <div />
              </PopoverTrigger>
            )}
            {isLoading && (
              <CircularProgress
                isIndeterminate
                className={styles.progress}
                style={{ width: '1em', height: '1em' }}
                label={'Vorschläge werden geladen'}
              />
            )}
          </div>
        </Label>
        <PopoverContent ref={popoverRef} style={{ minWidth }}>
          <ListBox
            className={styles.listbox}
            aria-label={title}
            {...listBoxProps}
            autoFocus={!!listBoxProps.autoFocus}
            ref={listBoxRef}
            label={title}
            state={state}
          />
        </PopoverContent>
      </Popover>
    );
  }
);
ComboBox.displayName = 'ComboBox';
