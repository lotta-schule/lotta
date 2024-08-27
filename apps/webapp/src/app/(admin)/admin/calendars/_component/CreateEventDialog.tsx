import * as React from 'react';
import { useMutation, useSuspenseQuery } from '@apollo/client';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Label,
  Input,
  Button,
  Checkbox,
  Select,
  Option,
  Collapse,
  LoadingButton,
  ErrorMessage,
} from '@lotta-schule/hubert';
import {
  addDays,
  addHours,
  endOfDay,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfHour,
} from 'date-fns';
import { useTranslation } from 'react-i18next';
import { invariant } from '@epic-web/invariant';
import {
  CREATE_CALENDAR_EVENT,
  GET_CALENDAR_EVENTS,
  GET_CALENDARS,
  RECURRENCE_FRAGMENT,
} from '../_graphql';
import clsx from 'clsx';

import styles from './CreateEventDialog.module.scss';
import { FragmentOf } from 'gql.tada';

export type CreateEventDialogProps = {
  isOpen: boolean;
  onClose(): void;
};

export const CreateEventDialog = React.memo(
  ({ isOpen, onClose }: CreateEventDialogProps) => {
    const {
      data: { calendars },
    } = useSuspenseQuery(GET_CALENDARS, {
      fetchPolicy: 'cache-first',
    });

    const nameInputRef = React.useRef<React.ComponentRef<'input'>>(null);

    const { t } = useTranslation();
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [calendarId, setCalendarId] = React.useState(calendars.at(0)?.id);
    const [date, setDate] = React.useState(() => startOfHour(new Date()));
    const [endDate, setEndDate] = React.useState(() => addHours(date, 1));
    const [isFullDay, setIsAllDay] = React.useState(true);
    const [recurrence, dispatchRecurrence] = React.useState<FragmentOf<
      typeof RECURRENCE_FRAGMENT
    > | null>(null);

    const isMultipleDays = React.useMemo(
      () => !isSameDay(date, endDate),
      [date, endDate]
    );

    const [createEvent, { loading: isLoading, error }] = useMutation(
      CREATE_CALENDAR_EVENT,
      {
        variables: {
          calendarId: calendarId ?? null!,
          data: {
            summary: name,
            description,
            start: date.toISOString(),
            end: endDate?.toISOString(),
            isFullDay,
            recurrence,
          },
        },
        refetchQueries: [GET_CALENDAR_EVENTS],
      }
    );

    const resetForm = () => {
      setName('');
      setDescription('');
      setCalendarId(calendars.at(0)?.id);
      setDate(startOfHour(new Date()));
      setEndDate(addHours(date, 1));
      setIsAllDay(true);
      dispatchRecurrence(null);
    };

    React.useEffect(() => {
      if (isOpen) {
        nameInputRef.current?.focus();
      } else {
        resetForm();
      }
    }, [isOpen]);

    return (
      <Dialog
        open={isOpen}
        onRequestClose={onClose}
        title={t('create event')}
        className={styles.root}
      >
        <form>
          <DialogContent>
            <ErrorMessage error={error} />
            <div className={clsx(styles.row, styles.nameRow)}>
              <Label label={t('name')} style={{ flex: 1 }}>
                <Input
                  ref={nameInputRef}
                  id="name"
                  disabled={isLoading}
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                />
              </Label>
            </div>
            <Label label={t('description')}>
              <Input
                multiline
                id="description"
                disabled={isLoading}
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
              />
            </Label>

            <div className={styles.configRow}>
              <Select
                title={t('calendar')}
                value={calendarId}
                onChange={setCalendarId}
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
                  recurrence ? recurrence.interval + recurrence.frequency : ''
                }
                onChange={(value) => {
                  const regex = /(?<interval>\d+)(?<frequency>\w+)/;
                  const match = regex.exec(value);
                  invariant(match, 'Invalid value');
                  const { interval, frequency } = match.groups!;
                  dispatchRecurrence({
                    interval: parseInt(interval, 10),
                    frequency: frequency as any,
                    until: null,
                    daysOfWeek: null,
                    daysOfMonth: null,
                    occurrences: null,
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
                  isDisabled={isLoading}
                  isSelected={isFullDay}
                  onChange={(isSelected) => {
                    setIsAllDay(isSelected);
                    if (!isSelected) {
                      setEndDate(addHours(date, 1));
                    }
                  }}
                >
                  {t('all-day')}
                </Checkbox>
                <Checkbox
                  id="multipleDays"
                  isDisabled={isLoading}
                  isSelected={isMultipleDays}
                  onChange={(selected) => {
                    if (selected) {
                      setEndDate(endOfDay(addDays(date, 1)));
                    } else {
                      setEndDate(addHours(date, 1));
                    }
                  }}
                  className={clsx(styles.mayBeInvisible, {
                    [styles.isVisible]: isFullDay,
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
                  value={date.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const [year, month, day] = e.currentTarget.value
                      .split('-')
                      .map((v) => parseInt(v, 10));
                    invariant(
                      year !== undefined && month && day,
                      'Invalid date'
                    );
                    const newDate = new Date(date);
                    newDate.setFullYear(year);
                    newDate.setMonth(month - 1);
                    newDate.setDate(day);

                    setDate(newDate);

                    if (isMultipleDays) {
                      if (isAfter(endOfDay(newDate), endOfDay(endDate))) {
                        setEndDate(addDays(newDate, 1));
                      }
                    } else if (isFullDay) {
                      setEndDate(addHours(newDate, 1));
                    } else {
                      setEndDate((endDate) => {
                        const newEndDate = new Date(endDate);
                        newEndDate.setFullYear(newDate.getFullYear());
                        newEndDate.setMonth(newDate.getMonth());
                        newEndDate.setDate(newDate.getDate());

                        return newEndDate;
                      });
                    }
                  }}
                  disabled={isLoading}
                />
              </Label>
              <Label
                label={t('start time')}
                style={{ flexGrow: 1 }}
                className={clsx(styles.mayBeInvisible, {
                  [styles.isVisible]: !isFullDay,
                })}
              >
                <Input
                  type="time"
                  id="starttime"
                  disabled={isLoading}
                  value={format(date, 'HH:mm')}
                  onChange={(e) => {
                    const [hours = 0, minutes = 0, seconds = 0] =
                      e.currentTarget.value
                        .split(':')
                        .map((v) => parseInt(v, 10));
                    invariant(
                      hours !== undefined && minutes !== undefined,
                      'Hours and minutes are required'
                    );
                    const newDate = new Date(date);
                    newDate.setHours(hours);
                    newDate.setMinutes(minutes);
                    newDate.setSeconds(seconds);
                    setDate(newDate);

                    if (isAfter(newDate, endDate)) {
                      setEndDate(addHours(newDate, 1));
                    }
                  }}
                />
              </Label>
              <Label
                label={t('end time')}
                style={{ flexGrow: 1 }}
                className={clsx(styles.mayBeInvisible, {
                  [styles.isVisible]: !isFullDay,
                })}
              >
                <Input
                  type="time"
                  id="endtime"
                  disabled={isLoading}
                  value={endDate ? format(endDate, 'HH:mm') : ''}
                  onChange={(e) => {
                    const [hours = 0, minutes = 0, seconds = 0] =
                      e.currentTarget.value
                        .split(':')
                        .map((v) => parseInt(v, 10));
                    invariant(
                      hours !== undefined && minutes !== undefined,
                      'Hours and minutes are required'
                    );
                    const newDate = new Date(date);
                    newDate.setHours(hours);
                    newDate.setMinutes(minutes);
                    newDate.setSeconds(seconds);
                    setEndDate(newDate);

                    if (isBefore(newDate, date)) {
                      setDate(addHours(newDate, -1));
                    }
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
                    value={endDate?.toISOString().split('T')[0]}
                    onChange={(e) => {
                      invariant(e.currentTarget.valueAsDate, 'Invalid date');
                      const newDate = endOfDay(e.currentTarget.valueAsDate);
                      setEndDate(newDate);
                      if (isBefore(newDate, date)) {
                        setDate(addDays(newDate, -1));
                      }
                    }}
                    disabled={isLoading}
                  />
                </Label>
              </div>
            </Collapse>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => onClose()}>{t('close')}</Button>
            <LoadingButton
              disabled={
                isLoading ||
                !name ||
                !calendarId ||
                !date ||
                (!(isFullDay && !isMultipleDays) && isAfter(date, endDate))
              }
              type="submit"
              onAction={async (e) => {
                e.preventDefault();
                await createEvent();
              }}
              onComplete={() => {
                onClose();
              }}
            >
              {t('save')}
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
);
CreateEventDialog.displayName = 'CreateEventDialog';
