import * as React from 'react';
import { StoryFn, Meta } from '@storybook/react-vite';
import { Button, Drawer } from '@lotta-schule/hubert';

export default {
  title: 'overlays/Drawer',
  component: Drawer,
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>toggle</Button>
      <Drawer {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};
Template.parameters = {
  viewport: {
    defaultViewport: 'iphonex',
  },
};

export const Default = {
  render: Template,

  args: {
    children: (
      <div>
        <img src="https://picsum.photos/id/69/300/200" alt="" />
        <div>Ich bin eine Box mit Inhalt</div>
      </div>
    ),
  },
};
