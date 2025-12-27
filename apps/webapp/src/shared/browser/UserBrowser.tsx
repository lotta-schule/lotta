'use client';
import * as React from 'react';
import { useLazyQuery } from '@apollo/client/react';
import {
  Browser,
  BrowserMode,
  BrowserNode,
  BrowserProps,
  isDirectoryNode,
  isFileNode,
} from '@lotta-schule/hubert';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { DirectoryModel, FileModel } from 'model';
import { File, User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { FileSize } from '@lotta-schule/hubert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-regular-svg-icons';
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import {
  useCreateDirectory,
  useDeleteNode,
  useMoveNode,
  useRenameNode,
  useSearchNodes,
  useUploadNode,
} from './action';
import {
  GetDirectoriesAndFilesQueryResult,
  makeBrowserNodes,
} from './makeBrowserNodes';
import { RenderNodeList } from './RenderNodeList';
import { FileUsageOverview } from './FileUsageOverview';

import GetDirectoriesAndFilesQuery from '../../api/query/GetDirectoriesAndFiles.graphql';

declare module '@lotta-schule/hubert' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultFileMetadata extends FileModel {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultDirectoryMetadata extends DirectoryModel {}
}

export type UserBrowserProps = {
  style?: React.CSSProperties;
  multiple?: boolean;
  isNodeDisabled?: (node: BrowserNode) => boolean;
  onSelect?: (file: FileModel[]) => void;
};

export const UserBrowser = React.memo(
  ({ style, multiple, isNodeDisabled, onSelect }: UserBrowserProps) => {
    const currentUser = useCurrentUser();
    const { t } = useTranslation();

    const createDirectory = useCreateDirectory();
    const renameNode = useRenameNode();
    const moveNode = useMoveNode();
    const deleteNode = useDeleteNode();
    const uploadNode = useUploadNode();
    const searchNodes = useSearchNodes();

    const [fetchDirectoriesAndFiles] =
      useLazyQuery<GetDirectoriesAndFilesQueryResult>(
        GetDirectoriesAndFilesQuery
      );
    const onRequestChildNodes: BrowserProps['onRequestChildNodes'] =
      React.useCallback(
        async (node, options) => {
          try {
            const result = await fetchDirectoriesAndFiles({
              variables: { parentDirectoryId: node?.id ?? null },
              fetchPolicy: options?.refetch ? 'network-only' : 'cache-first',
            });

            return makeBrowserNodes(result.data) ?? [];
          } catch (error: unknown) {
            if (
              Error.isError(error) &&
              'code' in error &&
              error.code === DOMException.ABORT_ERR
            ) {
              console.warn('file fetching aborted');
              return [];
            }
            throw error;
          }
        },
        [fetchDirectoriesAndFiles]
      );

    const canEdit: BrowserProps['canEdit'] = React.useMemo(
      () => (nodePath) => {
        const node = nodePath?.at(-1);

        if (isDirectoryNode(node)) {
          return File.canEditDirectory(node.meta, currentUser) || false;
        } else if (isFileNode(node)) {
          const parent = nodePath.at(-2) as BrowserNode<'directory'> | null;
          if (!parent) {
            return User.isAdmin(currentUser);
          }
          return File.canEditDirectory(parent.meta, currentUser) || false;
        }
        return User.isAdmin(currentUser);
      },
      [currentUser]
    );

    const getDownloadUrl = React.useCallback<
      Exclude<BrowserProps['getDownloadUrl'], undefined>
    >((node) => {
      if (isFileNode(node)) {
        return File.getRemoteUrl(node.meta, 'original');
      }
      return null;
    }, []);

    const getPreviewUrl = React.useCallback((node: BrowserNode) => {
      if (isFileNode(node)) {
        const formatName = devicePixelRatio < 2 ? 'PREVIEW_200' : 'PREVIEW_400';
        return (
          node.meta.formats.find((f) => f.name === formatName)?.url ?? null
        );
      }
    }, []);

    const getMetadata = React.useCallback(
      (node: BrowserNode) => {
        let result = {
          [t('uploaded')]: format(new Date(node.meta.insertedAt || ''), 'Pp', {
            locale: de,
          }),
        };

        if (isFileNode(node)) {
          result = {
            ...result,
            [t('filesize')]: new FileSize(node.meta.filesize || 0).humanize(),
            [t('type')]: node.meta.mimeType,
            [t('formats')]:
              node.meta.formats?.filter(
                (f) => f.availability.status === 'READY'
              ).length ?? 0,
            [t('pages')]: node.meta.metadata?.pages,
            [t('duration')]:
              node.meta.metadata?.duration &&
              Math.floor(node.meta.metadata.duration) + 's',
            [t('usage')]: <FileUsageOverview file={node.meta} />,
          };
        } else if (isDirectoryNode(node)) {
          result = {
            ...result,
            [t('visibility')]: node.meta.user === null ? t('public') : '',
          };
        }

        return Object.fromEntries(
          Object.entries(result).filter(
            ([, value]) => typeof value === 'number' || !!value
          )
        );
      },
      [t]
    );

    const mode: BrowserMode = React.useMemo(() => {
      if (onSelect) {
        return multiple ? 'select-multiple' : 'select';
      }
      return 'view-and-edit';
    }, [onSelect, multiple]);

    return (
      <Browser
        onSelect={React.useCallback(
          (nodes: BrowserNode[]) => {
            onSelect?.(nodes.filter(isFileNode).map((n) => n.meta));
          },
          [onSelect]
        )}
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
        uploadNode={uploadNode}
        searchNodes={searchNodes}
        getDownloadUrl={getDownloadUrl}
        onRequestNodeIcon={(node, { isOpen, isPreview }) => {
          if (isDirectoryNode(node) && node.meta.user === null) {
            const style = {
              opacity: 0.5,
              fontSize: isPreview ? undefined : '1.5em',
              width: isPreview ? undefined : '1em',
              height: isPreview ? undefined : '1em',
            };
            if (isOpen) {
              return <FontAwesomeIcon icon={faFolderOpen} style={style} />;
            }
            return <FontAwesomeIcon icon={faFolder} style={style} />;
          }
        }}
      />
    );
  }
);
UserBrowser.displayName = 'UserBrowser';
