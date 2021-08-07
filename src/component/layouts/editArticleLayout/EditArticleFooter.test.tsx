import * as React from 'react';
import { render, waitFor } from 'test/util';
import { adminGroup, SomeUser, Weihnachtsmarkt } from 'test/fixtures';
import { EditArticleFooter } from './EditArticleFooter';
import { DeleteArticleMutation } from 'api/mutation/DeleteArticleMutation';
import userEvent from '@testing-library/user-event';

describe('component/layouts/editArticleLayout/EditArticleFooter', () => {
    it('should render without error', () => {
        render(
            <EditArticleFooter
                article={Weihnachtsmarkt}
                onUpdate={() => {}}
                onSave={() => {}}
            />,
            {},
            { currentUser: SomeUser, useCache: true }
        );
    });

    describe('dates button', () => {
        it('should not show dates button when user is not admin', () => {
            const screen = render(
                <EditArticleFooter
                    article={Weihnachtsmarkt}
                    onUpdate={() => {}}
                    onSave={() => {}}
                />,
                {},
                { currentUser: SomeUser, useCache: true }
            );

            expect(
                screen.queryByRole('button', { name: /edit dates/i })
            ).toBeNull();
        });

        it('should show dates button when user is not admin and open ArticleDatesEditor', () => {
            const adminUser = { ...SomeUser, groups: [adminGroup] };
            const screen = render(
                <EditArticleFooter
                    article={Weihnachtsmarkt}
                    onUpdate={() => {}}
                    onSave={() => {}}
                />,
                {},
                { currentUser: adminUser, useCache: true }
            );

            expect(
                screen.getByRole('button', { name: /edit dates/i })
            ).toBeVisible();
            userEvent.click(
                screen.getByRole('button', { name: /edit dates/i })
            );
            expect(screen.getByTestId('ArticleDatesEditor')).toBeVisible();
        });
    });

    describe('save article', () => {
        it('call the save callback', () => {
            const onSave = jest.fn();
            const screen = render(
                <EditArticleFooter
                    article={{ ...Weihnachtsmarkt, readyToPublish: false }}
                    onUpdate={() => {}}
                    onSave={onSave}
                />,
                {},
                { currentUser: { ...SomeUser }, useCache: true }
            );
            userEvent.click(screen.getByRole('button', { name: /speichern/i }));
            expect(onSave).toHaveBeenCalled();
        });
    });

    describe('delete article', () => {
        it('show the modal and delete the article on confirmation', async () => {
            const onDelete = jest.fn(() => ({
                data: { deleteArticle: { id: Weihnachtsmarkt.id } },
            }));
            const mocks = [
                {
                    request: {
                        query: DeleteArticleMutation,
                        variables: { id: Weihnachtsmarkt.id },
                    },
                    result: onDelete,
                },
            ];
            const screen = render(
                <EditArticleFooter
                    article={{ ...Weihnachtsmarkt, readyToPublish: false }}
                    onUpdate={() => {}}
                    onSave={() => {}}
                />,
                {},
                {
                    currentUser: { ...SomeUser },
                    additionalMocks: mocks,
                    useCache: true,
                }
            );
            userEvent.click(
                screen.getByRole('button', { name: /beitrag löschen/i })
            );
            await waitFor(() => {
                expect(screen.getByRole('presentation')).toBeVisible();
            });
            userEvent.click(
                screen.getByRole('button', { name: /endgültig löschen/ })
            );

            await waitFor(() => {
                expect(onDelete).toHaveBeenCalled();
            });
        });

        it('show the modal and hide it again on cancellation', async () => {
            const screen = render(
                <EditArticleFooter
                    article={{ ...Weihnachtsmarkt, readyToPublish: false }}
                    onUpdate={() => {}}
                    onSave={() => {}}
                />,
                {},
                { currentUser: { ...SomeUser }, useCache: true }
            );
            userEvent.click(
                screen.getByRole('button', { name: /beitrag löschen/i })
            );
            expect(screen.queryByRole('presentation')).toBeVisible();
            userEvent.click(screen.getByRole('button', { name: /abbrechen/i }));
            await waitFor(() => {
                expect(screen.queryByRole('presentation')).toBeNull();
            });
        });
    });
});
