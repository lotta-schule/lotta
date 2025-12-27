import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { Button, ErrorMessage, Input } from '@lotta-schule/hubert';
import {
  NewMessageDestination,
  MessageModel,
  ConversationModel,
  ID,
  FileModel,
} from 'model';
import { SelectFileButton } from 'shared/edit/SelectFileButton';
import { Icon } from 'shared/Icon';
import pick from 'lodash/pick';
import uniqBy from 'lodash/uniqBy';

import SendMessageMutation from 'api/mutation/SendMessageMutation.graphql';
import GetConversationsQuery from 'api/query/GetConversationsQuery.graphql';
import GetConversationQuery from 'api/query/GetConversationQuery.graphql';

import styles from './ComposeMessage.module.scss';

export interface ComposeMessageProps {
  destination: NewMessageDestination;
  onSent?: (message: MessageModel) => void;
}

export const ComposeMessage = React.memo(
  ({ destination, onSent }: ComposeMessageProps) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [shouldSetAutofocus, setShouldSetAutofocus] = React.useState(true);
    const [content, setContent] = React.useState('');

    const [createMessage, { loading: isLoading, error }] = useMutation<{
      message: Partial<MessageModel>;
    }>(SendMessageMutation, {
      errorPolicy: 'all',
      variables: {
        message: {
          content,
          recipientUser: destination.user && pick(destination.user, 'id'),
          recipientGroup: destination.group && pick(destination.group, 'id'),
        },
      },
      update: (cache, { data }) => {
        if (data && data.message) {
          const readConversationResult = cache.readQuery<
            { conversation: ConversationModel },
            { id: ID }
          >({
            query: GetConversationQuery,
            variables: { id: data.message.conversation!.id },
          });
          const conversation = {
            ...data.message.conversation,
            ...readConversationResult?.conversation,
            unreadMessages: 0,
            messages: uniqBy(
              [
                data.message,
                ...(readConversationResult?.conversation.messages ?? []),
              ],
              'id'
            ),
          };
          cache.writeQuery({
            query: GetConversationQuery,
            variables: { id: conversation.id },
            data: { conversation },
          });
          const readConversationsResult = cache.readQuery<{
            conversations: ConversationModel[];
          }>({ query: GetConversationsQuery });
          cache.writeQuery({
            query: GetConversationsQuery,
            data: {
              conversations: [
                {
                  ...conversation,
                  messages: conversation.messages.map((c) =>
                    pick(c, ['id', '__typename'])
                  ),
                },
                ...(readConversationsResult?.conversations?.filter(
                  (c) => c.id !== conversation.id
                ) ?? []),
              ].filter(Boolean),
            },
            broadcast: true,
          });
        }
      },
      onCompleted: ({ message }) => {
        if (!message.files?.length) {
          setContent('');
        }
        setTimeout(() => {
          inputRef.current?.focus();
        }, 500);
        onSent?.(message as MessageModel);
      },
    });

    React.useEffect(() => {
      if (shouldSetAutofocus) {
        inputRef.current?.focus();
        setShouldSetAutofocus(false);
      }
    }, [shouldSetAutofocus]);

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
              createMessage({
                variables: {
                  message: {
                    content: '',
                    files: files.map((file) => ({
                      id: file.id,
                    })),

                    recipientUser:
                      destination.user && pick(destination.user, 'id'),
                    recipientGroup:
                      destination.group && pick(destination.group, 'id'),
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
