import React, { memo } from 'react';
import { Checkbox, FormControl, FormGroup, FormControlLabel, FormLabel } from '@material-ui/core';
import { useUserGroups } from 'util/client/useUserGroups';
import { UserGroupModel } from 'model/UserGroupModel';

export interface GroupSelectProps {
    className?: string;
    variant?: 'filled' | 'outlined' | 'standard';
    hidePublicGroupSelection?: boolean;
    publicGroupSelectionLabel?: string;
    disableAdminGroupsExclusivity?: boolean;
    selectedGroups: UserGroupModel[];
    onSelectGroups(groups: UserGroupModel[]): void;
}

export const GroupSelect = memo<GroupSelectProps>(({ variant, className, hidePublicGroupSelection, publicGroupSelectionLabel, disableAdminGroupsExclusivity, selectedGroups, onSelectGroups }) => {
    const groups = useUserGroups();

    return (
        <FormControl component={'fieldset'} variant={variant} fullWidth className={className}>
            <FormLabel htmlFor="outlined-visibility-select">
                Sichtbarkeit:
            </FormLabel>
            <FormGroup>
                {hidePublicGroupSelection !== true && (
                    <FormControlLabel
                        label={<i>{publicGroupSelectionLabel || 'öffentlich sichtbar'}</i>}
                        control={(
                            <Checkbox checked={selectedGroups.length === 0} onChange={event => {
                                if (event.target.checked) {
                                    onSelectGroups([]);
                                } else {
                                    onSelectGroups([...groups]);
                                }
                            }} />
                        )}
                    />
                )}
                {groups.filter(g => g.isAdminGroup).map(group => (
                    <FormControlLabel
                        key={group.id}
                        label={<i>{group.name}</i>}
                        control={(
                            <Checkbox checked={selectedGroups.filter(g => g.id === group.id).length > 0} onChange={event => {
                                if (event.target.checked) {
                                    onSelectGroups(
                                        disableAdminGroupsExclusivity ?
                                            [...selectedGroups, group] :
                                            [...groups.filter(g => g.isAdminGroup)]
                                    );
                                } else {
                                    onSelectGroups(
                                        disableAdminGroupsExclusivity ?
                                            selectedGroups.filter(g => g.id !== group.id) :
                                            []
                                    );
                                }
                            }} />
                        )}
                    />
                ))}
                {groups.filter(g => !g.isAdminGroup).map(group => (
                    <FormControlLabel
                        key={group.id}
                        label={group.name}
                        control={(
                            <Checkbox value={group.id} checked={selectedGroups.filter(g => g.id === group.id).length > 0} onChange={event => {
                                if (event.target.checked) {
                                    onSelectGroups([...selectedGroups, group]);
                                } else {
                                    onSelectGroups(selectedGroups.filter(g => g.id !== group.id));
                                }
                            }} />
                        )}
                    />
                ))}
            </FormGroup>
        </FormControl>
    );
});