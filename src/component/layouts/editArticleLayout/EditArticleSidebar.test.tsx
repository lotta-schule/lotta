import * as React from 'react';
import { render, waitFor } from 'test/util';
import {
    adminGroup,
    KeinErSieEsUser,
    SomeUser,
    SomeUserin,
    Weihnachtsmarkt,
} from 'test/fixtures';
import { EditArticleSidebar } from './EditArticleSidebar';
import { DeleteArticleMutation } from 'api/mutation/DeleteArticleMutation';
import userEvent from '@testing-library/user-event';

const SomeUserAdmin = { ...SomeUser, groups: [adminGroup] };

describe('component/layouts/editArticleLayout/EditArticleSidebar', () => {
    it('should render without error', () => {
        render(
            <EditArticleSidebar
                article={Weihnachtsmarkt}
                onUpdate={() => {}}
                onSave={() => {}}
            />,
            {},
            { currentUser: SomeUser, useCache: true }
        );
    });

    describe('edit fields', () => {
        describe('title', () => {
            it('should show the title', () => {
                const screen = render(
                    <EditArticleSidebar
                        article={Weihnachtsmarkt}
                        onUpdate={() => {}}
                        onSave={() => {}}
                    />,
                    {},
                    { currentUser: SomeUser, useCache: true }
                );
                expect(
                    screen.getByRole('textbox', { name: /titel des beitrags/i })
                ).toHaveValue('Weihnachtsmarkt');
            });

            it('should update the title', () => {
                const onUpdate = jest.fn();
                const screen = render(
                    <EditArticleSidebar
                        article={Weihnachtsmarkt}
                        onUpdate={onUpdate}
                        onSave={() => {}}
                    />,
                    {},
                    { currentUser: SomeUser, useCache: true }
                );
                userEvent.type(
                    screen.getByRole('textbox', {
                        name: /titel des beitrags/i,
                    }),
                    'A'
                );
                expect(onUpdate).toHaveBeenLastCalledWith({
                    ...Weihnachtsmarkt,
                    title: 'WeihnachtsmarktA',
                });
            });
        });

        describe('preview', () => {
            it('should show the preview', () => {
                const screen = render(
                    <EditArticleSidebar
                        article={Weihnachtsmarkt}
                        onUpdate={() => {}}
                        onSave={() => {}}
                    />,
                    {},
                    { currentUser: SomeUser, useCache: true }
                );
                expect(
                    screen.getByRole('textbox', { name: /vorschautext/i })
                ).toHaveValue(
                    'lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.'
                );
            });

            it('should update the title', () => {
                const onUpdate = jest.fn();
                const screen = render(
                    <EditArticleSidebar
                        article={Weihnachtsmarkt}
                        onUpdate={onUpdate}
                        onSave={() => {}}
                    />,
                    {},
                    { currentUser: SomeUser, useCache: true }
                );
                userEvent.type(
                    screen.getByRole('textbox', { name: /vorschautext/i }),
                    'A'
                );
                expect(onUpdate).toHaveBeenLastCalledWith({
                    ...Weihnachtsmarkt,
                    preview:
                        'lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.A',
                });
            });
        });

        describe('user selection', () => {
            it('should show the search user field for administrators', () => {
                const screen = render(
                    <EditArticleSidebar
                        article={Weihnachtsmarkt}
                        onUpdate={() => {}}
                        onSave={() => {}}
                    />,
                    {},
                    { currentUser: SomeUserAdmin, useCache: true }
                );
                expect(
                    screen.getByRole('textbox', { name: /nutzer suchen/i })
                ).toBeVisible();
            });

            it('should not show the search user field for non-admin users', () => {
                const screen = render(
                    <EditArticleSidebar
                        article={Weihnachtsmarkt}
                        onUpdate={() => {}}
                        onSave={() => {}}
                    />,
                    {},
                    { currentUser: { ...SomeUser }, useCache: true }
                );
                expect(
                    screen.queryByRole('textbox', { name: /nutzer suchen/i })
                ).toBeNull();
            });
        });

        describe('users list', () => {
            const WeihnachtsmarktWithUsers = {
                ...Weihnachtsmarkt,
                users: [SomeUser, SomeUserin, KeinErSieEsUser],
            };

            it('should show for all users in list', () => {
                const screen = render(
                    <EditArticleSidebar
                        article={WeihnachtsmarktWithUsers}
                        onUpdate={() => {}}
                        onSave={() => {}}
                    />,
                    {},
                    { currentUser: SomeUser, useCache: true }
                );
                expect(
                    screen.queryByRole('list', { name: /nutzer/i })
                ).toBeVisible();
                expect(
                    screen
                        .getByRole('list', { name: /nutzer/i })
                        .querySelectorAll('li')
                ).toHaveLength(3);
            });

            it('should require removal of user when selecting other user', () => {
                const onUpdate = jest.fn();
                const screen = render(
                    <EditArticleSidebar
                        article={WeihnachtsmarktWithUsers}
                        onUpdate={onUpdate}
                        onSave={() => {}}
                    />,
                    {},
                    { currentUser: SomeUser, useCache: true }
                );
                userEvent.click(
                    screen
                        .getByRole('listitem', { name: /lui/i })
                        .querySelector('button')!
                );
                expect(onUpdate).toHaveBeenCalledWith({
                    ...WeihnachtsmarktWithUsers,
                    users: [SomeUser, KeinErSieEsUser],
                });
            });

            describe('should show warning when removing oneself', () => {
                it('show a warning when user tries to remove him/herself', async () => {
                    const onUpdate = jest.fn();
                    const screen = render(
                        <EditArticleSidebar
                            article={WeihnachtsmarktWithUsers}
                            onUpdate={onUpdate}
                            onSave={() => {}}
                        />,
                        {},
                        { currentUser: SomeUser, useCache: true }
                    );
                    userEvent.click(
                        screen
                            .getByRole('listitem', { name: /che/i })
                            .querySelector('button')!
                    );
                    expect(screen.getByRole('presentation')).toBeVisible();
                    expect(
                        screen
                            .getByRole('presentation')
                            .querySelectorAll('button')
                    ).toHaveLength(2);
                    expect(
                        screen
                            .getByRole('presentation')
                            .querySelectorAll('button')[0]
                    ).toHaveTextContent(/abbrechen/i);
                    userEvent.click(
                        screen
                            .getByRole('presentation')
                            .querySelectorAll('button')[0]
                    );
                    await waitFor(() => {
                        expect(screen.queryByRole('presentation')).toBeNull();
                    });
                });

                it('show a warning when user tries to remove him/herself', () => {
                    const onUpdate = jest.fn();
                    const screen = render(
                        <EditArticleSidebar
                            article={WeihnachtsmarktWithUsers}
                            onUpdate={onUpdate}
                            onSave={() => {}}
                        />,
                        {},
                        { currentUser: SomeUser, useCache: true }
                    );
                    userEvent.click(
                        screen
                            .getByRole('listitem', { name: /che/i })
                            .querySelector('button')!
                    );
                    expect(screen.getByRole('presentation')).toBeVisible();
                    expect(
                        screen
                            .getByRole('presentation')
                            .querySelectorAll('button')
                    ).toHaveLength(2);
                    expect(
                        screen
                            .getByRole('presentation')
                            .querySelectorAll('button')[1]
                    ).toHaveTextContent(/entfernen/i);
                    userEvent.click(
                        screen
                            .getByRole('presentation')
                            .querySelectorAll('button')[1]
                    );

                    expect(onUpdate).toHaveBeenCalledWith({
                        ...WeihnachtsmarktWithUsers,
                        users: [SomeUserin, KeinErSieEsUser],
                    });
                });
            });
        });

        describe('approval switch', () => {
            it('should show for non-approved article', () => {
                const screen = render(
                    <EditArticleSidebar
                        article={{ ...Weihnachtsmarkt, readyToPublish: false }}
                        onUpdate={() => {}}
                        onSave={() => {}}
                    />,
                    {},
                    { currentUser: { ...SomeUser }, useCache: true }
                );
                expect(
                    screen.queryByRole('checkbox', { name: /freigeben/i })
                ).not.toBeNull();
            });

            it('should not show for approved article', () => {
                const screen = render(
                    <EditArticleSidebar
                        article={{ ...Weihnachtsmarkt, readyToPublish: false }}
                        onUpdate={() => {}}
                        onSave={() => {}}
                    />,
                    {},
                    { currentUser: { ...SomeUser }, useCache: true }
                );
                expect(
                    screen.queryByRole('textbox', { name: /freigeben/i })
                ).toBeNull();
            });
        });

        describe('publishing switch', () => {
            it('should show as disabled for non-admin users', () => {
                const screen = render(
                    <EditArticleSidebar
                        article={{ ...Weihnachtsmarkt }}
                        onUpdate={() => {}}
                        onSave={() => {}}
                    />,
                    {},
                    { currentUser: { ...SomeUser }, useCache: true }
                );
                expect(
                    screen.getByRole('checkbox', { name: /veröffentlichen/i })
                ).toBeDisabled();
            });

            it('should show for admin users', () => {
                const screen = render(
                    <EditArticleSidebar
                        article={{ ...Weihnachtsmarkt }}
                        onUpdate={() => {}}
                        onSave={() => {}}
                    />,
                    {},
                    { currentUser: { ...SomeUserAdmin }, useCache: true }
                );
                expect(
                    screen.getByRole('checkbox', { name: /veröffentlichen/i })
                ).not.toBeDisabled();
            });
        });
    });

    describe('save article', () => {
        it('call the save callback', () => {
            const onSave = jest.fn();
            const screen = render(
                <EditArticleSidebar
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
                <EditArticleSidebar
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
                <EditArticleSidebar
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
