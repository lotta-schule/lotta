import { MockLink } from '@apollo/client/testing';
import { renderHook, waitFor } from 'test/util';
import { useNewFeedbackCount } from './useNewFeedbackCount';
import { SomeUser, adminGroup } from 'test/fixtures';

import GetFeedbackOverviewQuery from 'api/query/GetFeedbackOverviewQuery.graphql';

describe('useNewFeedbackCount', () => {
  it('should return 0 if the user is not logged in', () => {
    const screen = renderHook(() => useNewFeedbackCount(), {}, {});

    expect(screen.result.current).toEqual(0);
  });

  it('should return the number of new feedbacks', async () => {
    const additionalMocks: MockLink.MockedResponse[] = [
      {
        request: { query: GetFeedbackOverviewQuery },
        result: {
          data: {
            feedbacks: [
              {
                id: '6543-feed-back-1234',
                insertedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isForwarded: false,
                isResponded: false,
                isNew: false,
              },
            ],
          },
        },
      },
    ];
    const screen = renderHook(
      () => useNewFeedbackCount(),
      {},
      { currentUser: { ...SomeUser, groups: [adminGroup] }, additionalMocks }
    );

    await waitFor(() => {
      expect(screen.result.current).toEqual(1);
    });
  });
});
