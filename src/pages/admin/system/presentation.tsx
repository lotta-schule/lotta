import * as React from 'react';
import {
    Card,
    CardContent,
    Grid,
    Theme,
    useTheme,
    FormControl,
    MenuItem,
    Divider,
} from '@material-ui/core';
import { Label } from 'component/general/label/Label';
import { Select } from 'component/general/form/select/Select';
import { useMutation } from '@apollo/client';
import { File } from 'util/model';
import { useTenant } from 'util/tenant/useTenant';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';
import { ColorSettingRow } from 'component/layouts/adminLayout/systemManagment/presentation/ColorSettingRow';
import { SelectTemplateButton } from 'component/layouts/adminLayout/systemManagment/presentation/SelectTemplateButton';
import {
    textFonts,
    headerFonts,
} from 'component/layouts/adminLayout/systemManagment/presentation/fonts';
import { Button } from 'component/general/button/Button';
import { BaseLayoutMainContent } from 'component/layouts/BaseLayoutMainContent';
import { Header } from 'component/general/Header';
import { useServerData } from 'component/ServerDataContext';
import { get, merge } from 'lodash';
import { GetServerSidePropsContext } from 'next';
import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';
import Img from 'react-cloudimage-responsive';
import createTypography from '@material-ui/core/styles/createTypography';
import Link from 'next/link';
import Head from 'next/head';

import styles from '../admin.module.scss';

export const Presentation = () => {
    const { baseUrl } = useServerData();
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

    const [updateSystem, { loading: isLoading, error }] =
        useMutation(UpdateTenantMutation);

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
        <BaseLayoutMainContent>
            <Header bannerImageUrl={'/bannerAdmin.png'}>
                <h2 data-testid="title">Administration</h2>
            </Header>
            <Link href={'/admin'}>&lt; Administration</Link>
            <ErrorMessage error={error} />
            <section className={styles.section}>
                <h6>Vorlagen</h6>
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
                <h6>Farben</h6>
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
                                                baseUrl,
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
                        <p>
                            Für eine optimale Darstellung sollte das
                            Hintergrundbild <i>mindestens</i> eine Auflösung von
                            1280x800 Pixeln haben.
                        </p>
                    </Grid>
                </Grid>
            </section>

            <section className={styles.section}>
                <h6>Schriften</h6>
                <Grid container>
                    <Grid item sm={6}>
                        <FormControl fullWidth>
                            <Label label={'Schriftart Überschriften'}>
                                <Select
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
                                                                e.currentTarget
                                                                    .value,
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
                                            <Head>
                                                <link
                                                    rel={'stylesheet'}
                                                    href={url}
                                                />
                                            </Head>
                                        </MenuItem>
                                    ))}
                                    <Divider />
                                    {textFonts.map(({ name, url }) => (
                                        <MenuItem value={name} key={name}>
                                            <span style={{ fontFamily: name }}>
                                                {name}
                                            </span>
                                            <Head>
                                                <link
                                                    rel={'stylesheet'}
                                                    href={url}
                                                />
                                            </Head>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Label>
                        </FormControl>
                    </Grid>
                    <Grid item sm={6}>
                        <FormControl fullWidth>
                            <Label label={'Schriftart Fließtext'}>
                                <Select
                                    value={getFromTheme(
                                        'typography.fontFamily'
                                    )}
                                    onChange={(e) =>
                                        setCustomTheme(
                                            merge({}, customTheme, {
                                                typography: createTypography(
                                                    getFromTheme('palette'),
                                                    {
                                                        fontFamily: e
                                                            .currentTarget
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
                                            <Head>
                                                <link
                                                    rel={'stylesheet'}
                                                    href={url}
                                                />
                                            </Head>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Label>
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
                                                ...tenant.configuration,
                                                customTheme:
                                                    JSON.stringify(customTheme),
                                                backgroundImageFile:
                                                    backgroundImage && {
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
        </BaseLayoutMainContent>
    );
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default Presentation;
