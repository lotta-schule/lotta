import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { Box } from '../shared/general/layout/Box';

export default {
    title: 'Layout/Box',
    component: Box,
    argTypes: {},
} as Meta;

const Template: Story = (args) => <Box {...args} />;

export const Default = Template.bind({});
Default.args = {
    children: (
        <div>
            <img src="https://picsum.photos/300/200" alt="" />
            <div>Ich bin eine Box mit Inhalt</div>
        </div>
    ),
};
