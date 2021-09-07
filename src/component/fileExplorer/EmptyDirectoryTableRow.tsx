import * as React from 'react';
import {
    TableRow,
    TableCell,
    Link,
    makeStyles,
    Theme,
} from '@material-ui/core';
import { useMutation } from '@apollo/client';
import { DeleteDirectoryMutation } from 'api/mutation/DeleteDirectoryMutation';
import { DirectoryModel, FileModel } from 'model';
import { GetDirectoriesAndFilesQuery } from 'api/query/GetDirectoriesAndFiles';
import { ErrorMessage } from 'component/general/ErrorMessage';
import fileExplorerContext, {
    FileExplorerMode,
} from './context/FileExplorerContext';

const useStyles = makeStyles<Theme, { isLoading: boolean }>((theme) => ({
    link: {
        color: ({ isLoading }) =>
            isLoading ? 'inherit' : theme.palette.secondary.main,
    },
}));

export const EmptyDirectoryTableRow = React.memo(() => {
    const [state, dispatch] = React.useContext(fileExplorerContext);

    const [deleteDirectory, { error, loading: isLoading }] = useMutation(
        DeleteDirectoryMutation,
        {
            variables: { id: state.currentPath.slice(-1)[0].id },
            update: (client, { data }) => {
                if (data?.directory) {
                    const cache = client.readQuery<{
                        files: FileModel[];
                        directories: DirectoryModel[];
                    }>({
                        query: GetDirectoriesAndFilesQuery,
                        variables: {
                            parentDirectoryId:
                                data.directory.parentDirectory?.id ?? null,
                        },
                    });
                    client.writeQuery({
                        query: GetDirectoriesAndFilesQuery,
                        variables: {
                            parentDirectoryId:
                                data.directory.parentDirectory?.id ?? null,
                        },
                        data: {
                            files: [...(cache?.files ?? [])],
                            directories: cache?.directories.filter(
                                (d) => d.id !== data.directory.id
                            ),
                        },
                    });
                }
            },
            onCompleted: () => {
                dispatch({
                    type: 'setPath',
                    path: state.currentPath.slice(
                        0,
                        state.currentPath.length - 1
                    ),
                });
            },
        }
    );
    const styles = useStyles({ isLoading });

    return (
        <TableRow style={{ cursor: 'inherit' }}>
            <TableCell
                colSpan={state.mode === FileExplorerMode.ViewAndEdit ? 5 : 4}
                style={{
                    textAlign: 'center',
                    display: 'table-cell',
                    width: '100%',
                    whiteSpace: 'normal',
                }}
            >
                <ErrorMessage error={error} />
                <p>
                    <em>In diesem Ordner liegen keine Dateien oder Ordner.</em>
                </p>
                <p>
                    <em>
                        Du kannst Dateien hochladen, indem du sie mit der Maus
                        aus deiner Dateiverwaltung in dieses Feld ziehst.
                    </em>
                </p>
                <p>
                    <Link
                        className={styles.link}
                        onClick={() => {
                            if (!isLoading) {
                                deleteDirectory();
                            }
                        }}
                    >
                        Ordner löschen
                    </Link>
                </p>
            </TableCell>
        </TableRow>
    );
});
