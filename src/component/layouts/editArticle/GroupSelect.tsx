import React, { memo } from 'react';
import { Select, MenuItem, FormControl, InputLabel, OutlinedInput } from '@material-ui/core';
import { useUserGroups } from 'util/client/useUserGroups';
import { UserGroupModel } from 'model/UserGroupModel';

export interface GroupSelectProps {
    selectedGroup: UserGroupModel | null;
    className?: string;
    variant?: 'filled' | 'outlined' | 'standard';
    onSelectGroup(group: UserGroupModel | null): void;
}

export const GroupSelect = memo<GroupSelectProps>(({ selectedGroup, onSelectGroup, variant, className }) => {
    const groups = useUserGroups();
    const inputLabel = React.useRef<HTMLLabelElement>(null);
    const [labelWidth, setLabelWidth] = React.useState(0);
    React.useEffect(() => {
        setLabelWidth(inputLabel.current!.offsetWidth);
    }, []);

    return (
        <FormControl variant={variant} fullWidth className={className}>
            <InputLabel ref={inputLabel} htmlFor="outlined-visibility-select">
                Sichtbarkeit:
            </InputLabel>
            <Select
                fullWidth
                variant={variant}
                value={selectedGroup && selectedGroup.id}
                onChange={({ target: { value } }) => {
                    onSelectGroup(groups.find(group => group.id === value) || null);
                }}
                input={<OutlinedInput labelWidth={labelWidth} name="visibility" id="outlined-visibility-select" />}
            >
                {groups.map(group => (
                    <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
                ))}
                <MenuItem key={'undefined'} value={undefined}>Für alle sichtbar</MenuItem>
            </Select>
        </FormControl>
    );
});