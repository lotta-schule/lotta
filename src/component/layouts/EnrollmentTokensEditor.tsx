import React, { FocusEvent, memo } from 'react';
import { Chip, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

export interface EnrollmentTokensEditorProps {
    disabled?: boolean;
    tokens: string[];
    setTokens(tokens: string[]): void;
}

export const EnrollmentTokensEditor = memo<EnrollmentTokensEditorProps>(({ disabled, tokens, setTokens }) => {
    return (
        <Autocomplete
            multiple
            disabled={disabled}
            id="tags-filled"
            options={[]}
            value={tokens}
            onChange={(_, value) => setTokens(value)}
            freeSolo
            onBlur={(ev: FocusEvent<HTMLInputElement>) => {
                // automatically add current value on blur
                if (ev.target.value) {
                    setTokens([...tokens, ev.target.value]);
                }
            }}
            renderTags={(value: string[], getTagProps) =>
                value.map((option: string, index: number) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
            }
            renderInput={params => (
                <TextField
                    {...params}
                    variant="filled"
                    label="Einschreibeschlüssel"
                    placeholder="Einschreibeschlüssel"
                    margin="normal"
                    fullWidth
                />
            )}
        />
    );
});