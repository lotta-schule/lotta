import * as React from 'react';
import { render, waitFor } from '../../test-utils';
import { ComboBox } from './ComboBox';
import userEvent from '@testing-library/user-event';

import styles from './ComboBox.module.scss';

const defaultItems = [
  { key: 'Apple', label: 'Apple' },
  { key: 'Bread', label: 'Bread' },
  { key: 'Car', label: 'Car' },
  { key: 'Doorbell', label: 'Doorbell' },
];

describe('Combobox', () => {
  it('should render an input and a button', () => {
    const screen = render(<ComboBox title={'Chose something'} />);
    expect(screen.getByRole('combobox')).toBeVisible();
    expect(screen.getByRole('button')).toBeVisible();
  });

  describe('with predefined items', () => {
    it('should show all options when clicking on the button', async () => {
      const user = userEvent.setup();

      const screen = render(
        <ComboBox title={'Chose something'} items={defaultItems} />
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
        <ComboBox title={'Chose something'} items={defaultItems} />
      );

      await user.type(screen.getByRole('combobox'), 'Do');
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
      const onItems = jest.fn(async () => [{ key: 'A', label: 'A' }]);

      const screen = render(
        <ComboBox title={'Chose something'} items={onItems} />
      );

      expect(screen.queryByRole('button')).toBeNull();
    });

    it('should show all options when clicking on the button', async () => {
      const onItems = jest.fn(async () => defaultItems);

      const user = userEvent.setup();

      const screen = render(
        <ComboBox title={'Chose something'} items={onItems} />
      );

      await user.type(screen.getByRole('combobox'), 'D');
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

  describe('onSelect', () => {
    it('should be possible to add a custom value', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();

      const screen = render(
        <ComboBox
          title={'Chose something'}
          allowsCustomValue
          onSelect={onSelect}
        />
      );

      await user.type(screen.getByRole('combobox'), 'Papaya{Enter}');
      expect(onSelect).toHaveBeenCalledWith('Papaya');
    });
  });

  describe('reset input value on select', () => {
    it('should reset input value on select', async () => {
      const user = userEvent.setup();

      const screen = render(
        <ComboBox
          resetOnSelect
          title={'Chose something'}
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
    it('should call onSelect with item key when a proposed option is selected', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();

      const screen = render(
        <ComboBox
          title={'Chose something'}
          items={defaultItems}
          onSelect={onSelect}
        />
      );

      await user.click(screen.getByRole('button', { name: /vorschläge/i }));
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /apple/i })).toBeVisible();
      });
      await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation to finish
      await user.click(screen.getByRole('option', { name: /apple/i }));
      expect(onSelect).toHaveBeenCalledWith('Apple');
    });

    it('should call onSelect with item key when the value of a proposed item is typed', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();

      const screen = render(
        <ComboBox
          title={'Chose something'}
          items={defaultItems}
          onSelect={onSelect}
        />
      );

      await user.type(screen.getByRole('combobox'), 'Apple{Enter}');
      await waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith('Apple');
      });
    });

    it('should not call onSelect when the value of an unpropsed item is entered', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();

      const screen = render(
        <ComboBox
          title={'Chose something'}
          items={defaultItems}
          onSelect={onSelect}
        />
      );

      await user.type(screen.getByRole('combobox'), 'Dragonfruit{Enter}');
      expect(onSelect).not.toHaveBeenCalled();
    });

    describe('custom properties', () => {
      it('should call onSelect when selecting an unpropsed item when allowsCustomValue is passed', async () => {
        const user = userEvent.setup();
        const onSelect = jest.fn();

        const screen = render(
          <ComboBox
            allowsCustomValue
            title={'Chose something'}
            items={defaultItems}
            onSelect={onSelect}
          />
        );

        await user.type(screen.getByRole('combobox'), 'Dragonfruit{Enter}');

        await waitFor(() => {
          expect(onSelect).toHaveBeenCalledWith('Dragonfruit');
        });
      });
    });

    describe('closing the listbox', () => {
      it('should close the listbox on select when predefined items are passed (as array)', async () => {
        const user = userEvent.setup();
        const onSelect = jest.fn();

        const screen = render(
          <ComboBox
            title={'Chose something'}
            items={defaultItems}
            onSelect={onSelect}
          />
        );

        await user.click(screen.getByRole('button', { name: /vorschläge/i }));
        await waitFor(() => {
          expect(screen.getByRole('option', { name: /apple/i })).toBeVisible();
        });

        await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation to finish

        await user.click(screen.getByRole('option', { name: /apple/i }));
        await waitFor(() => {
          expect(onSelect).toHaveBeenCalledWith('Apple');
        });
        await waitFor(() => {
          expect(
            screen.queryByRole('option', { name: /apple/i })
          ).not.toBeVisible();
        });
      });

      // I DO not understand why we do not want to close the listbox when dynamic items are passed
      // I wait for when I understand and come back to uncomment this test, and then I ADD A PROPER
      // EXPLANATION!
      //
      // it('should not close the listbox on select when dynamic items are passed (as callback)', async () => {
      //   const user = userEvent.setup();
      //   const getItems = jest.fn(async () => defaultItems);

      //   const screen = render(
      //     <ComboBox
      //       title={'Chose something'}
      //       items={getItems}
      //       onSelect={jest.fn()}
      //     />
      //   );

      //   await user.type(screen.getByRole('combobox'), 'Apple{Enter}');
      //   await waitFor(() => {
      //     expect(getItems).toHaveBeenCalledWith('Apple');
      //   }, 10_000);
      //   await waitFor(() => {
      //     expect(screen.getByRole('option', { name: /apple/i })).toBeVisible();
      //   });
      // });
    });
  });

  it('should render as disabled when disabled is set', () => {
    const screen = render(<ComboBox title={'Chose something'} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should correctly set placeholder', () => {
    const screen = render(
      <ComboBox title={'Chose something'} placeholder={'Nothing chosen'} />
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'placeholder',
      'Nothing chosen'
    );
  });

  it('should correctly hide label', () => {
    const screen = render(<ComboBox title={'Chose something'} hideLabel />);
    expect(screen.queryByRole('label')).toBeNull();
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'placeholder',
      'Chose something'
    );
  });

  it('should add fullWidth class', () => {
    const screen = render(<ComboBox fullWidth title={'Chose something'} />);
    expect(screen.baseElement.querySelector(`.${styles.root}`)).toHaveClass(
      styles.isFullWidth
    );
  });
});
