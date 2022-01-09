import * as React from 'react';
import { CircularProgress } from 'shared/general/progress/CircularProgress';
import { TreeItem } from '@material-ui/lab';
import { DirectoryModel } from 'model';
import { useQuery } from '@apollo/client';
import { HomeOutlined } from '@material-ui/icons';
import { File } from 'util/model';
import { SelectedDirectoryContext } from './SelectedDirectoryContext';
import { useCurrentUser } from 'util/user/useCurrentUser';

import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';

export interface DirectoryTreeItemProps {
    directory: DirectoryModel | null;
    showOnlyReadOnlyDirectories?: boolean;
}

export const DirectoryTreeItem = React.memo<DirectoryTreeItemProps>(
    ({ directory, showOnlyReadOnlyDirectories }) => {
        const currentUser = useCurrentUser();
        const [, selectDirectory] = React.useContext(SelectedDirectoryContext);
        const { data, loading: isLoading } = useQuery<{
            directories: DirectoryModel[];
        }>(GetDirectoriesAndFilesQuery, {
            variables: {
                parentDirectoryId: directory?.id ?? null,
            },
        });
        const icon = isLoading ? (
            <CircularProgress
                isIndeterminate
                size={'1em'}
                aria-label={'Dateien werden geladen'}
            />
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
        const directoryFilter = React.useCallback(
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
DirectoryTreeItem.displayName = 'DirectoryTreeItem';
