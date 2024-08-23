import * as React from 'react';
import { invariant } from '@epic-web/invariant';
import {
  add,
  differenceInDays,
  differenceInMonths,
  differenceInSeconds,
  differenceInWeeks,
  differenceInYears,
  format,
  isBefore,
} from 'date-fns';

type recurrence = {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  until?: string;
  count?: number;
} | null;

export const useUnfoldedEvents = <
  T extends { id: string; start: Date; end: Date; recurrence?: recurrence },
>(
  events: T[],
  rangeStart: Date,
  rangeEnd: Date
) => {
  return React.useMemo(() => {
    const propMap = {
      DAILY: 'days',
      WEEKLY: 'weeks',
      MONTHLY: 'months',
      YEARLY: 'years',
    } as const;
    const diffFuncMap = {
      DAILY: differenceInDays,
      WEEKLY: differenceInWeeks,
      MONTHLY: differenceInMonths,
      YEARLY: differenceInYears,
    } as const;
    return events
      .map((event) => {
        if (!event.recurrence || !propMap[event.recurrence.frequency]) {
          return [event];
        }

        const eventDuration = differenceInSeconds(event.end, event.start);
        const diffProp = propMap[event.recurrence.frequency];
        invariant(diffProp, 'Invalid recurrence frequency');
        const diffFunc = diffFuncMap[event.recurrence.frequency];
        invariant(diffFunc, 'Invalid recurrence frequency');

        const diff = diffFunc(rangeStart, event.start);
        const result = [];
        let current = add(event.start, {
          [diffProp]: diff - (diff % event.recurrence.interval),
        });
        while (
          isBefore(current, new Date(event.recurrence.until || rangeEnd)) &&
          (!event.recurrence.count || result.length < event.recurrence.count)
        ) {
          const {
            id: eventId,
            recurrence: _recurrence,
            ...copyEventData
          } = event;
          result.push({
            id: `${eventId}-${format(current, 'yyyy-MM-dd')}`,
            ...copyEventData,
            start: current,
            end: add(current, { seconds: eventDuration }),
            originalEvent: event,
          });
          current = add(current, { [diffProp]: event.recurrence.interval });
        }
        return result;
      })
      .flat() as (T | (Omit<T, 'recurrence'> & { originalEvent: T }))[];
  }, [events, rangeStart, rangeEnd]);
};
