import * as React from 'react';
import { Close } from '@material-ui/icons';
import { Button } from './Button';
import { render } from 'test/util';

describe('component/Button', () => {
    it('should render Button with label', () => {
        render(<Button>Click</Button>);
    });

    it('should render Button with icon', () => {
        render(<Button icon={<Close />} />);
    });
});
