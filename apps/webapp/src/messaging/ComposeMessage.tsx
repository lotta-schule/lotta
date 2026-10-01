import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { Button, ErrorMessage, Input } from '@lotta-schule/hubert';
import { FragmentOf } from '#/api/graphql';
import { FileModel } from '#/model';
import { NewMessageDestination } from './Message';
import { SelectFileButton } from '#/shared/edit/SelectFileButton';
import { Icon } from '#/shared/Icon';

import { SEND_MESSAGE_MUTATION } from './_graphql/SendMessageMutation';
import { GET_CONVERSATIONS_QUERY } from './_graphql/GetConversationsQuery';
import { GET_CONVERSATION_QUERY } from './_graphql/GetConversationQuery';
import {
  CONVERSATION_FRAGMENT,
  LIVE_MESSAGES_FILTER,
  MESSAGE_FRAGMENT,
} from './_graphql/fragments';

import styles from './ComposeMessage.module.scss';

export interface ComposeMessageProps {
  destination: NewMessageDestination;
  onSent?: (
    message: FragmentOf<typeof MESSAGE_FRAGMENT> & {
      conversation: FragmentOf<typeof CONVERSATION_FRAGMENT>;
    }
  ) => void;
}

export const ComposeMessage = React.memo(
  ({ destination, onSent }: ComposeMessageProps) => {
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    const [shouldSetAutofocus, setShouldSetAutofocus] = React.useState(true);
    const [content, setContent] = React.useState('');

    const [createMessage, { loading: isLoading, error }] = useMutation(
      SEND_MESSAGE_MUTATION,
      {
        errorPolicy: 'all',
        variables: {
          message: {
            content,
            recipientUser:
              destination.user?.id !== undefined
                ? { id: destination.user.id }
                : undefined,
            recipientGroup:
              destination.group?.id !== undefined
                ? { id: destination.group.id }
                : undefined,
          },
        },
        update: (cache, { data }) => {
          if (data && data.message) {
            const conversationId = data.message.conversation.id!;
            const readConversationResult = cache.readQuery({
              query: GET_CONVERSATION_QUERY,
              variables: {
                id: conversationId,
                filter: LIVE_MESSAGES_FILTER,
              },
            });
            const conversation = {
              ...data.message.conversation,
              ...readConversationResult?.conversation,
              id: conversationId,
              unreadMessages: 0,
              messages: [
                ...new Map(
                  [
                    data.message,
                    ...(readConversationResult?.conversation?.messages ?? []),
                  ].map((message) => [message.id, message])
                ).values(),
              ],
            };
            cache.writeQuery({
              query: GET_CONVERSATION_QUERY,
              variables: { id: conversationId, filter: LIVE_MESSAGES_FILTER },
              data: { conversation },
            });
            const readConversationsResult = cache.readQuery({
              query: GET_CONVERSATIONS_QUERY,
            });
            cache.writeQuery({
              query: GET_CONVERSATIONS_QUERY,
              data: {
                conversations: [
                  conversation,
                  ...(readConversationsResult?.conversations?.filter(
                    (c) => c?.id !== conversationId
                  ) ?? []),
                ].filter(Boolean),
              },
              broadcast: true,
            });
          }
        },
        onCompleted: ({ message }) => {
          if (!message) {
            return;
          }
          if (!message.files?.length) {
            setContent('');
          }
          setTimeout(() => {
            inputRef.current?.focus();
          }, 500);
          onSent?.(message);
        },
      }
    );

    React.useEffect(() => {
      if (shouldSetAutofocus) {
        inputRef.current?.focus();
        setShouldSetAutofocus(false);
      }
    }, [shouldSetAutofocus]);

    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      void createMessage();
    };
    const onKeypress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void createMessage();
      }
    };
    return (
      <div className={styles.root}>
        <form className={styles.form} onSubmit={onSubmit}>
          <SelectFileButton
            multiple
            buttonComponentProps={{
              icon: <Icon icon={faPaperclip} size="lg" />,
              className: styles.button,
              disabled: isLoading,
              ['aria-label']: 'Datei anhängen.',
            }}
            onSelect={(files: FileModel[]) => {
              void createMessage({
                variables: {
                  message: {
                    content: '',
                    files: files.map((file) => ({
                      id: file.id,
                    })),

                    recipientUser:
                      destination.user?.id !== undefined
                        ? {
                            id: destination.user.id,
                          }
                        : undefined,
                    recipientGroup:
                      destination.group?.id !== undefined
                        ? {
                            id: destination.group.id,
                          }
                        : undefined,
                  },
                },
                onCompleted: () => {
                  setShouldSetAutofocus(true);
                },
              });
            }}
            label={''}
          />
          <div className={styles.textInputWrapper}>
            <Input
              multiline
              ref={inputRef}
              className={styles.textField}
              maxHeight={'30vh'}
              label={'Nachricht schreiben'}
              disabled={isLoading}
              value={content}
              onChange={(e) => setContent(e.currentTarget.value)}
              {
                /* The input has no placeholder because giving
                 * a placeholder would make it be squeezed down on mobile,
                 * which would make the input tall, which would mess up
                 * because of autogrowing input (try it out).
                 * TODO: The solution here is to make the sidebar a
                 * popover / modal instead of pushing the other things
                 * aside (or adding kind of a overflowing wrapper
                 * which would allow the main section
                 * keeping its width. */ ...{}
              }
              placeholder={
                /*`Schreibe eine neue Nachricht an ${Message.getDestinationName(
                                destination
                            )}`*/ undefined
              }
              onKeyPress={onKeypress}
            />
            {!!error && <ErrorMessage error={error} />}
          </div>
          <Button
            className={styles.button}
            type={'submit'}
            disabled={!content || isLoading}
            title={'Nachricht senden'}
            icon={<Icon icon={faPaperPlane} size={'lg'} />}
          />
        </form>
      </div>
    );
  },
  (prevProps, nextProps) => {
    const isSameUser =
      prevProps.destination.user?.id === nextProps.destination.user?.id;
    const isSameGroup =
      prevProps.destination.group?.id === nextProps.destination.group?.id;
    const isSameFn = prevProps.onSent === nextProps.onSent;

    return isSameUser && isSameGroup && isSameFn;
  }
);
ComposeMessage.displayName = 'MessageCompose';
