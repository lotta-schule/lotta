import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '../../test-utils';
import { Radio } from './Radio';

import styles from './radio.module.scss';

describe('shared/general/form/radio/Radio', () => {
  it('should not apply the wrapping label class to the input itself', () => {
    const screen = render(<Radio value={'0'} label={'Option'} />);
    const input = screen.getByRole('radio');
    expect(input.className).not.toContain(styles.root);
  });

  it('should apply the wrapping label class to the outer label only', () => {
    const screen = render(<Radio value={'0'} label={'Option'} />);
    const input = screen.getByRole('radio');
    expect(input.closest('label')).toHaveClass(styles.root);
  });
});
