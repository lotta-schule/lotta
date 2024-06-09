import { cache } from 'react';
import { getClient } from 'api/client';
import { FeedbackModel } from 'model';

import GetFeedbackQuery from 'api/query/GetFeedbackQuery.graphql';

export const loadFeedback = cache(async () => {
  return await getClient()
    .query<{ feedbacks: FeedbackModel[] }>({
      query: GetFeedbackQuery,
    })
    .then(({ data }) => data?.feedbacks ?? []);
});
