import { cache } from 'react';
import { getClient } from 'api/client';
import { FeedbackModel } from 'model';

import GetFeedbackQuery from 'api/query/GetFeedbackQuery.graphql';

export const loadFeedback = cache(async () => {
  const client = await getClient();
  return await client
    .query<{ feedbacks: FeedbackModel[] }>({
      query: GetFeedbackQuery,
    })
    .then(({ data }) => data?.feedbacks ?? []);
});
