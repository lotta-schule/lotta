import * as React from 'react';
import Head from 'next/head';
import {
    Button,
    Box,
    ErrorMessage,
    Label,
    Select,
    useTheme,
    Input,
} from '@lotta-schule/hubert';
import { DefaultThemes } from '@lotta-schule/theme';
import { useApolloClient, useMutation } from '@apollo/client';
import { File } from 'util/model';
import { useTenant } from 'util/tenant/useTenant';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import { useServerData } from 'shared/ServerDataContext';
import { SelectTemplateButton } from './presentation/SelectTemplateButton';
import { ColorSettingRow } from './presentation/ColorSettingRow';
import { headerFonts, textFonts } from './presentation/fonts';
import Img from 'react-cloudimage-responsive';
import clsx from 'clsx';

import styles from '../shared.module.scss';

import GetTenantQuery from 'api/query/GetTenantQuery.graphql';
import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';

const defaultTheme = DefaultThemes.standard;

export const Presentation = React.memo(() => {
    const { baseUrl } = useServerData();
    const tenant = useTenant();
    const client = useApolloClient();
    const theme = useTheme();

    const [allThemes, setAllThemes] = React.useState<
        { title: string; theme: Partial<ReturnType<typeof useTheme>> }[]
    >([{ title: 'Standard', theme: {} }]);

    const setCustomTheme = React.useCallback(
        (customTheme: Partial<ReturnType<typeof useTheme>>) =>
            client.writeQuery({
                query: GetTenantQuery,
                data: {
                    tenant: {
                        ...tenant,
                        configuration: {
                            ...tenant.configuration,
                            customTheme: { ...theme, ...customTheme },
                        },
                    },
                },
            }),
        [client, tenant, theme]
    );

    const [backgroundImage, setBackgroundImage] = React.useState(
        tenant.configuration.backgroundImageFile
    );

    const [updateSystem, { loading: isLoading, error }] =
        useMutation(UpdateTenantMutation);

    React.useEffect(() => {
        Promise.all(
            ['Königsblau', 'Leipzig'].map(async (title) => {
                const pureName = title.toLowerCase().replace(/ö/g, 'oe');
                const partialTheme = await fetch(
                    `/theme/${pureName}/theme.json`
                ).then((res) => res.json());
                return { title, theme: { ...defaultTheme, ...partialTheme } };
            })
        ).then((customThemes) => {
            setAllThemes([
                { title: 'Standard', theme: defaultTheme },
                ...customThemes,
            ]);
        });
    }, [theme]);

    return (
        <div>
            <ErrorMessage error={error} />
            <section className={styles.section}>
                <h3>Vorlagen</h3>
                <div className={styles.gridContainer}>
                    {allThemes.map(({ title, theme: partialTheme }, index) => {
                        return (
                            <div className={styles.gridItem} key={index}>
                                <SelectTemplateButton
                                    title={title}
                                    theme={partialTheme}
                                    onClick={() => setCustomTheme(partialTheme)}
                                />
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className={styles.section}>
                <h3>Farben</h3>
                <ErrorMessage error={error} />
                <div className={styles.gridContainer}>
                    <div className={styles.gridItem}>
                        <ColorSettingRow
                            label={'Akzente'}
                            hint={
                                'Akzentfarbe für wichtige und interaktive Elemente'
                            }
                            value={theme.primaryColor}
                            onChange={(primaryColor) =>
                                setCustomTheme({ primaryColor })
                            }
                        />
                        <ColorSettingRow
                            label={'Hintergrund der Navigationsleiste'}
                            hint={
                                'Farbe für den Hintergrund der Navigationsleiste'
                            }
                            value={theme.navigationBackgroundColor}
                            onChange={(navigationBackgroundColor) =>
                                setCustomTheme({
                                    navigationBackgroundColor,
                                })
                            }
                        />
                        <ColorSettingRow
                            label={'Fehler'}
                            hint={'Farbe für Fehlermeldungen'}
                            value={theme.errorColor}
                            onChange={(errorColor) =>
                                setCustomTheme({
                                    errorColor,
                                })
                            }
                        />
                        <ColorSettingRow
                            label={'Erfolg'}
                            hint={'Farbe für Erfolgsmeldungen'}
                            value={theme.successColor}
                            onChange={(successColor) =>
                                setCustomTheme({
                                    successColor,
                                })
                            }
                        />
                        <ColorSettingRow
                            label={'Navigation'}
                            hint={
                                'Farbe für die Buttons in der Navigationsleiste'
                            }
                            value={theme.navigationColor}
                            onChange={(navigationColor) =>
                                setCustomTheme({
                                    navigationColor,
                                })
                            }
                        />
                        <ColorSettingRow
                            label={'Deaktiviert'}
                            hint={'Farbe für den deaktivierte Elemente'}
                            value={theme.disabledColor}
                            onChange={(disabledColor) =>
                                setCustomTheme({
                                    disabledColor,
                                })
                            }
                        />
                        <ColorSettingRow
                            label={'Text'}
                            hint={'Farbe für Text'}
                            value={theme.textColor}
                            onChange={(textColor) =>
                                setCustomTheme({
                                    textColor,
                                })
                            }
                        />
                    </div>
                    <div className={styles.gridItem}>
                        <ColorSettingRow
                            label={'Beschriftungen'}
                            hint={'Farbe für Text in Beschriftungen'}
                            value={theme.labelTextColor}
                            onChange={(labelTextColor) =>
                                setCustomTheme({
                                    labelTextColor,
                                })
                            }
                        />
                        <ColorSettingRow
                            label={'Text-Invert'}
                            hint={'Alternative Textfarbe für gefüllte Elemente'}
                            value={theme.contrastTextColor}
                            onChange={(contrastTextColor) =>
                                setCustomTheme({
                                    contrastTextColor,
                                })
                            }
                        />
                        <ColorSettingRow
                            label={'Hintergrund'}
                            hint={
                                'Farbe für den Hintergrund des Inhaltsbereichs'
                            }
                            value={theme.boxBackgroundColor}
                            onChange={(boxBackgroundColor) =>
                                setCustomTheme({
                                    boxBackgroundColor,
                                })
                            }
                        />
                        <ColorSettingRow
                            label={'Seitenhintergrund'}
                            hint={
                                'Farbe für den Hintergrund des gesamten Seiteninhalts'
                            }
                            value={theme.pageBackgroundColor}
                            onChange={(pageBackgroundColor) =>
                                setCustomTheme({
                                    pageBackgroundColor,
                                })
                            }
                        />
                        <ColorSettingRow
                            label={'Trennlinien'}
                            hint={'Farbe für Trennlinien'}
                            value={theme.dividerColor}
                            onChange={(dividerColor) =>
                                setCustomTheme({
                                    dividerColor,
                                })
                            }
                        />
                        <ColorSettingRow
                            label={'Hervorhebung'}
                            hint={'Farbe für Hervorhebungen'}
                            value={theme.highlightColor}
                            onChange={(highlightColor) =>
                                setCustomTheme({
                                    highlightColor,
                                })
                            }
                        />
                        <ColorSettingRow
                            label={'Bannerhintergrund'}
                            hint={'Farbe für den Hintergrund des Banner'}
                            value={theme.bannerBackgroundColor}
                            onChange={(bannerBackgroundColor) =>
                                setCustomTheme({
                                    bannerBackgroundColor,
                                })
                            }
                        />
                    </div>
                </div>

                <section className={styles.section}>
                    <h3>Maße</h3>

                    <div className={styles.gridItem}>
                        <Label label={'Abstand'}>
                            <Input
                                value={theme.spacing}
                                onChange={(e) =>
                                    setCustomTheme({
                                        spacing: e.currentTarget.value,
                                    })
                                }
                            />
                        </Label>
                    </div>
                    <div className={styles.gridItem}>
                        <Label label={'Rundungen'}>
                            <Input
                                value={theme.borderRadius}
                                onChange={(e) =>
                                    setCustomTheme({
                                        borderRadius: e.currentTarget.value,
                                    })
                                }
                            />
                        </Label>
                    </div>
                </section>

                <div className={styles.gridContainer}>
                    <div className={styles.gridItem}>
                        <Box>
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
                        </Box>
                    </div>
                    <div className={styles.gridItem}>
                        <p>
                            Für eine optimale Darstellung sollte das
                            Hintergrundbild <i>mindestens</i> eine Auflösung von
                            1280x800 Pixeln haben.
                        </p>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h3>Schriften</h3>
                <div className={styles.gridContainer}>
                    <div className={styles.gridItem}>
                        <Label label={'Schriftart Überschriften'}>
                            <Select
                                value={theme.titleFontFamily}
                                style={{
                                    fontFamily: theme.titleFontFamily,
                                }}
                                onChange={(e) =>
                                    setCustomTheme({
                                        titleFontFamily: e.currentTarget.value,
                                    })
                                }
                            >
                                {headerFonts
                                    .concat(textFonts)
                                    .map(({ url }) => (
                                        <Head key={url}>
                                            <link
                                                rel={'stylesheet'}
                                                href={url}
                                            />
                                        </Head>
                                    ))}
                                <optgroup>
                                    {headerFonts.map(({ name }) => (
                                        <option
                                            value={name}
                                            style={{ fontFamily: name }}
                                            key={name}
                                        >
                                            {name}
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup>
                                    {textFonts.map(({ name }) => (
                                        <option
                                            value={name}
                                            style={{ fontFamily: name }}
                                            key={name}
                                        >
                                            {name}
                                        </option>
                                    ))}
                                </optgroup>
                            </Select>
                        </Label>
                    </div>
                    <div className={styles.gridItem}>
                        <Label label={'Schriftart Fließtext'}>
                            <Select
                                value={theme.textFontFamily}
                                style={{
                                    fontFamily: theme.textFontFamily,
                                }}
                                onChange={(e) =>
                                    setCustomTheme({
                                        textFontFamily: e.currentTarget.value,
                                    })
                                }
                            >
                                {textFonts.map(({ name }) => (
                                    <option
                                        style={{ fontFamily: name }}
                                        value={name}
                                        key={name}
                                    >
                                        {name}
                                    </option>
                                ))}
                            </Select>
                        </Label>
                    </div>
                </div>
            </section>

            <section>
                <div
                    className={clsx(
                        styles.gridContainer,
                        styles.saveButtonContainer
                    )}
                >
                    <Button
                        fullWidth
                        disabled={isLoading}
                        onClick={() =>
                            updateSystem({
                                variables: {
                                    tenant: {
                                        configuration: {
                                            ...tenant.configuration,
                                            customTheme: theme,
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
                </div>
            </section>
        </div>
    );
});
Presentation.displayName = 'AdminSystemPresentation';
