import React, { memo, useState, useCallback } from 'react';
import {
    Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, makeStyles, Theme,
    CircularProgress, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Button
} from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { AssignUserToGroupsDialog } from './AssignUserToGroupsDialog';
import { useQuery } from 'react-apollo';
import { ID, UserModel, UserGroupModel } from 'model';
import { GetUsersQuery } from 'api/query/GetUsersQuery';
import { find } from 'lodash';
import { User } from 'util/model';
import { useUserGroups } from 'util/client/useUserGroups';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { SearchUserField } from './SearchUserField';
import { UserAvatar } from 'component/user/UserAvatar';
import classNames from 'classnames';

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
    searchUserField: {
        width: 'auto',
        maxWidth: 400,
        backgroundColor: theme.palette.grey[200]
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
    const groups = useUserGroups();
    const [currentUser] = useCurrentUser();

    const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
    const [expandedGroupId, setExpandedGroupId] = useState<ID | null>(null);
    const { data, loading, refetch } = useQuery<{ users: UserModel[] }>(GetUsersQuery);

    const styles = useStyles();

    const getUsersForGroup = useCallback((group: UserGroupModel) => {
        if (!data || !data.users) {
            return [];
        }
        return data.users.filter(user => !!find(user.groups, userGroup => userGroup.id === group.id));
    }, [data]);

    if (loading) {
        return (
            <CircularProgress />
        );
    }

    if (data && data.users) {
        return (
            <>
                <Paper className={styles.root}>
                    <Typography variant="h4" className={styles.headlines}>
                        Nutzerverwaltung
                    </Typography>
                    <SearchUserField className={classNames(styles.searchUserField, styles.headlines)} onSelectUser={setSelectedUser} />
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
                                    {getUsersForGroup(group).length} Nutzer
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
                                        {getUsersForGroup(group).sort((u1, u2) => u1.name.localeCompare(u2.name)).map(user => (
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
                    <AssignUserToGroupsDialog
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