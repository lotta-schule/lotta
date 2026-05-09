import { standardTheme } from './standard.js';

export const DefaultThemes = {
  standard: standardTheme,
};

export type ThemeName = keyof typeof DefaultThemes;
