import * as React from 'react';
import {
    Card,
    CardContent,
    Grid,
    Typography,
    makeStyles,
    Theme,
    useTheme,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
} from '@material-ui/core';
import { useMutation } from '@apollo/client';
import { File } from 'util/model';
import { useTenant } from 'util/tenant/useTenant';
import { UpdateTenantMutation } from 'api/mutation/UpdateTenantMutation';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';
import { ColorSettingRow } from './ColorSettingRow';
import { SelectTemplateButton } from './SelectTemplateButton';
import { Helmet } from 'react-helmet';
import { textFonts, headerFonts } from './fonts';
import { Button } from 'component/general/button/Button';
import get from 'lodash/get';
import merge from 'lodash/merge';
import Img from 'react-cloudimage-responsive';
import createTypography from '@material-ui/core/styles/createTypography';

const useStyles = makeStyles((theme) => ({
    section: {
        marginBottom: theme.spacing(2),
    },
    gridContainer: {
        marginBottom: theme.spacing(3),
    },
}));

export const PresentationSettings = React.memo(() => {
    const styles = useStyles();
    const tenant = useTenant();
    const theme = useTheme();

    const [allThemes, setAllThemes] = React.useState<
        { title: string; theme: Partial<Theme> }[]
    >([{ title: 'Standard', theme: {} }]);

    const [customTheme, setCustomTheme] = React.useState<any>(
        tenant.configuration.customTheme || {}
    );
    const [backgroundImage, setBackgroundImage] = React.useState(
        tenant.configuration.backgroundImageFile
    );

    const [updateSystem, { loading: isLoading, error }] = useMutation(
        UpdateTenantMutation
    );

    const getFromTheme = (key: string): any => {
        return get(customTheme, key, get(theme, key));
    };

    React.useEffect(() => {
        Promise.all(
            ['Königsblau', 'Leipzig'].map(async (title) => {
                const pureName = title.toLowerCase().replace(/ö/g, 'oe');
                const partialTheme = await fetch(
                    `/theme/${pureName}/theme.json`
                ).then((res) => res.json());
                return { title, theme: merge({}, theme, partialTheme) };
            })
        ).then((customThemes) =>
            setAllThemes([{ title: 'Standard', theme: {} }, ...customThemes])
        );
    }, [theme]);

    return (
        <>
            <section className={styles.section}>
                <Typography variant={'h6'}>Vorlagen</Typography>
                <Grid container>
                    {allThemes.map(({ title, theme: partialTheme }, index) => {
                        return (
                            <Grid item sm={3} key={index}>
                                <SelectTemplateButton
                                    title={title}
                                    theme={partialTheme}
                                    onClick={() => setCustomTheme(partialTheme)}
                                />
                            </Grid>
                        );
                    })}
                </Grid>
            </section>

            <section className={styles.section}>
                <Typography variant={'h6'}>Farben</Typography>
                <ErrorMessage error={error} />
                <Grid container className={styles.gridContainer}>
                    <Grid item sm={6}>
                        <ColorSettingRow
                            label={'Primärfarbe'}
                            hint={
                                'Hintergrund der Navigationsleiste, Farbe der Links'
                            }
                            value={getFromTheme('palette.primary.main')}
                            onChange={(value) =>
                                setCustomTheme(
                                    merge({}, customTheme, {
                                        palette: {
                                            primary: { main: value },
                                        },
                                    })
                                )
                            }
                        />
                        <ColorSettingRow
                            label={'Akzentfarbe'}
                            hint={
                                'Farbe der Buttons und für Farbakzente im Seitenlayout'
                            }
                            value={getFromTheme('palette.secondary.main')}
                            onChange={(value) =>
                                setCustomTheme(
                                    merge({}, customTheme, {
                                        palette: {
                                            secondary: { main: value },
                                        },
                                    })
                                )
                            }
                        />
                        <ColorSettingRow
                            label={'Hintergrund'}
                            hint={'Hintergrund der Seite'}
                            value={getFromTheme('palette.background.default')}
                            onChange={(value) =>
                                setCustomTheme(
                                    merge({}, customTheme, {
                                        palette: {
                                            background: { default: value },
                                        },
                                    })
                                )
                            }
                        />
                    </Grid>
                    <Grid item sm={6}>
                        <ColorSettingRow
                            label={'primäre Textfarbe'}
                            hint={'Standard-Text und Überschriften'}
                            value={getFromTheme('palette.text.primary')}
                            onChange={(value) =>
                                setCustomTheme(
                                    merge({}, customTheme, {
                                        palette: {
                                            text: { primary: value },
                                        },
                                    })
                                )
                            }
                        />
                        <ColorSettingRow
                            label={'sekundäre Textfarbe'}
                            hint={'Hinweistext, Vorschautext'}
                            value={getFromTheme('palette.text.secondary')}
                            onChange={(value) =>
                                setCustomTheme(
                                    merge({}, customTheme, {
                                        palette: {
                                            text: { secondary: value },
                                        },
                                    })
                                )
                            }
                        />
                    </Grid>
                </Grid>

                <Grid container className={styles.gridContainer}>
                    <Grid item sm={6}>
                        <Card>
                            <CardContent>
                                <SelectFileOverlay
                                    label={'Hintergrundbild ändern'}
                                    onSelectFile={(backgroundImage) =>
                                        setBackgroundImage(backgroundImage)
                                    }
                                    allowDeletion
                                >
                                    {backgroundImage ? (
                                        <Img
                                            operation={'height'}
                                            size={'400x200'}
                                            src={File.getFileRemoteLocation(
                                                backgroundImage
                                            )}
                                        />
                                    ) : (
                                        <PlaceholderImage
                                            width={'100%'}
                                            height={200}
                                        />
                                    )}
                                </SelectFileOverlay>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item sm={6}>
                        <Typography>
                            Für eine optimale Darstellung sollte das
                            Hintergrundbild <i>mindestens</i> eine Auflösung von
                            1280x800 Pixeln haben.
                        </Typography>
                    </Grid>
                </Grid>
            </section>

            <section className={styles.section}>
                <Typography variant={'h6'}>Schriften</Typography>
                <Grid container>
                    <Grid item sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="presentation-font-text-label">
                                Schriftart Überschriften
                            </InputLabel>
                            <Select
                                labelId="presentation-font-text-label"
                                id="presentation-font-text"
                                value={getFromTheme(
                                    'overrides.LottaArticlePreview.title.fontFamily'
                                )}
                                onChange={(e) =>
                                    setCustomTheme(
                                        merge({}, customTheme, {
                                            overrides: {
                                                LottaArticlePreview: {
                                                    title: {
                                                        fontFamily:
                                                            e.target.value,
                                                    },
                                                },
                                            },
                                        })
                                    )
                                }
                            >
                                {headerFonts.map(({ name, url }) => (
                                    <MenuItem value={name} key={name}>
                                        <span style={{ fontFamily: name }}>
                                            {name}
                                        </span>
                                        <Helmet>
                                            <link
                                                rel={'stylesheet'}
                                                href={url}
                                            />
                                        </Helmet>
                                    </MenuItem>
                                ))}
                                <Divider />
                                {textFonts.map(({ name, url }) => (
                                    <MenuItem value={name} key={name}>
                                        <span style={{ fontFamily: name }}>
                                            {name}
                                        </span>
                                        <Helmet>
                                            <link
                                                rel={'stylesheet'}
                                                href={url}
                                            />
                                        </Helmet>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="presentation-font-text-label">
                                Schriftart Fließtext
                            </InputLabel>
                            <Select
                                labelId="presentation-font-text-label"
                                id="presentation-font-text"
                                value={getFromTheme('typography.fontFamily')}
                                onChange={(e) =>
                                    setCustomTheme(
                                        merge({}, customTheme, {
                                            typography: createTypography(
                                                getFromTheme('palette'),
                                                {
                                                    fontFamily: e.target
                                                        .value as string,
                                                }
                                            ),
                                        })
                                    )
                                }
                            >
                                {textFonts.map(({ name, url }) => (
                                    <MenuItem value={name} key={name}>
                                        <span style={{ fontFamily: name }}>
                                            {name}
                                        </span>
                                        <Helmet>
                                            <link
                                                rel={'stylesheet'}
                                                href={url}
                                            />
                                        </Helmet>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </section>

            <section>
                <Grid container justify={'flex-end'}>
                    <Grid item sm={6} md={4} lg={3}>
                        <Button
                            fullWidth
                            disabled={isLoading}
                            onClick={() =>
                                updateSystem({
                                    variables: {
                                        tenant: {
                                            configuration: {
                                                customTheme: JSON.stringify(
                                                    customTheme
                                                ),
                                                backgroundImageFile: backgroundImage && {
                                                    id: backgroundImage.id,
                                                },
                                            },
                                        },
                                    },
                                })
                            }
                        >
                            speichern
                        </Button>
                    </Grid>
                </Grid>
            </section>
        </>
    );
});
