import * as React from 'react';
import { render, userEvent, waitFor } from 'test/util';
import { ReviewFilesStep } from './ReviewFilesStep';
import { GET_RELEVANT_FILES_IN_USAGE } from '../queries';
import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import { documentFile, imageFile, otherImageFile } from 'test/fixtures';

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
  parentDirectory: { id: '1', name: 'My Folder' },
});

describe('profile/deleteUserProfilePage/steps/ReviewFilesStep', () => {
  const mockFiles = [
    createMockFile('1', 'photo.jpg'),
    createMockFile('2', 'image.png'),
  ];

  const getMocksWithCache = (files: typeof mockFiles) => ({
    additionalMocks: [
      {
        request: { query: GET_RELEVANT_FILES_IN_USAGE },
        result: { data: { files } },
      },
      {
        request: {
          query: GetDirectoriesAndFilesQuery,
          variables: { parentDirectoryId: null },
        },
        result: {
          data: {
            directories: [],
            files: mockFiles.concat([
              imageFile,
              otherImageFile,
              documentFile,
            ] as any),
          },
        },
      },
    ],
    withCache: (cache: any) => {
      cache.writeQuery({
        query: GET_RELEVANT_FILES_IN_USAGE,
        data: { files },
      });
      return cache;
    },
  });

  it('should render tabs when files exist', async () => {
    const screen = render(
      <ReviewFilesStep
        selectedFilesToTransfer={[]}
        onFilesChange={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />,
      {},
      getMocksWithCache(mockFiles)
    );

    await waitFor(() => {
      expect(screen.getByText(/Dateien übergeben/i)).toBeVisible();
    });
    expect(screen.getAllByText(/Alle Dateien überprüfen/i)[0]).toBeVisible();
  });

  it('should render FileSelection component in handover tab', async () => {
    const screen = render(
      <ReviewFilesStep
        selectedFilesToTransfer={[]}
        onFilesChange={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />,
      {},
      getMocksWithCache(mockFiles)
    );

    await waitFor(() => {
      expect(screen.getByText('photo.jpg')).toBeVisible();
    });
    expect(screen.getByText('image.png')).toBeVisible();
  });

  it('should render UserBrowser when switching to all files tab', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <ReviewFilesStep
        selectedFilesToTransfer={[]}
        onFilesChange={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />,
      {},
      getMocksWithCache(mockFiles)
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Alle Dateien überprüfen/i)[0]).toBeVisible();
    });

    const tab = screen
      .getAllByRole('tab')
      .find((t) => t.textContent?.includes('Alle Dateien überprüfen'));
    if (tab) {
      await fireEvent.click(tab);

      await waitFor(() => {
        expect(
          screen.getByText(/Du kannst Dateien.*herunterladen/i)
        ).toBeVisible();
      });
    }
  });

  it('should show selected files count in tab label', async () => {
    const selectedFiles = [mockFiles[0]];
    const screen = render(
      <ReviewFilesStep
        selectedFilesToTransfer={selectedFiles}
        onFilesChange={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />,
      {},
      getMocksWithCache(mockFiles)
    );

    await waitFor(() => {
      expect(screen.getByText(/Dateien übergeben \(1\/2\)/i)).toBeVisible();
    });
  });

  it('should call onFilesChange when files are selected', async () => {
    const onFilesChange = vi.fn();
    const screen = render(
      <ReviewFilesStep
        selectedFilesToTransfer={[]}
        onFilesChange={onFilesChange}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />,
      {},
      getMocksWithCache(mockFiles)
    );

    await waitFor(() => {
      expect(screen.getAllByRole('checkbox')).toHaveLength(3); // 1 select all + 2 files
    });

    const fireEvent = userEvent.setup();
    const checkboxes = screen.getAllByRole('checkbox');
    await fireEvent.click(checkboxes[1]); // Click first file checkbox

    await waitFor(() => {
      expect(onFilesChange).toHaveBeenCalled();
    });
  });

  it('should handle empty files list', async () => {
    const screen = render(
      <ReviewFilesStep
        selectedFilesToTransfer={[]}
        onFilesChange={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />,
      {},
      getMocksWithCache([])
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /weiter/i })).toBeVisible();
    });
    expect(screen.queryByText(/Dateien übergeben/i)).toBeNull();
  });
});
