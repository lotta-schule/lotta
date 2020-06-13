import React from 'react';
import { MockedResponse } from '@apollo/client/testing';
import { GetUserQuery } from 'api/query/GetUserQuery';
import { render, cleanup, waitFor } from 'test/util';
import { SomeUser, adminGroup, lehrerGroup, elternGroup } from 'test/fixtures';
import { EditUserPermissionsDialog } from './EditUserPermissionsDialog';
import { SetUserGroupsMutation } from 'api/mutation/SetUserGroupsMutation';
import userEvent from '@testing-library/user-event'
import { SetUserBlockedMutation } from 'api/mutation/SetUserBlockedMutation';

afterEach(cleanup);

describe('component/layouts/adminLayout/userManagment/EditUserPermissionsDialog', () => {

    let userInfoLoaded = false;

    const mocks = (user: any) => [{
        request: { query: GetUserQuery, variables: { id: user.id } },
        result: () => {
            userInfoLoaded = true;
            return { data: { user } };
        }
    }] as MockedResponse[];

    beforeEach(() => {
        userInfoLoaded = false;
    });

    describe('show user basic information', () => {
        it('should show user information', async done => {
            const user = { ...SomeUser, groups: [], assignedGroups: [], isBlocked: false };
            const { queryByTestId } = render(
                <EditUserPermissionsDialog user={user} onClose={() => {}} />,
                {}, { additionalMocks: mocks(user) }
            );
            await waitFor(() => {
                expect(userInfoLoaded).toEqual(true);
            });
            expect(queryByTestId('DialogTitle')).toHaveTextContent('Ernesto Guevara');
            expect(queryByTestId('UserNickname')).toHaveTextContent('Che');
            expect(queryByTestId('UserEmail')).toHaveTextContent('user@lotta.schule');
            done();
        });
    });

    describe('show and select correct groups', () => {
        it('should show assigned and dynamic groups', async done => {
            const user = { ...SomeUser, groups: [adminGroup, lehrerGroup], assignedGroups: [adminGroup], isBlocked: false };
            const { queryByTestId, queryByLabelText } = render(
                <EditUserPermissionsDialog user={user} onClose={() => {}} />,
                {}, { additionalMocks: mocks(user) }
            );
            await waitFor(() => {
                expect(queryByTestId('DialogTitle')).toHaveTextContent('Ernesto Guevara');
            });
            expect(queryByLabelText('Administrator')).toBeChecked();
            expect(queryByLabelText('Lehrer')).not.toBeChecked();
            expect(queryByTestId('DynamicGroups')).toHaveTextContent(`Über Einschreibeschlüssel zugewiesene Gruppen:Lehrer`);
            done();
        });

        it('should assign new group on click', async done => {
            let mutationHasBeenCalled = false;
            const user = {
                ...SomeUser,
                groups: [adminGroup, lehrerGroup],
                assignedGroups: [adminGroup],
                isBlocked: false
            };
            const additionalMocks = [
                ...mocks(user),
                {
                    request: { query: SetUserGroupsMutation, variables: { id: SomeUser.id, groupIds: [adminGroup.id, elternGroup.id] } },
                    result: () => {
                        mutationHasBeenCalled = true;
                        return {
                            data: { user: { ...user, assignedGroups: [...user.assignedGroups, elternGroup] } }
                        };
                    }
                }
            ];
            const { findByLabelText, queryByLabelText, debug } = render(
                <EditUserPermissionsDialog user={user} onClose={() => {}} />,
                {}, { additionalMocks }
            );
            await waitFor(() => {
                expect(userInfoLoaded).toEqual(true);
            });
            const elternGroupCheckbox = await findByLabelText('Eltern');
            expect(elternGroupCheckbox).not.toBeChecked();
            userEvent.click(elternGroupCheckbox);
            await waitFor(() => {
                expect(mutationHasBeenCalled).toEqual(true);
            });
            done();
        });

        it('should unassign new group on click', async done => {
            let mutationHasBeenCalled = false;
            const user = {
                ...SomeUser,
                groups: [adminGroup, lehrerGroup, elternGroup],
                assignedGroups: [adminGroup, elternGroup],
                isBlocked: false
            };
            const additionalMocks = [
                ...mocks(user),
                {
                    request: { query: SetUserGroupsMutation, variables: { id: SomeUser.id, groupIds: [adminGroup.id] } },
                    result: () => {
                        mutationHasBeenCalled = true;
                        return {
                            data: { user: { ...user, assignedGroups: [adminGroup] } }
                        };
                    }
                }
            ];
            const { findByLabelText } = render(
                <EditUserPermissionsDialog user={user} onClose={() => {}} />,
                {}, { additionalMocks }
            );
            await waitFor(() => {
                expect(userInfoLoaded).toEqual(true);
            });
            const elternGroupCheckbox = await findByLabelText('Eltern');
            expect(elternGroupCheckbox).toBeChecked();
            userEvent.click(elternGroupCheckbox);
            await waitFor(() => {
                expect(mutationHasBeenCalled).toEqual(true);
            });
            done();
        });

    });


    describe('show and select user block status', () => {
        it('should show if the user is blocked', async done => {
            const user = { ...SomeUser, groups: [adminGroup, lehrerGroup], assignedGroups: [adminGroup], isBlocked: true };
            const { queryByTestId, queryByLabelText } = render(
                <EditUserPermissionsDialog user={user} onClose={() => {}} />,
                {}, { additionalMocks: mocks(user) }
            );
            await waitFor(() => {
                expect(queryByTestId('DialogTitle')).toHaveTextContent('Ernesto Guevara');
                expect(queryByTestId('UserBlockedIcon')).not.toBeNull();
            });
            done();
        });

        it('should block user when click on \'block\' button', async done => {
            let mutationHasBeenCalled = false;
            const user = {
                ...SomeUser,
                groups: [adminGroup, lehrerGroup],
                assignedGroups: [adminGroup],
                isBlocked: false
            };
            const additionalMocks = [
                ...mocks(user),
                {
                    request: { query: SetUserBlockedMutation, variables: { id: SomeUser.id, isBlocked: true } },
                    result: () => {
                        mutationHasBeenCalled = true;
                        return {
                            data: { user: { ...user, isBlocked: true } }
                        };
                    }
                }
            ];
            const { findByTestId } = render(
                <EditUserPermissionsDialog user={user} onClose={() => {}} />,
                {}, { additionalMocks }
            );
            const blockButton = await findByTestId('BlockButton');
            await waitFor(() => {
                expect(blockButton).toHaveTextContent('Nutzer sperren');
            });
            userEvent.click(blockButton);
            await waitFor(() => {
                expect(mutationHasBeenCalled).toEqual(true);
            });
            done();
        });

        it('should unblock user when click on \'unblock\' button', async done => {
            let mutationHasBeenCalled = false;
            const user = {
                ...SomeUser,
                groups: [adminGroup, lehrerGroup],
                assignedGroups: [adminGroup],
                isBlocked: true
            };
            const additionalMocks = [
                ...mocks(user),
                {
                    request: { query: SetUserBlockedMutation, variables: { id: SomeUser.id, isBlocked: false } },
                    result: () => {
                        mutationHasBeenCalled = true;
                        return {
                            data: { user: { ...user, isBlocked: false } }
                        };
                    }
                }
            ];
            const { findByTestId } = render(
                <EditUserPermissionsDialog user={user} onClose={() => {}} />,
                {}, { additionalMocks }
            );
            const blockButton = await findByTestId('BlockButton');
            await waitFor(() => {
                expect(blockButton).toHaveTextContent('Nutzer wieder freischalten.');
            });
            userEvent.click(blockButton);
            await waitFor(() => {
                expect(mutationHasBeenCalled).toEqual(true);
            });
            done();
        });
    });

});
