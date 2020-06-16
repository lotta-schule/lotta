import React from 'react';
import { render, screen, waitFor, getByRole, findByRole } from 'test/util';
import { SomeUser, MaterialCategory } from 'test/fixtures';
import { CreateCategoryDialog } from './CreateCategoryDialog';
import { CreateCategoryMutation } from 'api/mutation/CreateCategoryMutation';
import { CategoryModel } from 'model';
import userEvent from '@testing-library/user-event'

describe('component/layouts/adminLayout/userManagment/CreateCategoryDialog', () => {

    it('should render the component', () => {
        render( <CreateCategoryDialog isOpen onConfirm={() => {}} onAbort={() => {}} />);
    });

    it('should show the component if isOpen is true', async () => {
        render(<CreateCategoryDialog isOpen onConfirm={() => {}} onAbort={() => {}} />);
        expect(screen.queryByRole('dialog')).toBeVisible();
    });

    it('should not show the component if isOpen is false', async () => {
        render(<CreateCategoryDialog isOpen={false} onConfirm={() => {}} onAbort={() => {}} />);
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('should have the focus on the input field and the submit button disabled when open', async () => {
        render(<CreateCategoryDialog isOpen onConfirm={() => {}} onAbort={() => {}} />);
        expect(screen.queryByRole('textbox')).toBeVisible();
        expect(screen.queryByRole('textbox')).toHaveFocus();
    });

    it('should start with a disabled submit button, but should enable the button when text has been entered', async done => {
        render(<CreateCategoryDialog isOpen onConfirm={() => {}} onAbort={() => {}} />);
        expect(screen.getByRole('button', { name: /erstellen/ })).toBeDisabled();
        await userEvent.type(screen.getByRole('textbox'), 'Test');
        expect(screen.getByRole('button', { name: /erstellen/ })).not.toBeDisabled();
        done();
    });

    it('should have the category selection disabled when the category should be a sidenav', async done => {
        render(<CreateCategoryDialog isOpen onConfirm={() => {}} onAbort={() => {}} />);
        await userEvent.type(screen.getByRole('textbox'), 'Test');
        await userEvent.click(screen.getByRole('checkbox'));
        const categorySelect = screen.getByTestId('CategorySelect');
        await waitFor(() => {
            expect(getByRole(categorySelect, 'button')).toHaveAttribute('aria-disabled');
        });
        done();
    });

    describe('send form', () => {
        const createMocks = (props?: Partial<CategoryModel>) => [{
            request: { query: CreateCategoryMutation, variables: { category: {
                title: 'Test', category: null, isSidenav: false, ...props
            } } },
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
                        category: null,
                        groups: [],
                        widgets: [],
                        ...props
                    }
                }
            }
        }];

        it('should create an article with the given title', async done => {
            const onConfirm = jest.fn(createdCategory => {
                expect(createdCategory.id).toEqual(666);
                expect(createdCategory.title).toEqual('Test');
                expect(createdCategory.isSidenav).toEqual(false);
                expect(createdCategory.category).toBeNull();
            });
            render(
                <CreateCategoryDialog isOpen onConfirm={onConfirm} onAbort={() => {}} />,
                {}, { currentUser: SomeUser, additionalMocks: createMocks() }
            );
            await userEvent.type(screen.getByRole('textbox'), 'Test');
            await userEvent.click(screen.getByRole('button', { name: /erstellen/ }));

            await waitFor(() => {
                expect(onConfirm).toHaveBeenCalled();
            });
            done();
        });

        it('should create an article as sidenav', async done => {
            const onConfirm = jest.fn(createdCategory => {
                expect(createdCategory.id).toEqual(666);
                expect(createdCategory.title).toEqual('Test');
                expect(createdCategory.isSidenav).toEqual(true);
                expect(createdCategory.category).toBeNull();
            });
            render(
                <CreateCategoryDialog isOpen onConfirm={onConfirm} onAbort={() => {}} />,
                {}, { currentUser: SomeUser, additionalMocks: createMocks({ isSidenav: true }) }
            );
            await userEvent.type(screen.getByRole('textbox'), 'Test');
            await userEvent.click(screen.getByRole('checkbox'));
            await userEvent.click(screen.getByRole('button', { name: /erstellen/ }));

            await waitFor(() => {
                expect(onConfirm).toHaveBeenCalled();
            });
            done();
        });

        it('should clear the form and call onAbort when clicking the "Reset" button', async done => {
            const onAbort = jest.fn();
            render(
                <CreateCategoryDialog isOpen onConfirm={() => {}} onAbort={onAbort} />
            );
            await userEvent.type(screen.getByRole('textbox'), 'Test');
            await userEvent.click(screen.getByRole('button', { name: /abbrechen/i }));

            await waitFor(() => {
                expect(onAbort).toHaveBeenCalled();
            });
            expect(screen.queryByRole('textbox')).toHaveValue('');
            done();
        });

    });

});
