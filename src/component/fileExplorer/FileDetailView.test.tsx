import React from 'react';
import { render, waitFor } from 'test/util';
import { MockedProvider } from '@apollo/client/testing';
import { FileDetailView } from './FileDetailView';
import { FileModel, FileModelType, UserModel } from 'model';
import { GetFileDetailsQuery } from 'api/query/GetFileDetailsQuery';
import { SomeUser, movieFile, schulweitDirectory } from 'test/fixtures';

describe('component/fileExplorer/FileDetailView', () => {

    const user: UserModel = SomeUser;
    const file: FileModel = {
        id: '123',
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
            id: '123',
            name: 'Bilder',
            insertedAt: '2000-01-01 18:00',
            updatedAt: '2000-01-01 18:00',
            user
        }
    };

    const mocks = [
        {
            request: { query: GetFileDetailsQuery, variables: { id: '123' } },
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

    const usedFile = {
        ...file,
        id: '7132',
        filename: 'ImportantImage.jpg',
        filesize: 412756,
        fileType: FileModelType.Image,
        mimeType: 'image/jpg',
        remoteLocation: 'https://localhost:3000/image.jpg'
    };
    const usedFileMocks = [{
        request: { query: GetFileDetailsQuery, variables: { id: '7132' } },
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
                                id: '1123',
                                nickname: 'Der Dieb',
                                name: undefined,
                                avatarImageFile: {
                                    ...usedFile
                                }
                            }
                        },
                        {
                            usage: 'background',
                            system: {
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


    describe('should show basic file information', () => {
        it('should show the filename', () => {
            const screen = render(
                <MockedProvider mocks={mocks} addTypename={false}>
                    <FileDetailView file={file} />
                </MockedProvider>
            );
            expect(screen.getByText('Dateiname.jpg')).toBeInTheDocument();
        });

        it('should show the previewImage for image files', () => {
            const screen = render(
                <MockedProvider mocks={mocks} addTypename={false}>
                    <FileDetailView file={file} />
                </MockedProvider>
            );
            const previewImage = screen.getByTestId('PreviewImage') as HTMLImageElement;
            expect(previewImage.src).toContain('https://fakes3/meinbild.jpg');
        });

        it('should show not show a previewImage for Pdf document without image preview', () => {
            const pdfDocument = {
                ...file,
                id: '4544',
                filename: 'Dokument.pdf',
                filesize: 5023123,
                fileType: FileModelType.Pdf,
                mimeType: 'application/pdf'
            };
            const pdfDocumentMocks = [{
                request: { query: GetFileDetailsQuery, variables: { id: '4544' } },
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
            const screen = render(
                <MockedProvider mocks={pdfDocumentMocks} addTypename={false}>
                    <FileDetailView file={pdfDocument} />
                </MockedProvider>
            );
            expect(screen.getByText('Dokument.pdf')).toBeInTheDocument();
            expect(screen.queryByTestId('PreviewImage')).toBeNull();
        });

    });
    describe('should download and show extended information', () => {

        it('should download more information', async () => {
            const pdfDocument = {
                ...file,
                id: '4544',
                filename: 'Dokument.pdf',
                filesize: 5023123,
                fileType: FileModelType.Pdf,
                mimeType: 'application/pdf'
            };
            let fileDetailsQueryCalled = false;
            const pdfDocumentMocks = [{
                request: { query: GetFileDetailsQuery, variables: { id: '4544' } },
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
            const screen = render(
                <MockedProvider mocks={pdfDocumentMocks} addTypename={false}>
                    <FileDetailView file={pdfDocument} />
                </MockedProvider>
            );

            await waitFor(() => {
                expect(fileDetailsQueryCalled).toBeTruthy();
            });
            await screen.findByTestId('AuthorsListItem');

        });

        it('should show the author of the file', async () => {
            const screen = render(
                <MockedProvider mocks={mocks} addTypename={false}>
                    <FileDetailView file={file} />
                </MockedProvider>
            );

            expect(await screen.findByTestId('AuthorsListItem')).toBeInTheDocument();

            expect(screen.container).toHaveTextContent('Autor:Che');
        });

        it('should show the file\'s usage count', async () => {

            const screen = render(
                <FileDetailView file={usedFile} />,
                {}, { currentUser: user, additionalMocks: usedFileMocks }
            );

            expect(await screen.findByTestId('UsageListItem')).toHaveTextContent('4x');
        });


        it('should show the file\'s conversions count', async () => {
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
            const screen = render(
                <FileDetailView file={file} />,
                {}, { additionalMocks }
            );

            await waitFor(() => {
                expect(detailsQueryResponded).toBeTruthy();
            });
            expect(await screen.findByTestId('FileConversionsListItem')).toHaveTextContent('7 Formate');
        });
    });

});
