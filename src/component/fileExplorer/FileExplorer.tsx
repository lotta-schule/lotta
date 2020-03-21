import React, { Reducer, memo, useCallback, useContext, useEffect, useReducer } from 'react';
import { makeStyles, Theme, Paper, Toolbar, Button } from '@material-ui/core';
import { useQuery } from '@apollo/react-hooks';
import { fade } from '@material-ui/core/styles';
import { uniq } from 'lodash';
import { useDropzone } from 'react-dropzone';
import { FileModel, FileModelType } from 'model';
import { GetUserFilesQuery } from 'api/query/GetUserFiles';
import { UploadQueueContext } from 'context/UploadQueueContext';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User } from 'util/model';
import { ActiveUploadsModal } from './ActiveUploadsModal';
import { CreateNewFolderDialog } from './CreateNewFolderDialog';
import { DeleteFilesDialog } from './DeleteFilesDialog';
import { FileTable } from './FileTable';
import { FileToolbar } from './FileToolbar';
import { SelectDirectoryTreeDialog } from './SelectDirectoryTreeDialog';
import { Provider, defaultState } from './context/FileExplorerContext';
import { Action, reducer } from './context/reducer';

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  overlayDropzoneActive: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fade(theme.palette.grey[400], .67),
    zIndex: 10000,
    border: '1px solid',
    borderColor: theme.palette.grey[700],
    borderRadius: 10,
  },
  bottomToolbar: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
}));

export interface FileExplorerProps {
  style?: React.CSSProperties;
  className?: string;
  fileFilter?(file: FileModel): boolean;
  onSelectFile?(file: FileModel): void;
  onSelectFiles?(files: FileModel[]): void;
}

export const FileExplorer = memo<FileExplorerProps>(({ style, className, fileFilter, onSelectFile, onSelectFiles }) => {
  const styles = useStyles();

  const [state, dispatch] = useReducer<Reducer<typeof defaultState, Action>>(reducer, defaultState);

  const { data, error, loading: isLoading } = useQuery<{ files: FileModel[] }>(GetUserFilesQuery);
  useEffect(() => {
    if (data) {
      dispatch({ type: 'setFiles', files: data.files });
    }
  }, [data])

  const uploadQueue = useContext(UploadQueueContext);
  const [currentUser] = useCurrentUser();

  const isWriteable = !state.isPublic || User.isAdmin(currentUser);

  const closeDialog = useCallback(<T extends Function>(callback: T): T => {
    dispatch({ type: 'resetSelectedFiles' });
    dispatch({ type: 'hideActiveUploads' });
    return callback;
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      acceptedFiles.forEach(file => uploadQueue.uploadFile(file, state.currentPath, state.isPublic));
    }
  }, [state.currentPath, state.isPublic, uploadQueue]);
  const { getRootProps, getInputProps, isDragActive, isDragAccept, draggedFiles } = useDropzone({
    onDrop,
    disabled: !isWriteable,
    multiple: true,
    preventDropOnDocument: true,
    noClick: true
  });

  if (error) {
    return (
      <ErrorMessage error={error} />
    );
  }

  if (!data || isLoading) {
    return (
      <span>Dateien werden geladen ...</span>
    );
  }

  const files = state.files
    .filter(f => Boolean(f.isPublic) === state.isPublic);

  const dirFiles = uniq(
    (files || [])
      .map(file => file.path)
      .filter((path) => new RegExp(`^${state.currentPath}`).test(path))
      .map(path => path.replace(new RegExp(`^${state.currentPath}`), ''))
      .map(path => path.replace(/^\//, ''))
      .filter(path => Boolean(path))
      .map(path => path.split('/')[0])
  )
    .map(path => ({
      id: [state.currentPath, path].join('/').replace(/^\/\//, '/') as any,
      isPublic: state.isPublic,
      fileType: FileModelType.Directory,
      filename: path,
      filesize: 0,
      insertedAt: new Date().toString(),
      updatedAt: new Date().toString(),
      mimeType: 'application/medienportal-keep-dir',
      path: [state.currentPath, path].join('/').replace(/^\/\//, '/'),
      remoteLocation: '',
      fileConversions: [],
      userId: currentUser!.id
    } as FileModel));

  const currentFiles = (files || [])
    .filter(f => f.filename !== '.lotta-keep' && f.path === state.currentPath && (fileFilter ? fileFilter(f) : true))
    .sort();

  return (
    <Provider value={[state, dispatch]}>
      <Paper style={{ position: 'relative', outline: 'none', ...style }} className={className} {...getRootProps()}>
        <input {...getInputProps()} />
        {(isDragActive || isDragAccept) && (
          <div className={styles.overlayDropzoneActive}>
            {isDragActive && <span>Loslassen, um {draggedFiles.length} Dateien hochzuladen</span>}
          </div>
        )}
        <ActiveUploadsModal />
        <CreateNewFolderDialog
          open={state.showCreateNewFolder}
          basePath={state.currentPath}
          isPublic={state.isPublic}
          onClose={() => dispatch({ type: 'hideCreateNewFolder' })}
        />
        <SelectDirectoryTreeDialog />
        <DeleteFilesDialog />

        <FileToolbar
          publicModeAvailable
          showFileCreateButtons={isWriteable}
          showFileEditingButtons={isWriteable && state.markedFiles.length > 0}
          onSelectFilesToUpload={onDrop}
        />

        <FileTable
          canEditPublicFiles={User.isAdmin(currentUser)}
          files={[...dirFiles, ...currentFiles]}
          onSelectFile={onSelectFile ? (file => closeDialog(onSelectFile)(file)) : undefined}
          onSelectFiles={onSelectFiles ? (files => dispatch({ type: 'setSelectedFiles', files })) : undefined}
        />

        {onSelectFiles && (
          <Toolbar className={styles.bottomToolbar}>
            <Button
              disabled={state.selectedFiles.length < 1}
              onClick={() => closeDialog(onSelectFiles)(state.selectedFiles)}
            >
              {state.selectedFiles.length ? (
                state.selectedFiles.length === 1 ?
                  `Datei auswählen` :
                  `${state.selectedFiles.length} Dateien auswählen`
              ) : 'Dateien auswählen'}
            </Button>
          </Toolbar>
        )}
      </Paper>
    </Provider>
  );
});