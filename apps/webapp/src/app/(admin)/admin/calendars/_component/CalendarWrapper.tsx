'use client';

import * as React from 'react';
import { CalendarModel } from './CreateCalendarDialog';
import CalendarView from './CalendarView';
import { CalendarProvider } from './CalendarContext';

export const CalendarWrapper = React.memo(
  ({ calendars }: { calendars: CalendarModel[] }) => {
    return (
      <CalendarProvider activeCalendars={calendars}>
        <CalendarView calendars={calendars} />
      </CalendarProvider>
    );
  }
);
CalendarWrapper.displayName = 'CalendarWrapper';
