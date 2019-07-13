import React, { FunctionComponent, memo, useCallback, useState, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import { client } from 'api/client';
import {
  makeStyles, Theme, createStyles, Paper
} from '@material-ui/core';
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

const useStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
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
    }
  }),
);

export interface FileExplorerProps {
}

export const FileExplorer: FunctionComponent<FileExplorerProps> = memo(() => {

  const files = useSelector<State, FileModel[] | null>(s => s.userFiles.files);
  const [selectedPath, setSelectedPath] = useState('/');

  const uploads = useSelector<State, UploadModel[]>(s => (s.userFiles.uploads || []));

  const dispatch = useDispatch();

  const uploadQueue = useContext(UploadQueueContext);

  const setFilesCallback = useCallback(files => dispatch(createSetFilesAction(files)), [dispatch]);

  const [isActiveUploadsDialogOpen, setIsActiveUploadsDialogOpen] = useState(false);
  const [isCreateNewFolderDialogOpen, setIsCreateNewFolderDialogOpen] = useState(false);

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

  const directories = uniq((files || [])
    .map(file => {
      const relativePath = file.path.replace(new RegExp(`^${selectedPath}`), '');
      if (relativePath.length < 1) {
        return null;
      } else {
        return relativePath.split('/')[0];
      }
    })
    .filter(Boolean) as string[])
    .map(d => ({
      id: d,
      fileType: FileModelType.Directory,
      filename: d,
      filesize: 0,
      insertedAt: new Date().toString(),
      updatedAt: new Date().toString(),
      mimeType: 'application/medienportal-keep-dir',
      path: d,
      remoteLocation: ''
    }));

  const currentFiles = (files || [])
    .filter(f => f.filename !== '.panda-keep' && f.path === selectedPath);

  return (
    <Paper style={{ position: 'relative' }} {...getRootProps()}>
      <input {...getInputProps()} />
      {(isDragActive || isDragAccept) && (
        <div className={styles.overlayDropzoneActive}>
          {/* {!isDragActive && isDragAccept && <span>Dateien hierher ziehen</span>} */}
          {isDragActive && <span>Loslassen, um {draggedFiles.length} Dateien hochzuladen</span>}
        </div>
      )}
      <ActiveUploadsModal open={isActiveUploadsDialogOpen} onClose={() => setIsActiveUploadsDialogOpen(false)} />
      <CreateNewFolderDialog open={isCreateNewFolderDialogOpen} onClose={() => setIsCreateNewFolderDialogOpen(false)} />

      <FileToolbar
        path={selectedPath}
        uploads={uploads}
        onChangePath={setSelectedPath}
        onClickUploadButton={() => open()}
        onClickOpenActiveUploadsDialog={() => setIsActiveUploadsDialogOpen(true)}
        onClickOpenCreateNewFolderDialog={() => setIsCreateNewFolderDialogOpen(true)}
      />

      <FileTable
        files={directories.concat(currentFiles)}
        onSelectSubPath={subPath => setSelectedPath([selectedPath, subPath].join('/').replace(/^\/\//, '/'))}
      />
    </Paper>
  );
});