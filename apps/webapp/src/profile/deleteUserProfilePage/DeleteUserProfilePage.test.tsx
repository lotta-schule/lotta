import * as React from 'react';
import { ComputerExperten, SomeUser } from 'test/fixtures';
import { render, userEvent, waitFor } from 'test/util';
import { redirectTo } from 'util/browserLocation';
import { DeleteUserProfilePage } from './DeleteUserProfilePage';
import {
  GET_OWN_ARTICLES,
  GET_RELEVANT_FILES_IN_USAGE,
  PERMANENTLY_DELETE_USER_ACCOUNT,
} from './queries';

import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';

const createMockFile = (id: string, filename: string) => ({
  id,
  filename,
  filesize: 123456,
  mimeType: 'image/jpeg',
  fileType: 'IMAGE',
  userId: '1',
  insertedAt: '2023-01-01',
  updatedAt: '2023-01-01',
  formats: [
    {
      name: 'preview_200',
      url: 'http://example.com/file.jpg',
      type: 'image',
      availability: { status: 'ready' },
    },
  ],
  usage: [
    {
      usage: 'ARTICLE_CONTENT',
      article: { id: '1', title: 'Test Article', previewImageFile: null },
    },
  ],
  parentDirectory: { id: '1', name: 'Folder' },
});

describe('profile/deleteUserProfilePage/DeleteUserProfilePage', () => {
  const mockFiles = [
    createMockFile('1', 'photo.jpg'),
    createMockFile('2', 'image.png'),
  ];
  const mockArticles = [{ ...ComputerExperten, published: true }];

  const defaultMocks = [
    {
      request: { query: GET_OWN_ARTICLES },
      result: { data: { articles: mockArticles } },
    },
    {
      request: { query: GET_RELEVANT_FILES_IN_USAGE },
      result: { data: { files: mockFiles } },
    },
    ...Array.from({ length: 3 }).fill({
      request: {
        query: GetDirectoriesAndFilesQuery,
        variables: { parentDirectoryId: null },
      },
      result: {
        data: {
          directories: [],
          files: mockFiles,
        },
      },
    }),
  ];

  const getTestOptions = (additionalOptions = {}) => ({
    additionalMocks: defaultMocks,
    withCache: (cache: any) => {
      cache.writeQuery({
        query: GET_OWN_ARTICLES,
        data: { articles: mockArticles },
      });
      cache.writeQuery({
        query: GET_RELEVANT_FILES_IN_USAGE,
        data: { files: mockFiles },
      });
      return cache;
    },
    ...additionalOptions,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('should render start step initially', () => {
    const screen = render(<DeleteUserProfilePage />, {}, getTestOptions());
    expect(screen.getByText(/Benutzerkonto und Daten löschen/)).toBeVisible();
  });

  it('should navigate through all steps forward', async () => {
    const user = userEvent.setup();
    const screen = render(
      <DeleteUserProfilePage />,
      {},
      getTestOptions({ currentUser: SomeUser })
    );

    expect(screen.getByText(/Benutzerkonto und Daten löschen/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: /weiter/i }));

    await waitFor(() => {
      expect(screen.getByText(/Deine Beiträge/)).toBeVisible();
    });
    await user.click(screen.getByRole('button', { name: /weiter/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: /Dateien aus genutzten Beiträgen/i,
        })
      ).toBeVisible();
    });
    await user.click(screen.getByRole('button', { name: /weiter/i }));

    await waitFor(() => {
      expect(screen.getByText(/Löschanfrage bestätigen/)).toBeVisible();
    });
  });

  it('should navigate back through steps', async () => {
    const user = userEvent.setup();
    const screen = render(
      <DeleteUserProfilePage />,
      {},
      { additionalMocks: defaultMocks }
    );

    await user.click(screen.getByRole('button', { name: /weiter/i }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Deine Beiträge/ })
      ).toBeVisible();
    });
    await user.click(screen.getByRole('button', { name: /weiter/i }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: /Dateien aus genutzten Beiträgen/i,
        })
      ).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: /zurück/i }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Deine Beiträge/ })
      ).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: /zurück/i }));
    await waitFor(() => {
      expect(screen.getByText(/Benutzerkonto und Daten löschen/)).toBeVisible();
    });
  });

  it('should preserve selected files when navigating back and forth', async () => {
    const user = userEvent.setup();
    const screen = render(
      <DeleteUserProfilePage />,
      {},
      { additionalMocks: defaultMocks }
    );

    await user.click(screen.getByRole('button', { name: /weiter/i }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Deine Beiträge/ })
      ).toBeVisible();
    });
    await user.click(screen.getByRole('button', { name: /weiter/i }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: /Dateien aus genutzten Beiträgen/i,
        })
      ).toBeVisible();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3); // 2 files + 1 select all

    await user.click(checkboxes[1]);
    await user.click(screen.getByRole('button', { name: /weiter/i }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Löschanfrage bestätigen/ })
      ).toBeVisible();
    });
    expect(screen.getByRole('list')).toHaveTextContent(
      /1 datei.*die du.*überlässt/i
    );

    await user.click(screen.getByRole('button', { name: /zurück/i }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: /dateien aus.*Beiträgen/i,
        })
      ).toBeVisible();
    });

    await waitFor(() => {
      expect(screen.getByText(/Dateien übergeben \(1\/2\)/i)).toBeVisible();
    });
  });

  it('should open confirmation dialog on final step', async () => {
    const user = userEvent.setup();
    const screen = render(
      <DeleteUserProfilePage />,
      {},
      { additionalMocks: defaultMocks }
    );

    await user.click(screen.getByRole('button', { name: /weiter/i }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Deine Beiträge/ })
      ).toBeVisible();
    });
    await user.click(screen.getByRole('button', { name: /weiter/i }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: /Dateien aus genutzten Beiträgen/i,
        })
      ).toBeVisible();
    });
    await user.click(screen.getByRole('button', { name: /weiter/i }));
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /Löschanfrage bestätigen/ })
      ).toBeVisible()
    );

    await user.click(
      screen.getByRole('button', { name: /Daten endgültig löschen/i })
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /Benutzerkonto wirklich löschen/i })
      ).toBeVisible();
    });
  });

  it('should complete full deletion flow', async () => {
    const user = userEvent.setup();
    const deleteMutationFn = vi.fn(() => ({ data: { user: SomeUser } }));

    const screen = render(
      <DeleteUserProfilePage />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks: [
          ...defaultMocks,
          {
            request: {
              query: PERMANENTLY_DELETE_USER_ACCOUNT,
              variables: { userId: SomeUser.id, transferFileIds: [] },
            },
            result: deleteMutationFn,
          },
        ],
      }
    );

    await user.click(screen.getByRole('button', { name: /weiter/i }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Deine Beiträge/ })
      ).toBeVisible();
    });
    await user.click(screen.getByRole('button', { name: /weiter/i }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: /Dateien aus genutzten Beiträgen/i,
        })
      ).toBeVisible();
    });
    await user.click(screen.getByRole('button', { name: /weiter/i }));
    await waitFor(() => {
      expect(screen.getByText(/Löschanfrage bestätigen/)).toBeVisible();
    });
    await user.click(
      screen.getByRole('button', { name: /Daten endgültig löschen/i })
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    await user.click(
      screen.getByRole('button', {
        name: /Jetzt alle Daten endgültig löschen/i,
      })
    );

    await waitFor(() => {
      expect(deleteMutationFn).toHaveBeenCalled();
      expect(redirectTo).toHaveBeenCalledWith('/auth/logout');
    });
  });

  it('should handle query errors with ErrorBoundary', async () => {
    const user = userEvent.setup();
    const screen = render(
      <DeleteUserProfilePage />,
      {},
      {
        additionalMocks: [
          {
            request: { query: GET_OWN_ARTICLES },
            error: new Error('Query failed'),
          },
        ],
      }
    );

    await user.click(screen.getByRole('button', { name: /weiter/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /neu laden/i })).toBeVisible();
    });
  });
});
