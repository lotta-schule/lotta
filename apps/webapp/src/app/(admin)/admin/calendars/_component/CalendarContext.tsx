import * as React from 'react';
import { CalendarModel } from './CreateCalendarDialog';

export const CalendarContext = React.createContext<{
  activeCalendarIds: string[];
  isCalendarActive: (calendarId: string) => boolean;
  toggleCalendar: (calendarId: string) => void;
}>({
  activeCalendarIds: [],
  isCalendarActive: () => false,
  toggleCalendar: () => {},
});

export const CalendarProvider = ({
  activeCalendars,
  children,
}: React.PropsWithChildren<{ activeCalendars: CalendarModel[] }>) => {
  const [activeCalendarIds, setActiveCalendarIds] = React.useState(
    activeCalendars.map((calendar) => calendar.id)
  );

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
    () => ({ activeCalendarIds, isCalendarActive, toggleCalendar }),
    [activeCalendarIds, isCalendarActive, toggleCalendar]
  );

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};
