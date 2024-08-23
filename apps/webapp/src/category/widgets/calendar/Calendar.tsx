import * as React from 'react';
import { ErrorMessage, List, LinearProgress } from '@lotta-schule/hubert';
import { useApolloClient } from '@apollo/client';
import { CalendarEventModel } from 'model/CalendarEventModel';
import {
  WidgetModel,
  CalendarWidgetCalendarConfig,
  WidgetModelType,
} from 'model';
import { CalendarEntry } from './CalendarEntry';
import { Icon } from 'shared/Icon';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { graphql } from 'api/graphql';

import styles from './Calendar.module.scss';

export interface CalendarProps {
  widget: WidgetModel<WidgetModelType.Calendar>;
}

export const GET_CALENDAR = graphql(`
  query GetCalendar($url: String!, $days: Int) {
    calendar: externalCalendarEvents(url: $url, days: $days) {
      uid
      summary
      description
      start
      end
    }
  }
`);

export const Calendar = React.memo<CalendarProps>(({ widget }) => {
  const isMounted = React.useRef(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [events, setEvents] = React.useState<
    (CalendarEventModel & { calendar: CalendarWidgetCalendarConfig })[]
  >([]);
  const [error, setError] = React.useState<Error | null>(null);

  const calendars = React.useMemo(() => {
    return widget.configuration?.calendars ?? [];
  }, [widget.configuration]);
  const apolloClient = useApolloClient();

  React.useEffect(
    () => () => {
      isMounted.current = false;
    },
    []
  );

  React.useEffect(() => {
    setIsLoading(true);
    setError(null);
    Promise.all(
      (calendars || [])
        .filter((calendar) => calendar.url !== undefined)
        .map(async (calendar) => {
          const { data } = await apolloClient.query({
            query: GET_CALENDAR,
            variables: { url: calendar.url!, days: calendar.days },
          });
          return data?.calendar.map((event) => ({ ...event, calendar }));
        })
    )
      .then((eventsArr: any[]) => {
        if (isMounted.current) {
          setEvents(eventsArr.flat());
          setIsLoading(false);
        }
      })
      .catch((err: Error) => {
        if (isMounted.current) {
          setIsLoading(false);
          setError(err);
        }
      });
  }, [apolloClient, calendars]);

  if (isLoading) {
    return (
      <LinearProgress
        isIndeterminate
        aria-label={'Kalenderdaten werden geladen'}
      />
    );
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (events) {
    return (
      <div className={styles.root}>
        {calendars && calendars.length > 1 && (
          <figcaption className={styles.figcaption}>
            {calendars.map((calendar, i) => (
              <figure key={i} aria-label={`Legende: ${calendar.name}`}>
                <Icon
                  icon={faCircle}
                  fontSize={'inherit'}
                  className={styles.calendarColorDot}
                  style={{
                    color: calendar.color || 'red',
                    fontSize: '0.4em',
                    verticalAlign: 'baseline',
                  }}
                />
                <figcaption>{calendar.name}</figcaption>
              </figure>
            ))}
          </figcaption>
        )}
        <List className={styles.list}>
          {[...events]
            .sort(
              (ev1, ev2) =>
                new Date(ev1.start).getTime() - new Date(ev2.start).getTime()
            )
            .map((event, i) => {
              return (
                <CalendarEntry
                  event={event}
                  dot={
                    calendars.length > 1 ? event.calendar.color || 'red' : null
                  }
                  key={i}
                />
              );
            })}
        </List>
      </div>
    );
  }
  return null;
});
Calendar.displayName = 'CalendarWidget';
