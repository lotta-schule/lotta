'use client';

import * as React from 'react';
import { useMutation } from '@apollo/client';
import { DraggableListItem, ErrorMessage, List } from '@lotta-schule/hubert';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { ID, UserGroupInputModel, UserGroupModel } from 'model';
import { useUserGroups } from 'util/tenant/useUserGroups';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { isBrowser } from 'util/isBrowser';
import clsx from 'clsx';

import styles from './DraggableGroupList.module.scss';

import UpdateUserGroupMutation from 'api/mutation/UpdateUserGroupMutation.graphql';

export const DraggableGroupList = () => {
  const router = useRouter();
  const { groupId: selectedGroupId } = useParams()!;
  const searchParams = useSearchParams();

  const searchTerm = searchParams?.get('s') ?? '';

  const groups = useUserGroups();
  // TODO:
  const isDraggingDisabled = false;

  const highlightedGroups = React.useMemo(
    () =>
      (searchTerm &&
        groups.filter((group) =>
          group.name.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
      [],
    [searchTerm, groups]
  );

  React.useEffect(() => {
    if (highlightedGroups.length > 0 && isBrowser()) {
      const firstHighlightedElement = document.querySelector(
        `[data-groupid="${highlightedGroups[0].id}"]`
      );
      if (firstHighlightedElement) {
        firstHighlightedElement.scrollIntoView({
          block: 'start',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedGroups]);

  const onSelect = (group: UserGroupModel) => {
    router.push(`/admin/groups/${group.id}`);
  };

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
        isDropDisabled={!!isDraggingDisabled}
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
                isDragDisabled={!!isDraggingDisabled}
              >
                {({ innerRef, dragHandleProps, draggableProps }) => (
                  <DraggableListItem
                    {...draggableProps}
                    className={clsx({
                      [styles.highlighted]: highlightedGroups.includes(group),
                    })}
                    title={group.name}
                    selected={selectedGroupId === group.id}
                    onClick={() => onSelect(group)}
                    data-groupid={group.id}
                    key={group.id}
                    ref={innerRef}
                    dragHandleProps={
                      isDraggingDisabled
                        ? undefined
                        : dragHandleProps ?? undefined
                    }
                  />
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
