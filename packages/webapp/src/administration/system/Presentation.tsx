import * as React from 'react';
import {
  Box,
  Button,
  ErrorMessage,
  Input,
  Label,
  Option,
  Select,
  useTheme,
} from '@lotta-schule/hubert';
import { DefaultThemes } from '@lotta-schule/theme';
import { useApolloClient, useMutation } from '@apollo/client';
import { File } from 'util/model';
import { useTenant } from 'util/tenant/useTenant';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import { useServerData } from 'shared/ServerDataContext';
import { SelectTemplateButton } from './presentation/SelectTemplateButton';
import { ColorSettingRow } from './presentation/ColorSettingRow';
import { headerFonts, textFonts } from './presentation/fonts';
import clsx from 'clsx';

import styles from '../shared.module.scss';

import GetTenantQuery from 'api/query/GetTenantQuery.graphql';
import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';

const defaultTheme = DefaultThemes.standard;

export const Presentation = React.memo(() => {
  const { baseUrl } = useServerData();
  const tenant = useTenant();
  const client = useApolloClient();
  const theme = {
    ...defaultTheme,
    ...tenant.configuration.customTheme,
  };

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
              customTheme: Object.assign(
                {},
                tenant.configuration.customTheme,
                customTheme
              ),
            },
          },
        },
      }),
    [client, tenant]
  );

  const [backgroundImage, setBackgroundImage] = React.useState(
    tenant.configuration.backgroundImageFile
  );

  const [updateSystem, { loading: isLoading, error }] =
    useMutation(UpdateTenantMutation);

  React.useEffect(() => {
    Promise.all(
      ['Purple Pastel', 'Neutral', 'Retro Contrast'].map(async (title) => {
        const pureName = title.toLowerCase().replace(/\s/g, '_');
        const partialTheme = await fetch(`/theme/${pureName}/theme.json`).then(
          (res) => res.json()
        );
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
    <div>
      <ErrorMessage error={error} />
      <section className={styles.section}>
        <h3>Vorlagen</h3>
        <div className={clsx(styles.gridContainer, styles.scrollHorizontally)}>
          {allThemes.map(({ title, theme: partialTheme }) => {
            return (
              <div className={styles.gridItem} key={title}>
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
          <div className={styles.gridItem}>
            <p>
              Für eine optimale Darstellung sollte das Hintergrundbild{' '}
              <i>mindestens</i> eine Auflösung von 1280x800 Pixeln haben.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3>Schriften</h3>
        {headerFonts.concat(textFonts).map(({ url }) => (
          <link rel={'stylesheet'} href={url} key={url} />
        ))}
        <div className={styles.gridContainer}>
          <div className={styles.gridItem}>
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
          <div className={styles.gridItem}>
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
        <div className={clsx(styles.gridContainer, styles.saveButtonContainer)}>
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
        </div>
      </section>
    </div>
  );
});
Presentation.displayName = 'AdminSystemPresentation';
