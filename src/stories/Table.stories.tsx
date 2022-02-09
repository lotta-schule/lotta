import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { Table, TableProps } from 'shared/general/table/Table';

export default {
    title: 'utils/Table',
    component: Table,
    argTypes: {},
} as Meta;

const Template: Story<{
    args: TableProps;
    content: React.ReactElement;
}> = ({ args, content }) => <Table {...args}>{content}</Table>;

export const Default = Template.bind({});
Default.args = {
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
};
