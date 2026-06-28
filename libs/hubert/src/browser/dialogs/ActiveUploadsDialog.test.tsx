import * as React from 'react';
import { render, userEvent, waitFor, within } from '#/test-utils';
import { Upload } from '../upload/useUploadClient';
import {
  ActiveUploadsDialog,
  ActiveUploadsDialogProps,
} from './ActiveUploadsDialog';
import { FileSize } from '../../util';
import {
  TestBrowserWrapper,
  TestBrowserWrapperProps,
  fixtures,
} from '#/test-utils';

const parentNode = fixtures.getNode('8');

const uploadingItem = {
  status: 'uploading',
  file: new File([''], 'test.txt', { type: 'text/plain' }),
  error: null,
  startTime: Date.now(),
  progress: 50,
  transferSpeed: 2.5,
  transferedBytes: 123,
  parentNode,
} as Upload;

const errorItem = {
  status: 'error',
  file: new File([''], 'error.txt', { type: 'text/plain' }),
  error: new Error('Upload failed'),
  startTime: Date.now(),
  progress: 0,
  transferSpeed: 0,
  transferedBytes: 0,
  parentNode,
} as Upload;

const doneItem = {
  status: 'done',
  file: new File([''], 'success.txt', { type: 'text/plain' }),
  error: null,
  startTime: new Date().getTime() - 1000 * 60 * 60,
  endTime: new Date(),
  progress: 100,
  transferSpeed: 0,
  transferedBytes: 0,
  parentNode,
} as Upload;

const uploadClient = {
  currentUploads: [uploadingItem, errorItem, doneItem],
  addFile: vi.fn<() => void>(),
  currentProgress: 10,
  hasErrors: false,
  isUploading: true,
  isSuccess: false,
};

const WrappedActiveUploadsDialog = ({
  isOpen,
  onRequestClose,
  uploadClient: uClient = uploadClient,
  ...props
}: TestBrowserWrapperProps & ActiveUploadsDialogProps) => (
  <TestBrowserWrapper uploadClient={uClient} {...props}>
    <ActiveUploadsDialog isOpen={isOpen} onRequestClose={onRequestClose} />
  </TestBrowserWrapper>
);

describe('ActiveUploadsDialog', () => {
  it('should open and then close', async () => {
    const user = userEvent.setup();
    const onRequestClose = vi.fn<() => void>();
    const screen = render(
      <WrappedActiveUploadsDialog
        isOpen={false}
        onRequestClose={onRequestClose}
      />
    );

    expect(screen.queryByRole('dialog')).toBeNull();

    screen.rerender(
      <WrappedActiveUploadsDialog
        isOpen={true}
        onRequestClose={onRequestClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: /schließen/i }));

    expect(onRequestClose).toHaveBeenCalled();

    screen.rerender(
      <WrappedActiveUploadsDialog
        isOpen={false}
        onRequestClose={onRequestClose}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('should show each file list item with its parent node name', async () => {
    const screen = render(
      <WrappedActiveUploadsDialog isOpen onRequestClose={vi.fn<() => void>()} />
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    for (const { file } of uploadClient.currentUploads) {
      const fileListItem = screen.getByRole('listitem', { name: file.name });
      expect(fileListItem).toBeVisible();
      expect(within(fileListItem).getByText(parentNode.name)).toBeVisible();
    }
  });

  it('should render progress bar for uploading item', async () => {
    const screen = render(
      <WrappedActiveUploadsDialog isOpen onRequestClose={vi.fn<() => void>()} />
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    const fileListItem = screen.getByRole('listitem', {
      name: uploadingItem.file.name,
    });
    const progressBar = within(fileListItem).getByRole('progressbar', {
      name: `${uploadingItem.file.name} wird hochgeladen`,
    });
    expect(progressBar).toBeVisible();
    expect(progressBar).toHaveTextContent(`${Number(uploadingItem.progress)}%`);
    expect(
      within(fileListItem).getByText(
        new RegExp(`${new FileSize(uploadingItem.transferSpeed).humanize()}/s`)
      )
    ).toBeVisible();
    expect(
      within(fileListItem).getByText(`${Number(uploadingItem.progress)}%`)
    ).toBeVisible();
  });

  it('should render error icon and message for failed item', async () => {
    const screen = render(
      <WrappedActiveUploadsDialog isOpen onRequestClose={vi.fn<() => void>()} />
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    expect(screen.getByTestId('error-icon')).toBeVisible();
    expect(screen.getByText(errorItem.error!.message)).toBeVisible();
  });

  it('should render success icon for done item', async () => {
    const screen = render(
      <WrappedActiveUploadsDialog isOpen onRequestClose={vi.fn<() => void>()} />
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    expect(screen.getByTestId('success-icon')).toBeVisible();
  });
});
