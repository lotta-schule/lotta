import * as React from 'react';
import { Checkbox, ComboBox, NoSsr, Tag } from '@lotta-schule/hubert';
import { UserGroupModel } from 'model';
import { useUserGroups } from 'util/tenant/useUserGroups';
import clsx from 'clsx';

import styles from './GroupSelect.module.scss';

export interface GroupSelectProps {
  className?: string;
  variant?: 'filled' | 'outlined' | 'standard';
  hidePublicGroupSelection?: boolean;
  publicGroupSelectionLabel?: string;
  disableAdminGroupsExclusivity?: boolean;
  selectedGroups: UserGroupModel[];
  label?: string | null;
  row?: boolean;
  disabled?: boolean;
  filterSelection?(
    group: UserGroupModel,
    i: number,
    allGroups: UserGroupModel[]
  ): boolean;
  onSelectGroups(groups: UserGroupModel[]): void;
}

export const GroupSelect = React.memo(
  ({
    className,
    label,
    disabled,
    row,
    hidePublicGroupSelection,
    publicGroupSelectionLabel,
    disableAdminGroupsExclusivity,
    selectedGroups,
    filterSelection,
    onSelectGroups,
  }: GroupSelectProps) => {
    const availableGroups = useUserGroups();

    const groupSorter = React.useCallback(
      (group1: UserGroupModel, group2: UserGroupModel) => {
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

    const groups = availableGroups
      .filter(filterSelection ?? (() => true))
      .sort(groupSorter);

    return (
      <NoSsr>
        <div className={clsx(styles.root, className)} data-testid="GroupSelect">
          <ComboBox
            fullWidth
            disabled={disabled || !groups.length}
            title={label ?? 'Gruppe suchen'}
            items={groups.map((group) => ({
              label: group.name,
              key: group.id,
            }))}
            onSelect={(groupId) => {
              const group = availableGroups.find((g) => g.id === groupId);
              if (group) {
                const isGroupAlreadySelected = selectedGroups.find(
                  (selectedGroup) => selectedGroup.id === group.id
                );
                if (disableAdminGroupsExclusivity || !isAdminGroup(group)) {
                  if (!isGroupAlreadySelected) {
                    onSelectGroups(
                      [...selectedGroups, group].sort(groupSorter)
                    );
                  } else {
                    onSelectGroups(
                      selectedGroups.filter(
                        (selectedGroup) => selectedGroup.id !== group.id
                      )
                    );
                  }
                } else {
                  if (isGroupAlreadySelected) {
                    onSelectGroups([]);
                  } else {
                    onSelectGroups(groups.filter(isAdminGroup));
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
                aria-label={publicGroupSelectionLabel ?? 'für alle sichtbar'}
                className={styles.publicGroupSelectionLabel}
                onChange={(isSelected) => {
                  onSelectGroups(isSelected ? [] : [...groups]);
                }}
              >
                <i>{publicGroupSelectionLabel ?? 'für alle sichtbar'}</i>
              </Checkbox>
            )}
            {[...selectedGroups]
              .sort(groupSorter)
              .map((group: UserGroupModel, i: number) => (
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
                            selectedGroups.filter(
                              (selectedGroup) => selectedGroup.id !== group.id
                            )
                          );
                        }
                  }
                >
                  {group.name}
                </Tag>
              ))}
          </div>
        </div>
      </NoSsr>
    );
  }
);
GroupSelect.displayName = 'GroupSelect';
