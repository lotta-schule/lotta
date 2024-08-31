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
  until: string | null;
  count?: number;
} | null;

const eventMapper = <T extends { start: string; end: string }>({
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

export const useUnfoldedEvents = <
  T extends {
    id: string;
    start: string;
    end: string;
    recurrence: recurrence | null;
  },
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
      .map((originalEvent) => {
        const event = eventMapper(originalEvent);
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
      .flat();
  }, [events, rangeStart, rangeEnd]);
};
