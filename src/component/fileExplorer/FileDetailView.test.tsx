import React from 'react';
import { render, cleanup, waitFor } from 'test/util';
import { MockedProvider } from '@apollo/client/testing';
import { FileDetailView } from './FileDetailView';
import { FileModel, FileModelType, UserModel } from 'model';
import { GetFileDetailsQuery } from 'api/query/GetFileDetailsQuery';
import { TestTenant, SomeUser, movieFile, schulweitDirectory } from 'test/fixtures';

afterEach(cleanup);

describe('component/fileExplorer/FileDetailView', () => {

    const user: UserModel = SomeUser;
    const file: FileModel = {
        id: 123,
        filename: 'Dateiname.jpg',
        filesize: 123123,
        fileType: FileModelType.Image,
        mimeType: 'image/jpg',
        insertedAt: '2001-01-01 14:15',
        updatedAt: '2001-01-01 14:15',
        remoteLocation: 'https://fakes3/meinbild.jpg',
        userId: user.id,
        fileConversions: [],
        parentDirectory: {
            id: 123,
            name: 'Bilder',
            insertedAt: '2000-01-01 18:00',
            updatedAt: '2000-01-01 18:00',
            user
        }
    };

    const mocks = [
        {
            request: { query: GetFileDetailsQuery, variables: { id: 123 } },
            result: {
                data: {
                    file: {
                        ...file,
                        user,
                        usage: []
                    }
                }
            }
        }
    ];

    describe('should show basic file information', () => {
        it('should show the filename', async done => {
            const { findByText } = render(
                <MockedProvider mocks={mocks} addTypename={false}>
                    <FileDetailView file={file} />
                </MockedProvider>
            );
            await findByText('Dateiname.jpg');
            done();
        });

        it('should show the previewImage for image files', async done => {
            const { findByTestId } = render(
                <MockedProvider mocks={mocks} addTypename={false}>
                    <FileDetailView file={file} />
                </MockedProvider>
            );
            const previewImage = await findByTestId('PreviewImage') as HTMLImageElement;
            expect(previewImage.src).toContain('https://fakes3/meinbild.jpg');
            done();
        });

        it('should show not show a previewImage for Pdf document without image preview', async done => {
            const pdfDocument = {
                ...file,
                id: 4544,
                filename: 'Dokument.pdf',
                filesize: 5023123,
                fileType: FileModelType.Pdf,
                mimeType: 'application/pdf'
            };
            const pdfDocumentMocks = [{
                request: { query: GetFileDetailsQuery, variables: { id: 4544 } },
                result: {
                    data: {
                        file: {
                            ...pdfDocument,
                                user,
                                usage: []
                        }
                    }
                }
            }];
            const { findByText, queryByTestId } = render(
                <MockedProvider mocks={pdfDocumentMocks} addTypename={false}>
                    <FileDetailView file={pdfDocument} />
                </MockedProvider>
            );
            await findByText('Dokument.pdf');
            expect(queryByTestId('PreviewImage')).toBeNull();
            done();
        });

    });
    describe('should download and show extended information', () => {

        it('should download more information', async done => {
            const pdfDocument = {
                ...file,
                id: 4544,
                filename: 'Dokument.pdf',
                filesize: 5023123,
                fileType: FileModelType.Pdf,
                mimeType: 'application/pdf'
            };
            let fileDetailsQueryCalled = false;
            const pdfDocumentMocks = [{
                request: { query: GetFileDetailsQuery, variables: { id: 4544 } },
                result: () => {
                    fileDetailsQueryCalled = true;
                    return {
                        data: {
                            file: {
                                ...pdfDocument,
                                    user,
                                    usage: []
                            }
                        }
                    };
                }
            }];
            const { findByTestId } = render(
                <MockedProvider mocks={pdfDocumentMocks} addTypename={false}>
                    <FileDetailView file={pdfDocument} />
                </MockedProvider>
            );

            await waitFor(() => {
                expect(fileDetailsQueryCalled).toBeTruthy();
            });
            await findByTestId('AuthorsListItem');

            done();
        });

        it('should show the author of the file', async done => {
            const { findByTestId, container } = render(
                <MockedProvider mocks={mocks} addTypename={false}>
                    <FileDetailView file={file} />
                </MockedProvider>
            );

            await findByTestId('AuthorsListItem');
            
            expect(container).toHaveTextContent('Autor:Che');
            done();
        });

        it('should show the file\'s usage count', async done => {
            const usedFile = {
                ...file,
                id: 7132,
                filename: 'ImportantImage.jpg',
                filesize: 412756,
                fileType: FileModelType.Image,
                mimeType: 'image/jpg',
                remoteLocation: 'https://localhost:3000/image.jpg'
            };
            const usedFileMocks = [{
                request: { query: GetFileDetailsQuery, variables: { id: 7132 } },
                result: {
                    data: {
                        file: {
                            ...usedFile,
                                user,
                            usage: [
                                {
                                    usage: 'preview',
                                    article: {
                                        title: 'Bild als Vorschaubild benutzt',
                                        previewImageFile: {
                                            ...usedFile
                                        }
                                    }
                                },
                                {
                                    usage: 'banner',
                                    category: {
                                        title: 'Als Banner kann man das auch nehmen',
                                        bannerImageFile: {
                                            ...usedFile
                                        }
                                    },
                                },
                                {
                                    usage: 'avatar',
                                    user: {
                                        id: 1123,
                                        nickname: 'Der Dieb',
                                        name: undefined,
                                        avatarImageFile: {
                                            ...usedFile
                                        }
                                    }
                                },
                                {
                                    usage: 'background',
                                    tenant: {
                                        ...TestTenant,
                                        backgroundImageFile: {
                                            ...usedFile
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }];

            const { findByTestId } = render(
                <FileDetailView file={usedFile} />,
                {}, { currentUser: user, additionalMocks: usedFileMocks }
            );

            const usageListItem = await findByTestId('UsageListItem');
            expect(usageListItem).toHaveTextContent('4x');
            done();
        });


        it('should show the file\'s conversions count', async done => {
            const file: FileModel = {
                ...movieFile,
                userId: user.id,
                parentDirectory: {
                    ...schulweitDirectory
                }
            };
            let detailsQueryResponded = false;
            const additionalMocks = [{
                request: { query: GetFileDetailsQuery, variables: { id: file.id } },
                result: () => {
                    detailsQueryResponded = true;
                    return { data: { file: { ...file, user, usage: [] } } };
                }
            }];
            const { findByTestId } = render(
                <FileDetailView file={file} />,
                {}, { additionalMocks }
            );

            await waitFor(() => {
                expect(detailsQueryResponded).toBeTruthy();
            });
            const conversionsListItem = await findByTestId('FileConversionsListItem')
            expect(conversionsListItem).toBeDefined();
            expect(conversionsListItem).toHaveTextContent('7 Formate');
            done();
        });
    });

});
