import { toCSSVariableName, toCSSVariableValue } from './cssHelpers';

describe('cssHelpers', () => {
  describe('toCSSVariableName', () => {
    it('should return "--lotta-background-color" for "backgroundColor"', () => {
      const originalValue = 'backgroundColor';
      const cssVarName = '--lotta-background-color';

      expect(toCSSVariableName(originalValue)).toEqual(cssVarName);
    });

    it('should return "--lotta-border-radius" for "borderRadius"', () => {
      const originalValue = 'borderRadius';
      const cssVarName = '--lotta-border-radius';

      expect(toCSSVariableName(originalValue)).toEqual(cssVarName);
    });

    it('should return "--lotta-spacing" for "spacing"', () => {
      const originalValue = 'spacing';
      const cssVarName = '--lotta-spacing';

      expect(toCSSVariableName(originalValue)).toEqual(cssVarName);
    });
  });

  describe('toCSSVariableValue', () => {
    it('should transform "#90513c" to "44, 81, 60"', () => {
      const originalValue = '#90513c';
      const cssValue = '144, 81, 60';

      expect(toCSSVariableValue(originalValue)).toEqual(cssValue);
    });

    it('should transform "rgb(44, 81, 60)" to "44, 81, 60"', () => {
      const originalValue = 'rgb(44, 81, 60)';
      const cssValue = '44, 81, 60';

      expect(toCSSVariableValue(originalValue)).toEqual(cssValue);
    });

    it('should transform "\'Muli\'" to "\'Muli\'"', () => {
      const originalValue = "'Muli'";
      const cssValue = "'Muli'";

      expect(toCSSVariableValue(originalValue)).toEqual(cssValue);
    });

    it('should transform the number 4 to the string 4 if no type information is given', () => {
      const originalValue = 4;
      const cssValue = '4';

      expect(toCSSVariableValue(originalValue)).toEqual(cssValue);
    });

    it('should transform the number 4 to the string "4px" if given a type hint for "length"', () => {
      const originalValue = 4;
      const cssValue = '4px';

      expect(toCSSVariableValue(originalValue, 'length')).toEqual(cssValue);
    });
  });
});
