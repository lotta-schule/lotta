import * as React from 'react';
import { render } from '../test-utils.js';
import { Toolbar } from './Toolbar.js';

describe('Toolbar', () => {
  it('should render', () => {
    const screen = render(<Toolbar />);

    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });
});
