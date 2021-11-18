import * as React from 'react';
import { render, waitFor } from 'test/util';
import { SomeUser, Weihnachtsmarkt } from 'test/fixtures';
import { EditArticlePage } from './EditArticlePage';
import { ContentModuleType } from 'model';
import { Router } from 'next/router';
import MockDate from 'mockdate';
import userEvent from '@testing-library/user-event';

import ArticleIsUpdatedSubscription from 'api/subscription/GetArticleSubscription.graphql';
import UpdateArticleMutation from 'api/mutation/UpdateArticleMutation.graphql';

describe('component/layouts/editArticleLayout/EditArticleLayout', () => {
    it('should render the EditArticleLayout without error', () => {
        render(
            <EditArticlePage article={Weihnachtsmarkt} />,
            {},
            { currentUser: SomeUser }
        );
    });

    it('should show the article', () => {
        const screen = render(
            <EditArticlePage article={Weihnachtsmarkt} />,
            {},
            { currentUser: SomeUser }
        );
        expect(screen.getByTestId('ArticleEditable')).toBeVisible();
    });

    it('should show the editing footer', () => {
        const screen = render(
            <EditArticlePage article={Weihnachtsmarkt} />,
            {},
            { currentUser: SomeUser }
        );
        expect(screen.getByTestId('EditArticleFooter')).toBeVisible();
    });

    describe('add content modules', () => {
        it('should show the "add module" bar', () => {
            const screen = render(
                <EditArticlePage article={Weihnachtsmarkt} />,
                {},
                { currentUser: SomeUser }
            );
            expect(screen.getByTestId('AddModuleBar')).toBeVisible();
        });

        it('should add a contentmodule', () => {
            const screen = render(
                <EditArticlePage article={Weihnachtsmarkt} />,
                {},
                { currentUser: SomeUser }
            );
            expect(screen.queryAllByTestId('ContentModule')).toHaveLength(3);
            userEvent.click(screen.getByRole('button', { name: /titel/i }));
            expect(screen.queryAllByTestId('ContentModule')).toHaveLength(4);
        });
    });

    describe('saving articles', () => {
        const date = new Date();

        beforeEach(() => {
            MockDate.set(date);
        });
        afterEach(() => {
            MockDate.reset();
        });

        it('should call saveArticle endpoint with updated content modules', async () => {
            const onSave = jest.fn(() => ({
                data: { article: { ...Weihnachtsmarkt, ...variables.article } },
            }));
            const variables = {
                id: Weihnachtsmarkt.id,
                article: {
                    contentModules: Weihnachtsmarkt.contentModules
                        .map((cm) => ({
                            id: cm.id,
                            type: cm.type as string,
                            sortKey: cm.sortKey,
                            files: cm.files,
                            configuration: cm.configuration
                                ? JSON.stringify(cm.configuration)
                                : null,
                            content: cm.content
                                ? JSON.stringify(cm.content)
                                : null,
                        }))
                        .concat([
                            {
                                configuration: '{}' as any,
                                sortKey: 30,
                                files: [],
                                type: 'TITLE',
                                content: '{"title":"Deine Überschrift ..."}',
                            } as any,
                        ]),
                    users: [],
                    groups: [],
                    insertedAt: Weihnachtsmarkt.insertedAt,
                    updatedAt: date.toISOString(),
                    readyToPublish: true,
                    published: false,
                    title: 'Weihnachtsmarkt',
                    preview: Weihnachtsmarkt.preview,
                    previewImageFile: null,
                    tags: ['La Revolucion'],
                    category: null,
                },
            };
            const screen = render(
                <EditArticlePage article={Weihnachtsmarkt} />,
                {},
                {
                    currentUser: SomeUser,
                    additionalMocks: [
                        {
                            request: {
                                query: UpdateArticleMutation,
                                variables: variables,
                            },
                            result: onSave,
                        },
                    ],
                }
            );
            userEvent.click(screen.getByRole('button', { name: /titel/i }));
            userEvent.click(screen.getByRole('button', { name: /speichern/i }));
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });
        }, 20000);

        it('should redirect to article page after saving', async () => {
            const onPushLocation = jest.fn(async (url: any) => {
                expect(url).toMatch(/^\/a\//);
                return true;
            });
            const onSave = jest.fn(() => ({
                data: { article: { ...Weihnachtsmarkt, ...variables.article } },
            }));
            const variables = {
                id: Weihnachtsmarkt.id,
                article: {
                    contentModules: Weihnachtsmarkt.contentModules
                        .map((cm) => ({
                            id: cm.id,
                            type: cm.type as string,
                            sortKey: cm.sortKey,
                            files: cm.files,
                            configuration: cm.configuration
                                ? JSON.stringify(cm.configuration)
                                : null,
                            content: cm.content
                                ? JSON.stringify(cm.content)
                                : null,
                        }))
                        .concat([
                            {
                                configuration: '{}' as any,
                                sortKey: 30,
                                files: [],
                                type: 'TITLE',
                                content: '{"title":"Deine Überschrift ..."}',
                            } as any,
                        ]),
                    users: [],
                    groups: [],
                    insertedAt: Weihnachtsmarkt.insertedAt,
                    updatedAt: date.toISOString(),
                    readyToPublish: true,
                    published: false,
                    title: 'Weihnachtsmarkt',
                    preview: Weihnachtsmarkt.preview,
                    previewImageFile: null,
                    tags: ['La Revolucion'],
                    category: null,
                },
            };
            const screen = render(
                <EditArticlePage article={Weihnachtsmarkt} />,
                {},
                {
                    currentUser: SomeUser,
                    additionalMocks: [
                        {
                            request: {
                                query: UpdateArticleMutation,
                                variables: variables,
                            },
                            result: onSave,
                        },
                    ],
                    router: {
                        pathname: '/a/[slug]/edit',
                        as: `/a/${Weihnachtsmarkt.id}/edit`,
                        onPush: onPushLocation,
                    },
                }
            );
            userEvent.click(screen.getByRole('button', { name: /titel/i }));
            userEvent.click(screen.getByRole('button', { name: /speichern/i }));
            await waitFor(() => {
                expect(onPushLocation).toHaveBeenCalled();
            });
        }, 20000);
    });

    describe('auto-update articles when in editing mode', () => {
        it('should update the preview when receiving update via subscription', async () => {
            const screen = render(
                <EditArticlePage article={Weihnachtsmarkt} />,
                {},
                {
                    currentUser: SomeUser,
                    additionalMocks: [
                        {
                            request: {
                                query: ArticleIsUpdatedSubscription,
                                variables: { id: Weihnachtsmarkt.id },
                            },
                            delay: 500,
                            result: () => {
                                const article = {
                                    ...Weihnachtsmarkt,
                                    preview: 'New Preview-Text',
                                };
                                setTimeout(() => {
                                    screen.rerender(
                                        <EditArticlePage article={article} />
                                    );
                                });
                                return { data: { article } };
                            },
                        },
                    ],
                }
            );
            expect(
                screen.getByRole('textbox', { name: /preview/i })
            ).toHaveValue(
                'lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.'
            );
            await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for subscription
            await waitFor(() => {
                expect(
                    screen.getByRole('textbox', { name: /preview/i })
                ).toHaveValue('New Preview-Text');
            });
        }, 20000);

        it('should update the preview when receiving update via subscription after adding a content module', async () => {
            const screen = render(
                <EditArticlePage article={Weihnachtsmarkt} />,
                {},
                {
                    currentUser: SomeUser,
                    additionalMocks: [
                        {
                            request: {
                                query: ArticleIsUpdatedSubscription,
                                variables: { id: Weihnachtsmarkt.id },
                            },
                            delay: 500,
                            result: () => {
                                const article = {
                                    ...Weihnachtsmarkt,
                                    preview: 'New Preview-Text',
                                };
                                setTimeout(() => {
                                    screen.rerender(
                                        <EditArticlePage article={article} />
                                    );
                                });
                                return { data: { article } };
                            },
                        },
                    ],
                }
            );
            expect(
                screen.getByRole('textbox', { name: /preview/i })
            ).toHaveValue(
                'lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.'
            );
            userEvent.click(screen.getByRole('button', { name: /titel/i }));
            await waitFor(() => {
                expect(
                    screen.getByRole('textbox', {
                        name: /preview/i,
                        hidden: true,
                    })
                ).toHaveValue('New Preview-Text');
            });
        }, 30_000);

        it('should show a dialog when receiving update including content-module change via subscription after adding a content module', async () => {
            const screen = render(
                <EditArticlePage article={Weihnachtsmarkt} />,
                {},
                {
                    currentUser: SomeUser,
                    additionalMocks: [
                        {
                            request: {
                                query: ArticleIsUpdatedSubscription,
                                variables: { id: Weihnachtsmarkt.id },
                            },
                            delay: 500,
                            result: () => {
                                const article = {
                                    ...Weihnachtsmarkt,
                                    contentModules:
                                        Weihnachtsmarkt.contentModules.concat([
                                            {
                                                id: '9999999991111111110',
                                                type: ContentModuleType.TITLE,
                                                sortKey: 20,
                                                insertedAt:
                                                    new Date().toISOString(),
                                                updatedAt:
                                                    new Date().toISOString(),
                                                files: [],
                                                configuration: {},
                                                content: {},
                                            } as any,
                                        ]),
                                };
                                setTimeout(() => {
                                    screen.rerender(
                                        <EditArticlePage article={article} />
                                    );
                                });
                                return { data: { article } };
                            },
                        },
                    ],
                }
            );
            userEvent.click(screen.getByRole('button', { name: /titel/i }));
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
                expect(screen.getByRole('dialog')).toHaveTextContent(
                    /beitrag.*aktualisiert/i
                );
            });
        }, 30_000);
    });

    describe('issue warning when user navigates away', () => {
        const originalConfirm = global.confirm;
        beforeEach(() => {
            global.confirm = jest.fn(() => true);
        });
        afterEach(() => {
            global.confirm = originalConfirm;
        });
        it('should show a prompt if user has made a change', async () => {
            let router: Router;
            const screen = render(
                <EditArticlePage article={Weihnachtsmarkt} />,
                {},
                {
                    currentUser: SomeUser,
                    router: {
                        as: `/c/${Weihnachtsmarkt.id}`,
                        getInstance: (_router) => {
                            router = _router;
                        },
                    },
                }
            );
            userEvent.type(
                screen.getByRole('textbox', { name: /title/i }),
                'Bla'
            );
            await waitFor(() => {
                expect(router).not.toBeNull();
            });
            router!.events.emit('routeChangeStart');
            await waitFor(() => {
                expect(global.confirm).toHaveBeenCalled();
            });
        });

        it('should not show a prompt if user has not made changes', async () => {
            let router: Router;
            render(
                <EditArticlePage article={Weihnachtsmarkt} />,
                {},
                {
                    currentUser: SomeUser,
                    router: {
                        as: `/c/${Weihnachtsmarkt.id}`,
                        getInstance: (_router) => {
                            router = _router;
                        },
                    },
                }
            );
            await waitFor(() => {
                expect(router).not.toBeNull();
            });
            router!.events.emit('routeChangeStart');
            expect(global.confirm).not.toHaveBeenCalled();
        });
    });
});
