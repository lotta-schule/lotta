'use client';

import * as React from 'react';
import { Input, Label, NoSsr, Tag } from '@lotta-schule/hubert';
import { AnimatePresence, motion } from 'framer-motion';

import styles from './EnrollmentTokensEditor.module.scss';

export interface EnrollmentTokensEditorProps {
  disabled?: boolean;
  tokens: string[];
  setTokens(tokens: string[]): void;
}

const AnimatedTag = motion.create(Tag);

export const EnrollmentTokensEditor = React.memo<EnrollmentTokensEditorProps>(
  ({ disabled, tokens, setTokens }) => {
    const inputValue = tokens.at(-1) || '';

    const resetInput = React.useCallback(() => {
      if (inputValue) {
        setTokens(tokens.slice(0, -1));
      }
    }, [inputValue, setTokens, tokens]);

    const setInputValue = React.useCallback(
      (value: string) => {
        if (tokens.at(-1) === inputValue) {
          setTokens([
            ...tokens.slice(0, -1),
            ...value.split(',').flatMap((v) => v.split(' ')),
          ]);
        }
      },
      [inputValue, setTokens, tokens]
    );

    const confirmInput = React.useCallback(() => {
      if (inputValue) {
        const newTokenValues = Array.from(
          new Set([...tokens.slice(0, -1), inputValue])
        );
        newTokenValues.push('');
        setTokens(newTokenValues);
      }
    }, [inputValue, setTokens, tokens]);

    return (
      <NoSsr>
        <div data-testid="UserEnrollmentTokensInput">
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
                    resetInput();
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    confirmInput();
                  }
                }}
                onBlur={() => {
                  confirmInput();
                }}
                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                  const { value } = ev.currentTarget;
                  setInputValue(value);
                }}
              />
            </Label>
          </div>
          <ul>
            <AnimatePresence>
              {tokens
                .filter((t) => t)
                .map((token, i) => (
                  <AnimatedTag
                    key={i}
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
                      setTokens(tokens.filter((t) => t !== token));
                    }}
                  >
                    {token}
                  </AnimatedTag>
                ))}
            </AnimatePresence>
          </ul>
        </div>
      </NoSsr>
    );
  }
);
EnrollmentTokensEditor.displayName = 'EnrollmentTokensEditor';
