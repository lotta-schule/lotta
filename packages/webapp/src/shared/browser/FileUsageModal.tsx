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
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { FileModel, ID, FileModelUsageLocation } from 'model';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article, Category, File, User } from 'util/model';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { useServerData } from 'shared/ServerDataContext';

import GetFileDetailsQuery from 'api/query/GetFileDetailsQuery.graphql';

import styles from './FileUsageModal.module.scss';
import { useTenant } from 'util/tenant/useTenant';

export type FileUsageModalProps = {
  file: FileModel;
  isOpen: boolean;
  onRequestClose: () => void;
};

export const FileUsageModal = React.memo(
  ({ file, isOpen, onRequestClose }: FileUsageModalProps) => {
    const { baseUrl } = useServerData();
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
                  <>
                    {usage.article?.previewImageFile && (
                      <ResponsiveImage
                        resize={'contain'}
                        width={100}
                        aspectRatio={'3:2'}
                        src={File.getFileRemoteLocation(
                          baseUrl,
                          usage.article.previewImageFile
                        )}
                        alt={`Vorschaubild zu ${usage.article.title}`}
                      />
                    )}
                    {usage.tenant?.configuration.logoImageFile && (
                      <ResponsiveImage
                        resize={'inside'}
                        height={75}
                        src={File.getFileRemoteLocation(
                          baseUrl,
                          usage.tenant.configuration.logoImageFile
                        )}
                        alt={`Logo von ${usage.tenant.title}`}
                      />
                    )}
                    {usage.user && <UserAvatar user={usage.user} size={50} />}
                  </>
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
                  {t(`files.usage.${usage.usage}`)}
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
