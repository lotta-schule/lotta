import * as React from 'react';
import { ErrorMessage, List, LinearProgress } from '@lotta-schule/hubert';
import { useApolloClient } from '@apollo/client/react';
import { CalendarEventModel } from 'model/CalendarEventModel';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { addDays } from 'date-fns';
import {
  WidgetModel,
  WidgetModelType,
  CalendarWidgetExternalCalendarConfig,
  CalendarWidgetInternalCalendarConfig,
} from 'model';
import { CalendarEntry } from './CalendarEntry';
import { Icon } from 'shared/Icon';
import { graphql } from 'api/graphql';
import { useUnfoldedEvents } from 'app/(admin)/admin/calendars/_hook';

import styles from './Calendar.module.scss';

export interface CalendarProps {
  widget: WidgetModel<WidgetModelType.Calendar>;
}

export const GET_EXTERNAL_CALENDAR_EVENTS = graphql(`
  query GET_EXTERNAL_CALENDAR_EVENTS($url: String!, $days: Int) {
    calendar: externalCalendarEvents(url: $url, days: $days) {
      uid
      summary
      description
      start
      end
    }
  }
`);

export const Calendar = React.memo(({ widget }: CalendarProps) => {
  const isMounted = React.useRef(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [events, setEvents] = React.useState<
    (CalendarEventModel & {
      calendarConfig: CalendarWidgetExternalCalendarConfig;
    })[]
  >([]);
  const [error, setError] = React.useState<Error | null>(null);

  const calendars = React.useMemo(() => {
    return widget.configuration?.calendars ?? [];
  }, [widget.configuration]);

  const days = calendars.find((calendar) => calendar.days)?.days || 180;

  const unfoldedEvents = useUnfoldedEvents(
    widget.calendarEvents?.map((event) => ({
      ...event,
      calendarConfig: calendars.find(
        (calendarConfig) =>
          calendarConfig.type === 'internal' &&
          calendarConfig.calendarId === event.calendar.id
      ) as CalendarWidgetInternalCalendarConfig,
    })) ?? [],
    new Date(),
    addDays(new Date(), days)
  );

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
      (
        (calendars || []).filter(
          (calendar) => calendar.type !== 'internal' && !!calendar.url
        ) as CalendarWidgetExternalCalendarConfig[]
      ).map(async (calendarConfig) => {
        const { data } = await apolloClient.query({
          query: GET_EXTERNAL_CALENDAR_EVENTS,
          variables: { url: calendarConfig.url!, days: calendarConfig.days },
        });
        return data?.calendar.map((event) => ({ ...event, calendarConfig }));
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

  const combinedEvents = React.useMemo(
    () => [...unfoldedEvents, ...events],
    [events, unfoldedEvents]
  );

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
          {combinedEvents
            .toSorted(
              (ev1, ev2) =>
                new Date(ev1.start).getTime() - new Date(ev2.start).getTime()
            )
            .map((event, i) => {
              return (
                <CalendarEntry
                  event={event}
                  dot={
                    calendars.length > 1
                      ? ('calendarConfig' in event &&
                          event.calendarConfig.color) ||
                        'red'
                      : null
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
