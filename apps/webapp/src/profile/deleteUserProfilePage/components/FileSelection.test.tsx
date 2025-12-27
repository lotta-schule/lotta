import * as React from 'react';
import { render, userEvent, waitFor } from 'test/util';
import { FileSelection } from './FileSelection';

const createMockFile = (id: string, filename: string, hasUsage = true) => ({
  id,
  filename,
  filesize: 123456,
  mimeType: 'image/jpeg',
  fileType: 'IMAGE' as const,
  userId: '1',
  insertedAt: '2023-01-01',
  updatedAt: '2023-01-01',
  formats: [
    {
      name: 'preview_200',
      url: 'http://example.com/file.jpg',
      type: 'image' as const,
      availability: { status: 'ready' as const },
    },
  ],
  usage: hasUsage
    ? [
        {
          usage: 'ARTICLE_CONTENT' as const,
          article: { id: '1', title: 'Article Title', previewImageFile: null },
        },
      ]
    : [],
  parentDirectory: { id: '1', name: 'My Folder' },
});

describe('profile/deleteUserProfilePage/components/FileSelection', () => {
  const mockFiles = [
    createMockFile('1', 'photo.jpg'),
    createMockFile('2', 'image.png'),
    createMockFile('3', 'document.pdf', false),
  ];

  it('should render null when no files provided', () => {
    const screen = render(
      <FileSelection files={[]} selectedFiles={[]} onSelectFiles={vi.fn()} />
    );
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('should render table with file information', () => {
    const screen = render(
      <FileSelection
        files={mockFiles}
        selectedFiles={[]}
        onSelectFiles={vi.fn()}
      />
    );

    expect(screen.getByText('photo.jpg')).toBeVisible();
    expect(screen.getByText('image.png')).toBeVisible();
    expect(screen.getByText('document.pdf')).toBeVisible();
    expect(screen.getAllByText('My Folder')[0]).toBeVisible();
  });

  it('should show file usage as links', () => {
    const screen = render(
      <FileSelection
        files={mockFiles}
        selectedFiles={[]}
        onSelectFiles={vi.fn()}
      />
    );

    const links = screen.getAllByRole('link', { name: 'Article Title' });
    expect(links.length).toBeGreaterThan(0);
  });

  it('should select individual file when checkbox clicked', async () => {
    const fireEvent = userEvent.setup();
    const onSelectFiles = vi.fn();
    const screen = render(
      <FileSelection
        files={mockFiles}
        selectedFiles={[]}
        onSelectFiles={onSelectFiles}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await fireEvent.click(checkboxes[1]); // First file (skip "select all")

    await waitFor(() => {
      expect(onSelectFiles).toHaveBeenCalledWith([mockFiles[0]]);
    });
  });

  it('should deselect file when already selected', async () => {
    const fireEvent = userEvent.setup();
    const onSelectFiles = vi.fn();
    const screen = render(
      <FileSelection
        files={mockFiles}
        selectedFiles={[mockFiles[0]]}
        onSelectFiles={onSelectFiles}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await fireEvent.click(checkboxes[1]); // First file

    await waitFor(() => {
      expect(onSelectFiles).toHaveBeenCalledWith([]);
    });
  });

  it('should select all files when select-all checkbox clicked', async () => {
    const fireEvent = userEvent.setup();
    const onSelectFiles = vi.fn();
    const screen = render(
      <FileSelection
        files={mockFiles}
        selectedFiles={[]}
        onSelectFiles={onSelectFiles}
      />
    );

    const selectAllCheckbox = screen.getByLabelText('Alle Dateien übergeben');
    await fireEvent.click(selectAllCheckbox);

    await waitFor(() => {
      expect(onSelectFiles).toHaveBeenCalledWith(mockFiles);
    });
  });

  it('should deselect all files when select-all clicked with all selected', async () => {
    const fireEvent = userEvent.setup();
    const onSelectFiles = vi.fn();
    const screen = render(
      <FileSelection
        files={mockFiles}
        selectedFiles={mockFiles}
        onSelectFiles={onSelectFiles}
      />
    );

    const selectAllCheckbox = screen.getByLabelText('Alle Dateien übergeben');
    await fireEvent.click(selectAllCheckbox);

    await waitFor(() => {
      expect(onSelectFiles).toHaveBeenCalledWith([]);
    });
  });

  it('should reflect selected state in checkboxes', () => {
    const screen = render(
      <FileSelection
        files={mockFiles}
        selectedFiles={[mockFiles[0], mockFiles[1]]}
        onSelectFiles={vi.fn()}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[1]).toBeChecked(); // First file
    expect(checkboxes[2]).toBeChecked(); // Second file
    expect(checkboxes[3]).not.toBeChecked(); // Third file
  });
});
