import * as React from 'react';
import { render } from '../test-utils';
import { ListItem } from './ListItem';

describe('list/ListItem', () => {
  it('should render a list item', () => {
    const screen = render(<ListItem>Item</ListItem>);
    expect(screen.getByRole('listitem')).toMatchSnapshot();
  });

  it('should show a divider when isDivider prop is passed', () => {
    const screen = render(<ListItem isDivider />);
    expect(screen.getByRole('separator')).toBeVisible();
  });
});
