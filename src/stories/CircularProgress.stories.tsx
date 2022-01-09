import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import {
    CircularProgress,
    CircularProgressProps,
} from 'shared/general/progress/CircularProgress';

export default {
    title: 'Progress/CircularProgress',
    component: CircularProgress,
    argTypes: {},
} as Meta;

const Template: Story<CircularProgressProps> = (args) => (
    <CircularProgress {...args} />
);

export const Default = Template.bind({});
Default.args = {
    value: 33.3,
};

export const ShowValue = Template.bind({});
ShowValue.args = {
    value: 33.3,
    showValue: true,
};

export const Indefinite = Template.bind({});
Indefinite.args = {
    isIndeterminate: true,
};
