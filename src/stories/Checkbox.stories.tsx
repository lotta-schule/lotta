import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { Checkbox, CheckboxProps } from 'shared/general/form/checkbox';

export default {
    title: 'Form/Checkbox',
    component: Checkbox,
} as Meta;

const Template: Story<CheckboxProps> = (props) => {
    return <Checkbox {...props} />;
};

export const Default = Template.bind({});
Default.args = {
    children: 'Yes, I accept all the evil I am forced to',
};

export const Checked = Template.bind({});
Checked.args = {
    children: 'Yes, I accept all the evil I am forced to',
    isSelected: true,
};

export const CustomColor = Template.bind({});
CustomColor.args = {
    children: 'You agree going to sea in a yellow submarine?',
    isSelected: true,
    featureColor: [255, 255, 0],
};
