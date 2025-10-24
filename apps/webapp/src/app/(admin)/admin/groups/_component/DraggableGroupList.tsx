'use client';

import * as React from 'react';
import {
  Eduplaces as EduplacesIcon,
  SortableDraggableList,
} from '@lotta-schule/hubert';
import { useMutation } from '@apollo/client';
import { ID, UserGroupInputModel, UserGroupModel } from 'model';
import { useUserGroups } from 'util/tenant/useUserGroups';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { isBrowser } from 'util/isBrowser';
import { UPDATE_USER_GROUP } from '../_graphql';

import styles from './DraggableGroupList.module.scss';

export const DraggableGroupList = () => {
  const router = useRouter();
  const { groupId: selectedGroupId } = useParams()!;
  const searchParams = useSearchParams();

  const searchTerm = searchParams?.get('s') ?? '';
  const isDraggingDisabled = searchParams?.get('sort') === 'name';

  const groups = useUserGroups();

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

  const onSelect = React.useCallback(
    (group: UserGroupModel) => {
      router.push(`/admin/groups/${group.id}`);
    },
    [router]
  );

  const [updateGroup] = useMutation<
    { group: UserGroupModel },
    { id: ID; group: UserGroupInputModel }
  >(UPDATE_USER_GROUP, {
    optimisticResponse: ({ id, group }) => {
      const originalGroup = groups.find((g) => g.id === id);
      return {
        __typename: 'Mutation',
        group: {
          __typename: 'UserGroup',
          id,
          ...originalGroup,
          enrollmentTokens: group.enrollmentTokens ?? [],
          sortKey: group.sortKey,
        },
      } as any;
    },
  });

  return (
    <SortableDraggableList
      className={styles.root}
      id={'groups'}
      disabled={isDraggingDisabled}
      onChange={async (newGroups) => {
        const newGroupSortKeys = Object.fromEntries(
          newGroups.map((group, index) => [group.id, (index + 1) * 10])
        );

        const groupsToUpdate = groups.filter(
          (group) => newGroupSortKeys[group.id] !== group.sortKey
        );

        groupsToUpdate.map((group) => {
          updateGroup({
            variables: {
              id: group.id,
              group: {
                name: group.name,
                sortKey: newGroupSortKeys[group.id],
              },
            },
          });
        });
      }}
      items={groups.map((g) => ({
        id: g.id,
        title: g.name,
        icon: g.eduplacesId && <EduplacesIcon />,
        selected: selectedGroupId === g.id,
        onClick: () => onSelect(g),
      }))}
    />
  );
};
