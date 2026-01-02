'use client';
import * as React from 'react';
import { Label } from '@lotta-schule/hubert';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { useQuery } from '@apollo/client/react';
import { Icon } from 'shared/Icon';
import { t } from 'i18next';
import { graphql } from 'api/graphql';

export const GET_TENANT_REALTIME_ANALYTICS = graphql(`
  query GetTenantRealtimeAnalytics {
    realtimeAnalytics
  }
`);

export const CurrentOnlineUserCounter = () => {
  const { data } = useQuery(GET_TENANT_REALTIME_ANALYTICS, {
    pollInterval: 15_000,
  });
  const currentUserCount = data?.realtimeAnalytics ?? null;

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
