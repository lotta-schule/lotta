import * as React from 'react';
import { omit } from 'lodash';
import { render, waitFor } from 'test/util';
import { KeinErSieEsUser, SomeUser, SomeUserin } from 'test/fixtures';
import { SearchUserField } from './SearchUserField';
import SearchUsersQuery from 'api/query/SearchUsersQuery.graphql';
import userEvent from '@testing-library/user-event';

describe('shared/layouts/userManagment/SearchUserField', () => {
    it('should render without crashing', () => {
        render(<SearchUserField onSelectUser={() => {}} />);
    });

    it('should disable the text input when prop "disabled" is passed', () => {
        const screen = render(
            <SearchUserField disabled onSelectUser={() => {}} />,
            {},
            {}
        );
        expect(
            screen.getByRole('textbox', { name: /nutzer suchen/i })
        ).toBeDisabled();
    });

    describe('searching users', () => {
        const additionalMocks = [
            {
                request: {
                    query: SearchUsersQuery,
                    variables: { searchtext: 'Michel' },
                },
                result: { data: { users: [KeinErSieEsUser, SomeUserin] } },
            },
        ];

        it('should show the correct search results for a search term', async () => {
            const [{ request, result }] = additionalMocks;
            const networkFn = jest.fn(() => ({ ...result }));
            const screen = render(
                <SearchUserField onSelectUser={() => {}} />,
                {},
                {
                    currentUser: SomeUser,
                    additionalMocks: [{ request, result: networkFn }],
                }
            );
            userEvent.type(
                screen.getByRole('textbox', { name: /nutzer suchen/i }),
                'Michel'
            );
            await waitFor(() => {
                expect(networkFn).toHaveBeenCalled();
            });
            expect(screen.queryAllByRole('option')).toHaveLength(2);
        });

        it('should call "onSelectUser" with the correct userAvatar when selected', async () => {
            const selectUserFn = jest.fn();
            const screen = render(
                <SearchUserField onSelectUser={selectUserFn} />,
                {},
                { currentUser: SomeUser, additionalMocks }
            );
            userEvent.type(
                screen.getByRole('textbox', { name: /nutzer suchen/i }),
                'Michel'
            );
            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /michel dupond/i })
                ).toHaveTextContent('Michel Dupond');
            });
            userEvent.click(
                screen.getByRole('option', { name: /michel dupond/i })
            );
            expect(selectUserFn).toHaveBeenCalledWith(
                omit(KeinErSieEsUser, [
                    'email',
                    'enrollmentTokens',
                    'groups',
                    'hideFullName',
                    'lastSeen',
                    'unreadMessages',
                    'hasChangedDefaultPassword',
                ])
            );
        });
    });
});
