import { render } from '@testing-library/react';
import { Button } from '../button/Button';
import { Tooltip } from './Tooltip';

describe('util/Tooltip', () => {
    it('should render', () => {
        const screen = render(
            <Tooltip label="Test">
                <Button>Test</Button>
            </Tooltip>
        );
        expect(screen.container).toMatchSnapshot();
    });
});
