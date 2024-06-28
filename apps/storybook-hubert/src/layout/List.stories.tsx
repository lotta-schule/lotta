import * as React from 'react';
import { StoryObj } from '@storybook/react';
import {
  Avatar,
  Button,
  Close,
  DraggableListItem,
  List,
  ListItem,
  ListItemSecondaryText,
  ListProps,
  SortableDraggableList,
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

export const DraggableList: Story = {
  render: (args: ListProps) => {
    const items = [
      { id: '1', title: 'Test 1' },
      { id: '2', title: 'Test 2 is selected', selected: true },
      { id: '3', title: 'Test 3' },
      {
        id: '4',
        title: 'Test 4 has a main action and an icon',
        icon: <Close />,
      },
      { id: '5', title: 'I have no drag handle' },
    ];
    return (
      <SortableDraggableList items={items} {...args} onChange={() => {}} />
    );
  },
};
