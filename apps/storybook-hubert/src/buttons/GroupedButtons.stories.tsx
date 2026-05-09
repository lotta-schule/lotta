import * as React from 'react';
import { StoryFn, Meta } from '@storybook/react-vite';
import {
  Button,
  ButtonGroup,
  ButtonGroupProps,
  Close,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@lotta-schule/hubert';

export default {
  title: 'Buttons/ButtonGroup',
  component: ButtonGroup,
  argTypes: {},
} as Meta;

const Template: StoryFn<{
  args: ButtonGroupProps;
  buttons: React.ReactElement[];
}> = ({ args, buttons }) => <ButtonGroup {...args}>{buttons}</ButtonGroup>;

export const Default = {
  render: Template,

  args: {
    args: {},
    buttons: [
      <Button key={0} icon={<KeyboardArrowLeft />} selected />,
      <Button key={1} icon={<Close />} />,
      <Button key={2} icon={<KeyboardArrowRight />} />,
    ],
  },
};

export const Many = {
  render: Template,

  args: {
    args: {},
    buttons: [
      <Button key={0} label={'F'} />,
      <Button key={1} label={'I'} />,
      <Button key={2} label={'U'} />,
      <Button key={3} label={'U'} />,
      <Button key={4} label={'U'} />,
      <Button key={5} label={'U'} />,
      <Button key={6} label={'U'} />,
      <Button key={7} icon={<Close />} />,
      <Button key={8} label={'U'} />,
      <Button key={9} label={'U'} />,
      <Button key={10} label={'U'} />,
    ],
  },
};
