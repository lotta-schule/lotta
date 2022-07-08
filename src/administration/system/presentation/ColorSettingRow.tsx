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
        return (
            <div className={styles.root}>
                <div className={styles.colorInput}>
                    <Input
                        type={'color'}
                        value={value}
                        style={{ padding: 0 }}
                        onChange={(e) => onChange(e.currentTarget.value)}
                    />
                </div>
                <div className={styles.description}>
                    <p style={{ margin: 0 }}>{label}</p>
                    {hint && (
                        <p style={{ margin: 0 }}>
                            <small>{hint}</small>
                        </p>
                    )}
                </div>
            </div>
        );
    }
);
ColorSettingRow.displayName = 'ColorSettingRow';
