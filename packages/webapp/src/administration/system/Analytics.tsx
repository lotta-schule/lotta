import * as React from 'react';
import { useQuery } from '@apollo/client';
import { Label, Option, Select, Toolbar } from '@lotta-schule/hubert';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { Icon } from 'shared/Icon';
import { addMonths, format, isSameMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { MetricsOverview } from './analytics/MetricsOverview';
import { MetricsChart } from './analytics/MetricsChart';

import styles from '../shared.module.scss';

import GetTenantRealtimeAnalyticsQuery from 'api/query/analytics/GetTenantRealtimeAnalyticsQuery.graphql';

export const Analytics = React.memo(() => {
  const { data } = useQuery(GetTenantRealtimeAnalyticsQuery, {
    pollInterval: 30_000,
  });
  const currentUserCount = data?.currentUserCount ?? null;

  const availableDates = React.useMemo(() => {
    const firstEverDate = new Date('2024-03-01');
    const months = [firstEverDate];
    while (
      !isSameMonth(new Date(), months.slice(-1)[0] ?? new Date()) &&
      months.length < 120
    ) {
      months.push(addMonths(months.slice(-1)[0], 1));
    }

    return months.reverse();
  }, []);

  const [currentDate, setCurrentDate] = React.useState(() =>
    format(availableDates[0], 'yyyy-MM-dd', {
      locale: de,
    })
  );

  return (
    <div>
      <Toolbar>
        <Select
          title="Monat wählen"
          value={currentDate}
          onChange={(value) => setCurrentDate(value)}
        >
          {availableDates.map((date) => {
            const dateKey = format(date, 'yyyy-MM-dd', {
              locale: de,
            });
            return (
              <Option key={dateKey} value={dateKey}>
                {format(date, 'MMMM yyyy', { locale: de })}
              </Option>
            );
          })}
        </Select>
        {currentUserCount !== null && (
          <Label label={'Aktuell online'} style={{ marginLeft: 'auto' }}>
            <div style={{ height: '2.8em', lineHeight: '2.8em' }}>
              <Icon
                icon={faCircle}
                size="xs"
                style={{ color: 'green' }}
                className={styles.calendarColorDot}
              />
              {currentUserCount} Besucher
            </div>
          </Label>
        )}
      </Toolbar>

      <MetricsOverview date={currentDate} />

      <MetricsChart date={currentDate} />
    </div>
  );
});
Analytics.displayName = 'AdminSystemAnalytics';
