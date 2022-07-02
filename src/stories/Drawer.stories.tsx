import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { Drawer } from '../shared/general/drawer/Drawer';
import { Button } from 'shared/general/button/Button';

export default {
    title: 'Layout/Drawer',
    component: Drawer,
    argTypes: {},
} as Meta;

const Template: Story = (args) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <div>
            <Button onClick={() => setIsOpen((open) => !open)}>toggle</Button>
            <Drawer {...args} isOpen={isOpen} />
        </div>
    );
};

export const Default = Template.bind({});
Default.args = {
    children: (
        <div>
            <img src="https://picsum.photos/300/200" alt="" />
            <div>Ich bin eine Box mit Inhalt</div>
        </div>
    ),
};
