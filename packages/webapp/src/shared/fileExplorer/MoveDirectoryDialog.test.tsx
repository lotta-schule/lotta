import * as React from 'react';
import { TestFileExplorerContextProvider } from 'test/util';
import { render, waitFor } from '../../test/util';
import { getPrivateAndPublicFiles, KeinErSieEsUser } from '../../test/fixtures';
import { MoveDirectoryDialog } from './MoveDirectoryDialog';
import { DirectoryModel } from '../../model';
import { MockedResponse } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';

import GetDirectoriesAndFilesQuery from '../../api/query/GetDirectoriesAndFiles.graphql';

const currentUser = KeinErSieEsUser;
const filesAndDirectories = getPrivateAndPublicFiles(currentUser);

const additionalMocks: MockedResponse[] = [
  {
    request: {
      query: GetDirectoriesAndFilesQuery,
      variables: {
        parentDirectoryId: null,
      },
    },
    result: {
      data: {
        files: [],
        directories: filesAndDirectories.filter(
          (fod) => 'name' in fod && fod.parentDirectory === null
        ),
      },
    },
  },
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

describe('shared/dialog/MoveDirectoryDialog', () => {
  it('should render dialog without errors and close it on abort', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <TestFileExplorerContextProvider
        defaultValue={{ showMoveDirectory: true }}
      >
        <MoveDirectoryDialog />
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
});
