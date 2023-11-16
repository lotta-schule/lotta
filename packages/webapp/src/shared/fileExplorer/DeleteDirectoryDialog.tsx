import * as React from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { DirectoryModel, FileModel } from 'model';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
  List,
  ListItem,
  LoadingButton,
} from '@lotta-schule/hubert';
import fileExplorerContext from './context/FileExplorerContext';

import DeleteFileMutation from 'api/mutation/DeleteFileMutation.graphql';
import DeleteDirectoryMutation from 'api/mutation/DeleteDirectoryMutation.graphql';
import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';

import styles from './DeleteDirectoryDialog.module.scss';

export const DeleteDirectoryDialog = React.memo(() => {
  const client = useApolloClient();
  const [state, dispatch] = React.useContext(fileExplorerContext);

  const [filesToDelete, setFilesToDelete] = React.useState<
    { file: FileModel; relativePath: string }[]
  >([]);
  const [directoriesToDelete, setDirectoriesToDelete] = React.useState<
    DirectoryModel[]
  >([]);

  const getDirectoriesAndFilesForDirectory = React.useCallback(
    async (directory: DirectoryModel, relativePath = ''): Promise<void> => {
      setDirectoriesToDelete((directoriesToDelete) => [
        directory,
        ...directoriesToDelete,
      ]);
      const { data } = await client.query<{
        files: FileModel[];
        directories: DirectoryModel[];
      }>({
        query: GetDirectoriesAndFilesQuery,
        variables: { parentDirectoryId: directory.id },
      });
      setFilesToDelete((filesToDelete) => [
        ...filesToDelete,
        ...(data?.files ?? []).map((f) => ({
          file: f,
          relativePath: relativePath + f.filename,
        })),
      ]);
      return Promise.all(
        (data?.directories ?? []).map((d) =>
          getDirectoriesAndFilesForDirectory(d, relativePath + d.name + '/')
        )
      ).then(void 0);
    },
    [client]
  );

  React.useEffect(() => {
    if (!state.showDeleteDirectory) {
      setFilesToDelete([]);
      setDirectoriesToDelete([]);
    } else if (state.markedDirectories.length > 0) {
      setFilesToDelete([]);
      setDirectoriesToDelete([]);
      getDirectoriesAndFilesForDirectory(state.markedDirectories[0]);
    }
  }, [
    state.markedDirectories,
    state.showDeleteDirectory,
    getDirectoriesAndFilesForDirectory,
  ]);

  const [
    deleteFile,
    { error: errorDeletingFile, loading: isLoadingDeleteFile },
  ] = useMutation<
    {
      file: FileModel;
    },
    { id: string }
  >(DeleteFileMutation, {
    update: (client, { data }) => {
      if (data?.file) {
        const cache = client.readQuery<{
          files: DirectoryModel[];
          directories: DirectoryModel[];
        }>({
          query: GetDirectoriesAndFilesQuery,
          variables: { parentDirectoryId: data.file.parentDirectory.id },
        });
        client.writeQuery({
          query: GetDirectoriesAndFilesQuery,
          variables: { parentDirectoryId: data.file.parentDirectory.id },
          data: {
            files: (cache?.files ?? []).filter((f) => f.id !== data?.file.id),
            directories: cache?.directories ?? [],
          },
        });
      }
    },
  });

  const [
    deleteDirectory,
    { error: errorDeletingDirectory, loading: isLoadingDeleteDirectory },
  ] = useMutation<{
    directory: DirectoryModel;
  }>(DeleteDirectoryMutation, {
    update: (client, { data }) => {
      if (data?.directory) {
        const cache = client.readQuery<{
          files: DirectoryModel[];
          directories: DirectoryModel[];
        }>({
          query: GetDirectoriesAndFilesQuery,
          variables: { parentDirectoryId: data.directory.parentDirectory?.id },
        });
        client.writeQuery({
          query: GetDirectoriesAndFilesQuery,
          variables: { parentDirectoryId: data.directory.parentDirectory?.id },
          data: {
            files: cache?.files ?? [],
            directories: (cache?.directories ?? []).filter(
              (f) => f.id !== data.directory.id
            ),
          },
        });
      }
    },
  });

  const error = errorDeletingFile ?? errorDeletingDirectory;
  const isLoading = isLoadingDeleteFile ?? isLoadingDeleteDirectory;

  return (
    <Dialog
      open={state.showDeleteDirectory}
      onRequestClose={() => dispatch({ type: 'hideDeleteDirectory' })}
      title={'Ordner löschen'}
      className={styles.root}
    >
      {state.markedDirectories.length > 0 && (
        <>
          <DialogContent>
            <p>
              Möchtest du den Ordner{' '}
              <strong>{state.markedDirectories[0].name}</strong> wirklich mit
              all seinen Inhalten löschen?
            </p>
            <ErrorMessage error={error} />
            Es werden folgende <strong>
              {filesToDelete.length} Dateien
            </strong>{' '}
            gelöscht:
            <List className={styles.filesList}>
              {filesToDelete.map((f) => (
                <ListItem key={f.file.id}>{f.relativePath}</ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => dispatch({ type: 'hideDeleteDirectory' })}>
              Abbrechen
            </Button>
            <LoadingButton
              loading={isLoading}
              onClick={async () => {
                try {
                  for (const { file } of filesToDelete) {
                    await deleteFile({
                      variables: {
                        id: file.id,
                      },
                    }).then(() =>
                      setFilesToDelete((filesToDelete) =>
                        filesToDelete.filter((f) => f.file.id !== file.id)
                      )
                    );
                  }
                  for (const directory of directoriesToDelete) {
                    await deleteDirectory({
                      variables: {
                        id: directory.id,
                      },
                    }).then(() => {
                      return setDirectoriesToDelete((directories) =>
                        directories.filter((d) => d.id !== directory.id)
                      );
                    });
                  }
                  dispatch({ type: 'hideDeleteDirectory' });
                } catch (e) {
                  console.error(
                    `error deleting one or more files or directories: `,
                    e
                  );
                }
              }}
            >
              Ordner löschen
            </LoadingButton>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
});
DeleteDirectoryDialog.displayName = 'DeleteDirectoryDialog';
