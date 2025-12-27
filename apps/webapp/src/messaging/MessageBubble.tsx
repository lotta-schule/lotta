import * as React from 'react';
import { Button, FileSize } from '@lotta-schule/hubert';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { format } from 'date-fns';
import { faCloudArrowDown, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useMutation } from '@apollo/client/react';
import { FileModel, MessageModel } from 'model';
import { File, User } from 'util/model';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { Icon } from 'shared/Icon';
import { de } from 'date-fns/locale';
import clsx from 'clsx';

import DeleteMessageMutation from 'api/mutation/DeleteMessageMutation.graphql';

import styles from './MessageBubble.module.scss';

export interface MessageBubbleProps {
  active?: boolean;
  message: MessageModel;
}

export const MessageBubble = React.memo(
  ({ active, message }: MessageBubbleProps) => {
    const [deleteMessage] = useMutation(DeleteMessageMutation, {
      variables: { id: message.id },
      update: (client, { data }) => {
        if (data?.message) {
          const normalizedId = client.identify(data.message);

          if (normalizedId) {
            client.evict({ id: normalizedId });
          }
        }
      },
      optimisticResponse: ({ id }) => {
        return {
          message: {
            __typename: 'Message',
            id,
          },
        };
      },
    });

    const hasPreviewImage = (file: FileModel) => {
      if (file.fileType === 'IMAGE') {
        return true;
      }
      return false;
    };

    return (
      <div className={clsx(styles.root, { [styles.isActive]: !!active })}>
        <div className={styles.user}>
          <UserAvatar
            user={message.user}
            className={styles.senderUserAvatar}
            size={40}
          />
        </div>
        <div className={styles.messageWrapper}>
          <div className={styles.message}>
            {!!message.files?.length && (
              <div className={styles.files} data-testid="message-attachments">
                {message.files.map((file) => (
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
                      {new FileSize(file.filesize).humanize()}
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
                onClick={() => deleteMessage()}
              />
            )}
            <span>
              {!active && <i>{User.getName(message.user)}, </i>}
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
