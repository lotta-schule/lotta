import * as React from 'react';
import { LinearProgress } from './LinearProgress';
import { render } from 'test/util';

import styles from './Progress.module.scss';

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
