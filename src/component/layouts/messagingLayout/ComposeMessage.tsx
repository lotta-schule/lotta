import React, { FormEvent, KeyboardEvent, memo, useEffect, useRef, useState } from 'react';
import { ChatType, MessageModel, ThreadRepresentation } from 'model';
import { Button, makeStyles, TextField, Toolbar } from '@material-ui/core';
import { Send } from '@material-ui/icons';
import { useMutation } from '@apollo/client';
import { SendMessageMutation } from 'api/mutation/SendMessageMutation';
import { GetMessagesQuery } from 'api/query/GetMessagesQuery';

export interface ComposeMessageProps {
    threadRepresentation: ThreadRepresentation;
}

const useStyles = makeStyles(() => ({
    root: {
        flexGrow: 0,
        flexShrink: 0
    },
    form: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline',
        width: '100%',
    },
    textField: {
        flexGrow: 1
    },
    button: {
        flexGrow: 0,
        flexShrink: 0
    }
}));

export const ComposeMessage = memo<ComposeMessageProps>(({ threadRepresentation }) => {
    const styles = useStyles();

    const inputRef = useRef<HTMLInputElement>(null);
    const [content, setContent] = useState('');

    useEffect(() => {
        setContent('');
        inputRef.current?.focus();
    }, [threadRepresentation]);

    useEffect(() => {
        if (content === '') {
            inputRef.current?.focus();
        }
    }, [content]);

    const [createMessage, { loading: isLoading, error }] = useMutation<{ message: Partial<MessageModel> }>(SendMessageMutation, {
        errorPolicy: 'all',
        variables: {
            message: {
                content,
                recipientUser: threadRepresentation.messageType === ChatType.DirectMessage ?
                    { id: threadRepresentation.counterpart.id } : undefined,
                recipientGroup: threadRepresentation.messageType === ChatType.GroupChat ?
                    { id: threadRepresentation.counterpart.id } : undefined
            }
        },
        update: (cache, { data }) => {
            if (data && data.message) {
                const readMessagesResult = cache.readQuery<{ messages: MessageModel[] }>({ query: GetMessagesQuery });
                cache.writeQuery({
                    query: GetMessagesQuery,
                    data: {
                        messages: [
                            ...readMessagesResult!.messages,
                            data.message
                        ]
                    }
                });
            }
        },
        onCompleted: () => {
            setContent('');
        }
    });

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        createMessage();
    };
    const onKeypress = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            createMessage();
        }
    };
    return (
        <Toolbar className={styles.root}>
            <form className={styles.form} onSubmit={onSubmit}>
                <TextField
                    multiline
                    inputRef={inputRef}
                    className={styles.textField}
                    label={'Nachricht schreiben'}
                    error={!!error}
                    disabled={isLoading}
                    helperText={error?.message}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    onKeyPress={onKeypress}
                />
                <Button size={'small'} className={styles.button} type={'submit'} disabled={isLoading}><Send /></Button>
            </form>
        </Toolbar>
    );
});
