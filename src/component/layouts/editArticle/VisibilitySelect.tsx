import React, { FunctionComponent, memo } from 'react';
import { Select, MenuItem, FormControl, InputLabel, OutlinedInput } from '@material-ui/core';

export interface VisibilitySelectProps {
    selectedVisibility?: string;
    onSelectVisibility(visibility?: null): void;
}

export const VisibilitySelect: FunctionComponent<VisibilitySelectProps> = memo(({ selectedVisibility, onSelectVisibility }) => {

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
                value={selectedVisibility}
                onChange={e => onSelectVisibility(null)}
                input={<OutlinedInput labelWidth={labelWidth} name="visibility" id="outlined-visibility-select" />}
            >
                <MenuItem key={'undefined'} value={undefined}>Für alle sichtbar</MenuItem>
            </Select>
        </FormControl>
    );
});