import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import {
    ButtonGroup,
    ButtonGroupProps,
} from '../component/general/button/ButtonGroup';
import { FormatBold, FormatItalic, FormatUnderlined } from '@material-ui/icons';
import { Button } from 'component/general/button/Button';

export default {
    title: 'Buttons/ButtonGroup',
    component: ButtonGroup,
    argTypes: {},
} as Meta;

const Template: Story<{
    args: ButtonGroupProps;
    buttons: React.ReactElement[];
}> = ({ args, buttons }) => <ButtonGroup {...args}>{buttons}</ButtonGroup>;

export const Default = Template.bind({});
Default.args = {
    args: {},
    buttons: [
        <Button key={0} icon={<FormatBold />} selected />,
        <Button key={1} icon={<FormatItalic />} />,
        <Button key={2} icon={<FormatUnderlined />} />,
    ],
};

export const Many = Template.bind({});
Many.args = {
    args: {},
    buttons: [
        <Button key={0} label={'F'} />,
        <Button key={1} label={'I'} />,
        <Button key={2} label={'U'} />,
        <Button key={3} label={'U'} />,
        <Button key={4} label={'U'} />,
        <Button key={5} label={'U'} />,
        <Button key={6} label={'U'} />,
        <Button key={7} icon={<FormatUnderlined />} />,
        <Button key={8} label={'U'} />,
        <Button key={9} label={'U'} />,
        <Button key={10} label={'U'} />,
    ],
};
