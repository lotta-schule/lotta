import * as React from 'react';
import { Meta } from '@storybook/react';
import { Close } from '../../icon';
import { List, ListItem, ListItemSecondaryText, ListProps } from '../../list';
import { Avatar } from '../../avatar';
import { Button } from '../../button';

export default {
  title: 'layout/List',
  component: List,
  subcomponents: {
    ListItem,
  },
} as Meta;

const getAvatarUrl = (i: string | number) =>
  `https://avatars.dicebear.com/api/avataaars/${i}.svg`;

export const Default = {
  render: (args: ListProps) => (
    <List {...args}>
      <ListItem>Test</ListItem>
      <ListItem>Test</ListItem>
      <ListItem>Test</ListItem>
      <ListItem>Test</ListItem>
    </List>
  ),
};

export const WithSecondaryText = {
  render: (args: ListProps) => (
    <List {...args}>
      <ListItem>
        Test
        <ListItemSecondaryText>Secondary Text</ListItemSecondaryText>
      </ListItem>
      <ListItem>
        Test
        <ListItemSecondaryText>Secondary Text</ListItemSecondaryText>
      </ListItem>
      <ListItem>
        Test
        <ListItemSecondaryText>Secondary Text</ListItemSecondaryText>
      </ListItem>
      <ListItem>
        Test
        <ListItemSecondaryText>Secondary Text</ListItemSecondaryText>
      </ListItem>
    </List>
  ),
};

export const AvatarList = {
  render: (args: ListProps) => (
    <List {...args}>
      {Array.from({ length: 10 }).map((_, i) => (
        <ListItem key={i} leftSection={<Avatar src={getAvatarUrl(i)} />}>
          Test
        </ListItem>
      ))}
    </List>
  ),
};

export const ActionList = {
  render: (args: ListProps) => (
    <List {...args}>
      <ListItem
        leftSection={<Avatar src={getAvatarUrl(999)} />}
        rightSection={<Button icon={<Close />} />}
      >
        Test
      </ListItem>
      <ListItem rightSection={<Button icon={<Close />} />}>Test</ListItem>
      <ListItem rightSection={<Button icon={<Close />} />}>Test</ListItem>
      <ListItem rightSection={<Button icon={<Close />} />}>Test</ListItem>
    </List>
  ),
};
