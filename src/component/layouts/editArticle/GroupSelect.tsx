import React, { memo } from 'react';
import { Select, MenuItem, FormControl, InputLabel, OutlinedInput } from '@material-ui/core';
import { useUserGroups } from 'util/client/useUserGroups';

export interface GroupSelectProps {
    selectedGroupId?: string;
    onSelectGroupId(groupId?: string): void;
}

export const GroupSelect = memo<GroupSelectProps>(({ selectedGroupId, onSelectGroupId }) => {
    const groups = useUserGroups();
    const inputLabel = React.useRef<HTMLLabelElement>(null);
    const [labelWidth, setLabelWidth] = React.useState(0);
    React.useEffect(() => {
        setLabelWidth(inputLabel.current!.offsetWidth);
    }, []);

    return (
        <FormControl variant="outlined" fullWidth>
            <InputLabel ref={inputLabel} htmlFor="outlined-visibility-select">
                Sichtbarkeit:
            </InputLabel>
            <Select
                fullWidth
                variant="outlined"
                value={selectedGroupId}
                onChange={e => onSelectGroupId(undefined)}
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