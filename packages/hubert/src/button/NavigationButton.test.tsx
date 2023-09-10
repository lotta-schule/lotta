import * as React from 'react';
import { render } from '../test-utils';
import { NavigationButton } from './NavigationButton';

describe('shared/NavigationButton', () => {
  it('should render NavigationButton with label', () => {
    render(<NavigationButton>Click</NavigationButton>);
  });
});
