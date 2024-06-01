'use client';

import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { resources } from './resources';

i18next.use(initReactI18next).init({
  lng: 'de',
  fallbackLng: 'de',
  defaultNS: 'translation',
  resources,
});

export const TranslationsProvider = ({ children }: React.PropsWithChildren) => (
  <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
);
