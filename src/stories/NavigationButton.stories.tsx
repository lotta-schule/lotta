import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import {
    NavigationButton,
    NavigationButtonProps,
} from '../component/general/button/NavigationButton';
import { Close } from '@material-ui/icons';

export default {
    title: 'Buttons/NavigationButton',
    component: NavigationButton,
    argTypes: {},
} as Meta;

const Template: Story<Omit<NavigationButtonProps, 'ref'>> = (args) => (
    <NavigationButton {...args} />
);

export const Default = Template.bind({});
Default.args = {
    label: 'Navigation-Button',
};

export const Selected = Template.bind({});
Selected.args = {
    label: 'Navigation-Button selected',
    selected: true,
};

export const IconButton = Template.bind({});
IconButton.args = {
    label: 'Navigation-Button with Icon',
    icon: <Close />,
};
