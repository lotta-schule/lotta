import React, { memo, useState } from 'react';
import { Button, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Grid, Typography, makeStyles } from '@material-ui/core';
import { AddCircle, ExpandMore } from '@material-ui/icons';
import { useUserGroups } from 'util/client/useUserGroups';
import { EditGroupForm } from './EditGroupForm';
import { ID } from 'model';
import { CreateUserGroupDialog } from './CreateUserGroupDialog';

const useStyles = makeStyles(theme => ({
    createButton: {
        float: 'right',
        marginBottom: theme.spacing(3)
    }
}));

export const GroupsList = memo(() => {
    const styles = useStyles();
    const groups = useUserGroups();
    const [expandedGroupId, setExpandedGroupId] = useState<ID | null>(null);
    const [isCreateUserGroupDialogOpen, setIsCreateUserGroupDialogOpen] = useState(false);

    return (
        <>
            <Grid container>
                <Grid item sm={8}>
                </Grid>
                <Grid item sm={4}>
                    <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        className={styles.createButton}
                        startIcon={<AddCircle />}
                        onClick={() => setIsCreateUserGroupDialogOpen(true)}
                    >
                        Gruppe erstellen
                    </Button>
                    <CreateUserGroupDialog
                        isOpen={isCreateUserGroupDialogOpen}
                        onAbort={() => setIsCreateUserGroupDialogOpen(false)}
                        onConfirm={group => {
                            setIsCreateUserGroupDialogOpen(false);
                            setExpandedGroupId(group.id);
                        }}
                    />
                </Grid>
            </Grid>
            {groups.map(group => (
                <ExpansionPanel
                    key={group.id}
                    expanded={expandedGroupId === group.id}
                    onChange={(_, expanded) => setExpandedGroupId(expanded ? group.id : null)}
                    TransitionProps={{ unmountOnExit: true }}
                >
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMore />}
                        aria-controls={`group-panel-${group.id}-content`}
                        id={`group-panel-${group.id}-header`}
                    >
                        <Typography>
                            {group.name}
                        </Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <EditGroupForm group={group} />
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            ))}
        </>
    );
});