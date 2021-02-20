import * as React from 'react';
import MockDate from 'mockdate';
import { render, waitFor } from 'test/util';
import { SomeUser, Weihnachtsmarkt } from 'test/fixtures';
import { UpdateArticleMutation } from 'api/mutation/UpdateArticleMutation';
import { EditArticleLayout } from './EditArticleLayout';
import { ArticleIsUpdatedSubscription } from 'api/subscription/GetArticleSubscription';
import { ContentModuleType } from 'model';
import userEvent from '@testing-library/user-event';

describe('component/layouts/editArticleLayout/EditArticleLayout', () => {

    it('should render the EditArticleLayout without error', () => {
        render(
            <EditArticleLayout article={Weihnachtsmarkt} />,
            {},
            { currentUser: SomeUser, useCache: true }
        );
    });

    it('should show the article', () => {
        const screen = render(
            <EditArticleLayout article={Weihnachtsmarkt} />,
            {},
            { currentUser: SomeUser, useCache: true }
        );
        expect(screen.getByTestId('ArticleEditable')).toBeVisible();
    });

    it('should show the editing sidebar', () => {
        const screen = render(
            <EditArticleLayout article={Weihnachtsmarkt} />,
            {},
            { currentUser: SomeUser, useCache: true }
        );
        expect(screen.getByTestId('EditArticleSidebar')).toBeVisible();
    });

    describe('add content modules', () => {
        it('should show the "add module" bar', () => {
            const screen = render(
                <EditArticleLayout article={Weihnachtsmarkt} />,
                {},
                { currentUser: SomeUser, useCache: true }
            );
            expect(screen.getByTestId('AddModuleBar')).toBeVisible();
        });

        it('should add a contentmodule', () => {
            const screen = render(
                <EditArticleLayout article={Weihnachtsmarkt} />,
                {}, { currentUser: SomeUser, useCache: true }
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
            const onSave = jest.fn(() => ({ data: { article: variables.article } }));
            const variables = {
                id: Weihnachtsmarkt.id,
                article: {
                    contentModules:
                        Weihnachtsmarkt.contentModules.map(cm => ({
                            id: cm.id,
                            type: cm.type as string,
                            sortKey: cm.sortKey,
                            files: cm.files,
                            configuration: cm.configuration ? JSON.stringify(cm.configuration) : null,
                            content: cm.content ? JSON.stringify(cm.content) : null
                        }))
                        .concat([{
                            configuration: '{}' as any,
                            sortKey: 40, files:[],
                            type: 'TITLE',
                            content: '{"title":"Deine Überschrift ..."}'
                        } as any]),
                    users: [],
                    groups: [],
                    insertedAt: Weihnachtsmarkt.insertedAt,
                    updatedAt: date.toISOString(),
                    readyToPublish: true,
                    title: "Weihnachtsmarkt",
                    preview: Weihnachtsmarkt.preview,
                    previewImageFile: null,
                    topic: "La Revolucion",
                    category: null
                }
            };
            const screen = render(
                <EditArticleLayout article={Weihnachtsmarkt} />,
                {}, {
                    currentUser: SomeUser,
                    additionalMocks: [{
                        request: {
                            query:  UpdateArticleMutation,
                            variables: variables
                        },
                        result: onSave
                    }],
                    useCache: true
                }
            );
            userEvent.click(screen.getByRole('button', { name: /titel/i }));
            userEvent.click(screen.getByRole('button', { name: /speichern/i }));
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });
        }, 20000);

        it('should redirect to article page after saving', async () => {
            const onChangeLocation = jest.fn(({ location }) => {
                expect(location.pathname).toMatch(/^\/a\//);
            });
            const onSave = jest.fn(() => ({ data: { article: variables.article } }));
            const variables = {
                id: Weihnachtsmarkt.id,
                article: {
                    contentModules:
                        Weihnachtsmarkt.contentModules.map(cm => ({
                            id: cm.id,
                            type: cm.type as string,
                            sortKey: cm.sortKey,
                            files: cm.files,
                            configuration: cm.configuration ? JSON.stringify(cm.configuration) : null,
                            content: cm.content ? JSON.stringify(cm.content) : null
                        }))
                        .concat([{
                            configuration: '{}' as any,
                            sortKey: 40, files:[],
                            type: 'TITLE',
                            content: '{"title":"Deine Überschrift ..."}'
                        } as any]),
                    users: [],
                    groups: [],
                    insertedAt: Weihnachtsmarkt.insertedAt,
                    updatedAt: date.toISOString(),
                    readyToPublish: true,
                    title: "Weihnachtsmarkt",
                    preview: Weihnachtsmarkt.preview,
                    previewImageFile: null,
                    topic: "La Revolucion",
                    category: null
                }
            };
            const screen = render(
                <EditArticleLayout article={Weihnachtsmarkt} />,
                {}, {
                    currentUser: SomeUser,
                    additionalMocks: [{
                        request: {
                            query:  UpdateArticleMutation,
                            variables: variables
                        },
                        result: onSave
                    }],
                    useCache: true,
                    onChangeLocation
                }
            );
            userEvent.click(screen.getByRole('button', { name: /titel/i }));
            userEvent.click(screen.getByRole('button', { name: /speichern/i }));
            await waitFor(() => {
                expect(onChangeLocation).toHaveBeenCalled();
            });
        }, 20000);
    });

    describe('auto-update articles when in editing mode', () => {
        it('should update basic information like the title when receiving update via subscription', async () => {
            const screen = render(
                <EditArticleLayout article={Weihnachtsmarkt} />,
                {}, {
                    currentUser: SomeUser,
                    additionalMocks: [{
                        request: {
                            query:  ArticleIsUpdatedSubscription,
                            variables: { id: Weihnachtsmarkt.id }
                        },
                        delay: 500,
                        result: () => {
                            const article = {
                                ...Weihnachtsmarkt,
                                preview: 'New Preview-Text'
                            };
                            setImmediate(() => {
                                screen.rerender(<EditArticleLayout article={article} />);
                            });
                            return { data: { article } };
                        }
                    }],
                    useCache: true,
                }
            );
            expect(screen.getByRole('textbox', { name: /vorschau/i })).toHaveValue(
                'lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.'
            );
            await waitFor(() => {
                expect(screen.getByRole('textbox', { name: /vorschau/i })).toHaveValue('New Preview-Text');
            });
        }, 20000);

        it('should update basic information like the title when receiving update via subscription after adding a content module', async () => {
            const screen = render(
                <EditArticleLayout article={Weihnachtsmarkt} />,
                {}, {
                    currentUser: SomeUser,
                    additionalMocks: [{
                        request: {
                            query:  ArticleIsUpdatedSubscription,
                            variables: { id: Weihnachtsmarkt.id }
                        },
                        delay: 500,
                        result: () => {
                            const article = {
                                ...Weihnachtsmarkt,
                                preview: 'New Preview-Text'
                            };
                            setImmediate(() => {
                                screen.rerender(<EditArticleLayout article={article} />);
                            });
                            return { data: { article } };
                        }
                    }],
                    useCache: true,
                }
            );
            expect(screen.getByRole('textbox', { name: /vorschau/i })).toHaveValue(
                'lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.'
            );
            userEvent.click(screen.getByRole('button', { name: /titel/i }));
            await waitFor(() => {
                expect(screen.getByRole('textbox', { name: /vorschau/i, hidden: true })).toHaveValue('New Preview-Text');
            });
        }, 20000);

        it('should show a dialog when receiving update including content-module change via subscription after adding a content module', async () => {
            const screen = render(
                <EditArticleLayout article={Weihnachtsmarkt} />,
                {}, {
                    currentUser: SomeUser,
                    additionalMocks: [{
                        request: {
                            query:  ArticleIsUpdatedSubscription,
                            variables: { id: Weihnachtsmarkt.id }
                        },
                        delay: 500,
                        result: () => {
                            const article = {
                                ...Weihnachtsmarkt,
                                contentModules: Weihnachtsmarkt.contentModules.concat([{
                                    id: '9999999991111111110',
                                    type: ContentModuleType.TITLE,
                                    sortKey: 20,
                                    insertedAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                    files: [],
                                    configuration: {},
                                    content: {},
                                } as any])
                            };
                            setImmediate(() => {
                                screen.rerender(<EditArticleLayout article={article} />);
                            });
                            return { data: { article } };
                        }
                    }],
                    useCache: true,
                }
            );
            expect(screen.getByRole('textbox', { name: /vorschau/i })).toHaveValue(
                'lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.'
            );
            userEvent.click(screen.getByRole('button', { name: /titel/i }));
            await waitFor(() => {
                expect(screen.getByRole('presentation')).toBeInTheDocument();
                expect(screen.getByRole('presentation')).toHaveTextContent(/beitrag.*aktualisiert/i);
            });
        }, 20000);
    });

    describe('issue warning when user navigates away', () => {
        it('should show a prompt if user has made a change', async () => {
            let called = false;
            const spy = jest.spyOn(window, 'addEventListener');
            spy.mockImplementation((eventName, callback) => {
                if (eventName === 'beforeunload') {
                    const event = new Event('beforeunload');
                    if (typeof callback === 'function') {
                        expect(callback(event)).toMatch(/möchtest du die seite wirklich verlassen/i);
                        called = true;
                    } else {
                        expect(false).toBe(true);
                    }
                }
            });
            const screen = render(
                <EditArticleLayout article={Weihnachtsmarkt} />,
                {}, {
                    currentUser: SomeUser,
                    useCache: true,
                }
            );
            userEvent.type(screen.getByRole('textbox', { name: /titel/i }), 'Bla');
            window.location.href = '/';
            await waitFor(() => {
                expect(called).toBe(true);
            });
        });

        it('should not show a prompt if user has not made changes', async () => {
            let called = false;
            const spy = jest.spyOn(window, 'addEventListener');
            spy.mockImplementation((eventName, callback) => {
                if (eventName === 'beforeunload') {
                    const event = new Event('beforeunload');
                    if (typeof callback === 'function') {
                        expect(callback(event)).toBeNull();
                        called = true;
                    } else {
                        expect(false).toBe(true);
                    }
                }
            });
            render(
                <EditArticleLayout article={Weihnachtsmarkt} />,
                {}, {
                    currentUser: SomeUser,
                    useCache: true,
                }
            );
            window.location.href = '/';
            expect(called).toBe(false);
        });
    });
});
