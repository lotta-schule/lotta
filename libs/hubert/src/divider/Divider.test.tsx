import * as React from 'react';
import { render } from '../test-utils.js';
import { Divider } from './Divider.js';

describe('general/divider', () => {
  it('should render correctly', () => {
    const screen = render(<Divider />);
    expect(screen.getByRole('separator')).toBeVisible();
  });
});
