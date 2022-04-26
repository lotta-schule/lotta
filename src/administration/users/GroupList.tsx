import * as React from 'react';
import chunk from 'lodash/chunk';
import { AddCircle } from '@material-ui/icons';
import { useMutation } from '@apollo/client';
import { DragHandle } from 'shared/general/icon';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { ID, UserGroupModel, UserGroupInputModel } from 'model';
import { useUserGroups } from 'util/tenant/useUserGroups';
import { Button } from 'shared/general/button/Button';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { CreateUserGroupDialog } from './CreateUserGroupDialog';
import { EditUserGroupDialog } from './EditUserGroupDialog';

import UpdateUserGroupMutation from 'api/mutation/UpdateUserGroupMutation.graphql';

import styles from './GroupList.module.scss';

const COLUMN_COUNT = 4;

export const GroupList = () => {
    const groups = useUserGroups();
    const [selectedGroup, setSelectedGroup] =
        React.useState<UserGroupModel | null>(null);
    const [isCreateUserGroupDialogOpen, setIsCreateUserGroupDialogOpen] =
        React.useState(false);

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

    const entriesPerList = Math.ceil(groups.length / COLUMN_COUNT);

    const chunkedGroups = chunk(groups, entriesPerList);

    return (
        <div className={styles.root}>
            <div className={styles.toolBar}>
                <Button
                    className={styles.createButton}
                    icon={<AddCircle />}
                    onClick={() => setIsCreateUserGroupDialogOpen(true)}
                >
                    Gruppe erstellen
                </Button>
            </div>
            <CreateUserGroupDialog
                isOpen={isCreateUserGroupDialogOpen}
                onAbort={() => setIsCreateUserGroupDialogOpen(false)}
                onConfirm={(group) => {
                    setIsCreateUserGroupDialogOpen(false);
                    setSelectedGroup(group);
                }}
            />
            <EditUserGroupDialog
                group={selectedGroup}
                onRequestClose={() => setSelectedGroup(null)}
            />
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

                    const fromColumn = Number(
                        source.droppableId.replace(/[^\d/]/g, '')
                    );
                    const toColumn = Number(
                        destination.droppableId.replace(/[^\d/]/g, '')
                    );

                    const fromIndex =
                        fromColumn * entriesPerList + source.index;
                    const toIndex =
                        toColumn * entriesPerList + destination.index;
                    const newGroupsArray = Array.from(groups);
                    newGroupsArray.splice(fromIndex, 1);
                    newGroupsArray.splice(toIndex, 0, groups[fromIndex]);
                    const from = fromIndex < toIndex ? fromIndex : toIndex;
                    const to =
                        toIndex > fromIndex ? toIndex + 1 : fromIndex + 1;
                    debugger;
                    newGroupsArray.slice(from, to).forEach((group, index) => {
                        if (group) {
                            updateGroup({
                                variables: {
                                    id: group.id,
                                    group: {
                                        name: group.name,
                                        sortKey: (from + index) * 10 + 10,
                                    },
                                },
                            });
                        }
                    });
                }}
            >
                <ErrorMessage error={error} />
                <div className={styles.listsWrapper}>
                    {chunkedGroups.map((groupsChunk, index) => (
                        <Droppable
                            key={index}
                            droppableId={`groups-column-${index}`}
                            type={'root-groups'}
                        >
                            {({ droppableProps, innerRef, placeholder }) => (
                                <ul {...droppableProps} ref={innerRef}>
                                    {groupsChunk.map((group, index) => (
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
                                                <li
                                                    title={group.name}
                                                    onClick={() =>
                                                        setSelectedGroup(group)
                                                    }
                                                    key={group.id}
                                                    ref={innerRef}
                                                    {...draggableProps}
                                                >
                                                    <span {...dragHandleProps}>
                                                        <DragHandle
                                                            className={
                                                                styles.draghandleIcon
                                                            }
                                                        />
                                                    </span>
                                                    {group.name} (
                                                    {group.sortKey})
                                                </li>
                                            )}
                                        </Draggable>
                                    ))}
                                    {placeholder}
                                </ul>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};
