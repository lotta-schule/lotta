import * as React from 'react';
import { render, waitFor } from '../test-utils';
import { Menu } from './Menu';
import { Item } from './MenuItem';
import userEvent from '@testing-library/user-event';

describe('Menu', () => {
  it('should render a Menu', async () => {
    const fireEvent = userEvent.setup();
    const onAction = jest.fn();
    const screen = render(
      <Menu title={'Test Menu'} onAction={onAction}>
        <Item key={'a'}>A</Item>
        <Item key={'b'}>B</Item>
        <Item key={'c'}>C</Item>
      </Menu>
    );
    const listItems = screen.getAllByRole('menuitem');
    expect(listItems).toHaveLength(3);
    expect(listItems[0]).toHaveTextContent('A');
    await fireEvent.click(listItems[2]);
    await waitFor(() => {
      expect(onAction).toHaveBeenCalledWith('c');
    });
  });
});
