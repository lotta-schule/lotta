import * as React from 'react';
import { useMutation } from '@apollo/client';
import { DragHandle, ErrorMessage, List, ListItem } from '@lotta-schule/hubert';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { ID, UserGroupInputModel, UserGroupModel } from 'model';
import clsx from 'clsx';

import styles from './DraggableGroupList.module.scss';

export type DraggableGroupListProps = {
  groups: UserGroupModel[];
  highlightedGroups: UserGroupModel[];
  selectedGroupId: UserGroupModel['id'] | null;
  isDraggingDisabled: boolean;
  onSelect: (groupId: UserGroupModel) => void;
};

import UpdateUserGroupMutation from 'api/mutation/UpdateUserGroupMutation.graphql';

export const DraggableGroupList = ({
  groups,
  isDraggingDisabled,
  highlightedGroups,
  selectedGroupId,
  onSelect,
}: DraggableGroupListProps) => {
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
        newGroupsArray.splice(destination.index, 0, groups[source.index]);
        const from = Math.min(source.index, destination.index);
        const to = Math.max(source.index, destination.index) + 1;
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
      <Droppable
        isDropDisabled={isDraggingDisabled}
        droppableId={'groups'}
        type={'root-groups'}
      >
        {({ droppableProps, innerRef, placeholder }) => (
          <List {...droppableProps} ref={innerRef} className={styles.root}>
            {groups.map((group, index) => (
              <Draggable
                key={group.id}
                draggableId={String(group.id)}
                index={index}
                isDragDisabled={isDraggingDisabled}
              >
                {({ innerRef, dragHandleProps, draggableProps }) => (
                  <ListItem
                    className={clsx({
                      [styles.highlighted]: highlightedGroups.includes(group),
                      [styles.selected]: selectedGroupId === group.id,
                    })}
                    title={group.name}
                    onClick={() => onSelect(group)}
                    data-groupid={group.id}
                    key={group.id}
                    ref={innerRef}
                    rightSection={
                      !isDraggingDisabled && (
                        <span {...dragHandleProps}>
                          <DragHandle className={styles.draghandleIcon} />
                        </span>
                      )
                    }
                    {...draggableProps}
                  >
                    {group.name}
                  </ListItem>
                )}
              </Draggable>
            ))}
            {placeholder}
          </List>
        )}
      </Droppable>
    </DragDropContext>
  );
};
