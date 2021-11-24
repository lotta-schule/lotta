import * as React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import { Button, ButtonProps } from '../shared/general/button/Button';
import { Close } from '@material-ui/icons';

export default {
    title: 'Buttons/Button',
    component: Button,
    argTypes: {
        backgroundColor: { control: 'color' },
    },
} as Meta;

const Template: Story<Omit<ButtonProps, 'ref'>> = (args) => (
    <Button {...args} />
);

export const Primary = Template.bind({});
Primary.args = {
    label: 'Button',
};

export const IconWithLabelButton = Template.bind({});
IconWithLabelButton.args = {
    label: 'Button with Icon',
    icon: <Close />,
};

export const IconButton = Template.bind({});
IconButton.args = {
    icon: <Close />,
};
