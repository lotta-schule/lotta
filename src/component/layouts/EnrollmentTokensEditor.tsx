import React, { ChangeEvent, FocusEvent, memo, useEffect, useState } from 'react';
import { Chip, makeStyles, NoSsr, TextField, Typography } from '@material-ui/core';
import { useAutocomplete } from '@material-ui/lab';
import { flatten, uniq } from 'lodash';

export interface EnrollmentTokensEditorProps {
    disabled?: boolean;
    tokens: string[];
    setTokens(tokens: string[]): void;
}

const useStyles = makeStyles(theme => ({
    tag: {
        width: '100%',
        justifyContent: 'space-between',
        borderRadius: theme.shape.borderRadius,
        marginBottom: theme.spacing(1)
    }
}));

export const EnrollmentTokensEditor = memo<EnrollmentTokensEditorProps>(({ disabled, tokens, setTokens }) => {
    const styles = useStyles();
    const [inputValue, setInputValue] = useState('');
    const {
        getRootProps,
        getInputLabelProps,
        getInputProps,
        setAnchorEl,
        getTagProps,
    } = useAutocomplete({
        id: 'user-enrollment-tokens-input',
        value: tokens,
        inputValue,
        multiple: true,
        freeSolo: true,
        options: [],
        onChange: (_event, value, _reason, _details) => {
            setTokens(value as string[]);
        }
    });

    useEffect(() => {
        if (tokens.length && tokens[tokens.length - 1] === inputValue) {
            setInputValue('');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokens]);

    return (
        <NoSsr>
            <div data-testid="UserEnrollmentTokensInput">
                <ul>
                    {tokens.map((option: string, index: number) => (
                        <Chip
                            variant="outlined"
                            label={option}
                            {...getTagProps({ index })}
                            className={styles.tag}
                            role={'listitem'}
                        />
                    ))}
                </ul>
                <div {...getRootProps()}>
                    <Typography component={'label'} htmlFor={'enter-new-enrollment-token'} {...getInputLabelProps()}>
                        Neue Einschreibeschlüssel eintragen
                    </Typography>
                    <div ref={setAnchorEl}>
                        <TextField
                            fullWidth
                            id={'enter-new-enrollment-token'}
                            disabled={disabled}
                            variant={'filled'}
                            size={'small'}
                            placeholder={'Neue Einschreibeschlüssel hier eintragen. Mehrere Schlüssel durch Komma trennen.'}
                            {...getInputProps()}
                            onBlur={(ev: FocusEvent<HTMLInputElement>) => {
                                // automatically add current value on blur
                                if (ev.target.value) {
                                    setTokens([...tokens, ev.target.value]);
                                }
                            }}
                            onChange={(ev: ChangeEvent<HTMLInputElement>) => {
                                const { value } = ev.currentTarget;
                                if (value.includes(',') || value.includes(' ')) {
                                    const newTokens = flatten(value.split(',').map(v => v.split(' ')));
                                    const [val] = newTokens.splice(-1);
                                    setTokens(uniq([...tokens, ...newTokens]));
                                    setInputValue(val);
                                } else {
                                    setInputValue(ev.currentTarget.value);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </NoSsr>
    );
});
