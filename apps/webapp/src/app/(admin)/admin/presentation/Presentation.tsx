'use client';

import * as React from 'react';
import {
  Badge,
  Button,
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
import {
  ColorSettingRow,
  PagePreview,
  PagePreviewMobile,
  SelectTemplateButton,
} from './_component';
import { TenantModel } from 'model';
import { headerFonts, textFonts } from 'styles/fonts';
import { useRouter } from 'next/navigation';
import { Icon } from 'shared/Icon';
import { faCheck, faClose, faTrash } from '@fortawesome/free-solid-svg-icons';
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
        <AdminPageSection title="Schriftarten">
          <div className={styles.stylingSection}>
            <div className={styles.editStyleSection}>
              {headerFonts.concat(textFonts).map(({ url }) => (
                <link rel={'stylesheet'} href={url} key={url} />
              ))}
              <div className={styles.fontSelect}>
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
            </div>
            <div
              className={clsx(styles.previewHorizontally, styles.textPreview)}
            >
              <h2>Überschrift</h2>
              <p>
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                diam nonumy eirmod tempor invidunt ut labore et dolore magna
                aliquyam erat, sed diam voluptua. At vero eos et accusam et
                justo duo dolores et ea rebum. Stet clita kasd gubergren.
              </p>
            </div>
          </div>
        </AdminPageSection>

        <AdminPageSection title={'Website'}>
          <div className={styles.stylingSection}>
            <div className={styles.editStyleSection}>
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
              <AdminPageSection title={'Hintergrundbild'}>
                <div className={styles.imageSettings}>
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
                      <PlaceholderImage width={'50%'} height={100} />
                    )}
                  </SelectFileOverlay>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step={0.01}
                    defaultValue=".5"
                  ></input>
                </div>
              </AdminPageSection>
            </div>
            <div className={styles.previewHorizontally}>
              <PagePreview
                theme={customTheme}
                backgroundImageSrc={backgroundImage?.formats[0]?.url}
                style={{ width: '69%', marginRight: '2%' }}
              />
              <PagePreviewMobile theme={customTheme} style={{ width: '29%' }} />
            </div>
          </div>
        </AdminPageSection>
        <AdminPageSection title={'Buttons'}>
          <div className={styles.stylingSection}>
            <div className={styles.editStyleSection}>
              <ColorSettingRow
                label={'Button & Akzente'}
                hint={'Akzentfarbe für wichtige und interaktive Elemente'}
                value={customTheme.primaryColor}
                onChange={(primaryColor) => {
                  updateThemeProperties({ primaryColor });
                }}
              />
              <ColorSettingRow
                label={'Button Textfarbe'}
                hint={'Textfarbe für gefüllte Buttons'}
                value={customTheme.primaryContrastTextColor}
                onChange={(primaryContrastTextColor) =>
                  updateThemeProperties({
                    primaryContrastTextColor,
                  })
                }
              />
              <Label label={'Rundungen für Buttons'}>
                <Input
                  className={styles.stylingInput}
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
            <div className={styles.previewVertically}>
              <ul>
                <li>
                  <Button>Button</Button>
                </li>
                <li>
                  <Button variant={'fill'}>Button</Button>
                </li>
                <li>
                  <Button
                    icon={<Icon icon={faTrash} />}
                    className={styles.deleteButton}
                  />
                </li>
              </ul>
            </div>
          </div>
        </AdminPageSection>
        <AdminPageSection title={'Besondere Buttons'}>
          <div className={styles.stylingSection}>
            <div className={styles.editStyleSection}>
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
            <div className={styles.previewVertically}>
              <ul>
                <li>
                  <Button variant={'error'} icon={<Icon icon={faClose} />}>
                    Fehler
                  </Button>
                </li>
                <li>
                  <Button
                    className={styles.successColor}
                    icon={<Icon icon={faCheck} />}
                  >
                    Erfolg
                  </Button>
                </li>

                <li>
                  <Button variant={'fill'} disabled={'true'}>
                    Deaktiviert
                  </Button>
                </li>
                <li>
                  <Button>
                    Button mit Badge
                    <Badge
                      className={styles.newMessageBadge}
                      value={'3'}
                    />{' '}
                  </Button>
                </li>
              </ul>
            </div>
          </div>
        </AdminPageSection>
        <AdminPageSection title={'Abstände'}>
          <div className={styles.stylingSection}>
            <div className={styles.editStyleSection}>
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
            </div>
            <div className={styles.previewVertically}>
              <div className={styles.boxes}>
                <div className={styles.box}></div>
                <div className={styles.box}></div>
                <div className={styles.box}></div>
              </div>
              <div className={styles.boxes}>
                <div className={styles.box}></div>
                <div className={styles.box}></div>
                <div className={styles.box}></div>
              </div>
            </div>
          </div>
        </AdminPageSection>

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
