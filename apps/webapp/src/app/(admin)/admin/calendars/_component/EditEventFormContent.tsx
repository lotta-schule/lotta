import * as React from 'react';
import {
  Label,
  Input,
  Checkbox,
  Select,
  Option,
  Collapse,
} from '@lotta-schule/hubert';
import { useSuspenseQuery } from '@apollo/client/react';
import {
  addDays,
  addHours,
  endOfDay,
  format,
  getHours,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  parse,
  startOfDay,
  subDays,
  subHours,
  min,
} from 'date-fns';
import { invariant } from '@epic-web/invariant';
import { useTranslation } from 'react-i18next';
import { FragmentOf } from 'gql.tada';
import { GET_CALENDARS, RECURRENCE_FRAGMENT } from '../_graphql';
import clsx from 'clsx';

import styles from './EditEventFormContent.module.scss';

export type EditEventInput = Omit<
  {
    summary: string;
    description: string | null;
    start: Date;
    end: Date;
    isFullDay: boolean;
    calendarId: string;
    recurrence: FragmentOf<typeof RECURRENCE_FRAGMENT> | null;
  },
  'calendar'
> & { calendarId: string | null };

export type EditEventFormContentProps = {
  event: EditEventInput;
  onUpdate: (event: EditEventInput) => void;
  disabled?: boolean;
};

export const EditEventFormContent = React.memo(
  ({ event, disabled, onUpdate }: EditEventFormContentProps) => {
    const {
      data: { calendars },
    } = useSuspenseQuery(GET_CALENDARS, {
      fetchPolicy: 'cache-first',
    });
    const { t } = useTranslation();
    const isMultipleDays = React.useMemo(
      () => !isSameDay(event.start, event.end),
      [event.start, event.end]
    );

    const composeNewDate = React.useCallback(
      ({ date, time }: { date: Date; time: Date }) => {
        const newDate = new Date(time);
        newDate.setFullYear(date.getFullYear());
        newDate.setMonth(date.getMonth());
        newDate.setDate(date.getDate());

        return newDate;
      },
      []
    );

    return (
      <div className={styles.root}>
        <div className={clsx(styles.row, styles.nameRow)}>
          <Label label={t('name')} style={{ flex: 1 }}>
            <Input
              id="name"
              disabled={disabled}
              value={event.summary}
              onChange={(e) =>
                onUpdate({ ...event, summary: e.currentTarget.value })
              }
            />
          </Label>
        </div>
        <Label label={t('description')}>
          <Input
            multiline
            id="description"
            disabled={disabled}
            value={event.description || ''}
            onChange={(e) =>
              onUpdate({ ...event, description: e.currentTarget.value })
            }
          />
        </Label>
        <div className={styles.configRow}>
          <Select
            title={t('calendar')}
            value={event.calendarId}
            onChange={(calendarId) => {
              onUpdate({ ...event, calendarId });
            }}
            disabled={disabled}
          >
            {calendars.map((calendar) => (
              <Option key={calendar.id} value={calendar.id}>
                {calendar.name}
              </Option>
            ))}
          </Select>

          <Select
            title={t('repetition')}
            value={
              event.recurrence
                ? event.recurrence.interval + event.recurrence.frequency
                : ''
            }
            disabled={disabled}
            onChange={(value) => {
              const regex = /(?<interval>\d+)(?<frequency>\w+)/;
              const match = regex.exec(value);
              invariant(match, 'Invalid value');
              const { interval, frequency } = match.groups!;
              onUpdate({
                ...event,
                recurrence: {
                  interval: parseInt(interval, 10),
                  frequency: frequency as any,
                  until: null,
                  daysOfWeek: null,
                  daysOfMonth: null,
                  occurrences: null,
                },
              });
            }}
          >
            <Option key={'none'} value={''}>
              {t('none')}
            </Option>
            <Option key={'daily'} value={'1DAILY'}>
              {t('daily')}
            </Option>
            <Option key={'weekly'} value={'1WEEKLY'}>
              {t('weekly')}
            </Option>
            <Option key={'biweekly'} value={'2WEEKLY'}>
              {t('biweekly')}
            </Option>
            <Option key={'monthly'} value={'1MONTHLY'}>
              {t('monthly')}
            </Option>
            <Option key={'yearly'} value={'1YEARLY'}>
              {t('yearly')}
            </Option>
          </Select>
          <div>
            <Checkbox
              id="allDay"
              isDisabled={disabled}
              isSelected={event.isFullDay}
              onChange={(isSelected) => {
                onUpdate({
                  ...event,
                  isFullDay: isSelected,
                  ...(!isSelected
                    ? {
                        end: min([
                          endOfDay(event.start),
                          addHours(event.start, 1),
                        ]),
                      }
                    : {}),
                });
              }}
            >
              {t('all-day')}
            </Checkbox>
            <Checkbox
              id="multipleDays"
              isDisabled={disabled}
              isSelected={isMultipleDays}
              onChange={(selected) => {
                onUpdate({
                  ...event,
                  end: selected
                    ? endOfDay(addDays(event.start, 1))
                    : min([endOfDay(event.start), addHours(event.start, 1)]),
                });
              }}
              className={clsx(styles.mayBeInvisible, {
                [styles.isVisible]: event.isFullDay,
              })}
            >
              {t('multiple days')}
            </Checkbox>
          </div>
        </div>
        <div className={styles.dateRow}>
          <Label label={t('date')} style={{ flexGrow: 1 }}>
            <Input
              type="date"
              id="startdate"
              value={format(event.start, 'yyyy-MM-dd')}
              onChange={(e) => {
                const value = parse(
                  e.currentTarget.value,
                  'yyyy-MM-dd',
                  new Date()
                );
                invariant(isValid(value), 'Invalid date');

                const newEnd = composeNewDate({ date: value, time: event.end });

                onUpdate({
                  ...event,
                  start: value,
                  end: isMultipleDays
                    ? event.end
                    : event.isFullDay
                      ? endOfDay(value)
                      : min([addHours(newEnd, 1), endOfDay(value)]),
                });
              }}
              onBlur={() => {
                const { start: newDate } = event;
                onUpdate({
                  ...event,
                  end: (() => {
                    if (isMultipleDays) {
                      if (isAfter(endOfDay(newDate), endOfDay(event.end))) {
                        return endOfDay(addDays(newDate, 1));
                      } else {
                        return event.end;
                      }
                    } else if (event.isFullDay) {
                      return endOfDay(newDate);
                    } else {
                      const newEndDate = new Date(event.end);
                      newEndDate.setFullYear(newDate.getFullYear());
                      newEndDate.setMonth(newDate.getMonth());
                      newEndDate.setDate(newDate.getDate());

                      if (isBefore(newEndDate, event.start)) {
                        return min([
                          endOfDay(newEndDate),
                          addHours(newEndDate, 1),
                        ]);
                      }

                      return event.end;
                    }
                  })(),
                });
              }}
              disabled={disabled}
            />
          </Label>
          <Label
            label={t('start time')}
            style={{ flexGrow: 1 }}
            className={clsx(styles.mayBeInvisible, {
              [styles.isVisible]: !event.isFullDay,
            })}
          >
            <Input
              type="time"
              id="starttime"
              disabled={disabled}
              value={format(event.start, 'HH:mm')}
              onChange={(e) => {
                const value = parse(e.currentTarget.value, 'HH:mm', new Date());

                if (!isValid(value)) {
                  return;
                }

                onUpdate({
                  ...event,
                  start: composeNewDate({ date: event.start, time: value }),
                });
              }}
              onBlur={() => {
                const { start: newDate } = event;
                onUpdate({
                  ...event,
                  end: isAfter(newDate, event.end)
                    ? min([endOfDay(newDate), addHours(newDate, 1)])
                    : event.end,
                });
              }}
            />
          </Label>
          <Label
            label={t('end time')}
            style={{ flexGrow: 1 }}
            className={clsx(styles.mayBeInvisible, {
              [styles.isVisible]: !event.isFullDay,
            })}
          >
            <Input
              type="time"
              id="endtime"
              disabled={disabled}
              value={event.end ? format(event.end, 'HH:mm') : ''}
              onChange={(e) => {
                const value = parse(e.currentTarget.value, 'HH:mm', new Date());

                if (!isValid(value)) {
                  return;
                }

                onUpdate({
                  ...event,
                  end: composeNewDate({
                    date: event.end,
                    time: value,
                  }),
                });
              }}
              onBlur={() => {
                onUpdate({
                  ...event,
                  start: isBefore(event.end, event.start)
                    ? getHours(event.end) < 1
                      ? startOfDay(event.end)
                      : subHours(event.end, 1)
                    : event.start,
                });
              }}
            />
          </Label>
        </div>
        <Collapse isOpen={isMultipleDays}>
          <div className={styles.dateRow}>
            <Label label={t('end date')} style={{ flexGrow: 1 }}>
              <Input
                type="date"
                id="enddate"
                value={event.end.toISOString().split('T')[0]}
                onChange={(e) => {
                  if (isValid(e.currentTarget.valueAsDate)) {
                    const newDate = endOfDay(e.currentTarget.valueAsDate!);
                    onUpdate({
                      ...event,
                      end: newDate,
                    });
                  }
                }}
                onBlur={() => {
                  const { end: newDate } = event;
                  onUpdate({
                    ...event,
                    start: isBefore(newDate, event.start)
                      ? subDays(newDate, 1)
                      : event.start,
                  });
                }}
                disabled={disabled}
              />
            </Label>
          </div>
        </Collapse>
      </div>
    );
  }
);
EditEventFormContent.displayName = 'EditEventFormContent';
