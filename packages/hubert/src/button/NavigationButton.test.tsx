import * as React from 'react';
import { render } from '../test-utils';
import { NavigationButton } from './NavigationButton';

describe('shared/NavigationButton', () => {
  it('should render NavigationButton with label', () => {
    const screen = render(<NavigationButton>Click</NavigationButton>);

    expect(screen.getByRole('button')).toHaveTextContent('Click');
    expect(screen.getByRole('button')).toMatchInlineSnapshot();
  });
});
