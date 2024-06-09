import * as React from 'react';
import { Box, FileSize } from '@lotta-schule/hubert';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { TenantModel, TenantUsageModel } from 'model';
import clsx from 'clsx';

import styles from './Usage.module.scss';

export interface UsageProps {
  usage: TenantUsageModel[];
  tenant: TenantModel;
}

export const Usage = React.memo(({ tenant, usage }: UsageProps) => {
  const getMediaConversionTimeFormatted = (usage: any) => {
    if (!usage) {
      return null;
    }
    if (usage.media.mediaConversionCurrentPeriod < 60) {
      return `${usage.media.mediaConversionCurrentPeriod || 0} Sekunden`;
    } else {
      return `${Math.round(
        usage.media.mediaConversionCurrentPeriod / 60
      )} Minuten`;
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
            <h3>Speicherplatz</h3>
          </div>
          <div role={'roleheader'}>
            <h3>Multimedia</h3>
          </div>
        </div>
        {usage?.map((usage, index) => (
          <div
            role={'row'}
            className={clsx(styles.gridContainer, styles.usageTable)}
            key={usage.periodStart}
          >
            <Box role={'cell'}>
              {format(new Date(usage.periodStart), 'MMMM yyyy', {
                locale: de,
              })}
            </Box>
            <Box role={'cell'}>
              {index === 0 && (
                <>
                  <div>{new FileSize(usage.storage.usedTotal).humanize()}</div>
                  <div>
                    <small>({usage.storage.filesTotal} Dateien)</small>
                  </div>
                </>
              )}
            </Box>
            <Box role={'cell'}>
              {getMediaConversionTimeFormatted(usage)} Audio/Video
            </Box>
          </div>
        ))}
      </div>
    </div>
  );
});
Usage.displayName = 'AdminSystemUsage';
