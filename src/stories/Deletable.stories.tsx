import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { Deletable, DeletableProps } from 'shared/general/util/Deletable';

export default {
    title: 'util/Deletable',
    component: Deletable,
    argTypes: {},
} as Meta;

const Template: Story<DeletableProps> = (args) => (
    <Deletable {...args}>
        <img
            alt={''}
            style={{ backgroundColor: 'green', width: 150, height: 150 }}
        />
    </Deletable>
);

export const Default = Template.bind({});
Default.args = {
    onDelete: () => {},
};
