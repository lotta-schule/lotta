import * as React from 'react';
import { Icon } from 'shared/Icon';
import {
  faAngleLeft,
  faAngleRight,
  faCirclePlus,
} from '@fortawesome/free-solid-svg-icons';
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
  SplitView,
  SplitViewButton,
  SplitViewContent,
  SplitViewNavigation,
  Toolbar,
} from '@lotta-schule/hubert';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { ID, UserGroupModel, UserGroupInputModel } from 'model';
import { useUserGroups } from 'util/tenant/useUserGroups';
import { CreateUserGroupDialog } from './CreateUserGroupDialog';
import { EditUserGroup } from './EditUserGroup';
import clsx from 'clsx';

import styles from './GroupList.module.scss';

import UpdateUserGroupMutation from 'api/mutation/UpdateUserGroupMutation.graphql';

type Sorting = 'custom' | 'name';

export const GroupList = () => {
  const groups = useUserGroups();
  const [selectedGroupId, setSelectedGroupId] = React.useState<
    UserGroupModel['id'] | null
  >(null);
  const [isCreateUserGroupDialogOpen, setIsCreateUserGroupDialogOpen] =
    React.useState(false);
  const [sorting, setSorting] = React.useState<Sorting>('custom');
  const [searchText, setSearchText] = React.useState('');

  const highlightedGroups = React.useMemo(
    () =>
      searchText
        ? groups.filter((group) =>
            group.name.toLowerCase().includes(searchText.toLowerCase())
          )
        : [],
    [searchText, groups]
  );

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
      setSelectedGroupId(highlightedGroups[0].id);
    }
  }, [highlightedGroups]);

  return (
    <div className={styles.root}>
      <CreateUserGroupDialog
        isOpen={isCreateUserGroupDialogOpen}
        onAbort={() => setIsCreateUserGroupDialogOpen(false)}
        onConfirm={(group) => {
          setIsCreateUserGroupDialogOpen(false);
          setSelectedGroupId(group.id);
        }}
      />
      <ErrorMessage error={error} />
      <SplitView>
        {({ close: closeSidebar }) => (
          <>
            <SplitViewNavigation>
              <Toolbar>
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
                <SplitViewButton
                  action={'close'}
                  style={{
                    height: 40,
                    alignSelf: 'center',
                    marginLeft: 'auto',
                  }}
                  icon={<Icon icon={faAngleLeft} />}
                />
              </Toolbar>

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
                                selectedGroupId === group.id && styles.selected
                              )}
                              title={group.name}
                              onClick={() => {
                                setSelectedGroupId(group.id);
                                closeSidebar();
                              }}
                              data-groupid={group.id}
                              key={group.id}
                              ref={innerRef}
                              rightSection={
                                sorting === 'custom' ? (
                                  <span {...dragHandleProps}>
                                    <DragHandle
                                      className={styles.draghandleIcon}
                                    />
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
            </SplitViewNavigation>
            <SplitViewContent>
              <Toolbar>
                <SplitViewButton
                  action={'open'}
                  icon={<Icon icon={faAngleRight} />}
                />
                <Button
                  className={styles.createGroupButton}
                  icon={<Icon icon={faCirclePlus} />}
                  onClick={() => setIsCreateUserGroupDialogOpen(true)}
                >
                  Gruppe erstellen
                </Button>
              </Toolbar>
              <EditUserGroup
                groupId={selectedGroupId}
                onDelete={() => setSelectedGroupId(null)}
              />
            </SplitViewContent>
          </>
        )}
      </SplitView>
    </div>
  );
};
