import * as React from 'react';
import { MockedResponse } from '@apollo/client/testing';
import { TestFileExplorerContextProvider, render, waitFor } from 'test/util';
import { DeleteDirectoryDialog } from './DeleteDirectoryDialog';
import { KeinErSieEsUser, getPrivateAndPublicFiles } from 'test/fixtures';
import { DirectoryModel } from 'model';
import userEvent from '@testing-library/user-event';

import DeleteFileMutation from 'api/mutation/DeleteFileMutation.graphql';
import DeleteDirectoryMutation from 'api/mutation/DeleteDirectoryMutation.graphql';
import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';

const currentUser = KeinErSieEsUser;
const filesAndDirectories = getPrivateAndPublicFiles(currentUser);
const podcastDirectory = filesAndDirectories.find(
  (fileOrDir) => 'name' in fileOrDir && fileOrDir.name === 'Podcasts'
) as DirectoryModel;

const additionalMocks: MockedResponse[] = [
  ...(
    filesAndDirectories.filter((fod) => 'name' in fod) as DirectoryModel[]
  ).map((dir) => ({
    request: {
      query: GetDirectoriesAndFilesQuery,
      variables: {
        parentDirectoryId: dir.id,
      },
    },
    result: {
      data: {
        files: filesAndDirectories.filter(
          (fod) => !('name' in fod) && fod.parentDirectory?.id === dir.id
        ),
        directories: filesAndDirectories.filter(
          (fod) => 'name' in fod && fod.parentDirectory?.id === dir.id
        ),
      },
    },
  })),
];

describe('shared/dialog/DeleteDirectoryDialog', () => {
  it('should render dialog without errors and close it on abort', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <TestFileExplorerContextProvider
        defaultValue={{ showDeleteDirectory: true }}
      >
        <DeleteDirectoryDialog />
      </TestFileExplorerContextProvider>,
      {},
      {
        currentUser,
        additionalMocks,
      }
    );
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });
    await fireEvent.click(screen.getByRole('button', { name: /schließen/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('should show all files in the currently marked directory', async () => {
    const screen = render(
      <TestFileExplorerContextProvider
        defaultValue={{
          showDeleteDirectory: true,
          markedDirectories: [podcastDirectory],
        }}
      >
        <DeleteDirectoryDialog />
      </TestFileExplorerContextProvider>,
      {},
      { currentUser, additionalMocks }
    );
    await waitFor(() => {
      expect(screen.getByRole('list')).toBeVisible();
    });
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });
  });

  it('should delete the directory and all its files', async () => {
    const deleteMocks = filesAndDirectories.map((fod) => {
      if ('name' in fod) {
        // fod is directory
        return {
          request: {
            query: DeleteDirectoryMutation,
            variables: {
              id: fod.id,
            },
          },
          result: {
            data: {
              directory: null,
            },
          },
        };
      }
      return {
        request: {
          query: DeleteFileMutation,
          variables: {
            id: fod.id,
          },
        },
        result: {
          data: {
            file: null,
          },
        },
      };
    });

    const screen = render(
      <TestFileExplorerContextProvider
        defaultValue={{
          showDeleteDirectory: true,
          markedDirectories: [podcastDirectory],
        }}
      >
        <DeleteDirectoryDialog />
      </TestFileExplorerContextProvider>,
      {},
      {
        currentUser,
        additionalMocks: [...additionalMocks, ...deleteMocks],
      }
    );
    await userEvent.click(screen.getByRole('button', { name: /löschen/i }));

    expect(screen.getByRole('progressbar')).toBeVisible();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    });
    await waitFor(() => {
      expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    });
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    });
  });
});
