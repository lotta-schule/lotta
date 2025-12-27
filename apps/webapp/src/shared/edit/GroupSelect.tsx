'use client';

import * as React from 'react';
import { Checkbox, ComboBox, NoSsr, Tag } from '@lotta-schule/hubert';
import { useUserGroups } from 'util/tenant/useUserGroups';
import clsx from 'clsx';

import styles from './GroupSelect.module.scss';

type UserGroupModel = ReturnType<typeof useUserGroups>[number];

export interface GroupSelectProps<
  AllowNoneSelection extends boolean | undefined,
  Model = AllowNoneSelection extends true
    ? UserGroupModel | null
    : UserGroupModel,
> {
  /**
   * If true, a none selection is allowed,
   * meaning it is possible to select 'no group'.
   * 'No group' will be represented by a null value.
   * It is explicitly meant to mean something else than
   * an empty selection, eg to allow a filtering a user
   * search to show users *without* a group.
   *
   * @type {boolean}
   * @default false
   **/
  allowNoneSelection?: AllowNoneSelection;

  className?: string;

  disableAdminGroupsExclusivity?: boolean;

  disabled?: boolean;

  /**
   * Whether to hide the option 'visible for everyone',
   * which for articles on lotta is the same as 'no groups
   * assigned to restrict visibility'.
   * If not set, a checkbox will be shown to allow deselection
   * of all groups ('make them publicly visible') when checked,
   * and selection of *all* available groups when unchecked.
   *
   * The label can be customized with the `publicGroupSelectionLabel`
   * prop.
   *
   * The checkbox will not be shown if this prop is set to true.
   *
   * @default false
   **/
  hidePublicGroupSelection?: boolean;

  /**
   * The label to show for the 'no groups assigned' item,
   * which can be selected when `allowNoneSelection` is true.
   *
   * See `allowNoneSelection` for more information.
   *
   * @default 'Ohne zugewiesene Gruppe'
   **/
  nonSelectionLabel?: string;

  /**
   * The label to show for the 'make publicly visible' checkbox
   * which deselects all groups when checked and selects them
   * all when unchecked.
   *
   * See `hidePublicGroupSelection` for more information.
   *
   * @default 'für alle sichtbar'
   **/
  publicGroupSelectionLabel?: string;

  /**
   * The label to show for the group selection input field
   * (the ComboBox).
   *
   * @default 'Gruppe suchen'
   **/
  label?: string;

  /**
   * Whether to display the list of selected groups in a row.
   * If false, the selected groups will be stacked vertically,
   * filling the available horizontal space.
   *
   * @default false
   **/
  row?: boolean;

  selectedGroups: Model[];
  suggestionFilter?(group: Model, i: number, allGroups: Model[]): boolean;
  onSelectGroups(groups: Model[]): void;
}

export const GroupSelect = React.memo(
  <T extends GroupSelectProps<boolean | undefined>>({
    allowNoneSelection = false,
    className,
    disableAdminGroupsExclusivity,
    disabled,
    hidePublicGroupSelection = false,
    publicGroupSelectionLabel = 'für alle sichtbar',
    nonSelectionLabel = 'Ohne zugewiesene Gruppe',
    label = 'Gruppe suchen',
    row = false,
    selectedGroups,
    suggestionFilter = () => true,
    onSelectGroups,
  }: T) => {
    const availableGroups = useUserGroups();

    const groupSorter = React.useCallback(
      (group1: UserGroupModel | null, group2: UserGroupModel | null) => {
        if (!group1) {
          return -1;
        }
        if (!group2) {
          return 1;
        }
        return (group1.sortKey ?? 0) - (group2.sortKey ?? 0);
      },
      []
    );

    const isAdminGroup = React.useCallback(
      (group: UserGroupModel | null | undefined) =>
        !!(
          group && availableGroups.find((g) => g.id === group.id)?.isAdminGroup
        ),
      [availableGroups]
    );

    const groups = React.useMemo(() => {
      const sortedGroups = availableGroups
        .filter(suggestionFilter)
        .sort(groupSorter);

      if (allowNoneSelection) {
        return [{ id: null, name: nonSelectionLabel }, ...sortedGroups];
      }
      return sortedGroups;
    }, [
      availableGroups,
      suggestionFilter,
      groupSorter,
      allowNoneSelection,
      nonSelectionLabel,
    ]);

    const items = React.useMemo(
      () =>
        groups.map((group) => ({
          label: group.name,
          key: group.id ?? 'no-group',
        })),
      [groups]
    );

    return (
      <NoSsr>
        <div className={clsx(styles.root, className)} data-testid="GroupSelect">
          <ComboBox
            fullWidth
            disabled={disabled || !groups.length}
            title={label}
            items={items}
            onSelect={(groupId) => {
              if (groupId === 'no-group' && allowNoneSelection === true) {
                const noneSelectionAlreadySelected =
                  selectedGroups.findIndex(
                    (selectedGroup) =>
                      selectedGroup === null || selectedGroup.id === 'no-group'
                  ) !== -1;
                if (!noneSelectionAlreadySelected) {
                  onSelectGroups([null, ...selectedGroups]);
                } else {
                  onSelectGroups(selectedGroups.filter((g) => g !== null));
                }
              }
              const group = availableGroups.find((g) => g.id === groupId);
              if (group) {
                const isGroupAlreadySelected = selectedGroups.find(
                  (selectedGroup) => selectedGroup?.id === group.id
                );
                if (disableAdminGroupsExclusivity || !isAdminGroup(group)) {
                  if (!isGroupAlreadySelected) {
                    onSelectGroups(
                      [...selectedGroups, group].sort(groupSorter)
                    );
                  } else {
                    onSelectGroups(
                      selectedGroups.filter(
                        (selectedGroup) => selectedGroup?.id !== group.id
                      )
                    );
                  }
                } else {
                  if (isGroupAlreadySelected) {
                    onSelectGroups([]);
                  } else {
                    onSelectGroups(
                      groups
                        // make 'no group' back from `{ id: null, name: nonSelectionLabel}` to `null`
                        .map((g) => (g.id === null ? null : g))
                        .filter(isAdminGroup)
                    );
                  }
                }
              }
            }}
          />
          <div data-testid="GroupSelectSelection">
            {hidePublicGroupSelection !== true && (
              <Checkbox
                isDisabled={disabled || !groups.length}
                isSelected={selectedGroups.length === 0}
                aria-label={publicGroupSelectionLabel}
                className={styles.publicGroupSelectionLabel}
                onChange={(isSelected) => {
                  onSelectGroups(
                    isSelected
                      ? []
                      : groups.map((g) => (g.id === null ? null : g))
                  );
                }}
              >
                <i>{publicGroupSelectionLabel}</i>
              </Checkbox>
            )}
            {[...selectedGroups]
              .sort(groupSorter)
              .map((group: UserGroupModel | null, i: number) => {
                return (
                  <Tag
                    key={i}
                    className={clsx(styles.tag, {
                      [styles.row]: row,
                      'is-admin-group': isAdminGroup(group),
                    })}
                    onDelete={
                      disabled
                        ? undefined
                        : () => {
                            onSelectGroups(
                              selectedGroups.filter((selectedGroup) =>
                                group
                                  ? selectedGroup?.id !== group.id
                                  : selectedGroup !== null
                              )
                            );
                          }
                    }
                  >
                    {group?.name ?? nonSelectionLabel}
                  </Tag>
                );
              })}
          </div>
        </div>
      </NoSsr>
    );
  }
);
GroupSelect.displayName = 'GroupSelect';
