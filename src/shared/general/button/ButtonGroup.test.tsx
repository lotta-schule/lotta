import * as React from 'react';
import { Button } from './Button';
import { ButtonGroup } from './ButtonGroup';
import { render } from 'test/util';

describe('ButtonGroup', () => {
    it('should render ButtonGroup with 3 buttons', () => {
        render(
            <ButtonGroup>
                <Button>A</Button>
                <Button>B</Button>
                <Button>C</Button>
            </ButtonGroup>
        );
    });
});
