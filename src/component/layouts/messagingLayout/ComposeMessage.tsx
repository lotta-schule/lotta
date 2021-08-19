import * as React from 'react';
import { Button } from 'component/general/button/Button';
import { ChatType, MessageModel, ThreadRepresentation } from 'model';
import { makeStyles, TextField, Toolbar } from '@material-ui/core';
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
        flexShrink: 0,
    },
    form: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline',
        width: '100%',
    },
    textField: {
        flexGrow: 1,
    },
    button: {
        flexGrow: 0,
        flexShrink: 0,
    },
}));

export const ComposeMessage = React.memo<ComposeMessageProps>(
    ({ threadRepresentation }) => {
        const styles = useStyles();

        const inputRef = React.useRef<HTMLInputElement>(null);
        const [content, setContent] = React.useState('');

        React.useEffect(() => {
            setContent('');
            inputRef.current?.focus();
        }, [threadRepresentation]);

        React.useEffect(() => {
            if (content === '') {
                inputRef.current?.focus();
            }
        }, [content]);

        const [createMessage, { loading: isLoading, error }] = useMutation<{
            message: Partial<MessageModel>;
        }>(SendMessageMutation, {
            errorPolicy: 'all',
            variables: {
                message: {
                    content,
                    recipientUser:
                        threadRepresentation.messageType ===
                        ChatType.DirectMessage
                            ? { id: threadRepresentation.counterpart.id }
                            : undefined,
                    recipientGroup:
                        threadRepresentation.messageType === ChatType.GroupChat
                            ? { id: threadRepresentation.counterpart.id }
                            : undefined,
                },
            },
            update: (cache, { data }) => {
                if (data && data.message) {
                    const readMessagesResult = cache.readQuery<{
                        messages: MessageModel[];
                    }>({ query: GetMessagesQuery });
                    cache.writeQuery({
                        query: GetMessagesQuery,
                        data: {
                            messages: [
                                ...(readMessagesResult?.messages.filter(
                                    (msg) => msg.id !== data.message.id
                                ) ?? []),
                                data.message,
                            ],
                        },
                    });
                }
            },
            onCompleted: () => {
                setContent('');
            },
        });

        const onSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            createMessage();
        };
        const onKeypress = (e: React.KeyboardEvent) => {
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
                        onChange={(e) => setContent(e.target.value)}
                        onKeyPress={onKeypress}
                    />
                    <Button
                        className={styles.button}
                        type={'submit'}
                        disabled={isLoading}
                        icon={<Send />}
                    />
                </form>
            </Toolbar>
        );
    }
);
