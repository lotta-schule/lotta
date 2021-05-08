import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import { Header } from '../component/general/layout/Header';
import { Box } from '../component/general/layout/Box';

export default {
    title: 'Layout/Header',
    component: Header,
    argTypes: {},
} as Meta;

const Template: Story = (args) => <Header {...args} />;

export const Default = Template.bind({});
Default.args = {
    children: (
        <Box>
            <img src="https://picsum.photos/300/100" alt="" />
            <h2>Lotta Gesamtschule</h2>
        </Box>
    ),
};
