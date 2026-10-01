import * as React from 'react';
import { StoryFn, Meta } from '@storybook/react-vite';
import { Table, TableProps } from '@lotta-schule/hubert';

export default {
  title: 'layout/Table',
  component: Table,
  argTypes: {},
} as Meta;

const Template: StoryFn<{
  args: TableProps;
  content: React.ReactElement;
}> = ({ args, content }) => <Table {...args}>{content}</Table>;

export const Default = {
  render: Template,

  args: {
    args: {},
    content: (
      <>
        <thead>
          <tr>
            <td>Thema</td>
            <td>Inhalt</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Dingsi</td>
            <td>Bumsi</td>
          </tr>
          <tr>
            <td>Dingsi</td>
            <td>Bumsi</td>
          </tr>
        </tbody>
      </>
    ),
  },
};
