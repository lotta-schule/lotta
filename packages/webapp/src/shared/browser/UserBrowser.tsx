import * as React from 'react';
import { useLazyQuery } from '@apollo/client';
import {
  Browser,
  BrowserMode,
  BrowserNode,
  BrowserProps,
} from '@lotta-schule/hubert';
import { FileModel } from 'model';
import { File } from 'util/model';
import { useCurrentUser } from 'util/user';
import { useServerData } from 'shared/ServerDataContext';
import { useMoveNode, useRenameNode } from './action';
import {
  GetDirectoriesAndFilesQueryResult,
  makeBrowserNodes,
} from './makeBrowserNodes';
import { RenderNodeList } from './RenderNodeList';

import GetDirectoriesAndFilesQuery from '../../api/query/GetDirectoriesAndFiles.graphql';

export type UserBrowserProps = {
  style?: React.CSSProperties;
  multiple?: boolean;
  fileFilter?: (file: FileModel) => boolean; // TODO: Must be implemented (or maybe change the API?)
  onSelect?: (file: FileModel[]) => void; // TODO: Must be implemented
};

export const UserBrowser = React.memo(
  ({ style, multiple, fileFilter, onSelect }: UserBrowserProps) => {
    const serverData = useServerData();
    const currentUser = useCurrentUser();

    const renameNode = useRenameNode();
    const moveNode = useMoveNode();

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

          return makeBrowserNodes(result.data);
        },
        [fetchDirectoriesAndFiles]
      );

    const onRequestNodeIcon: BrowserProps['onRequestNodeIcon'] = React.useMemo(
      () => (node) => {
        if (node.type === 'file') {
          return File.getIconForFile(node.meta);
        }
        return null;
      },
      []
    );

    const canEdit: BrowserProps['canEdit'] = React.useMemo(
      () => (node) => {
        if (node.type === 'file') {
          return true;
        }
        return File.canEditDirectory(node.meta, currentUser) || false;
      },
      []
    );

    const mode: BrowserMode = React.useMemo(() => {
      if (onSelect) {
        return multiple ? 'select-multiple' : 'select';
      }
      return 'view-and-edit';
    }, [onSelect, multiple]);

    return (
      <Browser
        onRequestChildNodes={onRequestChildNodes}
        renderNodeList={RenderNodeList}
        onRequestNodeIcon={onRequestNodeIcon}
        getPreviewUrl={React.useCallback(
          (node: BrowserNode<FileModel>) =>
            File.getPreviewImageLocation(serverData.baseUrl, node.meta),
          [serverData.baseUrl]
        )}
        canEdit={canEdit}
        mode={mode}
        style={style}
        renameNode={renameNode}
        moveNode={moveNode}
      />
    );
  }
);
UserBrowser.displayName = 'UserBrowser';
