import React, { memo, useState, useCallback } from 'react';
import {
    Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, makeStyles, Theme,
    CircularProgress, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Button
} from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { AddUserToGroupDialog } from './AddUserToGroupDialog';
import { useQuery } from 'react-apollo';
import { UserModel } from 'model';
import { GetUsersQuery } from 'api/query/GetUsersQuery';
import { groupBy, find } from 'lodash';
import { User } from 'util/model';
import { useTenant } from 'util/client/useTenant';
import { useUserGroups } from 'util/client/useUserGroups';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { SearchUserField } from './SearchUserField';
import { UserAvatar } from 'component/user/UserAvatar';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    avatar: {
        height: 50,
        width: 50,
        margin: '.25em .5em .25em 0',
    },
    headlines: {
        marginBottom: theme.spacing(2),
    },
    formControl: {
        width: '100%',
    },
    expandHeading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '50%',
        flexShrink: 0,
    },
    secondaryExpandHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
}));

export const UserManagement = memo(() => {
    const tenant = useTenant();
    const groups = useUserGroups();
    const currentUser = useCurrentUser();

    const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
    const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
    const { data, loading, refetch } = useQuery<{ users: UserModel[] }>(GetUsersQuery);

    const styles = useStyles();

    const getGroupedUsers = useCallback((users: UserModel[]) => {
        return groupBy(users, user => {
            const currentGroup = find(user.groups, group => group.tenant.id === tenant.id);
            if (currentGroup) {
                return currentGroup.id;
            } else {
                return null;
            }
        });
    }, [tenant.id]);

    if (loading) {
        return (
            <CircularProgress />
        );
    }

    if (data && data.users) {
        const groupedUsers = getGroupedUsers(data.users);
        return (
            <>
                <Paper className={styles.root}>
                    <Typography variant="h4" className={styles.headlines}>
                        Nutzerverwaltung
                    </Typography>
                    <SearchUserField className={styles.headlines} onSelectUser={setSelectedUser} />
                    {groups.map(group => (
                        <ExpansionPanel
                            key={group.id}
                            expanded={expandedGroupId === group.id}
                            onChange={(_, expanded) => setExpandedGroupId(expanded ? group.id : null)}
                            TransitionProps={{ unmountOnExit: true }}
                        >
                            <ExpansionPanelSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`group-panel-${group.id}-content`}
                                id={`group-panel-${group.id}-header`}
                            >
                                <Typography className={styles.expandHeading}>
                                    {group.name}
                                </Typography>
                                <Typography className={styles.secondaryExpandHeading}>
                                    {groupedUsers[group.id] ? groupedUsers[group.id].length : 0} Nutzer
                                </Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Table size={'small'}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell></TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Gruppe</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {groupedUsers[group.id] && groupedUsers[group.id].map(user => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <UserAvatar className={styles.avatar} user={user} />
                                                </TableCell>
                                                <TableCell>{User.getName(user)}{user.nickname && <><br /><strong>{user.nickname}</strong></>}</TableCell>
                                                <TableCell>
                                                    {user.id !== currentUser!.id && (
                                                        <Button variant={'outlined'} onClick={() => { setSelectedUser(user); }}>
                                                            bearbeiten
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                    ))}
                </Paper>
                {selectedUser && (
                    <AddUserToGroupDialog
                        onAbort={() => setSelectedUser(null)}
                        onConfirm={() => {
                            setSelectedUser(null);
                            refetch();
                        }}
                        user={selectedUser}
                    />
                )}
            </>
        );
    } else {
        return null;
    }

});