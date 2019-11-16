import React, { memo, useState } from 'react';
import { get, merge } from 'lodash';
import { Button, CardMedia, CardContent, Grid, Typography, makeStyles, Theme, useTheme } from '@material-ui/core';
import { ColorSettingRow } from './ColorSettingRow';
import { useTenant } from 'util/client/useTenant';
import { useMutation } from 'react-apollo';
import { UpdateTenantMutation } from 'api/mutation/UpdateTenantMutation';

const useStyles = makeStyles(theme => ({
    heading: {
        marginBottom: theme.spacing(2)
    },
    gridContainer: {
        marginBottom: theme.spacing(3),
    }
}));

export const ColorSettings = memo(() => {
    const styles = useStyles();
    const theme = useTheme<Theme>();
    const tenant = useTenant();

    const [customTheme, setCustomTheme] = useState<any>(tenant.customTheme || {});

    const [updateTenant, { loading: isLoading, error }] = useMutation(UpdateTenantMutation);

    const getFromTheme = (key: string): any => {
        return get(customTheme, key, get(theme, key));
    }

    return (
        <>
            <Typography variant="h5" className={styles.heading}>
                Darstellung
            </Typography>

            <Typography variant={'h6'}>
                Schema
            </Typography>
            <Grid container style={{ display: 'flex' }}>
                <Grid item sm={3}>
                    <CardMedia
                        style={{ height: 150, margin: '0.5em', }}
                        image="https://placeimg.com/200/150/any"
                    />
                    <CardContent style={{ display: 'flex', paddingTop: 0, }}>
                        <Button>wählen</Button>
                        <Typography style={{ margin: 'auto 0' }}>
                            Standard
                        </Typography>
                    </CardContent>
                </Grid>
                <Grid item sm={3}>
                    <CardMedia
                        style={{ height: 150, margin: '0.5em', }}
                        image="https://placeimg.com/200/150/any"
                    />
                    <CardContent style={{ display: 'flex', paddingTop: 0, }}>
                        <Button>wählen</Button>
                        <Typography style={{ margin: 'auto 0' }}>
                            Königsblau
                        </Typography>
                    </CardContent>
                </Grid>
            </Grid>


            {error && (
                <div style={{ color: 'red' }}>{error.message}</div>
            )}

            <Typography variant={'h6'}>
                Farben
            </Typography>
            <Grid container className={styles.gridContainer}>
                <Grid item sm={6}>
                    <ColorSettingRow
                        label={'Primärfarbe'}
                        hint={'Hintergrund der Seite'}
                        value={getFromTheme('palette.primary.main')}
                        onChange={value => setCustomTheme(merge({}, customTheme, {
                            ...customTheme,
                            palette: {
                                primary: { main: value }
                            }
                        }))}
                    />
                    <ColorSettingRow
                        label={'Sekundärfarbe'}
                        hint={'Hintergrund der Seite'}
                        value={getFromTheme('palette.secondary.main')}
                        onChange={value => setCustomTheme(merge({}, customTheme, {
                            ...customTheme,
                            palette: {
                                secondary: { main: value }
                            }
                        }))}
                    />
                    <ColorSettingRow
                        label={'Hintergrund'}
                        hint={'Hintergrund der Seite'}
                        value={getFromTheme('palette.background.default')}
                        onChange={value => setCustomTheme(merge({}, customTheme, {
                            ...customTheme,
                            palette: {
                                background: { default: value }
                            }
                        }))}
                    />
                </Grid>
                <Grid item sm={6}>
                    <ColorSettingRow
                        label={'primäre Textfarbe'}
                        hint={'Hintergrund der Seite'}
                        value={getFromTheme('palette.text.primary')}
                        onChange={value => setCustomTheme(merge({}, customTheme, {
                            ...customTheme,
                            palette: {
                                text: { primary: value }
                            }
                        }))}
                    />
                    <ColorSettingRow
                        label={'sekundäre Textfarbe'}
                        hint={'Hintergrund der Seite'}
                        value={getFromTheme('palette.text.secondary')}
                        onChange={value => setCustomTheme(merge({}, customTheme, {
                            ...customTheme,
                            palette: {
                                text: { secondary: value }
                            }
                        }))}
                    />
                </Grid>
            </Grid>

            <Grid container justify={'flex-end'}>
                <Grid item sm={6} md={4} lg={3}>
                    <Button
                        fullWidth
                        disabled={isLoading}
                        variant={'outlined'}
                        color={'secondary'}
                        onClick={() => updateTenant({ variables: { tenant: { customTheme: JSON.stringify(customTheme) } } })}
                    >
                        speichern
                    </Button>
                </Grid>
            </Grid>
        </>
    );
});