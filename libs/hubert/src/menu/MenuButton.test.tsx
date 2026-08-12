import * as React from 'react';
import { render, userEvent, waitFor } from '../test-utils';
import { MenuButton } from './MenuButton';
import { Item } from './MenuItem';

describe('Menu', () => {
  it('should render a Menu button', async () => {
    const fireEvent = userEvent.setup();
    const onOpenChange = vi.fn<() => void>();
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

  it('should call onOpenChange with false when the menu is closed', async () => {
    const fireEvent = userEvent.setup();
    const onOpenChange = vi.fn<() => void>();
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
    await fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeVisible();
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);

    await fireEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('should close the menu after an item is selected', async () => {
    const fireEvent = userEvent.setup();
    const onAction = vi.fn();
    const screen = render(
      <MenuButton
        title={'Test Menu'}
        buttonProps={{ label: 'Click' }}
        onAction={onAction}
      >
        <Item key={'a'}>A</Item>
        <Item key={'b'}>B</Item>
        <Item key={'c'}>C</Item>
      </MenuButton>
    );
    await fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeVisible();
    });
    await fireEvent.click(screen.getByRole('menuitem', { name: 'A' }));
    expect(onAction).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
});
