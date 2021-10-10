import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { Divider } from 'component/general/divider/Divider';

export default {
    title: 'utils/Divider',
    component: Divider,
    argTypes: {},
} as Meta;

const Template: Story = (args) => <Divider {...args} />;

export const Default = Template.bind({});
Default.args = {};
