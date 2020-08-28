import React, { memo } from 'react';
import { Grid, TextField, Typography, makeStyles } from '@material-ui/core';
import { theme } from 'theme';

export interface ColorSettingRowProps {
    label: string;
    hint?: string;
    value: string;
    onChange(value: string): void;
}

const useStyles = makeStyles(theme => ({
    root: {
        paddingRight: theme.spacing(2)
    },
    description: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        '& > p': {
            fontSize: '.9rem',
            '&:nth-child(2)': {
                color: theme.palette.text.hint
            }
        }
    }
}));

export const ColorSettingRow = memo<ColorSettingRowProps>(({ label, hint, value, onChange }) => {
    const styles = useStyles();

    return (
        <Grid container alignItems={'center'} className={styles.root}>
            <Grid item sm={3} style={{
                paddingRight: theme.spacing(2),
            }}>
                <TextField
                    fullWidth
                    type={'color'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    margin={'dense'}
                    variant={'outlined'}
                />
            </Grid>
            <Grid item sm={9} className={styles.description}>
                <Typography component={'p'} variant={'subtitle1'}>{label}</Typography>
                {hint && (<Typography component={'p'} variant={'subtitle2'}>{hint}</Typography>)}
            </Grid>
        </Grid >
    );
});