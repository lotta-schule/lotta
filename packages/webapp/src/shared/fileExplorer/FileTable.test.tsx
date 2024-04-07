import * as React from 'react';
import { render, TestFileExplorerContextProvider, waitFor } from 'test/util';
import {
  SomeUser,
  movieFile,
  logosDirectory,
  podcastsDirectory,
  imageFile,
  otherImageFile,
  documentFile,
  convertedDocumentFile,
  audioFile,
  powerpointFile,
  profilDirectory,
} from 'test/fixtures';
import { FileTable } from './FileTable';
import { defaultState, FileExplorerMode } from './context/FileExplorerContext';
import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import userEvent from '@testing-library/user-event';

describe('shared/fileExplorer/FileTable', () => {
  const parentDirectory = { ...profilDirectory, user: SomeUser };
  const directories = [
    ...[logosDirectory, podcastsDirectory].map((d) => ({
      ...d,
      user: SomeUser,
      parentDirectory,
    })),
  ];

  const files = [
    imageFile,
    otherImageFile,
    documentFile,
    convertedDocumentFile,
    movieFile,
    audioFile,
    powerpointFile,
  ].map((f) => ({
    ...f,
    user: SomeUser,
    userId: SomeUser.id,
    parentDirectory,
  }));
  // sorted: movieFile, otherImageFile, convertedDocumentFile, imageFile, audioFile, documentFile, powerpointFile

  const mocks = [
    {
      request: {
        query: GetDirectoriesAndFilesQuery,
        variables: { parentDirectoryId: parentDirectory.id },
      },
      result: {
        data: {
          files,
          directories,
        },
      },
    },
  ];

  it('should render', () => {
    render(<FileTable />);
  });

  describe('with a parent directory', () => {
    describe('list all files', () => {
      it('should show the correct amount of rows', async () => {
        const screen = render(
          <TestFileExplorerContextProvider
            defaultValue={{
              currentPath: [{ id: null }, parentDirectory],
            }}
          >
            <FileTable />
          </TestFileExplorerContextProvider>,
          {},
          { currentUser: SomeUser, additionalMocks: mocks }
        );
        await waitFor(() => {
          expect(screen.getAllByRole('row')).toHaveLength(10);
        });
      });

      it('should show select all checkbox when SelectMultiple is enabled', async () => {
        const fireEvent = userEvent.setup();
        let state: typeof defaultState = {
          ...defaultState,
          currentPath: [{ id: null }, parentDirectory],
          mode: FileExplorerMode.SelectMultiple,
        };
        const onUpdate = vi.fn((_state) => (state = _state));
        const screen = render(
          <TestFileExplorerContextProvider
            defaultValue={state}
            onUpdateState={onUpdate}
          >
            <FileTable />
          </TestFileExplorerContextProvider>,
          {},
          { currentUser: SomeUser, additionalMocks: mocks }
        );
        await waitFor(() => {
          expect(
            screen.queryByRole('checkbox', { name: /alle wählen/i })
          ).not.toBeNull();
        });
        await fireEvent.click(
          screen.getByRole('checkbox', { name: /alle wählen/i })
        );
        expect(onUpdate).toHaveBeenCalled();
        expect(state.selectedFiles).toHaveLength(7);
      });

      describe('marking files', () => {
        it('should mark a file on click', async () => {
          const fireEvent = userEvent.setup();
          let state: typeof defaultState = {
            ...defaultState,
            currentPath: [{ id: null }, parentDirectory],
          };
          const onUpdate = vi.fn((_state) => (state = _state));
          const screen = render(
            <TestFileExplorerContextProvider
              defaultValue={state}
              onUpdateState={onUpdate}
            >
              <FileTable />
            </TestFileExplorerContextProvider>,
            {},
            { currentUser: SomeUser, additionalMocks: mocks }
          );
          await waitFor(() => {
            expect(
              screen.getByRole('row', { name: /Dateiname.jpg/ })
            ).toBeVisible();
          });
          await fireEvent.click(
            screen.getByRole('row', { name: /Dateiname.jpg/ })
          );
          expect(onUpdate).toHaveBeenCalled();
          await waitFor(() => {
            expect(state.markedFiles).toHaveLength(1);
            expect(state.markedFiles[0]).toHaveProperty('id', imageFile.id);
          });
        });

        it('should mark a next file on keyboard up', async () => {
          const fireEvent = userEvent.setup();
          let state: typeof defaultState = {
            ...defaultState,
            currentPath: [{ id: null }, parentDirectory],
          };
          const onUpdate = vi.fn((_state) => (state = _state));
          const screen = render(
            <TestFileExplorerContextProvider
              defaultValue={state}
              onUpdateState={onUpdate}
            >
              <FileTable />
            </TestFileExplorerContextProvider>,
            {},
            { currentUser: SomeUser, additionalMocks: mocks }
          );
          await waitFor(() => {
            expect(
              screen.getByRole('row', { name: /Kaenguru.wav/ })
            ).toBeVisible();
          });
          await fireEvent.click(
            screen.getByRole('row', { name: /Kaenguru.wav/ })
          );
          await fireEvent.type(screen.container, '{ArrowUp}');
          expect(onUpdate).toHaveBeenCalled();
          await waitFor(() => {
            expect(state.markedFiles).toHaveLength(1);
            expect(state.markedFiles[0]).toHaveProperty('id', imageFile.id);
          });
        });

        it('should ALSO mark a next file on SHIFT keyboard up', async () => {
          const fireEvent = userEvent.setup();
          let state: typeof defaultState = {
            ...defaultState,
            currentPath: [{ id: null }, parentDirectory],
          };
          const onUpdate = vi.fn((_state) => (state = _state));
          const screen = render(
            <TestFileExplorerContextProvider
              defaultValue={state}
              onUpdateState={onUpdate}
            >
              <FileTable />
            </TestFileExplorerContextProvider>,
            {},
            { currentUser: SomeUser, additionalMocks: mocks }
          );
          await waitFor(() => {
            expect(
              screen.getByRole('row', { name: /Kaenguru.wav/ })
            ).toBeVisible();
          });
          await fireEvent.click(
            screen.getByRole('row', { name: /Kaenguru.wav/ })
          );
          await fireEvent.type(screen.container, '{Shift>}{ArrowUp}{/Shift}');
          expect(onUpdate).toHaveBeenCalled();
          await waitFor(() => {
            expect(state.markedFiles).toHaveLength(2);
            expect(state.markedFiles[0]).toHaveProperty('id', audioFile.id);
            expect(state.markedFiles[1]).toHaveProperty('id', imageFile.id);
          });
        });

        it('should mark a next file on keyboard down', async () => {
          const fireEvent = userEvent.setup();
          let state: typeof defaultState = {
            ...defaultState,
            currentPath: [{ id: null }, parentDirectory],
            markedFiles: files.filter((f) => f.filename === 'Dateiname.jpg'),
          };
          const onUpdate = vi.fn((_state) => (state = _state));
          const screen = render(
            <TestFileExplorerContextProvider
              defaultValue={state}
              onUpdateState={onUpdate}
            >
              <FileTable />
            </TestFileExplorerContextProvider>,
            {},
            { currentUser: SomeUser, additionalMocks: mocks }
          );
          await waitFor(() => {
            expect(
              screen.getByRole('row', { name: /Dateiname.jpg/ })
            ).toBeVisible();
          });
          await fireEvent.click(
            screen.getByRole('row', { name: /Dateiname.jpg/ })
          );
          await fireEvent.type(screen.container, '{ArrowDown}');
          expect(onUpdate).toHaveBeenCalled();
          await waitFor(() => {
            expect(state.markedFiles).toHaveLength(1);
            expect(state.markedFiles[0]).toHaveProperty('id', audioFile.id);
          });
        });

        it('should ALSO mark a next file on SHIFT keyboard down', async () => {
          const fireEvent = userEvent.setup();
          let state: typeof defaultState = {
            ...defaultState,
            currentPath: [{ id: null }, parentDirectory],
            markedFiles: files.filter((f) => f.filename === 'Dateiname.jpg'),
          };
          const onUpdate = vi.fn((_state) => (state = _state));
          const screen = render(
            <TestFileExplorerContextProvider
              defaultValue={state}
              onUpdateState={onUpdate}
            >
              <FileTable />
            </TestFileExplorerContextProvider>,
            {},
            { currentUser: SomeUser, additionalMocks: mocks }
          );
          await waitFor(() => {
            expect(
              screen.getByRole('row', { name: /Dateiname.jpg/ })
            ).toBeVisible();
          });
          await fireEvent.click(
            screen.getByRole('row', { name: /Dateiname.jpg/ })
          );
          await fireEvent.type(screen.container, '{Shift>}{ArrowDown}{/Shift}');
          expect(onUpdate).toHaveBeenCalled();
          await waitFor(() => {
            expect(state.markedFiles).toHaveLength(2);
            expect(state.markedFiles[0]).toHaveProperty('id', imageFile.id);
            expect(state.markedFiles[1]).toHaveProperty('id', audioFile.id);
          });
        });

        it('should mark all files on SHIFT first file and last file', async () => {
          const fireEvent = userEvent.setup();
          let state: typeof defaultState = {
            ...defaultState,
            currentPath: [{ id: null }, parentDirectory],
          };
          const onUpdate = vi.fn((_state) => (state = _state));
          const screen = render(
            <TestFileExplorerContextProvider
              defaultValue={state}
              onUpdateState={onUpdate}
            >
              <FileTable />
            </TestFileExplorerContextProvider>,
            {},
            { currentUser: SomeUser, additionalMocks: mocks }
          );
          await waitFor(() => {
            expect(
              screen.getByRole('row', { name: /Amelie.mp4/ })
            ).toBeVisible();
          });
          await fireEvent.click(
            screen.getByRole('row', { name: /Amelie.mp4/ })
          );

          await fireEvent.keyboard('{Shift>}');
          await fireEvent.click(
            screen.getByRole('row', { name: /praesi.ppt/ })
          );
          await fireEvent.keyboard('{/Shift}');
          expect(onUpdate).toHaveBeenCalled();
          await waitFor(() => {
            expect(state.markedFiles).toHaveLength(7);
          });
        });

        it('should mark any second file by holding META on click', async () => {
          const fireEvent = userEvent.setup();
          let state: typeof defaultState = {
            ...defaultState,
            currentPath: [{ id: null }, parentDirectory],
          };
          const onUpdate = vi.fn((_state) => (state = _state));
          const screen = render(
            <TestFileExplorerContextProvider
              defaultValue={state}
              onUpdateState={onUpdate}
            >
              <FileTable />
            </TestFileExplorerContextProvider>,
            {},
            { currentUser: SomeUser, additionalMocks: mocks }
          );
          await waitFor(() => {
            expect(
              screen.getByRole('row', { name: /Dateiname.jpg/ })
            ).toBeVisible();
          });
          await fireEvent.click(
            screen.getByRole('row', { name: /Dateiname.jpg/ })
          );

          await fireEvent.keyboard('{Meta>}');
          await fireEvent.click(
            screen.getByRole('row', { name: /amelie.mp4/i })
          );
          await fireEvent.keyboard('{/Meta}');
          expect(onUpdate).toHaveBeenCalled();
          await waitFor(() => {
            expect(state.markedFiles).toHaveLength(2);
            expect(state.markedFiles[0]).toHaveProperty('id', imageFile.id);
            expect(state.markedFiles[1]).toHaveProperty('id', movieFile.id);
          });
        });

        it('should do nothing when arrow up is pressed while first file is selected', async () => {
          const fireEvent = userEvent.setup();
          let state: typeof defaultState = {
            ...defaultState,
            currentPath: [{ id: null }, parentDirectory],
          };
          const screen = render(
            <TestFileExplorerContextProvider
              defaultValue={state}
              onUpdateState={(s) => (state = s)}
            >
              <FileTable />
            </TestFileExplorerContextProvider>,
            {},
            { currentUser: SomeUser, additionalMocks: mocks }
          );
          await waitFor(() => {
            expect(
              screen.getByRole('row', { name: /amelie.mp4/i })
            ).toBeVisible();
          });
          await fireEvent.click(
            screen.getByRole('row', { name: /amelie.mp4/i })
          );
          await fireEvent.type(screen.container, '{ArrowUp}');
          await waitFor(() => {
            expect(state.markedFiles).toHaveLength(1);
            expect(state.markedFiles[0]).toHaveProperty('id', movieFile.id);
          });
        });

        it('should do nothing when arrow down is pressed while last file is selected', async () => {
          const fireEvent = userEvent.setup();
          let state: typeof defaultState = {
            ...defaultState,
            currentPath: [{ id: null }, parentDirectory],
          };
          const screen = render(
            <TestFileExplorerContextProvider
              defaultValue={state}
              onUpdateState={(s) => (state = s)}
            >
              <FileTable />
            </TestFileExplorerContextProvider>,
            {},
            { currentUser: SomeUser, additionalMocks: mocks }
          );
          await waitFor(() => {
            expect(
              screen.getByRole('row', { name: /praesi.ppt/i })
            ).toBeVisible();
          });
          await fireEvent.click(
            screen.getByRole('row', { name: /praesi.ppt/i })
          );
          await fireEvent.type(screen.container, '{ArrowDown}');
          await waitFor(() => {
            expect(state.markedFiles).toHaveLength(1);
            expect(state.markedFiles[0]).toHaveProperty(
              'id',
              powerpointFile.id
            );
          });
        });
      });
    });
  });
});
