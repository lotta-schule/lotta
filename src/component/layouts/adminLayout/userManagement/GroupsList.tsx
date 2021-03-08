import React, { memo, useState } from 'react';
import {
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Typography,
    makeStyles,
} from '@material-ui/core';
import { AddCircle, ExpandMore, DragHandle } from '@material-ui/icons';
import { useMutation } from '@apollo/client';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { ID, UserGroupModel, UserGroupInputModel } from 'model';
import { UpdateUserGroupMutation } from 'api/mutation/UpdateUserGroupMutation';
import { useUserGroups } from 'util/client/useUserGroups';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { EditGroupForm } from './EditGroupForm';
import { CreateUserGroupDialog } from './CreateUserGroupDialog';

const useStyles = makeStyles((theme) => ({
    createButton: {
        float: 'right',
        marginBottom: theme.spacing(3),
    },
    draghandleIcon: {
        color: theme.palette.text.disabled,
        marginRight: theme.spacing(2),
    },
}));

export const GroupsList = memo(() => {
    const styles = useStyles();
    const groups = useUserGroups();
    const [expandedGroupId, setExpandedGroupId] = useState<ID | null>(null);
    const [
        isCreateUserGroupDialogOpen,
        setIsCreateUserGroupDialogOpen,
    ] = useState(false);

    const [updateGroup, { error }] = useMutation<
        { group: UserGroupModel },
        { id: ID; group: UserGroupInputModel }
    >(UpdateUserGroupMutation, {
        optimisticResponse: ({ id, group }) => {
            return {
                __typename: 'Mutation',
                group: {
                    __typename: 'UserGroup',
                    id,
                    sortKey: group.sortKey,
                },
            } as any;
        },
    });

    return (
        <>
            <Grid container>
                <Grid item sm={8}></Grid>
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
                        onConfirm={(group) => {
                            setIsCreateUserGroupDialogOpen(false);
                            setExpandedGroupId(group.id);
                        }}
                    />
                </Grid>
            </Grid>
            <DragDropContext
                onDragEnd={({ destination, source }) => {
                    if (!destination) {
                        return;
                    }
                    if (
                        destination.droppableId === source.droppableId &&
                        destination.index === source.index
                    ) {
                        return;
                    }

                    const newGroupsArray = Array.from(groups);
                    newGroupsArray.splice(source.index, 1);
                    newGroupsArray.splice(
                        destination.index,
                        0,
                        groups[source.index]
                    );
                    newGroupsArray.forEach((group, index) => {
                        if (group) {
                            updateGroup({
                                variables: {
                                    id: group.id,
                                    group: {
                                        name: group.name,
                                        sortKey: index * 10 + 10,
                                    },
                                },
                            });
                        }
                    });
                }}
            >
                <ErrorMessage error={error} />
                <Droppable droppableId={'groups-root'} type={'root-groups'}>
                    {({ droppableProps, innerRef, placeholder }) => (
                        <div
                            {...droppableProps}
                            ref={innerRef}
                            style={{ paddingBottom: '5em' }}
                        >
                            {groups.map((group, index) => (
                                <Draggable
                                    key={group.id}
                                    draggableId={String(group.id)}
                                    index={index}
                                >
                                    {({
                                        innerRef,
                                        dragHandleProps,
                                        draggableProps,
                                    }) => (
                                        <Accordion
                                            key={group.id}
                                            expanded={
                                                expandedGroupId === group.id
                                            }
                                            onChange={(_, expanded) =>
                                                setExpandedGroupId(
                                                    expanded ? group.id : null
                                                )
                                            }
                                            TransitionProps={{
                                                unmountOnExit: true,
                                            }}
                                            innerRef={innerRef}
                                            {...draggableProps}
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMore />}
                                                aria-controls={`group-panel-${group.id}-content`}
                                                id={`group-panel-${group.id}-header`}
                                            >
                                                <Typography>
                                                    <span
                                                        {...dragHandleProps}
                                                        style={{
                                                            verticalAlign:
                                                                'top',
                                                        }}
                                                    >
                                                        <DragHandle
                                                            className={
                                                                styles.draghandleIcon
                                                            }
                                                        />
                                                    </span>
                                                    {group.name}
                                                </Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <EditGroupForm group={group} />
                                            </AccordionDetails>
                                        </Accordion>
                                    )}
                                </Draggable>
                            ))}
                            {placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </>
    );
});
