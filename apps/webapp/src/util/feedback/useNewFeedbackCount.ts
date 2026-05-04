import { useQuery } from '@apollo/client/react';
import { FeedbackModel } from '#/model/index.js';
import { useCurrentUser } from '#/util/user/useCurrentUser.js';
import { User } from '#/util/model/index.js';

import GetFeedbackOverviewQuery from '#/api/query/GetFeedbackOverviewQuery.graphql';

export const useNewFeedbackCount = () => {
  const currentUser = useCurrentUser();
  const { data: feedbackOverviews } = useQuery<{
    feedbacks: Pick<
      FeedbackModel,
      | 'id'
      | 'isNew'
      | 'isForwarded'
      | 'isResponded'
      | 'insertedAt'
      | 'updatedAt'
    >[];
  }>(GetFeedbackOverviewQuery, {
    skip: !User.isAdmin(currentUser),
  });

  const newFeedbackBadgeNumber =
    feedbackOverviews?.feedbacks.filter((feedback) => {
      return !feedback.isForwarded && !feedback.isResponded;
    }).length ?? 0;

  return newFeedbackBadgeNumber;
};
