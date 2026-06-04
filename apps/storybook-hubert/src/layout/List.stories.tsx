import * as React from 'react';
import { StoryObj } from '@storybook/react-vite';
import {
  Avatar,
  Button,
  Close,
  DraggableListItem,
  List,
  ListItem,
  ListItemSecondaryText,
  ListProps,
} from '@lotta-schule/hubert';

export default {
  title: 'layout/List',
  component: List,
  subcomponents: {
    ListItem,
    DraggableListItem,
  } as any,
};

const getAvatarUrl = (i: string | number) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`;

type Story = StoryObj<typeof List>;

export const Default: Story = {
  render: (args: ListProps) => (
    <List {...args}>
      <ListItem>Test</ListItem>
      <ListItem>Test</ListItem>
      <ListItem>Test</ListItem>
      <ListItem>Test</ListItem>
    </List>
  ),
};

export const WithSecondaryText: Story = {
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

export const AvatarList: Story = {
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

export const ActionList: Story = {
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
