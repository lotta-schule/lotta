import * as React from 'react';
import { makeStyles, NoSsr } from '@material-ui/core';
import { Transition, animated } from 'react-spring';
import { flatten, uniq } from 'lodash';
import { Input } from 'component/general/form/input/Input';
import { Label } from 'component/general/label/Label';
import { Tag } from 'component/general/tag/Tag';

export interface EnrollmentTokensEditorProps {
    disabled?: boolean;
    tokens: string[];
    setTokens(tokens: string[]): void;
}

const useStyles = makeStyles((theme) => ({
    tag: {
        width: '100%',
        overflow: 'hidden',
        justifyContent: 'space-between',
        borderRadius: theme.shape.borderRadius,
        marginBottom: theme.spacing(1),
    },
}));

export const EnrollmentTokensEditor = React.memo<EnrollmentTokensEditorProps>(
    ({ disabled, tokens, setTokens }) => {
        const styles = useStyles();
        const [inputValue, setInputValue] = React.useState('');

        React.useEffect(() => {
            if (tokens.length && tokens[tokens.length - 1] === inputValue) {
                setInputValue('');
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [tokens]);

        return (
            <NoSsr>
                <div data-testid="UserEnrollmentTokensInput">
                    <ul>
                        <Transition
                            items={tokens}
                            config={{
                                tension: 2000,
                                friction: 100,
                                precision: 1,
                            }}
                            from={{ height: 0 as any }}
                            enter={{ height: 'auto' }}
                            leave={{ height: 0 }}
                        >
                            {(props: any, token) => (
                                <animated.div>
                                    <Tag
                                        key={token}
                                        className={styles.tag}
                                        style={props}
                                        role={'listitem'}
                                        onDelete={() => {
                                            setTokens(
                                                tokens.filter(
                                                    (t) => t !== token
                                                )
                                            );
                                        }}
                                    >
                                        {token}
                                    </Tag>
                                </animated.div>
                            )}
                        </Transition>
                    </ul>
                    <div>
                        <Label label={'Neue Einschreibeschlüssel eintragen'}>
                            <Input
                                id={'enter-new-enrollment-token'}
                                disabled={disabled}
                                placeholder={
                                    'Neue Einschreibeschlüssel hier eintragen. Mehrere Schlüssel durch Komma trennen.'
                                }
                                value={inputValue}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        e.preventDefault();
                                        setInputValue('');
                                    }
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const value = (e.target as HTMLInputElement)
                                            .value;
                                        if (value) {
                                            setTokens(uniq([...tokens, value]));
                                        }
                                        setInputValue('');
                                    }
                                }}
                                onBlurCapture={(e) => {
                                    const value = (e.target as HTMLInputElement)
                                        .value;
                                    if (value) {
                                        setTokens(uniq([...tokens, value]));
                                    }
                                    setInputValue('');
                                }}
                                onChange={(
                                    ev: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    const { value } = ev.currentTarget;
                                    if (
                                        value.includes(',') ||
                                        value.includes(' ')
                                    ) {
                                        const newTokens = flatten(
                                            value
                                                .split(',')
                                                .map((v) => v.split(' '))
                                        );
                                        const [val] = newTokens.splice(-1);
                                        setTokens(
                                            uniq([...tokens, ...newTokens])
                                        );
                                        setInputValue(val);
                                    } else {
                                        setInputValue(ev.currentTarget.value);
                                    }
                                }}
                            />
                        </Label>
                    </div>
                </div>
            </NoSsr>
        );
    }
);
