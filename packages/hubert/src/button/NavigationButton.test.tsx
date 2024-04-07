import * as React from 'react';
import { render } from '../test-utils';
import { NavigationButton } from './NavigationButton';

describe('shared/NavigationButton', () => {
  it('should render NavigationButton with label', () => {
    const screen = render(<NavigationButton>Click</NavigationButton>);

    expect(screen.getByRole('button')).toHaveTextContent('Click');
    expect(screen.getByRole('button')).toMatchInlineSnapshot(`
      <button
        aria-current="false"
        class="_root_0977c5 _root_3de4f3 _root_70a42a"
        data-variant="default"
        role="button"
        type="button"
      >
        <span
          class="_label_3de4f3 _label_70a42a"
        >
          Click
        </span>
      </button>
    `);
  });
});
