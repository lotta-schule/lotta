import * as React from 'react';
import { render } from '../test-utils.js';
import { LinearProgress } from './LinearProgress.js';

import styles from './LinearProgress.module.scss';

describe('LinearProgress', () => {
  it('should render a progress bar', () => {
    const screen = render(
      <LinearProgress isIndeterminate aria-label={'test-progress'} />
    );
    expect(screen.getByRole('progressbar')).toBeVisible();
  });

  it('should have indeterminate class if isIndeterminate is set', () => {
    const screen = render(
      <LinearProgress isIndeterminate aria-label={'test-progress'} />
    );
    expect(screen.getByRole('progressbar').parentNode).toHaveClass(
      styles.indeterminate
    );
  });
});
