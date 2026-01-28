import * as React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  List,
  ListItem,
  ListItemSecondaryText,
} from '@lotta-schule/hubert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { FileModel, ID, FileModelUsageLocation } from 'model';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article, Category, User } from 'util/model';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { useTenant } from 'util/tenant/useTenant';

import GetFileDetailsQuery from 'api/query/GetFileDetailsQuery.graphql';

import styles from './FileUsageModal.module.scss';

export type FileUsageModalProps = {
  file: FileModel;
  isOpen: boolean;
  onRequestClose: () => void;
};

export const FileUsageModal = React.memo(
  ({ file, isOpen, onRequestClose }: FileUsageModalProps) => {
    const { t } = useTranslation();
    const tenant = useTenant();
    const currentUser = useCurrentUser();

    const { data } = useQuery<{ file: FileModel }, { id: ID }>(
      GetFileDetailsQuery,
      {
        variables: { id: file.id },
        skip: !isOpen,
        fetchPolicy: 'cache-first',
      }
    );

    const hasSecondaryAction = (usage: FileModelUsageLocation) =>
      usage.article || usage.category || usage.user?.id === currentUser?.id;

    const getSecondaryActionCallback =
      (usage: FileModelUsageLocation) => (_e: React.MouseEvent<any>) => {
        if (usage.user) {
          window.open('/profile');
        }
        if (usage.category) {
          window.open(Category.getPath(usage.category));
        }
        if (usage.article) {
          window.open(Article.getPath(usage.article));
        }
      };

    const getPrimaryTextForUsage = (usage: FileModelUsageLocation) => {
      if (usage.article) {
        return `Beitrag: ${usage.article.title}`;
      }
      if (usage.category) {
        return `Kategorie: ${usage.category.title}`;
      }
      if (usage.user) {
        return `Nutzer: ${User.getNickname(usage.user)}`;
      }
      return `SeitenLayout ${tenant.title}`;
    };

    return (
      <Dialog
        className={styles.root}
        open={isOpen}
        onRequestClose={onRequestClose}
        title={`Nutzung der Datei ${file.filename}`}
      >
        <DialogContent>
          <List>
            {data?.file?.usage?.map((usage, i) => (
              <ListItem
                key={i}
                leftSection={
                  <div className={styles.listItemPreviewImage}>
                    {usage.article?.previewImageFile && (
                      <ResponsiveImage
                        format="articlepreview"
                        width={100}
                        file={usage.article.previewImageFile}
                        alt={t('preview image of {{title}}', {
                          title: usage.article.title,
                        })}
                      />
                    )}
                    {usage.tenant?.logoImageFile && (
                      <ResponsiveImage
                        format="preview"
                        width={100}
                        file={usage.tenant.logoImageFile}
                        alt={t('Logo of {{title}}', {
                          title: usage.tenant.title,
                        })}
                      />
                    )}
                    {usage.user && <UserAvatar user={usage.user} size={50} />}
                  </div>
                }
                rightSection={
                  hasSecondaryAction(usage) && (
                    <Button
                      onClick={getSecondaryActionCallback(usage)}
                      icon={<FontAwesomeIcon icon={faUpRightFromSquare} />}
                    />
                  )
                }
              >
                <div className={styles.listItemTextLine}>
                  {getPrimaryTextForUsage(usage)}
                </div>
                <ListItemSecondaryText className={styles.listItemTextLine}>
                  {t('file is used as {{usage}}', {
                    usage: usage.usage && t(usage.usage),
                    // t('preview')
                    // t('banner')
                    // t('file')
                    // t('avatar')
                    // t('logo')
                    // t('background')
                  })}
                </ListItemSecondaryText>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    );
  }
);
FileUsageModal.displayName = 'FileUsageModal';
