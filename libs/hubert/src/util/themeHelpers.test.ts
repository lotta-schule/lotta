import { DefaultThemes } from '@lotta-schule/theme';
import { extractFontNamesFromTheme } from './themeHelpers';

describe('themeHelpers', () => {
  describe('extractFontNamesFromTheme', () => {
    it('should extract all font names from a given theme', () => {
      const theme = {
        ...DefaultThemes['standard'],
        textFontFamily: 'Muli',
        titleFontFamily: "'Schoolbell', cursive",
        // kill me
        newHeadingsFontFamily: "'Comic Sans MS', 'Arial', sans-serif",
      };

      expect(extractFontNamesFromTheme(theme)).toEqual([
        'Muli',
        'Schoolbell',
        'cursive',
        'Comic Sans MS',
        'Arial',
        'sans-serif',
      ]);
    });
  });
});
