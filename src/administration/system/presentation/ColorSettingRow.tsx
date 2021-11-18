import * as React from 'react';
import { Grid } from '@material-ui/core';
import { theme } from 'theme';
import { Input } from 'shared/general/form/input/Input';

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
            <Grid container alignItems={'center'} className={styles.root}>
                <Grid
                    item
                    sm={3}
                    style={{
                        paddingRight: theme.spacing(2),
                    }}
                >
                    <Input
                        type={'color'}
                        value={value}
                        style={{ padding: 0 }}
                        onChange={(e) => onChange(e.currentTarget.value)}
                    />
                </Grid>
                <Grid item sm={9} className={styles.description}>
                    <p style={{ margin: 0 }}>{label}</p>
                    {hint && (
                        <p style={{ margin: 0 }}>
                            <small>{hint}</small>
                        </p>
                    )}
                </Grid>
            </Grid>
        );
    }
);
ColorSettingRow.displayName = 'ColorSettingRow';
