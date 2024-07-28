'use client';
import * as React from 'react';
import { Label } from '@lotta-schule/hubert';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { useQuery } from '@apollo/client';
import { Icon } from 'shared/Icon';
import { t } from 'i18next';

import GetTenantRealtimeAnalyticsQuery from 'api/query/analytics/GetTenantRealtimeAnalyticsQuery.graphql';

export const CurrentOnlineUserCounter = () => {
  const { data } = useQuery(GetTenantRealtimeAnalyticsQuery, {
    pollInterval: 30_000,
  });
  const currentUserCount = data?.currentUserCount ?? null;

  return (
    <Label label={t('currently online')} style={{ marginLeft: 'auto' }}>
      <div style={{ height: '2.8em', lineHeight: '2.8em' }}>
        {currentUserCount !== null && (
          <>
            <Icon
              icon={faCircle}
              size="xs"
              style={{ color: currentUserCount > 0 ? 'green' : 'gray' }}
            />
            {t('{{count}} visitors online', { count: currentUserCount })}
          </>
        )}
      </div>
    </Label>
  );
};
