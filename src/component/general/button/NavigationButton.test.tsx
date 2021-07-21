import * as React from 'react';
import { NavigationButton } from './NavigationButton';
import { render } from 'test/util';

describe('component/NavigationButton', () => {
    it('should render NavigationButton with label', () => {
        render(<NavigationButton>Click</NavigationButton>);
    });
});
