import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, userEvent, waitFor } from '../../test-utils';
import { ComboBox } from './ComboBox';

import styles from './ComboBox.module.scss';

const defaultItems = [
  { key: 'Apple', label: 'Apple' },
  { key: 'Bread', label: 'Bread' },
  { key: 'Car', label: 'Car' },
  { key: 'Doorbell', label: 'Doorbell' },
];

describe('Combobox', () => {
  it('should render an input and a button', () => {
    const screen = render(<ComboBox title={'Choose something'} />);
    expect(screen.getByRole('combobox')).toBeVisible();
    expect(screen.getByRole('button')).toBeVisible();
  });

  describe('with predefined items', () => {
    it('should show all options when clicking on the button', async () => {
      const user = userEvent.setup();

      const screen = render(
        <ComboBox title={'Choose something'} items={defaultItems} />
      );

      expect(screen.getByRole('combobox')).toBeVisible();
      await user.click(screen.getByRole('button'));
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeVisible();
      });
      expect(screen.getAllByRole('option')).toHaveLength(4);
    });

    it('should filter items when text is entered', async () => {
      const user = userEvent.setup();

      const screen = render(
        <ComboBox title={'Choose something'} items={defaultItems} />
      );

      await user.fill(screen.getByRole('combobox'), 'Do');
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeVisible();
      });
      await waitFor(() => {
        expect(
          screen.getAllByRole('option').filter((li) => li.dataset.isFocused)
        ).toHaveLength(1);
      });
      expect(screen.getByRole('option', { name: /doorbell/i })).toBeVisible();
    });
  });

  describe('With fetched items', () => {
    it('should hide button when items is a function', () => {
      const onItems = vi.fn(async () => [{ key: 'A', label: 'A' }]);

      const screen = render(
        <ComboBox title={'Choose something'} items={onItems} />
      );

      expect(screen.queryByRole('button')).toBeNull();
    });

    it('should show all options when clicking on the button', async () => {
      const onItems = vi.fn(async () => defaultItems);

      const user = userEvent.setup();

      const screen = render(
        <ComboBox title={'Choose something'} items={onItems} />
      );

      await user.fill(screen.getByRole('combobox'), 'D');
      expect(screen.getByRole('combobox')).toBeVisible();
      await waitFor(() => {
        expect(onItems).toHaveBeenCalledWith('D');
      });
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeVisible();
      });
      await waitFor(() => {
        expect(screen.getAllByRole('option')).toHaveLength(4);
      });
    });
  });

  describe('reset input value on select', () => {
    it('should reset input value on select', async () => {
      const user = userEvent.setup();

      const screen = render(
        <ComboBox
          title={'Choose something'}
          items={defaultItems}
          allowsCustomValue
        />
      );

      await user.type(screen.getByRole('combobox'), 'Apple{Enter}');
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveValue('');
      });
    });
  });

  describe('onSelect', () => {
    it('should be possible to add a custom value', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      const screen = render(
        <ComboBox
          title={'Choose something'}
          allowsCustomValue
          onSelect={onSelect}
        />
      );

      await user.fill(screen.getByRole('combobox'), 'Papaya');
      await user.keyboard('{Enter}');
      expect(onSelect).toHaveBeenCalledWith('Papaya');
    });
    it('should call onSelect with item key when a proposed option is selected', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      const screen = render(
        <ComboBox
          title={'Choose something'}
          items={defaultItems}
          onSelect={onSelect}
        />
      );

      await user.click(
        screen.getByRole('button', { name: /Choose something/i })
      );
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /apple/i })).toBeVisible();
      });
      await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation to finish
      await user.click(screen.getByRole('option', { name: /apple/i }));
      expect(onSelect).toHaveBeenCalledWith('Apple');
    });

    it('should call onSelect with item key when the value of a proposed item is typed', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      const screen = render(
        <ComboBox
          title={'Choose something'}
          items={defaultItems}
          onSelect={onSelect}
        />
      );

      await user.fill(screen.getByRole('combobox'), 'Apple');
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith('Apple');
      });
    });

    it('should call onSelect when typing a key from the "additionalConfirmChars" array', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      const screen = render(
        <ComboBox
          title={'Choose something'}
          items={defaultItems}
          onSelect={onSelect}
          additionalConfirmChars={['#']}
        />
      );

      await user.type(screen.getByRole('combobox'), 'Apple#');
      await waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith('Apple');
      });
    });

    it('should not call onSelect when the value of an unpropsed item is entered', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      const screen = render(
        <ComboBox
          title={'Choose something'}
          items={defaultItems}
          onSelect={onSelect}
        />
      );

      await user.fill(screen.getByRole('combobox'), 'Dragonfruit');
      await user.keyboard('{Enter}');
      expect(onSelect).not.toHaveBeenCalled();
    });

    describe('custom properties', () => {
      it('should call onSelect when selecting an unpropsed item when allowsCustomValue is passed', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();

        const screen = render(
          <ComboBox
            allowsCustomValue
            title={'Choose something'}
            items={defaultItems}
            onSelect={onSelect}
          />
        );

        await user.fill(screen.getByRole('combobox'), 'Dragonfruit');
        await user.keyboard('{Enter}');

        await waitFor(() => {
          expect(onSelect).toHaveBeenCalledWith('Dragonfruit');
        });
      });
    });

    describe('closing the listbox', () => {
      it('should close the listbox on select when predefined items are passed (as array)', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();

        const screen = render(
          <ComboBox
            title={'Choose something'}
            items={defaultItems}
            onSelect={onSelect}
          />
        );

        await user.click(
          screen.getByRole('button', { name: /Choose something/ })
        );
        await waitFor(() => {
          expect(screen.getByRole('option', { name: /apple/i })).toBeVisible();
        });

        await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation to finish

        await user.click(screen.getByRole('option', { name: /apple/i }));
        await waitFor(() => {
          expect(onSelect).toHaveBeenCalledWith('Apple');
        });
        await waitFor(() => {
          expect(screen.queryByRole('option', { name: /apple/i })).toBeNull();
        });
      });
    });
  });

  it('should render as disabled when disabled is set', () => {
    const screen = render(<ComboBox title={'Choose something'} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should correctly set placeholder', () => {
    const screen = render(
      <ComboBox title={'Choose something'} placeholder={'Nothing chosen'} />
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'placeholder',
      'Nothing chosen'
    );
  });

  it('should correctly hide label', () => {
    const screen = render(<ComboBox title={'Choose something'} hideLabel />);
    expect(screen.queryByRole('label')).toBeNull();
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'placeholder',
      'Choose something'
    );
  });

  it('should add fullWidth class', () => {
    const screen = render(<ComboBox fullWidth title={'Choose something'} />);
    expect(screen.baseElement.querySelector(`.${styles.root}`)).toHaveClass(
      styles.isFullWidth
    );
  });
});
