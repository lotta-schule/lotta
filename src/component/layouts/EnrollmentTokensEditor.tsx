import React, { ChangeEvent, memo, useEffect, useState } from 'react';
import { Chip, makeStyles, NoSsr, TextField, Typography } from '@material-ui/core';
import { Transition } from 'react-spring/renderprops';
import { animated } from 'react-spring';
import { flatten, uniq } from 'lodash';

export interface EnrollmentTokensEditorProps {
    disabled?: boolean;
    tokens: string[];
    setTokens(tokens: string[]): void;
}

const useStyles = makeStyles(theme => ({
    tag: {
        width: '100%',
        overflow: 'hidden',
        justifyContent: 'space-between',
        borderRadius: theme.shape.borderRadius,
        marginBottom: theme.spacing(1)
    }
}));

export const EnrollmentTokensEditor = memo<EnrollmentTokensEditorProps>(({ disabled, tokens, setTokens }) => {
    const styles = useStyles();
    const [inputValue, setInputValue] = useState('');

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
                    <Transition items={tokens} keys={t => t} config={{ tension: 2000, friction: 100, precision: 1 }} from={{ height: 0 as any }} enter={{ height: 'auto' }} leave={{ height: 0 }}>
                        {token => props => (
                                <Chip
                                    key={token}
                                    variant={'outlined'}
                                    component={animated.div}
                                    label={token}
                                    className={styles.tag}
                                    style={props}
                                    role={'listitem'}
                                    onDelete={() => {
                                        setTokens(tokens.filter(t => t !== token));
                                    }}
                                />
                        )}
                    </Transition>
                </ul>
                <div>
                    <Typography component={'label'} htmlFor={'enter-new-enrollment-token'}>
                        Neue Einschreibeschlüssel eintragen
                    </Typography>
                    <div>
                        <TextField
                            fullWidth
                            id={'enter-new-enrollment-token'}
                            disabled={disabled}
                            variant={'filled'}
                            size={'small'}
                            placeholder={'Neue Einschreibeschlüssel hier eintragen. Mehrere Schlüssel durch Komma trennen.'}
                            value={inputValue}
                            onKeyDown={e => {
                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    setInputValue('');
                                }
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const value = (e.target as HTMLInputElement).value;
                                    if (value) {
                                        setTokens(uniq([...tokens, value]));
                                    }
                                    setInputValue('');
                                }
                            }}
                            onBlurCapture={e => {
                                const value = (e.target as HTMLInputElement).value;
                                if (value) {
                                    setTokens(uniq([...tokens, value]));
                                }
                                setInputValue('');
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
