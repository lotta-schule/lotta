import * as React from 'react';
import { render, waitFor } from 'test/util';
import { adminGroup, SomeUser, Weihnachtsmarkt } from 'test/fixtures';
import { EditArticleFooter } from './EditArticleFooter';
import DeleteArticleMutation from 'api/mutation/DeleteArticleMutation.graphql';
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
            { currentUser: SomeUser }
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
                { currentUser: SomeUser }
            );

            expect(
                screen.queryByRole('button', { name: /edit dates/i })
            ).toBeNull();
        });

        it('should show dates button when user is not admin and open 1rticleDatesEditor', async () => {
            const adminUser = { ...SomeUser, groups: [adminGroup] };
            const screen = render(
                <EditArticleFooter
                    article={Weihnachtsmarkt}
                    onUpdate={() => {}}
                    onSave={() => {}}
                />,
                {},
                { currentUser: adminUser }
            );

            expect(
                screen.getByRole('button', { name: /edit dates/i })
            ).toBeVisible();
            userEvent.click(
                screen.getByRole('button', { name: /edit dates/i })
            );
            await waitFor(() => {
                expect(screen.getByTestId('ArticleDatesEditor')).toBeVisible();
            });
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
                { currentUser: { ...SomeUser } }
            );
            userEvent.click(screen.getByRole('button', { name: /speichern/i }));
            expect(onSave).toHaveBeenCalled();
        });
    });

    describe('delete article', () => {
        it('show the modal and delete the article on confirmation', async () => {
            const onDelete = jest.fn(() => ({
                data: {
                    deleteArticle: { article: { id: Weihnachtsmarkt.id } },
                },
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
                }
            );
            userEvent.click(
                screen.getByRole('button', { name: /beitrag löschen/i })
            );
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeVisible();
            });
            userEvent.click(
                screen.getByRole('button', {
                    name: /Beitrag endgültig löschen/,
                })
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
                { currentUser: { ...SomeUser } }
            );
            userEvent.click(
                screen.getByRole('button', { name: /beitrag löschen/i })
            );
            await waitFor(() => {
                expect(screen.queryByRole('dialog')).toBeVisible();
            });
            userEvent.click(
                screen.getByRole('button', { name: /beitrag behalten/i })
            );
            await waitFor(() => {
                expect(screen.queryByRole('dialog')).toBeNull();
            });
        });
    });
});
