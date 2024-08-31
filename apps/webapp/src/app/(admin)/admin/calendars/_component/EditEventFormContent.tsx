import * as React from 'react';
import {
  Label,
  Input,
  Checkbox,
  Select,
  Option,
  Collapse,
} from '@lotta-schule/hubert';
import { useSuspenseQuery } from '@apollo/client';
import {
  addDays,
  addHours,
  endOfDay,
  format,
  isAfter,
  isBefore,
  isSameDay,
} from 'date-fns';
import { invariant } from '@epic-web/invariant';
import { useTranslation } from 'react-i18next';
import { FragmentOf } from 'gql.tada';
import { GET_CALENDARS, RECURRENCE_FRAGMENT } from '../_graphql';
import clsx from 'clsx';

import styles from './EditEventFormContent.module.scss';

export type EditEventFormContentProps = {
  event: {
    summary: string;
    description: string;
    date: Date;
    endDate: Date;
    isFullDay: boolean;
    calendarId: string;
    recurrence: FragmentOf<typeof RECURRENCE_FRAGMENT> | null;
  };
  onUpdate: (event: EditEventFormContentProps['event']) => void;
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
      () => !isSameDay(event.date, event.endDate),
      [event.date, event.endDate]
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
            value={event.description}
            onChange={(e) =>
              onUpdate({ ...event, description: e.currentTarget.value })
            }
          />
        </Label>

        <div className={styles.configRow}>
          <Select
            title={t('calendar')}
            value={event.calendarId}
            onChange={(calendarId) => onUpdate({ ...event, calendarId })}
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
                  ...(!isSelected ? { endDate: addHours(event.date, 1) } : {}),
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
                  endDate: selected
                    ? endOfDay(addDays(event.date, 1))
                    : addHours(event.date, 1),
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
              value={event.date.toISOString().split('T')[0]}
              onChange={(e) => {
                const [year, month, day] = e.currentTarget.value
                  .split('-')
                  .map((v) => parseInt(v, 10));
                invariant(year !== undefined && month && day, 'Invalid date');
                const newDate = new Date(event.date);
                newDate.setFullYear(year);
                newDate.setMonth(month - 1);
                newDate.setDate(day);

                onUpdate({
                  ...event,
                  date: newDate,
                  endDate: (() => {
                    if (isMultipleDays) {
                      if (isAfter(endOfDay(newDate), endOfDay(event.endDate))) {
                        return addDays(newDate, 1);
                      }
                    } else if (event.isFullDay) {
                      return addHours(newDate, 1);
                    } else {
                      const newEndDate = new Date(event.endDate);
                      newEndDate.setFullYear(newDate.getFullYear());
                      newEndDate.setMonth(newDate.getMonth());
                      newEndDate.setDate(newDate.getDate());

                      return newEndDate;
                    }

                    return event.endDate;
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
              value={format(event.date, 'HH:mm')}
              onChange={(e) => {
                const [hours = 0, minutes = 0, seconds = 0] =
                  e.currentTarget.value.split(':').map((v) => parseInt(v, 10));
                invariant(
                  hours !== undefined && minutes !== undefined,
                  'Hours and minutes are required'
                );
                const newDate = new Date(event.date);
                newDate.setHours(hours);
                newDate.setMinutes(minutes);
                newDate.setSeconds(seconds);
                onUpdate({
                  ...event,
                  date: newDate,
                  endDate: isAfter(newDate, event.endDate)
                    ? addHours(newDate, 1)
                    : event.endDate,
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
              value={event.endDate ? format(event.endDate, 'HH:mm') : ''}
              onChange={(e) => {
                const [hours = 0, minutes = 0, seconds = 0] =
                  e.currentTarget.value.split(':').map((v) => parseInt(v, 10));
                invariant(
                  hours !== undefined && minutes !== undefined,
                  'Hours and minutes are required'
                );
                const newDate = new Date(event.date);
                newDate.setHours(hours);
                newDate.setMinutes(minutes);
                newDate.setSeconds(seconds);

                onUpdate({
                  ...event,
                  endDate: newDate,
                });
              }}
              onBlur={() => {
                onUpdate({
                  ...event,
                  date: isBefore(event.endDate, event.date)
                    ? addHours(event.endDate, -1)
                    : event.date,
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
                value={event.endDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  invariant(e.currentTarget.valueAsDate, 'Invalid date');
                  const newDate = endOfDay(e.currentTarget.valueAsDate);
                  onUpdate({
                    ...event,
                    date: isBefore(newDate, event.date)
                      ? addDays(newDate, -1)
                      : event.date,
                    endDate: newDate,
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
