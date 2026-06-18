import * as React from 'react';
import { render, userEvent } from '../../test-utils';
import { Checkbox } from './Checkbox';

describe('shared/general/form/checkbox', () => {
  it('should show the correct label', () => {
    const screen = render(<Checkbox>A label</Checkbox>);
    expect(screen.getByText('A label')).toBeVisible();
  });

  it('should show a selected checkbox and unselect it on click', async () => {
    const fireEvent = userEvent.setup();
    const onChange = vi.fn();
    const screen = render(
      <Checkbox isSelected onChange={onChange}>
        A label
      </Checkbox>
    );
    await fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
