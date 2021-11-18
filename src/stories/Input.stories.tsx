import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { Input } from 'shared/general/form/input/Input';

export default {
    title: 'Form/Input',
    component: Input,
    argTypes: {},
} as Meta;

const Template: Story = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = {
    placeholder: 'Please type something interesting ...',
};

export const Inline = Template.bind({});
Inline.args = {
    ...Default.args,
    inline: true,
};

export const Multiline = Template.bind({});
Multiline.args = {
    ...Default.args,
    multiline: true,
};
