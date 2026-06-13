import * as React from 'react';
import { Input } from '@lotta-schule/hubert';

import styles from './ColorSettingsRow.module.scss';

export interface ColorSettingRowProps {
  label: string;
  hint?: string;
  value: string;
  onChange(value: string): void;
}

export const ColorSettingRow = React.memo<ColorSettingRowProps>(
  ({ label, hint, value, onChange }) => {
    const labelId = React.useId();
    const hintId = React.useId();
    return (
      <div className={styles.root}>
        <div className={styles.colorInput}>
          <Input
            type={'color'}
            value={value}
            style={{}}
            onChange={(e) => onChange(e.currentTarget.value)}
            aria-labelledby={labelId}
            aria-describedby={hint && hintId}
          />
        </div>
        <div className={styles.description}>
          <p style={{ margin: 0 }} id={labelId} role={'label'}>
            {label}
          </p>
          {hint && (
            <p style={{ margin: 0 }} id={hintId}>
              <small>{hint}</small>
            </p>
          )}
        </div>
      </div>
    );
  }
);
ColorSettingRow.displayName = 'ColorSettingRow';
