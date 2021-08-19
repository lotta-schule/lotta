import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { DirectoryModel, FileModel } from 'model';
import { render, waitFor } from 'test/util';
import { GetOwnArticlesQuery } from 'api/query/GetOwnArticles';
import { GetRelevantFilesInUsageQuery } from 'api/query/GetRelevantFilesInUsage';
import {
    ComputerExperten,
    VivaLaRevolucion,
    Schulfest,
    Weihnachtsmarkt,
    Klausurenplan,
    SomeUser,
    getPrivateAndPublicFiles,
} from 'test/fixtures';
import { GetDirectoriesAndFilesQuery } from 'api/query/GetDirectoriesAndFiles';
import { ProfileDelete } from './ProfileDelete';
import { DestroyAccountMutation } from 'api/mutation/DestroyAccountMutation';

describe('component/layouts/profileLayout/ProfileDelete', () => {
    const filesAndDirs = getPrivateAndPublicFiles(SomeUser);

    const files = (filesAndDirs.filter(
        (f: unknown) => (f as FileModel).fileType !== undefined
    ) as unknown) as FileModel[];
    const directories = (filesAndDirs.filter(
        (f: unknown) => (f as FileModel).fileType === undefined
    ) as unknown) as DirectoryModel[];
    const rootDirectories = directories.filter((d) => !d.parentDirectory);

    it('should render the component without error', () => {
        render(
            <ProfileDelete />,
            {},
            {
                currentUser: SomeUser,
                useCache: true,
            }
        );
    });

    it('should be able to go to second page and see own articles when clicking on button', async () => {
        const screen = render(
            <ProfileDelete />,
            {},
            {
                currentUser: SomeUser,
                useCache: true,
                additionalMocks: [
                    {
                        request: { query: GetOwnArticlesQuery },
                        result: {
                            data: {
                                articles: [
                                    Weihnachtsmarkt,
                                    Klausurenplan,
                                    Schulfest,
                                    VivaLaRevolucion,
                                    ComputerExperten,
                                ],
                            },
                        },
                    },
                    {
                        request: {
                            query: GetDirectoriesAndFilesQuery,
                            variables: { parentDirectoryId: null },
                        },
                        result: {
                            data: { files: [], directories: rootDirectories },
                        },
                    },
                ],
            }
        );

        expect(
            await screen.findByRole('heading', { name: /daten löschen/i })
        ).toBeInTheDocument();
        userEvent.click(await screen.findByRole('button', { name: /weiter/i }));

        expect(await screen.findByRole('progressbar')).toBeVisible();

        await waitFor(() => {
            expect(screen.getByTestId('ProfileDeleteStep2Card')).toBeVisible();
        });
    }, 10_000);

    it('should be able to go to third page after having seen the first and the second one', async () => {
        const screen = render(
            <ProfileDelete />,
            {},
            {
                currentUser: SomeUser,
                useCache: true,
                additionalMocks: [
                    {
                        request: { query: GetRelevantFilesInUsageQuery },
                        result: { data: { files } },
                    },
                    {
                        request: { query: GetOwnArticlesQuery },
                        result: {
                            data: {
                                articles: [
                                    Weihnachtsmarkt,
                                    Klausurenplan,
                                    Schulfest,
                                    VivaLaRevolucion,
                                    ComputerExperten,
                                ],
                            },
                        },
                    },
                    {
                        request: {
                            query: GetDirectoriesAndFilesQuery,
                            variables: { parentDirectoryId: null },
                        },
                        result: {
                            data: { files: [], directories: rootDirectories },
                        },
                    },
                ],
            }
        );

        userEvent.click(await screen.findByRole('button', { name: /weiter/i }));
        expect(await screen.findByRole('progressbar')).toBeVisible();
        userEvent.click(await screen.findByRole('button', { name: /weiter/i }));
        expect(await screen.findByRole('progressbar')).toBeVisible();
        await waitFor(() => {
            expect(screen.getByTestId('ProfileDeleteStep3Card')).toBeVisible();
        });
    }, 10_000);

    it('The third page should not show the ProfileDeleteFileSelection or the tab bar if user has no files', async () => {
        const screen = render(
            <ProfileDelete />,
            {},
            {
                currentUser: SomeUser,
                useCache: true,
                additionalMocks: [
                    {
                        request: { query: GetRelevantFilesInUsageQuery },
                        result: { data: { files: [] } },
                    },
                    {
                        request: { query: GetOwnArticlesQuery },
                        result: {
                            data: {
                                articles: [
                                    Weihnachtsmarkt,
                                    Klausurenplan,
                                    Schulfest,
                                    VivaLaRevolucion,
                                    ComputerExperten,
                                ],
                            },
                        },
                    },
                    {
                        request: {
                            query: GetDirectoriesAndFilesQuery,
                            variables: { parentDirectoryId: null },
                        },
                        result: {
                            data: { files: [], directories: rootDirectories },
                        },
                    },
                ],
            }
        );

        userEvent.click(await screen.findByRole('button', { name: /weiter/i }));
        expect(await screen.findByRole('progressbar')).toBeVisible();
        userEvent.click(await screen.findByRole('button', { name: /weiter/i }));
        expect(
            await screen.findByTestId('ProfileDeleteStep3Card')
        ).toBeInTheDocument();
        expect(screen.queryByRole('tablist')).toBeNull();
        expect(
            screen.queryByRole('tabpanel', {
                name: /dateien aus beiträgen übergeben/i,
            })
        ).toBeNull();
        expect(
            screen.queryByRole('tabpanel', { name: /alle dateien überprüfen/i })
        ).toBeVisible();
    }, 10_000);

    it('The fourth page should show a "definitly delete account" button, which upon click should show a modal with another "definitly delete account" button', async () => {
        let didCallDeleteMutation = false;
        const onChangeLocation = jest.fn(({ location }) => {
            expect(location.pathname).toEqual('/');
        });
        const screen = render(
            <ProfileDelete />,
            {},
            {
                currentUser: SomeUser,
                useCache: true,
                defaultPathEntries: ['/profile/delete'],
                onChangeLocation,
                additionalMocks: [
                    {
                        request: { query: DestroyAccountMutation },
                        result: { data: { user: SomeUser } },
                    },
                    {
                        request: { query: GetRelevantFilesInUsageQuery },
                        result: { data: { files: [] } },
                    },
                    {
                        request: { query: GetOwnArticlesQuery },
                        result: () => {
                            didCallDeleteMutation = true;
                            return {
                                data: {
                                    articles: [
                                        Weihnachtsmarkt,
                                        Klausurenplan,
                                        Schulfest,
                                        VivaLaRevolucion,
                                        ComputerExperten,
                                    ],
                                },
                            };
                        },
                    },
                    {
                        request: {
                            query: GetDirectoriesAndFilesQuery,
                            variables: { parentDirectoryId: null },
                        },
                        result: {
                            data: { files: [], directories: rootDirectories },
                        },
                    },
                ],
            }
        );

        userEvent.click(await screen.findByRole('button', { name: /weiter/i }));
        expect(await screen.findByRole('progressbar')).toBeVisible();
        userEvent.click(await screen.findByRole('button', { name: /weiter/i }));
        expect(
            await screen.findByTestId('ProfileDeleteStep3Card')
        ).toBeInTheDocument();
        userEvent.click(await screen.findByRole('button', { name: /weiter/i }));
        expect(
            await screen.findByTestId('ProfileDeleteStep4Card')
        ).toBeInTheDocument();
        userEvent.click(
            await screen.findByRole('button', { name: /endgültig löschen/i })
        );

        expect(await screen.findByRole('dialog')).toBeVisible();

        userEvent.click(
            await screen.findByRole('button', { name: /endgültig löschen/i })
        );

        await waitFor(() => {
            expect(didCallDeleteMutation).toEqual(true);
        });
    }, 25_000);
});
