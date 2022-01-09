import * as React from 'react';
import {
    FaecherCategory,
    StartseiteCategory,
    KunstCategory,
    ComputerExperten,
} from 'test/fixtures';
import { render, waitFor } from 'test/util';
import { CategoryEditor } from './CategoryEditor';
import UpdateCategoryMutation from 'api/mutation/UpdateCategoryMutation.graphql';
import GetCategoryWidgetsQuery from 'api/query/GetCategoryWidgetsQuery.graphql';
import userEvent from '@testing-library/user-event';

describe('shared/layouts/adminLayout/categoryManagment/CategoryEditor', () => {
    it('should render CategoryEditor', () => {
        render(
            <CategoryEditor
                selectedCategory={FaecherCategory}
                onSelectCategory={() => {}}
            />
        );
    });

    it('should show correct category title', () => {
        const screen = render(
            <CategoryEditor
                selectedCategory={FaecherCategory}
                onSelectCategory={() => {}}
            />
        );

        expect(screen.getByRole('heading', { name: /fächer/i })).toBeVisible();
    });

    describe('show/hide group selection', () => {
        it('show the GroupSelect for any non-homepage', () => {
            const screen = render(
                <CategoryEditor
                    selectedCategory={FaecherCategory}
                    onSelectCategory={() => {}}
                />
            );

            expect(screen.getByTestId('GroupSelect')).toBeVisible();
        });

        it('NOT show the GroupSelect for the homepage', () => {
            const screen = render(
                <CategoryEditor
                    selectedCategory={StartseiteCategory}
                    onSelectCategory={() => {}}
                />
            );

            expect(screen.queryByTestId('GroupSelect')).toBeNull();
        });
    });

    describe('show/hide "hide articles from homepage" selection', () => {
        it('show the "hide articles from homepage" for any non-homepage', () => {
            const screen = render(
                <CategoryEditor
                    selectedCategory={FaecherCategory}
                    onSelectCategory={() => {}}
                />
            );

            expect(
                screen.getByRole('checkbox', {
                    name: /auf der startseite verstecken/i,
                })
            ).toBeInTheDocument();
        });

        it('NOT show the "hide articles from homepage" for the homepage', () => {
            const screen = render(
                <CategoryEditor
                    selectedCategory={StartseiteCategory}
                    onSelectCategory={() => {}}
                />
            );

            expect(
                screen.queryByRole('checkbox', {
                    name: /auf der startseite verstecken/i,
                })
            ).toBeNull();
        });
    });

    it('should show the layout selection', () => {
        const screen = render(
            <CategoryEditor
                selectedCategory={FaecherCategory}
                onSelectCategory={() => {}}
            />
        );

        expect(
            screen.getByRole('combobox', {
                name: /layout/i,
            })
        ).toBeVisible();
    });

    describe('Category redirect', () => {
        describe('"None" Value', () => {
            it('should have "NONE" selected if no redirect is set', () => {
                const screen = render(
                    <CategoryEditor
                        selectedCategory={FaecherCategory}
                        onSelectCategory={() => {}}
                    />
                );

                expect(
                    screen.getByRole('radio', {
                        name: /nicht weitergeleitet/i,
                    })
                ).toBeChecked();
            });

            it('should reset the value when None is selected', async () => {
                const screen = render(
                    <CategoryEditor
                        selectedCategory={{
                            ...FaecherCategory,
                            redirect: 'https://lotta.schule',
                        }}
                        onSelectCategory={() => {}}
                    />
                );

                userEvent.click(
                    screen.getByRole('radio', { name: /nicht weitergeleitet/i })
                );
                expect(
                    screen.getByRole('radio', { name: /nicht weitergeleitet/i })
                ).toBeChecked();

                await waitFor(() => {
                    expect(
                        screen.getByTestId('ExternalRedirectWrapper')
                    ).toHaveStyle({ height: 0 });
                });
            });
        });

        describe('"Internal Category" Value', () => {
            const internalFaecherCategoy = {
                ...FaecherCategory,
                redirect: `/c/${KunstCategory.id}`,
            };
            it('should have "Internal Category" selected if a local path is set', async () => {
                const screen = render(
                    <CategoryEditor
                        selectedCategory={internalFaecherCategoy}
                        onSelectCategory={() => {}}
                    />
                );

                expect(
                    screen.getByRole('radio', {
                        name: /kategorie weiterleiten/i,
                    })
                ).toBeChecked();

                await waitFor(() => {
                    expect(
                        screen.getByTestId('InternalCategoryRedirectWrapper')
                    ).toHaveStyle({ height: 0 });
                });
            });

            it('should show the categorry select when internal category link is selected', async () => {
                const screen = render(
                    <CategoryEditor
                        selectedCategory={internalFaecherCategoy}
                        onSelectCategory={() => {}}
                    />
                );

                userEvent.click(
                    screen.getByRole('radio', {
                        name: /kategorie weiterleiten/i,
                    })
                );
                expect(
                    screen.getByRole('radio', {
                        name: /kategorie weiterleiten/i,
                    })
                ).toBeChecked();

                await waitFor(() => {
                    expect(
                        screen.getByTestId('InternalCategoryRedirectWrapper')
                    ).toHaveStyle({ height: 0 });
                });
            });
        });

        describe('"Internal Article" Value', () => {
            const internalFaecherCategoy = {
                ...FaecherCategory,
                redirect: `/a/${ComputerExperten.id}`,
            };
            it('should have "Internal Article" selected if a local path is set', async () => {
                const screen = render(
                    <CategoryEditor
                        selectedCategory={internalFaecherCategoy}
                        onSelectCategory={() => {}}
                    />
                );

                expect(
                    screen.getByRole('radio', {
                        name: /beitrag weiterleiten/i,
                    })
                ).toBeChecked();

                await waitFor(() => {
                    expect(
                        screen.getByTestId('InternalArticleRedirectWrapper')
                    ).toHaveStyle({ height: 0 });
                });
            });

            it('should show the article search when internal article link is selected', async () => {
                const screen = render(
                    <CategoryEditor
                        selectedCategory={internalFaecherCategoy}
                        onSelectCategory={() => {}}
                    />
                );

                userEvent.click(
                    screen.getByRole('radio', {
                        name: /beitrag weiterleiten/i,
                    })
                );
                expect(
                    screen.getByRole('radio', {
                        name: /beitrag weiterleiten/i,
                    })
                ).toBeChecked();

                await waitFor(() => {
                    expect(
                        screen.getByTestId('InternalArticleRedirectWrapper')
                    ).toHaveStyle({ height: 0 });
                });
            });
        });

        describe('"External" Value', () => {
            const externalFaecherCategoy = {
                ...FaecherCategory,
                redirect: 'https://lotta.schule',
            };

            it('should have "External" selected if a local path is set', async () => {
                const screen = render(
                    <CategoryEditor
                        selectedCategory={externalFaecherCategoy}
                        onSelectCategory={() => {}}
                    />
                );

                expect(
                    screen.getByRole('radio', {
                        name: /im internet weiterleiten/i,
                    })
                ).toBeChecked();
            });

            it('should show the textinput with a default URL when external link is selected', async () => {
                const screen = render(
                    <CategoryEditor
                        selectedCategory={externalFaecherCategoy}
                        onSelectCategory={() => {}}
                    />
                );

                userEvent.click(
                    screen.getByRole('radio', {
                        name: /im internet weiterleiten/i,
                    })
                );
                expect(
                    screen.getByRole('radio', {
                        name: /im internet weiterleiten/i,
                    })
                ).toBeChecked();

                await waitFor(() => {
                    expect(
                        screen.getByTestId('InternalRedirectWrapper')
                    ).toHaveStyle({ height: 0 });
                });
                expect(
                    screen.getByRole('textbox', {
                        name: /ziel der weiterleitung/i,
                    })
                ).toHaveValue('https://lotta.schule');
            });
        });
    });

    describe('update the category', () => {
        it('should update the category with correct data', async () => {
            const onSave = jest.fn(() => ({
                data: { category: { ...FaecherCategory } },
            }));
            const screen = render(
                <CategoryEditor
                    selectedCategory={FaecherCategory}
                    onSelectCategory={() => {}}
                />,
                {},
                {
                    additionalMocks: [
                        {
                            request: {
                                query: GetCategoryWidgetsQuery,
                                variables: { categoryId: FaecherCategory.id },
                            },
                            result: { data: { widgets: [] } },
                        },
                        {
                            request: {
                                query: GetCategoryWidgetsQuery,
                                variables: { categoryId: FaecherCategory.id },
                            },
                            result: { data: { widgets: [] } },
                        },
                        {
                            request: {
                                query: UpdateCategoryMutation,
                                variables: {
                                    id: FaecherCategory.id,
                                    category: {
                                        title: 'Neue Fächer',
                                        bannerImageFile: null,
                                        groups: [],
                                        redirect: null,
                                        layoutName: null,
                                        hideArticlesFromHomepage: true,
                                        widgets: [],
                                    },
                                },
                            },
                            result: onSave,
                        },
                    ],
                }
            );

            userEvent.type(
                screen.getByRole('textbox', { name: /name der kategorie/i }),
                '{selectall}Neue Fächer'
            );
            userEvent.click(
                screen.getByRole('checkbox', {
                    name: /auf der startseite verstecken/i,
                })
            );
            userEvent.click(screen.getByRole('button', { name: /speichern/i }));
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });
        });
    });

    describe('delete categories', () => {
        it('should NOT show delete button on homepage', () => {
            const screen = render(
                <CategoryEditor
                    selectedCategory={StartseiteCategory}
                    onSelectCategory={() => {}}
                />
            );

            expect(
                screen.queryByRole('button', { name: /löschen/i })
            ).toBeNull();
        });

        it('should show delete dialog on click', async () => {
            const screen = render(
                <CategoryEditor
                    selectedCategory={FaecherCategory}
                    onSelectCategory={() => {}}
                />
            );

            userEvent.click(screen.getByRole('button', { name: /löschen/i }));
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeVisible();
            });
        });
    });
});
