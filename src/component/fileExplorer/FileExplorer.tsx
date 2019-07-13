import React, { FunctionComponent, memo, useCallback } from 'react';
import MaterialTable from 'material-table';
import {
  Edit, Save, Delete, Search, SkipPrevious, Clear,
  ChevronLeft, ChevronRight, SkipNext, AddBox, CloudUploadOutlined
} from '@material-ui/icons';
import { useDropzone } from 'react-dropzone';
import { client } from 'api/client';
import { UploadFileMutation } from 'api/mutation/UploadFile';
import { makeStyles, Theme, createStyles } from '@material-ui/core';
import { AxiosRequestConfig } from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { State } from 'store/State';
import { FileModel, UploadModel } from 'model';
import { GetUserFilesQuery } from 'api/query/GetUserFiles';
import { createSetFilesAction, createAddFileAction, createUpdateUploadAction, createAddUploadAction, createDeleteUploadAction } from 'store/actions/userFiles';

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
  const uploads = useSelector<State, UploadModel[] | null>(s => s.userFiles.uploads);
  const dispatch = useDispatch();

  const setFilesCallback = useCallback(files => dispatch(createSetFilesAction(files)), [dispatch]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      console.log('upload file: ', acceptedFiles[0]);
      const uploadModel = {
        id: `${new Date().getTime()}${Math.random() * 100}`,
        filename: acceptedFiles[0].name,
        path: '/',
        uploadProgress: 0
      };
      dispatch(createAddUploadAction(uploadModel));
      const { data: { file } } = await client.mutate<{ file: FileModel }>({
        mutation: UploadFileMutation,
        variables: {
          path: '/',
          file: acceptedFiles[0]
        },
        context: {
          fetchOptions: {
            onUploadProgress: (progressEvent: ProgressEvent) => {
              dispatch(createUpdateUploadAction({
                ...uploadModel,
                progress: progressEvent.loaded / progressEvent.total
              }));
            }
          } as AxiosRequestConfig
        }
      });
      dispatch(createAddFileAction(file));
      setTimeout(() => {
        dispatch(createDeleteUploadAction(uploadModel.id));
      }, 3000);
    }
  }, [dispatch]);

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
            hidden: !Boolean(uploads && uploads.length > 0),
            isFreeAction: true,
            onClick: () => { }
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