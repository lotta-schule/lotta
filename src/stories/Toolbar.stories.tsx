import React from 'react';
import { Story, Meta } from '@storybook/react';
import { FormatBold, FormatItalic, FormatUnderlined } from '@material-ui/icons';
import { Button } from 'shared/general/button/Button';
import { Toolbar, ToolbarProps } from 'shared/general/layout/Toolbar';
import { ButtonGroup } from 'shared/general/button/ButtonGroup';

export default {
    title: 'Layout/Toolbar',
    component: Toolbar,
    argTypes: {},
} as Meta;

const Template: Story<{
    args: ToolbarProps;
    content: React.ReactElement;
}> = ({ args, content }) => <Toolbar {...args}>{content}</Toolbar>;

export const Default = Template.bind({});
Default.args = {
    args: {},
    content: (
        <>
            <Button small key={0} icon={<FormatBold />} selected />
            <Button small key={1} icon={<FormatItalic />} />
            <Button small key={2} icon={<FormatUnderlined />} />
        </>
    ),
};

export const Many = Template.bind({});
Many.args = {
    args: {},
    content: (
        <>
            <Button small key={0} label={'F'} />
            <Button small key={1} label={'I'} />
            <ButtonGroup>
                <Button small key={2} label={'U'} />
                <Button small key={3} label={'U'} />
                <Button small key={4} label={'U'} />
            </ButtonGroup>
            <ButtonGroup>
                <Button small key={5} label={'U'} />
                <Button small key={6} label={'U'} />
                <Button small key={7} icon={<FormatUnderlined />} />
                <Button small key={8} label={'U'} />
                <Button small key={9} label={'U'} />
                <Button small key={10} label={'U'} />
            </ButtonGroup>
        </>
    ),
};
