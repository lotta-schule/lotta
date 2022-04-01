import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Tag } from 'shared/general/tag/Tag';
import { actions } from '@storybook/addon-actions';

export default {
    title: 'util/Tag',
    component: Tag,
    argTypes: {
        children: {
            name: 'children',
            type: { name: 'string', required: true },
            defaultValue: 'Hallo',
            description: 'The content of the tag',
        },
    },
} as Meta;

const Template: Story = (args: any) => <Tag {...args} />;

export const Default = Template.bind({});
Default.args = {
    children: 'Hallo',
    onDelete: undefined,
};

export const Deletable = Template.bind({});
Deletable.args = {
    children: 'Hallo',
    ...actions('onDelete'),
};
