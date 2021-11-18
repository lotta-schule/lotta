import * as React from 'react';
import { render } from 'test/util';
import { Select } from './Select';

describe('shared/general/form/select', () => {
    it('should render', () => {
        const screen = render(
            <Select>
                <option>0</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
            </Select>
        );
        expect(screen.getByRole('combobox')).toBeVisible();
        expect(screen.getAllByRole('option')).toHaveLength(4);
    });
});
