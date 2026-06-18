import * as React from 'react';
import { render, userEvent, waitFor } from '../../test-utils';
import { Option, Select } from './Select';

describe('shared/general/form/select', () => {
  it('should render and show options', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <Select title={'Select'} value={'0'}>
        <Option value={'0'}>Option 0</Option>
        <Option value={'1'}>Option 1</Option>
        <Option value={'2'}>Option 2</Option>
        <Option value={'3'}>Option 3</Option>
      </Select>
    );
    expect(screen.getByRole('button', { name: /Select/ })).toEqual(
      screen.getByRole('button', { name: /Option 0/ })
    );
    await fireEvent.click(screen.getByRole('button', { name: /Select/ }));
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('should have the correct option preset', () => {
    const screen = render(
      <Select title={'Select'} value={'2'}>
        <Option value={'0'}>Option 0</Option>
        <Option value={'1'}>Option 1</Option>
        <Option value={'2'}>Option 2</Option>
        <Option value={'3'}>Option 3</Option>
      </Select>
    );
    expect(screen.getByRole('button', { name: /Select/ })).toEqual(
      screen.getByRole('button', { name: /Option 2/ })
    );
  });

  it('should have the correct option selected in the listbox', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <Select title={'Select'} value={'2'}>
        <Option value={'0'}>Option 0</Option>
        <Option value={'1'}>Option 1</Option>
        <Option value={'2'}>Option 2</Option>
        <Option value={'3'}>Option 3</Option>
      </Select>
    );
    await fireEvent.click(screen.getByRole('button', { name: /Select/ }));
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeVisible();
    });
    expect(
      await screen.findByRole('option', { name: /Option 2/, selected: true })
    ).toBeVisible();
  });

  it('should call onChange callback with the new value', async () => {
    const fireEvent = userEvent.setup();
    const onChange = vi.fn();
    const screen = render(
      <Select title={'Select'} value={'2'} onChange={onChange}>
        <Option value={'0'}>Option 0</Option>
        <Option value={'1'}>Option 1</Option>
        <Option value={'2'}>Option 2</Option>
        <Option value={'3'}>Option 3</Option>
      </Select>
    );
    await fireEvent.click(screen.getByRole('button', { name: /Select/ }));
    await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation to finish

    await fireEvent.click(
      await screen.findByRole('option', { name: /Option 3/ })
    );
    expect(onChange).toHaveBeenCalledWith('3');
  });
});
