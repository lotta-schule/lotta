import * as React from 'react';
import { render } from 'test/util';
import { Label } from './Label';

describe('component/general/label', () => {
    it('should render', () => {
        const screen = render(
            <Label label={'label'}>
                <p>Text</p>
            </Label>
        );
        expect(screen.getByText('label')).toBeVisible();
    });
});
