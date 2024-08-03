import * as React from 'react';
import { Button } from '../button';
import { CircularProgress } from '../progress';
import {
  Check,
  Close,
  CloudUpload,
  CreateNewFolder,
  Home,
  KeyboardArrowLeft,
} from '../icon';
import { useBrowserState } from './BrowserStateContext';
import { ActiveUploadsDialog } from './dialogs/ActiveUploadsDialog';
import { Searchbar } from './Searchbar';
import clsx from 'clsx';

import styles from './Toolbar.module.scss';

export type ToolbarProps = {
  className?: string;
};

export const Toolbar = React.memo(({ className }: ToolbarProps) => {
  const {
    currentPath,
    selected,
    currentSearchResults,
    onNavigate,
    onSelect,
    createDirectory,
    setCurrentAction,
    isFilePreviewVisible,
    setIsFilePreviewVisible,
    setCurrentSearchResults,
    uploadClient,
    canEdit,
  } = useBrowserState();

  const [isActiveUploadsDialogOpen, setIsActiveUploadsDialogOpen] =
    React.useState(false);
  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  const activeDirectoryName = React.useMemo(
    () =>
      [...currentPath].reverse().find((node) => node.type === 'directory')
        ?.name ?? <Home />,
    [selected, currentPath]
  );

  const isUploadAllowed = React.useMemo(() => {
    if (currentPath.length === 0) {
      return false;
    }

    return canEdit(currentPath);
  }, [currentPath, canEdit]);

  const isDirectoryCreationAllowed = React.useMemo(() => {
    return canEdit(currentPath);
  }, [currentPath, canEdit]);

  return (
    <div
      className={clsx(styles.root, className, {
        [styles.isShowingSearchResults]: currentSearchResults !== null,
      })}
      role="toolbar"
    >
      <section className={styles.leftContainer}>
        {currentSearchResults === null && (
          <>
            {currentPath.length > 0 && (
              <Button
                icon={<KeyboardArrowLeft />}
                title="Zurück"
                onClick={() => {
                  if (isFilePreviewVisible) {
                    setIsFilePreviewVisible(false);
                  } else {
                    onSelect([]);
                    onNavigate(currentPath.slice(0, -1));
                  }
                }}
              />
            )}
            {activeDirectoryName}
          </>
        )}
        {currentSearchResults !== null && (
          <>
            <Button
              icon={<KeyboardArrowLeft />}
              className={styles.mobileSearchBackButton}
              title={'Schließen'}
              onClick={() => {
                if (isFilePreviewVisible) {
                  setIsFilePreviewVisible(false);
                } else {
                  setCurrentSearchResults(null);
                }
              }}
            />
            <span>Suchen</span>
          </>
        )}
      </section>

      <Searchbar className={styles.searchField} />

      <section className={styles.rightContainer}>
        {currentSearchResults === null && (
          <>
            {createDirectory !== undefined && isDirectoryCreationAllowed && (
              <Button
                icon={<CreateNewFolder />}
                title="Ordner erstellen"
                onClick={() => {
                  setCurrentAction({
                    type: 'create-directory',
                    path: currentPath,
                  });
                }}
              />
            )}
            {!!uploadClient?.currentUploads.length && (
              <Button
                title={`Es werden ${uploadClient.byState.uploading.length} Dateien hochgeladen`}
                aria-label={`Es werden ${uploadClient.byState.uploading.length} Dateien hochgeladen (${uploadClient.currentProgress}% Fortschritt)`}
                className={styles.uploadProgressButton}
                icon={
                  uploadClient.hasErrors ? (
                    <Close />
                  ) : uploadClient.isSuccess ? (
                    <Check />
                  ) : uploadClient.currentProgress !== null ? (
                    <CircularProgress
                      value={uploadClient.currentProgress}
                      style={{ width: '1em', height: '1em' }}
                      aria-label={`Der Uploadfortschritt beträgt ${uploadClient.currentProgress}%`}
                    />
                  ) : undefined
                }
                onClick={(e) => {
                  e.preventDefault();
                  setIsActiveUploadsDialogOpen(true);
                }}
              >
                {uploadClient.byState.pending.length +
                  uploadClient.byState.uploading.length || null}
              </Button>
            )}

            {isUploadAllowed && (
              <Button
                icon={<CloudUpload />}
                onClick={() => {
                  if (uploadInputRef.current) {
                    uploadInputRef.current.click();
                  }
                }}
                title="Datei hochladen"
                className={styles.uploadButton}
                onlyIcon
              >
                <input
                  type="file"
                  value={''} // to reset the input after selecting a file
                  ref={uploadInputRef}
                  multiple
                  onChange={(event) => {
                    const parentNode = currentPath.at(-1);

                    if (!parentNode || !uploadClient) {
                      return;
                    }

                    if (!event.target.files) {
                      return;
                    }

                    for (const file of event.target.files) {
                      uploadClient.addFile(file, parentNode);
                    }
                  }}
                />
              </Button>
            )}
          </>
        )}
      </section>
      <ActiveUploadsDialog
        isOpen={isActiveUploadsDialogOpen}
        onRequestClose={() => setIsActiveUploadsDialogOpen(false)}
      />
    </div>
  );
});
Toolbar.displayName = 'Toolbar';
