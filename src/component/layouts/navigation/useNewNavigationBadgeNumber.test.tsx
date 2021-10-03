import { FunctionComponent } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { MessageModel, UserModel } from 'model';
import { useNewMessagesBadgeNumber } from './useNewMessagesBadgeNumber';
import {
    getSomeMessages,
    KeinErSieEsUser,
    lehrerGroup,
    schuelerGroup,
    SomeUser,
    SomeUserin,
} from 'test/fixtures';
import { InMemoryCache } from '@apollo/client';
import ReceiveMessageSubscription from 'api/subscription/ReceiveMessageSubscription.graphql';
import GetCurrentUserQuery from 'api/query/GetCurrentUser.graphql';
import GetMessagesQuery from 'api/query/GetMessagesQuery.graphql';

const user = {
    ...SomeUser,
    groups: [schuelerGroup],
    lastSeen: '2019-01-01T01:00:00.000Z',
};

describe('component/layouts/navigation/useNewMessagesBadgeNumber', () => {
    const createWrapperForUserAndMessages = (
        currentUser: UserModel | null,
        messages: MessageModel[] = []
    ): FunctionComponent => {
        const cache = new InMemoryCache({ addTypename: false });
        cache.writeQuery({ query: GetCurrentUserQuery, data: { currentUser } });
        cache.writeQuery({ query: GetMessagesQuery, data: { messages } });
        // eslint-disable-next-line react/display-name
        return ({ children }) => (
            <MockedProvider
                mocks={[
                    {
                        request: { query: ReceiveMessageSubscription },
                        result: {},
                    },
                ]}
                cache={cache}
                addTypename={false}
            >
                <div>{children}</div>
            </MockedProvider>
        );
    };

    it('should return 0 if the user not logged in', () => {
        const screen = renderHook(() => useNewMessagesBadgeNumber(), {
            wrapper: createWrapperForUserAndMessages(null),
        });
        expect(screen.result.current).toEqual(0);
    });

    it('should return the correct badge number for messages to the user', async () => {
        const messages = [
            // these 5 must count
            ...getSomeMessages(SomeUserin, { to_user: user }),
            // these 5 must not count
            ...getSomeMessages(user, { to_user: SomeUserin }),
            // these 5 must not count
            ...getSomeMessages(SomeUserin, { to_user: user }).map((msg) => ({
                ...msg,
                insertedAt: '2018-11-28T07:00:09',
                updatedAt: '2018-11-28T07:00:09',
            })),
        ];

        const screen = renderHook(() => useNewMessagesBadgeNumber(), {
            wrapper: createWrapperForUserAndMessages(user, messages),
        });
        await waitFor(() => {
            expect(screen.result.current).toEqual(5);
        });
    });

    it('should return the correct badge number for a given user only', async () => {
        const messages = [
            // these 5 must count
            ...getSomeMessages(SomeUserin, { to_user: user }),
            // these 5 must not count
            ...getSomeMessages(user, { to_user: SomeUserin }),
            // these 5 must not count
            ...getSomeMessages(SomeUserin, { to_user: user }).map((msg) => ({
                ...msg,
                insertedAt: '2018-11-28T07:00:09',
                updatedAt: '2018-11-28T07:00:09',
            })),
            // these 5 must not count
            ...getSomeMessages(KeinErSieEsUser, { to_user: user }),
        ];

        const screen = renderHook(
            () => useNewMessagesBadgeNumber({ user: SomeUserin }),
            {
                wrapper: createWrapperForUserAndMessages(user, messages),
            }
        );
        await waitFor(() => {
            expect(screen.result.current).toEqual(5);
        });
    });

    it('should return the correct badge number for a given group only', async () => {
        const messages = [
            // these 5 must count
            ...getSomeMessages(SomeUserin, { to_group: schuelerGroup }),
            // these 5 must not count
            ...getSomeMessages(user, { to_user: SomeUserin }),
            // these 5 must not count
            ...getSomeMessages(SomeUserin, { to_group: schuelerGroup }).map(
                (msg) => ({
                    ...msg,
                    insertedAt: '2018-11-28T07:00:09',
                    updatedAt: '2018-11-28T07:00:09',
                })
            ),
            // these 5 must not count
            ...getSomeMessages(KeinErSieEsUser, { to_group: lehrerGroup }),
        ];

        const screen = renderHook(
            () => useNewMessagesBadgeNumber({ group: schuelerGroup }),
            {
                wrapper: createWrapperForUserAndMessages(user, messages),
            }
        );
        await waitFor(() => {
            expect(screen.result.current).toEqual(5);
        });
    });
});
