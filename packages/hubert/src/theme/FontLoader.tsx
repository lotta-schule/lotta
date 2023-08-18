import * as React from 'react';
import { Theme } from '@lotta-schule/theme';
import { extractFontNamesFromTheme } from '../util';

export type ExternalFont = {
  /**
   * The name under which the font is registered in the theme, e.g. 'Roboto'
   **/
  name: string;

  /**
   * The URL to the font's CSS file, e.g. 'https://fonts.googleapis.com/css2?family=Roboto&display=fallback',
   * or could be a local file, e.g. '/fonts/Roboto.css' (served under the same domain as the app)
   **/
  url: string;
};

export type FontLoaderProps = {
  theme: Theme;
  supportedFonts?: ExternalFont[];
};

export const FontLoader = React.memo(
  ({ theme, supportedFonts }: FontLoaderProps) => {
    const desiredFonts = extractFontNamesFromTheme(theme);

    return (
      <>
        {supportedFonts
          ?.filter(({ name }) => desiredFonts.indexOf(name) > -1)
          .map(({ name, url }) => (
            <link
              key={name}
              rel="stylesheet"
              href={url}
              data-font-name={name}
            />
          ))}
      </>
    );
  }
);
FontLoader.displayName = 'FontLoader';
