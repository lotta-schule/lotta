import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import { Tabbar } from '../shared/general/tabs/Tabbar';
import { Tab } from 'shared/general/tabs/Tab';

export default {
    title: 'Layout/Tabbar',
    component: Tabbar,
    argTypes: {},
} as Meta;

const Template: Story = (args) => <Tabbar {...args} />;

export const Default = Template.bind({});
Default.args = {
    children: (
        <>
            <Tab>Tab1</Tab>
            <Tab>Tab2</Tab>
            <Tab>Tab3</Tab>
            <Tab>Tab4</Tab>
            <Tab>Tab5</Tab>
        </>
    ),
};
