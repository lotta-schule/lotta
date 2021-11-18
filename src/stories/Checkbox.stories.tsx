import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { Checkbox, CheckboxProps } from 'shared/general/form/checkbox';

export default {
    title: 'Form/Checkbox',
    component: Checkbox,
    argTypes: {},
} as Meta;

const Template: Story<Omit<CheckboxProps, 'ref'>> = () => {
    return (
        <Checkbox
            label={'Yes, I accept all the evil I am forced to'}
            value={'value'}
        />
    );
};

export const Default = Template.bind({});
Default.args = {};
