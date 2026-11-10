import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  allFonts,
  getFontPreloadUrls,
  getPrimaryFontName,
  getThemeFontPreloadUrls,
  withFontFallbacks,
  withThemeFontFallbacks,
} from './fonts';
import { fontMetadata } from './fonts.generated';

const webappRoot = join(import.meta.dirname, '../..');

describe('fonts', () => {
  describe('generated metadata', () => {
    it.each(allFonts.map(({ name }) => name))(
      'should have metadata for %s',
      (name) => {
        expect(fontMetadata[name]).toBeDefined();
      }
    );

    it.each(allFonts.map(({ name }) => name))(
      'should preload an existing file for %s',
      (name) => {
        expect(
          existsSync(join(webappRoot, 'public', fontMetadata[name].preload))
        ).toBe(true);
      }
    );

    it.each(allFonts)(
      'should declare the font-family "$name" in $directory/style.css',
      ({ name, directory }) => {
        const css = readFileSync(
          join(webappRoot, 'src/styles/fonts', directory, 'style.css'),
          'utf8'
        );
        expect(css).toContain(`font-family: "${name}"`);
      }
    );

    it('should have a fallback font-face for every font', () => {
      const css = readFileSync(
        join(webappRoot, 'src/styles/fonts-fallback.css'),
        'utf8'
      );
      for (const { name } of allFonts) {
        expect(css).toContain(`font-family: "${name} Fallback"`);
      }
    });
  });

  describe('withFontFallbacks', () => {
    it('should add the local fallback and the generic family', () => {
      expect(withFontFallbacks('Muli')).toEqual(
        '"Muli", "Muli Fallback", sans-serif'
      );
    });

    it('should use serif as generic family for serif fonts', () => {
      expect(withFontFallbacks('Vollkorn')).toEqual(
        '"Vollkorn", "Vollkorn Fallback", serif'
      );
    });

    it('should keep an existing generic family', () => {
      expect(withFontFallbacks("'Schoolbell', cursive")).toEqual(
        '"Schoolbell", "Schoolbell Fallback", cursive'
      );
    });

    it('should keep unknown fonts', () => {
      expect(withFontFallbacks("'Comic Sans MS', Arial")).toEqual(
        '"Comic Sans MS", "Arial", sans-serif'
      );
    });

    it('should correct the misspelled "Balloo 2"', () => {
      expect(withFontFallbacks('Balloo 2')).toEqual(
        '"Baloo 2", "Baloo 2 Fallback", sans-serif'
      );
    });
  });

  describe('getPrimaryFontName', () => {
    it('should return the first font name, unquoted', () => {
      expect(getPrimaryFontName("'Schoolbell', cursive")).toEqual('Schoolbell');
    });
  });

  describe('getFontPreloadUrls', () => {
    it('should return the regular latin file of known fonts', () => {
      expect(getFontPreloadUrls("Muli, 'Unknown Font', sans-serif")).toEqual([
        '/fonts/muli/latin-normal.woff2',
      ]);
    });
  });

  describe('theme helpers', () => {
    const theme = {
      primaryColor: 'red',
      textFontFamily: 'Muli',
      titleFontFamily: "'Schoolbell', cursive",
    };

    it('should expand only the font-families of a theme', () => {
      expect(withThemeFontFallbacks(theme)).toEqual({
        primaryColor: 'red',
        textFontFamily: '"Muli", "Muli Fallback", sans-serif',
        titleFontFamily: '"Schoolbell", "Schoolbell Fallback", cursive',
      });
    });

    it('should return the preload urls of a theme without duplicates', () => {
      expect(
        getThemeFontPreloadUrls({ ...theme, titleFontFamily: 'Muli' })
      ).toEqual(['/fonts/muli/latin-normal.woff2']);
      expect(getThemeFontPreloadUrls(withThemeFontFallbacks(theme))).toEqual([
        '/fonts/muli/latin-normal.woff2',
        '/fonts/schoolbell/latin-normal.woff2',
      ]);
    });
  });
});
