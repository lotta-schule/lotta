import * as React from 'react';
import { render } from 'test/util';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';

describe('component/general/form/radio', () => {
    it('should render with correct name', () => {
        const screen = render(
            <RadioGroup name={'form-name'}>
                <Radio value={0} label={'0'} />
                <Radio value={1} label={'1'} />
                <Radio value={2} label={'2'} />
                <Radio value={3} label={'3'} />
            </RadioGroup>
        );
        const radios = screen.getAllByRole('radio') as HTMLInputElement[];
        expect(radios).toHaveLength(4);
        expect(radios.every((r) => r.name === 'form-name'));
    });
});
