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
        class="_root_ybf73_1 _root_z0q9c_1 _root_cfn1r_1"
        data-variant="default"
        role="button"
        type="button"
      >
        <span
          class="_label_z0q9c_14 _label_cfn1r_35"
        >
          Click
        </span>
      </button>
    `);
  });
});
