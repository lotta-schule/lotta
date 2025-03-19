import React from 'react';
import { EventWrapperProps } from 'react-big-calendar';
import { useUnfoldedEvents } from '../_hook';
import { CalendarContext } from './CalendarContext';

type UnfoldedEvent = ReturnType<typeof useUnfoldedEvents>[0] & {
  calendar: { id: string };
};

export const CalendarEventWrapper = <T extends UnfoldedEvent>({
  event,
  children,
}: React.PropsWithChildren<EventWrapperProps<T>>) => {
  const { isCalendarActive } = React.use(CalendarContext);
  if (!isCalendarActive(event.calendar.id)) {
    return null;
  }

  return children;
};
