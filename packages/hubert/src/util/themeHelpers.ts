import { schema, Theme } from '@lotta-schule/theme';

export const extractFontNamesFromTheme = (theme: Theme) => {
  return Object.entries(theme)
    .filter(
      ([key]) =>
        /fontfamily$/i.test(key) ||
        schema[key as keyof Theme]?.type === 'font-family'
    )
    .flatMap(([, val]) =>
      val.split(',').map((v) => v.replace(/^[\s']*/, '').replace(/[\s']*$/, ''))
    );
};
