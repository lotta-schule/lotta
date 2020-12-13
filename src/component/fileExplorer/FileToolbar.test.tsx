import React from 'react';
import { render, TestFileExplorerContextProvider } from 'test/util';
import { FileToolbar } from './FileToolbar';
import { getPrivateAndPublicFiles, SomeUser, adminGroup } from 'test/fixtures';
import { DirectoryModel, FileModel } from 'model';
import { defaultState, FileExplorerMode } from './context/FileExplorerContext';

const user = SomeUser;
const filesAndDirectories = getPrivateAndPublicFiles(user);

describe('component/fileExplorer/FileToolbar', () => {

    describe('in the root directory', () => {

      it('should render the toolbar', () => {

          const screen = render(
              (
                  <TestFileExplorerContextProvider>
                      <FileToolbar />
                  </TestFileExplorerContextProvider>
              ),
            { }, { currentUser: user }
          );
          expect(screen.getByTestId('FileExplorerToolbarPath')).toBeInTheDocument();
      });


      it('show only the CreateDirectoryButton for a non-admin user', () => {

          const screen = render(
              (
                  <TestFileExplorerContextProvider>
                      <FileToolbar />
                  </TestFileExplorerContextProvider>
              ),
            { }, { currentUser: user }
          );
          expect(screen.getByTestId('FileExplorerToolbarPath')).toBeInTheDocument();
          expect(screen.queryByTestId('FileExplorerToolbarNewUploadButton')).toBeNull();
          expect(screen.queryByTestId('FileExplorerToolbarMoveFileButton')).toBeNull();
          expect(screen.queryByTestId('FileExplorerToolbarDeleteFileButton')).toBeNull();
          expect(screen.queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeVisible();
          expect(screen.queryByTestId('FileExplorerDetailViewButton')).not.toBeVisible();
      });

      it('show only the CreateDirectoryButton for a admin user', async () => {

          const screen = render(
              (
                  <TestFileExplorerContextProvider>
                      <FileToolbar />
                  </TestFileExplorerContextProvider>
              ),
            { }, { currentUser: { ...user, groups: [adminGroup] } }
          );
          screen.getByTestId('FileExplorerToolbarPath');
          expect(screen.queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeVisible();
          expect(await screen.findByTestId('FileExplorerToolbarNewUploadButton')).not.toBeVisible();
          expect(screen.queryByTestId('FileExplorerToolbarMoveFileButton')).not.toBeVisible();
          expect(screen.queryByTestId('FileExplorerToolbarDeleteFileButton')).not.toBeVisible();
          expect(screen.queryByTestId('FileExplorerDetailViewButton')).not.toBeVisible();
      });

    });



    describe('within an own private directory', () => {

        const directory = filesAndDirectories.find(fOD => (fOD as DirectoryModel).name === 'Logos') as DirectoryModel;
        const state: Partial<typeof defaultState> =
            {
                currentPath: [{ id: null }, directory]
            };

      it('should render the toolbar and show the path', () => {

          const screen = render(
              (
                  <TestFileExplorerContextProvider defaultValue={state}>
                      <FileToolbar />
                  </TestFileExplorerContextProvider>
              ),
            { }, { currentUser: user }
          );
          expect(screen.queryByTestId('FileExplorerToolbarPath')).toBeVisible();
          expect(screen.queryByTestId('FileExplorerToolbarPath')).toHaveTextContent('/Logos');
      });


      it('should show the FileDetailInfo button, the upload button and the create directory button, but hide the others', async () => {

          const screen = render(
              (
                  <TestFileExplorerContextProvider defaultValue={state}>
                      <FileToolbar />
                  </TestFileExplorerContextProvider>
              ),
            { }, { currentUser: user }
          );
          expect(screen.queryByTestId('FileExplorerToolbarPath')).toBeVisible();
          expect(await screen.findByTestId('FileExplorerToolbarNewUploadButton')).toBeVisible();
          expect(screen.queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeVisible();
          expect(screen.queryByTestId('FileExplorerDetailViewButton')).toBeVisible();
          expect(screen.queryByTestId('FileExplorerToolbarMoveFileButton')).not.toBeVisible();
          expect(screen.queryByTestId('FileExplorerToolbarDeleteFileButton')).not.toBeVisible();
      });

      it('should not show the FileDetailInfo button if a file is being selected', async () => {

          const screen = render(
              (
                  <TestFileExplorerContextProvider defaultValue={{...state, mode: FileExplorerMode.Select }}>
                      <FileToolbar />
                  </TestFileExplorerContextProvider>
              ),
            { }, { currentUser: user }
          );
          expect(screen.queryByTestId('FileExplorerToolbarPath')).toBeVisible();
          expect(await screen.findByTestId('FileExplorerToolbarNewUploadButton')).toBeVisible();
          expect(screen.queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeVisible();
          expect(screen.queryByTestId('FileExplorerDetailViewButton')).toBeVisible();
          expect(screen.queryByTestId('FileExplorerToolbarMoveFileButton')).not.toBeVisible();
          expect(screen.queryByTestId('FileExplorerToolbarDeleteFileButton')).not.toBeVisible();
      });


      describe('when a file is selected', () => {
          const stateWithFileSelected: typeof state = {
              ...state,
              markedFiles: (filesAndDirectories.filter(f => (f as FileModel).filename ===  'Dateiname.jpg') as FileModel[])
          };

          it('should show the FileDetailInfo button, the upload button and the create directory button, but hide the others', async () => {

              const screen = render(
                  (
                      <TestFileExplorerContextProvider defaultValue={stateWithFileSelected}>
                          <FileToolbar />
                      </TestFileExplorerContextProvider>
                  ),
                { }, { currentUser: user }
              );
              expect(screen.queryByTestId('FileExplorerToolbarPath')).toBeVisible();
              expect(await screen.findByTestId('FileExplorerToolbarNewUploadButton')).toBeVisible();
              expect(screen.queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeVisible();
              expect(screen.queryByTestId('FileExplorerDetailViewButton')).toBeVisible();
              expect(screen.queryByTestId('FileExplorerToolbarMoveFileButton')).toBeVisible();
              expect(screen.queryByTestId('FileExplorerToolbarDeleteFileButton')).toBeVisible();
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

            it('should render the toolbar and show the path', () => {

                const screen = render(
                    (
                        <TestFileExplorerContextProvider defaultValue={state}>
                            <FileToolbar />
                        </TestFileExplorerContextProvider>
                    ),
                  { }, { currentUser: user }
                );
                expect(screen.queryByTestId('FileExplorerToolbarPath')).toBeVisible();
                expect(screen.queryByTestId('FileExplorerToolbarPath')).toHaveTextContent('/Schulweit');
            });


            it('should show the FileDetailInfo button, but hide the others', () => {

                const screen = render(
                    (
                        <TestFileExplorerContextProvider defaultValue={state}>
                            <FileToolbar />
                        </TestFileExplorerContextProvider>
                    ),
                  { }, { currentUser: user }
                );
                expect(screen.queryByTestId('FileExplorerToolbarPath')).toBeVisible();
                expect(screen.queryByTestId('FileExplorerToolbarNewUploadButton')).toBeNull();
                expect(screen.queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeNull();
                expect(screen.queryByTestId('FileExplorerDetailViewButton')).toBeVisible();
                expect(screen.queryByTestId('FileExplorerToolbarMoveFileButton')).toBeNull();
                expect(screen.queryByTestId('FileExplorerToolbarDeleteFileButton')).toBeNull();
            });

            describe('when a file is selected', () => {
                const stateWithFileSelected: typeof state = {
                    ...state,
                    markedFiles: (filesAndDirectories.filter(f => (f as FileModel).filename ===  'Dateiname.jpg') as FileModel[])
                };

                it('should show the FileDetailInfo button, the upload button and the create directory button, but hide the others', () => {

                    const screen = render(
                        (
                            <TestFileExplorerContextProvider defaultValue={stateWithFileSelected}>
                                <FileToolbar />
                            </TestFileExplorerContextProvider>
                        ),
                      { }, { currentUser: user }
                    );
                    expect(screen.queryByTestId('FileExplorerToolbarPath')).toBeVisible();
                    expect(screen.queryByTestId('FileExplorerToolbarNewUploadButton')).toBeNull();
                    expect(screen.queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeNull();
                    expect(screen.queryByTestId('FileExplorerDetailViewButton')).toBeVisible();
                    expect(screen.queryByTestId('FileExplorerToolbarMoveFileButton')).toBeNull();
                    expect(screen.queryByTestId('FileExplorerToolbarDeleteFileButton')).toBeNull();
                });

            });
        });

        describe('as admin', () => {

            const adminUser = { ...user, groups: [adminGroup] };

            it('should render the toolbar and show the path', () => {

                const screen = render(
                    (
                        <TestFileExplorerContextProvider defaultValue={state}>
                            <FileToolbar />
                        </TestFileExplorerContextProvider>
                    ),
                  { }, { currentUser: adminUser }
                );
                expect(screen.queryByTestId('FileExplorerToolbarPath')).toBeVisible();
                expect(screen.queryByTestId('FileExplorerToolbarPath')).toHaveTextContent('/Schulweit');
            });


            it('should show the FileDetailInfo button, but hide the others', async () => {

                const screen = render(
                    (
                        <TestFileExplorerContextProvider defaultValue={state}>
                            <FileToolbar />
                        </TestFileExplorerContextProvider>
                    ),
                  { }, { currentUser: adminUser }
                );
                expect(screen.queryByTestId('FileExplorerToolbarPath')).toBeVisible();
                expect(await screen.findByTestId('FileExplorerToolbarNewUploadButton')).toBeVisible();
                expect(screen.queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeVisible();
                expect(screen.queryByTestId('FileExplorerDetailViewButton')).toBeVisible();
                expect(screen.queryByTestId('FileExplorerToolbarMoveFileButton')).not.toBeVisible();
                expect(screen.queryByTestId('FileExplorerToolbarDeleteFileButton')).not.toBeVisible();
            });

            describe('when a file is selected', () => {
                const stateWithFileSelected: typeof state = {
                    ...state,
                    markedFiles: (filesAndDirectories.filter(f => (f as FileModel).filename ===  'Dateiname.jpg') as FileModel[])
                };

                it('should show the FileDetailInfo button, the upload button and the create directory button, but hide the others', async () => {

                    const screen = render(
                        (
                            <TestFileExplorerContextProvider defaultValue={stateWithFileSelected}>
                                <FileToolbar />
                            </TestFileExplorerContextProvider>
                        ),
                      { }, { currentUser: adminUser }
                    );
                    expect(screen.queryByTestId('FileExplorerToolbarPath')).toBeVisible();
                    expect(await screen.findByTestId('FileExplorerToolbarNewUploadButton')).toBeVisible();
                    expect(screen.queryByTestId('FileExplorerToolbarCreateDirectoryButton')).toBeVisible();
                    expect(screen.queryByTestId('FileExplorerDetailViewButton')).toBeVisible();
                    expect(screen.queryByTestId('FileExplorerToolbarMoveFileButton')).toBeVisible();
                    expect(screen.queryByTestId('FileExplorerToolbarDeleteFileButton')).toBeVisible();
                });

            });
        });
    });

});
