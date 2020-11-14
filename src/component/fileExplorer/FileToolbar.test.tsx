import React from 'react';
import { render, cleanup, waitFor, TestFileExplorerContextProvider } from 'test/util';
import { FileToolbar } from './FileToolbar';
import { getPrivateAndPublicFiles, SomeUser, adminGroup } from 'test/fixtures';
import { DirectoryModel, FileModel } from 'model';
import { defaultState, FileExplorerMode } from './context/FileExplorerContext';

const user = SomeUser;
const filesAndDirectories = getPrivateAndPublicFiles(user);

afterEach(cleanup);

describe('component/fileExplorer/FileToolbar', () => {

    describe('in the root directory', () => {

      it('should render the toolbar', async () => {

          const { findByTestId } = render(
              (
                  <TestFileExplorerContextProvider>
                      <FileToolbar />
                  </TestFileExplorerContextProvider>
              ),
            { }, { currentUser: user }
          );
          await findByTestId('FileExplorerToolbarPath');
      });


      it('show only the CreateDirectoryButton for a non-admin user', async () => {

          const { queryByTestId, findByTestId } = render(
              (
                  <TestFileExplorerContextProvider>
                      <FileToolbar />
                  </TestFileExplorerContextProvider>
              ),
            { }, { currentUser: user }
          );
          await findByTestId('FileExplorerToolbarPath');
          await waitFor(() => {
            expect(queryByTestId('FileExplorerToolbarNewUploadButton')).toBeNull();
            expect(queryByTestId('FileExplorerToolbarMoveFileButton')).toBeNull();
            expect(queryByTestId('FileExplorerToolbarDeleteFileButton')).toBeNull();
            expect(queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeVisible();
            expect(queryByTestId('FileExplorerDetailViewButton')).not.toBeVisible();
          });
      });

      it('show only the CreateDirectoryButton for a admin user', async () => {

          const { queryByTestId, findByTestId } = render(
              (
                  <TestFileExplorerContextProvider>
                      <FileToolbar />
                  </TestFileExplorerContextProvider>
              ),
            { }, { currentUser: { ...user, groups: [adminGroup] } }
          );
          await findByTestId('FileExplorerToolbarPath');
          await waitFor(() => {
              expect(queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeVisible();
              expect(queryByTestId('FileExplorerToolbarNewUploadButton')).not.toBeVisible();
              expect(queryByTestId('FileExplorerToolbarMoveFileButton')).not.toBeVisible();
              expect(queryByTestId('FileExplorerToolbarDeleteFileButton')).not.toBeVisible();
              expect(queryByTestId('FileExplorerDetailViewButton')).not.toBeVisible();
          });
      });

    });



    describe('within an own private directory', () => {

        const directory = filesAndDirectories.find(fOD => (fOD as DirectoryModel).name === 'Logos') as DirectoryModel;
        const state: Partial<typeof defaultState> =
            {
                currentPath: [{ id: null }, directory]
            };

      it('should render the toolbar and show the path', async () => {

          const { queryByTestId } = render(
              (
                  <TestFileExplorerContextProvider defaultValue={state}>
                      <FileToolbar />
                  </TestFileExplorerContextProvider>
              ),
            { }, { currentUser: user }
          );
          await waitFor(() => {
              expect(queryByTestId('FileExplorerToolbarPath')).toBeVisible();
              expect(queryByTestId('FileExplorerToolbarPath')).toHaveTextContent('/Logos');
          });
      });


      it('should show the FileDetailInfo button, the upload button and the create directory button, but hide the others', async () => {

          const { queryByTestId } = render(
              (
                  <TestFileExplorerContextProvider defaultValue={state}>
                      <FileToolbar />
                  </TestFileExplorerContextProvider>
              ),
            { }, { currentUser: user }
          );
          await waitFor(() => {
              expect(queryByTestId('FileExplorerToolbarPath')).toBeVisible();
              expect(queryByTestId('FileExplorerToolbarNewUploadButton')).toBeVisible();
              expect(queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeVisible();
              expect(queryByTestId('FileExplorerDetailViewButton')).toBeVisible();
              expect(queryByTestId('FileExplorerToolbarMoveFileButton')).not.toBeVisible();
              expect(queryByTestId('FileExplorerToolbarDeleteFileButton')).not.toBeVisible();
          });
      });

      it('should not show the FileDetailInfo button if a file is being selected', async () => {

          const { queryByTestId } = render(
              (
                  <TestFileExplorerContextProvider defaultValue={{...state, mode: FileExplorerMode.Select }}>
                      <FileToolbar />
                  </TestFileExplorerContextProvider>
              ),
            { }, { currentUser: user }
          );
          await waitFor(() => {
              expect(queryByTestId('FileExplorerToolbarPath')).toBeVisible();
              expect(queryByTestId('FileExplorerToolbarNewUploadButton')).toBeVisible();
              expect(queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeVisible();
              expect(queryByTestId('FileExplorerDetailViewButton')).toBeVisible();
              expect(queryByTestId('FileExplorerToolbarMoveFileButton')).not.toBeVisible();
              expect(queryByTestId('FileExplorerToolbarDeleteFileButton')).not.toBeVisible();
          });
      });


      describe('when a file is selected', () => {
          const stateWithFileSelected: typeof state = {
              ...state,
              markedFiles: (filesAndDirectories.filter(f => (f as FileModel).filename ===  'Dateiname.jpg') as FileModel[])
          };

          it('should show the FileDetailInfo button, the upload button and the create directory button, but hide the others', async () => {

              const { queryByTestId } = render(
                  (
                      <TestFileExplorerContextProvider defaultValue={stateWithFileSelected}>
                          <FileToolbar />
                      </TestFileExplorerContextProvider>
                  ),
                { }, { currentUser: user }
              );
              await waitFor(() => {
                  expect(queryByTestId('FileExplorerToolbarPath')).toBeVisible();
                  expect(queryByTestId('FileExplorerToolbarNewUploadButton')).toBeVisible();
                  expect(queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeVisible();
                  expect(queryByTestId('FileExplorerDetailViewButton')).toBeVisible();
                  expect(queryByTestId('FileExplorerToolbarMoveFileButton')).toBeVisible();
                  expect(queryByTestId('FileExplorerToolbarDeleteFileButton')).toBeVisible();
              });
          });

      });


    });

    describe('within a public directory', () => {

        const directory = filesAndDirectories.find(fOD => (fOD as DirectoryModel).name === 'Schulweit') as DirectoryModel;
        const state: Partial<typeof defaultState> =
            {
                currentPath: [{ id: null }, directory]
            };

        describe('as non-admin', () => {

            it('should render the toolbar and show the path', async () => {

                const { queryByTestId } = render(
                    (
                        <TestFileExplorerContextProvider defaultValue={state}>
                            <FileToolbar />
                        </TestFileExplorerContextProvider>
                    ),
                  { }, { currentUser: user }
                );
                await waitFor(() => {
                    expect(queryByTestId('FileExplorerToolbarPath')).toBeVisible();
                    expect(queryByTestId('FileExplorerToolbarPath')).toHaveTextContent('/Schulweit');
                });
            });


            it('should show the FileDetailInfo button, but hide the others', async () => {

                const { queryByTestId } = render(
                    (
                        <TestFileExplorerContextProvider defaultValue={state}>
                            <FileToolbar />
                        </TestFileExplorerContextProvider>
                    ),
                  { }, { currentUser: user }
                );
                await waitFor(() => {
                    expect(queryByTestId('FileExplorerToolbarPath')).toBeVisible();
                    expect(queryByTestId('FileExplorerToolbarNewUploadButton')).toBeNull();
                    expect(queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeNull();
                    expect(queryByTestId('FileExplorerDetailViewButton')).toBeVisible();
                    expect(queryByTestId('FileExplorerToolbarMoveFileButton')).toBeNull();
                    expect(queryByTestId('FileExplorerToolbarDeleteFileButton')).toBeNull();
                });
            });

            describe('when a file is selected', () => {
                const stateWithFileSelected: typeof state = {
                    ...state,
                    markedFiles: (filesAndDirectories.filter(f => (f as FileModel).filename ===  'Dateiname.jpg') as FileModel[])
                };

                it('should show the FileDetailInfo button, the upload button and the create directory button, but hide the others', async () => {

                    const { queryByTestId } = render(
                        (
                            <TestFileExplorerContextProvider defaultValue={stateWithFileSelected}>
                                <FileToolbar />
                            </TestFileExplorerContextProvider>
                        ),
                      { }, { currentUser: user }
                    );
                    await waitFor(() => {
                        expect(queryByTestId('FileExplorerToolbarPath')).toBeVisible();
                        expect(queryByTestId('FileExplorerToolbarNewUploadButton')).toBeNull();
                        expect(queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeNull();
                        expect(queryByTestId('FileExplorerDetailViewButton')).toBeVisible();
                        expect(queryByTestId('FileExplorerToolbarMoveFileButton')).toBeNull();
                        expect(queryByTestId('FileExplorerToolbarDeleteFileButton')).toBeNull();
                    });
                });

            });
        });

        describe('as admin', () => {

            const adminUser = { ...user, groups: [adminGroup] };

            it('should render the toolbar and show the path', async () => {

                const { queryByTestId } = render(
                    (
                        <TestFileExplorerContextProvider defaultValue={state}>
                            <FileToolbar />
                        </TestFileExplorerContextProvider>
                    ),
                  { }, { currentUser: adminUser }
                );
                await waitFor(() => {
                    expect(queryByTestId('FileExplorerToolbarPath')).toBeVisible();
                    expect(queryByTestId('FileExplorerToolbarPath')).toHaveTextContent('/Schulweit');
                });
            });


            it('should show the FileDetailInfo button, but hide the others', async () => {

                const { queryByTestId } = render(
                    (
                        <TestFileExplorerContextProvider defaultValue={state}>
                            <FileToolbar />
                        </TestFileExplorerContextProvider>
                    ),
                  { }, { currentUser: adminUser }
                );
                await waitFor(() => {
                    expect(queryByTestId('FileExplorerToolbarPath')).toBeVisible();
                    expect(queryByTestId('FileExplorerToolbarNewUploadButton')).toBeVisible();
                    expect(queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeVisible();
                    expect(queryByTestId('FileExplorerDetailViewButton')).toBeVisible();
                    expect(queryByTestId('FileExplorerToolbarMoveFileButton')).not.toBeVisible();
                    expect(queryByTestId('FileExplorerToolbarDeleteFileButton')).not.toBeVisible();
                });
            });

            describe('when a file is selected', () => {
                const stateWithFileSelected: typeof state = {
                    ...state,
                    markedFiles: (filesAndDirectories.filter(f => (f as FileModel).filename ===  'Dateiname.jpg') as FileModel[])
                };

                it('should show the FileDetailInfo button, the upload button and the create directory button, but hide the others', async () => {

                    const { queryByTestId } = render(
                        (
                            <TestFileExplorerContextProvider defaultValue={stateWithFileSelected}>
                                <FileToolbar />
                            </TestFileExplorerContextProvider>
                        ),
                      { }, { currentUser: adminUser }
                    );
                    await waitFor(() => {
                        expect(queryByTestId('FileExplorerToolbarPath')).toBeVisible();
                        expect(queryByTestId('FileExplorerToolbarNewUploadButton')).toBeVisible();
                        expect(queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeVisible();
                        expect(queryByTestId('FileExplorerDetailViewButton')).toBeVisible();
                        expect(queryByTestId('FileExplorerToolbarMoveFileButton')).toBeVisible();
                        expect(queryByTestId('FileExplorerToolbarDeleteFileButton')).toBeVisible();
                    });
                });

            });
        });
    });

});
