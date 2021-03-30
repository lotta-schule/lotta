import * as React from 'react';
import { UpdateCategoryMutation } from 'api/mutation/UpdateCategoryMutation';
import { GetCategoryWidgetsQuery } from 'api/query/GetCategoryWidgetsQuery';
import { FaecherCategory, StartseiteCategory } from 'test/fixtures';
import { render, waitFor } from 'test/util';
import { CategoryEditor } from './CategoryEditor';
import userEvent from '@testing-library/user-event';

describe('component/layouts/adminLayout/categoryManagment/CategoryEditor', () => {
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

    describe('show/hide category selection', () => {
        it('show the CategorySelect for any non-homepage', () => {
            const screen = render(
                <CategoryEditor
                    selectedCategory={FaecherCategory}
                    onSelectCategory={() => {}}
                />
            );

            expect(screen.getByTestId('GroupSelect')).toBeVisible();
        });

        it('NOT show the CategorySelect for the homepage', () => {
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
            screen.getByRole('button', {
                name: /standardlayout/i,
            })
        ).toBeVisible();
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
                                        sortKey: 1,
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

        it('should show delete dialog on click', () => {
            const screen = render(
                <CategoryEditor
                    selectedCategory={FaecherCategory}
                    onSelectCategory={() => {}}
                />
            );

            userEvent.click(screen.getByRole('button', { name: /löschen/i }));
            expect(screen.getByRole('dialog')).toBeVisible();
        });
    });
});
