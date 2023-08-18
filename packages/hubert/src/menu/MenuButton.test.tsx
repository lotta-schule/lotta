import * as React from 'react';
import { render, waitFor } from '../test-utils';
import { MenuButton } from './MenuButton';
import { Item } from './MenuItem';
import userEvent from '@testing-library/user-event';

describe('Menu', () => {
  it('should render a Menu button', async () => {
    const fireEvent = userEvent.setup();
    const onOpenChange = jest.fn();
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
