import * as React from 'react';
import { render } from 'test/util';
import { Input } from './Input';

describe('component/general/form/input', () => {
    it('should render', () => {
        render(<Input />);
    });

    it('should render a textarea when multine prop is given', () => {
        const screen = render(<Input multiline />);
        expect(screen.getByRole('textbox')).toHaveProperty(
            'nodeName',
            'TEXTAREA'
        );
    });
});
