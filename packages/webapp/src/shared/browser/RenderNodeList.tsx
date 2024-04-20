import * as React from 'react';
import { useQuery } from '@apollo/client';
import { BrowserState, NodeList } from '@lotta-schule/hubert';
import {
  makeBrowserNodes,
  GetDirectoriesAndFilesQueryResult,
} from './makeBrowserNodes';

import GetDirectoriesAndFilesQuery from '../../api/query/GetDirectoriesAndFiles.graphql';

export const RenderNodeList: BrowserState['renderNodeList'] = React.memo(
  ({ parentPath }) => {
    const parentDirectoryId = parentPath.at(-1)?.id ?? null;
    const { data } = useQuery<GetDirectoriesAndFilesQueryResult>(
      GetDirectoriesAndFilesQuery,
      {
        variables: { parentDirectoryId },
      }
    );

    const nodes = React.useMemo(() => makeBrowserNodes(data), [data]);

    return <NodeList path={parentPath} nodes={nodes} />;
  }
);
RenderNodeList.displayName = 'LottaRenderNodeList';
