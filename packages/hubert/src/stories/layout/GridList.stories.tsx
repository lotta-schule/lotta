import * as React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { GridList, GridListItem } from '../../gridlist';

export default {
  title: 'Layout/GridList',
  component: GridList,
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => (
  <GridList {...args}>
    <GridListItem>
      <img src="https://picsum.photos/id/7/600/400" alt="" />
    </GridListItem>
    <GridListItem>
      <img src="https://picsum.photos/id/14/600/400" alt="" />
    </GridListItem>
    <GridListItem>
      <img src="https://picsum.photos/id/21/600/400" alt="" />
    </GridListItem>
    <GridListItem>
      <img src="https://picsum.photos/id/28/600/400" alt="" />
    </GridListItem>
    <GridListItem>
      <img src="https://picsum.photos/id/35/600/400" alt="" />
    </GridListItem>
  </GridList>
);

export const Default = {
  render: Template,
  args: {},
};
