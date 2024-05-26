'use client';

import * as React from 'react';
import { Icon } from 'shared/Icon';
import {
  faAngleLeft,
  faAngleRight,
  faCirclePlus,
} from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Input,
  Label,
  Option,
  Select,
  SplitView,
  SplitViewButton,
  SplitViewContent,
  SplitViewNavigation,
  Toolbar,
} from '@lotta-schule/hubert';
import { useRouter } from 'next/navigation';
import { UserGroupModel } from 'model';
import {
  CreateUserGroupDialog,
  DeleteUserGroupDialog,
  DraggableGroupList,
  EditUserGroup,
} from './component';

import styles from './GroupList.module.scss';

type Sorting = 'custom' | 'name';

export type GroupListProps = {
  groups: UserGroupModel[];
};

export const GroupList = ({ groups }: GroupListProps) => {
  const router = useRouter();
  const [selectedGroupId, setSelectedGroupId] = React.useState<
    UserGroupModel['id'] | null
  >(null);
  const [isCreateUserGroupDialogOpen, setIsCreateUserGroupDialogOpen] =
    React.useState(false);
  const [groupToDelete, setGroupToDelete] =
    React.useState<UserGroupModel | null>(null);

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
      ? groups.sort((g1, g2) => g1.sortKey - g2.sortKey)
      : [...groups].sort((g1, g2) => g1.name.localeCompare(g2.name));
  }, [groups, sorting]);

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
      <SplitView>
        {({ close: closeSidebar }) => (
          <>
            <SplitViewNavigation>
              <Toolbar hasScrollableParent stackOnMobile>
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

              <DraggableGroupList
                groups={sortedGroups}
                isDraggingDisabled={sorting !== 'custom'}
                highlightedGroups={highlightedGroups}
                selectedGroupId={selectedGroupId}
                onSelect={(group) => {
                  setSelectedGroupId(group.id);
                  closeSidebar({ force: true });
                }}
              />
            </SplitViewNavigation>
            <SplitViewContent>
              <Toolbar hasScrollableParent>
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
                onRequestDeletion={(group) => {
                  setGroupToDelete({ ...group });
                }}
              />
            </SplitViewContent>
          </>
        )}
      </SplitView>
      <DeleteUserGroupDialog
        group={groupToDelete}
        onRequestClose={() => setGroupToDelete(null)}
        onConfirm={() => {
          setGroupToDelete(null);
          setSelectedGroupId(null);
          router.refresh();
        }}
      />
    </div>
  );
};
