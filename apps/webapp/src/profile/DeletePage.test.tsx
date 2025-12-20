import * as React from 'react';
import { DirectoryModel, FileModel } from 'model';
import { MockRouter } from 'test/mocks';
import { render, waitFor } from 'test/util';
import {
  ComputerExperten,
  VivaLaRevolucion,
  Schulfest,
  Weihnachtsmarkt,
  Klausurenplan,
  SomeUser,
  getPrivateAndPublicFiles,
} from 'test/fixtures';
import { DeletePage, GET_RELEVANT_FILES_IN_USAGE } from './DeletePage';
import { getDefaultApolloMocks } from 'test/mocks/defaultApolloMocks';
import userEvent from '@testing-library/user-event';

import DestroyAccountMutation from 'api/mutation/DestroyAccountMutation.graphql';
import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import GetOwnArticlesQuery from 'api/query/GetOwnArticles.graphql';

describe('shared/layouts/profileLayout/ProfileDelete', () => {
  const filesAndDirs = getPrivateAndPublicFiles(SomeUser);

  const files = filesAndDirs.filter(
    (f: unknown) => (f as FileModel).fileType !== undefined
  ) as unknown as FileModel[];
  const directories = filesAndDirs.filter(
    (f: unknown) => (f as FileModel).fileType === undefined
  ) as unknown as DirectoryModel[];
  const rootDirectories = directories.filter((d) => !d.parentDirectory);

  it('should be able to go to second page and see own articles when clicking on button', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <DeletePage />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks: [
          {
            request: { query: GetOwnArticlesQuery },
            result: {
              data: {
                articles: [
                  Weihnachtsmarkt,
                  Klausurenplan,
                  Schulfest,
                  VivaLaRevolucion,
                  ComputerExperten,
                ],
              },
            },
          },
          {
            request: {
              query: GetDirectoriesAndFilesQuery,
              variables: { parentDirectoryId: null },
            },
            result: {
              data: { files: [], directories: rootDirectories },
            },
          },
        ],
      }
    );

    expect(
      await screen.findByRole('heading', { name: /daten löschen/i })
    ).toBeInTheDocument();
    await fireEvent.click(
      await screen.findByRole('button', { name: /weiter/i })
    );

    await waitFor(() => {
      expect(screen.getByTestId('ProfileDeleteStep2Box')).toBeVisible();
    });
  }, 10_000);

  it('should be able to go to third page after having seen the first and the second one', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <DeletePage />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks: [
          {
            request: { query: GET_RELEVANT_FILES_IN_USAGE },
            result: { data: { files } },
          },
          {
            request: { query: GetOwnArticlesQuery },
            result: {
              data: {
                articles: [
                  Weihnachtsmarkt,
                  Klausurenplan,
                  Schulfest,
                  VivaLaRevolucion,
                  ComputerExperten,
                ],
              },
            },
          },
          {
            request: {
              query: GetDirectoriesAndFilesQuery,
              variables: { parentDirectoryId: null },
            },
            result: {
              data: { files: [], directories: rootDirectories },
            },
          },
        ],
      }
    );

    await fireEvent.click(
      await screen.findByRole('button', { name: /weiter/i })
    );
    await waitFor(() => {
      expect(screen.getByTestId('ProfileDeleteStep2Box')).toBeVisible();
    });
    await fireEvent.click(
      await screen.findByRole('button', { name: /weiter/i })
    );
    await waitFor(() => {
      expect(screen.getByTestId('ProfileDeleteStep3Box')).toBeVisible();
    });
  }, 10_000);

  it('The third page should not show the DeleteFileSelection or the tab bar if userAvatar has no files', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <DeletePage />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks: [
          {
            request: { query: GET_RELEVANT_FILES_IN_USAGE },
            result: { data: { files: [] } },
          },
          {
            request: { query: GetOwnArticlesQuery },
            result: {
              data: {
                articles: [
                  Weihnachtsmarkt,
                  Klausurenplan,
                  Schulfest,
                  VivaLaRevolucion,
                  ComputerExperten,
                ],
              },
            },
          },
          {
            request: {
              query: GetDirectoriesAndFilesQuery,
              variables: { parentDirectoryId: null },
            },
            result: {
              data: { files: [], directories: rootDirectories },
            },
          },
        ],
      }
    );

    fireEvent.click(await screen.findByRole('button', { name: /weiter/i }));
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeVisible();
    });
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    });
    await fireEvent.click(screen.getByRole('button', { name: /weiter/i }));

    await waitFor(() => {
      expect(screen.getByTestId('ProfileDeleteStep3Box')).toBeVisible();
    });
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(
      screen.queryByRole('tabpanel', {
        name: /dateien aus beiträgen übergeben/i,
      })
    ).toBeNull();

    await waitFor(() => {
      expect(
        screen.getByRole('tabpanel', {
          name: /alle dateien überprüfen/i,
        })
      ).toBeVisible();
    });
  }, 10_000);

  it.todo(
    'The fourth page should show a "definitly delete account" button, which upon click should show a modal with another "definitly delete account" button',
    async () => {
      const fireEvent = userEvent.setup();
      let didCallDeleteMutation = false;
      const screen = render(
        <DeletePage />,
        {},
        {
          currentUser: SomeUser,
          additionalMocks: [
            {
              request: {
                query: DestroyAccountMutation,
                variables: {
                  userId: SomeUser.id,
                  transferFileIds: [],
                },
              },
              result: () => {
                didCallDeleteMutation = true;
                return { data: { user: SomeUser } };
              },
            },
            {
              request: { query: GET_RELEVANT_FILES_IN_USAGE },
              result: { data: { files: [] } },
            },
            {
              request: { query: GetOwnArticlesQuery },
              result: {
                data: {
                  articles: [
                    Weihnachtsmarkt,
                    Klausurenplan,
                    Schulfest,
                    VivaLaRevolucion,
                    ComputerExperten,
                  ],
                },
              },
            },
            {
              request: {
                query: GetDirectoriesAndFilesQuery,
                variables: { parentDirectoryId: null },
              },
              result: {
                data: { files: [], directories: rootDirectories },
              },
            },
            {
              request: {
                query: GetDirectoriesAndFilesQuery,
                variables: { parentDirectoryId: null },
              },
              result: {
                data: { files: [], directories: rootDirectories },
              },
            },
            ...getDefaultApolloMocks().mocks, // double mocks because cache is restored
          ],
        }
      );

      const { mockRouter } = await vi.importMock<{ mockRouter: MockRouter }>(
        'next/navigation'
      );

      await waitFor(() => {
        screen.getByRole('button', { name: /weiter/i });
      });
      await fireEvent.click(screen.getByRole('button', { name: /weiter/i }));
      await waitFor(() => {
        expect(screen.getByTestId('ProfileDeleteStep2Box')).toBeVisible();
      });
      await fireEvent.click(screen.getByRole('button', { name: /weiter/i }));
      await waitFor(() => {
        expect(screen.getByTestId('ProfileDeleteStep3Box')).toBeVisible();
      });
      await fireEvent.click(screen.getByRole('button', { name: /weiter/i }));
      await waitFor(() => {
        expect(screen.getByTestId('ProfileDeleteStep4Box')).toBeVisible();
      });
      await fireEvent.click(
        screen.getByRole('button', { name: /endgültig löschen/i })
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeVisible();
      });

      await fireEvent.click(
        await screen.findByRole('button', {
          name: /jetzt alle daten endgültig löschen/i,
        })
      );

      await waitFor(() => {
        expect(didCallDeleteMutation).toEqual(true);
      });

      await waitFor(() => {
        expect(mockRouter._push).toHaveBeenLastCalledWith('/', '/', undefined);
      });
    },
    25_000
  );
});
