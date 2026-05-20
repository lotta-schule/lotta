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
        class="_root_64ffb3 _root_d5edcf _root_8fd52c"
        data-variant="default"
        role="button"
        type="button"
      >
        <span
          class="_label_d5edcf _label_8fd52c"
        >
          Click
        </span>
      </button>
    `);
  });
});
