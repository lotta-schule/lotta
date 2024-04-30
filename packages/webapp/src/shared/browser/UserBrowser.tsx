import * as React from 'react';
import { useLazyQuery } from '@apollo/client';
import {
  Browser,
  BrowserMode,
  BrowserNode,
  BrowserProps,
  isDirectoryNode,
  isFileNode,
} from '@lotta-schule/hubert';
import { DirectoryModel, FileModel } from 'model';
import { File } from 'util/model';
import { useCurrentUser } from 'util/user';
import { FileSize } from '@lotta-schule/hubert';
import { useServerData } from 'shared/ServerDataContext';
import {
  useCreateDirectory,
  useDeleteNode,
  useMoveNode,
  useRenameNode,
} from './action';
import {
  GetDirectoriesAndFilesQueryResult,
  makeBrowserNodes,
} from './makeBrowserNodes';
import { RenderNodeList } from './RenderNodeList';

import GetDirectoriesAndFilesQuery from '../../api/query/GetDirectoriesAndFiles.graphql';

declare module '@lotta-schule/hubert' {
  export interface DefaultFileMetadata extends FileModel {}
  export interface DefaultDirectoryMetadata extends DirectoryModel {}
}

export type UserBrowserProps = {
  style?: React.CSSProperties;
  multiple?: boolean;
  isNodeDisabled?: (node: BrowserNode) => boolean;
  onSelect?: (file: FileModel[]) => void; // TODO: Must be implemented
};

export const UserBrowser = React.memo(
  ({ style, multiple, isNodeDisabled, onSelect }: UserBrowserProps) => {
    const serverData = useServerData();
    const currentUser = useCurrentUser();

    const createDirectory = useCreateDirectory();
    const renameNode = useRenameNode();
    const moveNode = useMoveNode();
    const deleteNode = useDeleteNode();

    const [fetchDirectoriesAndFiles] =
      useLazyQuery<GetDirectoriesAndFilesQueryResult>(
        GetDirectoriesAndFilesQuery,
        { fetchPolicy: 'network-only' }
      );

    const onRequestChildNodes: BrowserProps['onRequestChildNodes'] =
      React.useCallback(
        async (node) => {
          const result = await fetchDirectoriesAndFiles({
            variables: { parentDirectoryId: node?.id ?? null },
          });

          if (result.error) {
            throw result.error;
          }

          return makeBrowserNodes(result.data) ?? [];
        },
        [fetchDirectoriesAndFiles]
      );

    const canEdit: BrowserProps['canEdit'] = React.useMemo(
      () => (node) => {
        if (isDirectoryNode(node)) {
          return File.canEditDirectory(node.meta, currentUser) || false;
        }
        return true;
      },
      []
    );

    const getDownloadUrl = React.useCallback<
      Exclude<BrowserProps['getDownloadUrl'], undefined>
    >(
      (node) => {
        if (isFileNode(node)) {
          return File.getFileRemoteLocation(serverData.baseUrl, node.meta);
        }
        return null;
      },
      [serverData.baseUrl]
    );

    const getPreviewUrl = React.useCallback(
      (node: BrowserNode) => {
        if (isFileNode(node)) {
          return File.getPreviewImageLocation(serverData.baseUrl, node.meta, {
            width: (devicePixelRatio || 1) * 200,
            resize: 'contain',
          });
        }
      },
      [serverData.baseUrl]
    );

    const getMetadata = React.useCallback(
      (node: BrowserNode) => {
        if (isFileNode(node)) {
          return {
            'Erstellt am': node.meta.insertedAt,
            Größe: new FileSize(node.meta.filesize).humanize(),
            Dateityp: node.meta.fileType,
            mimeType: node.meta.mimeType,
            Formate: node.meta.fileConversions?.length ?? 0,
            id: node.id,
          };
        } else if (isDirectoryNode(node)) {
          return {
            'Erstellt am': node.meta.insertedAt,
            id: node.id,
          };
        }
      },
      [serverData.baseUrl]
    );

    const mode: BrowserMode = React.useMemo(() => {
      if (onSelect) {
        return multiple ? 'select-multiple' : 'select';
      }
      return 'view-and-edit';
    }, [onSelect, multiple]);

    return (
      <Browser
        onSelect={React.useCallback((nodes: BrowserNode[]) => {
          onSelect?.(nodes.filter(isFileNode).map((n) => n.meta));
        }, [])}
        onRequestChildNodes={onRequestChildNodes}
        renderNodeList={RenderNodeList}
        getPreviewUrl={getPreviewUrl}
        getMetadata={getMetadata}
        canEdit={canEdit}
        isNodeDisabled={isNodeDisabled}
        mode={mode}
        style={style}
        createDirectory={createDirectory}
        renameNode={renameNode}
        moveNode={moveNode}
        deleteNode={deleteNode}
        getDownloadUrl={getDownloadUrl}
      />
    );
  }
);
UserBrowser.displayName = 'UserBrowser';
