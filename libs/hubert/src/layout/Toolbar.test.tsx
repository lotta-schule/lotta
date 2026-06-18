import * as React from 'react';
import { render } from '../test-utils';
import { Toolbar } from './Toolbar';

describe('Toolbar', () => {
  it('should render', () => {
    const screen = render(<Toolbar />);

    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });
});
