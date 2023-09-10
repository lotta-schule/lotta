import * as React from 'react';
import { render } from '../test-utils';
import { ScrollToTopButton } from './ScrollToTopButton';

describe('shared/general/ScrollToTopButton', () => {
  it('should render without errors', () => {
    render(<ScrollToTopButton />);
  });

  it('should not be visible on render', () => {
    const screen = render(<ScrollToTopButton />);
    expect(screen.getByRole('button')).not.toBeVisible();
  });
});
