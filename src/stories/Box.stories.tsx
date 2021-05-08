import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import { Box } from '../component/general/layout/Box';
import '../component/general/layout/box.scss';

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
