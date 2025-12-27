import * as React from 'react';
import { render, userEvent, waitFor, within } from 'test-utils';
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
} from 'test-utils';

const parentNode = fixtures.getNode('8');

const uploadClient = {
  currentUploads: [
    {
      status: 'uploading',
      file: new File([''], 'test.txt', { type: 'text/plain' }),
      error: null,
      startTime: Date.now(),
      progress: 50,
      transferSpeed: 2.5,
      transferedBytes: 123,
      parentNode,
    },
    {
      status: 'error',
      file: new File([''], 'error.txt', { type: 'text/plain' }),
      error: new Error('Upload failed'),
      startTime: Date.now(),
      progress: 0,
      transferSpeed: 0,
      transferedBytes: 0,
      parentNode,
    },
    {
      status: 'done',
      file: new File([''], 'success.txt', { type: 'text/plain' }),
      error: null,
      startTime: new Date().getTime() - 1000 * 60 * 60,
      endTime: new Date(),
      progress: 100,
      transferSpeed: 0,
      transferedBytes: 0,
      parentNode,
    },
  ] as Upload[],
  addFile: vi.fn(),
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
    const onRequestClose = vi.fn();
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

  it('should render content correctly', async () => {
    const screen = render(
      <WrappedActiveUploadsDialog isOpen onRequestClose={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    for (const {
      file,
      status,
      progress,
      transferSpeed,
      parentNode,
      error,
    } of uploadClient.currentUploads) {
      const fileListItem = screen.getByRole('listitem', { name: file.name });
      expect(fileListItem).toBeVisible();

      if (status === 'uploading' || status === 'pending') {
        const progressBar = within(fileListItem).getByRole('progressbar', {
          name: `${file.name} wird hochgeladen`,
        });
        expect(progressBar).toBeVisible();
        expect(progressBar).toHaveTextContent(`${Number(progress)}%`);
      } else if (status === 'error') {
        const errorIcon = screen.getByTestId('error-icon');
        expect(errorIcon).toBeVisible();
        expect(screen.getByText(error!.message)).toBeVisible();
      } else if (status === 'done') {
        expect(screen.getByTestId('success-icon')).toBeVisible();
      }

      const parentNodeName = within(fileListItem).getByText(parentNode.name);
      expect(parentNodeName).toBeVisible();

      if (status === 'uploading') {
        expect(
          within(fileListItem).getByText(
            new RegExp(`${new FileSize(transferSpeed).humanize()}/s`)
          )
        ).toBeVisible();
        expect(
          within(fileListItem).getByText(`${Number(progress)}%`)
        ).toBeVisible();
      }
    }
  });
});
