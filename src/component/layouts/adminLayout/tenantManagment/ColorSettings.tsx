import React, { memo, useState } from 'react';
import { get, merge } from 'lodash';
import { Button, Card, CardContent, Grid, Typography, makeStyles } from '@material-ui/core';
import { theme } from 'theme';
import { ColorSettingRow } from './ColorSettingRow';
import { useTenant } from 'util/client/useTenant';
import { useMutation } from 'react-apollo';
import { UpdateTenantMutation } from 'api/mutation/UpdateTenantMutation';
import { SelectTemplateButton } from './SelectTemplateButton';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';
import Img from 'react-cloudimage-responsive';

const useStyles = makeStyles(theme => ({
    section: {
        marginBottom: theme.spacing(2)
    },
    heading: {
        marginBottom: theme.spacing(2)
    },
    gridContainer: {
        marginBottom: theme.spacing(3),
    }
}));

export const ColorSettings = memo(() => {
    const styles = useStyles();
    const tenant = useTenant();

    const [customTheme, setCustomTheme] = useState<any>(tenant.customTheme || {});
    const [backgroundImage, setBackgroundImage] = useState(tenant.backgroundImageFile);

    const [updateTenant, { loading: isLoading, error }] = useMutation(UpdateTenantMutation);

    const getFromTheme = (key: string): any => {
        return get(customTheme, key, get(theme, key));
    }

    return (
        <>
            <Typography variant="h5" className={styles.heading}>
                Darstellung
            </Typography>

            <section className={styles.section}>
                <Typography variant={'h6'}>
                    Vorlagen
                </Typography>
                <Grid container>
                    <Grid item sm={3}>
                        <SelectTemplateButton
                            imageUrl={'/theme/default/preview.png'}
                            title={'standard'}
                            onClick={() => setCustomTheme({})}
                        />
                    </Grid>
                    {['Königsblau', 'Leipzig'].map(title => {
                        const pureName = title
                            .toLowerCase()
                            .replace(/ö/g, 'oe')
                        return (
                            <Grid item sm={3} key={pureName}>
                                <SelectTemplateButton
                                    imageUrl={`/theme/${pureName}/preview.png`}
                                    title={title}
                                    onClick={() => {
                                        fetch(`/theme/${pureName}/theme.json`)
                                            .then(res => res.json())
                                            .then(setCustomTheme);
                                    }}
                                />
                            </Grid>
                        );
                    })}
                </Grid>
            </section>

            <section className={styles.section}>
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
                                palette: {
                                    text: { secondary: value }
                                }
                            }))}
                        />
                    </Grid>
                </Grid>

                <Grid container className={styles.gridContainer}>
                    <Grid item sm={6}>
                        <Card>
                            <CardContent>
                                <SelectFileOverlay label={'Hintergrundbild ändern'} onSelectFile={backgroundImage => setBackgroundImage(backgroundImage)}>
                                    {backgroundImage ? (
                                        <Img operation={'height'} size={'400x200'} src={backgroundImage.remoteLocation} />
                                    ) : <PlaceholderImage width={'100%'} height={200} />}
                                </SelectFileOverlay>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item sm={6}>
                        <Typography>
                            Für eine optimale Darstellung sollte das Hintergrundbild <i>mindestens</i> eine Auflösung von 1280x800 Pixeln haben.
                        </Typography>
                    </Grid>
                </Grid>

                <Grid container justify={'flex-end'}>
                    <Grid item sm={6} md={4} lg={3}>
                        <Button
                            fullWidth
                            disabled={isLoading}
                            variant={'outlined'}
                            color={'secondary'}
                            onClick={() => updateTenant({
                                variables: {
                                    tenant: { customTheme: JSON.stringify(customTheme), backgroundImageFile: backgroundImage }
                                }
                            })}
                        >
                            speichern
                        </Button>
                    </Grid>
                </Grid>
            </section>
        </>
    );
});