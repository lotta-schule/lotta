import * as React from 'react';
import { render, screen, waitFor } from 'test/util';
import { FaecherCategory, SomeUser } from 'test/fixtures';
import { CreateCategoryDialog } from './CreateCategoryDialog';
import { CreateCategoryMutation } from 'api/mutation/CreateCategoryMutation';
import { CategoryModel } from 'model';
import userEvent from '@testing-library/user-event';

const createMocks = (props?: Partial<CategoryModel>) => [
    {
        request: {
            query: CreateCategoryMutation,
            variables: {
                category: {
                    title: 'Test',
                    category: null,
                    isSidenav: false,
                    ...props,
                    ...(props?.category && {
                        category: { id: props.category.id },
                    }),
                },
            },
        },
        result: {
            data: {
                category: {
                    id: 666,
                    title: 'Test',
                    sortKey: 10,
                    isSidenav: false,
                    isHomepage: false,
                    hideArticlesFromHomepage: false,
                    redirect: null,
                    layoutName: '',
                    bannerImageFile: null,
                    groups: [],
                    widgets: [],
                    ...props,
                    category: props?.category
                        ? {
                              id: props.category.id,
                              title: props.category.title,
                              hideArticlesFromHomepage:
                                  props.category.hideArticlesFromHomepage,
                          }
                        : null,
                },
            },
        },
    },
];

describe('component/layouts/adminLayout/userManagment/CreateCategoryDialog', () => {
    it('should render the component', () => {
        render(
            <CreateCategoryDialog
                isOpen
                onConfirm={() => {}}
                onAbort={() => {}}
            />
        );
    });

    it('should have the focus on the input field on open', () => {
        render(
            <CreateCategoryDialog
                isOpen
                onConfirm={() => {}}
                onAbort={() => {}}
            />
        );
        expect(screen.queryByRole('textbox')).toBeVisible();
        expect(screen.queryByRole('textbox')).toHaveFocus();
    });

    it('should start with a disabled submit button, but should enable the button when text has been entered', () => {
        render(
            <CreateCategoryDialog
                isOpen
                onConfirm={() => {}}
                onAbort={() => {}}
            />
        );
        expect(
            screen.getByRole('button', { name: /erstellen/ })
        ).toBeDisabled();
        userEvent.type(screen.getByRole('textbox'), 'Test');
        expect(
            screen.getByRole('button', { name: /erstellen/ })
        ).not.toBeDisabled();
    });

    it('should reset the input field when dialog is closed and then reopened', () => {
        const screen = render(
            <CreateCategoryDialog
                isOpen
                onConfirm={() => {}}
                onAbort={() => {}}
            />
        );
        userEvent.type(screen.getByRole('textbox'), 'Test');
        screen.rerender(
            <CreateCategoryDialog
                isOpen={false}
                onConfirm={() => {}}
                onAbort={() => {}}
            />
        );
        screen.rerender(
            <CreateCategoryDialog
                isOpen
                onConfirm={() => {}}
                onAbort={() => {}}
            />
        );
        expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('should clear the form and call onAbort when clicking the "Reset" button', async () => {
        const onAbort = jest.fn();
        render(
            <CreateCategoryDialog
                isOpen
                onConfirm={() => {}}
                onAbort={onAbort}
            />
        );
        userEvent.type(screen.getByRole('textbox'), 'Test');
        userEvent.click(screen.getByRole('button', { name: /abbrechen/i }));

        await waitFor(() => {
            expect(onAbort).toHaveBeenCalled();
        });
        expect(screen.queryByRole('textbox')).toHaveValue('');
    });

    describe('send for main category form', () => {
        it('should hide the category selection', async () => {
            const screen = render(
                <CreateCategoryDialog
                    isOpen
                    onConfirm={() => {}}
                    onAbort={() => {}}
                />
            );
            await new Promise((resolve) => setTimeout(resolve, 500));
            expect(
                screen.getByTestId('CategorySelect').parentElement
            ).toHaveStyle({ height: 0 });
        });

        it('should create a main article with the given title', async () => {
            const onConfirm = jest.fn((createdCategory) => {
                expect(createdCategory.id).toEqual(666);
                expect(createdCategory.title).toEqual('Test');
                expect(createdCategory.isSidenav).toEqual(false);
                expect(createdCategory.category).toBeNull();
            });
            const screen = render(
                <CreateCategoryDialog
                    isOpen
                    onConfirm={onConfirm}
                    onAbort={() => {}}
                />,
                {},
                { currentUser: SomeUser, additionalMocks: createMocks() }
            );
            userEvent.type(screen.getByRole('textbox'), 'Test');
            userEvent.click(screen.getByRole('button', { name: /erstellen/ }));

            await waitFor(() => {
                expect(onConfirm).toHaveBeenCalled();
            });
        });
    });

    describe('send for subcategory', () => {
        it('should disable the submit button if no parentCategory is selected', () => {
            const screen = render(
                <CreateCategoryDialog
                    isOpen
                    onConfirm={() => {}}
                    onAbort={() => {}}
                />,
                {},
                { currentUser: SomeUser }
            );

            userEvent.type(screen.getByRole('textbox'), 'Test');
            userEvent.click(
                screen.getByRole('radio', { name: /unterkategorie/i })
            );
            expect(
                screen.getByRole('button', { name: /erstellen/ })
            ).toBeDisabled();
        });

        it('should create an article', async () => {
            const onConfirm = jest.fn((createdCategory) => {
                expect(createdCategory.title).toEqual('Test');
                expect(createdCategory.isSidenav).toEqual(false);
                expect(createdCategory.category).toHaveProperty(
                    'id',
                    FaecherCategory.id
                );
            });

            const screen = render(
                <CreateCategoryDialog
                    isOpen
                    onConfirm={onConfirm}
                    onAbort={() => {}}
                />,
                {},
                {
                    currentUser: SomeUser,
                    additionalMocks: createMocks({
                        isSidenav: false,
                        category: FaecherCategory,
                    }),
                }
            );

            userEvent.type(screen.getByRole('textbox'), 'Test');
            userEvent.click(
                screen.getByRole('radio', { name: /unterkategorie/i })
            );
            await new Promise((resolve) => setTimeout(resolve, 500));
            userEvent.click(
                screen.getByRole('button', { name: /kategorie wählen/i })
            );
            userEvent.click(
                await screen.findByRole('option', { name: /fächer/i })
            );
            userEvent.click(screen.getByRole('button', { name: /erstellen/ }));

            await waitFor(() => {
                expect(onConfirm).toHaveBeenCalled();
            });
        });
    });

    describe('send for sidenav', () => {
        it('should create an article', async () => {
            const onConfirm = jest.fn((createdCategory) => {
                expect(createdCategory.id).toEqual(666);
                expect(createdCategory.title).toEqual('Test');
                expect(createdCategory.isSidenav).toEqual(true);
                expect(createdCategory.category).toBeNull();
            });

            const screen = render(
                <CreateCategoryDialog
                    isOpen
                    onConfirm={onConfirm}
                    onAbort={() => {}}
                />,
                {},
                {
                    currentUser: SomeUser,
                    additionalMocks: createMocks({ isSidenav: true }),
                }
            );

            userEvent.type(screen.getByRole('textbox'), 'Test');
            userEvent.click(
                screen.getByRole('radio', { name: /seitenleistenkategorie/i })
            );
            userEvent.click(screen.getByRole('button', { name: /erstellen/ }));

            await waitFor(() => {
                expect(onConfirm).toHaveBeenCalled();
            });
        });
    });
});
