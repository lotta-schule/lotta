import * as React from 'react';
import { NavigationButton } from './NavigationButton';
import { render } from 'test/util';

describe('shared/NavigationButton', () => {
    it('should render NavigationButton with label', () => {
        render(<NavigationButton>Click</NavigationButton>);
    });
});
