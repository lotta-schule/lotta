'use client';
import * as React from 'react';
import {
  format,
  parse,
  startOfWeek,
  getDay,
  isSameDay,
  startOfMonth,
  endOfMonth,
  formatISO,
  endOfWeek,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { invariant } from '@epic-web/invariant';
import { useTranslation } from 'react-i18next';
import { CalendarToolbar } from './CalendarToolbar';
import { useApolloClient, useLazyQuery } from '@apollo/client/react';
import { CalendarContext } from './CalendarContext';
import { useUnfoldedEvents } from '../_hook';
import { ResultOf } from 'api/graphql';
import { EditEventDialog } from './EditEventDialog';
import { CalendarEventWrapper } from './CalendarEventWrapper';

import { GET_CALENDAR_EVENTS, GET_CALENDARS } from '../_graphql';

import './CalendarView.scss';

export const CalendarView = React.memo(
  ({
    calendars,
  }: {
    calendars: ResultOf<typeof GET_CALENDARS>['calendars'];
  }) => {
    const { t } = useTranslation();
    const client = useApolloClient();
    const {
      activeCalendarIds,
      editingEvent,
      currentView,
      currentDate,
      setCurrentView,
      setCurrentDate,
      setEditingEvent,
    } = React.use(CalendarContext);
    const [currentRange, setCurrentRange] = React.useState(() => ({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    }));

    const [from, latest] = React.useMemo(
      () => [
        startOfWeek(currentRange.start, { weekStartsOn: 1 }),
        endOfWeek(currentRange.end, { weekStartsOn: 1 }),
      ],
      [currentRange]
    );

    const [events, setEvents] = React.useState<
      ResultOf<typeof GET_CALENDAR_EVENTS>['calendarEvents']
    >([]);

    const unfoldedEvents = useUnfoldedEvents(events, from, latest);

    const [fetchEvents] = useLazyQuery(GET_CALENDAR_EVENTS);

    const fetchAllEvents = React.useCallback(async () => {
      const events = await Promise.all(
        activeCalendarIds.map(async (calendarId) => {
          const { data } = await fetchEvents({
            variables: {
              calendarId,
              from: formatISO(from),
              latest: formatISO(latest),
            },
          });
          return data?.calendarEvents || [];
        })
      );
      return events.flat();
    }, [activeCalendarIds, fetchEvents, from, latest]);

    React.useEffect(() => {
      const observers = activeCalendarIds.map((calendarId) => {
        return client
          .watchQuery({
            query: GET_CALENDAR_EVENTS,
            variables: {
              calendarId,
              from: formatISO(from),
              latest: formatISO(latest),
            },
          })
          .subscribe(({ data }) => {
            if (data) {
              setEvents((events) => {
                return events
                  .filter((ev) => ev.calendar.id !== calendarId)
                  .concat(data.calendarEvents);
              });
            }
          });
      });
      return () => {
        observers.forEach((o) => o.unsubscribe());
      };
    }, [activeCalendarIds, client, from, latest]);

    React.useEffect(() => {
      let mounted = true;
      fetchAllEvents().then((events) => {
        if (mounted) {
          setEvents(
            events.map((ev) => ({ ...ev, start: ev.start, end: ev.end }))
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
        return calendar?.color;
      },
      [calendars]
    );

    return (
      <>
        <Calendar
          localizer={dateFnsLocalizer({
            format,
            parse,
            startOfWeek,
            getDay,
            locales: { de_DE: de },
          })}
          date={currentDate}
          onNavigate={(date, _fromView, _action) => {
            setCurrentDate(date);
          }}
          onRangeChange={(range, view) => {
            if (view === 'day' || (!view && currentView === 'day')) {
              invariant(Array.isArray(range), 'Invalid range');
              const day = range[0];
              setCurrentRange({
                start: startOfWeek(startOfMonth(day)),
                end: endOfWeek(endOfMonth(day)),
              });
            }

            if (view === 'month' || (!view && currentView === 'month')) {
              invariant('start' in range && 'end' in range, 'Invalid range');
              setCurrentRange(range);
            }

            if (view && ['day', 'month'].includes(view)) {
              setCurrentView(view as 'day' | 'month');
            }
          }}
          view={currentView}
          views={{
            month: true,
            week: false,
            work_week: false,
            agenda: false,
            day: true,
          }}
          culture="de_DE"
          onSelectEvent={(event) => {
            const eventId =
              'originalEvent' in event ? event.originalEvent.id : event.id;
            const ev = events.find((ev) => ev.id === eventId);
            if (ev) {
              setEditingEvent(ev);
            }
          }}
          messages={{
            day: t('day'),
            date: t('date'),
            event: t('event'),
            today: t('today'),
            allDay: t('all-day'),
            showMore: (count: number) => t('{count} more', { count }),
            time: t('time'),
            yesterday: t('yesterday'),
            tomorrow: t('tomorrow'),
            next: t('next'),
            previous: t('previous'),
          }}
          eventPropGetter={(event, _start, _end, _selected) => ({
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
          events={unfoldedEvents.map((event) => ({
            ...event,
            title: event.summary,
          }))}
          components={{
            toolbar: CalendarToolbar,
            eventWrapper: CalendarEventWrapper<(typeof unfoldedEvents)[number]>,
          }}
          doShowMoreDrillDown
        />
        <EditEventDialog
          eventToBeEdited={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      </>
    );
  }
);
CalendarView.displayName = 'CalendarView';

export default CalendarView;
