import React, { createElement, memo } from 'react';
import { makeStyles, Button, Grid, TextField, Typography, Select, MenuItem, InputLabel, FormControl } from '@material-ui/core';
import { WidgetIconModel } from 'model';
import { iconNameMapping, WidgetIcon } from 'component/widgets/WidgetIcon';

export interface WidgetIconSelectionProps {
    icon: WidgetIconModel;
    onSelectIcon(icon: WidgetIconModel): void;
}

const useStyles = makeStyles(theme => ({
    iconScrollbar: {
        display: 'flex',
        overflowX: 'auto',
        marginBottom: theme.spacing(2),
        height: '4em'
    },
    overlayTextDescription: {
        marginBottom: theme.spacing(1)
    },
    overlayTextTextField: {
        marginBottom: theme.spacing(2),
        width: '25%'
    },
    iconPreview: {
        float: 'right'
    },
    label: {
        top: '-0.4em',
        left: '0.8em',
    }
}))

export const WidgetIconSelection = memo<WidgetIconSelectionProps>(({ icon, onSelectIcon }) => {
    const styles = useStyles();

    return (
        <Grid container>
            <Grid item xs={12}>
                <Typography variant={'h6'}>
                    Icon wählen
                </Typography>
                <div className={styles.iconScrollbar}>
                    {Object.entries(iconNameMapping).map(([iconName, IconClass]) => (
                        <Button key={iconName} color={'secondary'} size={'large'} onClick={() => onSelectIcon({ ...icon, iconName })}>
                            {createElement(IconClass)}
                        </Button>
                    ))}
                </div>
            </Grid>
            <Grid item xs={12} style={{ display: 'flex' }}>
                <Grid container>
                    <Grid item md={9}>
                        <Typography variant={'body1'} className={styles.overlayTextDescription}>
                            Icon um einen Buchstaben oder eine Zahl ergänzen:
                        </Typography>
                        <Grid container>
                            <Grid item xs={6}>
                                <TextField
                                    label={'Beschriftung'}
                                    variant={'outlined'}
                                    color={'secondary'}
                                    inputProps={{
                                        maxLength: 1
                                    }}
                                    value={icon.overlayText ?? ''}
                                    onChange={e => onSelectIcon({ ...icon, overlayText: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel color={'secondary'} className={styles.label} >Textfarbe</InputLabel>
                                    <Select
                                        color={'secondary'}
                                        label={'Textfarbe'}
                                        fullWidth
                                        variant={'outlined'}
                                        onChange={({ target: { value } }) => onSelectIcon({ ...icon, overlayTextColor: value as string })}
                                        value={icon.overlayTextColor ?? ''}
                                    >
                                        <MenuItem value={''}>weiß</MenuItem>
                                        <MenuItem value={'primary'}>primär</MenuItem>
                                        <MenuItem value={'secondary'}>sekundär</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item md={3} style={{ maxHeight: '7em' }}>
                        <Typography variant={'body1'} align={'center'} >
                            Vorschau:
                        </Typography>
                        <WidgetIcon className={styles.iconPreview} icon={icon} size={'5em'} />
                    </Grid>
                </Grid>
            </Grid>
        </Grid >
    );
});