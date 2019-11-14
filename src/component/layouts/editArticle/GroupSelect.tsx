import React, { memo } from 'react';
import { Checkbox, FormControl, FormGroup, FormControlLabel, FormLabel } from '@material-ui/core';
import { useUserGroups } from 'util/client/useUserGroups';
import { UserGroupModel } from 'model/UserGroupModel';

export interface GroupSelectProps {
    selectedGroups: UserGroupModel[];
    className?: string;
    variant?: 'filled' | 'outlined' | 'standard';
    onSelectGroups(groups: UserGroupModel[]): void;
}

export const GroupSelect = memo<GroupSelectProps>(({ selectedGroups, onSelectGroups, variant, className }) => {
    const groups = useUserGroups();

    return (
        <FormControl component={'fieldset'} variant={variant} fullWidth className={className}>
            <FormLabel htmlFor="outlined-visibility-select">
                Sichtbarkeit:
            </FormLabel>
            <FormGroup>
                <span></span>
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