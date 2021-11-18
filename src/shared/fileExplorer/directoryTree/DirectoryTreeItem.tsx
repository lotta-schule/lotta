import React, { memo, useCallback, useContext } from 'react';
import { TreeItem } from '@material-ui/lab';
import { DirectoryModel } from 'model';
import { useQuery } from '@apollo/client';
import { CircularProgress } from '@material-ui/core';
import { HomeOutlined } from '@material-ui/icons';
import { File } from 'util/model';
import { SelectedDirectoryContext } from './SelectedDirectoryContext';
import { useCurrentUser } from 'util/user/useCurrentUser';
import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';

export interface DirectoryTreeItemProps {
    directory: DirectoryModel | null;
    showOnlyReadOnlyDirectories?: boolean;
}

export const DirectoryTreeItem = memo<DirectoryTreeItemProps>(
    ({ directory, showOnlyReadOnlyDirectories }) => {
        const currentUser = useCurrentUser();
        const [, selectDirectory] = useContext(SelectedDirectoryContext);
        const { data, loading: isLoading } = useQuery<{
            directories: DirectoryModel[];
        }>(GetDirectoriesAndFilesQuery, {
            variables: {
                parentDirectoryId: directory?.id ?? null,
            },
        });
        const icon = isLoading ? (
            <CircularProgress size={'1em'} />
        ) : directory === null ? (
            <HomeOutlined fontSize={'small'} />
        ) : (
            File.getIconForDirectory(directory)
        );

        const label =
            directory === null ? (
                icon
            ) : (
                <>
                    {icon}&nbsp;&nbsp; {directory.name}
                </>
            );
        const directoryFilter = useCallback(
            (directory: DirectoryModel) => {
                if (showOnlyReadOnlyDirectories) {
                    return File.canEditDirectory(directory, currentUser);
                }
                return true;
            },
            [currentUser, showOnlyReadOnlyDirectories]
        );
        return (
            <TreeItem
                nodeId={String(directory?.id ?? 'null')}
                label={label}
                onClick={(e) => {
                    e.preventDefault();
                    selectDirectory(directory);
                }}
            >
                {data?.directories.filter(directoryFilter).map((directory) => (
                    <DirectoryTreeItem
                        key={directory.id}
                        directory={directory}
                        showOnlyReadOnlyDirectories={
                            showOnlyReadOnlyDirectories
                        }
                    />
                ))}
            </TreeItem>
        );
    }
);
