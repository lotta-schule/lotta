import React from 'react';
import { StoryFn, Meta } from '@storybook/react-vite';
import {
  Button,
  ButtonGroup,
  Close,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Toolbar,
  ToolbarProps,
} from '@lotta-schule/hubert';

export default {
  title: 'Layout/Toolbar',
  component: Toolbar,
  argTypes: {},
} as Meta;

const Template: StoryFn<{
  args: ToolbarProps;
  content: React.ReactElement;
}> = ({ args, content }) => <Toolbar {...args}>{content}</Toolbar>;

export const Default = {
  render: Template,

  args: {
    args: {},
    content: (
      <>
        <Button small key={0} icon={<KeyboardArrowLeft />} selected />
        <Button small key={1} icon={<Close />} />
        <Button small key={2} icon={<KeyboardArrowRight />} />
      </>
    ),
  },
};

export const Many = {
  render: Template,

  args: {
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
          <Button small key={7} icon={<Close />} />
          <Button small key={8} label={'U'} />
          <Button small key={9} label={'U'} />
          <Button small key={10} label={'U'} />
        </ButtonGroup>
      </>
    ),
  },
};
