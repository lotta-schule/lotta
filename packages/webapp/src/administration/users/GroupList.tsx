import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { useMutation } from '@apollo/client';
import {
  Button,
  DragHandle,
  ErrorMessage,
  Input,
  Label,
  List,
  ListItem,
  Option,
  Select,
} from '@lotta-schule/hubert';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { ID, UserGroupModel, UserGroupInputModel } from 'model';
import { useUserGroups } from 'util/tenant/useUserGroups';
import { CreateUserGroupDialog } from './CreateUserGroupDialog';
import { EditUserGroup } from './EditUserGroup';

import UpdateUserGroupMutation from 'api/mutation/UpdateUserGroupMutation.graphql';

import styles from './GroupList.module.scss';
import clsx from 'clsx';

type Sorting = 'custom' | 'name';

export const GroupList = () => {
  const groups = useUserGroups();
  const [selectedGroup, setSelectedGroup] =
    React.useState<UserGroupModel | null>(null);
  const [isCreateUserGroupDialogOpen, setIsCreateUserGroupDialogOpen] =
    React.useState(false);
  const [sorting, setSorting] = React.useState<Sorting>('custom');
  const [searchText, setSearchText] = React.useState('');

  const highlightedGroups = searchText
    ? groups.filter((group) =>
        group.name.toLowerCase().includes(searchText.toLowerCase())
      )
    : [];

  const sortedGroups = React.useMemo(() => {
    return sorting === 'custom'
      ? groups
      : [...groups].sort((g1, g2) => g1.name.localeCompare(g2.name));
  }, [groups, sorting]);

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

  React.useLayoutEffect(() => {
    if (highlightedGroups.length > 0) {
      document
        .querySelector(`[data-groupid="${highlightedGroups[0].id}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSelectedGroup(highlightedGroups[0]);
    }
  }, [highlightedGroups]);

  return (
    <div className={styles.root}>
      <CreateUserGroupDialog
        isOpen={isCreateUserGroupDialogOpen}
        onAbort={() => setIsCreateUserGroupDialogOpen(false)}
        onConfirm={(group) => {
          setIsCreateUserGroupDialogOpen(false);
          setSelectedGroup(group);
        }}
      />
      <ErrorMessage error={error} />
      <div className={styles.twoColumnLayout}>
        <section className={styles.groupList}>
          <div className={styles.groupListToolbar}>
            <Label label={'Suche'} className={styles.groupSearch}>
              <Input
                placeholder={'Gruppenname'}
                value={searchText}
                onChange={(e) => setSearchText(e.currentTarget.value)}
              />
            </Label>
            <Select
              className={styles.sorting}
              title={'Sortierung'}
              value={sorting}
              onChange={(v) => setSorting(v as Sorting)}
            >
              <Option value={'custom'}>Eigene</Option>
              <Option value={'name'}>Name</Option>
            </Select>
          </div>

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
            <Droppable
              isDropDisabled={sorting !== 'custom'}
              droppableId={'groups'}
              type={'root-groups'}
            >
              {({ droppableProps, innerRef, placeholder }) => (
                <List {...droppableProps} ref={innerRef}>
                  {sortedGroups.map((group, index) => (
                    <Draggable
                      key={group.id}
                      draggableId={String(group.id)}
                      index={index}
                      isDragDisabled={sorting !== 'custom'}
                    >
                      {({ innerRef, dragHandleProps, draggableProps }) => (
                        <ListItem
                          className={clsx(
                            highlightedGroups.includes(group) &&
                              styles.highlighted,
                            selectedGroup === group && styles.selected
                          )}
                          title={group.name}
                          onClick={() => setSelectedGroup(group)}
                          data-groupid={group.id}
                          key={group.id}
                          ref={innerRef}
                          rightSection={
                            sorting === 'custom' ? (
                              <span {...dragHandleProps}>
                                <DragHandle className={styles.draghandleIcon} />
                              </span>
                            ) : undefined
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
        </section>
        <div>
          <Button
            className={styles.createGroupButton}
            icon={<Icon icon={faCirclePlus} />}
            onClick={() => setIsCreateUserGroupDialogOpen(true)}
          >
            Gruppe erstellen
          </Button>
          <EditUserGroup
            group={selectedGroup}
            onDelete={() => setSelectedGroup(null)}
          />
        </div>
      </div>
    </div>
  );
};
