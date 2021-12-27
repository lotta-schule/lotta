import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import {
    LinearProgress,
    LinearProgressProps,
} from 'shared/general/progress/LinearProgress';

export default {
    title: 'Progress/LinearProgress',
    component: LinearProgress,
    argTypes: {},
} as Meta;

const Template: Story<LinearProgressProps> = (args) => (
    <LinearProgress {...args} />
);

export const Default = Template.bind({});
Default.args = {
    value: 33.3,
};

export const Indefinite = Template.bind({});
Indefinite.args = {
    isIndeterminate: true,
};
