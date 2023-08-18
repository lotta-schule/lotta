import * as React from 'react';
import { render } from '../test-utils';
import { CircularProgress } from './CircularProgress';

import styles from './Progress.module.scss';

describe('CircularProgress', () => {
  it('should render a progress bar', () => {
    const screen = render(
      <CircularProgress isIndeterminate aria-label={'test-progress'} />
    );
    expect(screen.getByRole('progressbar')).toBeVisible();
  });

  it('should have indeterminate class if isIndeterminate is set', () => {
    const screen = render(
      <CircularProgress isIndeterminate aria-label={'test-progress'} />
    );
    expect(screen.getByRole('progressbar')).toHaveClass(styles.indeterminate);
  });

  it('should show the text value when showValue is true', () => {
    const screen = render(
      <CircularProgress showValue value={45} aria-label={'test-progress'} />
    );
    expect(screen.getByRole('progressbar')).toHaveTextContent('45%');
  });
});
