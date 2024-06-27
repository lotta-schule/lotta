import * as React from 'react';
import { Icon } from 'shared/Icon';
import {
  faTrash,
  faGear,
  faArrowUp,
  faArrowDown,
} from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@lotta-schule/hubert';
import { ArticleModel, ContentModuleModel, ContentModuleType } from 'model';
import { Text } from './text/Text';
import { Title } from './title/Title';
import { Config as TitleConfig } from './title/Config';
import { Config as DownloadConfig } from './download/Config';
import { Image as ImageModule } from './image/Image';
import { Config as ImageConfig } from './image/Config';
import { ImageCollection } from './image_collection/ImageCollection';
import { Config as ImageCollectionConfig } from './image_collection/Config';
import { Video } from './video/Video';
import { Audio } from './audio/Audio';
import { Download } from './download/Download';
import { Form } from './form/Form';
import { Table } from './table/Table';
import { Divider as DividerCM } from './divider/Divider';
import { User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import clsx from 'clsx';

import styles from './ContentModule.module.scss';

export type ContentModuleProps = {
  contentModule: ContentModuleModel;
  article: ArticleModel;
  index: number;
  isEditModeEnabled?: boolean;
  onUpdateModule?: (contentModule: ContentModuleModel) => void;
  onRemoveContentModule?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

export type ContentModuleComponentProps<C = any> = {
  contentModule: ContentModuleModel<C>;
  isEditModeEnabled?: boolean;
  onUpdateModule?: (contentModule: ContentModuleModel) => void;
  userCanEditArticle: boolean;
};

export type ContentModuleConfigProps<T = Record<string, any>> = {
  contentModule: ContentModuleModel<any, T>;
  onUpdateModule: (contentModule: ContentModuleModel) => void;
  onRequestClose: () => void;
};

export const ContentModule = React.memo(
  ({
    isEditModeEnabled,
    article,
    contentModule,
    onUpdateModule,
    onRemoveContentModule,
    onMoveUp,
    onMoveDown,
  }: ContentModuleProps) => {
    const user = useCurrentUser();
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

    const userCanEditArticle = User.canEditArticle(user, article);

    const components = React.useMemo(
      () => ({
        [ContentModuleType.TITLE]: { Component: Title, Config: TitleConfig },
        [ContentModuleType.TEXT]: { Component: Text, Config: null },
        [ContentModuleType.IMAGE]: {
          Component: ImageModule,
          Config: ImageConfig,
        },
        [ContentModuleType.IMAGE_COLLECTION]: {
          Component: ImageCollection,
          Config: ImageCollectionConfig,
        },
        [ContentModuleType.DIVIDER]: { Component: DividerCM, Config: null },
        [ContentModuleType.VIDEO]: { Component: Video, Config: null },
        [ContentModuleType.AUDIO]: { Component: Audio, Config: null },
        [ContentModuleType.DOWNLOAD]: {
          Component: Download,
          Config: DownloadConfig,
        },
        [ContentModuleType.FORM]: { Component: Form, Config: null },
        [ContentModuleType.TABLE]: { Component: Table, Config: null },
      }),
      []
    );

    const configComponent = React.useMemo(() => {
      if (!onUpdateModule) {
        return null;
      }
      const ConfigComponent = components[contentModule.type]?.Config;

      if (!ConfigComponent) {
        return null;
      }

      return (
        <ConfigComponent
          contentModule={contentModule}
          onUpdateModule={onUpdateModule}
          onRequestClose={() => setIsSettingsOpen(false)}
        />
      );
    }, [contentModule, components, onUpdateModule]);

    const mainComponent = React.useMemo(() => {
      if (!onUpdateModule) {
        return null;
      }
      const MainComponent = components[contentModule.type]?.Component;

      if (!MainComponent) {
        return null;
      }

      return (
        <MainComponent
          contentModule={contentModule}
          isEditModeEnabled={isEditModeEnabled}
          onUpdateModule={onUpdateModule}
          userCanEditArticle={userCanEditArticle}
        />
      );
    }, [contentModule, components, onUpdateModule]);

    return (
      <>
        <section
          className={clsx(styles.root, {
            [styles.active]: isSettingsOpen,
            [styles.isEditModeEnabled]: isEditModeEnabled,
          })}
          data-testid={'ContentModule'}
        >
          {isEditModeEnabled && (
            <div className={styles.titlebar} title="Modul konfigurieren">
              <section className={styles.leftButtonSection}>
                {onMoveUp && (
                  <Button
                    small
                    aria-label={'Modul um eine Stelle nach oben bewegen'}
                    icon={<Icon icon={faArrowUp} />}
                    onClick={() => onMoveUp()}
                  />
                )}
                {onMoveDown && (
                  <Button
                    small
                    aria-label={'Modul um eine Stelle nach unten bewegen'}
                    icon={<Icon icon={faArrowDown} />}
                    onClick={() => onMoveDown()}
                  />
                )}
              </section>
              <section>
                {configComponent && (
                  <Button
                    small
                    aria-label={'Moduleinstellungen'}
                    onClick={() => setIsSettingsOpen(true)}
                    icon={<Icon icon={faGear} />}
                  />
                )}
                <Button
                  small
                  icon={<Icon icon={faTrash} />}
                  className={styles.deleteButton}
                  title={'Modul löschen'}
                  onClick={() => onRemoveContentModule?.()}
                />
              </section>
            </div>
          )}
          {mainComponent}
        </section>
        {configComponent && (
          <Dialog
            open={isSettingsOpen}
            title={'Moduleinstellungen'}
            onRequestClose={() => setIsSettingsOpen(false)}
          >
            <DialogContent>{configComponent}</DialogContent>
            <DialogActions>
              <Button onClick={() => setIsSettingsOpen(false)}>OK</Button>
            </DialogActions>
          </Dialog>
        )}
      </>
    );
  }
);
ContentModule.displayName = 'CM';
