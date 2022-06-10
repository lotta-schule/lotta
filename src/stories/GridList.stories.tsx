import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { GridList, GridListItem } from '../shared/general/gridlist/GridList';

export default {
    title: 'Layout/GridList',
    component: GridList,
    argTypes: {},
} as Meta;

const Template: Story = (args) => (
    <GridList {...args}>
        <GridListItem>
            <img src="https://picsum.photos/600/400" alt="" />
        </GridListItem>
        <GridListItem>
            <img src="https://picsum.photos/600/400" alt="" />
        </GridListItem>
        <GridListItem>
            <img src="https://picsum.photos/600/400" alt="" />
        </GridListItem>
        <GridListItem>
            <img src="https://picsum.photos/600/400" alt="" />
        </GridListItem>
        <GridListItem>
            <img src="https://picsum.photos/600/400" alt="" />
        </GridListItem>
    </GridList>
);

export const Default = Template.bind({});
Default.args = {};
