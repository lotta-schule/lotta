import { cache } from 'react';
import { getClient } from 'api/client';
import { WidgetModel } from 'model';

import GetWidgetsQuery from 'api/query/GetWidgetsQuery.graphql';

export const loadWidgets = cache(async () => {
  const client = await getClient();
  return await client
    .query<{ widgets: WidgetModel[] }>({
      query: GetWidgetsQuery,
    })
    .then(({ data }) => data?.widgets ?? []);
});
