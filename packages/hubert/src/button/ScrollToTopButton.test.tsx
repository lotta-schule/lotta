import * as React from 'react';
import { render } from '../test-utils';
import { ScrollToTopButton } from './ScrollToTopButton';

describe('shared/general/ScrollToTopButton', () => {
  it('should render without errors', () => {
    const screen = render(<ScrollToTopButton />);

    expect(screen.getByRole('button')).toHaveAccessibleName(
      /zum anfang der seite/i
    );
  });

  it('should not be visible on render', () => {
    const screen = render(<ScrollToTopButton />);
    expect(screen.getByRole('button')).not.toBeVisible();
  });
});
