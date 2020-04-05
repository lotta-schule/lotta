import React, { Reducer, memo, useCallback, useContext, useReducer } from 'react';
import { makeStyles, Theme, Paper, Toolbar, Button } from '@material-ui/core';
import { fade } from '@material-ui/core/styles';
import { useDropzone } from 'react-dropzone';
import { DirectoryModel, FileModel } from 'model';
import { UploadQueueContext } from 'context/UploadQueueContext';
import { ActiveUploadsModal } from './ActiveUploadsModal';
import { CreateNewDirectoryDialog } from './CreateNewDirectoryDialog';
import { DeleteFilesDialog } from './DeleteFilesDialog';
import { FileTable } from './FileTable';
import { FileToolbar } from './FileToolbar';
import { MoveFilesDialog } from './MoveFilesDialog';
import { Provider, defaultState, FileExplorerMode } from './context/FileExplorerContext';
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
  multiple?: boolean;
  fileFilter?(file: FileModel): boolean;
  onSelect?(file: FileModel[] | FileModel): void;
}

export const FileExplorer = memo<FileExplorerProps>(({ style, className, multiple, fileFilter, onSelect }) => {
  const styles = useStyles();

  const [state, dispatch] = useReducer<Reducer<typeof defaultState, Action>>(reducer, {
    ...defaultState,
    mode: onSelect ? (multiple ? FileExplorerMode.SelectMultiple : FileExplorerMode.Select) : FileExplorerMode.ViewAndEdit
  });

  const uploadQueue = useContext(UploadQueueContext);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (state.currentPath.length > 1 && acceptedFiles.length > 0) {
      acceptedFiles.forEach(file => uploadQueue.uploadFile(file, state.currentPath[state.currentPath.length - 1] as DirectoryModel));
    }
  }, [state.currentPath, uploadQueue]);
  const { getRootProps, getInputProps, isDragActive, isDragAccept, draggedFiles } = useDropzone({
    onDrop,
    disabled: state.currentPath.length < 2,
    multiple: true,
    preventDropOnDocument: true,
    noClick: true
  });

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
        <CreateNewDirectoryDialog
          open={state.showCreateNewFolder}
          basePath={state.currentPath}
          onClose={() => dispatch({ type: 'hideCreateNewFolder' })}
        />
        <MoveFilesDialog />
        <DeleteFilesDialog />

        <FileToolbar
          showFileCreateButtons={true} /* TODO: Check if can create a file */
          onSelectFilesToUpload={onDrop}
        />

        <FileTable />

        {state.mode !== FileExplorerMode.ViewAndEdit && (
          <Toolbar className={styles.bottomToolbar}>
            <Button
              disabled={state.selectedFiles.length < 1}
              onClick={() => {
                onSelect?.(state.mode === FileExplorerMode.Select ? state.selectedFiles[0] : state.selectedFiles);
                dispatch({ type: 'resetSelectedFiles' });
                dispatch({ type: 'hideActiveUploads' });
              }}
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