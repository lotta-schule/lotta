import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Toolbar } from './Toolbar';
import {
  TestBrowserWrapper,
  TestBrowserWrapperProps,
  fixtures,
  userEvent,
} from 'test-utils';
import { Upload } from 'browser';

const defaultPath = fixtures.getPathForNode('8');

const WrappedToolbar = ({
  currentPath = defaultPath,
  ...props
}: TestBrowserWrapperProps) => (
  <TestBrowserWrapper currentPath={currentPath} {...props}>
    <Toolbar />
  </TestBrowserWrapper>
);

describe('browser/Toolbar', () => {
  it('renders component with correct elements', () => {
    const screen = render(<WrappedToolbar />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('calls onClick when "Zurück" button is clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    const screen = render(<WrappedToolbar onNavigate={onNavigate} />);

    await user.click(screen.getByTitle('Zurück'));
    expect(onNavigate).toHaveBeenCalled();
  });

  describe('Directory creation', () => {
    it('calls should show the "create directory" button when user can create a directory and set the currentAction on click', async () => {
      const user = userEvent.setup();
      const setCurrentAction = vi.fn();
      const screen = render(
        <WrappedToolbar
          createDirectory={vi.fn()}
          setCurrentAction={setCurrentAction}
        />
      );
      await user.click(screen.getByTitle('Ordner erstellen'));
      expect(setCurrentAction).toHaveBeenCalled();
    });

    it('should not show the button when user is not allowed to create a directory in his current path.', async () => {
      const canEdit = vi.fn(() => false);
      const screen = render(
        <WrappedToolbar
          createDirectory={vi.fn()}
          canEdit={canEdit}
          setCurrentAction={canEdit}
        />
      );

      await waitFor(() => {
        expect(canEdit).toHaveBeenCalledWith(defaultPath);
      });

      expect(screen.queryByTitle('Ordner erstellen')).toBeNull();
    });
  });

  describe('Upload', () => {
    const uploadClient = {
      currentUploads: [],
      addFile: vi.fn(),
      currentProgress: 0,
      hasErrors: false,
      isUploading: false,
      isSuccess: false,
      byState: { uploading: [], pending: [], done: [], error: [] },
    };

    describe('Upload new File', () => {
      it('should show the "upload file" button', async () => {
        const user = userEvent.setup();

        const screen = render(<WrappedToolbar uploadClient={uploadClient} />);
        expect(
          screen.getByRole('button', { name: /datei hochladen/i })
        ).toBeInTheDocument();

        await user.upload(
          screen
            .getByRole('button', { name: /datei hochladen/i })
            .querySelector('input[type="file"]')!,
          new File([''], 'test.txt', { type: 'text/plain' })
        );

        expect(uploadClient.addFile).toHaveBeenCalled();
      });

      it('should not show the upload button when in root', async () => {
        const screen = render(
          <WrappedToolbar currentPath={[]} uploadClient={uploadClient} />
        );
        expect(
          screen.queryByRole('button', { name: /datei hochladen/i })
        ).toBeNull();
      });

      it('should not show the upload button when the user is not allowed to edit parent directory', async () => {
        const canEdit = vi.fn(() => false);
        const screen = render(
          <WrappedToolbar canEdit={canEdit} uploadClient={uploadClient} />
        );
        expect(
          screen.queryByRole('button', { name: /datei hochladen/i })
        ).toBeNull();
      });
    });

    describe('See upload progress', () => {
      it('should not show the "uploading" button when no uploads are active', async () => {
        const screen = render(<WrappedToolbar uploadClient={uploadClient} />);
        expect(
          screen.queryByRole('button', {
            name: /es werden.*dateien hochgeladen/i,
          })
        ).toBeNull();
      });

      it('should show the current number of files uploading', async () => {
        const uploadClientUploads = [
          {
            status: 'uploading',
            file: new File([''], 'test.txt', { type: 'text/plain' }),
            error: null,
            startTime: Date.now(),
            progress: 5,
            transferSpeed: 0,
            transferedBytes: 0,
            parentNode: defaultPath.at(-1)!,
          },
          {
            status: 'uploading',
            file: new File([''], 'test.txt', { type: 'text/plain' }),
            error: null,
            startTime: Date.now(),
            progress: 15,
            transferSpeed: 0,
            transferedBytes: 0,
            parentNode: defaultPath.at(-1)!,
          },
        ] as Upload[];
        const uploadClient = {
          currentUploads: uploadClientUploads,
          addFile: vi.fn(),
          currentProgress: 10,
          hasErrors: false,
          isUploading: true,
          isSuccess: false,
          byState: {
            uploading: uploadClientUploads,
            pending: [],
            done: [],
            error: [],
          },
        };
        const screen = render(<WrappedToolbar uploadClient={uploadClient} />);
        expect(
          screen.getByRole('button', {
            name: /es werden 2 dateien hochgeladen/i,
          })
        ).toBeVisible();

        expect(screen.getByRole('progressbar')).toHaveAttribute(
          'aria-valuenow',
          '10'
        );
      });
    });

    describe('searching', () => {
      it('should not show left and right section when searchresults are shown', () => {
        const screen = render(
          <WrappedToolbar
            currentSearchResults={[fixtures.getPathForNode('8')]}
          />
        );
        const toolbarSections = screen
          .getByRole('toolbar')
          .querySelectorAll('section');
        expect(toolbarSections).toHaveLength(3);

        const [leftSection, _, rightSection] = toolbarSections;
        expect(leftSection).toHaveTextContent('Suche');
        expect(rightSection).toBeEmptyDOMElement();
      });
    });
  });
});
