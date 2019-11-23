import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
import { find } from 'lodash';
import { ActiveUploadsModal } from './ActiveUploadsModal';
import { CreateNewFolderDialog } from './CreateNewFolderDialog';
import { DeleteFilesDialog } from './DeleteFilesDialog';
import { FileModel, FileModelType, UploadModel, ID } from 'model';
import { FileTable } from './FileTable';
import { FileToolbar } from './FileToolbar';
import { GetUserFilesQuery } from 'api/query/GetUserFiles';
import { makeStyles, Theme, Paper, Toolbar, Button } from '@material-ui/core';
import { MoveFileMutation } from 'api/mutation/MoveFileMutation';
import { DeleteFileMutation } from 'api/mutation/DeleteFileMutation';
import { SelectDirectoryTreeDialog } from './SelectDirectoryTreeDialog';
import { State } from 'store/State';
import { uniq } from 'lodash';
import { UploadQueueContext } from 'context/UploadQueueContext';
import { useDropzone } from 'react-dropzone';
import { useLocalStorage } from 'util/useLocalStorage';
import { useSelector } from 'react-redux';
import { fade } from '@material-ui/core/styles';
import { useMutation, useQuery } from '@apollo/react-hooks';

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
})
);

export interface FileExplorerProps {
  style?: React.CSSProperties;
  className?: string;
  fileFilter?(file: FileModel): boolean;
  onSelectFile?(file: FileModel): void;
  onSelectFiles?(files: FileModel[]): void;
}

export const FileExplorer = memo<FileExplorerProps>(({ style, className, fileFilter, onSelectFile, onSelectFiles }) => {
  const styles = useStyles();

  const [selectedFiles, setSelectedFiles] = useState<FileModel[]>([]);
  const [markedFileIds, setMarkedFileIds] = useState<ID[]>([]);
  const [selectedPath, setSelectedPath] = useLocalStorage('lastSelectedFileExplorerPath', '/');

  const uploads = useSelector<State, UploadModel[]>(s => (s.userFiles.uploads || []));

  const [moveFile] = useMutation(MoveFileMutation);
  const [deleteFile] = useMutation(DeleteFileMutation, {
    update: (cache, { data: { file } }) => {
      setMarkedFileIds([]);
      if (file) {
        const data = cache.readQuery<{ files: FileModel[] }>({ query: GetUserFilesQuery }) || { files: [] };
        cache.writeQuery({
          query: GetUserFilesQuery,
          data: {
            files: data.files.filter(f => f.id !== file.id)
          }
        });
      }
    }
  });
  const { data, error, loading: isLoading } = useQuery<{ files: FileModel[] }>(GetUserFilesQuery);

  const uploadQueue = useContext(UploadQueueContext);

  const [isActiveUploadsDialogOpen, setIsActiveUploadsDialogOpen] = useState(false);
  const [isCreateNewFolderDialogOpen, setIsCreateNewFolderDialogOpen] = useState(false);
  const [isMoveFilesDialogOpen, setIsMoveFilesDialogOpen] = useState(false);
  const [isDeleteFilesDialogOpen, setIsDeleteFilesDialogOpen] = useState(false);

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
  const { getRootProps, getInputProps, isDragActive, isDragAccept, draggedFiles } = useDropzone({
    onDrop,
    multiple: true,
    preventDropOnDocument: true,
    noClick: true
  });

  useEffect(() => {
    setMarkedFileIds([]); // reset marked files when selectedPath changes
  }, [selectedPath]);

  if (error) {
    return (
      <p style={{ color: 'red' }}>{error.message}</p>
    );
  }

  if (!data || isLoading) {
    return (
      <span>Dateien werden geladen ...</span>
    );
  }

  const files = data.files;

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
      id: (new Date().getTime() + Math.random() * 1000 + Math.random() * 1000),
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
    <Paper style={{ position: 'relative', outline: 'none', ...style }} className={className} {...getRootProps()}>
      <input {...getInputProps()} />
      {(isDragActive || isDragAccept) && (
        <div className={styles.overlayDropzoneActive}>
          {/* {!isDragActive && isDragAccept && <span>Dateien hierher ziehen</span>} */}
          {isDragActive && <span>Loslassen, um {draggedFiles.length} Dateien hochzuladen</span>}
        </div>
      )}
      <ActiveUploadsModal open={isActiveUploadsDialogOpen} onClose={() => setIsActiveUploadsDialogOpen(false)} />
      <CreateNewFolderDialog basePath={selectedPath} open={isCreateNewFolderDialogOpen} onClose={() => setIsCreateNewFolderDialogOpen(false)} />
      <SelectDirectoryTreeDialog
        open={isMoveFilesDialogOpen}
        basePath={selectedPath}
        allFiles={files}
        onClose={() => setIsMoveFilesDialogOpen(false)}
        onConfirm={path => {
          markedFileIds.forEach(fileId => moveFile({ variables: { id: fileId, path } }));
          setIsMoveFilesDialogOpen(false);
        }}
      />
      <DeleteFilesDialog
        open={isDeleteFilesDialogOpen}
        filesToDelete={markedFileIds.map(fileId => find(files, { id: fileId })!)}
        onClose={() => setIsDeleteFilesDialogOpen(false)}
        onConfirm={() => {
          markedFileIds.forEach(fileId => deleteFile({ variables: { id: fileId } }));
          setIsDeleteFilesDialogOpen(false);
        }}
      />

      <FileToolbar
        path={selectedPath}
        uploads={uploads}
        showFileEditingButtons={markedFileIds.length > 0}
        onChangePath={setSelectedPath}
        onSelectFilesToUpload={onDrop}
        onClickOpenActiveUploadsDialog={() => setIsActiveUploadsDialogOpen(true)}
        onClickOpenCreateNewFolderDialog={() => setIsCreateNewFolderDialogOpen(true)}
        onClickOpenMoveFilesDialog={() => setIsMoveFilesDialogOpen(true)}
        onClickDeleteFilesDialog={() => setIsDeleteFilesDialogOpen(true)}
      />

      <FileTable
        selectedFiles={selectedFiles}
        files={[...dirFiles, ...currentFiles]}
        markedFileIds={markedFileIds}
        setMarkedFileIds={setMarkedFileIds}
        onSelectSubPath={subPath => setSelectedPath([selectedPath, subPath].join('/').replace(/^\/\//, '/'))}
        onSelectFile={onSelectFile ? (file => closeDialog(onSelectFile)(file)) : undefined}
        onSelectFiles={onSelectFiles ? setSelectedFiles : undefined}
        onClickOpenMoveFilesDialog={file => {
          setMarkedFileIds([file.id]);
          setIsMoveFilesDialogOpen(true)
        }}
        onClickDeleteFilesDialog={file => {
          setMarkedFileIds([file.id]);
          setIsDeleteFilesDialogOpen(true)
        }}
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