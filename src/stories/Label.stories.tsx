import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { Label, LabelProps } from 'component/general/label/Label';
import { Input } from 'component/general/input/Input';
import { Select } from 'component/general/select/Select';

export default {
    title: 'Label/Default',
    component: Label,
    argTypes: {},
} as Meta;

const Template: Story<Omit<LabelProps, 'ref'>> = (args) => (
    <section>
        <Label style={{ marginBottom: '3em' }} {...args}>
            <Input />
        </Label>

        <Label style={{ marginBottom: '3em' }} {...args}>
            <Select>
                <option>Bla</option>
            </Select>
        </Label>

        <Label style={{ marginBottom: '3em' }} {...args}>
            <div
                style={{
                    color: '#000',
                    fontSize: '1rem',
                    fontFamily: 'sans-serif',
                    textTransform: 'none',
                }}
            >
                Simple Text
            </div>
        </Label>
    </section>
);

export const Default = Template.bind({});
Default.args = {
    label: 'I am a pretty label',
};
