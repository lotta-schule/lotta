import * as React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { Input, InputProps } from 'component/general/input/Input';

export default {
    title: 'Form/Input',
    component: Input,
    argTypes: {},
} as Meta;

const Template: Story<Omit<InputProps, 'ref'>> = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = {
    placeholder: 'Please type something interesting ...',
};

export const Inline = Template.bind({});
Inline.args = {
    ...Default.args,
    inline: true,
};
