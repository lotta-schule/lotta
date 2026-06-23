import * as React from 'react';
import { Button, FileSize } from '@lotta-schule/hubert';
import { UserAvatar } from '#/shared/userAvatar/UserAvatar';
import { format } from 'date-fns';
import { faCloudArrowDown, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useMutation } from '@apollo/client/react';
import { FragmentOf } from '#/api/graphql';
import { File, User } from '#/util/model';
import { ResponsiveImage } from '#/util/image/ResponsiveImage';
import { Icon } from '#/shared/Icon';
import { de } from 'date-fns/locale';
import clsx from 'clsx';

import { MESSAGE_FRAGMENT } from './_graphql/fragments';
import { DELETE_MESSAGE_MUTATION } from './_graphql/DeleteMessageMutation';

import styles from './MessageBubble.module.scss';

type MessageFragment = FragmentOf<typeof MESSAGE_FRAGMENT>;

export interface MessageBubbleProps {
  active?: boolean;
  message: MessageFragment;
}

export const MessageBubble = React.memo(
  ({ active, message }: MessageBubbleProps) => {
    const [deleteMessage] = useMutation(DELETE_MESSAGE_MUTATION, {
      variables: { id: message.id },
      update: (client, { data }) => {
        if (data?.message) {
          const normalizedId = client.identify(data.message as any);

          if (normalizedId) {
            client.evict({ id: normalizedId });
          }
        }
      },
      // Only id + __typename are needed to evict; cast since it's not a full message.
      optimisticResponse: ({ id }) => ({
        message: {
          __typename: 'Message' as const,
          id,
        },
      }),
    });

    const hasPreviewImage = (
      file: NonNullable<MessageFragment['files']>[number]
    ) => {
      if (file.fileType === 'IMAGE') {
        return true;
      }
      return false;
    };

    const sender = message.user;
    const files = message.files ?? [];

    return (
      <div className={clsx(styles.root, { [styles.isActive]: !!active })}>
        <div className={styles.user}>
          {sender && (
            <UserAvatar
              user={sender}
              className={styles.senderUserAvatar}
              size={40}
            />
          )}
        </div>
        <div className={styles.messageWrapper}>
          <div className={styles.message}>
            {!!files.length && (
              <div className={styles.files} data-testid="message-attachments">
                {files.map((file) => (
                  <div className={styles.file} key={file.id}>
                    {hasPreviewImage(file) && (
                      <div className={styles.previewWrapper}>
                        <ResponsiveImage
                          lazy
                          sizes="auto"
                          alt={'Bildvorschau'}
                          width={400}
                          format={'preview'}
                          file={file}
                        />
                      </div>
                    )}
                    <span className={styles.filename}>{file.filename}</span>
                    <div className={styles.downloadButton}>
                      <Button
                        href={File.getRemoteUrl(file, 'original')}
                        download
                        small
                        target={'_blank'}
                        icon={
                          <Icon
                            icon={faCloudArrowDown}
                            className={styles.downloadIcon}
                            size={'lg'}
                          />
                        }
                        role={'link'}
                        title={`${file.filename} herunterladen`}
                      >
                        download
                      </Button>
                    </div>
                    <div className={styles.filesize}>
                      {new FileSize(file.filesize ?? 0).humanize()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {message.content && (
              <div className={styles.content}>{message.content}</div>
            )}
          </div>
          <div className={styles.messageInformation}>
            {active && (
              <Button
                small
                icon={<Icon icon={faTrash} />}
                title={'Nachricht löschen'}
                onClick={() => deleteMessage({ variables: { id: message.id } })}
              />
            )}
            <span>
              {!active && sender && <i>{User.getName(sender)}, </i>}
              {format(new Date(message.insertedAt), 'Pp', {
                locale: de,
              })}
            </span>
          </div>
        </div>
      </div>
    );
  }
);
MessageBubble.displayName = 'MessageBubble';
