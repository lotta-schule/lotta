import * as React from 'react';
import { useLazyQuery } from '@apollo/client';
import { Browser, BrowserMode, BrowserProps } from '@lotta-schule/hubert';
import {
  GetDirectoriesAndFilesQueryResult,
  makeBrowserNodes,
} from './makeBrowserNodes';
import { RenderNodeList } from './RenderNodeList';

import GetDirectoriesAndFilesQuery from '../../api/query/GetDirectoriesAndFiles.graphql';
import { FileModel } from 'model';
import { File } from 'util/model';
import { useCurrentUser } from 'util/user';

export type UserBrowserProps = {
  mode?: BrowserMode;
  style?: React.CSSProperties; // TODO: Must be implemented
  fileFilter?: (file: FileModel) => boolean; // TODO: Must be implemented (or maybe change the API?)
  onSelect?: (file: FileModel[]) => void; // TODO: Must be implemented
};

export const UserBrowser = React.memo(
  ({ mode, style, fileFilter, onSelect }: UserBrowserProps) => {
    const currentUser = useCurrentUser();

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
          return File.getIconForFile((node as any).meta);
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
        return File.canEditDirectory((node as any).meta, currentUser) || false;
      },
      []
    );

    return (
      <Browser
        onRequestChildNodes={onRequestChildNodes}
        renderNodeList={RenderNodeList}
        onRequestNodeIcon={onRequestNodeIcon}
        canEdit={canEdit}
        mode={mode}
        style={style}
      />
    );
  }
);
UserBrowser.displayName = 'UserBrowser';
