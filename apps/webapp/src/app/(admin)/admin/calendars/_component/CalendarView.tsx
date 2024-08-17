'use client';

import * as React from 'react';
import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Calendar,
  dateFnsLocalizer,
  EventWrapperProps,
} from 'react-big-calendar';
import { useTranslation } from 'react-i18next';
import { CalendarToolbar } from './CalendarToolbar';
import { useLazyQuery, useApolloClient } from '@apollo/client';
import { CalendarModel } from './CreateCalendarDialog';
import { CalendarContext } from './CalendarContext';

import './CalendarView.scss';

const eventMapper = <T extends { start: string | Date; end: string | Date }>({
  start,
  end,
  ...rest
}: T) => {
  return {
    ...rest,
    start: new Date(start),
    end: new Date(end),
  };
};

import GetCalendarEventsQuery from 'api/query/GetCalendarEventsQuery.graphql';

export const CalendarView = React.memo(
  ({ calendars }: { calendars: CalendarModel[] }) => {
    const { t } = useTranslation();
    const client = useApolloClient();
    const { activeCalendarIds } = React.use(CalendarContext);
    const [events, setEvents] = React.useState<
      {
        id: string;
        summary: string;
        description: string;
        start: Date;
        end: Date;
        isFullDay: boolean;
        calendar: { id: string };
      }[]
    >([]);

    const [fetchEvents] = useLazyQuery<
      {
        calendarEvents: {
          id: string;
          summary: string;
          description: string;
          start: Date;
          end: Date;
          isFullDay: boolean;
          calendar: { id: string };
        }[];
      },
      { calendarId: string }
    >(GetCalendarEventsQuery);

    const fetchAllEvents = React.useCallback(async () => {
      const events = await Promise.all(
        activeCalendarIds.map(async (calendarId) => {
          const { data, previousData, error, loading, variables } =
            await fetchEvents({
              variables: { calendarId },
            });
          return data?.calendarEvents || [];
        })
      );
      return events.flat();
    }, [activeCalendarIds]);

    React.useEffect(() => {
      const observers = activeCalendarIds.map((calendarId) => {
        return client
          .watchQuery<
            {
              calendarEvents: {
                id: string;
                summary: string;
                description: string;
                start: Date;
                end: Date;
                isFullDay: boolean;
                calendar: { id: string };
              }[];
            },
            { calendarId: string }
          >({
            query: GetCalendarEventsQuery,
            variables: { calendarId },
          })
          .subscribe(({ data }) => {
            if (data) {
              setEvents((events) => {
                return events
                  .filter((ev) => ev.calendar.id !== calendarId)
                  .concat(data.calendarEvents.map(eventMapper));
              });
            }
          });
      });
      return () => {
        observers.forEach((o) => o.unsubscribe());
      };
    }, [activeCalendarIds]);

    React.useEffect(() => {
      let mounted = true;
      fetchAllEvents().then((events) => {
        if (mounted) {
          setEvents(
            events.map((ev) => ({
              ...ev,
              start: new Date(ev.start),
              end: new Date(ev.end),
            }))
          );
        }
      });
      return () => {
        setEvents([]);
        mounted = false;
      };
    }, [fetchAllEvents]);

    const getCalendarColor = React.useCallback(
      (calendarId: string) => {
        const calendar = calendars.find((c) => c.id === calendarId);
        return (
          calendar?.defaultColor || 'rgba(var(--lotta-primary-color), 0.75)'
        );
      },
      [calendars]
    );

    return (
      <Calendar
        localizer={dateFnsLocalizer({
          format,
          parse,
          startOfWeek,
          getDay,
          locales: { de_DE: de },
        })}
        view="month"
        views={{
          month: true,
          week: false,
          work_week: false,
          agenda: false,
          day: false,
        }}
        culture="de_DE"
        messages={{
          day: t('day'),
          date: t('date'),
          event: t('event'),
          today: t('today'),
          allDay: t('all-day'),
          showMore: (count) => t('show {count} more', { count }),
          time: t('time'),
          yesterday: t('yesterday'),
          tomorrow: t('tomorrow'),
          next: t('next'),
          previous: t('previous'),
        }}
        eventPropGetter={(
          event: (typeof events)[number],
          _start,
          _end,
          _selected
        ) => ({
          style: {
            backgroundColor: getCalendarColor(event.calendar.id),
          },
          title: event.summary,
        })}
        dayPropGetter={(date, _resourceId) => {
          if (isSameDay(date, new Date())) {
            return {
              fontWeight: 'bolder',
              color: 'rgb(var(--lotta-primary-color))',
            };
          }
          return {};
        }}
        events={events.map((event) => ({
          ...event,
          title: event.summary,
        }))}
        components={{
          toolbar: CalendarToolbar,
          eventWrapper: ({
            event,
            children,
          }: React.PropsWithChildren<
            EventWrapperProps<(typeof events)[number]>
          >) => {
            const { isCalendarActive } = React.use(CalendarContext);
            if (!isCalendarActive(event.calendar.id)) {
              return null;
            }

            return children;
          },
        }}
      />
    );
  }
);
CalendarView.displayName = 'CalendarView';

export default CalendarView;
