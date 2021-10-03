import * as React from 'react';
import { render, screen, waitFor } from 'test/util';
import { ComputerExperten, FaecherCategory } from 'test/fixtures';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';
import userEvent from '@testing-library/user-event';
import DeleteCategoryMutation from 'api/mutation/DeleteCategoryMutation.graphql';
import GetArticlesQuery from 'api/query/GetArticlesQuery.graphql';

const mocks = [
    {
        request: {
            query: DeleteCategoryMutation,
            variables: {
                id: FaecherCategory.id,
            },
        },
        result: { data: { category: { id: FaecherCategory.id } } },
    },
    {
        request: {
            query: GetArticlesQuery,
            variables: { categoryId: FaecherCategory.id },
        },
        result: { data: { articles: [ComputerExperten] } },
    },
];

describe('component/layouts/adminLayout/userManagment/DeleteCategoryDialog', () => {
    it('should render the component', () => {
        render(
            <DeleteCategoryDialog
                isOpen
                categoryToDelete={FaecherCategory}
                onConfirm={() => {}}
                onClose={() => {}}
            />,
            {},
            { additionalMocks: mocks }
        );
    });

    it('should show the number of articles which categories will be removed.', async () => {
        render(
            <DeleteCategoryDialog
                isOpen
                categoryToDelete={FaecherCategory}
                onConfirm={() => {}}
                onClose={() => {}}
            />,
            {},
            { additionalMocks: mocks }
        );
        await waitFor(() => {
            expect(screen.getByText(/beiträge: 1/i)).toBeVisible();
        });
    });

    it('should show the number of categories which be set top-level', async () => {
        render(
            <DeleteCategoryDialog
                isOpen
                categoryToDelete={FaecherCategory}
                onConfirm={() => {}}
                onClose={() => {}}
            />,
            {},
            { additionalMocks: mocks }
        );
        await waitFor(() => {
            expect(screen.getByText(/unterkategorien: 6/i)).toBeVisible();
        });
    });

    it('should call onClose when clicking the "Abort" button', async () => {
        const onClose = jest.fn();
        render(
            <DeleteCategoryDialog
                isOpen
                categoryToDelete={FaecherCategory}
                onConfirm={() => {}}
                onClose={onClose}
            />,
            {},
            { additionalMocks: mocks }
        );
        userEvent.click(screen.getByRole('button', { name: /abbrechen/i }));

        await waitFor(() => {
            expect(onClose).toHaveBeenCalled();
        });
    });

    describe('send delete request', () => {
        it('delete the category and close the dialog', async () => {
            const onConfirm = jest.fn();
            const screen = render(
                <DeleteCategoryDialog
                    isOpen
                    categoryToDelete={FaecherCategory}
                    onConfirm={onConfirm}
                    onClose={() => {}}
                />,
                {},
                { additionalMocks: mocks }
            );
            userEvent.click(
                screen.getByRole('button', { name: /endgültig löschen/ })
            );

            await waitFor(() => {
                expect(onConfirm).toHaveBeenCalled();
            });
        });
    });
});
