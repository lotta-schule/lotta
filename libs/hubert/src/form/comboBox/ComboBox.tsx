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

  /**
   * If set, the input text field will be reset to an empty string after an item has been selected
   * This is useful for search fields that should be cleared after a selection has been made
   **/
  resetOnSelect?: boolean;

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
    resetOnSelect,
    additionalConfirmChars = [],
    onSelect,
  }: ComboBoxProps) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [calculatedItems, setCalculatedItems] = React.useState<
      ListItemPreliminaryItem[]
    >([]);
    const [searchText, setSearchText] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const allItems = React.useMemo(() => {
      if (typeof items === 'function') {
        return calculatedItems ?? [];
      }
      return items ?? [];
    }, [calculatedItems, items]);

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

    React.useEffect(() => {
      if (searchText?.length < 1) {
        return;
      }

      if (typeof items !== 'function') {
        return;
      }

      setIsLoading(true);
      items(searchText)
        .then((newItems) => {
          setCalculatedItems(newItems);
          if (newItems.length) {
            state.setOpen(true);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText]);

    const state = useComboBoxState({
      children: ListItemFactory.createItem,
      items: allItems,
      isDisabled: disabled,
      autoFocus,
      label: title,
      onOpenChange: (isOpen) => {
        if (!isOpen) {
          setSearchText('');
          cancelDebounce();
        }
      },
      onSelectionChange: (value) => {
        if (value) {
          onSelect?.(value);
        }
        setSearchText('');
        cancelDebounce();

        if (typeof items !== 'function') {
          state.selectionManager.clearSelection();

          setTimeout(() => {
            if (resetOnSelect) {
              state.setInputValue('');
              state.setFocused(false);
            }
            if (state.isOpen) {
              state.close();
            }
          }, 50);
        }
      },
      allowsCustomValue,
    });

    const [, cancelDebounce] = useDebounce(
      () => {
        if (state.isFocused) {
          setSearchText(state.inputValue);
        }
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

    return (
      <div
        ref={ref}
        className={clsx(styles.root, className, {
          [styles.isFullWidth]: fullWidth,
        })}
        style={style}
      >
        <Label {...labelProps} label={title} hide={hideLabel}>
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
              trigger={inputRef.current!}
              ref={popoverRef}
              isOpen={state.isOpen}
              onClose={state.close}
              placement={'bottom-end'}
            >
              <ListBox
                {...listBoxProps}
                className={styles.listbox}
                ref={listBoxRef}
                state={state}
              />
            </Popover>
          </div>
        </Label>
      </div>
    );
  }
);
ComboBox.displayName = 'ComboBox';
