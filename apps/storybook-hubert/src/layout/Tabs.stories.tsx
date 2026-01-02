import * as React from 'react';
import { StoryFn, Meta } from '@storybook/react-vite';
import { Tab, Tabbar } from '@lotta-schule/hubert';

export default {
  title: 'Layout/Tabbar',
  component: Tabbar,
  argTypes: {},
} as Meta;

const Template: StoryFn = () => {
  const [value, setValue] = React.useState('0');
  return (
    <Tabbar value={value} onChange={(value) => setValue(value as string)}>
      <Tab value={'0'}>Tab1 bla bla bla</Tab>
      <Tab value={'1'}>Tab2</Tab>
      <Tab value={'2'}>Tab3</Tab>
      <Tab value={'3'}>Tab4 dingsi bumso</Tab>
      <Tab value={'4'}>Tab5</Tab>
    </Tabbar>
  );
};

export const Default = {
  render: Template,

  args: {
    value: 2,
  },
};
