import { Button } from '@material-ui/core';
import { render } from '@testing-library/react';
import { Tooltip } from './Tooltip';

describe('util/Tooltip', () => {
    it('should render', () => {
        const screen = render(
            <Tooltip label="Test">
                <Button>Test</Button>
            </Tooltip>
        );
        expect(screen).toMatchSnapshot();
    });
});
