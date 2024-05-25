'use client';

import * as React from 'react';
import {
  Box,
  DefaultThemes,
  ErrorMessage,
  Input,
  Label,
  LoadingButton,
  Option,
  Select,
  useTheme,
} from '@lotta-schule/hubert';
import { useMutation } from '@apollo/client';
import { File } from 'util/model';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import { ColorSettingRow, SelectTemplateButton } from './component';
import { TenantModel } from 'model';
import { headerFonts, textFonts } from './fonts';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

import styles from './Presentation.module.scss';

import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';

const defaultTheme = DefaultThemes.standard;

export type PresentationProps = {
  tenant: TenantModel;
  baseUrl: string;
};

export const Presentation = React.memo(
  ({ tenant, baseUrl }: PresentationProps) => {
    const router = useRouter();
    const theme = {
      ...defaultTheme,
      ...tenant.configuration.customTheme,
    };

    const [allThemes, setAllThemes] = React.useState<
      { title: string; theme: Partial<ReturnType<typeof useTheme>> }[]
    >([{ title: 'Standard', theme: {} }]);

    const [customTheme, setCustomTheme] =
      React.useState<Partial<ReturnType<typeof useTheme>>>(theme);

    const [backgroundImage, setBackgroundImage] = React.useState(
      tenant.configuration.backgroundImageFile
    );

    const [updateSystem, { loading: isLoading, error }] =
      useMutation(UpdateTenantMutation);

    React.useEffect(() => {
      Promise.all(
        ['Purple Pastel', 'Neutral', 'Retro Contrast'].map(async (title) => {
          const pureName = title.toLowerCase().replace(/\s/g, '_');
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
    }, []);

    return (
      <div className={styles.root}>
        <ErrorMessage error={error} />
        <section>
          <h3>Vorlagen</h3>
          <div className={clsx(styles.grid, styles.scrollHorizontally)}>
            {allThemes.map(({ title, theme: partialTheme }) => {
              return (
                <div key={title}>
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

        <section>
          <h3>Farben</h3>
          <ErrorMessage error={error} />
          <div className={styles.grid}>
            <div>
              <ColorSettingRow
                label={'Akzente'}
                hint={'Akzentfarbe für wichtige und interaktive Elemente'}
                value={theme.primaryColor}
                onChange={(primaryColor) => setCustomTheme({ primaryColor })}
              />
              <ColorSettingRow
                label={'Hintergrund der Navigationsleiste'}
                hint={'Farbe für den Hintergrund der Navigationsleiste'}
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
                label={'Text Hauptnavigation'}
                hint={'Textfarbe für die Buttons in der Hauptnavigationsleiste'}
                value={theme.navigationContrastTextColor}
                onChange={(navigationContrastTextColor) =>
                  setCustomTheme({
                    navigationContrastTextColor,
                  })
                }
              />
              <ColorSettingRow
                label={'Deaktiviert'}
                hint={'Farbe für deaktivierte Elemente'}
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
            <div>
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
                label={'Text-Invert (Primär)'}
                hint={
                  'Alternative Textfarbe für mit der Primärfarbe gefüllte Elemente'
                }
                value={theme.primaryContrastTextColor}
                onChange={(primaryContrastTextColor) =>
                  setCustomTheme({
                    primaryContrastTextColor,
                  })
                }
              />
              <ColorSettingRow
                label={'Hintergrund'}
                hint={'Farbe für den Hintergrund des Inhaltsbereichs'}
                value={theme.boxBackgroundColor}
                onChange={(boxBackgroundColor) =>
                  setCustomTheme({
                    boxBackgroundColor,
                  })
                }
              />
              <ColorSettingRow
                label={'Seitenhintergrund'}
                hint={'Farbe für den Hintergrund des gesamten Seiteninhalts'}
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
                hint={'Farbe für den Hintergrund des Banners'}
                value={theme.bannerBackgroundColor}
                onChange={(bannerBackgroundColor) =>
                  setCustomTheme({
                    bannerBackgroundColor,
                  })
                }
              />
            </div>
          </div>

          <section>
            <h3>Maße</h3>

            <div>
              <Label label={'Abstand'}>
                <Input
                  value={theme.spacing}
                  disabled={isLoading}
                  onChange={(e) =>
                    setCustomTheme({
                      spacing: e.currentTarget.value,
                    })
                  }
                />
              </Label>
            </div>
            <div>
              <Label label={'Rundungen'}>
                <Input
                  disabled={isLoading}
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

          <div className={styles.grid}>
            <div>
              <Box>
                <SelectFileOverlay
                  label={'Hintergrundbild ändern'}
                  onSelectFile={(backgroundImage) =>
                    setBackgroundImage(backgroundImage)
                  }
                  allowDeletion
                >
                  {backgroundImage ? (
                    <ResponsiveImage
                      resize={'cover'}
                      width={400}
                      aspectRatio={'4:3'}
                      style={{ width: '100%' }}
                      src={File.getFileRemoteLocation(baseUrl, backgroundImage)}
                      alt={'Hintergrundbild der Seite'}
                    />
                  ) : (
                    <PlaceholderImage width={'100%'} height={200} />
                  )}
                </SelectFileOverlay>
              </Box>
            </div>
            <div>
              <p>
                Für eine optimale Darstellung sollte das Hintergrundbild{' '}
                <i>mindestens</i> eine Auflösung von 1280x800 Pixeln haben.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3>Schriften</h3>
          {headerFonts.concat(textFonts).map(({ url }) => (
            <link rel={'stylesheet'} href={url} key={url} />
          ))}
          <div className={styles.grid}>
            <div>
              <Select
                fullWidth
                title={'Schriftart Überschriften'}
                value={theme.titleFontFamily}
                onChange={(titleFontFamily) => {
                  setCustomTheme({
                    titleFontFamily,
                  });
                }}
              >
                {headerFonts.concat(textFonts).map(({ name }) => (
                  <Option
                    value={name}
                    aria-label={name}
                    key={name}
                    style={{
                      fontFamily: name,
                    }}
                  >
                    {name}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <Select
                fullWidth
                title={'Schriftart Fließtext'}
                value={theme.textFontFamily}
                onChange={(textFontFamily) =>
                  setCustomTheme({
                    textFontFamily,
                  })
                }
              >
                {textFonts.map(({ name }) => (
                  <Option
                    value={name}
                    aria-label={name}
                    key={name}
                    style={{
                      fontFamily: name,
                    }}
                  >
                    {name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </section>

        <section>
          <div>
            <LoadingButton
              onAction={async () => {
                await updateSystem({
                  variables: {
                    tenant: {
                      configuration: {
                        ...tenant.configuration,
                        customTheme,
                        backgroundImageFile: backgroundImage && {
                          id: backgroundImage.id,
                        },
                      },
                    },
                  },
                });
              }}
              onComplete={() => {
                router.refresh();
              }}
            >
              speichern
            </LoadingButton>
          </div>
        </section>
      </div>
    );
  }
);
Presentation.displayName = 'AdminSystemPresentation';
