import * as React from 'react';
import { render, userEvent, waitFor } from '../test-utils.js';
import { MenuButton } from './MenuButton.js';
import { Item } from './MenuItem.js';

describe('Menu', () => {
  it('should render a Menu button', async () => {
    const fireEvent = userEvent.setup();
    const onOpenChange = vi.fn();
    const screen = render(
      <MenuButton
        title={'Test Menu'}
        buttonProps={{ label: 'Click' }}
        onOpenChange={onOpenChange}
      >
        <Item key={'a'}>A</Item>
        <Item key={'b'}>B</Item>
        <Item key={'c'}>C</Item>
      </MenuButton>
    );
    expect(screen.getByRole('button')).toHaveTextContent('Click');
    await fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeVisible();
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
