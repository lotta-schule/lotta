import React, { FunctionComponent, memo, useCallback, useState, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import { client } from 'api/client';
import { makeStyles, Theme, Paper, Toolbar, Button } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { State } from 'store/State';
import { FileModel, FileModelType, UploadModel } from 'model';
import { GetUserFilesQuery } from 'api/query/GetUserFiles';
import { createSetFilesAction } from 'store/actions/userFiles';
import { ActiveUploadsModal } from './ActiveUploadsModal';
import { UploadQueueContext } from 'context/UploadQueueContext';
import { uniq } from 'lodash';
import { FileToolbar } from './FileToolbar';
import { CreateNewFolderDialog } from './CreateNewFolderDialog';
import { FileTable } from './FileTable';
import { useLocalStorage } from 'util/useLocalStorage';

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
    backgroundColor: '#ccca',
    zIndex: 10000,
    border: '1px solid #333',
    borderRadius: 10,
  },
  bottomToolbar: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
})
);

export interface FileExplorerProps {
  style?: React.CSSProperties;
  className?: string;
  fileFilter?(file: FileModel): boolean;
  onSelectFile?(file: FileModel): void;
  onSelectFiles?(files: FileModel[]): void;
}

export const FileExplorer: FunctionComponent<FileExplorerProps> = memo(({ style, className, fileFilter, onSelectFile, onSelectFiles }) => {

  const files = useSelector<State, FileModel[] | null>(s => s.userFiles.files);
  const [selectedFiles, setSelectedFiles] = useState<FileModel[]>([]);
  const [selectedPath, setSelectedPath] = useLocalStorage('lastSelectedFileExplorerPath', '/');

  const uploads = useSelector<State, UploadModel[]>(s => (s.userFiles.uploads || []));

  const dispatch = useDispatch();

  const uploadQueue = useContext(UploadQueueContext);

  const setFilesCallback = useCallback(files => dispatch(createSetFilesAction(files)), [dispatch]);

  const [isActiveUploadsDialogOpen, setIsActiveUploadsDialogOpen] = useState(false);
  const [isCreateNewFolderDialogOpen, setIsCreateNewFolderDialogOpen] = useState(false);

  const closeDialog = useCallback(<T extends Function>(callback: T): T => {
    setSelectedFiles([]);
    setIsActiveUploadsDialogOpen(false);
    return callback;
  }, [setSelectedFiles, setIsActiveUploadsDialogOpen])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      acceptedFiles.forEach(file => uploadQueue.uploadFile(file, selectedPath));
    }
  }, [selectedPath, uploadQueue]);
  const { getRootProps, getInputProps, isDragActive, isDragAccept, draggedFiles, open } = useDropzone({ onDrop, noClick: true });

  const styles = useStyles();

  if (files === null) {
    client.query<{ files: FileModel[] }>({
      query: GetUserFilesQuery
    }).then(({ data: { files } }) => setFilesCallback(files));

    return (<span>Dateien werden geladen ...</span>);
  }

  const dirFiles = uniq(
    (files || [])
      .map(f => f.path)
      .filter(path => new RegExp(`^${selectedPath}`).test(path))
      .map(path => path.replace(new RegExp(`^${selectedPath}`), ''))

      .map(path => path.replace(/^\//, ''))
      .filter(Boolean)
      .map(path => path.split('/')[0])
  )
    .map(path => ({
      id: path,
      fileType: FileModelType.Directory,
      filename: path,
      filesize: 0,
      insertedAt: new Date().toString(),
      updatedAt: new Date().toString(),
      mimeType: 'application/medienportal-keep-dir',
      path: path,
      remoteLocation: '',
      fileConversions: []
    } as FileModel));

  const currentFiles = (files || [])
    .filter(f => f.filename !== '.lotta-keep' && f.path === selectedPath && (fileFilter ? fileFilter(f) : true))
    .sort();

  return (
    <Paper style={{ position: 'relative', ...style }} className={className} {...getRootProps()}>
      <input {...getInputProps()} />
      {(isDragActive || isDragAccept) && (
        <div className={styles.overlayDropzoneActive}>
          {/* {!isDragActive && isDragAccept && <span>Dateien hierher ziehen</span>} */}
          {isDragActive && <span>Loslassen, um {draggedFiles.length} Dateien hochzuladen</span>}
        </div>
      )}
      <ActiveUploadsModal open={isActiveUploadsDialogOpen} onClose={() => setIsActiveUploadsDialogOpen(false)} />
      <CreateNewFolderDialog basePath={selectedPath} open={isCreateNewFolderDialogOpen} onClose={() => setIsCreateNewFolderDialogOpen(false)} />

      <FileToolbar
        path={selectedPath}
        uploads={uploads}
        onChangePath={setSelectedPath}
        onClickUploadButton={() => open()}
        onClickOpenActiveUploadsDialog={() => setIsActiveUploadsDialogOpen(true)}
        onClickOpenCreateNewFolderDialog={() => setIsCreateNewFolderDialogOpen(true)}
      />

      <FileTable
        selectedFiles={selectedFiles}
        files={[...dirFiles, ...currentFiles]}
        onSelectSubPath={subPath => setSelectedPath([selectedPath, subPath].join('/').replace(/^\/\//, '/'))}
        onSelectFile={onSelectFile ? (file => closeDialog(onSelectFile)(file)) : undefined}
        onSelectFiles={onSelectFiles ? setSelectedFiles : undefined}
      />

      {onSelectFiles && (
        <Toolbar className={styles.bottomToolbar}>
          <Button
            disabled={selectedFiles.length < 1}
            onClick={() => closeDialog(onSelectFiles)(selectedFiles)}
          >
            {selectedFiles.length ? (
              `${selectedFiles.length} Bilder auswählen`
            ) : 'Bilder auswählen'}
          </Button>
        </Toolbar>
      )}
    </Paper>
  );
});