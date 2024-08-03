'use client';

import * as React from 'react';
import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { useTranslation } from 'react-i18next';

import './CalendarView.scss';

export const CalendarView = React.memo(() => {
  const { t } = useTranslation();
  return (
    <div style={{ height: '100%', paddingBlock: 'var(--lotta-spacing)' }}>
      <Calendar
        localizer={dateFnsLocalizer({
          format,
          parse,
          startOfWeek,
          getDay,
          locales: { de_DE: de },
        })}
        view="month"
        views={{
          month: true,
          week: false,
          work_week: false,
          agenda: false,
          day: false,
        }}
        culture="de_DE"
        messages={{
          day: t('day'),
          date: t('date'),
          event: t('event'),
          today: t('today'),
          allDay: t('all-day'),
          showMore: (count) => t('show {count} more', { count }),
          time: t('time'),
          yesterday: t('yesterday'),
          tomorrow: t('tomorrow'),
          next: t('next'),
          previous: t('previous'),
        }}
        eventPropGetter={(_event, _start, _end, selected) => ({
          style: {
            backgroundColor: `rgba(var(--lotta-primary-color), ${selected ? '1' : '0.8'})`,
          },
        })}
        dayPropGetter={(date, _resourceId) => {
          if (isSameDay(date, new Date())) {
            return {
              fontWeight: 'bolder',
              color: 'rgb(var(--lotta-primary-color))',
            };
          }
          return {};
        }}
        events={[
          {
            start: new Date('2019-08-01'),
            end: new Date('2024-08-01'),
            title: 'ABC',
          },
        ]}
      />
    </div>
  );
});
CalendarView.displayName = 'CalendarView';

export default CalendarView;
