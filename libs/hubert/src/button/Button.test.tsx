import * as React from 'react';
import { Close } from '../icon';
import { render, within } from '../test-utils';
import { Button } from './Button';

describe('shared/Button', () => {
  it('should render Button with label', () => {
    const screen = render(<Button>Click</Button>);

    expect(screen.getByRole('button')).toHaveTextContent('Click');
    expect(screen.getByRole('button')).toMatchInlineSnapshot(`
      <button
        aria-current="false"
        class="_root_ybf73_1 _root_z0q9c_1"
        data-variant="default"
        role="button"
        type="button"
      >
        <span
          class="_label_z0q9c_14"
        >
          Click
        </span>
      </button>
    `);
  });

  it('should render Button with icon', () => {
    const screen = render(<Button icon={<Close data-testid="CloseIcon" />} />);
    expect(
      within(screen.getByRole('button')).getByTestId('CloseIcon')
    ).toBeVisible();
  });
});
