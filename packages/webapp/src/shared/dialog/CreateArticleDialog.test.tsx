import * as React from 'react';
import { render, screen, waitFor } from 'test/util';
import { SomeUser } from 'test/fixtures';
import { CreateArticleDialog } from './CreateArticleDialog';
import CreateArticleMutation from 'api/mutation/CreateArticleMutation.graphql';
import userEvent from '@testing-library/user-event';

describe('shared/layouts/adminLayout/userManagment/CreateArticleDialog', () => {
    it('should render the shared', () => {
        render(
            <CreateArticleDialog
                isOpen
                onConfirm={() => {}}
                onAbort={() => {}}
            />
        );
    });

    it('should show the dialog if isOpen is true', async () => {
        render(
            <CreateArticleDialog
                isOpen
                onConfirm={() => {}}
                onAbort={() => {}}
            />
        );
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).toBeVisible();
        });
    });

    it('should not show the dialog if isOpen is false', async () => {
        render(
            <CreateArticleDialog
                isOpen={false}
                onConfirm={() => {}}
                onAbort={() => {}}
            />
        );
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('should have the focus on the input field and the submit button disabled when open', async () => {
        render(
            <CreateArticleDialog
                isOpen
                onConfirm={() => {}}
                onAbort={() => {}}
            />
        );
        await waitFor(() => {
            expect(screen.queryByRole('textbox')).toBeVisible();
            expect(screen.queryByRole('textbox')).toHaveFocus();
        });
    });

    it('should start with a disabled submit button, but should enable the button when text has been entered', async () => {
        const fireEvent = userEvent.setup();
        render(
            <CreateArticleDialog
                isOpen
                onConfirm={() => {}}
                onAbort={() => {}}
            />
        );
        await waitFor(() => {
            expect(screen.queryByRole('textbox')).toBeVisible();
            expect(screen.queryByRole('textbox')).toHaveFocus();
        });
        expect(
            screen.getByRole('button', { name: /erstellen/ })
        ).toBeDisabled();
        await fireEvent.type(screen.getByRole('textbox'), 'Test');
        expect(
            screen.getByRole('button', { name: /erstellen/ })
        ).not.toBeDisabled();
    });

    describe('send form', () => {
        const mocks = [
            {
                request: {
                    query: CreateArticleMutation,
                    variables: { article: { title: 'Test' } },
                },
                result: {
                    data: {
                        article: {
                            id: 666,
                            title: 'Test',
                            insertedAt: new Date(),
                            updatedAt: new Date(),
                            preview: '',
                            readyToPublish: false,
                            published: false,
                            isPinnedToTop: false,
                            previewImageFile: null,
                            contentModules: [],
                            category: null,
                            groups: [],
                            tags: [],
                            users: [SomeUser],
                        },
                    },
                },
            },
        ];

        it('should create an article with the given title', async () => {
            const fireEvent = userEvent.setup();
            const onConfirm = jest.fn((createdArticle) => {
                expect(createdArticle.id).toEqual(666);
                expect(createdArticle.title).toEqual('Test');
            });
            render(
                <CreateArticleDialog
                    isOpen
                    onConfirm={onConfirm}
                    onAbort={() => {}}
                />,
                {},
                { currentUser: SomeUser, additionalMocks: mocks }
            );
            await fireEvent.type(screen.getByRole('textbox'), 'Test');
            await fireEvent.click(
                screen.getByRole('button', { name: /erstellen/ })
            );

            await waitFor(() => {
                expect(onConfirm).toHaveBeenCalled();
            });
        });

        it('should clear the form and call onAbort when clicking the "Reset" button', async () => {
            const fireEvent = userEvent.setup();
            const onAbort = jest.fn();
            render(
                <CreateArticleDialog
                    isOpen
                    onConfirm={() => {}}
                    onAbort={onAbort}
                />
            );
            await fireEvent.type(screen.getByRole('textbox'), 'Test');
            await fireEvent.click(
                screen.getByRole('button', { name: /abbrechen/i })
            );

            await waitFor(() => {
                expect(onAbort).toHaveBeenCalled();
            });
            expect(screen.queryByRole('textbox')).toHaveValue('');
        });
    });
});
