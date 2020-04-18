import React, { Reducer, memo, useReducer } from 'react';
import { makeStyles, Theme, Paper, Toolbar, Button } from '@material-ui/core';
import { FileModel } from 'model';
import { useTranslation } from 'react-i18next';
import { ActiveUploadsModal } from './ActiveUploadsModal';
import { CreateNewDirectoryDialog } from './CreateNewDirectoryDialog';
import { DeleteFilesDialog } from './DeleteFilesDialog';
import { FileTable } from './FileTable';
import { FileToolbar } from './FileToolbar';
import { MoveFilesDialog } from './MoveFilesDialog';
import { Provider, defaultState, FileExplorerMode } from './context/FileExplorerContext';
import { Action, reducer } from './context/reducer';
import { MoveDirectoryDialog } from './MoveDirectoryDialog';

const useStyles = makeStyles<Theme>((theme: Theme) => ({
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
  const { t } = useTranslation();
  const styles = useStyles();

  const [state, dispatch] = useReducer<Reducer<typeof defaultState, Action>>(reducer, {
    ...defaultState,
    mode: onSelect ? (multiple ? FileExplorerMode.SelectMultiple : FileExplorerMode.Select) : FileExplorerMode.ViewAndEdit
  });

  return (
    <Provider value={[state, dispatch]}>
      <Paper style={{ position: 'relative', outline: 'none', ...style }} className={className}>
        <ActiveUploadsModal />
        <CreateNewDirectoryDialog
          open={state.showCreateNewFolder}
          basePath={state.currentPath}
          onClose={() => dispatch({ type: 'hideCreateNewFolder' })}
        />
        {state.markedFiles.length > 0 && (
          <MoveFilesDialog />
        )}
        <MoveDirectoryDialog />
        <DeleteFilesDialog />

        <FileToolbar />
        <FileTable fileFilter={fileFilter} />

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
              {t('files.explorer.selectFiles', { count: state.selectedFiles.length })}
            </Button>
          </Toolbar>
        )}
      </Paper>
    </Provider>
  );
});
export default FileExplorer;