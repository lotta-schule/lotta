import React, { memo } from 'react';
import { Grid, TextField, Typography, makeStyles } from '@material-ui/core';

export interface ColorSettingRowProps {
    label: string;
    hint?: string;
    value: string;
    onChange(value: string): void;
}

const useStyles = makeStyles(theme => ({
    root: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1)
    },
    colorPreview: {
        height: '2em',
        width: '2em',
        marginRight: theme.spacing(2),
        border: '1px solid',
        borderColor: '#e0e0e0',
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
            {/* <Grid item>
                <div className={styles.colorPreview} style={{ backgroundColor: value }} />
            </Grid> */}

            <Grid item sm={8} className={styles.description}>
                <Typography component={'p'} variant={'subtitle1'}>{label}</Typography>
                {hint && (<Typography component={'p'} variant={'subtitle2'}>{hint}</Typography>)}
            </Grid>
            <Grid item sm={4}>
                <TextField
                    fullWidth
                    type={'color'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    margin={'dense'}
                    variant={'outlined'}
                />
            </Grid>
        </Grid >
    );
});