import React from 'react';
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
                let state: typeof defaultState = {
                    ...defaultState,
                    currentPath: [{ id: null }, parentDirectory],
                    mode: FileExplorerMode.SelectMultiple,
                };
                const onUpdate = jest.fn((_state) => (state = _state));
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
                userEvent.click(
                    screen.getByRole('checkbox', { name: /alle wählen/i })
                );
                expect(onUpdate).toHaveBeenCalled();
                expect(state.selectedFiles).toHaveLength(7);
            });

            describe('marking files', () => {
                it('should mark a file on click', async () => {
                    let state: typeof defaultState = {
                        ...defaultState,
                        currentPath: [{ id: null }, parentDirectory],
                    };
                    const onUpdate = jest.fn((_state) => (state = _state));
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
                    userEvent.click(
                        screen.getByRole('row', { name: /Dateiname.jpg/ })
                    );
                    expect(onUpdate).toHaveBeenCalled();
                    await waitFor(() => {
                        expect(state.markedFiles).toHaveLength(1);
                        expect(state.markedFiles[0]).toHaveProperty(
                            'id',
                            imageFile.id
                        );
                    });
                });

                it('should mark a next file on keyboard up', async () => {
                    let state: typeof defaultState = {
                        ...defaultState,
                        currentPath: [{ id: null }, parentDirectory],
                    };
                    const onUpdate = jest.fn((_state) => (state = _state));
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
                    userEvent.click(
                        screen.getByRole('row', { name: /Kaenguru.wav/ })
                    );
                    userEvent.type(screen.container, '{arrowup}');
                    expect(onUpdate).toHaveBeenCalled();
                    await waitFor(() => {
                        expect(state.markedFiles).toHaveLength(1);
                        expect(state.markedFiles[0]).toHaveProperty(
                            'id',
                            imageFile.id
                        );
                    });
                });

                it('should ALSO mark a next file on SHIFT keyboard up', async () => {
                    let state: typeof defaultState = {
                        ...defaultState,
                        currentPath: [{ id: null }, parentDirectory],
                    };
                    const onUpdate = jest.fn((_state) => (state = _state));
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
                    userEvent.click(
                        screen.getByRole('row', { name: /Kaenguru.wav/ })
                    );
                    userEvent.type(screen.container, '{shift}{arrowup}');
                    expect(onUpdate).toHaveBeenCalled();
                    await waitFor(() => {
                        expect(state.markedFiles).toHaveLength(2);
                        expect(state.markedFiles[0]).toHaveProperty(
                            'id',
                            audioFile.id
                        );
                        expect(state.markedFiles[1]).toHaveProperty(
                            'id',
                            imageFile.id
                        );
                    });
                });

                it('should mark a next file on keyboard down', async () => {
                    let state: typeof defaultState = {
                        ...defaultState,
                        currentPath: [{ id: null }, parentDirectory],
                        markedFiles: files.filter(
                            (f) => f.filename === 'Dateiname.jpg'
                        ),
                    };
                    const onUpdate = jest.fn((_state) => (state = _state));
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
                    userEvent.click(
                        screen.getByRole('row', { name: /Dateiname.jpg/ })
                    );
                    userEvent.type(screen.container, '{arrowdown}');
                    expect(onUpdate).toHaveBeenCalled();
                    await waitFor(() => {
                        expect(state.markedFiles).toHaveLength(1);
                        expect(state.markedFiles[0]).toHaveProperty(
                            'id',
                            audioFile.id
                        );
                    });
                });

                it('should ALSO mark a next file on SHIFT keyboard down', async () => {
                    let state: typeof defaultState = {
                        ...defaultState,
                        currentPath: [{ id: null }, parentDirectory],
                        markedFiles: files.filter(
                            (f) => f.filename === 'Dateiname.jpg'
                        ),
                    };
                    const onUpdate = jest.fn((_state) => (state = _state));
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
                    userEvent.click(
                        screen.getByRole('row', { name: /Dateiname.jpg/ })
                    );
                    userEvent.type(screen.container, '{shift}{arrowdown}');
                    expect(onUpdate).toHaveBeenCalled();
                    await waitFor(() => {
                        expect(state.markedFiles).toHaveLength(2);
                        expect(state.markedFiles[0]).toHaveProperty(
                            'id',
                            imageFile.id
                        );
                        expect(state.markedFiles[1]).toHaveProperty(
                            'id',
                            audioFile.id
                        );
                    });
                });

                it('should mark all files on SHIFT first file and last file', async () => {
                    let state: typeof defaultState = {
                        ...defaultState,
                        currentPath: [{ id: null }, parentDirectory],
                    };
                    const onUpdate = jest.fn((_state) => (state = _state));
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
                    userEvent.click(
                        screen.getByRole('row', { name: /Amelie.mp4/ })
                    );
                    userEvent.click(
                        screen.getByRole('row', { name: /praesi.ppt/ }),
                        { shiftKey: true }
                    );
                    expect(onUpdate).toHaveBeenCalled();
                    await waitFor(() => {
                        expect(state.markedFiles).toHaveLength(7);
                    });
                });

                it('should mark any second file by holding META on click', async () => {
                    let state: typeof defaultState = {
                        ...defaultState,
                        currentPath: [{ id: null }, parentDirectory],
                    };
                    const onUpdate = jest.fn((_state) => (state = _state));
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
                    userEvent.click(
                        screen.getByRole('row', { name: /Dateiname.jpg/ })
                    );
                    userEvent.click(
                        screen.getByRole('row', { name: /amelie.mp4/i }),
                        { metaKey: true }
                    );
                    expect(onUpdate).toHaveBeenCalled();
                    await waitFor(() => {
                        expect(state.markedFiles).toHaveLength(2);
                        expect(state.markedFiles[0]).toHaveProperty(
                            'id',
                            imageFile.id
                        );
                        expect(state.markedFiles[1]).toHaveProperty(
                            'id',
                            movieFile.id
                        );
                    });
                });

                it('should do nothing when arrow up is pressed while first file is selected', async () => {
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
                    userEvent.click(
                        screen.getByRole('row', { name: /amelie.mp4/i })
                    );
                    userEvent.type(screen.container, '{arrowup}');
                    await waitFor(() => {
                        expect(state.markedFiles).toHaveLength(1);
                        expect(state.markedFiles[0]).toHaveProperty(
                            'id',
                            movieFile.id
                        );
                    });
                });

                it('should do nothing when arrow down is pressed while last file is selected', async () => {
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
                    userEvent.click(
                        screen.getByRole('row', { name: /praesi.ppt/i })
                    );
                    userEvent.type(screen.container, '{arrowdown}');
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
