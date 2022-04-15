import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import {
    List,
    ListItem,
    ListItemSecondaryText,
    ListProps,
} from 'shared/general/list/List';
import { Avatar } from 'shared/general/avatar/Avatar';
import { Button } from 'shared/general/button/Button';
import { OpenInNew } from '@material-ui/icons';

export default {
    title: 'layout/List',
    component: List,
    argTypes: {},
} as Meta;

const Template: Story<{
    args: ListProps;
}> = ({ args }) => <List {...args} />;

const getRandomAvatarUrl = () =>
    `https://avatars.dicebear.com/api/avataaars/${Math.floor(
        Math.random() * 1000
    )}.svg`;

export const Default = Template.bind({});
Default.args = {
    args: {
        children: (
            <>
                <ListItem>Test</ListItem>
                <ListItem>Test</ListItem>
                <ListItem>Test</ListItem>
                <ListItem>Test</ListItem>
            </>
        ),
    },
};

export const WithSecondaryText = Template.bind({});
WithSecondaryText.args = {
    args: {
        children: (
            <>
                <ListItem>
                    Test
                    <ListItemSecondaryText>
                        Secondary Text
                    </ListItemSecondaryText>
                </ListItem>
                <ListItem>
                    Test
                    <ListItemSecondaryText>
                        Secondary Text
                    </ListItemSecondaryText>
                </ListItem>
                <ListItem>
                    Test
                    <ListItemSecondaryText>
                        Secondary Text
                    </ListItemSecondaryText>
                </ListItem>
                <ListItem>
                    Test
                    <ListItemSecondaryText>
                        Secondary Text
                    </ListItemSecondaryText>
                </ListItem>
            </>
        ),
    },
};

export const AvatarList = Template.bind({});
AvatarList.args = {
    args: {
        children: (
            <>
                <ListItem leftSection={<Avatar src={getRandomAvatarUrl()} />}>
                    Test
                </ListItem>
                <ListItem leftSection={<Avatar src={getRandomAvatarUrl()} />}>
                    Test
                </ListItem>
                <ListItem leftSection={<Avatar src={getRandomAvatarUrl()} />}>
                    Test
                </ListItem>
                <ListItem leftSection={<Avatar src={getRandomAvatarUrl()} />}>
                    Test
                </ListItem>
            </>
        ),
    },
};

export const ActionList = Template.bind({});
ActionList.args = {
    args: {
        children: (
            <>
                <ListItem
                    leftSection={<Avatar src={getRandomAvatarUrl()} />}
                    rightSection={<Button icon={<OpenInNew />} />}
                >
                    Test
                </ListItem>
                <ListItem rightSection={<Button icon={<OpenInNew />} />}>
                    Test
                </ListItem>
                <ListItem rightSection={<Button icon={<OpenInNew />} />}>
                    Test
                </ListItem>
                <ListItem rightSection={<Button icon={<OpenInNew />} />}>
                    Test
                </ListItem>
            </>
        ),
    },
};
