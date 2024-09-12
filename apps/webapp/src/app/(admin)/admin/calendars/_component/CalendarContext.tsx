import * as React from 'react';
import { ResultOf } from 'api/graphql';

import { GET_CALENDAR_EVENTS, GET_CALENDARS } from '../_graphql';

export const CalendarContext = React.createContext<{
  activeCalendarIds: string[];
  editingEvent:
    | ResultOf<typeof GET_CALENDAR_EVENTS>['calendarEvents'][number]
    | null;
  currentView: 'month' | 'day';
  currentDate: Date;
  setEditingEvent: (
    event: ResultOf<typeof GET_CALENDAR_EVENTS>['calendarEvents'][number] | null
  ) => void;
  setCurrentView: (view: 'month' | 'day') => void;
  setCurrentDate: (date: Date) => void;
  isCalendarActive: (calendarId: string) => boolean;
  toggleCalendar: (calendarId: string) => void;
}>({
  activeCalendarIds: [],
  editingEvent: null,
  currentView: 'month',
  currentDate: new Date(),
  setCurrentDate: () => {},
  setCurrentView: () => {},
  setEditingEvent: () => {},
  isCalendarActive: () => false,
  toggleCalendar: () => {},
});

export const CalendarProvider = ({
  activeCalendars,
  children,
}: React.PropsWithChildren<{
  activeCalendars: ResultOf<typeof GET_CALENDARS>['calendars'];
}>) => {
  const [activeCalendarIds, setActiveCalendarIds] = React.useState(
    activeCalendars.map((calendar) => calendar.id)
  );
  const [editingEvent, setEditingEvent] =
    React.useState<React.ContextType<typeof CalendarContext>['editingEvent']>(
      null
    );
  const [currentView, setCurrentView] = React.useState<'month' | 'day'>(
    'month'
  );
  const [currentDate, setCurrentDate] = React.useState(() => new Date());

  const isCalendarActive = React.useCallback(
    (calendarId: string) => activeCalendarIds.includes(calendarId),
    [activeCalendarIds]
  );

  const toggleCalendar = React.useCallback((calendarId: string) => {
    setActiveCalendarIds((ids) => {
      if (ids.includes(calendarId)) {
        return ids.filter((id) => id !== calendarId);
      }
      return [...ids, calendarId];
    });
  }, []);

  const value = React.useMemo(
    () => ({
      activeCalendarIds,
      editingEvent,
      currentView,
      currentDate,
      setCurrentView,
      setCurrentDate,
      setEditingEvent,
      isCalendarActive,
      toggleCalendar,
    }),
    [
      activeCalendarIds,
      editingEvent,
      currentView,
      currentDate,
      setCurrentView,
      setCurrentDate,
      setEditingEvent,
      isCalendarActive,
      toggleCalendar,
    ]
  );

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};
