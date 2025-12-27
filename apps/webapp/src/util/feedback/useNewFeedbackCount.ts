import { useQuery } from '@apollo/client/react';
import { FeedbackModel } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User } from 'util/model';

import GetFeedbackOverviewQuery from 'api/query/GetFeedbackOverviewQuery.graphql';

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
