import { cache } from 'react';
import { getClient } from 'api/client';
import { CalendarModel } from 'app/(admin)/admin/calendars/_component/CreateCalendarDialog';

import GetCalendarsQuery from 'api/query/GetCalendarsQuery.graphql';

export const loadCalendars = cache(async () => {
  return await getClient()
    .query<{ calendars: CalendarModel[] }>({
      query: GetCalendarsQuery,
    })
    .then(({ data }) => data.calendars);
});
