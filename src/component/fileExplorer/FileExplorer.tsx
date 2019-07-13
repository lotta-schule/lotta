import React, { FunctionComponent, memo, useCallback, useState, useContext } from 'react';
import MaterialTable from 'material-table';
import {
  Edit, Save, Delete, Search, SkipPrevious, Clear,
  ChevronLeft, ChevronRight, SkipNext, AddBox, CloudUploadOutlined
} from '@material-ui/icons';
import { useDropzone } from 'react-dropzone';
import { client } from 'api/client';
import { makeStyles, Theme, createStyles } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { State } from 'store/State';
import { FileModel } from 'model';
import { GetUserFilesQuery } from 'api/query/GetUserFiles';
import { createSetFilesAction } from 'store/actions/userFiles';
import { ActiveUploadsModal } from './ActiveUploadsModal';
import { UploadQueueContext } from 'context/UploadQueueContext';

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
  const uploadLength = useSelector<State, number>(s => (s.userFiles.uploads || []).length);
  const dispatch = useDispatch();

  const uploadQueue = useContext(UploadQueueContext);

  const setFilesCallback = useCallback(files => dispatch(createSetFilesAction(files)), [dispatch]);

  const [isActiveUploadsDialogOpen, setIsActiveUploadsDialogOpen] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      console.log('upload file: ', acceptedFiles[0]);
      acceptedFiles.forEach(file => uploadQueue.uploadFile(file, '/'));
    }
  }, [uploadQueue]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, draggedFiles, open } = useDropzone({ onDrop, noClick: true });

  const styles = useStyles();

  if (files === null) {
    client.query<{ files: FileModel[] }>({
      query: GetUserFilesQuery
    }).then(({ data: { files } }) => setFilesCallback(files));
  }

  return (
    <div style={{ position: 'relative' }} {...getRootProps()}>
      <input {...getInputProps()} />
      {(isDragActive || isDragAccept) && (
        <div className={styles.overlayDropzoneActive}>
          {/* {!isDragActive && isDragAccept && <span>Dateien hierher ziehen</span>} */}
          {isDragActive && <span>Loslassen, um {draggedFiles.length} Dateien hochzuladen</span>}
        </div>
      )}
      <ActiveUploadsModal open={isActiveUploadsDialogOpen} onClose={() => setIsActiveUploadsDialogOpen(false)} />
      <MaterialTable
        columns={[
          { title: 'Dateiname', field: 'filename', editable: 'onUpdate' },
          // { title: 'Status', field: 'uploadstatus', type: 'numeric', editable: 'never' },
          { title: 'Dateigröße', field: 'size', type: 'numeric', editable: 'never' },
          {
            title: 'Dateityp',
            field: 'filetype',
            lookup: { jpg: 'JPEG', doc: 'Word-Dokument' },
            editable: 'never'
          },
        ]}
        data={(files || []).map(file => ({
          filename: file.filename,
          size: file.filesize,
          filetype: file.fileType
        }))}
        style={{ boxShadow: 'none' }}
        title={''}
        actions={[
          {
            icon: () => <CloudUploadOutlined />,
            tooltip: 'Uploads',
            hidden: uploadLength < 1,
            isFreeAction: true,
            onClick: () => setIsActiveUploadsDialogOpen(true)
          },
          {
            icon: () => <AddBox />,
            tooltip: 'Datei hochladen',
            isFreeAction: true,
            onClick: () => open()
          },
        ]}
        icons={{
          Check: () => <Save />,
          Delete: () => <Delete />,
          Clear: () => <Clear />,
          ResetSearch: () => <Clear />,
          Edit: () => <Edit />,
          Search: () => <Search />,
          PreviousPage: () => <ChevronLeft />,
          FirstPage: () => <SkipPrevious />,
          NextPage: () => <ChevronRight />,
          LastPage: () => <SkipNext />
        }}
        editable={{
          onRowUpdate: (newData, oldData) =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                // const data = [...state.data];
                // data[data.indexOf(oldData)] = newData;
                // setState({ ...state, data });
              }, 600);
            }),
          onRowDelete: oldData =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                // const data = [...state.data];
                // data.splice(data.indexOf(oldData), 1);
                // setState({ ...state, data });
              }, 600);
            }),
        }}
      />
    </div>
  );
});