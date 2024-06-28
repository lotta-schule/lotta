'use client';

import * as React from 'react';
import { DefaultThemes, Theme } from '@lotta-schule/theme';

export const ThemeContext = React.createContext({
  theme: DefaultThemes.standard,
});

export interface ThemeProviderProps {
  theme: Theme;
  children?: React.ReactNode;
}

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => (
  <ThemeContext.Provider value={props}>{children}</ThemeContext.Provider>
);

export const useTheme = () => React.useContext(ThemeContext).theme;
