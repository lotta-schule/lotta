'use client';

import * as React from 'react';
import CalendarView from './CalendarView';
import { CalendarProvider } from './CalendarContext';

export const CalendarWrapper = React.memo(
  ({
    calendars,
  }: {
    calendars: React.ComponentProps<typeof CalendarView>['calendars'];
  }) => {
    return (
      <CalendarProvider activeCalendars={calendars}>
        <CalendarView calendars={calendars} />
      </CalendarProvider>
    );
  }
);
CalendarWrapper.displayName = 'CalendarWrapper';

export default CalendarWrapper;
