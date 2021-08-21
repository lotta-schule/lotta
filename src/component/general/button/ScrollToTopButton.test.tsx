import * as React from 'react';
import { render } from 'test/util';
import { ScrollToTopButton } from './ScrollToTopButton';

describe('component/general/ScrollToTopButton', () => {
    it('should render without errors', () => {
        render(<ScrollToTopButton />);
    });

    it('should not be visible on render', () => {
        const screen = render(<ScrollToTopButton />);
        expect(screen.getByRole('button')).not.toBeVisible();
    });
});
