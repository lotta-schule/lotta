import * as React from 'react';
import { NoSsr } from '@material-ui/core';
import { useAutocomplete } from '@material-ui/lab';
import { Check, Close } from '@material-ui/icons';
import { UserGroupModel } from 'model';
import { Button } from 'component/general/button/Button';
import { Checkbox } from 'component/general/form/checkbox';
import { Input } from 'component/general/form/input/Input';
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

export const GroupSelect = React.memo<GroupSelectProps>(
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
    }) => {
        const groups = useUserGroups().filter(filterSelection ?? (() => true));

        const [searchtext, setSearchtext] = React.useState('');

        const {
            getRootProps,
            getInputLabelProps,
            getInputProps,
            getTagProps,
            getListboxProps,
            getOptionProps,
            groupedOptions,
            value,
            focused,
            setAnchorEl,
        } = useAutocomplete({
            id: 'group-select',
            value: [...selectedGroups],
            inputValue: searchtext,
            options: groups,
            multiple: true,
            disableCloseOnSelect: true,
            getOptionLabel: ({ name }) => name,
            getOptionSelected: (option, value) => option.id === value.id,
            onInputChange: (_event, value, reason) => {
                if (reason !== 'reset') {
                    setSearchtext(value);
                }
            },
            onChange: (_event, value, reason, details) => {
                if (
                    disableAdminGroupsExclusivity ||
                    !isAdminGroup(details?.option)
                ) {
                    onSelectGroups(value);
                } else {
                    if (reason === 'select-option') {
                        onSelectGroups(groups.filter(isAdminGroup));
                    } else if (reason === 'remove-option') {
                        onSelectGroups([]);
                    } else {
                        onSelectGroups(value);
                    }
                }
            },
            onClose: (_event, reason) => {
                if (reason === 'blur') {
                    setSearchtext('');
                }
            },
        });

        const groupSorter = (
            group1: UserGroupModel,
            group2: UserGroupModel
        ) => {
            return (group1.sortKey ?? 0) - (group2.sortKey ?? 0);
        };

        const isAdminGroup = (group: UserGroupModel | null | undefined) =>
            Boolean(
                group && groups.find((g) => g.id === group.id)?.isAdminGroup
            );

        return (
            <NoSsr>
                <div
                    className={clsx(styles.root, className)}
                    data-testid="GroupSelect"
                >
                    <div {...getRootProps()} data-testid="GroupSelectSelection">
                        <h4 {...getInputLabelProps()}>
                            {label ?? 'Sichtbarkeit:'}
                        </h4>
                        <div
                            ref={setAnchorEl}
                            className={clsx(styles.inputWrapper)}
                        >
                            {hidePublicGroupSelection !== true && (
                                <Checkbox
                                    disabled={disabled}
                                    checked={selectedGroups.length === 0}
                                    label={
                                        <i>
                                            {publicGroupSelectionLabel ??
                                                'für alle sichtbar'}
                                        </i>
                                    }
                                    className={styles.publicGroupSelectionLabel}
                                    onChange={(e) => {
                                        if (e.currentTarget.checked) {
                                            onSelectGroups([]);
                                        } else {
                                            onSelectGroups([...groups]);
                                        }
                                    }}
                                />
                            )}
                            {value
                                .sort(groupSorter)
                                .map((option: UserGroupModel, i: number) => {
                                    const { className, onDelete, ...props } =
                                        getTagProps({ index: i }) as any;
                                    return (
                                        <div
                                            key={i}
                                            className={clsx(
                                                styles.tag,
                                                className,
                                                {
                                                    [styles.row]: row,
                                                    'is-admin-group':
                                                        isAdminGroup(option),
                                                }
                                            )}
                                            {...props}
                                        >
                                            <span>{option.name}</span>
                                            <Button
                                                small
                                                variant={'error'}
                                                aria-label={`Gruppe "${option.name}" entfernen`}
                                                onClick={onDelete}
                                                disabled={disabled}
                                                icon={<Close />}
                                            />
                                        </div>
                                    );
                                })}

                            <Input
                                disabled={disabled}
                                placeholder={'Gruppe suchen'}
                                aria-label={'Gruppe suchen'}
                                {...getInputProps()}
                            />
                        </div>
                    </div>
                    {groupedOptions.length > 0 ? (
                        <ul
                            className={styles.listBox}
                            data-testid="GroupSelectSelection"
                            {...getListboxProps()}
                        >
                            {groupedOptions.map((option, index) => (
                                <li
                                    key={index}
                                    {...getOptionProps({ option, index })}
                                >
                                    <span>{option.name}</span>
                                    <Check fontSize={'small'} />
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            </NoSsr>
        );
    }
);
