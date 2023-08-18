import * as React from 'react';

import { Icon } from 'shared/Icon';
import {
  faCircleMinus,
  faCopy,
  faPen,
  faEllipsisVertical,
  faCloudArrowDown,
} from '@fortawesome/free-solid-svg-icons';

import { Checkbox, MenuButton, Item } from '@lotta-schule/hubert';
import { FileModel, DirectoryModel } from 'model';
import { File } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { FileTableRowFilenameCell } from './FileTableRowFilenameCell';
import { useServerData } from 'shared/ServerDataContext';
import fileExplorerContext, {
  FileExplorerMode,
} from './context/FileExplorerContext';
import uniqBy from 'lodash/uniqBy';
import clsx from 'clsx';

export interface FileTableRowProps {
  file: FileModel;
  onMark(e: React.MouseEvent): void;
}

export const FileTableRow = React.memo<FileTableRowProps>(
  ({ file, onMark }) => {
    const { baseUrl } = useServerData();
    const currentUser = useCurrentUser();
    const [isRenaming, setIsRenaming] = React.useState(false);
    const [state, dispatch] = React.useContext(fileExplorerContext);

    const isMarked =
      state.markedFiles.find((f) => f.id === file.id) !== undefined;
    const isSelected =
      state.selectedFiles.find((f) => f.id === file.id) !== undefined;

    const filesAreEditable =
      state.mode === FileExplorerMode.ViewAndEdit &&
      File.canEditDirectory(
        state.currentPath[state.currentPath.length - 1] as DirectoryModel,
        currentUser
      );

    return (
      <tr
        className={clsx({ selected: isMarked || isSelected })}
        onClick={onMark}
      >
        <td>
          {state.mode === FileExplorerMode.SelectMultiple && (
            <Checkbox
              isReadOnly
              aria-label={`Datei ${file.filename} auswählen`}
              className={'select-file-checkbox'}
              style={{ padding: 0 }}
              isSelected={
                state.selectedFiles.find((f) => f.id === file.id) !== undefined
              }
              onChange={(isSelected) => {
                dispatch({
                  type: 'setSelectedFiles',
                  files: isSelected
                    ? uniqBy([...state.selectedFiles, file], 'id')
                    : state.selectedFiles.filter((f) => f.id !== file.id),
                });
              }}
            />
          )}
        </td>
        <td>{File.getIconForFile(file)}</td>
        <FileTableRowFilenameCell
          file={file}
          isRenaming={isRenaming}
          onCompleteRenaming={() => setIsRenaming(false)}
          onSelect={() => {}}
        />
        {filesAreEditable && (
          <td>
            <MenuButton
              buttonProps={{
                small: true,
                icon: <Icon icon={faEllipsisVertical} size={'lg'} />,
                'aria-label': 'Dateimenü öffnen',
              }}
              title={'Dateimenü'}
              onAction={(action) => {
                switch (action) {
                  case 'download': {
                    const downloadUrl = File.getFileRemoteLocation(
                      baseUrl,
                      file
                    );
                    const anchor = document.createElement('a');
                    anchor.href = downloadUrl;
                    anchor.download = file.filename;
                    anchor.click();
                    break;
                  }
                  case 'rename':
                    setIsRenaming(true);
                    break;
                  case 'move':
                    dispatch({ type: 'showMoveFiles' });
                    dispatch({
                      type: 'setMarkedFiles',
                      files: [file],
                    });
                    break;
                  case 'delete':
                    dispatch({ type: 'showDeleteFiles' });
                    dispatch({
                      type: 'setMarkedFiles',
                      files: [file],
                    });
                    break;
                }
              }}
            >
              <Item key={'download'} textValue={'Herunterladen'}>
                <Icon icon={faCloudArrowDown} size={'lg'} color={'secondary'} />
                Herunterladen
              </Item>
              <Item key={'rename'} textValue={'Umbenennen'}>
                <Icon icon={faPen} size={'lg'} color={'secondary'} />
                Umbenennen
              </Item>
              <Item key={'move'} textValue={'Verschieben'}>
                <Icon icon={faCopy} size={'lg'} color={'secondary'} />
                Verschieben
              </Item>
              <Item key={'delete'} textValue={'Löschen'}>
                <Icon icon={faCircleMinus} size={'lg'} color={'secondary'} />
                Löschen
              </Item>
            </MenuButton>
          </td>
        )}
      </tr>
    );
  }
);
FileTableRow.displayName = 'FileTableRow';
