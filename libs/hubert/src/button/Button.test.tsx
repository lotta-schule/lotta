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
        class="_root_0977c5 _root_3de4f3"
        data-variant="default"
        role="button"
        type="button"
      >
        <span
          class="_label_3de4f3"
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
