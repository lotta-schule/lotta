import * as React from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { theme } from 'theme';
import { Input } from 'component/general/form/input/Input';

export interface ColorSettingRowProps {
    label: string;
    hint?: string;
    value: string;
    onChange(value: string): void;
}

const useStyles = makeStyles((theme) => ({
    root: {
        paddingRight: theme.spacing(2),
    },
    description: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        '& > p': {
            fontSize: '.9rem',
            '&:nth-child(2)': {
                color: theme.palette.text.hint,
            },
        },
    },
}));

export const ColorSettingRow = React.memo<ColorSettingRowProps>(
    ({ label, hint, value, onChange }) => {
        const styles = useStyles();

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
