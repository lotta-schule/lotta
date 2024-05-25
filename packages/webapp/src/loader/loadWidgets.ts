import { cache } from 'react';
import { getClient } from 'api/client';
import { WidgetModel } from 'model';

import GetWidgetsQuery from 'api/query/GetWidgetsQuery.graphql';

export const loadWidgets = cache(async () => {
  return await getClient()
    .query<{ widgets: WidgetModel[] }>({
      query: GetWidgetsQuery,
    })
    .then(({ data }) => data?.widgets ?? []);
});
