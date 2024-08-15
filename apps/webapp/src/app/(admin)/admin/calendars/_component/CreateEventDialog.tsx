import * as React from 'react';
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
} from '@lotta-schule/hubert';
import { useTranslation } from 'react-i18next';
import { useSuspenseQuery } from '@apollo/client';
import {
  addDays,
  addHours,
  endOfDay,
  format,
  isSameDay,
  startOfHour,
} from 'date-fns';
import clsx from 'clsx';

import styles from './CreateEventDialog.module.scss';

import GetCalendarsQuery from 'api/query/GetCalendarsQuery.graphql';

export type CreateEventDialogProps = {
  isOpen: boolean;
  onClose(): void;
};

export const CreateEventDialog = React.memo(
  ({ isOpen, onClose }: CreateEventDialogProps) => {
    const {
      data: { calendars },
    } = useSuspenseQuery<{ calendars: { id: string; name: string }[] }>(
      GetCalendarsQuery,
      {
        fetchPolicy: 'cache-first',
      }
    );

    const { t } = useTranslation();
    const isLoading = false;
    const [calendarId, setCalendarId] = React.useState(calendars.at(0)?.id);
    const [date, setDate] = React.useState(() => startOfHour(new Date()));
    const [endDate, setEndDate] = React.useState<Date>(() => addHours(date, 1));
    const [isAllDay, setIsAllDay] = React.useState(true);
    const [repetition, setRepetition] = React.useState('');

    const isMultipleDays = React.useMemo(
      () => !isSameDay(date, endDate),
      [date, endDate]
    );

    return (
      <Dialog
        open={isOpen}
        onRequestClose={onClose}
        title={t('Create event')}
        className={styles.root}
      >
        <form>
          <DialogContent>
            <div className={clsx(styles.row, styles.nameRow)}>
              <Label label={t('name')} style={{ flex: 1 }}>
                <Input autoFocus={isOpen} id="name" disabled={isLoading} />
              </Label>
            </div>
            <Label label={t('description')}>
              <Input multiline id="description" disabled={isLoading} />
            </Label>

            <div className={styles.configRow}>
              <Select
                title={t('calendar')}
                value={calendarId}
                onChange={setCalendarId}
              >
                {calendars.map((calendar: any) => (
                  <Option key={calendar.id} value={calendar.id}>
                    {calendar.name}
                  </Option>
                ))}
              </Select>

              <Select
                title={t('repetition')}
                value={repetition}
                onChange={setRepetition}
              >
                <Option key={'none'} value={''}>
                  {t('none')}
                </Option>
                <Option key={'daily'} value={'daily'}>
                  {t('daily')}
                </Option>
                <Option key={'weekly'} value={'weekly'}>
                  {t('weekly')}
                </Option>
                <Option key={'biweekly'} value={'biweekly'}>
                  {t('biweekly')}
                </Option>
                <Option key={'monthly'} value={'monthly'}>
                  {t('monthly')}
                </Option>
                <Option key={'yearly'} value={'yearly'}>
                  {t('yearly')}
                </Option>
              </Select>
              <div>
                <Checkbox
                  id="allDay"
                  isDisabled={isLoading}
                  isSelected={isAllDay}
                  onChange={setIsAllDay}
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
                    [styles.isVisible]: isAllDay,
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
                    setDate((d) => {
                      const newDate = e.currentTarget.valueAsDate;
                      if (newDate) {
                        newDate.setHours(d.getHours());
                        newDate.setMinutes(d.getMinutes());
                        return newDate;
                      }
                      return d;
                    });
                  }}
                  disabled={isLoading}
                />
              </Label>
              <Label
                label={t('start time')}
                style={{ flexGrow: 1 }}
                className={clsx(styles.mayBeInvisible, {
                  [styles.isVisible]: !isAllDay,
                })}
              >
                <Input
                  type="time"
                  id="starttime"
                  disabled={isLoading}
                  value={format(date, 'HH:mm')}
                  onChange={(e) => {
                    const newTime = e.currentTarget.valueAsDate;
                    console.log({ newTime });
                  }}
                />
              </Label>
              <Label
                label={t('end time')}
                style={{ flexGrow: 1 }}
                className={clsx(styles.mayBeInvisible, {
                  [styles.isVisible]: !isAllDay,
                })}
              >
                <Input
                  type="time"
                  id="endtime"
                  disabled={isLoading}
                  value={endDate ? format(endDate, 'HH:mm') : ''}
                  onChange={(e) => {
                    const newTime = e.currentTarget.valueAsDate;
                    console.log({ newTime });
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
                      const newDate = e.currentTarget.valueAsDate;
                      if (newDate) {
                        setEndDate(endOfDay(newDate));
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
          </DialogActions>
        </form>
      </Dialog>
    );
  }
);
CreateEventDialog.displayName = 'CreateEventDialog';
