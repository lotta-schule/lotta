import React from 'react';
import { render, cleanup, waitFor, TestFileExplorerContextProvider } from 'test/util';
import { FileToolbar } from './FileToolbar';
import { getPrivateAndPublicFiles, SomeUser, adminGroup } from 'test/fixtures';
import { DirectoryModel, FileModel } from 'model';
import { defaultState } from './context/FileExplorerContext';

const user = SomeUser;
const filesAndDirectories = getPrivateAndPublicFiles(user);

afterEach(cleanup);

describe('component/fileExplorer/FileToolbar', () => {

    describe('in the root directory', () => {

      it('should render the toolbar', async done => {

          const { findByTestId } = render(
              (
                  <TestFileExplorerContextProvider>
                      <FileToolbar />
                  </TestFileExplorerContextProvider>
              ),
            { }, { currentUser: user }
          );
          await findByTestId('FileExplorerToolbarPath');
          done();
      });


      it('should show the FileDetailInfo button, and not show the other buttons', async done => {

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
            expect(queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeNull();
            expect(queryByTestId('FileExplorerDetailViewButton')).toBeVisible();
          });
          done();
      });

      it('should show the FileDetailInfo button, but also the CreateDirectoryButton for a admin user', async done => {

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
              expect(queryByTestId('FileExplorerDetailViewButton')).toBeVisible();
          });
          done();
      });

    });



    describe('within an own private directory', () => {

        const directory = filesAndDirectories.find(fOD => (fOD as DirectoryModel).name === 'Logos') as DirectoryModel;
        const state: Partial<typeof defaultState> =
            {
                currentPath: [{ id: null }, directory]
            };

      it('should render the toolbar and show the path', async done => {

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
          done();
      });


      it('should show the FileDetailInfo button, the upload button and the create directory button, but hide the others', async done => {

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
          done();
      });

      describe('when a file is selected', () => {
          const stateWithFileSelected: typeof state = {
              ...state,
              markedFiles: (filesAndDirectories.filter(f => (f as FileModel).filename ===  'Dateiname.jpg') as FileModel[])
          };

          it('should show the FileDetailInfo button, the upload button and the create directory button, but hide the others', async done => {

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
              done();
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

            it('should render the toolbar and show the path', async done => {

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
                done();
            });


            it('should show the FileDetailInfo button, but hide the others', async done => {

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
                done();
            });

            describe('when a file is selected', () => {
                const stateWithFileSelected: typeof state = {
                    ...state,
                    markedFiles: (filesAndDirectories.filter(f => (f as FileModel).filename ===  'Dateiname.jpg') as FileModel[])
                };

                it('should show the FileDetailInfo button, the upload button and the create directory button, but hide the others', async done => {

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
                    done();
                });

            });
        });

        describe('as admin', () => {

            const adminUser = { ...user, groups: [adminGroup] };

            it('should render the toolbar and show the path', async done => {

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
                done();
            });


            it('should show the FileDetailInfo button, but hide the others', async done => {

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
                done();
            });

            describe('when a file is selected', () => {
                const stateWithFileSelected: typeof state = {
                    ...state,
                    markedFiles: (filesAndDirectories.filter(f => (f as FileModel).filename ===  'Dateiname.jpg') as FileModel[])
                };

                it('should show the FileDetailInfo button, the upload button and the create directory button, but hide the others', async done => {

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
                    done();
                });

            });
        });
    });

});
