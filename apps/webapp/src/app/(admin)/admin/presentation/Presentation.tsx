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
import { AdminPageSection } from '../_component/AdminPageSection';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import { ColorSettingRow, SelectTemplateButton } from './_component';
import { TenantModel } from 'model';
import { headerFonts, textFonts } from 'styles/fonts';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

import styles from './Presentation.module.scss';

import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';

const defaultTheme = DefaultThemes.standard;

export type PresentationProps = {
  tenant: TenantModel;
  additionalThemes: {
    title: string;
    theme: Partial<ReturnType<typeof useTheme>>;
  }[];
};

export const Presentation = React.memo(
  ({ tenant, additionalThemes }: PresentationProps) => {
    const router = useRouter();
    const theme = {
      ...defaultTheme,
      ...tenant.configuration.customTheme,
    };

    const allThemes = React.useMemo(
      () => [
        { title: 'Bildungseinrichtung', theme: defaultTheme },
        ...additionalThemes,
      ],
      [additionalThemes]
    );

    const [customTheme, setCustomTheme] = React.useState<
      ReturnType<typeof useTheme>
    >({ ...theme });

    const updateThemeProperties = React.useCallback(
      (properties: Partial<ReturnType<typeof useTheme>>) => {
        setCustomTheme((prev) => {
          const theme = {
            ...prev,
            ...properties,
          };
          return theme;
        });
      },
      []
    );

    const [backgroundImage, setBackgroundImage] = React.useState(
      tenant.backgroundImageFile
    );

    const [updateSystem, { loading: isLoading, error }] =
      useMutation(UpdateTenantMutation);

    return (
      <div className={styles.root}>
        <ErrorMessage error={error} />

        <AdminPageSection title={'Vorlagen'}>
          <div className={clsx(styles.grid, styles.scrollHorizontally)}>
            {allThemes.map(({ title, theme: partialTheme }) => (
              <div key={title}>
                <SelectTemplateButton
                  title={title}
                  theme={partialTheme}
                  onClick={() => updateThemeProperties(partialTheme)}
                />
              </div>
            ))}
          </div>
        </AdminPageSection>

        <AdminPageSection title={'Farben'}>
          <div className={styles.grid}>
            <div>
              <ColorSettingRow
                label={'Akzente'}
                hint={'Akzentfarbe für wichtige und interaktive Elemente'}
                value={customTheme.primaryColor}
                onChange={(primaryColor) => {
                  updateThemeProperties({ primaryColor });
                }}
              />
              <ColorSettingRow
                label={'Hintergrund der Navigationsleiste'}
                hint={'Farbe für den Hintergrund der Navigationsleiste'}
                value={customTheme.navigationBackgroundColor}
                onChange={(navigationBackgroundColor) =>
                  updateThemeProperties({
                    navigationBackgroundColor,
                  })
                }
              />
              <ColorSettingRow
                label={'Fehler'}
                hint={'Farbe für Fehlermeldungen'}
                value={customTheme.errorColor}
                onChange={(errorColor) =>
                  updateThemeProperties({
                    errorColor,
                  })
                }
              />
              <ColorSettingRow
                label={'Erfolg'}
                hint={'Farbe für Erfolgsmeldungen'}
                value={customTheme.successColor}
                onChange={(successColor) =>
                  updateThemeProperties({
                    successColor,
                  })
                }
              />
              <ColorSettingRow
                label={'Text Hauptnavigation'}
                hint={'Textfarbe für die Buttons in der Hauptnavigationsleiste'}
                value={customTheme.navigationContrastTextColor}
                onChange={(navigationContrastTextColor) =>
                  updateThemeProperties({
                    navigationContrastTextColor,
                  })
                }
              />
              <ColorSettingRow
                label={'Deaktiviert'}
                hint={'Farbe für deaktivierte Elemente'}
                value={customTheme.disabledColor}
                onChange={(disabledColor) =>
                  updateThemeProperties({
                    disabledColor,
                  })
                }
              />
              <ColorSettingRow
                label={'Text'}
                hint={'Farbe für Text'}
                value={customTheme.textColor}
                onChange={(textColor) =>
                  updateThemeProperties({
                    textColor,
                  })
                }
              />
              <ColorSettingRow
                label={'Text-Invert (Primär)'}
                hint={
                  'Alternative Textfarbe für mit der Primärfarbe gefüllte Elemente'
                }
                value={customTheme.primaryContrastTextColor}
                onChange={(primaryContrastTextColor) =>
                  updateThemeProperties({
                    primaryContrastTextColor,
                  })
                }
              />
            </div>
            <div>
              <ColorSettingRow
                label={'Beschriftungen'}
                hint={'Farbe für Text in Beschriftungen'}
                value={customTheme.labelTextColor}
                onChange={(labelTextColor) =>
                  updateThemeProperties({
                    labelTextColor,
                  })
                }
              />
              <ColorSettingRow
                label={'Hintergrund'}
                hint={'Farbe für den Hintergrund des Inhaltsbereichs'}
                value={customTheme.boxBackgroundColor}
                onChange={(boxBackgroundColor) =>
                  updateThemeProperties({
                    boxBackgroundColor,
                  })
                }
              />
              <ColorSettingRow
                label={'Seitenhintergrund'}
                hint={'Farbe für den Hintergrund des gesamten Seiteninhalts'}
                value={customTheme.pageBackgroundColor}
                onChange={(pageBackgroundColor) =>
                  updateThemeProperties({
                    pageBackgroundColor,
                  })
                }
              />
              <ColorSettingRow
                label={'Trennlinien'}
                hint={'Farbe für Trennlinien'}
                value={customTheme.dividerColor}
                onChange={(dividerColor) =>
                  updateThemeProperties({
                    dividerColor,
                  })
                }
              />
              <ColorSettingRow
                label={'Hervorhebung'}
                hint={'Farbe für Hervorhebungen'}
                value={customTheme.highlightColor}
                onChange={(highlightColor) =>
                  updateThemeProperties({
                    highlightColor,
                  })
                }
              />
              <ColorSettingRow
                label={'Bannerhintergrund'}
                hint={'Farbe für den Hintergrund des Banners'}
                value={customTheme.bannerBackgroundColor}
                onChange={(bannerBackgroundColor) =>
                  updateThemeProperties({
                    bannerBackgroundColor,
                  })
                }
              />
              <ColorSettingRow
                label={'Badge - Hintergrundfarbe'}
                hint={'Hintergrundfarbe für Kennzeichnungen (Badges)'}
                value={customTheme.badgeBackgroundColor}
                onChange={(badgeBackgroundColor) =>
                  updateThemeProperties({
                    badgeBackgroundColor,
                  })
                }
              />
              <ColorSettingRow
                label={'Badge - Textfarbe'}
                hint={'Textfarbe für Kennzeichnungen (Badges)'}
                value={customTheme.badgeTextColor}
                onChange={(badgeTextColor) =>
                  updateThemeProperties({
                    badgeTextColor,
                  })
                }
              />
            </div>
          </div>
        </AdminPageSection>

        <AdminPageSection title={'Maße'}>
          <div className={styles.grid}>
            <Label label={'Abstand'}>
              <Input
                value={customTheme.spacing}
                disabled={isLoading}
                onChange={(e) =>
                  updateThemeProperties({
                    spacing: e.currentTarget.value,
                  })
                }
              />
            </Label>
            <Label label={'Rundungen'}>
              <Input
                disabled={isLoading}
                value={customTheme.borderRadius}
                onChange={(e) =>
                  updateThemeProperties({
                    borderRadius: e.currentTarget.value,
                  })
                }
              />
            </Label>
          </div>
        </AdminPageSection>

        <AdminPageSection title={'Hintergrund'}>
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
                      lazy
                      format={'pagebg'}
                      style={{ width: '100%' }}
                      file={backgroundImage}
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
        </AdminPageSection>

        <AdminPageSection title="Schriftarten">
          {headerFonts.concat(textFonts).map(({ url }) => (
            <link rel={'stylesheet'} href={url} key={url} />
          ))}
          <div className={styles.grid}>
            <div>
              <Select
                fullWidth
                title={'Überschriften'}
                value={customTheme.titleFontFamily}
                onChange={(titleFontFamily) => {
                  updateThemeProperties({
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
                title={'Fließtext'}
                value={customTheme.textFontFamily}
                onChange={(textFontFamily) =>
                  updateThemeProperties({
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
        </AdminPageSection>

        <AdminPageSection bottomToolbar>
          <div />
          <LoadingButton
            onAction={async () => {
              await updateSystem({
                variables: {
                  tenant: {
                    backgroundImageFileId: backgroundImage?.id,
                    configuration: {
                      ...tenant.configuration,
                      customTheme,
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
        </AdminPageSection>
      </div>
    );
  }
);
Presentation.displayName = 'AdminSystemPresentation';
