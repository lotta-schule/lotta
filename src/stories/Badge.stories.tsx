import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { Badge } from '../shared/general/badge/Badge';

export default {
    title: 'util/Badge',
    Component: Badge,
    argTypes: {},
} as Meta;

const Template: Story = (args) => <Badge {...args} />;

export const Default = Template.bind({});
Default.args = {
    value: 12,
};
