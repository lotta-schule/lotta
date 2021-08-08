import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { Select, SelectProps } from 'component/general/form/select/Select';

export default {
    title: 'Form/Select',
    component: Select,
    argTypes: {},
} as Meta;

const Template: Story<Omit<SelectProps, 'ref'>> = (args) => (
    <Select {...args}>
        <optgroup label={'Gruppe 1'}>
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
            <option>Option 4</option>
        </optgroup>
        <optgroup label={'Gruppe 2'}>
            <option>Option 1</option>
            <option>Option 2</option>
        </optgroup>
    </Select>
);

export const Default = Template.bind({});
Default.args = {};
