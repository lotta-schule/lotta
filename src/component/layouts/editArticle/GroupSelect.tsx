import React, { memo } from 'react';
import { Select, MenuItem, FormControl, InputLabel, OutlinedInput } from '@material-ui/core';
import { useUserGroups } from 'util/client/useUserGroups';
import { ID } from 'model/ID';

export interface GroupSelectProps {
    selectedGroupId?: ID;
    className?: string;
    variant?: 'filled' | 'outlined' | 'standard';
    onSelectGroupId(groupId?: ID): void;
}

export const GroupSelect = memo<GroupSelectProps>(({ selectedGroupId, onSelectGroupId, variant, className }) => {
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
                value={selectedGroupId}
                onChange={({ target: { value } }) => onSelectGroupId(value as ID | undefined)}
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