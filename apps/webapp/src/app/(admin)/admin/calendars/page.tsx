import React from 'react';
import dynamic from 'next/dynamic';
import { getClient } from 'api/client';
import { GET_CALENDARS } from './_graphql';
import { CircularProgress } from '@lotta-schule/hubert';
import { t } from 'i18next';

const DynamicCalendarView = dynamic(
  () => import('./_component/CalendarWrapper'),
  {
    ssr: false,
  }
);

async function CalendarPage() {
  const {
    data: { calendars },
  } = await getClient().query({
    query: GET_CALENDARS,
  });

  return (
    <div
      style={{
        height: 'auto',
        width: '100%',
        paddingInline: 'var(--lotta-spacing)',
      }}
    >
      <React.Suspense
        fallback={<CircularProgress label={t('loading calendar')} />}
      >
        <DynamicCalendarView calendars={calendars} />
      </React.Suspense>
    </div>
  );
}

export default CalendarPage;
