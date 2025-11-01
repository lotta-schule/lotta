import * as React from 'react';
import { Box, FileSize } from '@lotta-schule/hubert';
import { format, isSameMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { TenantModel } from 'model';
import { type TenantUsage } from 'loader';
import clsx from 'clsx';

import styles from './Usage.module.scss';

export interface UsageProps {
  usage: TenantUsage;
  tenant: TenantModel;
}

export const Usage = React.memo(({ tenant, usage }: UsageProps) => {
  const getMediaConversionTimeFormatted = (usage: TenantUsage[number]) => {
    if (!usage) {
      return null;
    }
    const totalSeconds = usage.mediaConversionSeconds?.value || 0;
    if (totalSeconds < 60) {
      return `${totalSeconds} Sekunden`;
    } else {
      return `${Math.round(totalSeconds / 60)} Minuten`;
    }
  };

  return (
    <div className={styles.root}>
      <Box className={styles.infoBox}>
        <small>{tenant.host}</small>
        <h5>{tenant.title}</h5>
        <p>{tenant.insertedAt}</p>
      </Box>

      <div role={'table'}>
        {/* Wär doch cool hier mal einen richtigen Grafen zu zeigen */}
        <div
          role={'row'}
          className={clsx(styles.gridContainer, styles.usageTable)}
        >
          <div role={'rowheader'}>&nbsp;</div>
          <div role={'rowheader'}>
            <h3>aktive Nutzer</h3>
          </div>
          <div role={'rowheader'}>
            <h3>Speicherplatz</h3>
          </div>
          <div role={'roleheader'}>
            <h3>Multimedia</h3>
          </div>
        </div>
        {usage?.map((usage) => {
          const date = new Date(usage.year, usage.month - 1, 1);
          return (
            <div
              role={'row'}
              className={clsx(styles.gridContainer, styles.usageTable, {
                [styles.isCurrentMonth]: isSameMonth(date, new Date()),
              })}
              key={`${usage.year}-${usage.month}`}
            >
              <Box role={'cell'}>
                {format(date, 'MMMM yyyy', {
                  locale: de,
                })}
              </Box>
              <Box role={'cell'}>{usage.activeUserCount?.value ?? null}</Box>
              <Box role={'cell'}>
                {usage.totalStorageCount?.value
                  ? new FileSize(usage.totalStorageCount.value).humanize()
                  : null}
              </Box>
              <Box role={'cell'}>
                {getMediaConversionTimeFormatted(usage)} Audio/Video
              </Box>
            </div>
          );
        })}
      </div>
    </div>
  );
});
Usage.displayName = 'AdminSystemUsage';
