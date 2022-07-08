import * as React from 'react';
import { Input, Label, NoSsr, Tag } from '@lotta-schule/hubert';
import { AnimatePresence, motion } from 'framer-motion';
import { flatten, uniq } from 'lodash';

import styles from './EnrollmentTokensEditor.module.scss';

export interface EnrollmentTokensEditorProps {
    disabled?: boolean;
    tokens: string[];
    setTokens(tokens: string[]): void;
}

const AnimatedTag = motion(Tag);

export const EnrollmentTokensEditor = React.memo<EnrollmentTokensEditorProps>(
    ({ disabled, tokens, setTokens }) => {
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
                        {tokens.map((token, i) => (
                            <AnimatePresence key={token}>
                                <AnimatedTag
                                    key={token}
                                    className={styles.tag}
                                    role={'listitem'}
                                    initial={{
                                        opacity: 0,
                                        height: 0,
                                        y: -50,
                                        borderWidth: 0,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        height: 'auto',
                                        y: 0,
                                        borderWidth: 1,
                                    }}
                                    transition={{ delay: i * 0.1 }}
                                    exit={{
                                        opacity: 0,
                                        borderWidth: 0,
                                    }}
                                    onDelete={() => {
                                        setTokens(
                                            tokens.filter((t) => t !== token)
                                        );
                                    }}
                                >
                                    {token}
                                </AnimatedTag>
                            </AnimatePresence>
                        ))}
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
                                        const value = (
                                            e.target as HTMLInputElement
                                        ).value;
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
EnrollmentTokensEditor.displayName = 'EnrollmentTokensEditor';
