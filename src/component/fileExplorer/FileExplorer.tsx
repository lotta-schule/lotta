import React, { FunctionComponent, memo } from 'react';
import MaterialTable from 'material-table';
import {
  Edit, Save, Delete, Search, SkipPrevious, Clear,
  ChevronLeft, ChevronRight, SkipNext, AddBox
} from '@material-ui/icons';

export interface FileExplorerProps {
}

export const FileExplorer: FunctionComponent<FileExplorerProps> = memo(() => {

  const [state, setState] = React.useState({
    columns: [
      { title: 'Dateiname', field: 'filename' },
      { title: 'Upload-Status', field: 'uploadstatus', type: 'numeric' },
      { title: 'Größe (MB)', field: 'size', type: 'numeric' },
      {
        title: 'Dateityp', field: 'filetype', lookup: { jpg: 'JPEG', doc: 'Word-Dokument' },
      },
    ],
    data: [
      {
        filename: 'Beispiel Foto',
        uploadstatus: '100%',
        size: 2122,
        filetype: 'jpg'
      },
      {
        filename: 'Beispiel Dokument',
        uploadstatus: '100%',
        size: 231,
        filetype: 'doc',
      },
    ],
  } as any);

  return (
    <MaterialTable
      columns={state.columns}
      data={state.data}
      style={{ boxShadow: 'none' }}
      title={''}

      icons={{
        Add: () => <AddBox />,
        Check: () => <Save />,
        Delete: () => <Delete />,
        Clear: () => <Clear />,
        Edit: () => <Edit />,
        Search: () => <Search />,
        PreviousPage: () => <ChevronLeft />,
        FirstPage: () => <SkipPrevious />,
        NextPage: () => <ChevronRight />,
        LastPage: () => <SkipNext />
      }}
      editable={{
        onRowAdd: newData =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              const data = [...state.data];
              data.push(newData);
              setState({ ...state, data });
            }, 600);
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              const data = [...state.data];
              data[data.indexOf(oldData)] = newData;
              setState({ ...state, data });
            }, 600);
          }),
        onRowDelete: oldData =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              const data = [...state.data];
              data.splice(data.indexOf(oldData), 1);
              setState({ ...state, data });
            }, 600);
          }),
      }}
    />
  );
});